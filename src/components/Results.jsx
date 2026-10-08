const demoClips = [
  { score: 94, title: "The part nobody tells you about.", time: "00:38", tone: "one" },
  { score: 88, title: "This changes how you see it.", time: "00:31", tone: "two" },
  { score: 81, title: "Most people get this completely wrong.", time: "00:27", tone: "three" },
];

export default function Results({ file, videoUrl, onStartOver }) {
  return (
    <section className="screen results-screen">
      <div className="results-top">
        <div>
          <div className="eyebrow">04 / YOUR CLIPS</div>
          <h1>Ready to <span>publish.</span></h1>
          <p>GoViral found 3 moments with strong short-form potential.</p>
        </div>
        <button className="quiet-button" onClick={onStartOver}>+ New video</button>
      </div>

      <div className="clip-grid">
        {demoClips.map((clip, index) => (
          <article className="clip-card" key={clip.title}>
            <div className={`clip-preview ${clip.tone}`}>
              {videoUrl ? <video src={videoUrl} muted playsInline /> : null}
              <div className="clip-overlay" />
              <span className="clip-rank">#{index + 1}</span>
              <span className="clip-score">{clip.score} <small>ENGAGEMENT</small></span>
              <button className="play-button" aria-label={`Preview clip ${index + 1}`}>▶</button>
              <span className="clip-duration">{clip.time}</span>
            </div>
            <div className="clip-content">
              <span className="clip-label">STRONG MOMENT</span>
              <h2>“{clip.title}”</h2>
              <div className="clip-actions">
                <button className="secondary-button">Edit</button>
                <button className="primary-small">Export <span>↗</span></button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="results-footer">
        <span><b>{file?.name}</b> · 3 clips generated</span>
        <span>Captions · 9:16 · 720p</span>
      </div>
    </section>
  );
}