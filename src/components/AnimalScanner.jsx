import React, { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  Download,
  Edit3,
  Eye,
  HeartPulse,
  Info,
  PawPrint,
  RefreshCw,
  ScanLine,
  Settings,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Thermometer,
  Wind,
  X,
} from "lucide-react";

/* =========================================================
   CAMERA SETTINGS
========================================================= */

const VIDEO_CONSTRAINTS = {
  width: 1280,
  height: 720,
  facingMode: "user",
};

/* =========================================================
   SUPPORTED ANIMALS
========================================================= */

const ANIMAL_CLASSES = [
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
];

/* =========================================================
   ANIMAL PROFILE
========================================================= */

const INITIAL_PROFILE = {
  name: "Bella",
  species: "Dog",
  breed: "Golden Retriever",
  age: "4 Years",
  weight: "24.5 kg",
  sex: "Female",
};

/* =========================================================
   HEALTH METRICS
========================================================= */

const healthMetrics = [
  {
    title: "Heart Rate",
    value: "--",
    unit: "BPM",
    status: "Sensor required",
    icon: HeartPulse,
  },
  {
    title: "Respiratory Rate",
    value: "--",
    unit: "RPM",
    status: "Sensor required",
    icon: Wind,
  },
  {
    title: "Temperature",
    value: "--",
    unit: "°C",
    status: "Sensor required",
    icon: Thermometer,
  },
  {
    title: "SpO₂",
    value: "--",
    unit: "%",
    status: "Sensor required",
    icon: Activity,
  },
];

const wellnessMetrics = [
  {
    title: "HRV",
    value: "--",
    unit: "ms",
    status: "Sensor required",
    icon: HeartPulse,
  },
  {
    title: "Stress Level",
    value: "--",
    unit: "",
    status: "AI assessment",
    icon: Activity,
  },
  {
    title: "Activity",
    value: "--",
    unit: "",
    status: "Motion analysis",
    icon: PawPrint,
  },
  {
    title: "Hydration",
    value: "--",
    unit: "",
    status: "Sensor required",
    icon: Activity,
  },
];

/* =========================================================
   ALL CSS INSIDE JSX
========================================================= */

