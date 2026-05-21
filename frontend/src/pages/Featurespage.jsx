import { useEffect, useMemo, useRef, useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;800&family=Rajdhani:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .assessment-root {
    min-height: 100vh;
    width: 100%;
    color: #f8f1ff;
    background:
      radial-gradient(circle at 18% 10%, rgba(156, 65, 255, 0.2), transparent 30%),
      radial-gradient(circle at 82% 2%, rgba(207, 89, 255, 0.16), transparent 32%),
      linear-gradient(180deg, #050009 0%, #100019 45%, #07000c 100%);
    font-family: 'Rajdhani', sans-serif;
    overflow-x: hidden;
  }

  .assessment-root button,
  .assessment-root input,
  .assessment-root textarea {
    font: inherit;
  }

  .bg-canvas {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  .scanlines {
    position: fixed;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background: repeating-linear-gradient(0deg, transparent 0 3px, rgba(255,255,255,0.025) 3px 4px);
    mix-blend-mode: screen;
  }

  .shell {
    position: relative;
    z-index: 2;
    width: min(1180px, calc(100% - 32px));
    margin: 0 auto;
    padding: 22px 0 72px;
  }

  .topbar {
    position: sticky;
    top: 14px;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 12px 14px;
    border: 1px solid rgba(213, 169, 255, 0.16);
    border-radius: 18px;
    background: rgba(10, 1, 18, 0.78);
    box-shadow: 0 20px 70px rgba(0,0,0,0.4), inset 0 0 28px rgba(169, 87, 255, 0.05);
    backdrop-filter: blur(20px);
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: fit-content;
  }

  .brand-mark {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    color: #f7eaff;
    background: linear-gradient(145deg, rgba(203, 112, 255, 0.35), rgba(102, 36, 212, 0.22));
    border: 1px solid rgba(237, 206, 255, 0.22);
    box-shadow: 0 0 22px rgba(171, 74, 255, 0.35);
  }

  .brand-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.95rem;
    letter-spacing: 0.08em;
    line-height: 1;
  }

  .brand-subtitle {
    margin-top: 3px;
    color: rgba(231, 207, 255, 0.56);
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.68rem;
  }

  .nav-tabs {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .nav-tab,
  .primary-btn,
  .ghost-btn,
  .icon-btn {
    border: 1px solid rgba(213, 169, 255, 0.18);
    color: #f8efff;
    background: rgba(255,255,255,0.045);
    cursor: pointer;
    transition: transform 0.22s ease, border-color 0.22s ease, background 0.22s ease, box-shadow 0.22s ease;
  }

  .nav-tab {
    min-height: 36px;
    padding: 8px 12px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: rgba(240, 224, 255, 0.72);
    white-space: nowrap;
  }

  .nav-tab.active,
  .nav-tab:hover,
  .primary-btn:hover,
  .ghost-btn:hover,
  .icon-btn:hover {
    transform: translateY(-1px);
    border-color: rgba(227, 180, 255, 0.46);
    background: rgba(151, 65, 255, 0.18);
    box-shadow: 0 0 24px rgba(171, 74, 255, 0.18);
  }

  .nav-tab.active {
    color: #fff;
    background: linear-gradient(135deg, rgba(191, 96, 255, 0.3), rgba(105, 57, 224, 0.18));
  }

  .hero {
    min-height: 520px;
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
    align-items: center;
    gap: 42px;
    padding: 72px 0 42px;
  }

  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    color: rgba(216, 174, 255, 0.78);
    font-family: 'Orbitron', sans-serif;
    font-size: 0.72rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    margin-bottom: 18px;
  }

  .signal-dot {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: #f0abfc;
    box-shadow: 0 0 18px #d946ef;
  }

  h1, h2, h3, p { margin: 0; }

  .hero-title {
    font-family: 'Orbitron', sans-serif;
    font-size: clamp(2.25rem, 6vw, 5rem);
    line-height: 0.98;
    letter-spacing: 0;
    max-width: 760px;
  }

  .gradient-text {
    background: linear-gradient(110deg, #fff 0%, #f0abfc 28%, #b65cff 58%, #7c3aed 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 0 22px rgba(188, 86, 255, 0.28));
  }

  .hero-copy {
    margin-top: 22px;
    max-width: 660px;
    font-family: 'Space Grotesk', sans-serif;
    color: rgba(232, 216, 255, 0.74);
    line-height: 1.78;
    font-size: clamp(0.98rem, 1.7vw, 1.12rem);
  }

  .action-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 30px;
  }

  .primary-btn,
  .ghost-btn {
    min-height: 46px;
    border-radius: 999px;
    padding: 11px 18px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    font-weight: 700;
  }

  .primary-btn {
    border-color: rgba(244, 208, 255, 0.42);
    background: linear-gradient(135deg, #d946ef 0%, #8b5cf6 55%, #5b21b6 100%);
    box-shadow: 0 12px 40px rgba(147, 51, 234, 0.32);
  }

  .hero-panel,
  .panel,
  .metric-card,
  .report-card,
  .upload-zone,
  .camera-stage {
    border: 1px solid rgba(218, 176, 255, 0.16);
    background: linear-gradient(145deg, rgba(22, 5, 38, 0.82), rgba(10, 1, 18, 0.72));
    box-shadow: 0 24px 70px rgba(0,0,0,0.34), inset 0 0 50px rgba(171, 74, 255, 0.04);
    backdrop-filter: blur(18px);
  }

  .hero-panel {
    position: relative;
    min-height: 410px;
    border-radius: 28px;
    padding: 26px;
    overflow: hidden;
  }

  .hero-panel::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(120deg, transparent 0 38%, rgba(226, 156, 255, 0.12) 43%, transparent 48%),
      repeating-linear-gradient(90deg, rgba(185, 93, 255, 0.08) 0 1px, transparent 1px 92px);
    pointer-events: none;
  }

  .score-orbit {
    position: absolute;
    width: 260px;
    aspect-ratio: 1;
    border-radius: 50%;
    right: 28px;
    top: 34px;
    border: 1px dashed rgba(237, 206, 255, 0.26);
    display: grid;
    place-items: center;
    animation: rotateSlow 18s linear infinite;
  }

  .score-core {
    width: 150px;
    aspect-ratio: 1;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: radial-gradient(circle, rgba(217, 70, 239, 0.32), rgba(124, 58, 237, 0.08) 70%);
    border: 1px solid rgba(237, 206, 255, 0.22);
    box-shadow: 0 0 50px rgba(217, 70, 239, 0.28);
    animation: rotateBack 18s linear infinite;
  }

  .score-core strong {
    font-family: 'Orbitron', sans-serif;
    font-size: 2.7rem;
    line-height: 1;
  }

  .score-core span {
    display: block;
    margin-top: 4px;
    color: rgba(233, 214, 255, 0.62);
    font-size: 0.78rem;
    text-align: center;
  }

  @keyframes rotateSlow { to { transform: rotate(360deg); } }
  @keyframes rotateBack { to { transform: rotate(-360deg); } }

  .mini-readouts {
    position: relative;
    display: grid;
    gap: 12px;
    width: min(280px, 100%);
    margin-top: 235px;
  }

  .readout {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    border: 1px solid rgba(213, 169, 255, 0.14);
    border-radius: 14px;
    background: rgba(255,255,255,0.045);
  }

  .readout span {
    color: rgba(235, 217, 255, 0.66);
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.82rem;
  }

  .readout strong {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.95rem;
  }

  .section {
    padding: 46px 0 12px;
  }

  .section-head {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 18px;
  }

  .section-title {
    font-family: 'Orbitron', sans-serif;
    font-size: clamp(1.55rem, 3.2vw, 2.6rem);
    letter-spacing: 0;
  }

  .section-copy {
    margin-top: 10px;
    max-width: 720px;
    color: rgba(231, 213, 255, 0.68);
    font-family: 'Space Grotesk', sans-serif;
    line-height: 1.7;
  }

  .steps-grid,
  .reports-grid,
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }

  .step-card,
  .metric-card,
  .report-card,
  .panel {
    border-radius: 20px;
    padding: 20px;
  }

  .step-card {
    min-height: 210px;
    border: 1px solid rgba(218, 176, 255, 0.14);
    background:
      linear-gradient(145deg, rgba(120, 31, 190, 0.18), rgba(14, 2, 26, 0.72)),
      radial-gradient(circle at 30% 0%, rgba(219, 120, 255, 0.15), transparent 42%);
    position: relative;
    overflow: hidden;
  }

  .step-card::after {
    content: attr(data-step);
    position: absolute;
    right: -6px;
    bottom: -24px;
    font-family: 'Orbitron', sans-serif;
    font-size: 6rem;
    color: rgba(244, 208, 255, 0.055);
    line-height: 1;
  }

  .step-icon,
  .report-icon,
  .upload-icon {
    width: 46px;
    height: 46px;
    border-radius: 14px;
    display: grid;
    place-items: center;
    color: #f7e7ff;
    background: rgba(166, 82, 255, 0.18);
    border: 1px solid rgba(232, 202, 255, 0.18);
    box-shadow: inset 0 0 24px rgba(218, 112, 255, 0.08);
  }

  .step-title,
  .report-title,
  .panel-title {
    margin-top: 18px;
    font-family: 'Orbitron', sans-serif;
    font-size: 1rem;
    line-height: 1.3;
  }

  .step-copy,
  .report-meta,
  .panel-copy {
    margin-top: 10px;
    color: rgba(229, 208, 255, 0.66);
    font-family: 'Space Grotesk', sans-serif;
    line-height: 1.6;
    font-size: 0.92rem;
  }

  .workflow-layout {
    display: grid;
    grid-template-columns: minmax(0, 0.95fr) minmax(320px, 1.05fr);
    gap: 18px;
    align-items: start;
  }

  .upload-zone {
    min-height: 340px;
    border-radius: 24px;
    padding: 24px;
    display: grid;
    place-items: center;
    text-align: center;
    border-style: dashed;
  }

  .upload-zone input[type='file'] {
    width: 100%;
    max-width: 430px;
    color: rgba(236, 218, 255, 0.72);
  }

  .upload-zone input[type='file']::file-selector-button {
    margin-right: 12px;
    border: 1px solid rgba(236, 210, 255, 0.34);
    border-radius: 999px;
    padding: 10px 14px;
    color: #fff;
    background: rgba(163, 70, 255, 0.22);
    cursor: pointer;
  }

  .text-input {
    width: 100%;
    min-height: 140px;
    resize: vertical;
    margin-top: 16px;
    border: 1px solid rgba(218, 176, 255, 0.16);
    border-radius: 16px;
    padding: 14px;
    color: #f8f1ff;
    background: rgba(255,255,255,0.045);
    outline: none;
  }

  .analysis-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 9px;
    margin-top: 16px;
  }

  .tag {
    padding: 7px 10px;
    border-radius: 999px;
    color: rgba(247, 235, 255, 0.86);
    background: rgba(164, 76, 255, 0.14);
    border: 1px solid rgba(229, 197, 255, 0.14);
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.78rem;
  }

  .tag.active {
    border-color: rgba(244, 208, 255, 0.5);
    background: rgba(217, 70, 239, 0.28);
    color: #fff;
  }

  .difficulty-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 16px;
  }

  .difficulty-btn {
    min-height: 38px;
    border-radius: 999px;
    border: 1px solid rgba(229, 197, 255, 0.16);
    padding: 8px 13px;
    color: #fff;
    cursor: pointer;
    background: rgba(255,255,255,0.055);
  }

  .difficulty-btn.easy.active { background: rgba(34, 197, 94, 0.34); }
  .difficulty-btn.medium.active { background: rgba(234, 179, 8, 0.34); }
  .difficulty-btn.hard.active { background: rgba(239, 68, 68, 0.34); }

  .status-text {
    margin-top: 12px;
    color: rgba(232, 216, 255, 0.78);
    font-family: 'Space Grotesk', sans-serif;
    line-height: 1.55;
    font-size: 0.9rem;
  }

  .error-text {
    color: #f0abfc;
  }

  .camera-stage {
    position: relative;
    min-height: 520px;
    border-radius: 24px;
    overflow: hidden;
    display: grid;
    grid-template-rows: auto 1fr auto;
  }

  .camera-stage.fullscreen-mode {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    background: #030006;
  }

  .camera-top,
  .camera-bottom {
    position: relative;
    z-index: 4;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 16px;
    background: rgba(5, 0, 10, 0.72);
    border-bottom: 1px solid rgba(218, 176, 255, 0.1);
  }

  .camera-bottom {
    align-items: end;
    border-bottom: 0;
    border-top: 1px solid rgba(218, 176, 255, 0.1);
  }

  .camera-feed {
    position: relative;
    display: grid;
    place-items: center;
    min-height: 360px;
    background:
      linear-gradient(120deg, rgba(117, 45, 204, 0.12), transparent 42%),
      radial-gradient(circle at 50% 50%, rgba(177, 80, 255, 0.14), transparent 38%),
      #050009;
  }

  .camera-feed video {
    width: 100%;
    height: 100%;
    min-height: 360px;
    object-fit: cover;
    opacity: 0.72;
    filter: saturate(0.9) contrast(1.08);
  }

  .camera-placeholder {
    width: min(420px, 80%);
    aspect-ratio: 1.6;
    border: 1px solid rgba(230, 198, 255, 0.16);
    border-radius: 24px;
    display: grid;
    place-items: center;
    color: rgba(239, 220, 255, 0.72);
    background:
      linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px),
      linear-gradient(180deg, rgba(255,255,255,0.04) 1px, transparent 1px);
    background-size: 34px 34px;
  }

  .question-card {
    max-width: 680px;
  }

  .question-card small,
  .status-pill {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: rgba(231, 208, 255, 0.72);
    font-family: 'Space Grotesk', sans-serif;
  }

  .question-card h3 {
    margin-top: 7px;
    font-family: 'Orbitron', sans-serif;
    font-size: clamp(1rem, 2vw, 1.35rem);
    line-height: 1.45;
  }

  .answer-box {
    width: min(360px, 100%);
    min-height: 96px;
    border: 1px solid rgba(218, 176, 255, 0.16);
    border-radius: 14px;
    padding: 12px;
    color: #fff;
    background: rgba(255,255,255,0.05);
    resize: none;
    outline: none;
  }

  .report-card {
    position: relative;
    overflow: hidden;
  }

  .report-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(130deg, rgba(255,255,255,0.08), transparent 36%);
    pointer-events: none;
  }

  .score-row {
    display: grid;
    gap: 10px;
    margin-top: 18px;
  }

  .score-line {
    display: grid;
    grid-template-columns: 96px 1fr 34px;
    align-items: center;
    gap: 10px;
    color: rgba(235, 218, 255, 0.76);
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.82rem;
  }

  .bar {
    height: 7px;
    border-radius: 999px;
    overflow: hidden;
    background: rgba(255,255,255,0.08);
  }

  .bar span {
    display: block;
    height: 100%;
    width: var(--value);
    border-radius: inherit;
    background: linear-gradient(90deg, #d946ef, #8b5cf6, #38bdf8);
    box-shadow: 0 0 16px rgba(217, 70, 239, 0.42);
  }

  .metric-card {
    min-height: 150px;
  }

  .metric-value {
    margin-top: 14px;
    font-family: 'Orbitron', sans-serif;
    font-size: 2rem;
  }

  .metric-label {
    color: rgba(229, 208, 255, 0.64);
    font-family: 'Space Grotesk', sans-serif;
  }

  .insight-list {
    display: grid;
    gap: 12px;
    margin-top: 18px;
  }

  .insight-item {
    padding: 14px;
    border-radius: 16px;
    border: 1px solid rgba(218, 176, 255, 0.13);
    background: rgba(255,255,255,0.045);
    color: rgba(238, 222, 255, 0.76);
    font-family: 'Space Grotesk', sans-serif;
    line-height: 1.55;
  }

  .icon-btn {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
  }

  @media (max-width: 900px) {
    .topbar {
      position: relative;
      top: 0;
      align-items: flex-start;
      flex-direction: column;
    }

    .nav-tabs {
      justify-content: flex-start;
      width: 100%;
    }

    .hero,
    .workflow-layout {
      grid-template-columns: 1fr;
    }

    .hero {
      padding-top: 44px;
    }

    .steps-grid,
    .reports-grid,
    .metrics-grid {
      grid-template-columns: 1fr;
    }

    .section-head {
      align-items: flex-start;
      flex-direction: column;
    }

    .camera-bottom {
      align-items: stretch;
      flex-direction: column;
    }

    .answer-box {
      width: 100%;
    }
  }

  @media (max-width: 560px) {
    .shell {
      width: min(100% - 20px, 1180px);
      padding-bottom: 42px;
    }

    .topbar,
    .hero-panel,
    .panel,
    .report-card,
    .metric-card,
    .upload-zone,
    .camera-stage {
      border-radius: 16px;
    }

    .nav-tab {
      flex: 1 1 calc(50% - 8px);
      justify-content: center;
    }

    .hero-panel {
      min-height: 360px;
      padding: 18px;
    }

    .score-orbit {
      width: 210px;
      right: 50%;
      transform: translateX(50%);
    }

    .mini-readouts {
      margin-top: 210px;
      width: 100%;
    }
  }
`;

const Icon = ({ name, size = 20 }) => {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  const paths = {
    home: <><path d="M3 11.5 12 4l9 7.5" /><path d="M5 10.5V20h14v-9.5" /><path d="M9.5 20v-6h5v6" /></>,
    upload: <><path d="M12 15V4" /><path d="m7 9 5-5 5 5" /><path d="M5 15v4h14v-4" /></>,
    camera: <><path d="M4 8h4l2-3h4l2 3h4v11H4z" /><circle cx="12" cy="13.5" r="3.5" /></>,
    report: <><path d="M5 4h14v16H5z" /><path d="M9 9h6" /><path d="M9 13h6" /><path d="M9 17h3" /></>,
    brain: <><path d="M9 5a3 3 0 0 0-3 3 3 3 0 0 0-2 5.6A3.5 3.5 0 0 0 8 19h1" /><path d="M15 5a3 3 0 0 1 3 3 3 3 0 0 1 2 5.6A3.5 3.5 0 0 1 16 19h-1" /><path d="M9 5v14" /><path d="M15 5v14" /><path d="M9 9h6" /><path d="M9 14h6" /></>,
    shield: <><path d="M12 3 19 6v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z" /><path d="m9 12 2 2 4-5" /></>,
    mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0" /><path d="M12 18v3" /></>,
    spark: <><path d="M13 2 5 14h6l-1 8 8-12h-6z" /></>,
    expand: <><path d="M8 3H3v5" /><path d="M16 3h5v5" /><path d="M21 16v5h-5" /><path d="M3 16v5h5" /></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></>,
  };

  return <svg {...common}>{paths[name]}</svg>;
};

const reports = [
  {
    title: "React Performance Interview",
    time: "Today, 10:42 AM",
    duration: "18 min",
    difficulty: "Intermediate",
    scores: { Fluency: 82, Knowledge: 76, Confidence: 74, Clarity: 88, Depth: 69 },
  },
  {
    title: "DSA from LeetCode Screenshot",
    time: "Yesterday, 8:15 PM",
    duration: "22 min",
    difficulty: "Advanced",
    scores: { Fluency: 71, Knowledge: 84, Confidence: 68, Clarity: 73, Depth: 80 },
  },
  {
    title: "Research Paper: NLP Concepts",
    time: "Mar 12, 9:05 AM",
    duration: "16 min",
    difficulty: "Conceptual",
    scores: { Fluency: 86, Knowledge: 79, Confidence: 81, Clarity: 84, Depth: 75 },
  },
];

const steps = [
  {
    icon: "upload",
    title: "Upload any proof of skill",
    copy: "Add resumes, PDFs, notes, certificates, screenshots, reports, presentations, or paste raw text and repository context.",
  },
  {
    icon: "brain",
    title: "AI builds your topic graph",
    copy: "The system extracts skills, technologies, concepts, difficulty signals, and likely weak zones from multimodal inputs.",
  },
  {
    icon: "camera",
    title: "Take an adaptive interview",
    copy: "Answer by voice or text while the interview runs in fullscreen. Leaving fullscreen before completion records a rule violation.",
  },
];

const API_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV
    ? "http://127.0.0.1:8000"
    : "https://twintalk-20in.onrender.com"
);

const difficultyLabels = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

function ParticleCanvas() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const particles = Array.from({ length: 72 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00045,
      vy: (Math.random() - 0.5) * 0.00045,
      r: 0.7 + Math.random() * 1.9,
      a: 0.25 + Math.random() * 0.55,
    }));

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < 9; i += 1) {
        ctx.beginPath();
        const y = H * (0.12 + i * 0.095);
        for (let x = -40; x <= W + 40; x += 12) {
          const wave = Math.sin(x * 0.008 + performance.now() * 0.00055 + i) * (18 + i * 3);
          x === -40 ? ctx.moveTo(x, y + wave) : ctx.lineTo(x, y + wave);
        }
        ctx.strokeStyle = `rgba(168, 85, 247, ${0.08 + i * 0.012})`;
        ctx.lineWidth = i === 4 ? 1.5 : 0.8;
        ctx.shadowColor = "#d946ef";
        ctx.shadowBlur = i === 4 ? 16 : 3;
        ctx.stroke();
      }

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(236, 180, 255, ${p.a})`;
        ctx.shadowColor = "#c084fc";
        ctx.shadowBlur = 10;
        ctx.fill();
      });

      ctx.shadowBlur = 0;
      rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="bg-canvas" />;
}

