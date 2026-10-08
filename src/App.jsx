import { useEffect, useRef, useState } from "react";
import Upload from "./components/Upload.jsx";
import AutoEdit from "./components/AutoEdit.jsx";
import Processing from "./components/Processing.jsx";
import Results from "./components/Results.jsx";
import Header from "./components/Header.jsx";

const STAGES = ["upload", "auto", "processing", "results"];

export default function App() {
  const [stage, setStage] = useState("upload");
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [autoEdit, setAutoEdit] = useState(true);
  const [progress, setProgress] = useState(0);

  const inputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  function selectFile(nextFile) {
    if (!nextFile) return;

    if (!nextFile.type.startsWith("video/")) {
      alert("Please select a video file.");
      return;
    }

    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }

    const url = URL.createObjectURL(nextFile);

    setFile(nextFile);
    setVideoUrl(url);
    setProgress(0);
    setStage("auto");
  }

  function handleFileChange(event) {
    const nextFile = event.target.files?.[0];

    if (nextFile) {
      selectFile(nextFile);
    }

    event.target.value = "";
  }

  function createClips() {
    if (!file) {
      inputRef.current?.click();
      return;
    }

    setStage("processing");
    setProgress(4);

    let value = 4;

    const timer = setInterval(() => {
      value += Math.floor(Math.random() * 8) + 5;

      if (value >= 100) {
        value = 100;
        clearInterval(timer);

        setTimeout(() => {
          setStage("results");
        }, 350);
      }

      setProgress(value);
    }, 220);
  }

  function startOver() {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }

    setFile(null);
    setVideoUrl("");
    setProgress(0);
    setStage("upload");
  }

  return (
    <div className="app-shell">

      <Header
        stage={stage}
        onStartOver={startOver}
      />

      <main>

        <div
          className="stage-progress"
          aria-label="GoViral workflow progress"
        >
          {STAGES.map((item, index) => {

            const currentIndex = STAGES.indexOf(stage);

            const active = currentIndex >= index;

            return (
              <span
                key={item}
                className={
                  active
                    ? "stage-dot active"
                    : "stage-dot"
                }
              />
            );
          })}
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
              onCreate={createClips}
              onChangeVideo={() => inputRef.current?.click()}
            />
          )}

          {stage === "processing" && (
            <Processing
              file={file}
              progress={progress}
            />
          )}

          {stage === "results" && (
            <Results
              file={file}
              videoUrl={videoUrl}
              onStartOver={startOver}
            />
          )}

        </section>

      </main>

      <input
        ref={inputRef}
        hidden
        type="file"
        accept="video/mp4,video/quicktime,video/webm,video/*"
        onChange={handleFileChange}
      />

    </div>
  );
}