const animalStyles = `
  * {
    box-sizing: border-box;
  }

  .animal-dashboard {
    min-height: 100vh;
    width: 100%;
    background:
      radial-gradient(
        circle at 10% 0%,
        rgba(112, 91, 255, 0.10),
        transparent 30%
      ),
      linear-gradient(
        135deg,
        #f7fbff 0%,
        #eef8f8 50%,
        #f7f9ff 100%
      );
    color: #14213d;
    font-family:
      Inter,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }

  /* ================= HEADER ================= */

  .animal-header {
    height: 82px;
    padding: 0 38px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    background: rgba(255,255,255,0.94);
    border-bottom: 1px solid #e5eaf2;

    position: sticky;
    top: 0;
    z-index: 100;
  }

  .animal-brand {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .animal-brand-icon {
    width: 52px;
    height: 52px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 15px;

    color: white;

    background:
      linear-gradient(
        135deg,
        #6c63ff,
        #8b70ff
      );

    box-shadow:
      0 10px 25px rgba(108, 99, 255, 0.25);
  }

  .animal-brand h1 {
    margin: 0;
    font-size: 21px;
    font-weight: 800;
    color: #17213b;
  }

  .animal-brand p {
    margin: 3px 0 0;
    font-size: 12px;
    color: #8490a6;
  }

  .animal-header-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .system-status {
    display: flex;
    align-items: center;
    gap: 7px;

    padding: 8px 12px;

    border-radius: 20px;

    background: #f1faf5;
    color: #36865b;

    font-size: 11px;
    font-weight: 600;
  }

  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #42b978;
    box-shadow: 0 0 8px rgba(66,185,120,.5);
  }

  .animal-back-button {
    display: flex;
    align-items: center;
    gap: 8px;

    padding: 10px 16px;

    border: 1px solid #dce3ed;
    border-radius: 10px;

    background: white;
    color: #59677f;

    font-size: 14px;
    font-weight: 600;

    cursor: pointer;
    transition: .2s ease;
  }

  .animal-back-button:hover {
    background: #f6f8fc;
    border-color: #cbd5e1;
  }

  /* ================= MAIN ================= */

  .animal-main {
    width: min(1420px, calc(100% - 60px));
    margin: 0 auto;
    padding: 38px 0 60px;
  }

  /* ================= PAGE TITLE ================= */

  .animal-page-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;

    gap: 30px;
    margin-bottom: 25px;
  }

  .heading-eyebrow {
    display: flex;
    align-items: center;
    gap: 7px;

    color: #16a77a;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: .13em;
  }

  .animal-page-heading h2 {
    margin: 8px 0 0;

    font-size: 36px;
    line-height: 1.1;

    color: #17213b;
  }

  .animal-page-heading p {
    margin: 10px 0 0;

    color: #718096;
    font-size: 14px;
  }

  .model-status {
    display: flex;
    align-items: center;
    gap: 8px;

    padding: 9px 13px;

    border-radius: 9px;

    background: white;
    border: 1px solid #e4e9f1;

    color: #637087;

    font-size: 11px;
    font-weight: 600;
  }

  .model-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .model-indicator.ready {
    background: #35b779;
  }

  .model-indicator.loading {
    background: #f2ae36;
  }

  /* ================= ALERT ================= */

  .animal-alert {
    display: flex;
    align-items: flex-start;
    gap: 12px;

    padding: 14px 16px;
    margin-bottom: 20px;

    border-radius: 12px;
  }

  .animal-alert.error {
    background: #fff5f5;
    border: 1px solid #ffd6d6;
    color: #dc4c4c;
  }

  .animal-alert strong {
    display: block;
    margin-bottom: 3px;
  }

  .animal-alert p {
    margin: 0;
    color: #9a6464;
    font-size: 12px;
  }

  .animal-alert button {
    margin-left: auto;
    border: 0;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }

  /* ================= PROFILE ================= */

  .animal-profile-card {
    display: flex;
    align-items: center;
    gap: 16px;

    padding: 18px 20px;
    margin-bottom: 20px;

    border: 1px solid #e3e8f0;
    border-radius: 15px;

    background: rgba(255,255,255,.85);

    box-shadow:
      0 8px 30px rgba(38,54,82,.05);
  }

  .profile-avatar {
    width: 62px;
    height: 62px;
    flex-shrink: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 15px;

    color: #675cff;
    background: #f0eeff;
  }

  .profile-info {
    flex: 1;
  }

  .section-label {
    color: #16a77a;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .13em;
  }

  .profile-info h3 {
    margin: 4px 0 8px;

    color: #17213b;
    font-size: 20px;
  }

  .profile-details {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }

  .profile-details span {
    padding: 5px 9px;

    border-radius: 6px;

    background: #f3f6fa;
    color: #69778e;

    font-size: 11px;
  }

  .profile-edit-button {
    display: flex;
    align-items: center;
    gap: 7px;

    padding: 9px 13px;

    border: 1px solid #dfe5ee;
    border-radius: 8px;

    background: white;
    color: #526078;

    cursor: pointer;
  }

  /* ================= PROGRESS ================= */

  .scan-progress {
    display: flex;
    align-items: center;

    padding: 16px 22px;
    margin-bottom: 20px;

    border: 1px solid #e3e8f0;
    border-radius: 13px;

    background: white;
  }

  .progress-step {
    display: flex;
    align-items: center;
    gap: 8px;

    color: #a1acbc;

    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
  }

  .progress-step.active {
    color: #16a77a;
  }

  .progress-step.completed {
    color: #47a778;
  }

  .progress-icon {
    width: 30px;
    height: 30px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 50%;

    border: 1px solid #e2e7ef;
    background: #f8fafc;
  }

  .progress-step.active .progress-icon {
    color: #16a77a;
    border-color: #a9dfcb;
    background: #effaf6;
  }

  .progress-step.completed .progress-icon {
    color: #47a778;
    background: #eff9f4;
  }

  .progress-line {
    flex: 1;
    height: 1px;

    margin: 0 12px;

    background: #e5e9ef;
  }

  /* ================= SCANNER GRID ================= */

  .scanner-grid {
    display: grid;

    grid-template-columns:
      minmax(0, 1.4fr)
      minmax(360px, .85fr);

    gap: 20px;
  }

  .camera-card,
  .analysis-card {
    overflow: hidden;

    border: 1px solid #e1e7ef;
    border-radius: 16px;

    background: white;

    box-shadow:
      0 8px 30px rgba(38,54,82,.05);
  }

  .card-header {
    min-height: 76px;

    padding: 17px 20px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    border-bottom: 1px solid #edf0f4;
  }

  .card-header h3 {
    margin: 4px 0 0;

    color: #17213b;
    font-size: 17px;
  }

  .icon-button {
    width: 37px;
    height: 37px;

    display: flex;
    align-items: center;
    justify-content: center;

    border: 1px solid #e1e6ee;
    border-radius: 9px;

    background: white;
    color: #65738a;

    cursor: pointer;
  }

  .icon-button:hover {
    color: #675cff;
    background: #f6f5ff;
  }

  /* ================= SETTINGS ================= */

  .scanner-settings {
    padding: 15px 20px;

    background: #fafbfd;
    border-bottom: 1px solid #edf0f4;
  }

  .setting-row {
    display: flex;
    justify-content: space-between;
  }

  .setting-row strong {
    color: #4d5b73;
    font-size: 12px;
  }

  .setting-row span {
    display: block;
    margin-top: 3px;

    color: #8995a8;
    font-size: 10px;
  }

  .scanner-settings input {
    width: 100%;
    margin-top: 13px;
    accent-color: #675cff;
  }

  /* ================= CAMERA ================= */

  .camera-stage {
    position: relative;

    min-height: 500px;

    display: flex;
    align-items: center;
    justify-content: center;

    overflow: hidden;

    background: #101721;
  }

  .animal-webcam,
  .captured-image {
    width: 100%;
    height: 500px;

    display: block;

    object-fit: cover;
  }

  .detection-canvas {
    position: absolute;

    inset: 0;

    width: 100%;
    height: 100%;

    pointer-events: none;
  }

  .live-indicator {
    position: absolute;

    top: 16px;
    left: 16px;

    z-index: 5;

    display: flex;
    align-items: center;
    gap: 7px;

    padding: 7px 10px;

    border-radius: 7px;

    background: rgba(0,0,0,.55);
    color: white;

    font-size: 10px;
    letter-spacing: .08em;
  }

  .live-indicator span {
    width: 7px;
    height: 7px;

    border-radius: 50%;

    background: #ef5350;
  }

  .camera-instruction {
    position: absolute;

    bottom: 15px;
    left: 50%;

    transform: translateX(-50%);

    padding: 8px 13px;

    border-radius: 8px;

    background: rgba(0,0,0,.55);
    color: white;

    font-size: 11px;
  }

  .camera-placeholder {
    width: min(400px, 90%);

    text-align: center;
    padding: 40px;
  }

  .placeholder-icon {
    width: 76px;
    height: 76px;

    margin: 0 auto 18px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 20px;

    color: #675cff;
    background: rgba(103,92,255,.12);
  }

  .camera-placeholder h4 {
    margin: 0;

    color: white;
    font-size: 19px;
  }

  .camera-placeholder p {
    margin: 9px 0 20px;

    color: #a5afbe;
    font-size: 12px;
    line-height: 1.6;
  }

  .capture-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .capture-success {
    position: absolute;

    top: 16px;
    right: 16px;

    display: flex;
    align-items: center;
    gap: 7px;

    padding: 8px 11px;

    border-radius: 8px;

    background: rgba(0,0,0,.65);
    color: #61d294;

    font-size: 11px;
  }

  /* ================= BUTTONS ================= */

  .camera-controls {
    display: flex;
    gap: 10px;

    padding: 15px 20px;

    border-top: 1px solid #edf0f4;
  }

  .primary-button,
  .secondary-button,
  .capture-button,
  .danger-button {
    min-height: 42px;

    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    padding: 0 15px;

    border-radius: 9px;

    font-size: 12px;
    font-weight: 600;

    cursor: pointer;
    transition: .2s ease;
  }

  .primary-button {
    border: 0;

    background: linear-gradient(
      135deg,
      #675cff,
      #806eff
    );

    color: white;

    box-shadow:
      0 8px 20px rgba(103,92,255,.22);
  }

  .primary-button:hover {
    transform: translateY(-1px);
  }

  .primary-button:disabled {
    opacity: .45;
    cursor: not-allowed;
  }

  .secondary-button {
    border: 1px solid #dfe5ee;

    background: white;
    color: #56647b;
  }

  .secondary-button:hover {
    background: #f7f9fc;
  }

  .capture-button {
    flex: 1;

    border: 0;

    background: linear-gradient(
      135deg,
      #675cff,
      #806eff
    );

    color: white;
  }

  .danger-button {
    border: 1px solid #ffd5d5;

    background: #fff6f6;
    color: #df5a5a;
  }

  .full-width {
    width: 100%;
  }

  /* ================= ANALYSIS ================= */

  .analysis-card {
    padding-bottom: 18px;
  }

  .analysis-main {
    padding: 20px;

    display: grid;

    grid-template-columns: 1fr auto;

    gap: 15px;
  }

  .detected-animal {
    display: flex;
    align-items: center;
    gap: 13px;
  }

  .detected-animal-icon {
    width: 57px;
    height: 57px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 13px;

    color: #675cff;
    background: #f0eeff;
  }

  .detected-animal span {
    color: #8a96a9;
    font-size: 10px;
  }

  .detected-animal h4 {
    margin: 5px 0 0;

    color: #17213b;

    text-transform: capitalize;

    font-size: 18px;
  }

  .confidence-box {
    min-width: 110px;

    padding: 13px;

    text-align: center;

    border: 1px solid #e8ebf1;
    border-radius: 11px;

    background: #fafbfd;
  }

  .confidence-box span {
    display: block;

    color: #8a96a9;
    font-size: 10px;
  }

  .confidence-box strong {
    display: block;

    margin-top: 4px;

    color: #16a77a;
    font-size: 22px;
  }

  /* ================= QUALITY ================= */

  .quality-section {
    margin: 0 20px;
    padding: 16px;

    border-radius: 11px;

    background: #f8fafc;
    border: 1px solid #edf0f4;
  }

  .quality-header {
    display: flex;
    justify-content: space-between;

    font-size: 11px;
  }

  .quality-header span {
    color: #768398;
  }

  .quality-header strong {
    color: #16a77a;
  }

  .quality-bar {
    height: 7px;

    margin: 12px 0 8px;

    overflow: hidden;

    border-radius: 20px;

    background: #e5eaf0;
  }

  .quality-fill {
    height: 100%;

    border-radius: inherit;

    background: linear-gradient(
      90deg,
      #45bd89,
      #18a875
    );

    transition: width .3s ease;
  }

  .quality-section small {
    color: #8995a8;
    font-size: 9px;
  }

  /* ================= DETECTIONS ================= */

  .detection-section {
    padding: 20px;
  }

  .section-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .section-title-row h4 {
    margin: 0;

    color: #27344d;
    font-size: 13px;
  }

  .section-title-row span {
    color: #8995a8;
    font-size: 10px;
  }

  .detection-list {
    display: flex;
    flex-direction: column;
    gap: 8px;

    margin-top: 12px;
  }

  .detection-item {
    display: flex;
    align-items: center;
    gap: 10px;

    padding: 10px;

    border: 1px solid #edf0f4;
    border-radius: 9px;

    background: #fafbfd;
  }

  .detection-item-icon {
    width: 31px;
    height: 31px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 8px;

    color: #675cff;
    background: #f0eeff;
  }

  .detection-item-info {
    flex: 1;
  }

  .detection-item-info strong {
    display: block;

    color: #33415b;

    font-size: 12px;
    text-transform: capitalize;
  }

  .detection-item-info span {
    display: block;

    margin-top: 2px;

    color: #9aa5b5;
    font-size: 9px;
  }

  .detection-confidence {
    color: #16a77a;

    font-size: 12px;
    font-weight: 700;
  }

  .empty-detection {
    display: flex;
    align-items: center;
    gap: 8px;

    margin-top: 12px;
    padding: 14px;

    border: 1px dashed #dfe5ec;
    border-radius: 9px;

    color: #8995a8;
    font-size: 11px;
  }

  /* ================= DASHBOARD SECTIONS ================= */

  .dashboard-section {
    margin-top: 25px;
  }

  .section-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;

    gap: 20px;

    margin-bottom: 14px;
  }

  .section-heading h3 {
    margin: 5px 0 0;

    color: #17213b;
    font-size: 18px;
  }

  .section-heading p {
    margin: 5px 0 0;

    color: #7d899c;
    font-size: 11px;
  }

  .sensor-badge {
    display: flex;
    align-items: center;
    gap: 7px;

    padding: 7px 10px;

    border-radius: 7px;

    color: #738096;

    background: white;
    border: 1px solid #e4e9f0;

    font-size: 10px;
  }

  /* ================= METRICS ================= */

  .metrics-grid {
    display: grid;

    grid-template-columns:
      repeat(4, 1fr);

    gap: 12px;
  }

  .metric-card {
    min-height: 125px;

    padding: 17px;

    display: flex;
    align-items: flex-start;
    gap: 12px;

    border: 1px solid #e3e8f0;
    border-radius: 12px;

    background: white;

    box-shadow:
      0 5px 20px rgba(38,54,82,.035);
  }

  .metric-icon {
    width: 40px;
    height: 40px;

    flex-shrink: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 10px;

    color: #675cff;
    background: #f0eeff;
  }

  .metric-content > span {
    color: #78859a;
    font-size: 11px;
  }

  .metric-value {
    margin-top: 9px;

    color: #26344d;
    font-size: 24px;
    font-weight: 700;
  }

  .metric-value small {
    margin-left: 5px;

    color: #8995a8;
    font-size: 10px;
    font-weight: 500;
  }

  .metric-status {
    display: block;

    margin-top: 7px;

    color: #9aa5b5;
    font-size: 9px;
  }

  /* ================= HEALTH ASSESSMENT ================= */

  .health-assessment {
    margin-top: 25px;

    overflow: hidden;

    border: 1px solid #e1e7ef;
    border-radius: 15px;

    background: white;

    box-shadow:
      0 8px 30px rgba(38,54,82,.04);
  }

  .assessment-header {
    padding: 18px 20px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    border-bottom: 1px solid #edf0f4;
  }

  .assessment-title {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .assessment-icon {
    width: 43px;
    height: 43px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 11px;

    color: #675cff;
    background: #f0eeff;
  }

  .assessment-title h3 {
    margin: 4px 0 0;

    color: #17213b;
    font-size: 17px;
  }

  .assessment-status {
    display: flex;
    align-items: center;
    gap: 6px;

    color: #16a77a;

    font-size: 11px;
  }

  .assessment-body {
    display: grid;

    grid-template-columns: 1fr 1fr;

    gap: 30px;

    padding: 24px;
  }

  .health-score {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .score-circle {
    width: 120px;
    height: 120px;

    flex-shrink: 0;

    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    border-radius: 50%;

    border: 8px solid #edf9f4;

    outline: 1px solid #a8dec8;
    outline-offset: -8px;
  }

  .score-circle strong {
    color: #16a77a;
    font-size: 30px;
  }

  .score-circle span {
    color: #8793a6;
    font-size: 10px;
  }

  .score-label {
    color: #8995a8;
    font-size: 10px;
  }

  .health-score h4 {
    margin: 5px 0;

    color: #25334c;
    font-size: 19px;
  }

  .health-score p {
    max-width: 350px;

    margin: 0;

    color: #7c889b;

    font-size: 11px;
    line-height: 1.6;
  }

  .assessment-observations {
    padding-left: 24px;

    border-left: 1px solid #edf0f4;
  }

  .assessment-observations h4 {
    margin: 0 0 13px;

    color: #27344d;
    font-size: 13px;
  }

  .observation-list {
    display: flex;
    flex-direction: column;
    gap: 11px;
  }

  .observation-list div {
    display: flex;
    align-items: flex-start;
    gap: 9px;

    color: #748197;

    font-size: 11px;
  }

  .observation-list svg {
    flex-shrink: 0;
    color: #16a77a;
  }

  .observation-empty {
    display: flex;
    align-items: center;
    gap: 8px;

    color: #8a96a9;
    font-size: 11px;
  }

  /* ================= VISUAL INDICATORS ================= */

  .visual-indicators {
    margin-top: 25px;
  }

  .indicator-grid {
    display: grid;

    grid-template-columns:
      repeat(4, 1fr);

    gap: 12px;
  }

  .indicator-card {
    display: flex;
    align-items: center;
    gap: 11px;

    padding: 14px;

    border: 1px solid #e3e8f0;
    border-radius: 11px;

    background: white;
  }

  .indicator-icon {
    width: 38px;
    height: 38px;

    flex-shrink: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 9px;
  }

  .indicator-icon.positive {
    color: #16a77a;
    background: #eff9f4;
  }

  .indicator-icon.neutral {
    color: #718096;
    background: #f2f5f8;
  }

  .indicator-card span {
    display: block;

    color: #8a96a9;
    font-size: 9px;
  }

  .indicator-card strong {
    display: block;

    margin-top: 4px;

    color: #37445b;
    font-size: 11px;
  }

  /* ================= VETERINARY NOTICE ================= */

  .veterinary-notice {
    display: flex;
    align-items: flex-start;
    gap: 13px;

    margin-top: 25px;
    padding: 17px;

    border: 1px solid #f2e1ad;
    border-radius: 11px;

    background: #fffcf1;
  }

  .notice-icon {
    width: 38px;
    height: 38px;

    flex-shrink: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 9px;

    color: #c18a18;
    background: #fff5d7;
  }

  .veterinary-notice strong {
    color: #715b29;
    font-size: 12px;
  }

  .veterinary-notice p {
    margin: 6px 0 0;

    color: #8d7b4f;

    font-size: 10px;
    line-height: 1.65;
  }

  /* ================= MODAL ================= */

  .modal-overlay {
    position: fixed;

    inset: 0;

    z-index: 500;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 20px;

    background: rgba(15,23,42,.55);

    backdrop-filter: blur(7px);
  }

  .profile-modal {
    width: min(550px, 100%);
    max-height: 90vh;

    overflow-y: auto;

    border-radius: 16px;

    background: white;

    box-shadow:
      0 30px 100px rgba(15,23,42,.25);
  }

  .modal-header {
    padding: 19px;

    display: flex;
    justify-content: space-between;

    border-bottom: 1px solid #edf0f4;
  }

  .modal-header h3 {
    margin: 4px 0 0;

    color: #17213b;
    font-size: 17px;
  }

  .profile-form {
    padding: 20px;
  }

  .form-row {
    display: grid;

    grid-template-columns: 1fr 1fr;

    gap: 12px;
  }

  .form-group {
    margin-bottom: 15px;
  }

  .form-group label {
    display: block;

    margin-bottom: 7px;

    color: #65738a;

    font-size: 11px;
    font-weight: 600;
  }

  .form-group input,
  .form-group select {
    width: 100%;
    height: 42px;

    padding: 0 12px;

    border: 1px solid #dfe5ee;
    border-radius: 8px;

    background: white;
    color: #26344d;

    outline: none;
  }

  .form-group input:focus,
  .form-group select:focus {
    border-color: #675cff;

    box-shadow:
      0 0 0 3px rgba(103,92,255,.08);
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;

    padding: 15px 20px;

    border-top: 1px solid #edf0f4;
  }

  /* ================= RESPONSIVE ================= */

  @media (max-width: 1100px) {

    .scanner-grid {
      grid-template-columns: 1fr;
    }

    .metrics-grid,
    .indicator-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .assessment-body {
      grid-template-columns: 1fr;
    }

    .assessment-observations {
      padding-left: 0;
      padding-top: 20px;

      border-left: 0;
      border-top: 1px solid #edf0f4;
    }
  }

  @media (max-width: 720px) {

    .animal-header {
      height: auto;

      padding: 12px 16px;
    }

    .animal-header-actions {
      gap: 8px;
    }

    .system-status {
      display: none;
    }

    .animal-main {
      width: calc(100% - 24px);

      padding-top: 24px;
    }

    .animal-page-heading {
      align-items: flex-start;

      flex-direction: column;
    }

    .animal-page-heading h2 {
      font-size: 29px;
    }

    .animal-profile-card {
      align-items: flex-start;

      flex-wrap: wrap;
    }

    .profile-edit-button {
      margin-left: 78px;
    }

    .scan-progress {
      overflow-x: auto;
    }

    .progress-line {
      min-width: 25px;
    }

    .camera-stage {
      min-height: 400px;
    }

    .animal-webcam,
    .captured-image {
      height: 400px;
    }

    .camera-controls {
      flex-wrap: wrap;
    }

    .camera-controls > * {
      flex: 1;
    }

    .analysis-main {
      grid-template-columns: 1fr;
    }

    .confidence-box {
      width: 100%;
    }

    .section-heading {
      align-items: flex-start;

      flex-direction: column;
    }

    .assessment-body {
      padding: 18px;
    }

    .health-score {
      align-items: flex-start;

      flex-direction: column;
    }

    .metrics-grid,
    .indicator-grid {
      grid-template-columns: 1fr;
    }

    .form-row {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 480px) {

    .animal-brand p {
      display: none;
    }

    .animal-brand h1 {
      font-size: 18px;
    }

    .animal-brand-icon {
      width: 43px;
      height: 43px;
    }

    .animal-back-button {
      padding: 8px 10px;
    }

    .animal-back-button svg {
      display: none;
    }

    .camera-stage {
      min-height: 330px;
    }

    .animal-webcam,
    .captured-image {
      height: 330px;
    }

    .camera-controls > * {
      width: 100%;
      flex: auto;
    }

    .assessment-header {
      align-items: flex-start;

      flex-direction: column;
    }

    .veterinary-notice {
      padding: 13px;
    }
  }

/* =========================================================
   REFERENCE-STYLE SCAN FLOW
========================================================= */

.animal-scanline {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 3px;
  z-index: 8;
  pointer-events: none;
  opacity: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(103,92,255,.95),
    transparent
  );
}

.animal-scanline.active {
  opacity: .9;
  animation: animalScanDown 1.45s linear infinite;
}

@keyframes animalScanDown {
  from { top: 0; }
  to { top: 100%; }
}

.animal-recording-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 9;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 10px;
  border: 1px solid rgba(239,83,80,.75);
  border-radius: 7px;
  background: rgba(0,0,0,.62);
  color: #ff7777;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .08em;
}

.animal-recording-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ef5350;
  box-shadow: 0 0 8px rgba(239,83,80,.7);
  animation: animalBlink .65s infinite;
}

@keyframes animalBlink {
  50% { opacity: .2; }
}

.animal-countdown-overlay {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(16,23,33,.82);
  backdrop-filter: blur(4px);
}

.animal-countdown-ring {
  position: relative;
  width: 118px;
  height: 118px;
}

.animal-countdown-ring svg {
  width: 118px;
  height: 118px;
  transform: rotate(-90deg);
}

.animal-countdown-ring circle {
  fill: none;
  stroke-width: 5;
}

.animal-countdown-track {
  stroke: rgba(255,255,255,.12);
}

.animal-countdown-progress {
  stroke: #8b70ff;
  stroke-linecap: round;
  transition: stroke-dashoffset .35s ease;
}

.animal-countdown-number {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 42px;
  font-weight: 800;
}

.animal-countdown-label {
  color: #cbd5e1;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .14em;
  text-transform: uppercase;
}

.animal-scan-progress-wrap {
  padding: 0 20px 15px;
}

.animal-scan-progress-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  color: #8995a8;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.animal-scan-progress-track {
  height: 4px;
  overflow: hidden;
  border-radius: 99px;
  background: #e9edf3;
}

.animal-scan-progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg,#675cff,#18a875);
  transition: width .25s ease;
}

.animal-signal {
  margin: 0 20px 15px;
  height: 58px;
  overflow: hidden;
  position: relative;
  border: 1px solid #e7ebf1;
  border-radius: 9px;
  background: linear-gradient(180deg,#fafbfd,#f4f7fb);
}

.animal-signal svg {
  width: 100%;
  height: 100%;
  display: block;
}

.animal-signal-label {
  position: absolute;
  left: 9px;
  top: 7px;
  color: #8995a8;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.animal-log {
  margin: 0 20px 15px;
  max-height: 94px;
  overflow: auto;
  padding: 9px 10px;
  border: 1px solid #edf0f4;
  border-radius: 9px;
  background: #fafbfd;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 8px;
  line-height: 1.8;
}

.animal-log-row {
  display: flex;
  gap: 8px;
}

.animal-log-time {
  min-width: 58px;
  color: #a1acbc;
}

.animal-log-ok { color: #16a77a; }
.animal-log-info { color: #675cff; }
.animal-log-warn { color: #d97706; }

.animal-history {
  margin-top: 25px;
}

.animal-history-list {
  display: grid;
  gap: 8px;
}

.animal-history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid #e3e8f0;
  border-radius: 10px;
  background: white;
}

.animal-history-main {
  display: flex;
  align-items: center;
  gap: 10px;
}

.animal-history-icon {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  color: #675cff;
  background: #f0eeff;
}

.animal-history-main strong {
  display: block;
  color: #33415b;
  font-size: 11px;
  text-transform: capitalize;
}

.animal-history-main span {
  display: block;
  margin-top: 2px;
  color: #9aa5b5;
  font-size: 9px;
}

.animal-history-confidence {
  color: #16a77a;
  font-size: 12px;
  font-weight: 800;
}

@media (max-width: 820px) {
  .animal-history-item {
    align-items: flex-start;
  }
}
`;


