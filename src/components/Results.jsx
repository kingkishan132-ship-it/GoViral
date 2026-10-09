
function formatTime(seconds) {
  const value = Math.max(0, Math.floor(seconds || 0));
  const minutes = Math.floor(value / 60);
  const remainder = value % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

export default function Results({
  file,
  clips = [],
  outputFormat,
  onStartOver,
}) {
  return (
    <section className="screen results-screen">
      <div className="results-top">
        <div>
          <div className="eyebrow">04 / YOUR CLIPS</div>
          <h1>Real clips.<br /><span>Ready to save.</span></h1>
          <p>
            {clips.length} real MP4{" "}
            {clips.length === 1 ? "clip was" : "clips were"} created
            from your uploaded video.
          </p>
        </div>

        <button
          type="button"
          className="quiet-button"
          onClick={onStartOver}
        >
          + New video
        </button>
      </div>

      {clips.length === 0 ? (
        <div className="control-card">
          <h2>No clips generated</h2>
          <p>Go back and try processing your video again.</p>
          <button
            type="button"
            className="primary-button"
            onClick={onStartOver}
          >
            Choose another video →
          </button>
        </div>
      ) : (
        <div className="clip-grid">
          {clips.map((clip, index) => (
            <article className="clip-card" key={clip.id}>
              <div className="clip-preview generated-clip">
                <video
                  src={clip.url}
                  controls
                  playsInline
                  preload="metadata"
                  aria-label={`Preview ${clip.title}`}
                />
                <span className="clip-rank">#{index + 1}</span>
                <span className="clip-duration">
                  {formatTime(clip.duration)}
                </span>
              </div>

              <div className="clip-content">
                <span className="clip-label">
                  MP4 · {clip.format || outputFormat}
                </span>

                <h2>{clip.title}</h2>

                <p className="clip-meta">
                  Starts at {formatTime(clip.start)} ·{" "}
                  {formatTime(clip.duration)} long
                </p>

                <div className="clip-actions">
                  <a
                    className="primary-small download-link"
                    href={clip.url}
                    download={clip.fileName || `goviral-clip-${index + 1}.mp4`}
                  >
                    Download MP4 <span>↓</span>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="results-footer">
        <span><b>{file?.name || "Your video"}</b> · {clips.length} clips</span>
        <span>{outputFormat} · MP4</span>
      </div>

      <p className="fine-print">
        These are basic video cuts, not AI-selected highlights yet.
      </p>
    </section>
  );
}
