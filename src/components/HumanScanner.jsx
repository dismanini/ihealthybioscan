import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Webcam from "react-webcam";

import {
  Camera,
  CameraOff,
  RotateCcw,
  Download,
  Settings,
  ScanFace,
  UserRound,
  Activity,
  HeartPulse,
  Droplets,
  Stethoscope,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  Info,
  Scan,
} from "lucide-react";

import {
  FaceLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

const WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm";

const FACE_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

const videoConstraints = {
  width: {
    ideal: 1280,
  },
  height: {
    ideal: 720,
  },
  facingMode: "user",
};

function HumanScanner({ onBack }) {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const faceLandmarkerRef = useRef(null);
  const animationRef = useRef(null);

  const lastVideoTimeRef = useRef(-1);
  const processingRef = useRef(false);

  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelError, setModelError] = useState("");

  const [cameraOn, setCameraOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  const [faceCount, setFaceCount] = useState(0);
  const [faceScore, setFaceScore] = useState(0);

  const [blendshapeCount, setBlendshapeCount] = useState(0);
  const [landmarkCount, setLandmarkCount] = useState(0);

  const [confidence, setConfidence] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);

  const [healthData, setHealthData] = useState({
    heartRate: null,
    spo2: null,
    bloodPressure: null,
  });

  const [error, setError] = useState("");

  // ----------------------------------------------------
  // Load MediaPipe
  // ----------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function loadFaceModel() {
      try {
        setModelError("");

        console.log("Loading MediaPipe Face Landmarker...");

        const vision = await FilesetResolver.forVisionTasks(
          WASM_URL
        );

        const landmarker =
          await FaceLandmarker.createFromOptions(
            vision,
            {
              baseOptions: {
                modelAssetPath: FACE_MODEL_URL,
                delegate: "GPU",
              },

              runningMode: "VIDEO",

              numFaces: 3,

              minFaceDetectionConfidence: confidence,

              minFacePresenceConfidence: confidence,

              minTrackingConfidence: confidence,

              outputFaceBlendshapes: true,

              outputFacialTransformationMatrixes: true,
            }
          );

        if (!cancelled) {
          faceLandmarkerRef.current = landmarker;
          setModelLoaded(true);

          console.log(
            "MediaPipe Face Landmarker loaded successfully."
          );
        }
      } catch (err) {
        console.error(
          "MediaPipe model loading failed:",
          err
        );

        if (!cancelled) {
          setModelError(
            "Unable to load the MediaPipe face AI model."
          );
        }
      }
    }

    loadFaceModel();

    return () => {
      cancelled = true;

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      if (faceLandmarkerRef.current) {
        try {
          faceLandmarkerRef.current.close();
        } catch {
          // Ignore cleanup errors
        }

        faceLandmarkerRef.current = null;
      }
    };
  }, []);

  // ----------------------------------------------------
  // Draw landmarks
  // ----------------------------------------------------

  const drawFace = useCallback(
    (results, video) => {
      const canvas = canvasRef.current;

      if (!canvas || !video) {
        return;
      }

      const width = video.videoWidth;
      const height = video.videoHeight;

      if (!width || !height) {
        return;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");

      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      if (
        !results ||
        !results.faceLandmarks ||
        results.faceLandmarks.length === 0
      ) {
        return;
      }

      const faces = results.faceLandmarks;

      faces.forEach((landmarks) => {
        // Face landmark points
        ctx.fillStyle = "#4ade80";

        for (const point of landmarks) {
          const x = point.x * width;
          const y = point.y * height;

          ctx.beginPath();
          ctx.arc(x, y, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Calculate approximate bounding box
        let minX = 1;
        let minY = 1;
        let maxX = 0;
        let maxY = 0;

        landmarks.forEach((point) => {
          minX = Math.min(minX, point.x);
          minY = Math.min(minY, point.y);
          maxX = Math.max(maxX, point.x);
          maxY = Math.max(maxY, point.y);
        });

        const boxX = minX * width;
        const boxY = minY * height;

        const boxWidth =
          (maxX - minX) * width;

        const boxHeight =
          (maxY - minY) * height;

        ctx.strokeStyle = "#4ade80";
        ctx.lineWidth = 3;

        ctx.strokeRect(
          boxX,
          boxY,
          boxWidth,
          boxHeight
        );

        ctx.fillStyle = "rgba(0,0,0,0.7)";

        ctx.fillRect(
          boxX,
          Math.max(0, boxY - 34),
          180,
          30
        );

        ctx.fillStyle = "#ffffff";

        ctx.font =
          "bold 15px Arial";

        ctx.fillText(
          "Human face detected",
          boxX + 10,
          Math.max(20, boxY - 13)
        );
      });
    },
    []
  );

  // ----------------------------------------------------
  // Detection loop
  // ----------------------------------------------------

  const detectFaces = useCallback(() => {
    if (!cameraOn || capturedImage) {
      return;
    }

    if (!faceLandmarkerRef.current) {
      animationRef.current =
        requestAnimationFrame(detectFaces);

      return;
    }

    const webcam = webcamRef.current;

    if (!webcam) {
      animationRef.current =
        requestAnimationFrame(detectFaces);

      return;
    }

    const video = webcam.video;

    if (!video) {
      animationRef.current =
        requestAnimationFrame(detectFaces);

      return;
    }

    if (
      video.readyState < 2 ||
      video.videoWidth === 0
    ) {
      animationRef.current =
        requestAnimationFrame(detectFaces);

      return;
    }

    if (processingRef.current) {
      animationRef.current =
        requestAnimationFrame(detectFaces);

      return;
    }

    const currentTime = video.currentTime;

    if (
      currentTime === lastVideoTimeRef.current
    ) {
      animationRef.current =
        requestAnimationFrame(detectFaces);

      return;
    }

    lastVideoTimeRef.current = currentTime;

    processingRef.current = true;

    try {
      const timestamp =
        performance.now();

      const results =
        faceLandmarkerRef.current.detectForVideo(
          video,
          timestamp
        );

      const faces =
        results?.faceLandmarks || [];

      setFaceCount(faces.length);

      setLandmarkCount(
        faces[0]?.length || 0
      );

      if (
        results?.faceBlendshapes &&
        results.faceBlendshapes.length > 0
      ) {
        setBlendshapeCount(
          results.faceBlendshapes[0]
            ?.categories?.length || 0
        );
      } else {
        setBlendshapeCount(0);
      }

      if (faces.length > 0) {
        // MediaPipe does not provide a single
        // face-confidence score like face-api.js.
        // We show the configured detection threshold.
        setFaceScore(
          Math.round(confidence * 100)
        );
      } else {
        setFaceScore(0);
      }

      drawFace(results, video);
    } catch (err) {
      console.error(
        "Face detection error:",
        err
      );
    } finally {
      processingRef.current = false;
    }

    animationRef.current =
      requestAnimationFrame(detectFaces);
  }, [
    cameraOn,
    capturedImage,
    confidence,
    drawFace,
  ]);

  useEffect(() => {
    if (!cameraOn || capturedImage) {
      if (animationRef.current) {
        cancelAnimationFrame(
          animationRef.current
        );
      }

      return;
    }

    animationRef.current =
      requestAnimationFrame(detectFaces);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(
          animationRef.current
        );
      }
    };
  }, [
    cameraOn,
    capturedImage,
    detectFaces,
  ]);

  // ----------------------------------------------------
  // Camera
  // ----------------------------------------------------

  const startCamera = () => {
    setError("");
    setCapturedImage(null);
    setCameraOn(true);
  };

  const stopCamera = () => {
    setCameraOn(false);

    if (animationRef.current) {
      cancelAnimationFrame(
        animationRef.current
      );
    }

    const webcam =
      webcamRef.current;

    const video =
      webcam?.video;

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

    setFaceCount(0);
    setFaceScore(0);
    setLandmarkCount(0);
    setBlendshapeCount(0);

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

  // ----------------------------------------------------
  // Capture
  // ----------------------------------------------------

  const captureImage = () => {
    if (!webcamRef.current) {
      return;
    }

    const image =
      webcamRef.current.getScreenshot();

    if (!image) {
      setError(
        "Unable to capture the camera image."
      );

      return;
    }

    setCapturedImage(image);

    // Stop continuous detection.
    if (animationRef.current) {
      cancelAnimationFrame(
        animationRef.current
      );
    }

    setCameraOn(false);
  };

  // ----------------------------------------------------
  // Scan Again
  // ----------------------------------------------------

  const scanAgain = () => {
    setCapturedImage(null);
    setError("");
    setFaceCount(0);
    setFaceScore(0);
    setLandmarkCount(0);
    setBlendshapeCount(0);

    startCamera();
  };

  // ----------------------------------------------------
  // Download
  // ----------------------------------------------------

  const downloadImage = () => {
    if (!capturedImage) {
      return;
    }

    const link =
      document.createElement("a");

    link.href = capturedImage;
    link.download =
      `iHealthyBio-human-scan-${Date.now()}.jpg`;

    link.click();
  };

  // ----------------------------------------------------
  // Reset
  // ----------------------------------------------------

  const resetScan = () => {
    stopCamera();

    setCapturedImage(null);
    setError("");

    setHealthData({
      heartRate: null,
      spo2: null,
      bloodPressure: null,
    });
  };

  return (
    <div className="scanner-page">
      <section className="scanner-header">
        <div>
          <span className="eyebrow">
            HUMAN ANALYSIS
          </span>

          <h2>
            Human Face Scanner
          </h2>

          <p>
            Real-time facial landmark analysis
            powered by MediaPipe.
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
              MediaPipe Ready
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
              MediaPipe model could not be loaded
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
                Camera Scanner
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
                    Number(e.target.value)
                  )
                }
              />
            </div>
          )}

          <div className="camera-stage">
            {capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured human scan"
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
                <div className="placeholder-icon">
                  <ScanFace size={52} />
                </div>

                <h3>
                  Start Human Scan
                </h3>

                <p>
                  Allow camera access to begin
                  facial analysis.
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
                ANALYSIS
              </span>

              <h3>
                Face Analysis
              </h3>
            </div>

            <ScanFace size={28} />
          </div>

          <div className="metric-grid">
            <div className="metric-card">
              <div className="metric-icon">
                <UserRound size={20} />
              </div>

              <span>
                Faces
              </span>

              <strong>
                {faceCount}
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
                Detection
              </span>

              <strong>
                {faceScore}%
              </strong>

              <small>
                Threshold
              </small>
            </div>

            <div className="metric-card">
              <div className="metric-icon">
                <Activity size={20} />
              </div>

              <span>
                Landmarks
              </span>

              <strong>
                {landmarkCount}
              </strong>

              <small>
                Points
              </small>
            </div>

            <div className="metric-card">
              <div className="metric-icon">
                <ScanFace size={20} />
              </div>

              <span>
                Blendshapes
              </span>

              <strong>
                {blendshapeCount}
              </strong>

              <small>
                Features
              </small>
            </div>
          </div>

          <div className="health-section">
            <div className="health-title">
              <div>
                <span className="eyebrow">
                  HEALTH MONITORING
                </span>

                <h3>
                  Vital Signs
                </h3>
              </div>

              <HeartPulse size={25} />
            </div>

            <div className="health-grid">
              <HealthCard
                icon={<HeartPulse />}
                title="Heart Rate"
                value={healthData.heartRate}
                unit="BPM"
              />

              <HealthCard
                icon={<Droplets />}
                title="SpO₂"
                value={healthData.spo2}
                unit="%"
              />

              <HealthCard
                icon={<Stethoscope />}
                title="Blood Pressure"
                value={
                  healthData.bloodPressure
                }
                unit="mmHg"
              />
            </div>

            <div className="sensor-warning">
              <Info size={18} />

              <span>
                Vital-sign measurements are not
                calculated from this webcam scan.
                A validated algorithm and/or physical
                sensor is required.
              </span>
            </div>
          </div>

          <div className="privacy-card">
            <ShieldCheck size={21} />

            <div>
              <strong>
                Visual analysis
              </strong>

              <p>
                Facial analysis is provided for
                informational purposes and should not
                be used as a medical diagnosis.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function HealthCard({
  icon,
  title,
  value,
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
          {value ?? "--"}

          {value !== null &&
            value !== undefined && (
              <small>
                {" "}
                {unit}
              </small>
            )}
        </strong>

        <em>
          Sensor required
        </em>
      </div>
    </div>
  );
}

export default HumanScanner;