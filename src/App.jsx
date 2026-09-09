import React, { useState } from "react";
import {
  HeartPulse,
  PawPrint,
  UserRound,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

import HumanScanner from "./components/HumanScanner";
import AnimalScanner from "./components/AnimalScanner";

function App() {
  const [scanner, setScanner] = useState(null);

  if (scanner === "human") {
    return (
      <div className="app-shell">
        <header className="top-header">
          <div className="brand">
            <div className="brand-logo">
              <HeartPulse size={28} />
            </div>

            <div>
              <h1>iHealthyBio</h1>
              <span>AI Face & Health Analysis</span>
            </div>
          </div>

          <button
            className="header-back-button"
            onClick={() => setScanner(null)}
          >
            <ArrowLeft size={18} />
            Back
          </button>
        </header>

        <main>
          <HumanScanner onBack={() => setScanner(null)} />
        </main>
      </div>
    );
  }

  if (scanner === "animal") {
    return (
      <div className="app-shell">
        <header className="top-header">
          <div className="brand">
            <div className="brand-logo animal-logo">
              <PawPrint size={28} />
            </div>

            <div>
              <h1>iHealthyBio</h1>
              <span>AI Pet & Animal Analysis</span>
            </div>
          </div>

          <button
            className="header-back-button"
            onClick={() => setScanner(null)}
          >
            <ArrowLeft size={18} />
            Back
          </button>
        </header>

        <main>
          <AnimalScanner onBack={() => setScanner(null)} />
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="top-header landing-header">
        <div className="brand">
          <div className="brand-logo">
            <HeartPulse size={30} />
          </div>

          <div>
            <h1>iHealthyBio</h1>
            <span>AI Face & Health Analysis</span>
          </div>
        </div>

        <div className="secure-badge">
          <ShieldCheck size={17} />
          AI Powered
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="pulse-dot"></span>
              Intelligent Visual Analysis
            </div>

            <h2>
              Understand your
              <br />
              <span>health & wellbeing</span>
            </h2>

            <p>
              Use AI-powered facial and animal detection technology to explore
              visual information about humans and pets.
            </p>

            <div className="hero-disclaimer">
              <ShieldCheck size={19} />
              <span>
                Visual analysis is informational only and is not a medical or
                veterinary diagnosis.
              </span>
            </div>
          </div>
        </section>

        <section className="scanner-selection">
          <div className="section-heading">
            <span>CHOOSE YOUR SCANNER</span>
            <h3>What would you like to analyze?</h3>
          </div>

          <div className="scanner-grid">
            <button
              className="scanner-card human-card"
              onClick={() => setScanner("human")}
            >
              <div className="scanner-icon">
                <UserRound size={42} />
              </div>

              <div className="scanner-card-content">
                <span className="card-label">HUMAN</span>
                <h3>Human Face Scan</h3>

                <p>
                  Detect faces, facial landmarks and facial characteristics
                  using MediaPipe AI.
                </p>

                <div className="feature-list">
                  <span>✓ Face detection</span>
                  <span>✓ Facial landmarks</span>
                  <span>✓ Facial blendshapes</span>
                  <span>✓ Capture & report</span>
                </div>
              </div>

              <div className="launch-button">
                Start Human Scan →
              </div>
            </button>

            <button
              className="scanner-card animal-card"
              onClick={() => setScanner("animal")}
            >
              <div className="scanner-icon animal">
                <PawPrint size={42} />
              </div>

              <div className="scanner-card-content">
                <span className="card-label">PET & ANIMAL</span>
                <h3>Animal Face Scan</h3>

                <p>
                  Detect dogs, cats, birds, horses and other supported animals
                  using COCO-SSD AI.
                </p>

                <div className="feature-list">
                  <span>✓ Dog detection</span>
                  <span>✓ Cat detection</span>
                  <span>✓ Animal confidence</span>
                  <span>✓ Capture & report</span>
                </div>
              </div>

              <div className="launch-button">
                Start Animal Scan →
              </div>
            </button>
          </div>
        </section>

        <section className="technology-section">
          <div className="technology-card">
            <div>
              <span className="small-label">POWERED BY AI</span>
              <h3>Modern browser-based analysis</h3>
              <p>
                iHealthyBio processes camera frames directly in your browser
                using machine-learning models.
              </p>
            </div>

            <div className="technology-items">
              <div>
                <strong>MediaPipe</strong>
                <span>Human Face</span>
              </div>

              <div>
                <strong>COCO-SSD</strong>
                <span>Animal Detection</span>
              </div>

              <div>
                <strong>Web AI</strong>
                <span>Browser Processing</span>
              </div>
            </div>
          </div>
        </section>

        <section className="safety-section">
          <ShieldCheck size={22} />

          <div>
            <strong>Important health information</strong>
            <p>
              Heart rate, SpO₂, blood pressure and other vital signs cannot be
              reliably determined from an ordinary webcam by this application.
              Validated algorithms and/or physical sensors are required.
            </p>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <strong>iHealthyBio</strong>
        <span>AI-powered visual analysis platform</span>
      </footer>
    </div>
  );
}

export default App;