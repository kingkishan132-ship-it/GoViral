export default function Header({ stage, onStartOver }) {
  return (
    <header className="header">
      <button
        className="brand"
        onClick={onStartOver}
        aria-label="GoViral home"
      >
        <span className="brand-mark">
          G<span>›</span>
        </span>
        <span>GoViral</span>
      </button>

      <div className="header-center">
        <span className="status-line">
          <i /> Auto Edit
        </span>
      </div>

      <div className="header-right">
        <span className="usage">3 auto-edits left</span>
        <span className="avatar">K</span>
      </div>
    </header>
  );
}