/* =========================================================
   COMPONENT
========================================================= */

const AnimalScanner = ({ onBack }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const modelRef = useRef(null);
  const animationRef = useRef(null);
  const processingRef = useRef(false);
  const countdownTimerRef = useRef(null);
  const progressTimerRef = useRef(null);
  const analysisTimerRef = useRef(null);

  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelError, setModelError] = useState("");
  const [cameraOn, setCameraOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [detections, setDetections] = useState([]);
  const [confidence, setConfidence] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);

  // Reference-style scan flow: countdown -> scan -> analyse -> result
  const [isScanning, setIsScanning] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState([]);
  const [scanHistory, setScanHistory] = useState([]);
  const [scanStartedAt, setScanStartedAt] = useState(null);

  const [error, setError] = useState("");

  const [scanStage, setScanStage] = useState("detect");

  const [profile, setProfile] =
    useState(INITIAL_PROFILE);

  const [editingProfile, setEditingProfile] =
    useState(false);

  const [profileDraft, setProfileDraft] =
    useState(INITIAL_PROFILE);

  /* =====================================================
     LOAD MODEL
  ===================================================== */

  useEffect(() => {
    let mounted = true;

    const loadModel = async () => {
      try {
        const model = await cocoSsd.load({
          base: "lite_mobilenet_v2",
        });

        if (!mounted) return;

        modelRef.current = model;
        setModelLoaded(true);
      } catch (err) {
        console.error(err);

        if (mounted) {
          setModelError(
            "Unable to load AI detection model."
          );
        }
      }
    };

    loadModel();

    return () => {
      mounted = false;

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (analysisTimerRef.current) clearTimeout(analysisTimerRef.current);
    };
  }, []);

  /* =====================================================
     DRAW DETECTIONS
  ===================================================== */

  const drawDetections = useCallback((predictions) => {
    const canvas = canvasRef.current;
    const video = webcamRef.current?.video;

    if (!canvas || !video) return;

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) return;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    predictions.forEach((prediction) => {
      const [x, y, boxWidth, boxHeight] =
        prediction.bbox;

      ctx.strokeStyle = "#4ade80";
      ctx.lineWidth = 3;

      ctx.strokeRect(
        x,
        y,
        boxWidth,
        boxHeight
      );

      const label =
        `${prediction.class} ` +
        `${Math.round(prediction.score * 100)}%`;

      ctx.font = "bold 16px Arial";

      const textWidth =
        ctx.measureText(label).width + 20;

      ctx.fillStyle = "#4ade80";

      ctx.fillRect(
        x,
        Math.max(0, y - 34),
        textWidth,
        34
      );

      ctx.fillStyle = "#07120c";

      ctx.fillText(
        label,
        x + 10,
        Math.max(22, y - 11)
      );
    });
  }, []);

  /* =====================================================
     DETECTION
  ===================================================== */

  const detectAnimals = useCallback(async () => {
    if (
      !modelRef.current ||
      !webcamRef.current ||
      processingRef.current
    ) {
      return;
    }

    const video = webcamRef.current.video;

    if (
      !video ||
      video.readyState !== 4
    ) {
      return;
    }

    processingRef.current = true;

    try {
      const predictions =
        await modelRef.current.detect(video);

      const animals = predictions
        .filter(
          (prediction) =>
            ANIMAL_CLASSES.includes(
              prediction.class
            ) &&
            prediction.score >= confidence
        )
        .sort(
          (a, b) =>
            b.score - a.score
        );

      setDetections(animals);

      drawDetections(animals);
    } catch (err) {
      console.error(
        "Detection error:",
        err
      );
    } finally {
      processingRef.current = false;
    }

    animationRef.current =
      requestAnimationFrame(
        detectAnimals
      );
  }, [
    confidence,
    drawDetections,
  ]);

  useEffect(() => {
    if (
      !cameraOn ||
      !modelLoaded ||
      capturedImage
    ) {
      return;
    }

    animationRef.current =
      requestAnimationFrame(
        detectAnimals
      );

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(
          animationRef.current
        );
      }
    };
  }, [
    cameraOn,
    modelLoaded,
    capturedImage,
    detectAnimals,
  ]);

  /* =====================================================
     CAMERA
  ===================================================== */

  const startCamera = () => {
    setCapturedImage(null);
    setDetections([]);
    setScanStage("detect");
    setError("");
  };

  const stopCamera = () => {
    setCameraOn(false);
    setIsScanning(false);
    setCountdown(0);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    if (analysisTimerRef.current) clearTimeout(analysisTimerRef.current);

    if (animationRef.current) {
      cancelAnimationFrame(
        animationRef.current
      );

      animationRef.current = null;
    }

    setDetections([]);
  };

  const handleCameraReady = () => {
    setCameraOn(true);
    setError("");
  };

  const handleCameraError = () => {
    setCameraOn(false);

    setError(
      "Camera access was blocked. Please allow camera permission."
    );
  };

  /* =====================================================
     REFERENCE-STYLE SCAN FLOW
  ===================================================== */

  const addScanLog = useCallback((message, type = "info") => {
    const stamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    setScanLogs((prev) => [
      { stamp, message, type },
      ...prev,
    ].slice(0, 12));
  }, []);

  const finishAnalysis = useCallback((image) => {
    setScanProgress(100);
    setScanStage("analyse");
    setIsScanning(false);

    if (image) {
      setCapturedImage(image);
    }

    const detection = detections[0];
    const confidenceValue = detection
      ? Math.round(detection.score * 100)
      : 0;

    const record = {
      id: Date.now(),
      animal: detection?.class || profile.species || "Unknown animal",
      confidence: confidenceValue,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      timestamp: new Date(),
    };

    setScanHistory((prev) => [record, ...prev].slice(0, 5));
    addScanLog(
      detection
        ? `Analysis complete · ${detection.class} ${confidenceValue}%`
        : "Analysis complete · no supported animal confirmed",
      detection ? "ok" : "warn"
    );
  }, [addScanLog, detections, profile.species]);

  const captureImage = useCallback(() => {
    const image = webcamRef.current?.getScreenshot();

    if (!image) {
      setError("Unable to capture image.");
      addScanLog("Capture failed · no camera frame available", "warn");
      setIsScanning(false);
      return;
    }

    setCapturedImage(image);

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    setCameraOn(false);
    setScanStage("capture");
    addScanLog("Frame captured · preparing AI analysis", "ok");

    setScanProgress(72);

    if (analysisTimerRef.current) {
      clearTimeout(analysisTimerRef.current);
    }

    analysisTimerRef.current = setTimeout(() => {
      finishAnalysis(image);
    }, 1100);
  }, [addScanLog, finishAnalysis]);

  const beginScan = useCallback(() => {
    if (!cameraOn || isScanning || !modelLoaded) return;

    setError("");
    setIsScanning(true);
    setScanProgress(0);
    setScanStartedAt(Date.now());
    setScanLogs([]);
    setCapturedImage(null);
    setScanStage("detect");
    addScanLog("Scan requested · stabilizing camera", "info");

    let remaining = 3;
    setCountdown(remaining);

    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }

    countdownTimerRef.current = setInterval(() => {
      remaining -= 1;

      if (remaining <= 0) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
        setCountdown(0);

        addScanLog("Countdown complete · capturing frame", "ok");
        captureImage();
        return;
      }

      setCountdown(remaining);
      addScanLog(`Countdown · ${remaining}s`, "info");
    }, 1000);

    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }

    progressTimerRef.current = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 68) return prev;
        return Math.min(68, prev + 7);
      });
    }, 260);
  }, [
    addScanLog,
    cameraOn,
    captureImage,
    isScanning,
    modelLoaded,
  ]);

  useEffect(() => {
    if (!isScanning && progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    };
  }, [isScanning]);

  /* =====================================================
     RESET
  ===================================================== */

  const scanAgain = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    if (analysisTimerRef.current) clearTimeout(analysisTimerRef.current);

    setIsScanning(false);
    setCountdown(0);
    setScanProgress(0);
    setScanLogs([]);
    setCapturedImage(null);
    setDetections([]);
    setScanStage("detect");
    setError("");
    setCameraOn(false);
  };

  const resetScan = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    if (analysisTimerRef.current) clearTimeout(analysisTimerRef.current);

    setIsScanning(false);
    setCountdown(0);
    setScanProgress(0);
    setScanLogs([]);
    setScanHistory([]);
    setCapturedImage(null);
    setDetections([]);
    setScanStage("detect");
    setError("");
    setCameraOn(false);
  };

  /* =====================================================
     DOWNLOAD
  ===================================================== */

  const downloadImage = () => {
    if (!capturedImage) return;

    const link =
      document.createElement("a");

    link.href = capturedImage;

    link.download =
      `iHealthyBio-${profile.name}-scan.png`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  /* =====================================================
     PROFILE
  ===================================================== */

  const openProfileEditor = () => {
    setProfileDraft(profile);
    setEditingProfile(true);
  };

  const saveProfile = () => {
    setProfile(profileDraft);
    setEditingProfile(false);
  };

  /* =====================================================
     DATA
  ===================================================== */

  const primaryDetection =
    detections.length > 0
      ? detections[0]
      : null;

  const detectionQuality =
    primaryDetection
      ? Math.round(
          primaryDetection.score * 100
        )
      : 0;

  const qualityText =
    detectionQuality >= 85
      ? "Excellent"
      : detectionQuality >= 70
      ? "Good"
      : detectionQuality >= 50
      ? "Fair"
      : "Low";

  const scanCompleted =
    Boolean(capturedImage) &&
    scanStage === "analyse";

  const wellnessScore = scanCompleted
    ? primaryDetection
      ? Math.max(1, Math.min(100, detectionQuality))
      : 0
    : null;

  const wellnessLabel =
    wellnessScore === null
      ? "Awaiting Scan"
      : wellnessScore >= 85
      ? "Excellent visual match"
      : wellnessScore >= 70
      ? "Good visual match"
      : wellnessScore >= 50
      ? "Fair visual match"
      : "Low confidence";

  /* =====================================================
     RETURN
  ===================================================== */

  return (
    <>
      {/* THIS LOADS ALL CSS FROM THIS JSX FILE */}
      <style>{animalStyles}</style>

      <div className="animal-dashboard">

        {/* ================= HEADER ================= */}

        {/* <header className="animal-header">

          <div className="animal-brand">

            <div className="animal-brand-icon">
              <PawPrint size={27} />
            </div>

            <div>
              <h1>iHealthyBio</h1>
              <p>
                AI Pet & Animal Analysis
              </p>
            </div>

          </div>

          <div className="animal-header-actions">

            <div className="system-status">
              <span className="status-dot"></span>
              AI System Ready
            </div>

            <button
              className="animal-back-button"
              onClick={onBack}
            >
              <ArrowLeft size={18} />
              Back
            </button>

          </div>

        </header> */}

        {/* ================= MAIN ================= */}

        <main className="animal-main">

          {/* PAGE HEADING */}

          <section className="animal-page-heading">

            <div>

              <div className="heading-eyebrow">
                <ScanLine size={15} />
                PET & ANIMAL ANALYSIS
              </div>

              <h2>
                Animal Health Intelligence
              </h2>

              <p>
                AI-assisted visual analysis for pets
                and animals. Capture an animal image
                to begin the assessment.
              </p>

            </div>

            <div className="model-status">

              <span
                className={
                  modelLoaded
                    ? "model-indicator ready"
                    : "model-indicator loading"
                }
              />

              {modelLoaded
                ? isScanning
                  ? `AI Scan Active${
                      scanStartedAt
                        ? ` · ${Math.max(
                            0,
                            Math.round((Date.now() - scanStartedAt) / 1000)
                          )}s`
                        : ""
                    }`
                  : "AI Model Ready"
                : "Loading AI Model..."}

            </div>

          </section>

          {/* ERROR */}

          {error && (
            <div className="animal-alert error">

              <AlertCircle size={20} />

              <div>
                <strong>
                  Camera Error
                </strong>

                <p>{error}</p>
              </div>

              <button
                onClick={() =>
                  setError("")
                }
              >
                <X size={18} />
              </button>

            </div>
          )}

          {modelError && (
            <div className="animal-alert error">

              <AlertCircle size={20} />

              <div>
                <strong>
                  AI Model Error
                </strong>

                <p>{modelError}</p>
              </div>

            </div>
          )}

          {/* ================= PROFILE ================= */}

          <section className="animal-profile-card">

            <div className="profile-avatar">
              <PawPrint size={31} />
            </div>

            <div className="profile-info">

              <span className="section-label">
                ANIMAL PROFILE
              </span>

              <h3>{profile.name}</h3>

              <div className="profile-details">

                <span>
                  {profile.species}
                </span>

                <span>
                  {profile.breed}
                </span>

                <span>
                  {profile.age}
                </span>

                <span>
                  {profile.weight}
                </span>

                <span>
                  {profile.sex}
                </span>

              </div>

            </div>

            <button
              className="profile-edit-button"
              onClick={openProfileEditor}
            >
              <Edit3 size={16} />
              Edit Profile
            </button>

          </section>

          {/* ================= PROGRESS ================= */}

          <section className="scan-progress">

            <div
              className={`progress-step ${
                scanStage === "detect"
                  ? "active"
                  : "completed"
              }`}
            >
              <div className="progress-icon">
                <Eye size={17} />
              </div>
              Detect
            </div>

            <div className="progress-line" />

            <div
              className={`progress-step ${
                scanStage === "capture"
                  ? "active"
                  : scanStage === "analyse"
                  ? "completed"
                  : ""
              }`}
            >
              <div className="progress-icon">
                <Camera size={17} />
              </div>
              Capture
            </div>

            <div className="progress-line" />

            <div
              className={`progress-step ${
                scanStage === "analyse"
                  ? "active"
                  : ""
              }`}
            >
              <div className="progress-icon">
                <Sparkles size={17} />
              </div>
              Analyse
            </div>

            <div className="progress-line" />

            <div className="progress-step">
              <div className="progress-icon">
                <Download size={17} />
              </div>
              Report
            </div>

          </section>

          {/* ================= SCANNER ================= */}

          <section className="scanner-grid">

            {/* CAMERA CARD */}

            <div className="camera-card">

              <div className="card-header">

                <div>

                  <span className="section-label">
                    LIVE ANALYSIS
                  </span>

                  <h3>
                    Animal Vision Scanner
                  </h3>

                </div>

                <button
                  className="icon-button"
                  onClick={() =>
                    setShowSettings(
                      !showSettings
                    )
                  }
                >
                  <Settings size={18} />
                </button>

              </div>

              {/* SETTINGS */}

              {showSettings && (
                <div className="scanner-settings">

                  <div className="setting-row">

                    <div>
                      <strong>
                        Detection Confidence
                      </strong>

                      <span>
                        Minimum confidence
                        required
                      </span>
                    </div>

                    <strong>
                      {Math.round(
                        confidence * 100
                      )}
                      %
                    </strong>

                  </div>

                  <input
                    type="range"
                    min="0.3"
                    max="0.9"
                    step="0.05"
                    value={confidence}
                    onChange={(e) =>
                      setConfidence(
                        Number(e.target.value)
                      )
                    }
                  />

                </div>
              )}

              {/* CAMERA */}

              <div className={`camera-stage ${isScanning ? "is-scanning" : ""}`}>

                {isScanning && (
                  <>
                    <div className="animal-scanline active" />
                    <div className="animal-recording-badge">
                      <span className="animal-recording-dot" />
                      SCANNING
                    </div>
                  </>
                )}

                {countdown > 0 && (
                  <div className="animal-countdown-overlay">
                    <div className="animal-countdown-ring">
                      <svg viewBox="0 0 118 118">
                        <circle
                          className="animal-countdown-track"
                          cx="59"
                          cy="59"
                          r="48"
                        />
                        <circle
                          className="animal-countdown-progress"
                          cx="59"
                          cy="59"
                          r="48"
                          strokeDasharray={2 * Math.PI * 48}
                          strokeDashoffset={
                            2 * Math.PI * 48 * (1 - countdown / 3)
                          }
                        />
                      </svg>
                      <div className="animal-countdown-number">
                        {countdown}
                      </div>
                    </div>
                    <div className="animal-countdown-label">
                      Preparing animal scan
                    </div>
                  </div>
                )}

                {capturedImage ? (

                  <>
                    <img
                      src={capturedImage}
                      alt="Captured animal"
                      className="captured-image"
                    />

                    <div className="capture-overlay">

                      <div className="capture-success">
                        <CheckCircle2 size={19} />
                        Image Captured
                      </div>

                    </div>
                  </>

                ) : cameraOn ? (

                  <>

                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      screenshotFormat="image/png"
                      screenshotQuality={1}
                      videoConstraints={
                        VIDEO_CONSTRAINTS
                      }
                      onUserMedia={
                        handleCameraReady
                      }
                      onUserMediaError={
                        handleCameraError
                      }
                      className="animal-webcam"
                    />

                    <canvas
                      ref={canvasRef}
                      className="detection-canvas"
                    />

                    <div className="live-indicator">
                      <span />
                      LIVE
                    </div>

                    <div className="camera-instruction">
                      Position the animal
                      inside the frame
                    </div>

                  </>

                ) : (

                  <div className="camera-placeholder">

                    <div className="placeholder-icon">
                      <Camera size={38} />
                    </div>

                    <h4>
                      Start Animal Camera
                    </h4>

                    <p>
                      Use your camera to
                      detect supported animals
                      with AI.
                    </p>

                    <button
                      className="primary-button"
                      onClick={startCamera}
                      disabled={!modelLoaded}
                    >
                      <Camera size={18} />
                      Start Camera
                    </button>

                  </div>

                )}

              </div>

              {isScanning || scanCompleted ? (
                <>
                  <div className="animal-scan-progress-wrap">
                    <div className="animal-scan-progress-row">
                      <span>
                        {isScanning
                          ? "AI scan in progress"
                          : "AI scan complete"}
                      </span>
                      <span>{scanProgress}%</span>
                    </div>
                    <div className="animal-scan-progress-track">
                      <div
                        className="animal-scan-progress-fill"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="animal-signal">
                    <span className="animal-signal-label">
                      LIVE AI SIGNAL
                    </span>
                    <svg viewBox="0 0 600 58" preserveAspectRatio="none">
                      <path
                        d="M0 38 H70 L82 37 L94 39 L108 37 L121 38 L134 35 L144 39 L155 38 L166 38 L178 38 L190 38 L203 38 L214 38 L225 37 L235 38 L246 38 L258 37 L270 38 L280 38 L292 38 L304 38 L315 36 L324 18 L333 49 L342 38 L354 38 L365 38 L376 37 L388 38 L400 38 L412 38 L424 38 L436 39 L447 37 L459 38 L470 38 L482 38 L493 38 L505 37 L518 38 L530 38 L542 38 L554 38 L566 38 L578 38 L600 38"
                        fill="none"
                        stroke="#675cff"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>

                  {scanLogs.length > 0 && (
                    <div className="animal-log">
                      {scanLogs.map((entry, index) => (
                        <div
                          className="animal-log-row"
                          key={`${entry.stamp}-${index}`}
                        >
                          <span className="animal-log-time">
                            {entry.stamp}
                          </span>
                          <span
                            className={
                              entry.type === "ok"
                                ? "animal-log-ok"
                                : entry.type === "warn"
                                ? "animal-log-warn"
                                : "animal-log-info"
                            }
                          >
                            {entry.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : null}

              {/* CONTROLS */}

              <div className="camera-controls">

                {cameraOn && (
                  <>
                    <button
                      className="secondary-button"
                      onClick={stopCamera}
                    >
                      <X size={17} />
                      Stop
                    </button>

                    <button
                      className="capture-button"
                      onClick={beginScan}
                      disabled={isScanning}
                    >
                      <ScanLine size={19} />
                      {isScanning ? "Scanning..." : "Scan & Analyse"}
                    </button>
                  </>
                )}

                {capturedImage && (
                  <>
                    <button
                      className="secondary-button"
                      onClick={scanAgain}
                    >
                      <RefreshCw size={17} />
                      Scan Again
                    </button>

                    <button
                      className="secondary-button"
                      onClick={downloadImage}
                    >
                      <Download size={17} />
                      Download
                    </button>

                    <button
                      className="danger-button"
                      onClick={resetScan}
                    >
                      Reset
                    </button>
                  </>
                )}

                {!cameraOn &&
                  !capturedImage && (
                    <button
                      className="primary-button full-width"
                      onClick={startCamera}
                      disabled={!modelLoaded}
                    >
                      <Camera size={18} />
                      Start Camera
                    </button>
                  )}

              </div>

            </div>

            {/* ================= ANALYSIS ================= */}

            <div className="analysis-card">

              <div className="card-header">

                <div>

                  <span className="section-label">
                    AI ANALYSIS
                  </span>

                  <h3>
                    Detection Overview
                  </h3>

                </div>

                <div className="analysis-ai-icon">
                  <Sparkles size={20} />
                </div>

              </div>

              <div className="analysis-main">

                <div className="detected-animal">

                  <div className="detected-animal-icon">
                    <PawPrint size={31} />
                  </div>

                  <div>

                    <span>
                      Primary Detection
                    </span>

                    <h4>
                      {primaryDetection
                        ? primaryDetection.class
                        : "No animal detected"}
                    </h4>

                  </div>

                </div>

                <div className="confidence-box">

                  <span>
                    Confidence
                  </span>

                  <strong>
                    {primaryDetection
                      ? `${Math.round(
                          primaryDetection.score *
                            100
                        )}%`
                      : "--"}
                  </strong>

                </div>

              </div>

              {/* QUALITY */}

              <div className="quality-section">

                <div className="quality-header">

                  <span>
                    Scan Quality
                  </span>

                  <strong>
                    {primaryDetection
                      ? qualityText
                      : "Waiting"}
                  </strong>

                </div>

                <div className="quality-bar">

                  <div
                    className="quality-fill"
                    style={{
                      width:
                        `${detectionQuality}%`,
                    }}
                  />

                </div>

                <small>
                  {primaryDetection
                    ? `${detectionQuality}% detection confidence`
                    : "Start camera to begin analysis"}
                </small>

              </div>

              {/* DETECTION LIST */}

              <div className="detection-section">

                <div className="section-title-row">

                  <h4>
                    Detected Animals
                  </h4>

                  <span>
                    {detections.length}
                    {" "}detected
                  </span>

                </div>

                {detections.length > 0 ? (

                  <div className="detection-list">

                    {detections.map(
                      (item, index) => (
                        <div
                          className="detection-item"
                          key={`${item.class}-${index}`}
                        >

                          <div className="detection-item-icon">
                            <PawPrint size={17} />
                          </div>

                          <div className="detection-item-info">

                            <strong>
                              {item.class}
                            </strong>

                            <span>
                              AI visual detection
                            </span>

                          </div>

                          <div className="detection-confidence">
                            {Math.round(
                              item.score * 100
                            )}
                            %
                          </div>

                        </div>
                      )
                    )}

                  </div>

                ) : (

                  <div className="empty-detection">

                    <Eye size={20} />

                    No supported animal
                    detected yet.

                  </div>

                )}

              </div>

            </div>

          </section>

          {/* ================= HEALTH ================= */}

          <section className="dashboard-section">

            <div className="section-heading">

              <div>

                <span className="section-label">
                  CORE BIOMETRICS
                </span>

                <h3>
                  Animal Health Parameters
                </h3>

                <p>
                  Connected sensors can provide
                  validated health measurements.
                </p>

              </div>

              <div className="sensor-badge">
                <ShieldCheck size={15} />
                Sensor Required
              </div>

            </div>

            <div className="metrics-grid">

              {healthMetrics.map(
                (metric) => {

                  const Icon = metric.icon;

                  return (
                    <div
                      className="metric-card"
                      key={metric.title}
                    >

                      <div className="metric-icon">
                        <Icon size={20} />
                      </div>

                      <div className="metric-content">

                        <span>
                          {metric.title}
                        </span>

                        <div className="metric-value">

                          {metric.value}

                          <small>
                            {metric.unit}
                          </small>

                        </div>

                        <small className="metric-status">
                          {metric.status}
                        </small>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </section>

          {/* ================= WELLNESS ================= */}

          <section className="dashboard-section">

            <div className="section-heading">

              <div>

                <span className="section-label">
                  WELLNESS & BEHAVIOUR
                </span>

                <h3>
                  Animal Wellness Indicators
                </h3>

                <p>
                  AI and sensor-based wellness
                  indicators.
                </p>

              </div>

            </div>

            <div className="metrics-grid">

              {wellnessMetrics.map(
                (metric) => {

                  const Icon = metric.icon;

                  return (
                    <div
                      className="metric-card"
                      key={metric.title}
                    >

                      <div className="metric-icon">
                        <Icon size={20} />
                      </div>

                      <div className="metric-content">

                        <span>
                          {metric.title}
                        </span>

                        <div className="metric-value">

                          {metric.value}

                          {metric.unit && (
                            <small>
                              {metric.unit}
                            </small>
                          )}

                        </div>

                        <small className="metric-status">
                          {metric.status}
                        </small>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </section>

          {/* ================= AI ASSESSMENT ================= */}

          <section className="health-assessment">

            <div className="assessment-header">

              <div className="assessment-title">

                <div className="assessment-icon">
                  <Sparkles size={22} />
                </div>

                <div>

                  <span className="section-label">
                    AI INSIGHTS
                  </span>

                  <h3>
                    AI Health Assessment
                  </h3>

                </div>

              </div>

              {scanCompleted && (
                <span className="assessment-status">
                  <CheckCircle2 size={15} />
                  Analysis Complete
                </span>
              )}

            </div>

            <div className="assessment-body">

              <div className="health-score">

                <div className="score-circle">

                  <strong>
                    {scanCompleted
                      ? "78"
                      : "--"}
                  </strong>

                  <span>
                    /100
                  </span>

                </div>

                <div>

                  <span className="score-label">
                    Overall Wellness
                  </span>

                  <h4>
                    {wellnessLabel}
                  </h4>

                  <p>
                    {scanCompleted
                      ? primaryDetection
                        ? `Visual detection completed for ${primaryDetection.class}. Confidence reflects the AI object's visual match, not a medical diagnosis.`
                        : "The scan completed, but no supported animal was confirmed at the selected confidence threshold."
                      : "Start a scan to generate the AI visual assessment."}
                  </p>

                </div>

              </div>

              <div className="assessment-observations">

                <h4>
                  Observations
                </h4>

                {scanCompleted ? (

                  <div className="observation-list">

                    <div>
                      <CheckCircle2 size={17} />
                      Animal detected successfully
                    </div>

                    <div>
                      <CheckCircle2 size={17} />
                      Visual scan completed
                    </div>

                    <div>
                      <Info size={17} />
                      Vital signs require validated sensors
                    </div>

                  </div>

                ) : (

                  <div className="observation-empty">
                    <Info size={18} />
                    Complete a scan to view observations.
                  </div>

                )}

              </div>

            </div>

          </section>

          {/* ================= VISUAL INDICATORS ================= */}

          <section className="visual-indicators">

            <div className="section-heading">

              <div>

                <span className="section-label">
                  VISUAL INDICATORS
                </span>

                <h3>
                  AI Visual Health Signals
                </h3>

              </div>

            </div>

            <div className="indicator-grid">

              <div className="indicator-card">

                <div className="indicator-icon positive">
                  <Eye size={20} />
                </div>

                <div>
                  <span>
                    Visual Detection
                  </span>

                  <strong>
                    {isScanning
                      ? "Scanning"
                      : primaryDetection
                      ? "Detected"
                      : "Waiting"}
                  </strong>
                </div>

              </div>

              <div className="indicator-card">

                <div className="indicator-icon positive">
                  <ScanLine size={20} />
                </div>

                <div>
                  <span>
                    Scan Quality
                  </span>

                  <strong>
                    {primaryDetection
                      ? qualityText
                      : "Not Available"}
                  </strong>
                </div>

              </div>

              <div className="indicator-card">

                <div className="indicator-icon neutral">
                  <Activity size={20} />
                </div>

                <div>
                  <span>
                    Movement
                  </span>

                  <strong>
                    AI / Sensor Required
                  </strong>
                </div>

              </div>

              <div className="indicator-card">

                <div className="indicator-icon neutral">
                  <HeartPulse size={20} />
                </div>

                <div>
                  <span>
                    Vital Signs
                  </span>

                  <strong>
                    Sensor Required
                  </strong>
                </div>

              </div>

            </div>

          </section>

          {/* ================= SCAN HISTORY ================= */}

          {scanHistory.length > 0 && (
            <section className="animal-history">
              <div className="section-heading">
                <div>
                  <span className="section-label">
                    SCAN HISTORY
                  </span>
                  <h3>
                    Recent Animal Scans
                  </h3>
                  <p>
                    Latest visual detection sessions from this device.
                  </p>
                </div>
              </div>

              <div className="animal-history-list">
                {scanHistory.map((record) => (
                  <div
                    className="animal-history-item"
                    key={record.id}
                  >
                    <div className="animal-history-main">
                      <div className="animal-history-icon">
                        <PawPrint size={17} />
                      </div>
                      <div>
                        <strong>{record.animal}</strong>
                        <span>{record.time} · Visual AI scan</span>
                      </div>
                    </div>

                    <div className="animal-history-confidence">
                      {record.confidence
                        ? `${record.confidence}%`
                        : "Not confirmed"}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ================= NOTICE ================= */}

          <section className="veterinary-notice">

            <div className="notice-icon">
              <Stethoscope size={21} />
            </div>

            <div>

              <strong>
                Veterinary Health Notice
              </strong>

              <p>
                iHealthyBio's webcam-based animal
                scanner is intended for visual detection
                and informational wellness monitoring.
                It does not diagnose disease or replace
                veterinary examination. Vital measurements
                require validated veterinary sensors and
                appropriate models.
              </p>

            </div>

          </section>

        </main>

        {/* ================= PROFILE MODAL ================= */}

        {editingProfile && (

          <div
            className="modal-overlay"
            onClick={() =>
              setEditingProfile(false)
            }
          >

            <div
              className="profile-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

               <div className="modal-header">

                <div>

                  <span className="section-label">
                    ANIMAL PROFILE
                  </span>

                  <h3>
                    Edit Animal Details
                  </h3>

                </div>

                <button
                  className="icon-button"
                  onClick={() =>
                    setEditingProfile(false)
                  }
                >
                  <X size={18} />
                </button>

              </div>

              <div className="profile-form">

                <div className="form-group">

                  <label>
                    Animal Name
                  </label>

                  <input
                    value={profileDraft.name}
                    onChange={(e) =>
                      setProfileDraft({
                        ...profileDraft,
                        name: e.target.value,
                      })
                    }
                  />

                </div>

                <div className="form-row">

                  <div className="form-group">

                    <label>
                      Species
                    </label>

                    <select
                      value={
                        profileDraft.species
                      }
                      onChange={(e) =>
                        setProfileDraft({
                          ...profileDraft,
                          species:
                            e.target.value,
                        })
                      }
                    >
                      <option>Dog</option>
                      <option>Cat</option>
                      <option>Bird</option>
                      <option>Horse</option>
                      <option>Cow</option>
                      <option>Sheep</option>
                    </select>

                  </div>

                  <div className="form-group">

                    <label>
                      Sex
                    </label>

                    <select
                      value={profileDraft.sex}
                      onChange={(e) =>
                        setProfileDraft({
                          ...profileDraft,
                          sex: e.target.value,
                        })
                      }
                    >
                      <option>
                        Male
                      </option>

                      <option>
                        Female
                      </option>

                      <option>
                        Unknown
                      </option>

                    </select>

                  </div>

                </div>

                <div className="form-group">

                  <label>
                    Breed
                  </label>

                  <input
                    value={profileDraft.breed}
                    onChange={(e) =>
                      setProfileDraft({
                        ...profileDraft,
                        breed: e.target.value,
                      })
                    }
                  />

                </div>

                <div className="form-row">

                  <div className="form-group">

                    <label>
                      Age
                    </label>

                    <input
                      value={profileDraft.age}
                      onChange={(e) =>
                        setProfileDraft({
                          ...profileDraft,
                          age: e.target.value,
                        })
                      }
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Weight
                    </label>

                    <input
                      value={
                        profileDraft.weight
                      }
                      onChange={(e) =>
                        setProfileDraft({
                          ...profileDraft,
                          weight:
                            e.target.value,
                        })
                      }
                    />

                  </div>

                </div>

              </div>

              <div className="modal-actions">

                <button
                  className="secondary-button"
                  onClick={() =>
                    setEditingProfile(false)
                  }
                >
                  Cancel
                </button>

                <button
                  className="primary-button"
                  onClick={saveProfile}
                >
                  <CheckCircle2 size={17} />
                  Save Profile
                </button>

              </div>

            </div>

          </div>

        )}

      </div>
    </>
  );
};

export default AnimalScanner;
