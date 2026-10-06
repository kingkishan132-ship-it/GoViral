import { useState } from "react";

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app">

      <nav className="navbar">
        <div className="brand">
          <div className="brand-mark">G</div>
          <span>GoViral</span>
        </div>

        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <a href="#how">How it works</a>
          <a href="#pricing">Pricing</a>
          <a href="#about">About</a>

          <button className="login-btn">
            Log in
          </button>
        </div>

        <button
          className="menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </nav>

      <main>

        <section className="hero">

          <div className="eyebrow">
            AI SHORT-FORM VIDEO WORKSPACE
          </div>

          <h1>
            Make every
            <br />
            frame <span>travel further.</span>
          </h1>

          <p className="hero-text">
            Turn raw footage into sharp, social-ready
            short-form videos with an AI-powered creative
            workflow built for modern creators.
          </p>

          <div className="hero-buttons">

            <button className="primary-btn">
              Start creating
              <span>→</span>
            </button>

            <a href="#how" className="secondary-btn">
              See how it works
            </a>

          </div>

          <div className="hero-note">
            No complicated timeline. Just your footage,
            your direction and the signal.
          </div>

        </section>


        <section className="product-preview">

          <div className="preview-header">

            <span>GOVIRAL WORKSPACE</span>

            <span className="status">
              <i></i>
              READY
            </span>

          </div>

          <div className="preview-body">

            <div className="preview-sidebar">

              <div className="side-logo">
                G
              </div>

              <div className="side-item active">
                Create
              </div>

              <div className="side-item">
                Projects
              </div>

              <div className="side-item">
                Settings
              </div>

            </div>

            <div className="editor">

              <div className="editor-top">
                <span>NEW PROJECT</span>

                <span>
                  9:16
                </span>
              </div>

              <div className="upload-box">

                <div className="upload-icon">
                  ↑
                </div>

                <h3>
                  Drop your footage here
                </h3>

                <p>
                  Upload a video and start creating.
                </p>

                <button>
                  Choose video
                </button>

              </div>

              <div className="editor-footer">

                <span>
                  CLEAN DOCUMENTARY
                </span>

                <span>
                  AI READY
                </span>

              </div>

            </div>

          </div>

        </section>


        <section id="how" className="section">

          <div className="section-label">
            THE WORKFLOW
          </div>

          <h2>
            From footage
            <br />
            to <span>signal.</span>
          </h2>

          <div className="steps">

            <div className="step">
              <div className="number">
                01
              </div>

              <h3>
                Upload
              </h3>

              <p>
                Bring your raw footage into one
                focused workspace.
              </p>
            </div>

            <div className="step">
              <div className="number">
                02
              </div>

              <h3>
                Direct
              </h3>

              <p>
                Choose the style, direction and
                creative intent for your video.
              </p>
            </div>

            <div className="step">
              <div className="number">
                03
              </div>

              <h3>
                Publish
              </h3>

              <p>
                Turn your idea into social-ready
                vertical content.
              </p>
            </div>

          </div>

        </section>


        <section id="pricing" className="pricing-section">

          <div>
            <div className="section-label">
              SIMPLE PRICING
            </div>

            <h2>
              Create more.
              <br />
              <span>Think less.</span>
            </h2>
          </div>

          <div className="price-card">

            <div className="plan">
              CREATOR
            </div>

            <div className="price">
              ₹499
              <small>/month</small>
            </div>

            <p>
              Everything you need to turn raw
              footage into consistent short-form
              content.
            </p>

            <button className="primary-btn full">
              Get started →
            </button>

          </div>

        </section>


        <section id="about" className="closing">

          <div className="section-label">
            GOVIRAL
          </div>

          <h2>
            Don't just make
            <br />
            content.
            <br />
            Make it <span>travel.</span>
          </h2>

        </section>

      </main>


      <footer>

        <div className="brand">
          <div className="brand-mark">
            G
          </div>

          <span>
            GoViral
          </span>
        </div>

        <span>
          Signal that travels.
        </span>

      </footer>

    </div>
  );
}