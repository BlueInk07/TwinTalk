import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────
   TYPEWRITER – "who's the real you?"
───────────────────────────────────────── */
const TypewriterText = ({ text }) => {
  const [displayed, setDisplayed] = useState("");
  const [phase, setPhase] = useState("typing");
  const idx = useRef(0);

  useEffect(() => {
    let timer;
    if (phase === "typing") {
      if (idx.current < text.length) {
        timer = setTimeout(() => {
          setDisplayed(text.slice(0, idx.current + 1));
          idx.current += 1;
        }, 72);
      } else {
        timer = setTimeout(() => setPhase("erasing"), 2600);
      }
    } else {
      if (idx.current > 0) {
        timer = setTimeout(() => {
          idx.current -= 1;
          setDisplayed(text.slice(0, idx.current));
        }, 36);
      } else {
        timer = setTimeout(() => setPhase("typing"), 800);
      }
    }
    return () => clearTimeout(timer);
  }, [phase, displayed, text]);

  return (
    <span style={{
      background: "linear-gradient(90deg,#f0abfc,#c084fc,#a855f7,#7c3aed)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      fontWeight: 700,
    }}>
      {displayed}
      <span style={{
        display: "inline-block",
        width: "2px",
        height: "0.9em",
        background: "linear-gradient(180deg,#c084fc,#7c3aed)",
        marginLeft: "3px",
        verticalAlign: "text-bottom",
        borderRadius: "1px",
        animation: "cursorBlink 0.75s step-end infinite",
        WebkitTextFillColor: "initial",
      }} />
    </span>
  );
};

