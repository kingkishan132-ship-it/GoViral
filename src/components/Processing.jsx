const steps = [
  ["01", "Load video engine"],
  ["02", "Cut video segments"],
  ["03", "Crop to output format"],
  ["04", "Prepare MP4 files"],
];

export default function Processing({ file, progress = 0, message }) {
  const current =
    progress < 20 ? 0 :
    progress < 48 ? 1 :
    progress < 78 ? 2 : 3;

  return (
    <section className="screen processing-screen">
      <div className="eyebrow">03 / PROCESSING</div>

      <div className="processing-heading">
        <div>
          <h1>Creating your<br /><span>video clips.</span></h1>
          <p>{file?.name}</p>
        </div>
        <strong>{progress}%</strong>
      </div>

      <div
        className="processing-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <i style={{ width: `${progress}%` }} />
      </div>

      <div className="processing-grid">
        {steps.map(([number, label], index) => (
          <div
            key={label}
            className={
              index < current
                ? "process-step done"
                : index === current
                  ? "process-step current"
                  : "process-step"
            }
          >
            <span>{index < current ? "✓" : number}</span>
            <div>
              <b>{label}</b>
              <small>
                {index < current
                  ? "Complete"
                  : index === current
                    ? "Working now"
                    : "Waiting"}
              </small>
            </div>
          </div>
        ))}
      </div>

      <div className="processing-note">
        <span className="pulse" />
        <div>
          <b>{message || "Preparing your video..."}</b>
          <small>
            Processing runs in your browser. Keep this page open
            until the clips are ready.
          </small>
        </div>
      </div>
    </section>
  );
}
