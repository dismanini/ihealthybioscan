import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Webcam from "react-webcam";

import * as cocoSsd from "@tensorflow-models/coco-ssd";

import {
  Camera,
  CameraOff,
  RotateCcw,
  Download,
  Settings,
  PawPrint,
  AlertCircle,
  CheckCircle,
  ShieldCheck,
  Scan,
  Activity,
  HeartPulse,
  Droplets,
  Stethoscope,
  Info,
} from "lucide-react";

const videoConstraints = {
  width: {
    ideal: 1280,
  },
  height: {
    ideal: 720,
  },
  facingMode: "user",
};

const ANIMAL_CLASSES = new Set([
  "cat",
  "dog",
  "bird",
  "horse",
  "sheep",
  "cow",
  "elephant",
  "bear",
  "zebra",
  "giraffe",
]);

function AnimalScanner({ onBack }) {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const modelRef = useRef(null);
  const animationRef = useRef(null);
  const processingRef = useRef(false);

  const [modelLoaded, setModelLoaded] =
    useState(false);

  const [modelError, setModelError] =
    useState("");

  const [cameraOn, setCameraOn] =
    useState(false);

  const [capturedImage, setCapturedImage] =
    useState(null);

  const [detections, setDetections] =
    useState([]);

  const [confidence, setConfidence] =
    useState(0.5);

  const [showSettings, setShowSettings] =
    useState(false);

  const [error, setError] =
    useState("");

  // --------------------------------------------------
  // Load COCO-SSD
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function loadAnimalModel() {
      try {
        setModelError("");

        console.log(
          "Starting COCO-SSD model loading..."
        );

        const model =
          await cocoSsd.load({
            base: "lite_mobilenet_v2",
          });

        if (!cancelled) {
          modelRef.current = model;

          setModelLoaded(true);

          console.log(
            "COCO-SSD model loaded successfully."
          );
        }
      } catch (err) {
        console.error(
          "COCO-SSD model loading failed:",
          err
        );

        if (!cancelled) {
          setModelError(
            "Unable to load the animal AI model."
          );
        }
      }
    }

    loadAnimalModel();

    return () => {
      cancelled = true;

      if (animationRef.current) {
        cancelAnimationFrame(
          animationRef.current
        );
      }

      modelRef.current = null;
    };
  }, []);

  // --------------------------------------------------
  // Draw detections
  // --------------------------------------------------

  const drawDetections = useCallback(
    (predictions, video) => {
      const canvas = canvasRef.current;

      if (!canvas || !video) {
        return;
      }

      const width =
        video.videoWidth;

      const height =
        video.videoHeight;

      if (!width || !height) {
        return;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx =
        canvas.getContext("2d");

      ctx.clearRect(
        0,
        0,
        width,
        height
      );

      predictions.forEach(
        (prediction) => {
          const [
            x,
            y,
            boxWidth,
            boxHeight,
          ] = prediction.bbox;

          ctx.strokeStyle =
            "#4ade80";

          ctx.lineWidth = 3;

          ctx.strokeRect(
            x,
            y,
            boxWidth,
            boxHeight
          );

          const label =
            `${prediction.class} ` +
            `${Math.round(
              prediction.score * 100
            )}%`;

          ctx.font =
            "bold 16px Arial";

          const textWidth =
            ctx.measureText(
              label
            ).width;

          ctx.fillStyle =
            "rgba(0,0,0,0.75)";

          ctx.fillRect(
            x,
            Math.max(
              0,
              y - 34
            ),
            textWidth + 20,
            30
          );

          ctx.fillStyle =
            "#ffffff";

          ctx.fillText(
            label,
            x + 10,
            Math.max(
              20,
              y - 13
            )
          );
        }
      );
    },
    []
  );

  // --------------------------------------------------
  // Detection loop
  // --------------------------------------------------

  const detectAnimals =
    useCallback(async () => {
      if (
        !cameraOn ||
        capturedImage ||
        !modelRef.current
      ) {
        return;
      }

      const webcam =
        webcamRef.current;

      if (!webcam) {
        return;
      }

      const video =
        webcam.video;

      if (!video) {
        return;
      }

      if (
        video.readyState < 2 ||
        video.videoWidth === 0
      ) {
        animationRef.current =
          requestAnimationFrame(
            detectAnimals
          );

        return;
      }

      if (
        processingRef.current
      ) {
        animationRef.current =
          requestAnimationFrame(
            detectAnimals
          );

        return;
      }

      processingRef.current = true;

      try {
        const predictions =
          await modelRef.current.detect(
            video,
            20,
            confidence
          );

        const animals =
          predictions.filter(
            (prediction) =>
              ANIMAL_CLASSES.has(
                prediction.class
              )
          );

        setDetections(
          animals
        );

        drawDetections(
          animals,
          video
        );
      } catch (err) {
        console.error(
          "Animal detection error:",
          err
        );
      } finally {
        processingRef.current = false;

        if (
          cameraOn &&
          !capturedImage
        ) {
          animationRef.current =
            requestAnimationFrame(
              detectAnimals
            );
        }
      }
    }, [
      cameraOn,
      capturedImage,
      confidence,
      drawDetections,
    ]);

  useEffect(() => {
    if (
      !cameraOn ||
      capturedImage
    ) {
      if (
        animationRef.current
      ) {
        cancelAnimationFrame(
          animationRef.current
        );
      }

      return;
    }

    animationRef.current =
      requestAnimationFrame(
        detectAnimals
      );

    return () => {
      if (
        animationRef.current
      ) {
        cancelAnimationFrame(
          animationRef.current
        );
      }
    };
  }, [
    cameraOn,
    capturedImage,
    detectAnimals,
  ]);

  // --------------------------------------------------
  // Camera
  // --------------------------------------------------

  const startCamera = () => {
    setError("");
    setCapturedImage(null);
    setDetections([]);
    setCameraOn(true);
  };

  const stopCamera = () => {
    setCameraOn(false);

    if (
      animationRef.current
    ) {
      cancelAnimationFrame(
        animationRef.current
      );
    }

    const video =
      webcamRef.current?.video;

    if (
      video &&
      video.srcObject
    ) {
      video.srcObject
        .getTracks()
        .forEach((track) => {
          track.stop();
        });
    }

    setDetections([]);

    const canvas =
      canvasRef.current;

    if (canvas) {
      const ctx =
        canvas.getContext("2d");

      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );
    }
  };

  // --------------------------------------------------
  // Capture
  // --------------------------------------------------

  const captureImage = () => {
    const webcam =
      webcamRef.current;

    if (!webcam) {
      return;
    }

    const image =
      webcam.getScreenshot();

    if (!image) {
      setError(
        "Unable to capture the camera image."
      );

      return;
    }

    setCapturedImage(image);

    if (
      animationRef.current
    ) {
      cancelAnimationFrame(
        animationRef.current
      );
    }

    setCameraOn(false);
  };

  // --------------------------------------------------
  // Scan again
  // --------------------------------------------------

  const scanAgain = () => {
    setCapturedImage(null);
    setDetections([]);
    setError("");

    startCamera();
  };

  // --------------------------------------------------
  // Download
  // --------------------------------------------------

  const downloadImage = () => {
    if (!capturedImage) {
      return;
    }

    const link =
      document.createElement("a");

    link.href =
      capturedImage;

    link.download =
      `iHealthyBio-animal-scan-${Date.now()}.jpg`;

    link.click();
  };

  // --------------------------------------------------
  // Reset
  // --------------------------------------------------

  const resetScan = () => {
    stopCamera();

    setCapturedImage(null);
    setDetections([]);
    setError("");
  };

  const primaryAnimal =
    detections.length > 0
      ? detections.reduce(
          (best, current) =>
            current.score >
            best.score
              ? current
              : best
        )
      : null;

  return (
    <div className="scanner-page">
      <section className="scanner-header">
        <div>
          <span className="eyebrow">
            PET & ANIMAL ANALYSIS
          </span>

          <h2>
            Animal Face Scanner
          </h2>

          <p>
            Detect supported animals in real time
            using COCO-SSD AI.
          </p>
        </div>

        <div
          className={`model-status ${
            modelLoaded
              ? "success"
              : modelError
              ? "failed"
              : ""
          }`}
        >
          {modelLoaded ? (
            <>
              <CheckCircle size={18} />
              COCO-SSD Ready
            </>
          ) : modelError ? (
            <>
              <AlertCircle size={18} />
              Model Error
            </>
          ) : (
            <>
              <Scan size={18} />
              Loading AI...
            </>
          )}
        </div>
      </section>

      {modelError && (
        <div className="error-banner">
          <AlertCircle size={20} />

          <div>
            <strong>
              Animal AI model could not be loaded
            </strong>

            <p>
              Check your internet connection and
              reload the application.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <section className="scanner-layout">
        <div className="camera-panel">
          <div className="camera-header">
            <div>
              <strong>
                Animal Camera
              </strong>

              <span>
                {capturedImage
                  ? "Scan captured"
                  : cameraOn
                  ? "Camera active"
                  : "Camera inactive"}
              </span>
            </div>

            <button
              className="icon-button"
              onClick={() =>
                setShowSettings(
                  !showSettings
                )
              }
            >
              <Settings size={19} />
            </button>
          </div>

          {showSettings && (
            <div className="settings-panel">
              <label>
                Detection confidence

                <strong>
                  {Math.round(
                    confidence * 100
                  )}
                  %
                </strong>
              </label>

              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.1"
                value={confidence}
                onChange={(e) =>
                  setConfidence(
                    Number(
                      e.target.value
                    )
                  )
                }
              />
            </div>
          )}

          <div className="camera-stage">
            {capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured animal scan"
                className="captured-photo"
              />
            ) : cameraOn ? (
              <>
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  screenshotQuality={0.95}
                  videoConstraints={
                    videoConstraints
                  }
                  mirrored
                  className="webcam"
                  onUserMediaError={() =>
                    setError(
                      "Unable to access the camera. Please allow camera permission."
                    )
                  }
                />

                <canvas
                  ref={canvasRef}
                  className="face-overlay"
                />

                <div className="camera-live">
                  <span></span>
                  LIVE
                </div>
              </>
            ) : (
              <div className="camera-placeholder">
                <div className="placeholder-icon animal-placeholder">
                  <PawPrint size={52} />
                </div>

                <h3>
                  Start Animal Scan
                </h3>

                <p>
                  Allow camera access to detect your
                  pet or animal.
                </p>

                <button
                  className="primary-button"
                  onClick={startCamera}
                  disabled={!modelLoaded}
                >
                  <Camera size={19} />
                  Start Camera
                </button>
              </div>
            )}
          </div>

          <div className="camera-controls">
            {capturedImage ? (
              <>
                <button
                  className="primary-button"
                  onClick={scanAgain}
                >
                  <RotateCcw size={19} />
                  Scan Again
                </button>

                <button
                  className="secondary-button"
                  onClick={downloadImage}
                >
                  <Download size={19} />
                  Download
                </button>

                <button
                  className="secondary-button"
                  onClick={resetScan}
                >
                  Reset
                </button>
              </>
            ) : cameraOn ? (
              <>
                <button
                  className="capture-button"
                  onClick={captureImage}
                >
                  <Camera size={20} />
                  Capture
                </button>

                <button
                  className="danger-button"
                  onClick={stopCamera}
                >
                  <CameraOff size={19} />
                  Stop
                </button>
              </>
            ) : (
              <button
                className="primary-button"
                onClick={startCamera}
                disabled={!modelLoaded}
              >
                <Camera size={19} />
                Start Camera
              </button>
            )}
          </div>
        </div>

        <div className="analysis-panel">
          <div className="panel-title">
            <div>
              <span className="eyebrow">
                ANIMAL ANALYSIS
              </span>

              <h3>
                Detection Results
              </h3>
            </div>

            <PawPrint size={28} />
          </div>

          <div className="animal-summary">
            <div className="animal-summary-icon">
              <PawPrint size={34} />
            </div>

            <div>
              <span>
                Primary Detection
              </span>

              <strong>
                {primaryAnimal
                  ? primaryAnimal.class
                  : "No animal detected"}
              </strong>

              {primaryAnimal && (
                <small>
                  Confidence{" "}
                  {Math.round(
                    primaryAnimal.score *
                      100
                  )}
                  %
                </small>
              )}
            </div>
          </div>

          <div className="metric-grid">
            <div className="metric-card">
              <div className="metric-icon">
                <PawPrint size={20} />
              </div>

              <span>
                Animals
              </span>

              <strong>
                {detections.length}
              </strong>

              <small>
                Detected
              </small>
            </div>

            <div className="metric-card">
              <div className="metric-icon">
                <Scan size={20} />
              </div>

              <span>
                Confidence
              </span>

              <strong>
                {primaryAnimal
                  ? `${Math.round(
                      primaryAnimal.score *
                        100
                    )}%`
                  : "--"}
              </strong>

              <small>
                Best match
              </small>
            </div>
          </div>

          <div className="detection-list">
            <div className="health-title">
              <div>
                <span className="eyebrow">
                  DETECTED ANIMALS
                </span>

                <h3>
                  Results
                </h3>
              </div>
            </div>

            {detections.length === 0 ? (
              <div className="empty-results">
                <PawPrint size={30} />

                <p>
                  No supported animal detected.
                </p>

                <span>
                  Try positioning the animal clearly
                  in front of the camera.
                </span>
              </div>
            ) : (
              detections.map(
                (item, index) => (
                  <div
                    className="detection-item"
                    key={`${item.class}-${index}`}
                  >
                    <div className="detection-animal-icon">
                      <PawPrint size={20} />
                    </div>

                    <div>
                      <strong>
                        {item.class}
                      </strong>

                      <span>
                        AI confidence
                      </span>
                    </div>

                    <b>
                      {Math.round(
                        item.score * 100
                      )}
                      %
                    </b>
                  </div>
                )
              )
            )}
          </div>

          <div className="health-section">
            <div className="health-title">
              <div>
                <span className="eyebrow">
                  PET HEALTH
                </span>

                <h3>
                  Health Monitoring
                </h3>
              </div>

              <HeartPulse size={25} />
            </div>

            <div className="health-grid">
              <AnimalHealthCard
                icon={<HeartPulse />}
                title="Heart Rate"
                unit="BPM"
              />

              <AnimalHealthCard
                icon={<Droplets />}
                title="SpO₂"
                unit="%"
              />

              <AnimalHealthCard
                icon={<Stethoscope />}
                title="Blood Pressure"
                unit="mmHg"
              />
            </div>

            <div className="sensor-warning">
              <Info size={18} />

              <span>
                Animal vital signs cannot be reliably
                measured by this webcam/object detector.
                Veterinary sensors and validated models
                are required.
              </span>
            </div>
          </div>

          <div className="privacy-card">
            <ShieldCheck size={21} />

            <div>
              <strong>
                Veterinary disclaimer
              </strong>

              <p>
                Animal detection is not a veterinary
                diagnosis. Consult a qualified
                veterinarian for health concerns.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function AnimalHealthCard({
  icon,
  title,
  unit,
}) {
  return (
    <div className="health-card">
      <div className="health-card-icon">
        {icon}
      </div>

      <div>
        <span>{title}</span>

        <strong>
          --
          <small>
            {" "}
            {unit}
          </small>
        </strong>

        <em>
          Sensor required
        </em>
      </div>
    </div>
  );
}

export default AnimalScanner;