function ScoreLines({ scores }) {
  return (
    <div className="score-row">
      {Object.entries(scores).map(([label, value]) => (
        <div className="score-line" key={label}>
          <span>{label}</span>
          <div className="bar"><span style={{ "--value": `${value}%` }} /></div>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

export default function FeaturesPage() {
  const [view, setView] = useState("home");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [sourceText, setSourceText] = useState("");
  const [uploadId, setUploadId] = useState("");
  const [uploadPreview, setUploadPreview] = useState("");
  const [questions, setQuestions] = useState({ easy: [], medium: [], hard: [] });
  const [selectedDifficulty, setSelectedDifficulty] = useState("easy");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [interviewId, setInterviewId] = useState("");
  const [evaluations, setEvaluations] = useState([]);
  const [latestEvaluation, setLatestEvaluation] = useState(null);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [workflowMessage, setWorkflowMessage] = useState("");
  const [workflowError, setWorkflowError] = useState("");
  const [isPreparing, setIsPreparing] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [violations, setViolations] = useState(0);
  const [cameraError, setCameraError] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const [isInterviewFullscreen, setIsInterviewFullscreen] = useState(false);
  const cameraRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("twintalk_user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const selectedReport = reports[0];
  const activeQuestions = questions[selectedDifficulty] || [];
  const activeQuestion = activeQuestions[currentQuestionIndex] || "";
  const averageScore = Math.round(
    Object.values(selectedReport.scores).reduce((sum, value) => sum + value, 0) /
      Object.values(selectedReport.scores).length
  );
  const liveScores = generatedReport
    ? {
        Knowledge: Math.round((generatedReport.technical_accuracy || 0) * 10),
        Clarity: Math.round((generatedReport.communication || 0) * 10),
        Confidence: Math.round((generatedReport.confidence_score || 0) * 10),
        Fluency: generatedReport.hesitation === "High" ? 48 : generatedReport.hesitation === "Medium" ? 68 : 84,
      }
    : selectedReport.scores;
  const liveAverageScore = Math.round(
    Object.values(liveScores).reduce((sum, value) => sum + value, 0) / Object.values(liveScores).length
  );

  useEffect(() => {
    const handleFullscreenChange = () => {
      const stageIsFullscreen = document.fullscreenElement === cameraRef.current;
      setIsInterviewFullscreen(stageIsFullscreen);
      if (sessionActive && !sessionDone && !stageIsFullscreen) {
        setViolations((count) => count + 1);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [sessionActive, sessionDone]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (cameraReady && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraReady]);

  useEffect(() => {
    if (!sessionActive || !activeQuestion || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(activeQuestion);
    utterance.rate = 0.92;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);

    return () => window.speechSynthesis.cancel();
  }, [activeQuestion, sessionActive]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setUploadedFile(file);
    setUploadId("");
    setUploadPreview("");
    setQuestions({ easy: [], medium: [], hard: [] });
    setWorkflowError("");
    setWorkflowMessage(file ? "File selected. Start the interview to upload and generate questions." : "");
  };

  const prepareQuestions = async () => {
    setWorkflowError("");
    setWorkflowMessage("");

    if (!uploadedFile && !sourceText.trim()) {
      throw new Error("Upload a PDF/DOCX/TXT file or paste notes before starting.");
    }

    let nextUploadId = uploadId;

    if (uploadedFile && !nextUploadId) {
      setWorkflowMessage("Uploading document and extracting text...");
      const formData = new FormData();
      formData.append("file", uploadedFile);
      if (currentUser.email) formData.append("user_email", currentUser.email);

      const uploadResponse = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.detail || "Upload failed.");
      }

      nextUploadId = uploadData.upload_id;
      setUploadId(nextUploadId);
      setUploadPreview(uploadData.preview || "");
    }

    const hasQuestions = Object.values(questions).some((items) => items.length);
    if (!hasQuestions) {
      setWorkflowMessage("Generating interview questions with AI...");
      const response = await fetch(`${API_URL}/interview/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          upload_id: nextUploadId || null,
          text: nextUploadId ? null : sourceText,
          user_email: currentUser.email || null,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Question generation failed.");
      }

      setQuestions(data.questions || { easy: [], medium: [], hard: [] });
      setCurrentQuestionIndex(0);
    }

    setWorkflowMessage("Questions ready. Starting interview...");
  };

  const startInterview = async () => {
    setIsPreparing(true);
    setWorkflowError("");

    try {
      await prepareQuestions();
    } catch (error) {
      setWorkflowError(error.message || "Could not prepare the interview.");
      setIsPreparing(false);
      return;
    }

    setView("interview");
    setSessionDone(false);
    setSessionActive(true);
    setCameraReady(false);
    setCameraError("");
    setAnswerText("");
    setLatestEvaluation(null);
    setIsPreparing(false);

    try {
      if (cameraRef.current?.requestFullscreen) {
        await cameraRef.current.requestFullscreen();
      }
    } catch {
      setCameraError("Fullscreen could not start automatically. Use the fullscreen button before answering.");
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      setCameraReady(true);
    } catch {
      setCameraError("Camera or microphone permission is not available, so the preview is showing secure demo mode.");
    }
  };

  const submitAnswer = async () => {
    if (!activeQuestion || !answerText.trim()) {
      setWorkflowError("Type an answer before submitting.");
      return;
    }

    setIsEvaluating(true);
    setWorkflowError("");

    try {
      const startedAt = Date.now();
      const response = await fetch(`${API_URL}/interview/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interview_id: interviewId || null,
          user_email: currentUser.email || null,
          question: activeQuestion,
          answer: answerText,
          duration_seconds: Math.max(20, Math.round((Date.now() - startedAt) / 1000)),
          pauses: [],
          visual_metrics: {
            eye_contact_percentage: cameraReady ? 70 : 0,
            face_visibility_percentage: cameraReady ? 85 : 0,
            smile_consistency_percentage: cameraReady ? 45 : 0,
            head_movement_frequency: cameraReady ? 3 : 0,
          },
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Answer evaluation failed.");
      }

      setInterviewId(data.interview_id);
      setLatestEvaluation(data.evaluation);
      setEvaluations((items) => [...items, data]);
      setAnswerText("");

      if (currentQuestionIndex < activeQuestions.length - 1) {
        setCurrentQuestionIndex((index) => index + 1);
      }
    } catch (error) {
      setWorkflowError(error.message || "Could not evaluate the answer.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const endInterview = async () => {
    setIsReporting(true);
    setWorkflowError("");

    setSessionActive(false);
    setSessionDone(true);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setCameraReady(false);
    }

    if (document.fullscreenElement && document.exitFullscreen) {
      await document.exitFullscreen().catch(() => {});
    }

    if (interviewId) {
      try {
        const response = await fetch(`${API_URL}/analysis/report`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            interview_id: interviewId,
            user_email: currentUser.email || null,
          }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Report generation failed.");
        }

        setGeneratedReport(data.report);
      } catch (error) {
        setWorkflowError(error.message || "Could not generate final report.");
      }
    }

    setIsReporting(false);
    setView("results");
  };

  const logout = () => {
    sessionStorage.removeItem("twintalk_user");
    window.location.href = "/";
  };

  return (
    <>
      <style>{styles}</style>
      <div className="assessment-root">
        <ParticleCanvas />
        <div className="scanlines" />

        <main className="shell">
          <nav className="topbar" aria-label="Main navigation">
            <div className="brand">
              <div className="brand-mark"><Icon name="brain" /></div>
              <div>
                <div className="brand-title">TwinTalk AI</div>
                <div className="brand-subtitle">Adaptive Skill Assessment</div>
              </div>
            </div>

            <div className="nav-tabs">
              {[
                ["home", "home", "Home"],
                ["assess", "upload", "Assess"],
                ["reports", "report", "Reports"],
                ["results", "spark", "Results"],
              ].map(([id, icon, label]) => (
                <button
                  key={id}
                  type="button"
                  className={`nav-tab ${view === id ? "active" : ""}`}
                  onClick={() => setView(id)}
                >
                  <Icon name={icon} size={17} />
                  {label}
                </button>
              ))}
              <button type="button" className="icon-btn" onClick={logout} aria-label="Logout">
                <Icon name="logout" size={18} />
              </button>
            </div>
          </nav>

          {view === "home" && (
            <>
              <section className="hero">
                <div>
                  <span className="eyebrow"><span className="signal-dot" />AI Interview Readiness Lab</span>
                  <h1 className="hero-title">
                    Assess real skill from <span className="gradient-text">any evidence</span>.
                  </h1>
                  <p className="hero-copy">
                    Upload a resume, report, paper, certificate, GitHub context, notes, presentation, or coding screenshot.
                    TwinTalk extracts your skill map, asks adaptive follow-ups, and generates a report across knowledge,
                    confidence, fluency, clarity, depth, and problem solving.
                  </p>
                  <div className="action-row">
                    <button type="button" className="primary-btn" onClick={() => setView("assess")}>
                      <Icon name="upload" /> Start Assessment
                    </button>
                    <button type="button" className="ghost-btn" onClick={() => setView("reports")}>
                      <Icon name="report" /> View Reports
                    </button>
                  </div>
                </div>

                <div className="hero-panel" aria-label="Assessment score preview">
                  <div className="score-orbit">
                    <div className="score-core">
                      <div>
                        <strong>{averageScore}</strong>
                        <span>readiness score</span>
                      </div>
                    </div>
                  </div>
                  <div className="mini-readouts">
                    <div className="readout"><span>Input types</span><strong>8+</strong></div>
                    <div className="readout"><span>Adaptive probes</span><strong>Live</strong></div>
                    <div className="readout"><span>Proctor mode</span><strong>On</strong></div>
                  </div>
                </div>
              </section>

              <section className="section" aria-labelledby="steps-title">
                <div className="section-head">
                  <div>
                    <span className="eyebrow"><span className="signal-dot" />How it works</span>
                    <h2 className="section-title" id="steps-title">Three steps after login</h2>
                    <p className="section-copy">
                      The flow is built for interview preparation, skill assessment, and learning analysis without limiting
                      the user to a resume-only experience.
                    </p>
                  </div>
                </div>
                <div className="steps-grid">
                  {steps.map((step, index) => (
                    <article className="step-card" data-step={`0${index + 1}`} key={step.title}>
                      <div className="step-icon"><Icon name={step.icon} /></div>
                      <h3 className="step-title">{step.title}</h3>
                      <p className="step-copy">{step.copy}</p>
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}

          {view === "assess" && (
            <section className="section">
              <div className="section-head">
                <div>
                  <span className="eyebrow"><span className="signal-dot" />New Session</span>
                  <h1 className="section-title">Upload, analyze, interview</h1>
                  <p className="section-copy">
                    Upload a PDF, DOCX, or TXT file, or paste notes. TwinTalk will extract the content,
                    generate interview questions, and evaluate your answers through the backend.
                  </p>
                </div>
                <button type="button" className="primary-btn" onClick={startInterview} disabled={isPreparing}>
                  <Icon name="camera" /> {isPreparing ? "Preparing..." : "Start Interview"}
                </button>
              </div>

              <div className="workflow-layout">
                <div className="upload-zone">
                  <div>
                    <div className="upload-icon" style={{ margin: "0 auto 18px" }}><Icon name="upload" /></div>
                    <h2 className="panel-title">Upload documents or media</h2>
                    <p className="panel-copy">
                      Accepts PDF, images, documents, slides, screenshots, text exports, and other learning evidence.
                    </p>
                    <div style={{ marginTop: 20 }}>
                      <input
                        type="file"
                        accept=".pdf,.docx,.png,.jpg,.jpeg,.webp,.txt"
                        onChange={handleFileChange}
                      />
                    </div>
                    <textarea
                      className="text-input"
                      value={sourceText}
                      onChange={(event) => setSourceText(event.target.value)}
                      placeholder="Paste notes, GitHub repository summary, project explanation, or a topic you want assessed..."
                    />
                    {workflowMessage && <p className="status-text">{workflowMessage}</p>}
                    {workflowError && <p className="status-text error-text">{workflowError}</p>}
                  </div>
                </div>

                <aside className="panel">
                  <span className="eyebrow"><span className="signal-dot" />AI Extraction Preview</span>
                  <h2 className="section-title" style={{ fontSize: "1.6rem" }}>
                    {uploadedFile ? uploadedFile.name : sourceText ? "Text source detected" : "Waiting for input"}
                  </h2>
                  <p className="panel-copy">
                    {uploadPreview
                      ? uploadPreview
                      : "Generated questions appear here after the backend reads your uploaded file or pasted text."}
                  </p>
                  <div className="difficulty-row">
                    {Object.entries(difficultyLabels).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        className={`difficulty-btn ${key} ${selectedDifficulty === key ? "active" : ""}`}
                        onClick={() => {
                          setSelectedDifficulty(key);
                          setCurrentQuestionIndex(0);
                        }}
                      >
                        {label} ({questions[key]?.length || 0})
                      </button>
                    ))}
                  </div>
                  <div className="insight-list">
                    {activeQuestions.length ? (
                      activeQuestions.map((question, index) => (
                        <button
                          type="button"
                          className={`insight-item ${index === currentQuestionIndex ? "tag active" : ""}`}
                          key={question}
                          onClick={() => setCurrentQuestionIndex(index)}
                          style={{ textAlign: "left", cursor: "pointer" }}
                        >
                          {index + 1}. {question}
                        </button>
                      ))
                    ) : (
                      <>
                        <div className="insight-item">Upload a file or paste notes, then click Start Interview.</div>
                        <div className="insight-item">PDF, DOCX, and TXT are the best formats for the first test.</div>
                      </>
                    )}
                  </div>
                </aside>
              </div>
            </section>
          )}

          {view === "interview" && (
            <section className="section">
              <div
                ref={cameraRef}
                className={`camera-stage ${isInterviewFullscreen ? "fullscreen-mode" : ""}`}
              >
                <div className="camera-top">
                  <div>
                    <span className="status-pill"><span className="signal-dot" />Secure interview running</span>
                    <h2 className="panel-title" style={{ marginTop: 6 }}>Technical depth round</h2>
                  </div>
                  <div className="action-row" style={{ marginTop: 0 }}>
                    <button
                      type="button"
                      className="ghost-btn"
                      onClick={() => cameraRef.current?.requestFullscreen?.()}
                    >
                      <Icon name="expand" /> Fullscreen
                    </button>
                    <button type="button" className="primary-btn" onClick={endInterview} disabled={isReporting}>
                      {isReporting ? "Generating..." : "Generate Report"}
                    </button>
                  </div>
                </div>

                <div className="camera-feed">
                  {cameraReady ? (
                    <video ref={videoRef} autoPlay muted playsInline />
                  ) : (
                    <div className="camera-placeholder">
                      <div style={{ textAlign: "center" }}>
                        <Icon name="camera" size={42} />
                        <p className="panel-copy">Camera preview initializes after permission.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="camera-bottom">
                  <div className="question-card">
                    <small>
                      Question {Math.min(currentQuestionIndex + 1, activeQuestions.length || 1)} of {activeQuestions.length || 1}
                      {" "}· {difficultyLabels[selectedDifficulty]} · Generated from uploaded source
                    </small>
                    <h3>{activeQuestion || "No generated question found. Go back and generate questions first."}</h3>
                    {latestEvaluation?.summary && (
                      <p className="panel-copy">Last feedback: {latestEvaluation.summary}</p>
                    )}
                    {cameraError && <p className="panel-copy" style={{ color: "#f0abfc" }}>{cameraError}</p>}
                    {workflowError && <p className="panel-copy" style={{ color: "#f0abfc" }}>{workflowError}</p>}
                    <p className="panel-copy">Rule violations recorded: {violations}</p>
                  </div>
                  <div>
                    <textarea
                      className="answer-box"
                      value={answerText}
                      onChange={(event) => setAnswerText(event.target.value)}
                      placeholder="Type your answer here..."
                    />
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={submitAnswer}
                      disabled={isEvaluating || !activeQuestion}
                      style={{ width: "100%", marginTop: 10 }}
                    >
                      {isEvaluating ? "Evaluating..." : "Submit Answer"}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {view === "reports" && (
            <section className="section">
              <div className="section-head">
                <div>
                  <span className="eyebrow"><span className="signal-dot" />Reports</span>
                  <h1 className="section-title">Every interview becomes a report</h1>
                  <p className="section-copy">
                    Each report stores the topic title, interview time, duration, and assessment scales for fluency,
                    knowledge, confidence, clarity, depth, and more.
                  </p>
                </div>
              </div>

              <div className="reports-grid">
                {reports.map((report) => (
                  <article className="report-card" key={report.title}>
                    <div className="report-icon"><Icon name="report" /></div>
                    <h2 className="report-title">{report.title}</h2>
                    <p className="report-meta">{report.time} · {report.duration} · {report.difficulty}</p>
                    <ScoreLines scores={report.scores} />
                  </article>
                ))}
              </div>
            </section>
          )}

          {view === "results" && (
            <section className="section">
              <div className="section-head">
                <div>
                  <span className="eyebrow"><span className="signal-dot" />Session Report</span>
                  <h1 className="section-title">Latest readiness analysis</h1>
                  <p className="section-copy">
                    Generated for {currentUser.name || "the current user"} after the adaptive interview session.
                  </p>
                </div>
                <button type="button" className="ghost-btn" onClick={() => setView("reports")}>
                  <Icon name="report" /> Open Report History
                </button>
              </div>

              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-label">Overall readiness</div>
                  <div className="metric-value">{liveAverageScore}%</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Rule violations</div>
                  <div className="metric-value">{violations}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Answers evaluated</div>
                  <div className="metric-value">{evaluations.length}</div>
                </div>
              </div>

              <div className="workflow-layout" style={{ marginTop: 18 }}>
                <article className="panel">
                  <h2 className="section-title" style={{ fontSize: "1.55rem" }}>Assessment scales</h2>
                  <ScoreLines scores={liveScores} />
                </article>
                <article className="panel">
                  <h2 className="section-title" style={{ fontSize: "1.55rem" }}>Personalized recommendations</h2>
                  <div className="insight-list">
                    {generatedReport ? (
                      <>
                        <div className="insight-item">{generatedReport.summary}</div>
                        {(generatedReport.improvement_plan || []).map((item) => (
                          <div className="insight-item" key={item}>{item}</div>
                        ))}
                      </>
                    ) : (
                      <>
                        <div className="insight-item">Submit at least one answer before generating a report.</div>
                        {workflowError && <div className="insight-item">{workflowError}</div>}
                      </>
                    )}
                  </div>
                </article>
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
}