/* ─────────────────────────────────────────
   FUTURISTIC 3-D WAVE CANVAS
───────────────────────────────────────── */
const WaveCanvas = () => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const waveBands = [
      { amp: 18, freq: 0.006, speed: 0.005, yBase: 0.34, thick: 0.6, alpha: 0.5,  col: "#3b0764" },
      { amp: 26, freq: 0.008, speed: 0.007, yBase: 0.41, thick: 0.8, alpha: 0.6,  col: "#4c1d95" },
      { amp: 38, freq: 0.010, speed: 0.010, yBase: 0.48, thick: 1.2, alpha: 0.7,  col: "#5b21b6" },
      { amp: 52, freq: 0.013, speed: 0.014, yBase: 0.55, thick: 1.8, alpha: 0.85, col: "#7c3aed" },
      { amp: 66, freq: 0.016, speed: 0.018, yBase: 0.62, thick: 2.4, alpha: 0.95, col: "#9333ea" },
      { amp: 72, freq: 0.019, speed: 0.022, yBase: 0.69, thick: 3.2, alpha: 1.0,  col: "#a855f7" },
      { amp: 58, freq: 0.022, speed: 0.027, yBase: 0.76, thick: 2.2, alpha: 0.9,  col: "#c084fc" },
      { amp: 42, freq: 0.026, speed: 0.032, yBase: 0.83, thick: 1.4, alpha: 0.7,  col: "#d8b4fe" },
      { amp: 28, freq: 0.030, speed: 0.038, yBase: 0.89, thick: 0.8, alpha: 0.45, col: "#ede9fe" },
    ];

    const drawPerspectiveGrid = (t) => {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      const horizon = H * 0.40;
      const vp = { x: W * 0.5, y: horizon };

      for (let i = 1; i <= 22; i++) {
        const frac = (i / 22) ** 1.85;
        const y0 = horizon + (H - horizon) * frac;
        let waveOffset = 0;
        waveBands.forEach((w) => {
          waveOffset += Math.sin(i * 0.6 + t * w.speed * 0.7) * w.amp * 0.08;
        });
        ctx.beginPath();
        for (let x = 0; x <= W; x += 4) {
          const perspX = vp.x + (x - vp.x) * (1 - frac * 0.3);
          const wy = y0 + waveOffset + Math.sin(x * 0.018 + t * 0.012) * 6 * frac;
          x === 0 ? ctx.moveTo(perspX, wy) : ctx.lineTo(perspX, wy);
        }
        ctx.strokeStyle = `rgba(139,92,246,${frac * 0.28 + 0.04})`;
        ctx.lineWidth = 0.5 + frac * 0.4;
        ctx.stroke();
      }

      for (let i = 0; i <= 28; i++) {
        const t0 = i / 28;
        const bx = t0 * W;
        const al = 0.04 + 0.10 * Math.sin(t0 * Math.PI);
        ctx.beginPath();
        ctx.moveTo(vp.x + (bx - vp.x) * 0.05, vp.y);
        ctx.lineTo(bx, H);
        ctx.strokeStyle = `rgba(109,40,217,${al})`;
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }

      const hGrad = ctx.createLinearGradient(0, horizon, W, horizon);
      hGrad.addColorStop(0, "transparent");
      hGrad.addColorStop(0.2, "rgba(139,92,246,0.35)");
      hGrad.addColorStop(0.5, "rgba(168,85,247,0.55)");
      hGrad.addColorStop(0.8, "rgba(139,92,246,0.35)");
      hGrad.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.moveTo(0, horizon);
      ctx.lineTo(W, horizon);
      ctx.strokeStyle = hGrad;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "#9333ea";
      ctx.shadowBlur = 18;
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    const drawDotField = (t) => {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      const sp = 16;
      const startY = H * 0.36;
      const cols = Math.ceil(W / sp) + 1;
      const rows = Math.ceil(H * 0.68 / sp) + 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const bx = c * sp;
          const by = startY + r * sp;
          let dy = 0;
          waveBands.forEach((w) => {
            const wY = H * w.yBase + Math.sin(bx * w.freq + t * w.speed) * w.amp;
            const d = Math.abs(by - wY);
            if (d < 65) dy += (1 - d / 65) * 9 * Math.sin(bx * w.freq * 2.2 + t * w.speed * 1.6);
          });
          const px = bx, py = by + dy;
          let brightness = 0;
          waveBands.forEach((w) => {
            const wY = H * w.yBase + Math.sin(bx * w.freq + t * w.speed) * w.amp;
            const d = Math.abs(py - wY);
            if (d < 75) brightness = Math.max(brightness, 1 - d / 75);
          });
          const op = 0.04 + brightness * 0.72;
          const rad = 0.6 + brightness * 2.8;
          ctx.beginPath();
          ctx.arc(px, py, rad, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${Math.round(110 + brightness * 145)},${Math.round(10 + brightness * 15)},${Math.round(170 + brightness * 85)},${op})`;
          ctx.fill();
        }
      }
    };

    const drawWaves = (t) => {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      waveBands.forEach((w, i) => {
        const pts = [];
        for (let x = 0; x <= W; x += 2) {
          const y =
            H * w.yBase +
            Math.sin(x * w.freq + t * w.speed) * w.amp +
            Math.sin(x * w.freq * 2.1 + t * w.speed * 1.7 + 1.2) * w.amp * 0.22 +
            Math.sin(x * w.freq * 0.5 + t * w.speed * 0.6 + 2.8) * w.amp * 0.14;
          pts.push([x, y]);
        }

        const grad = ctx.createLinearGradient(0, 0, W, 0);
        grad.addColorStop(0, w.col + "00");
        grad.addColorStop(0.15, w.col + "cc");
        grad.addColorStop(0.5, w.col + "ff");
        grad.addColorStop(0.85, w.col + "cc");
        grad.addColorStop(1, w.col + "00");

        ctx.beginPath();
        ctx.moveTo(0, H);
        pts.forEach(([x, y]) => ctx.lineTo(x, y));
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.globalAlpha = 0.04 + i * 0.006;
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.beginPath();
        pts.forEach(([x, y], j) => (j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
        ctx.strokeStyle = grad;
        ctx.lineWidth = w.thick * 3.5;
        ctx.globalAlpha = 0.14;
        ctx.shadowColor = w.col;
        ctx.shadowBlur = 28;
        ctx.stroke();

        ctx.beginPath();
        pts.forEach(([x, y], j) => (j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
        ctx.strokeStyle = grad;
        ctx.lineWidth = w.thick;
        ctx.globalAlpha = w.alpha;
        ctx.shadowColor = w.col;
        ctx.shadowBlur = 12;
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      });
    };

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random(), y: 0.35 + Math.random() * 0.6,
      vx: (Math.random() - 0.5) * 0.0003,
      vy: -0.00015 - Math.random() * 0.0002,
      size: 0.8 + Math.random() * 1.6,
      alpha: 0.2 + Math.random() * 0.5,
      life: Math.random(),
    }));

    const drawParticles = (t) => {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      particles.forEach((p) => {
        p.x += p.vx + Math.sin(t * 0.008 + p.life * 10) * 0.0002;
        p.y += p.vy;
        p.life += 0.002;
        if (p.y < 0.3 || p.x < 0 || p.x > 1) {
          p.x = Math.random(); p.y = 0.85 + Math.random() * 0.1; p.life = Math.random();
        }
        const fade = Math.sin(p.life * Math.PI) * p.alpha;
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(192,132,252,${fade})`;
        ctx.shadowColor = "#c084fc";
        ctx.shadowBlur = 6;
        ctx.fill();
      });
      ctx.shadowBlur = 0;
    };

    const animate = () => {
      tRef.current += 1;
      const t = tRef.current;
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      ctx.clearRect(0, 0, W, H);

      const bg = ctx.createRadialGradient(W * 0.3, H * 0.3, 0, W * 0.5, H * 0.5, W * 1.1);
      bg.addColorStop(0, "#1e0a35");
      bg.addColorStop(0.3, "#110120");
      bg.addColorStop(0.65, "#08000f");
      bg.addColorStop(1, "#020004");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      if (t % 3 === 0) {
        for (let s = 0; s < 3; s++) {
          ctx.beginPath();
          ctx.arc(Math.random() * W, Math.random() * H * 0.45, Math.random() * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(220,200,255,${Math.random() * 0.4})`;
          ctx.fill();
        }
      }

      drawPerspectiveGrid(t);
      drawDotField(t);
      drawWaves(t);
      drawParticles(t);

      const bloom = ctx.createRadialGradient(W * 0.55, H * 0.65, 0, W * 0.55, H * 0.65, W * 0.52);
      bloom.addColorStop(0, "rgba(147,51,234,0.13)");
      bloom.addColorStop(0.4, "rgba(109,40,217,0.06)");
      bloom.addColorStop(1, "transparent");
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, W, H);

      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas ref={canvasRef}
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", display: "block" }} />
  );
};

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function App() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");
  const [cardHover, setCardHover] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  /* ── Called by Google's SDK once the user picks an account ── */
  function handleCredentialResponse(response) {
    setGoogleLoading(true);
    setError("");

    fetch(`${API_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: response.credential }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Authentication failed");
        return res.json();
      })
      .then((data) => {
        if (data.status === "success") {
          // Persist user info for FeaturesPage to use (optional)
          sessionStorage.setItem("twintalk_user", JSON.stringify({
            email: data.email,
            name: data.name,
            picture: data.picture,
          }));
          navigate("/features");
        } else {
          throw new Error("Unexpected response from server");
        }
      })
      .catch((err) => {
        setError("Login failed. Please try again.");
        console.error("Google auth error:", err);
      })
      .finally(() => setGoogleLoading(false));
  }

  /* ── Load Google Identity Services script & render button ── */
  useEffect(() => {
    // If already loaded (hot-reload), just re-init
    if (window.google?.accounts) {
      initGoogle();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    script.onerror = () => setError("Failed to load Google Sign-In. Check your connection.");
    document.body.appendChild(script);

    return () => {
      // Clean up the script on unmount
      document.body.removeChild(script);
    };
  }, []);

  function initGoogle() {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    // Render the standard Google button
    const container = document.getElementById("googleSignInDiv");
    if (container) {
      container.innerHTML = ""; // clear on re-init
      window.google.accounts.id.renderButton(container, {
        theme: "filled_black",
        size: "large",
        shape: "pill",
        text: activeTab === "login" ? "signin_with" : "signup_with",
        logo_alignment: "left",
        width: 340,
      });
    }

    // Also show the One Tap prompt
    window.google.accounts.id.prompt();
  }

  // Re-render button when tab changes
  useEffect(() => {
    if (window.google?.accounts) {
      initGoogle();
    }
  }, [activeTab]);

  const inputStyle = {
    background: "rgba(255,255,255,0.045)",
    border: "1px solid rgba(168,85,247,0.22)",
    borderRadius: "10px",
    padding: "12px 16px",
    color: "#ede9fe",
    fontSize: "13px",
    fontFamily: "inherit",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.25s, background 0.25s",
  };

  return (
    <div style={{
      width: "100%", minHeight: "100vh",
      position: "relative", overflowX: "hidden", overflowY: "auto",
      fontFamily: "'Courier New', monospace",
      background: "#020004",
    }}>
      <WaveCanvas />

      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1,
        background: "linear-gradient(100deg,rgba(2,0,6,0.62) 0%,rgba(2,0,6,0.28) 55%,transparent 100%)",
      }} />

      <div style={{
        position: "relative", zIndex: 2,
        width: "100%", height: "100%",
        display: "flex", flexDirection: "column",
        overflowX: "hidden",
      }}>

        {/* NAV */}
        <nav style={{
          display: "flex", alignItems: "center",
          justifyContent: "flex-end",
          padding: "40px 44px 0",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{
              fontSize: "22px", fontWeight: "800",
              color: "#ede0ff", letterSpacing: "1px",
              fontFamily: "'Trebuchet MS', sans-serif",
            }}>TWINtalk</span>
            <svg viewBox="0 0 36 26" fill="none" style={{ width: "34px", height: "24px" }}>
              <rect x="1" y="1" width="20" height="14" rx="4"
                stroke="#a78bfa" strokeWidth="1.5" fill="rgba(109,40,217,0.3)" />
              <rect x="10" y="8" width="20" height="14" rx="4"
                stroke="#7c3aed" strokeWidth="1.5" fill="rgba(76,29,149,0.4)" />
            </svg>
          </div>
        </nav>

        {/* BODY */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          justifyContent: "center",
          padding: "0 48px 80px",
          maxWidth: "600px",
        }}>

          <h1 style={{
            fontSize: "clamp(24px,3.8vw,40px)",
            fontWeight: "900", color: "#f5eeff",
            letterSpacing: "3px", textTransform: "uppercase",
            lineHeight: 1.15, margin: "0 0 10px 0",
            fontFamily: "'Trebuchet MS', sans-serif",
          }}>
            The Ultimate Identity<br />Mind Tracker
          </h1>

          <div style={{
            fontSize: "clamp(22px,3vw,36px)",
            fontWeight: "900", letterSpacing: "6px",
            textTransform: "uppercase", marginBottom: "26px",
            background: "linear-gradient(90deg,#f0abfc 0%,#d946ef 20%,#a855f7 45%,#7c3aed 65%,#c084fc 85%,#f0abfc 100%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "shimmer 3.5s linear infinite",
            filter: "drop-shadow(0 0 18px rgba(168,85,247,0.45))",
          }}>
            Powered by AI
          </div>

          <p style={{
            fontSize: "clamp(17px,1.7vw,21px)",
            lineHeight: 1.9,
            color: "rgba(228,215,255,0.85)",
            maxWidth: "470px",
            margin: "0 0 40px 0",
          }}>
            An AI-powered social platform that clones the way<br />
            you text, think, and talk. Can your friends guess{" "}
            <TypewriterText text="who's the real you?" />
          </p>

          {/* AUTH CARD */}
          <div
            onMouseEnter={() => setCardHover(true)}
            onMouseLeave={() => setCardHover(false)}
            style={{
              maxWidth: "400px",
              borderRadius: "22px",
              padding: "2px",
              background: cardHover
                ? "linear-gradient(135deg,#f0abfc,#c084fc 25%,#9333ea 50%,#7c3aed 75%,#d8b4fe)"
                : "linear-gradient(135deg,rgba(216,180,254,0.55),rgba(168,85,247,0.35),rgba(109,40,217,0.28),rgba(192,132,252,0.45))",
              boxShadow: cardHover
                ? "0 0 80px rgba(168,85,247,0.5), 0 0 160px rgba(109,40,217,0.25), 0 24px 70px rgba(0,0,0,0.6)"
                : "0 0 35px rgba(109,40,217,0.22), 0 12px 44px rgba(0,0,0,0.45)",
              transform: cardHover ? "scale(1.035) translateY(-4px)" : "scale(1) translateY(0)",
              transition: "all 0.42s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            <div style={{
              borderRadius: "20px",
              padding: "30px 28px 28px",
              background: "linear-gradient(160deg,rgba(20,5,40,0.94) 0%,rgba(8,1,18,0.97) 55%,rgba(24,6,44,0.92) 100%)",
              backdropFilter: "blur(32px)",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Sheens */}
              <div style={{
                position: "absolute", top: 0, left: "-10%",
                width: "120%", height: "1px",
                background: "linear-gradient(90deg,transparent,rgba(240,171,252,0.75),rgba(192,132,252,0.9),rgba(240,171,252,0.75),transparent)",
                opacity: cardHover ? 1 : 0.55, transition: "opacity 0.4s", pointerEvents: "none",
              }} />
              <div style={{
                position: "absolute", bottom: 0, right: 0,
                width: "100%", height: "1px",
                background: "linear-gradient(90deg,transparent,rgba(124,58,237,0.4),rgba(168,85,247,0.25),transparent)",
                pointerEvents: "none",
              }} />
              <div style={{
                position: "absolute", top: -50, right: -50,
                width: "200px", height: "200px",
                background: "radial-gradient(circle,rgba(168,85,247,0.18) 0%,rgba(109,40,217,0.06) 60%,transparent 100%)",
                opacity: cardHover ? 1 : 0.5, transition: "opacity 0.4s", pointerEvents: "none",
              }} />
              <div style={{
                position: "absolute", bottom: -40, left: -40,
                width: "160px", height: "160px",
                background: "radial-gradient(circle,rgba(192,132,252,0.12) 0%,transparent 70%)",
                pointerEvents: "none",
              }} />

              {/* Tabs */}
              <div style={{
                display: "flex", marginBottom: "22px",
                borderBottom: "1px solid rgba(139,92,246,0.18)",
              }}>
                {["login", "signup"].map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{
                    flex: 1, padding: "10px",
                    background: "none", border: "none",
                    borderBottom: activeTab === tab ? "2px solid #c084fc" : "2px solid transparent",
                    color: activeTab === tab ? "#d8b4fe" : "rgba(255,255,255,0.3)",
                    fontSize: "11px", letterSpacing: "2.5px",
                    textTransform: "uppercase",
                    cursor: "pointer", fontFamily: "inherit",
                    transition: "all 0.22s", marginBottom: "-1px",
                    fontWeight: activeTab === tab ? "700" : "400",
                    textShadow: activeTab === tab ? "0 0 12px rgba(192,132,252,0.5)" : "none",
                  }}>
                    {tab === "login" ? "Login" : "Sign Up"}
                  </button>
                ))}
              </div>

              {/* ── GOOGLE SIGN-IN SECTION ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>

                {/* Heading */}
                <p style={{
                  color: "rgba(216,180,254,0.6)",
                  fontSize: "11px", letterSpacing: "2px",
                  textTransform: "uppercase", textAlign: "center",
                  margin: 0,
                }}>
                  {activeTab === "login" ? "Continue with your Google account" : "Create your account with Google"}
                </p>

                {/* Error message */}
                {error && (
                  <div style={{
                    background: "rgba(220,38,38,0.12)",
                    border: "1px solid rgba(220,38,38,0.35)",
                    borderRadius: "8px",
                    padding: "8px 14px",
                    color: "#fca5a5",
                    fontSize: "12px",
                    textAlign: "center",
                    width: "100%",
                  }}>
                    {error}
                  </div>
                )}

                {/* Loading overlay or Google button */}
                {googleLoading ? (
                  <div style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    color: "rgba(216,180,254,0.7)", fontSize: "13px",
                    padding: "12px 0",
                  }}>
                    <div style={{
                      width: "18px", height: "18px",
                      border: "2px solid rgba(168,85,247,0.3)",
                      borderTop: "2px solid #c084fc",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }} />
                    Authenticating...
                  </div>
                ) : (
                  <div id="googleSignInDiv" style={{ width: "100%", display: "flex", justifyContent: "center" }} />
                )}

                {/* Privacy note */}
                <p style={{
                  color: "rgba(196,160,255,0.3)",
                  fontSize: "10px", textAlign: "center",
                  margin: 0, lineHeight: 1.5,
                }}>
                  By continuing, you agree to TwinTalk's Terms &amp; Privacy Policy.<br />
                  We only use your Google account to verify your identity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        html, body { overflow-x: hidden !important; margin: 0; padding: 0; max-width: 100%; }
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes cursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes shimmer { 0%{background-position:0% center} 100%{background-position:200% center} }
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(196,160,255,0.26); }
        input:focus {
          border-color: rgba(168,85,247,0.55) !important;
          background: rgba(139,92,246,0.09) !important;
          box-shadow: 0 0 0 3px rgba(109,40,217,0.12);
        }
        button { outline: none; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: rgba(5,0,10,0.8); border-left: 1px solid rgba(109,40,217,0.15); }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #c084fc, #9333ea, #6d28d9);
          border-radius: 3px;
          box-shadow: 0 0 8px rgba(168,85,247,0.7), 0 0 16px rgba(109,40,217,0.4);
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #f0abfc, #c084fc, #9333ea);
          box-shadow: 0 0 12px rgba(192,132,252,0.9), 0 0 24px rgba(168,85,247,0.5);
        }
        * { scrollbar-width: thin; scrollbar-color: #9333ea rgba(5,0,10,0.8); }
      `}</style>
    </div>
  );
}
