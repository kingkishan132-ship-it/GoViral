import { useEffect, useState } from "react";
export default function AutoEdit({
  file,
  videoUrl,
  mode,
  setMode,
  format,
  setFormat,
  targetDuration,
  setTargetDuration,
  introDuration,
  setIntroDuration,
  endingDuration,
  setEndingDuration,
  processingError,
  onCreate,
  onChangeVideo,
}) {
  const [sourceDuration, setSourceDuration] = useState(0);

  useEffect(() => {
    if (!videoUrl) {
      setSourceDuration(0);
      return;
    }

    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        setSourceDuration(video.duration);
      }
    };

    video.src = videoUrl;

    return () => {
      video.onloadedmetadata = null;
      video.onerror = null;
      video.removeAttribute("src");
    };
  }, [videoUrl]);

  useEffect(() => {
    if (mode !== "short" || sourceDuration <= 0) return;

    const suggestedDuration = Math.min(30, Math.floor(sourceDuration));
    setTargetDuration(Math.max(15, suggestedDuration));
  }, [sourceDuration, mode, setTargetDuration]);
  function chooseMode(nextMode) {
    setMode(nextMode);

    if (nextMode === "short") {
      setTargetDuration(30);
      setIntroDuration(5);
      setEndingDuration(5);
      setFormat("9:16");
    }

    if (nextMode === "long") {
      setTargetDuration(300);
      setIntroDuration(10);
      setEndingDuration(10);
      setFormat("16:9");
    }

    if (nextMode === "custom") {
      setTargetDuration(60);
      setIntroDuration(5);
      setEndingDuration(5);
    }
  }

  const mainDuration =
    Number(targetDuration) -
    Number(introDuration) -
    Number(endingDuration);

  const validSettings =
    Number(targetDuration) >= 15 &&
    Number(targetDuration) <= 1800 &&
    Number(introDuration) >= 0 &&
    Number(endingDuration) >= 0 &&
    mainDuration > 0 &&
    Number(introDuration) + Number(endingDuration) <
      Number(targetDuration);

  function handleCreate() {
    if (!validSettings) return;

    onCreate(format, {
      mode,
      targetDuration: Number(targetDuration),
      introDuration: Number(introDuration),
      endingDuration: Number(endingDuration),
    });
  }

  return (
    <section className="screen auto-screen">
      <div className="screen-top">
        <div>
          <div className="eyebrow">02 / EDIT YOUR VIDEO</div>
          <h1>One video.<br /><span>Your style.</span></h1>
        </div>

        <button
          type="button"
          className="quiet-button"
          onClick={onChangeVideo}
        >
          Change video
        </button>
      </div>

      <div className="source-strip">
        <div className="source-thumb">
          {videoUrl && (
            <video src={videoUrl} muted playsInline />
          )}
        </div>

        <div className="source-info">
          <strong>{file?.name || "No video selected"}</strong>
          <span>
            {file
              ? `${(file.size / (1024 * 1024)).toFixed(1)} MB · Browser processing`
              : "Choose a source video"}
          </span>
        </div>

        <span className="ready-dot">READY</span>
      </div>

      <div className="auto-layout">
        <div className="auto-copy">
          <div className="auto-badge">
            EDITING MODE <span>MP4 EXPORT</span>
          </div>

          <h2>Choose how<br />you want to edit.</h2>

          <p>
            Select a ready-made short video, a longer edit,
            or set your own duration. GoViral will cut the
            source video into sections and combine them.
          </p>

          <div className="feature-stack">
            <div>
              <b>01</b>
              <span>Set your video duration</span>
              <i>✓</i>
            </div>
            <div>
              <b>02</b>
              <span>Configure intro and ending</span>
              <i>✓</i>
            </div>
            <div>
              <b>03</b>
              <span>Export one MP4 video</span>
              <i>✓</i>
            </div>
            <div>
              <b>04</b>
              <span>AI highlights and captions</span>
              <i>→</i>
            </div>
          </div>
        </div>

        <div className="control-card">
          <div className="control-label">1. CHOOSE MODE</div>

          <div className="mode-options">
            <button
              type="button"
              className={mode === "short" ? "mode-option active" : "mode-option"}
              onClick={() => chooseMode("short")}
              aria-pressed={mode === "short"}
            >
              <strong>Short video</strong>
              <span>30 seconds · 9:16</span>
            </button>

            <button
              type="button"
              className={mode === "long" ? "mode-option active" : "mode-option"}
              onClick={() => chooseMode("long")}
              aria-pressed={mode === "long"}
            >
              <strong>Long-form</strong>
              <span>5 minutes · 16:9</span>
            </button>

            <button
              type="button"
              className={mode === "custom" ? "mode-option active" : "mode-option"}
              onClick={() => chooseMode("custom")}
              aria-pressed={mode === "custom"}
            >
              <strong>Custom</strong>
              <span>Choose your own timing</span>
            </button>
          </div>

          <div className="control-label">2. OUTPUT FORMAT</div>

          <div className="format-row">
            {["9:16", "1:1", "16:9"].map((item) => (
              <button
                type="button"
                key={item}
                className={format === item ? "format active" : "format"}
                onClick={() => setFormat(item)}
                aria-pressed={format === item}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="control-label">3. TIMING · SECONDS</div>

          <div className="timing-fields">
            <label>
              Total duration
              <input
                type="number"
                min="15"
                max="1800"
                step="1"
                value={targetDuration}
                onChange={(event) =>
                  setTargetDuration(event.target.value)
                }
              />
            </label>

            <label>
              Intro
              <input
                type="number"
                min="0"
                max="300"
                step="1"
                value={introDuration}
                onChange={(event) =>
                  setIntroDuration(event.target.value)
                }
              />
            </label>

            <label>
              Ending
              <input
                type="number"
                min="0"
                max="300"
                step="1"
                value={endingDuration}
                onChange={(event) =>
                  setEndingDuration(event.target.value)
                }
              />
            </label>
          </div>

          <div className="duration-summary">
            <div>
              <span>INTRO</span>
              <strong>{Number(introDuration) || 0}s</strong>
            </div>
            <div>
              <span>MAIN CONTENT</span>
              <strong>{mainDuration > 0 ? mainDuration : 0}s</strong>
            </div>
            <div>
              <span>ENDING</span>
              <strong>{Number(endingDuration) || 0}s</strong>
            </div>
          </div>

          {mode === "short" && (
            <p className="fine-print">
              Short mode adapts to your source video. Adjust intro and ending to fit your edit.
            </p>
          )}

          {mode !== "short" && (
            <p className="fine-print">
              Total duration must be 15–1800 seconds. Intro and
              ending lengths are included in the total.
            </p>
          )}

          {!validSettings && (
            <p className="processing-error" role="alert">
              Check your timing. Intro and ending must leave
              some time for the main content.
            </p>
          )}

          {processingError && (
            <p className="processing-error" role="alert">
              {processingError}
            </p>
          )}

          <button
            type="button"
            className="primary-button"
            onClick={handleCreate}
            disabled={!file || !validSettings}
          >
            Create final MP4 <span>→</span>
          </button>

          <small className="fine-print">
            Prototype · Best with source videos under 150 MB
          </small>
        </div>
      </div>
    </section>
  );
}
