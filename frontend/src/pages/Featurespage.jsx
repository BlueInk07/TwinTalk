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

  .config-row {
    display: grid;
    gap: 10px;
    margin-top: 16px;
    text-align: left;
  }

  .config-label {
    display: grid;
    gap: 7px;
    color: rgba(236, 218, 255, 0.78);
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.86rem;
  }

  .select-input {
    min-height: 42px;
    border: 1px solid rgba(218, 176, 255, 0.16);
    border-radius: 12px;
    padding: 9px 12px;
    color: #f8f1ff;
    background: rgba(255,255,255,0.055);
    outline: none;
  }

  .completion-panel {
    margin-top: 12px;
    padding: 14px;
    border-radius: 16px;
    border: 1px solid rgba(74, 222, 128, 0.32);
    background: rgba(34, 197, 94, 0.12);
    color: rgba(235, 255, 241, 0.9);
    font-family: 'Space Grotesk', sans-serif;
    line-height: 1.55;
  }

  .voice-row {
    display: flex;
    gap: 10px;
    margin-top: 10px;
    flex-wrap: wrap;
  }

  .report-document {
    display: grid;
    gap: 22px;
    border-radius: 20px;
    padding: 28px;
    border: 1px solid rgba(218, 176, 255, 0.16);
    background: rgba(255,255,255,0.045);
    box-shadow: 0 24px 70px rgba(0,0,0,0.22);
  }

  .report-section {
    display: grid;
    gap: 10px;
    padding-bottom: 18px;
    border-bottom: 1px solid rgba(218, 176, 255, 0.12);
  }

  .report-section:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }

  .report-section h2 {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.1rem;
  }

  .report-section p,
  .report-section li {
    color: rgba(238, 222, 255, 0.78);
    font-family: 'Space Grotesk', sans-serif;
    line-height: 1.65;
  }

  .report-kv {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px 18px;
  }

  .report-kv div {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 10px 0;
    border-bottom: 1px solid rgba(218, 176, 255, 0.08);
    color: rgba(238, 222, 255, 0.78);
    font-family: 'Space Grotesk', sans-serif;
  }

  /* ── Pre-fullscreen shell (camera only, no question/feedback) ── */
  .pre-fs-shell {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .pre-fs-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 12px 16px;
    border-radius: 16px;
    border: 1px solid rgba(218,176,255,0.1);
    background: rgba(5,0,10,0.82);
  }

  .pre-fs-camera {
    position: relative;
    width: 100%;
    height: 60vh;
    border-radius: 20px;
    overflow: hidden;
    background: #050009;
    border: 1px solid rgba(218,176,255,0.1);
  }

  /* ── Fullscreen interview root — takes over entire screen ── */
  .fs-interview-root {
    position: fixed;
    inset: 0;
    z-index: 9990;
    background: #030006;
    display: flex;
    flex-direction: column;
    padding: 12px;
    gap: 10px;
    box-sizing: border-box;
  }

  .fs-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 10px 14px;
    border-radius: 14px;
    background: rgba(10,1,18,0.9);
    border: 1px solid rgba(218,176,255,0.1);
    flex-shrink: 0;
  }

  .fs-body {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    gap: 12px;
    min-height: 0;
  }

  .fs-camera-col {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .fs-camera {
    flex: 1;
    border-radius: 16px;
    overflow: hidden;
    background: #050009;
    border: 1px solid rgba(218,176,255,0.08);
    min-height: 0;
  }

  /* ══════════════════════════════════════════
     INTERVIEW LAYOUT — kept for compatibility
     ══════════════════════════════════════════ */
  .interview-layout {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  /* ── Camera stage (centre column) ── */
  .camera-stage {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .camera-stage.fullscreen-mode {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    background: #030006;
  }

  /* ── Video fills available height ── */
  .camera-feed {
    flex: 1;
    position: relative;
    display: grid;
    place-items: center;
    min-height: 0;
    background:
      linear-gradient(120deg, rgba(117, 45, 204, 0.12), transparent 42%),
      radial-gradient(circle at 50% 50%, rgba(177, 80, 255, 0.14), transparent 38%),
      #050009;
  }

  .camera-feed video {
    width: 100%;
    height: 100%;
    object-fit: contain;
    opacity: 0.92;
    filter: saturate(0.92) contrast(1.04);
    background: #050009;
  }

  /* ── Top bar ── */
  .camera-top {
    position: relative;
    z-index: 4;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 12px 16px;
    background: rgba(5, 0, 10, 0.82);
    border-bottom: 1px solid rgba(218, 176, 255, 0.1);
    flex-shrink: 0;
  }

  /* ── Left side card — Question ── */
  .interview-question-card {
    border-radius: 20px;
    border: 1px solid rgba(218, 176, 255, 0.18);
    background:
      linear-gradient(145deg, rgba(100, 30, 170, 0.22), rgba(10, 2, 22, 0.85)),
      radial-gradient(circle at 20% 0%, rgba(200, 100, 255, 0.14), transparent 55%);
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 22px 20px;
    overflow: hidden;
    min-height: 0;
  }

  .iq-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .iq-label {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    color: rgba(218, 176, 255, 0.7);
    text-transform: uppercase;
  }

  .iq-text {
    font-family: 'Rajdhani', sans-serif;
    font-size: 1.22rem;
    font-weight: 600;
    line-height: 1.55;
    color: #f0e6ff;
    flex: 1;
  }

  .iq-controls {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* ── Right side card — Feedback ── */
  .interview-feedback-card {
    border-radius: 20px;
    border: 1px solid rgba(253, 211, 77, 0.22);
    background:
      linear-gradient(145deg, rgba(120, 90, 0, 0.28), rgba(10, 7, 0, 0.88)),
      radial-gradient(circle at 80% 0%, rgba(253, 211, 77, 0.12), transparent 55%);
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 22px 20px;
    overflow: hidden;
  }

  .if-label {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    color: rgba(253, 211, 77, 0.7);
    text-transform: uppercase;
  }

  .if-empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(253, 211, 77, 0.3);
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.88rem;
    text-align: center;
    line-height: 1.6;
  }

  .if-verdict {
    font-size: 1.5rem;
    font-weight: 700;
  }

  .if-verdict.verdict-good { color: #4ade80; }
  .if-verdict.verdict-mid  { color: #fbbf24; }
  .if-verdict.verdict-low  { color: #f87171; }

  .if-summary {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.05rem;
    color: rgba(255, 240, 190, 0.92);
    line-height: 1.6;
    flex: 1;
  }

  .if-answer-area {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .timer-paused {
    color: #f87171 !important;
    border-color: rgba(248, 113, 113, 0.4) !important;
    animation: pausedPulse 1.2s ease-in-out infinite;
  }

  @keyframes pausedPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  /* ── Timer display ── */
  .interview-timer {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    border-radius: 999px;
    background: rgba(0,0,0,0.55);
    border: 1px solid rgba(255,255,255,0.12);
    font-family: 'Orbitron', sans-serif;
    font-size: 1.05rem;
    color: #e2ffd6;
    letter-spacing: 0.1em;
    white-space: nowrap;
  }

  .timer-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #4ade80;
    box-shadow: 0 0 10px #4ade80;
    animation: timerPulse 1s ease-in-out infinite;
  }

  @keyframes timerPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  /* ── Violation popup ── */
  .violation-popup {
    position: fixed;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 22px;
    border-radius: 14px;
    background: rgba(220, 38, 38, 0.92);
    border: 1px solid rgba(255, 100, 100, 0.6);
    box-shadow: 0 8px 32px rgba(220, 38, 38, 0.5);
    color: #fff;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.88rem;
    letter-spacing: 0.05em;
    animation: popIn 0.25s ease;
  }

  @keyframes popIn {
    from { opacity: 0; transform: translateX(-50%) scale(0.9); }
    to   { opacity: 1; transform: translateX(-50%) scale(1); }
  }

  /* ── Fullscreen gate overlay ── */
  .fullscreen-gate {
    position: absolute;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(5, 0, 9, 0.94);
    backdrop-filter: blur(12px);
    border-radius: 24px;
  }

  .fullscreen-gate-box {
    text-align: center;
    max-width: 460px;
    padding: 40px 32px;
    border: 1px solid rgba(213, 169, 255, 0.2);
    border-radius: 20px;
    background: rgba(20, 5, 35, 0.85);
    box-shadow: 0 20px 60px rgba(0,0,0,0.6);
  }

  /* ── Feedback summary (1-2 lines) ── */
  .feedback-summary {
    flex: 1;
    font-size: 0.92rem;
    color: rgba(248, 241, 255, 0.88);
    line-height: 1.4;
  }

  .feedback-verdict {
    font-size: 1.1rem;
    font-weight: 700;
    flex-shrink: 0;
  }

  /* ── Skip button ── */
  .skip-btn {
    min-height: 38px;
    border-radius: 999px;
    border: 1px solid rgba(253, 186, 116, 0.4);
    padding: 8px 16px;
    color: rgba(253, 186, 116, 0.9);
    background: rgba(251, 146, 60, 0.1);
    cursor: pointer;
    font: inherit;
    font-weight: 600;
    transition: background 0.2s, border-color 0.2s;
  }

  .skip-btn:hover:not(:disabled) {
    background: rgba(251, 146, 60, 0.22);
    border-color: rgba(253, 186, 116, 0.7);
  }

  .skip-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  /* ── Generate Report button turns green when interview is complete ── */
  .report-btn-ready {
    border-color: rgba(134, 239, 172, 0.5) !important;
    background: linear-gradient(135deg, #16a34a 0%, #15803d 60%, #166534 100%) !important;
    box-shadow: 0 12px 40px rgba(22, 163, 74, 0.45) !important;
  }

  /* camera-feed, camera-top, camera-bottom, fullscreen-mode defined above in interview layout */
  /* camera-stage.fullscreen-mode handled above */

  /* camera-feed styles now defined above with 70vh constraint */

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
    .metrics-grid,
    .report-kv {
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

const formatTime = (totalSeconds) => {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

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

const questionCountOptions = [3, 5, 10, 15];

const formatNetworkError = (error) => {
  if (error?.message === "Failed to fetch") {
    return `Could not reach backend at ${API_URL}. Check Render is live and CORS allows this Vercel URL.`;
  }
  return error?.message || "Something went wrong.";
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
  const [questionLimit, setQuestionLimit] = useState(5);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [interviewId, setInterviewId] = useState("");
  const [evaluations, setEvaluations] = useState([]);
  const [latestEvaluation, setLatestEvaluation] = useState(null);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [questionStartedAt, setQuestionStartedAt] = useState(Date.now());
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
  const [interviewStartedAt, setInterviewStartedAt] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [skippedQuestions, setSkippedQuestions] = useState([]);
  const [violationPopup, setViolationPopup] = useState(false);
  const [fullscreenRequired, setFullscreenRequired] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseStartedAt, setPauseStartedAt] = useState(null);
  const [violationLog, setViolationLog] = useState([]); // [{violationNumber, startedAt, duration}]
  const pauseAccumulatedRef = useRef(0); // total seconds accumulated before current pause
  const cameraRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  const currentUser = useMemo(() => {
    try {
      const raw = localStorage.getItem("twintalk_user");
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      // Check expiry — 7 days
      if (parsed._expiry && Date.now() > parsed._expiry) {
        localStorage.removeItem("twintalk_user");
        return {};
      }
      return parsed;
    } catch {
      return {};
    }
  }, []);

  const selectedReport = reports[0];
  const activeQuestions = questions[selectedDifficulty] || [];
  const questionQueue = useMemo(() => {
    const primary = (questions[selectedDifficulty] || []).map((question) => ({
      difficulty: selectedDifficulty,
      question,
    }));
    const mixed = ["easy", "medium", "hard"].flatMap((difficulty) =>
      (questions[difficulty] || []).map((question) => ({ difficulty, question }))
    );
    const pool = questionLimit <= primary.length ? primary : mixed;
    return pool.slice(0, questionLimit);
  }, [questions, questionLimit, selectedDifficulty]);
  const activeQuestionItem = questionQueue[currentQuestionIndex];
  const activeQuestion = activeQuestionItem?.question || "";
  const activeDifficulty = activeQuestionItem?.difficulty || selectedDifficulty;
  const answeredCount = evaluations.length;
  const speechSupported = typeof window !== "undefined" && (
    "SpeechRecognition" in window || "webkitSpeechRecognition" in window
  );
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
      const stageIsFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
      setIsInterviewFullscreen(stageIsFullscreen);

      if (sessionActive && !sessionDone) {
        if (!stageIsFullscreen) {
          // EXIT fullscreen — pause timer, start violation
          const now = Date.now();
          setIsPaused(true);
          setPauseStartedAt(now);
          // Snapshot accumulated time so timer can resume correctly
          pauseAccumulatedRef.current = elapsedSeconds;
          setViolations((c) => c + 1);
          setViolationPopup(true);
          setTimeout(() => setViolationPopup(false), 5000);
          // Stop TTS so question doesn't keep speaking while paused
          window.speechSynthesis?.cancel();
          // Stop voice recognition while paused
          stopVoiceInput();
        } else {
          // RE-ENTER fullscreen — resume timer, log violation duration
          const now = Date.now();
          setIsPaused(false);
          if (pauseStartedAt) {
            const outsideSeconds = Math.round((now - pauseStartedAt) / 1000);
            setViolationLog((prev) => [
              ...prev,
              {
                violationNumber: prev.length + 1,
                duration: outsideSeconds,
              },
            ]);
          }
          setPauseStartedAt(null);
          // Resume timer from where it was
          setInterviewStartedAt(Date.now() - pauseAccumulatedRef.current * 1000);
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionActive, sessionDone, elapsedSeconds, pauseStartedAt]);

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

  useEffect(() => {
    setQuestionStartedAt(Date.now());
  }, [activeQuestion]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop?.();
    };
  }, []);

  // Interview elapsed timer — pauses when candidate exits fullscreen
  useEffect(() => {
    if (sessionActive && !interviewComplete && !isPaused) {
      if (!interviewStartedAt) setInterviewStartedAt(Date.now());
      timerRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - (interviewStartedAt || Date.now())) / 1000));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [sessionActive, interviewComplete, interviewStartedAt, isPaused]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setUploadedFile(file);
    setUploadId("");
    setUploadPreview("");
    setQuestions({ easy: [], medium: [], hard: [] });
    setEvaluations([]);
    setGeneratedReport(null);
    setInterviewId("");
    setInterviewComplete(false);
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
      setWorkflowError(formatNetworkError(error));
      setIsPreparing(false);
      return;
    }

    setView("interview");
    setSessionDone(false);
    setSessionActive(false); // stays false until fullscreen confirmed
    setInterviewComplete(false);
    setEvaluations([]);
    setGeneratedReport(null);
    setInterviewId("");
    setCameraReady(false);
    setCameraError("");
    setAnswerText("");
    setLatestEvaluation(null);
    setIsPreparing(false);
    setElapsedSeconds(0);
    setInterviewStartedAt(null);
    setSkippedQuestions([]);
    setViolationPopup(false);
    setIsPaused(false);
    setPauseStartedAt(null);
    setViolationLog([]);
    pauseAccumulatedRef.current = 0;
    setFullscreenRequired(true); // show the fullscreen gate overlay

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      setCameraReady(true);
    } catch {
      setCameraError("Camera or microphone permission is not available.");
    }
  };

  const activateFullscreenAndStart = async () => {
    try {
      // Fullscreen the entire page — not just the camera div
      const el = document.documentElement;
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      setFullscreenRequired(false);
      setSessionActive(true);
      setInterviewStartedAt(Date.now());
    } catch {
      setCameraError("Fullscreen failed. Please allow fullscreen in your browser settings.");
    }
  };

  const startVoiceInput = () => {
    if (!speechSupported || isListening) return;

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = "en-IN"; // better for Indian English accents

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0].transcript;
        if (event.results[index].isFinal) {
          finalText += transcript;
        } else {
          interimText += transcript;
        }
      }

      if (finalText.trim()) {
        setAnswerText((current) => `${current}${current ? " " : ""}${finalText.trim()}`);
      }
      setInterimTranscript(interimText.trim());
    };

    recognition.onerror = (event) => {
      // no-speech is normal during pauses — don't stop, just ignore
      if (event.error === "no-speech") return;
      // network errors: try to restart
      if (event.error === "network") {
        try { recognition.stop(); } catch {}
        setTimeout(() => { if (isListening) recognition.start(); }, 300);
        return;
      }
      // aborted means we stopped it ourselves — don't show error
      if (event.error === "aborted") return;
      setWorkflowError(`Voice error: ${event.error}. Try clicking Use Voice again.`);
      setIsListening(false);
    };

    recognition.onend = () => {
      // Auto-restart as long as isListening is still true (user hasn't clicked Stop)
      // Use a ref so the closure captures the latest value
      if (recognitionRef._shouldRestart) {
        try { recognition.start(); } catch {}
      } else {
        setIsListening(false);
        setInterimTranscript("");
      }
    };

    recognitionRef.current = recognition;
    recognitionRef._shouldRestart = true;
    recognition.start();
    setWorkflowError("");
    setIsListening(true);
  };

  const stopVoiceInput = () => {
    recognitionRef._shouldRestart = false;
    recognitionRef.current?.stop?.();
    setIsListening(false);
    setInterimTranscript("");
  };

  const submitAnswer = async () => {
    if (!activeQuestion || !answerText.trim()) {
      setWorkflowError("Type an answer before submitting.");
      return;
    }

    setIsEvaluating(true);
    setWorkflowError("");
    stopVoiceInput();

    try {
      const response = await fetch(`${API_URL}/interview/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interview_id: interviewId || null,
          user_email: currentUser.email || null,
          question: activeQuestion,
          answer: answerText,
          duration_seconds: Math.max(20, Math.round((Date.now() - questionStartedAt) / 1000)),
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

      if (currentQuestionIndex < questionQueue.length - 1) {
        setCurrentQuestionIndex((index) => index + 1);
      } else {
        setInterviewComplete(true);
        setSessionActive(false);
        setWorkflowMessage("Interview complete. Generate your final report when you are ready.");
      }
    } catch (error) {
      setWorkflowError(formatNetworkError(error));
    } finally {
      setIsEvaluating(false);
    }
  };

  const skipQuestion = () => {
    if (!activeQuestion || interviewComplete) return;
    setSkippedQuestions((prev) => [...prev, { question: activeQuestion, difficulty: activeDifficulty }]);
    setAnswerText("");
    stopVoiceInput();
    if (currentQuestionIndex < questionQueue.length - 1) {
      setCurrentQuestionIndex((index) => index + 1);
    } else {
      setInterviewComplete(true);
      setSessionActive(false);
      setWorkflowMessage("Interview complete. Generate your final report when you are ready.");
    }
  };

  const endInterview = async () => {
    setIsReporting(true);
    setWorkflowError("");
    stopVoiceInput();

    setSessionActive(false);
    setSessionDone(true);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setCameraReady(false);
    }

    if (document.fullscreenElement || document.webkitFullscreenElement) {
      await (document.exitFullscreen || document.webkitExitFullscreen)?.call(document).catch(() => {});
    }

    if (interviewId) {
      try {
        const response = await fetch(`${API_URL}/analysis/report`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            interview_id: interviewId,
            user_email: currentUser.email || null,
            skipped_questions: skippedQuestions,
            violation_log: violationLog,
            total_outside_fullscreen_seconds: violationLog.reduce((sum, v) => sum + v.duration, 0),
          }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Report generation failed.");
        }

        setGeneratedReport(data.report);
      } catch (error) {
        setWorkflowError(formatNetworkError(error));
      }
    }

    setIsReporting(false);
    setView("results");
  };

  const downloadReport = () => {
    const report = generatedReport;
    const lines = [
      "TwinTalk AI Interview Report",
      `Candidate: ${currentUser.name || currentUser.email || "Current user"}`,
      `Source: ${uploadedFile?.name || "Pasted text"}`,
      `Questions answered: ${evaluations.length}`,
      `Questions skipped: ${skippedQuestions.length}`,
      `Rule violations: ${violations}`,
      `Total time outside fullscreen: ${violationLog.reduce((sum, v) => sum + v.duration, 0)}s`,
      ...(violationLog.length
        ? violationLog.map((v) => `  Violation ${v.violationNumber}: ${v.duration}s outside fullscreen`)
        : []),
      "",
      "Summary",
      report?.summary || "No generated summary available.",
      "",
      "Scores",
      `Overall score: ${report?.overall_score ?? liveAverageScore}/10`,
      `Confidence: ${report?.confidence_score ?? "N/A"}/10`,
      `Technical accuracy: ${report?.technical_accuracy ?? "N/A"}/10`,
      `Communication: ${report?.communication ?? "N/A"}/10`,
      `Hesitation: ${report?.hesitation || "N/A"}`,
      `Eye contact: ${report?.eye_contact || "N/A"}`,
      "",
      "Strengths",
      ...((report?.strengths || []).map((item) => `- ${item}`)),
      "",
      "Weaknesses",
      ...((report?.weaknesses || []).map((item) => `- ${item}`)),
      "",
      "Improvement Plan",
      ...((report?.improvement_plan || []).map((item) => `- ${item}`)),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "twintalk-interview-report.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const logout = () => {
    localStorage.removeItem("twintalk_user");
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
                    <div className="config-row">
                      <label className="config-label">
                        Interview length
                        <select
                          className="select-input"
                          value={questionLimit}
                          onChange={(event) => {
                            setQuestionLimit(Number(event.target.value));
                            setCurrentQuestionIndex(0);
                          }}
                        >
                          {questionCountOptions.map((count) => (
                            <option value={count} key={count}>{count} questions</option>
                          ))}
                        </select>
                      </label>
                    </div>
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
                  <p className="status-text">
                    Selected round: {questionLimit} question{questionLimit === 1 ? "" : "s"} · {difficultyLabels[selectedDifficulty]} first
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
                    {questionQueue.length ? (
                      questionQueue.map((item, index) => (
                        <button
                          type="button"
                          className={`insight-item ${index === currentQuestionIndex ? "tag active" : ""}`}
                          key={`${item.difficulty}-${item.question}`}
                          onClick={() => setCurrentQuestionIndex(index)}
                          style={{ textAlign: "left", cursor: "pointer" }}
                        >
                          {index + 1}. [{difficultyLabels[item.difficulty]}] {item.question}
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
            <>
              {/* ── PRE-FULLSCREEN VIEW: only camera + gate/pause overlay ── */}
              {!isInterviewFullscreen && (
                <section className="section">
                  <div className="pre-fs-shell">
                    {/* Minimal top bar */}
                    <div className="pre-fs-topbar">
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div className={`interview-timer ${isPaused ? "timer-paused" : ""}`}>
                          <span className="timer-dot" />
                          {isPaused ? "PAUSED" : formatTime(elapsedSeconds)}
                        </div>
                        <span className="status-pill">
                          <span className="signal-dot" />
                          {isPaused ? "Interview paused — return to fullscreen" : fullscreenRequired ? "Waiting for fullscreen" : "Secure interview running"}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="primary-btn"
                        onClick={activateFullscreenAndStart}
                        style={{ minWidth: 180 }}
                      >
                        <Icon name="expand" />
                        {fullscreenRequired ? "Enable Fullscreen & Start" : isPaused ? "Return to Fullscreen" : "Fullscreen"}
                      </button>
                    </div>

                    {/* Camera only — no question, no feedback */}
                    <div className="pre-fs-camera" ref={cameraRef}>
                      {cameraReady ? (
                        <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "contain", background: "#050009" }} />
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, opacity: 0.6 }}>
                          <Icon name="camera" size={48} />
                          <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "0.9rem" }}>Camera initialising...</p>
                        </div>
                      )}

                      {/* Gate overlay — before they click Enable Fullscreen */}
                      {fullscreenRequired && (
                        <div className="fullscreen-gate">
                          <div className="fullscreen-gate-box">
                            <div style={{ fontSize: "2.8rem", marginBottom: 14 }}>🖥</div>
                            <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.2rem", marginBottom: 12 }}>
                              Fullscreen Required
                            </h2>
                            <p style={{ opacity: 0.75, marginBottom: 28, fontSize: "0.9rem", lineHeight: 1.6, maxWidth: 380 }}>
                              The interview runs in fullscreen mode only. Your question, camera, and answer panel will appear once you enable fullscreen. Exiting fullscreen during the interview counts as a violation and pauses the timer.
                            </p>
                            <button
                              type="button"
                              className="primary-btn"
                              onClick={activateFullscreenAndStart}
                              style={{ fontSize: "1rem", padding: "14px 32px" }}
                            >
                              <Icon name="expand" /> Enable Fullscreen &amp; Start Interview
                            </button>
                            {cameraError && <p style={{ color: "#f0abfc", marginTop: 14, fontSize: "0.85rem" }}>{cameraError}</p>}
                          </div>
                        </div>
                      )}

                      {/* Pause overlay — they exited fullscreen mid-interview */}
                      {isPaused && !fullscreenRequired && (
                        <div className="fullscreen-gate" style={{ background: "rgba(60,0,0,0.92)" }}>
                          <div className="fullscreen-gate-box" style={{ borderColor: "rgba(248,113,113,0.3)" }}>
                            <div style={{ fontSize: "2.8rem", marginBottom: 14 }}>⏸</div>
                            <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.2rem", marginBottom: 12, color: "#f87171" }}>
                              Interview Paused
                            </h2>
                            <p style={{ opacity: 0.8, marginBottom: 8, fontSize: "0.9rem", lineHeight: 1.6 }}>
                              You exited fullscreen. Timer is paused.
                            </p>
                            <p style={{ color: "#f87171", marginBottom: 28, fontSize: "0.85rem" }}>
                              Violation #{violations} recorded — {violationLog[violationLog.length - 1] ? `${violationLog[violationLog.length - 1].duration}s` : "timing..."}
                            </p>
                            <button
                              type="button"
                              className="primary-btn"
                              onClick={activateFullscreenAndStart}
                              style={{ fontSize: "1rem", padding: "14px 32px", background: "linear-gradient(135deg,#dc2626,#991b1b)" }}
                            >
                              <Icon name="expand" /> Return to Fullscreen
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <p style={{ textAlign: "center", fontFamily: "Space Grotesk, sans-serif", fontSize: "0.82rem", opacity: 0.45, marginTop: 10 }}>
                      Questions and answer controls only appear inside fullscreen mode
                    </p>
                  </div>
                </section>
              )}

              {/* ── FULLSCREEN VIEW: 3-column layout — only renders when fullscreen is active ── */}
              {isInterviewFullscreen && (
                <div className="fs-interview-root">
                  {/* Violation flash popup */}
                  {violationPopup && (
                    <div className="violation-popup">
                      ⚠ FULLSCREEN EXITED — Timer paused. Return to fullscreen to resume.
                    </div>
                  )}

                  {/* Top bar */}
                  <div className="fs-topbar">
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div className="interview-timer">
                        <span className="timer-dot" />
                        {formatTime(elapsedSeconds)}
                      </div>
                      <span className="status-pill"><span className="signal-dot" />Secure interview running</span>
                      <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.75rem", opacity: 0.5 }}>
                        {interviewComplete ? "Interview complete" : "Technical depth round"}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        type="button"
                        className={`primary-btn ${interviewComplete ? "report-btn-ready" : ""}`}
                        onClick={endInterview}
                        disabled={isReporting || !interviewId}
                      >
                        {isReporting ? "Generating..." : interviewComplete ? "Generate Final Report" : "Generate Report"}
                      </button>
                    </div>
                  </div>

                  {/* 3-column body */}
                  <div className="fs-body">

                    {/* LEFT — Question */}
                    <div className="interview-question-card">
                      <div className="iq-meta">
                        <span className="iq-label">
                          Q {Math.min(currentQuestionIndex + 1, questionQueue.length || 1)} / {questionQueue.length || 1}
                        </span>
                        <span className={`diff-badge diff-${activeDifficulty}`}>{difficultyLabels[activeDifficulty]}</span>
                      </div>
                      {interviewComplete ? (
                        <p className="iq-text" style={{ color: "#4ade80" }}>
                          Interview complete. {answeredCount} answered — generate your report.
                        </p>
                      ) : (
                        <p className="iq-text">
                          {activeQuestion || "No question — go back and generate questions first."}
                        </p>
                      )}
                      <div className="iq-controls">
                        {cameraError && <p style={{ color: "#f0abfc", fontSize: "0.82rem" }}>{cameraError}</p>}
                        {workflowError && <p style={{ color: "#f0abfc", fontSize: "0.82rem" }}>{workflowError}</p>}
                        <p style={{ fontSize: "0.75rem", opacity: 0.4 }}>Violations: {violations}</p>
                      </div>
                    </div>

                    {/* CENTRE — Camera */}
                    <div className="fs-camera-col">
                      <div ref={cameraRef} className="fs-camera">
                        {cameraReady ? (
                          <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "contain", background: "#050009" }} />
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", opacity: 0.5 }}>
                            <Icon name="camera" size={48} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* RIGHT — Feedback + Answer */}
                    <div className="interview-feedback-card">
                      <span className="if-label">Last answer feedback</span>
                      {latestEvaluation ? (
                        <>
                          <div className={`if-verdict ${latestEvaluation.overall_score >= 7 ? "verdict-good" : latestEvaluation.overall_score >= 4 ? "verdict-mid" : "verdict-low"}`}>
                            {latestEvaluation.overall_score >= 7 ? "✓ Strong" : latestEvaluation.overall_score >= 4 ? "~ Partial" : "✗ Weak"}
                          </div>
                          <p className="if-summary">{latestEvaluation.summary}</p>
                        </>
                      ) : (
                        <div className="if-empty">Feedback appears here after your first answer.</div>
                      )}

                      <div className="if-answer-area">
                        <textarea
                          className="answer-box"
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                          disabled={interviewComplete}
                          placeholder={interviewComplete ? "Interview complete" : "Type your answer or use voice..."}
                          style={{ minHeight: 100 }}
                        />
                        {interimTranscript && (
                          <p className="panel-copy listening-indicator">🎙 {interimTranscript}</p>
                        )}
                        <div className="voice-row">
                          <button
                            type="button"
                            className={`ghost-btn ${isListening ? "listening-active" : ""}`}
                            onClick={isListening ? stopVoiceInput : startVoiceInput}
                            disabled={!speechSupported || interviewComplete}
                          >
                            <Icon name="mic" /> {isListening ? "● Stop" : "Use Voice"}
                          </button>
                          <button
                            type="button"
                            className="skip-btn"
                            onClick={skipQuestion}
                            disabled={interviewComplete || !activeQuestion}
                          >
                            Skip
                          </button>
                        </div>
                        <button
                          type="button"
                          className="primary-btn"
                          onClick={submitAnswer}
                          disabled={isEvaluating || !activeQuestion || interviewComplete}
                          style={{ width: "100%", marginTop: 6 }}
                        >
                          {isEvaluating ? "Evaluating..." : currentQuestionIndex === questionQueue.length - 1 ? "Submit Final Answer" : "Submit Answer"}
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </>
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
                  <h1 className="section-title">Interview performance report</h1>
                  <p className="section-copy">
                    Generated for {currentUser.name || "the current user"} after the adaptive interview session.
                  </p>
                </div>
                <div className="action-row" style={{ marginTop: 0 }}>
                  <button type="button" className="ghost-btn" onClick={() => setView("assess")}>
                    <Icon name="upload" /> New Interview
                  </button>
                  <button type="button" className="primary-btn" onClick={downloadReport} disabled={!generatedReport}>
                    <Icon name="report" /> Download Report
                  </button>
                </div>
              </div>

              <article className="report-document">
                <section className="report-section">
                  <h2>Overview</h2>
                  <p>
                    {generatedReport?.summary ||
                      "Submit at least one answer and generate the final report to see the full review."}
                  </p>
                  {workflowError && <p className="error-text">{workflowError}</p>}
                </section>

                <section className="report-section">
                  <h2>Session Details</h2>
                  <div className="report-kv">
                    <div><span>Candidate</span><strong>{currentUser.name || currentUser.email || "Current user"}</strong></div>
                    <div><span>Source</span><strong>{uploadedFile?.name || "Pasted text"}</strong></div>
                    <div><span>Questions answered</span><strong>{evaluations.length}</strong></div>
                    <div><span>Questions skipped</span><strong>{skippedQuestions.length}</strong></div>
                    <div><span>Rule violations</span><strong>{violations}</strong></div>
                    <div><span>Total time outside fullscreen</span><strong>{violationLog.reduce((sum, v) => sum + v.duration, 0)}s</strong></div>
                  </div>
                  {violationLog.length > 0 && (
                    <div style={{ marginTop: 14 }}>
                      <p style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.78rem", color: "rgba(248,113,113,0.9)", letterSpacing: "0.06em", marginBottom: 8 }}>
                        FULLSCREEN VIOLATION BREAKDOWN
                      </p>
                      {violationLog.map((v) => (
                        <div key={v.violationNumber} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(248,113,113,0.12)", color: "rgba(252,165,165,0.85)", fontFamily: "Space Grotesk, sans-serif", fontSize: "0.88rem" }}>
                          <span>Violation {v.violationNumber}</span>
                          <strong style={{ color: "#f87171" }}>{v.duration}s outside fullscreen</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="report-section">
                  <h2>Scores</h2>
                  <div className="report-kv">
                    <div><span>Overall score</span><strong>{generatedReport?.overall_score ?? Math.round(liveAverageScore / 10)}/10</strong></div>
                    <div><span>Confidence</span><strong>{generatedReport?.confidence_score ?? "N/A"}/10</strong></div>
                    <div><span>Technical accuracy</span><strong>{generatedReport?.technical_accuracy ?? "N/A"}/10</strong></div>
                    <div><span>Communication</span><strong>{generatedReport?.communication ?? "N/A"}/10</strong></div>
                    <div><span>Hesitation</span><strong>{generatedReport?.hesitation || "N/A"}</strong></div>
                    <div><span>Eye contact</span><strong>{generatedReport?.eye_contact || "N/A"}</strong></div>
                  </div>
                </section>

                <section className="report-section">
                  <h2>Strengths</h2>
                  {generatedReport?.strengths?.length ? (
                    <ul>{generatedReport.strengths.map((item) => <li key={item}>{item}</li>)}</ul>
                  ) : (
                    <p>Strengths will appear after the AI report is generated.</p>
                  )}
                </section>

                <section className="report-section">
                  <h2>Weaknesses</h2>
                  {generatedReport?.weaknesses?.length ? (
                    <ul>{generatedReport.weaknesses.map((item) => <li key={item}>{item}</li>)}</ul>
                  ) : (
                    <p>Weak areas will appear after the AI report is generated.</p>
                  )}
                </section>

                <section className="report-section">
                  <h2>Improvement Plan</h2>
                  {generatedReport?.improvement_plan?.length ? (
                    <ol>{generatedReport.improvement_plan.map((item) => <li key={item}>{item}</li>)}</ol>
                  ) : (
                    <p>Generate the report after the interview to receive personalized next steps.</p>
                  )}
                </section>
              </article>
            </section>
          )}
        </main>
      </div>
    </>
  );
}