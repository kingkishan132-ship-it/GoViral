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
  "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm";

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
        reject(new Error("Could not read the video duration."));
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read this video. Try another MP4."));
    };

    video.src = url;
  });
}

function createSegmentPlan(sourceDuration, settings) {
  const target = Number(settings.targetDuration);
  const intro = Number(settings.introDuration);
  const ending = Number(settings.endingDuration);

  if (!Number.isFinite(target) || target < 15 || target > 1800) {
    throw new Error("Choose a duration between 15 seconds and 30 minutes.");
  }

  if (
    !Number.isFinite(intro) ||
    !Number.isFinite(ending) ||
    intro < 0 ||
    ending < 0 ||
    intro + ending >= target
  ) {
    throw new Error("Intro and ending must leave time for main content.");
  }

  if (sourceDuration + 0.25 < target) {
    throw new Error(
      "Your source video is shorter than the requested output. Choose a shorter target duration."
    );
  }

  const mainDuration = target - intro - ending;
  const plan = [];

  if (intro > 0) {
    plan.push({
      label: "intro",
      start: 0,
      duration: intro,
    });
  }

  if (mainDuration > 0) {
    plan.push({
      label: "main",
      start: intro,
      duration: mainDuration,
    });
  }

  if (ending > 0) {
    plan.push({
      label: "ending",
      start: Math.max(0, sourceDuration - ending),
      duration: ending,
    });
  }

  return plan;
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

async function safeDelete(ffmpeg, name) {
  try {
    await ffmpeg.deleteFile(name);
  } catch {
    // The temporary file may not exist yet.
  }
}

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [stage, setStage] = useState("upload");
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");

  const [mode, setMode] = useState("short");
  const [outputFormat, setOutputFormat] = useState("9:16");
  const [targetDuration, setTargetDuration] = useState(30);
  const [introDuration, setIntroDuration] = useState(5);
  const [endingDuration, setEndingDuration] = useState(5);

  const [clips, setClips] = useState([]);
  const [progress, setProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState("");
  const [processingError, setProcessingError] = useState("");

  const inputRef = useRef(null);
  const ffmpegRef = useRef(null);
  const ffmpegReadyRef = useRef(false);
  const progressRef = useRef({ index: 0, total: 1 });
  const lastFfmpegLogRef = useRef("");

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) console.error("Session check failed:", error);
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
      alert("Choose a video under 150 MB for this browser prototype.");
      return;
    }

    setClips([]);
    setProcessingError("");
    setFile(nextFile);
    setVideoUrl(URL.createObjectURL(nextFile));

    setMode("short");
    setOutputFormat("9:16");
    setTargetDuration(30);
    setIntroDuration(5);
    setEndingDuration(5);

    setProgress(0);
    setStage("auto");
  }

  function handleFileChange(event) {
    const nextFile = event.target.files?.[0];
    if (nextFile) selectFile(nextFile);
    event.target.value = "";
  }

  async function createClips(
    format = outputFormat,
    settings = {
      mode,
      targetDuration,
      introDuration,
      endingDuration,
    }
  ) {
    if (!file) {
      inputRef.current?.click();
      return;
    }

    setProcessingError("");
    setProgress(1);
    setProcessingMessage("Reading source video...");
    setStage("processing");
    lastFfmpegLogRef.current = "";

    let generatedUrl = "";
    const temporaryFiles = [];
    let ffmpeg;

    try {
      const sourceDuration = await new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const video = document.createElement("video");
        video.preload = "metadata";

        video.onloadedmetadata = () => {
          const duration = video.duration;
          URL.revokeObjectURL(url);

          if (Number.isFinite(duration) && duration > 0) {
            resolve(duration);
          } else {
            reject(new Error("Could not read source video duration."));
          }
        };

        video.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error("Could not open this video."));
        };

        video.src = url;
      });

      const target = Number(settings.targetDuration);
      const plan = createSegmentPlan(sourceDuration, settings);

      ffmpeg = ffmpegRef.current;

      if (!ffmpeg) {
        ffmpeg = new FFmpeg();

        ffmpeg.on("log", ({ message }) => {
          lastFfmpegLogRef.current = message;
          console.debug("[GoViral FFmpeg]", message);
        });

        ffmpeg.on("progress", ({ progress: taskProgress }) => {
          const current = progressRef.current;
          const fraction = Number.isFinite(taskProgress)
            ? Math.max(0, Math.min(1, taskProgress))
            : 0;

          const overall =
            5 + ((current.index + fraction) / current.total) * 82;

          setProgress(Math.max(2, Math.min(88, Math.round(overall))));
        });

        ffmpegRef.current = ffmpeg;
      }

      if (!ffmpegReadyRef.current) {
        setProcessingMessage("Loading the video engine...");

        await ffmpeg.load({
          coreURL: await toBlobURL(
            FFMPEG_BASE + "/ffmpeg-core.js",
            "text/javascript"
          ),
          wasmURL: await toBlobURL(
            FFMPEG_BASE + "/ffmpeg-core.wasm",
            "application/wasm"
          ),
        });

        ffmpegReadyRef.current = true;
      }

      const inputName = "goviral-source.mp4";
      const concatName = "goviral-concat.txt";
      const outputName = "goviral-final.mp4";

      temporaryFiles.push(inputName, concatName, outputName);

      await safeDelete(ffmpeg, inputName);
      await safeDelete(ffmpeg, concatName);
      await safeDelete(ffmpeg, outputName);

      setProcessingMessage("Preparing source video...");
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      const filter = getCropFilter(format);
      const segmentNames = [];

      for (let index = 0; index < plan.length; index += 1) {
        const segment = plan[index];
        const segmentName = "goviral-segment-" + (index + 1) + ".mp4";

        temporaryFiles.push(segmentName);
        await safeDelete(ffmpeg, segmentName);

        progressRef.current = { index, total: plan.length };

        setProcessingMessage(
          "Creating " + segment.label + " segment (" +
          (index + 1) + "/" + plan.length + ")..."
        );

        const exitCode = await ffmpeg.exec([
          "-ss", String(segment.start),
          "-i", inputName,
          "-t", String(segment.duration),
          "-map", "0:v:0",
          "-map", "0:a?",
          "-vf", filter,
          "-c:v", "libx264",
          "-preset", "ultrafast",
          "-crf", "28",
          "-pix_fmt", "yuv420p",
          "-c:a", "aac",
          "-b:a", "128k",
          "-avoid_negative_ts", "make_zero",
          "-movflags", "+faststart",
          segmentName,
        ]);

        if (exitCode !== 0) {
          throw new Error(
            "FFmpeg could not encode the " + segment.label +
            " segment. Try another MP4 video."
          );
        }

        segmentNames.push(segmentName);
        setProgress(Math.round(((index + 1) / plan.length) * 85));
      }

      setProcessingMessage("Joining intro, main content and ending...");

      const concatText = segmentNames
        .map((name) => "file '" + name + "'")
        .join("\n");

      await ffmpeg.writeFile(
        concatName,
        new TextEncoder().encode(concatText)
      );

      const concatExitCode = await ffmpeg.exec([
        "-f", "concat",
        "-safe", "0",
        "-i", concatName,
        "-c", "copy",
        "-movflags", "+faststart",
        outputName,
      ]);

      if (concatExitCode !== 0) {
        throw new Error(
          "FFmpeg could not join the segments into one MP4 file."
        );
      }

      setProcessingMessage("Preparing final MP4...");
      setProgress(94);

      const outputData = await ffmpeg.readFile(outputName);
      const outputBlob = new Blob([outputData], {
        type: "video/mp4",
      });

      generatedUrl = URL.createObjectURL(outputBlob);

      setClips([
        {
          id: "goviral-final",
          start: 0,
          duration: target,
          title: settings.mode === "long"
            ? "GoViral Long-form Edit"
            : "GoViral Edited Video",
          fileName: "goviral-" + settings.mode + "-edit-" +
            target + "s.mp4",
          format,
          url: generatedUrl,
        },
      ]);

      generatedUrl = "";
      setOutputFormat(format);
      setProgress(100);
      setProcessingMessage("Your MP4 is ready.");
      setStage("results");

      for (const name of temporaryFiles) {
        await safeDelete(ffmpeg, name);
      }
    } catch (error) {
      console.error("Video processing failed:", error);

      if (generatedUrl) URL.revokeObjectURL(generatedUrl);

      const details =
        error?.message || String(error) || "Unknown processing error";

      const lastLog = lastFfmpegLogRef.current;
      const logDetails = lastLog
        ? " Last FFmpeg log: " + lastLog.slice(0, 180)
        : "";

      setProcessingError(
        "Video processing failed: " + details + logDetails
      );

      setStage("auto");
      setProgress(0);

      if (ffmpeg) {
        for (const name of temporaryFiles) {
          await safeDelete(ffmpeg, name);
        }
      }
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
        <button type="button" onClick={handleLogout}>
          Log out
        </button>
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
              mode={mode}
              setMode={setMode}
              format={outputFormat}
              setFormat={setOutputFormat}
              targetDuration={targetDuration}
              setTargetDuration={setTargetDuration}
              introDuration={introDuration}
              setIntroDuration={setIntroDuration}
              endingDuration={endingDuration}
              setEndingDuration={setEndingDuration}
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
