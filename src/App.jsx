import { useState, useEffect } from "react";

const tools = [
  ["✂", "Trim"],
  ["＋", "Split"],
  ["◐", "Crop"],
  ["↗", "Zoom"],
  ["T", "Text"],
  ["CC", "Captions"],
  ["♫", "Audio"],
  ["1×", "Speed"],
];

const projects = [
  {
    name: "Podcast Episode 04",
    duration: "42:18",
    status: "Ready",
  },
  {
    name: "Interview — Startup Founder",
    duration: "28:41",
    status: "Draft",
  },
];

function Logo() {
  return (
    <div className="brand">
      <div className="brand-mark">
        G<span>→</span>
      </div>
      <strong>GoViral</strong>
    </div>
  );
}

function App() {
  const [page, setPage] = useState("create");
  const [selectedTool, setSelectedTool] = useState("Trim");
  const [aspect, setAspect] = useState("9:16");
  const [autoEdit, setAutoEdit] = useState(false);
  const [fileName, setFileName] = useState("");
const [videoUrl, setVideoUrl] = useState("");
const [videoDuration, setVideoDuration] = useState(0);
const [currentTime, setCurrentTime] = useState(0);
const [trimStart, setTrimStart] = useState(0);
const [trimEnd, setTrimEnd] = useState(0);
const [splitPoint, setSplitPoint] = useState(null);
useEffect(() => {
  return () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
  };
}, [videoUrl]);
  function handleFile(event) {
  const file = event.target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("video/")) {
    alert("Please select a video file.");
    return;
  }

  if (videoUrl) {
    URL.revokeObjectURL(videoUrl);
  }

  const url = URL.createObjectURL(file);

  setFileName(file.name);
  setVideoUrl(url);
  setCurrentTime(0);
}

  return (
    <div className="app-shell">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <Logo />

        <nav className="side-nav">

          <button
            className={page === "create" ? "nav-item active" : "nav-item"}
            onClick={() => setPage("create")}
          >
            <span>＋</span>
            Create
          </button>

          <button
            className={page === "projects" ? "nav-item active" : "nav-item"}
            onClick={() => setPage("projects")}
          >
            <span>▣</span>
            Projects
          </button>

          <button
            className={page === "referral" ? "nav-item active" : "nav-item"}
            onClick={() => setPage("referral")}
          >
            <span>↗</span>
            Earn Access
          </button>

          <button
            className={page === "pricing" ? "nav-item active" : "nav-item"}
            onClick={() => setPage("pricing")}
          >
            <span>◇</span>
            Plans
          </button>

        </nav>

        <div className="sidebar-bottom">

          <button className="nav-item">
            <span>⚙</span>
            Settings
          </button>

          <div className="usage-card">

            <div className="usage-top">
              <span>FREE PLAN</span>
              <span>3 / 3</span>
            </div>

            <div className="usage-bar">
              <div className="usage-fill"></div>
            </div>

            <p>
              Upgrade or earn access through referrals.
            </p>

          </div>

          <div className="user-box">
            <div className="avatar">K</div>

            <div>
              <strong>Creator</strong>
              <small>Free account</small>
            </div>
          </div>

        </div>

      </aside>


      {/* MAIN */}

      <main className="main-area">

        <header className="topbar">

          <div>
            <span className="top-label">WORKSPACE</span>
            <h1>
              {page === "create" && "Create"}
              {page === "projects" && "Projects"}
              {page === "referral" && "Earn Access"}
              {page === "pricing" && "Plans"}
            </h1>
          </div>

          <div className="top-actions">
            <span className="credits">
              3 exports left
            </span>

            <button className="profile-button">
              K
            </button>
          </div>

        </header>


        {/* CREATE */}

        {page === "create" && (

          <section className="workspace">

            <div className="workspace-heading">

              <div>
                <span className="section-kicker">
                  NEW PROJECT
                </span>

                <h2>
                  Turn a long video
                  <br />
                  into a <em>short.</em>
                </h2>
              </div>

              <div className="format-control">

                <span>FORMAT</span>

                <div>
                  {["9:16", "1:1", "16:9"].map((item) => (
                    <button
                      key={item}
                      className={
                        aspect === item ? "format active" : "format"
                      }
                      onClick={() => setAspect(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>

              </div>

            </div>


            {/* UPLOAD */}

            <div className="editor-card">

              <div className="editor-toolbar">

                <span>
                  {fileName || "SOURCE VIDEO"}
                </span>

                <span className="green-status">
                  ● READY
                </span>

              </div>

              <div className="upload-area">

                <div className="upload-icon">
                  ↑
                </div>

                <h3>
                  {fileName
                    ? fileName
                    : "Drop your long video here"}
                </h3>

                <p>
                  MP4, MOV or WebM · Recommended under 2GB
                </p>

                <label className="upload-button">
                  {fileName ? "Change video" : "Choose video"}

                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFile}
                    hidden
                  />
                </label>

              </div>

            </div>


            {/* EDITOR */}

            <div className="editor-card editor">

              <div className="editor-toolbar">

                <span>EDITOR</span>

                <span>
                  {aspect} · 1080p
                </span>

              </div>

              <div className="video-stage">

                <div className="video-frame">

  {videoUrl ? (
    <video
      className="video-preview"
      src={videoUrl}
      controls
      onLoadedMetadata={(event) => {
        setVideoDuration(event.currentTarget.duration);
      }}
      onTimeUpdate={(event) => {
        setCurrentTime(event.currentTarget.currentTime);
      }}
    />
  ) : (
    <div className="stage-placeholder">
      <span>YOUR VIDEO</span>
    </div>
  )}

</div>


              {/* TOOLS */}

              <div className="tool-row">

                {tools.map(([icon, name]) => (

                  <button
                    key={name}
                    className={
                      selectedTool === name
                        ? "tool active"
                        : "tool"
                    }
                    onClick={() => setSelectedTool(name)}
                  >

                    <strong>{icon}</strong>
                    <span>{name}</span>

                  </button>

                ))}

              </div>


              {/* TIMELINE */}

              <div className="timeline">

                <div className="timeline-time">
                  00:00
                </div>

                <div className="timeline-track">

                  <div className="timeline-video">

                    <div className="clip clip-one"></div>
                    <div className="clip clip-two"></div>
                    <div className="clip clip-three"></div>
                    <div className="clip clip-four"></div>

                  </div>

                  <div className="playhead"></div>

                </div>

                <div className="timeline-time">
  {formatTime(videoDuration)}
</div>

              </div>


              {/* AUTO EDIT */}

              <div className="auto-edit">

                <div>

                  <div className="auto-title">
                    <span>✦</span>
                    Auto Edit
                    <b>PRO PLUS</b>
                  </div>

                  <p>
                    Let GoViral find strong moments,
                    cut clips and prepare them for short-form.
                  </p>

                </div>

                <button
                  className={
                    autoEdit ? "switch on" : "switch"
                  }
                  onClick={() => setAutoEdit(!autoEdit)}
                >
                  <span></span>
                </button>

              </div>


              <div className="editor-actions">

                <button className="secondary-action">
                  Save draft
                </button>

                <button className="export-button">
                  Export clip →
                </button>

              </div>

            </div>

          </section>
        )}


        {/* PROJECTS */}

        {page === "projects" && (

          <section className="page-section">

            <div className="page-title-row">

              <div>
                <span className="section-kicker">
                  YOUR LIBRARY
                </span>

                <h2>
                  Projects
                </h2>
              </div>

              <button
                className="export-button"
                onClick={() => setPage("create")}
              >
                + New project
              </button>

            </div>

            <div className="project-grid">

              {projects.map((project) => (

                <div className="project-card" key={project.name}>

                  <div className="project-preview">
                    <span>9:16</span>
                  </div>

                  <div className="project-info">

                    <div>
                      <strong>
                        {project.name}
                      </strong>

                      <small>
                        {project.duration}
                      </small>
                    </div>

                    <span className="project-status">
                      {project.status}
                    </span>

                  </div>

                </div>

              ))}

            </div>

          </section>
        )}


        {/* REFERRAL */}

        {page === "referral" && (

          <section className="page-section">

            <span className="section-kicker">
              VIRAL PASS
            </span>

            <h2>
              Earn your access.
            </h2>

            <p className="large-description">
              Don't want to pay? Bring real creators to
              GoViral and unlock premium access.
            </p>

            <div className="referral-card">

              <div>

                <span className="referral-label">
                  YOUR REFERRAL
                </span>

                <div className="referral-code">
                  GOVIRAL-K7X92
                </div>

                <p>
                  Only genuine active users count.
                  Fake accounts and self-referrals don't qualify.
                </p>

              </div>

              <button className="export-button">
                Copy referral link
              </button>

            </div>

            <div className="referral-stats">

              <div>
                <strong>0</strong>
                <span>Confirmed</span>
              </div>

              <div>
                <strong>10</strong>
                <span>Needed for Pro Plus</span>
              </div>

              <div>
                <strong>30 days</strong>
                <span>Reward</span>
              </div>

            </div>

            <div className="referral-rules">

              <h3>
                How it works
              </h3>

              <div className="rule">
                <b>01</b>
                <span>Share your referral link.</span>
              </div>

              <div className="rule">
                <b>02</b>
                <span>Your friend verifies their account.</span>
              </div>

              <div className="rule">
                <b>03</b>
                <span>They actually create a video.</span>
              </div>

              <div className="rule">
                <b>04</b>
                <span>Your referral becomes confirmed.</span>
              </div>

            </div>

          </section>
        )}


        {/* PLANS */}

        {page === "pricing" && (

          <section className="page-section">

            <span className="section-kicker">
              PLANS
            </span>

            <h2>
              Pay or earn.
            </h2>

            <p className="large-description">
              Choose the plan that fits the way you create.
            </p>

            <div className="plans-grid">

              <Plan
                name="Free"
                price="₹0"
                description="Try the editor."
                features={[
                  "3 exports / month",
                  "720p export",
                  "Basic editing",
                  "GoViral watermark",
                ]}
              />

              <Plan
                name="Creator"
                price="₹199"
                description="For regular creators."
                features={[
                  "50 exports / month",
                  "1080p export",
                  "Captions",
                  "No watermark",
                ]}
              />

              <Plan
                name="Pro"
                price="₹499"
                description="For serious creators."
                features={[
                  "200 exports / month",
                  "Advanced editing",
                  "Premium presets",
                  "Priority exports",
                ]}
              />

              <Plan
                name="Pro Plus"
                price="₹1,499"
                description="Let GoViral edit for you."
                featured
                features={[
                  "Unlimited editing*",
                  "Unlimited exports*",
                  "Auto Edit",
                  "Auto captions",
                  "Auto reframing",
                  "Priority processing",
                ]}
              />

            </div>

            <p className="fair-use">
              *Unlimited access is subject to fair-use and
              abuse protection.
            </p>

          </section>
        )}

      </main>

    </div>
  );
}
 
function formatTime(seconds) {
  if (!seconds || !Number.isFinite(seconds)) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

function Plan({
  name,
  price,
  description,
  features,
  featured,
}) {
  return (
    <div className={featured ? "plan-card featured" : "plan-card"}>

      {featured && (
        <div className="featured-label">
          MOST POWERFUL
        </div>
      )}

      <span className="plan-name">
        {name}
      </span>

      <div className="plan-price">
        {price}
        {price !== "₹0" && (
          <small>/month</small>
        )}
      </div>

      <p>
        {description}
      </p>

      <ul>
        {features.map((feature) => (
          <li key={feature}>
            <span>✓</span>
            {feature}
          </li>
        ))}
      </ul>

      <button
        className={
          featured
            ? "export-button full"
            : "secondary-action full"
        }
      >
        {name === "Free"
          ? "Current plan"
          : "Choose plan"}
      </button>

    </div>
  );
}

export default App;