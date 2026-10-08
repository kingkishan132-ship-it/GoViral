const steps = [
  ["01","Uploading source"],
  ["02","Transcribing speech"],
  ["03","Finding strong moments"],
  ["04","Reframing + captions"],
];

export default function Processing({ file, progress }) {
  const current = progress < 25 ? 0 : progress < 50 ? 1 : progress < 76 ? 2 : 3;

  return (
    <section className="screen processing-screen">
      <div className="eyebrow">03 / PROCESSING</div>
      <div className="processing-heading">
        <div>
          <h1>Finding your<br /><span>best moments.</span></h1>
          <p>{file?.name}</p>
        </div>
        <strong>{progress}%</strong>
      </div>

      <div className="processing-track"><i style={{ width: `${progress}%` }} /></div>

      <div className="processing-grid">
        {steps.map(([num, label], index) => (
          <div className={index < current ? "process-step done" : index === current ? "process-step current" : "process-step"} key={label}>
            <span>{index < current ? "✓" : num}</span>
            <div><b>{label}</b><small>{index < current ? "Complete" : index === current ? "Working now" : "Waiting"}</small></div>
          </div>
        ))}
      </div>

      <div className="processing-note">
        <span className="pulse" />
        <div><b>Good things take a moment.</b><small>Keep this tab open while GoViral prepares your clips.</small></div>
      </div>
    </section>
  );
}