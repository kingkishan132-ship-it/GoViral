
import { useEffect, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { supabase } from "./lib/supabase.js";
import AuthScreen from "./components/AuthScreen.jsx";
import Upload from "./components/Upload.jsx";
import AutoEdit from "./components/AutoEdit.jsx";
import Processing from "./components/Processing.jsx";
import Results from "./components/Results.jsx";
import Header from "./components/Header.jsx";

const STAGES = ["upload", "auto", "processing", "results"];
const FFMPEG_BASE =
  "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";

function getDuration(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      const duration = video.duration;
      URL.revokeObjectURL(url);

      if (Number.isFinite(duration) && duration > 0) {
        resolve(duration);
      } else {
        reject(new Error("Video duration could not be read."));
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not open this video. Try an MP4 file."));
    };

    video.src = url;
  });
}

function timeLabel(seconds) {
  const value = Math.max(0, Math.floor(seconds));
  const min = Math.floor(value / 60);
  const sec = value % 60;

  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function createClipPlan(duration, multiple) {
  if (duration < 3) {
    throw new Error("Choose a video that is at least 3 seconds long.");
  }

  const clipDuration = multiple
    ? Math.min(20, duration / 3)
    : Math.min(20, duration);

  const starts = multiple
    ? [
        0,
        (duration - clipDuration) / 2,
        duration - clipDuration,
      ]
    : [0];

  return [...new Set(starts.map((x) => Number(x.toFixed(2))))]
    .map((start, index) => ({
      id: `clip-${index + 1}`,
      start,
      duration: Math.min(clipDuration, duration - start),
      title: `Clip ${index + 1}`,
      fileName: `goviral-clip-${index + 1}.mp4`,
    }));
}

function getCropFilter(format) {
  if (format === "1:1") {
    return "scale=720:720:force_original_aspect_ratio=increase,crop=720:720";
  }

  if (format === "16:9") {
    return "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720";
  }

  return "scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280";
}

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [stage, setStage] = useState("upload");
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [autoEdit, setAutoEdit] = useState(true);
  const [outputFormat, setOutputFormat] = useState("9:16");
  const [clips, setClips] = useState([]);
  const [progress, setProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState("");
  const [processingError, setProcessingError] = useState("");

  const inputRef = useRef(null);
  const ffmpegRef = useRef(null);
  const ffmpegReadyRef = useRef(false);
  const progressRef = useRef({ index: 0, total: 1 });

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) console.error(error);
      setSession(data?.session ?? null);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  useEffect(() => {
    return () => {
      clips.forEach((clip) => URL.revokeObjectURL(clip.url));
    };
  }, [clips]);

  function selectFile(nextFile) {
    if (!nextFile) return;

    if (!nextFile.type.startsWith("video/")) {
      alert("Please select a valid video file.");
      return;
    }

    if (nextFile.size > 150 * 1024 * 1024) {
      alert("For this first prototype, choose a video under 150 MB.");
      return;
    }

    setClips([]);
    setProcessingError("");
    setFile(nextFile);
    setVideoUrl(URL.createObjectURL(nextFile));
    setProgress(0);
    setOutputFormat("9:16");
    setStage("auto");
  }

  function handleFileChange(event) {
    const nextFile = event.target.files?.[0];
    if (nextFile) selectFile(nextFile);
    event.target.value = "";
  }

  async function createClips(format = outputFormat, multiple = autoEdit) {
    if (!file) {
      inputRef.current?.click();
      return;
    }

    setProcessingError("");
    setProgress(1);
    setProcessingMessage("Reading video details...");
    setStage("processing");

    let ffmpeg;

    try {
      const duration = await getDuration(file);
      const plan = createClipPlan(duration, multiple);

      progressRef.current = { index: 0, total: plan.length };

      ffmpeg = ffmpegRef.current;

      if (!ffmpeg) {
        ffmpeg = new FFmpeg();

        ffmpeg.on("progress", ({ progress: taskProgress }) => {
          const current = progressRef.current;
          const fraction = Number.isFinite(taskProgress)
            ? Math.max(0, Math.min(1, taskProgress))
            : 0;

          const overall =
            ((current.index + fraction) / current.total) * 90;

          setProgress(Math.max(2, Math.min(95, Math.round(overall))));
        });

        ffmpegRef.current = ffmpeg;
      }

      if (!ffmpegReadyRef.current) {
        setProcessingMessage("Loading video engine. First run may take time...");

        await ffmpeg.load({
          coreURL: await toBlobURL(
            `${FFMPEG_BASE}/ffmpeg-core.js`,
            "text/javascript"
          ),
          wasmURL: await toBlobURL(
            `${FFMPEG_BASE}/ffmpeg-core.wasm`,
            "application/wasm"
          ),
        });

        ffmpegReadyRef.current = true;
      }

      setProcessingMessage("Preparing your source video...");

      const inputName = "goviral-source.mp4";

      try {
        await ffmpeg.deleteFile(inputName);
      } catch {
        // No previous source file exists.
      }

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      const generated = [];
      const filter = getCropFilter(format);

      for (let index = 0; index < plan.length; index += 1) {
        const item = plan[index];
        const outputName = `goviral-output-${index + 1}.mp4`;

        progressRef.current = { index, total: plan.length };
        setProcessingMessage(
          `Creating real MP4 clip ${index + 1} of ${plan.length}...`
        );

        try {
          await ffmpeg.deleteFile(outputName);
        } catch {
          // No previous output file exists.
        }

        await ffmpeg.exec([
          "-ss", String(item.start),
          "-i", inputName,
          "-t", String(item.duration),
          "-map", "0:v:0",
          "-map", "0:a?",
          "-vf", filter,
          "-c:v", "libx264",
          "-preset", "ultrafast",
          "-crf", "28",
          "-pix_fmt", "yuv420p",
          "-c:a", "aac",
          "-b:a", "128k",
          "-movflags", "+faststart",
          "-shortest",
          outputName,
        ]);

        const data = await ffmpeg.readFile(outputName);
        const blob = new Blob([data], { type: "video/mp4" });

        generated.push({
          ...item,
          url: URL.createObjectURL(blob),
          format,
        });

        await ffmpeg.deleteFile(outputName);
        setProgress(Math.round(((index + 1) / plan.length) * 95));
      }

      await ffmpeg.deleteFile(inputName);

      setClips(generated);
      setOutputFormat(format);
      setProgress(100);
      setProcessingMessage("Your clips are ready.");
      setStage("results");
    } catch (error) {
      console.error("Video processing failed:", error);

      setProcessingError(
        `Video processing failed: ${error?.message || "Unknown error"}. Try a shorter MP4 video or reload and try again.`
      );

      setStage("auto");
      setProgress(0);
    }
  }

  function startOver() {
    setClips([]);
    setFile(null);
    setVideoUrl("");
    setProgress(0);
    setProcessingError("");
    setProcessingMessage("");
    setStage("upload");
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Could not sign out. Please try again.");
    } else {
      startOver();
    }
  }

  if (authLoading) {
    return (
      <main className="auth-page">
        <div className="auth-card">Checking your session...</div>
      </main>
    );
  }

  if (!session) return <AuthScreen />;

  return (
    <div className="app-shell">
      <Header stage={stage} onStartOver={startOver} />

      <div className="account-bar">
        <span>
          {session.user.user_metadata?.display_name || session.user.email}
        </span>
        <button type="button" onClick={handleLogout}>Log out</button>
      </div>

      <main>
        <div className="stage-progress" aria-label="Workflow progress">
          {STAGES.map((item, index) => (
            <span
              key={item}
              className={
                STAGES.indexOf(stage) >= index
                  ? "stage-dot active"
                  : "stage-dot"
              }
            />
          ))}
        </div>

        <section className="page-wrap">
          {stage === "upload" && (
            <Upload
              onSelect={selectFile}
              inputRef={inputRef}
              onChooseFile={handleFileChange}
            />
          )}

          {stage === "auto" && (
            <AutoEdit
              file={file}
              videoUrl={videoUrl}
              enabled={autoEdit}
              setEnabled={setAutoEdit}
              format={outputFormat}
              setFormat={setOutputFormat}
              processingError={processingError}
              onCreate={createClips}
              onChangeVideo={() => inputRef.current?.click()}
            />
          )}

          {stage === "processing" && (
            <Processing
              file={file}
              progress={progress}
              message={processingMessage}
            />
          )}

          {stage === "results" && (
            <Results
              file={file}
              clips={clips}
              outputFormat={outputFormat}
              onStartOver={startOver}
            />
          )}
        </section>
      </main>

      <input
        ref={inputRef}
        hidden
        type="file"
        accept="video/*"
        onChange={handleFileChange}
      />
    </div>
  );
}
