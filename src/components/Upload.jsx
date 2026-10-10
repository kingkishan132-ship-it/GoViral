
import { useRef, useState } from "react";

export default function Upload({ onSelect, onChooseFile }) {
  const [dragging, setDragging] = useState(false);
  const localRef = useRef(null);

  function drop(e) {
    e.preventDefault();
    setDragging(false);
    onSelect(e.dataTransfer.files?.[0]);
  }

  return (
    <section className="screen upload-screen">
      <div className="eyebrow">01 / START HERE</div>
      <h1>Turn a long video<br /><span>into short-form.</span></h1>
      <p className="lead">
        GoViral finds the moments worth watching, reframes them for vertical,
        and prepares clips for you.
      </p>

      <button
        type="button"
        className={dragging ? "upload-zone dragging" : "upload-zone"}
        onClick={() => localRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={drop}
      >
        <span className="upload-glyph">↑</span>
        <strong>Drop your long video here</strong>
        <span>or choose a video from your device</span>
        <b>Choose video</b>
        <small>MP4 · MOV · WebM · Up to 150 MB</small>
      </button>

      <input
        ref={localRef}
        hidden
        type="file"
        accept="video/*"
        onChange={onChooseFile}
      />

      <div className="trust-row">
        <span>✦ Auto-selected moments</span>
        <span>9:16 reframe</span>
        <span>Captions included</span>
      </div>
    </section>
  );
}
