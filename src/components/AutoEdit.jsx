
export default function AutoEdit({
  file,
  videoUrl,
  enabled,
  setEnabled,
  format,
  setFormat,
  processingError,
  onCreate,
  onChangeVideo,
}) {
  return (
    <section className="screen auto-screen">
      <div className="screen-top">
        <div>
          <div className="eyebrow">02 / AUTO EDIT</div>
          <h1>Make real<br /><span>video clips.</span></h1>
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
          {videoUrl ? (
            <video src={videoUrl} muted playsInline />
          ) : (
            <span>VIDEO</span>
          )}
        </div>

        <div className="source-info">
          <strong>{file?.name}</strong>
          <span>
            {file
              ? `${(file.size / (1024 * 1024)).toFixed(1)} MB · On-device processing`
              : "Choose a source video"}
          </span>
        </div>

        <span className="ready-dot">READY</span>
      </div>

      <div className="auto-layout">
        <div className="auto-copy">
          <div className="auto-badge">
            REAL MP4 EXPORT <span>PROTOTYPE</span>
          </div>

          <h2>One video.<br />Real clips.</h2>

          <p>
            Create actual MP4 clips from different points in your
            video. Choose a format, preview the results and download
            each clip. AI highlight detection and captions will come
            in a later phase.
          </p>

          <div className="feature-stack">
            <div><b>01</b><span>Cut real video segments</span><i>✓</i></div>
            <div><b>02</b><span>Choose output format</span><i>✓</i></div>
            <div><b>03</b><span>Preview and download MP4</span><i>✓</i></div>
            <div><b>04</b><span>AI highlight detection</span><i>→</i></div>
          </div>
        </div>

        <div className="control-card">
          <div className="control-label">OUTPUT FORMAT</div>

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

          <div className="switch-row">
            <div>
              <span className="switch-title">Multiple clips</span>
              <small>
                {enabled
                  ? "Create up to 3 separate clips"
                  : "Create one clip from the start"}
              </small>
            </div>

            <button
              type="button"
              className={enabled ? "switch on" : "switch"}
              onClick={() => setEnabled(!enabled)}
              aria-label="Toggle multiple clips"
              aria-pressed={enabled}
            >
              <i />
            </button>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={() => onCreate(format, enabled)}
          >
            Generate MP4 clips <span>→</span>
          </button>

          <small className="fine-print">
            Testing version · Best with short videos under 150 MB
          </small>

          {processingError && (
            <p className="processing-error" role="alert">
              {processingError}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
