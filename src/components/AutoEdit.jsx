import { useState } from "react";

export default function AutoEdit({ file, videoUrl, enabled, setEnabled, onCreate, onChangeVideo }) {
  const [format, setFormat] = useState("9:16");

  return (
    <section className="screen auto-screen">
      <div className="screen-top">
        <div>
          <div className="eyebrow">02 / AUTO EDIT</div>
          <h1>Let GoViral<br /><span>find the story.</span></h1>
        </div>
        <button className="quiet-button" onClick={onChangeVideo}>Change video</button>
      </div>

      <div className="source-strip">
        <div className="source-thumb">
          {videoUrl ? <video src={videoUrl} muted /> : <span>VIDEO</span>}
        </div>
        <div className="source-info">
          <strong>{file?.name}</strong>
          <span>Ready for automatic editing</span>
        </div>
        <span className="ready-dot">READY</span>
      </div>

      <div className="auto-layout">
        <div className="auto-copy">
          <div className="auto-badge">AUTO EDIT <span>FREE</span></div>
          <h2>One click.<br />Multiple publish-ready clips.</h2>
          <p>
            GoViral looks at speech, pacing and visual changes to surface
            moments with strong short-form potential.
          </p>

          <div className="feature-stack">
            <div><b>01</b><span>Find strong moments</span><i>✓</i></div>
            <div><b>02</b><span>Reframe to 9:16</span><i>✓</i></div>
            <div><b>03</b><span>Add captions + hooks</span><i>✓</i></div>
            <div><b>04</b><span>Prepare clips to export</span><i>✓</i></div>
          </div>
        </div>

        <div className="control-card">
          <div className="control-label">OUTPUT FORMAT</div>
          <div className="format-row">
            {["9:16","1:1","16:9"].map(x => (
              <button className={format === x ? "format active" : "format"} onClick={() => setFormat(x)} key={x}>{x}</button>
            ))}
          </div>

          <div className="switch-row">
            <div><span className="switch-title">Auto Edit</span><small>Generate the clips automatically</small></div>
            <button className={enabled ? "switch on" : "switch"} onClick={() => setEnabled(!enabled)} aria-label="Toggle Auto Edit"><i /></button>
          </div>

          <button className="primary-button" onClick={onCreate}>
            Create clips <span>→</span>
          </button>
          <small className="fine-print">Free plan · 3 auto-edits / month · 720p</small>
        </div>
      </div>
    </section>
  );
}