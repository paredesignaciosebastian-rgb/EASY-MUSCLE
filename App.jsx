import { useState, useRef, useEffect } from "react";

const API_URL = "https://api.anthropic.com/v1/messages";

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons = {
  muscle: "M6.5 6.5c0-1.1.9-2 2-2h7c1.1 0 2 .9 2 2v11c0 1.1-.9 2-2 2h-7c-1.1 0-2-.9-2-2V6.5z M9 9h6 M9 12h6 M9 15h4",
  check: "M20 6L9 17l-5-5",
  chat: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  send: "M22 2L11 13 M22 2L15 22 8 13 2 9l20-7z",
  fire: "M12 2C6.5 6.5 4 10 4 14a8 8 0 0016 0c0-4-2.5-7.5-8-12z",
  user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
  bolt: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  target: "M12 22a10 10 0 100-20 10 10 0 000 20z M12 18a6 6 0 100-12 6 6 0 000 12z M12 14a2 2 0 100-4 2 2 0 000 4z",
  refresh: "M23 4v6h-6 M1 20v-6h6 M3.5 9A9 9 0 0121 12 M20.5 15A9 9 0 013 12",
  x: "M18 6L6 18 M6 6l12 12",
  arrow: "M5 12h14 M12 5l7 7-7 7",
  dumbbell: "M6 5v14 M18 5v14 M6 9h12 M6 15h12",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  trophy: "M6 9H4.5a2.5 2.5 0 010-5H6 M18 9h1.5a2.5 2.5 0 000-5H18 M4 22h16 M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22 M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22 M18 2H6v7a6 6 0 0012 0V2z",
  close: "M18 6L6 18 M6 6l12 12",
};

// ─── STYLES ──────────────────────────────────────────────────────────────────
const injectStyles = () => {
  if (document.getElementById("em-styles")) return;
  const style = document.createElement("style");
  style.id = "em-styles";
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:ital,wght@0,400;0,600;0,700;1,400&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #0a0a0a;
      --surface: #111111;
      --surface2: #1a1a1a;
      --border: #2a2a2a;
      --accent: #FF4500;
      --accent2: #FF6B35;
      --gold: #FFB800;
      --text: #F0F0F0;
      --muted: #666;
      --green: #00E676;
    }

    .em-root {
      font-family: 'Barlow', sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      overflow-x: hidden;
    }

    .em-heading { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.04em; }

    /* Animated background grid */
    .em-bg-grid {
      position: fixed; inset: 0; pointer-events: none; z-index: 0;
      background-image: 
        linear-gradient(rgba(255,69,0,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,69,0,0.03) 1px, transparent 1px);
      background-size: 40px 40px;
    }

    /* SPLASH */
    .splash {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-height: 100vh; position: relative; z-index: 1; padding: 24px; text-align: center;
    }
    .splash-logo {
      font-family: 'Bebas Neue', sans-serif;
      font-size: clamp(64px, 15vw, 120px);
      line-height: 0.9;
      background: linear-gradient(135deg, #FF4500 0%, #FF6B35 40%, #FFB800 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 0 40px rgba(255,69,0,0.4));
      animation: logoIn 0.8s ease-out;
    }
    .splash-sub {
      font-size: 13px; letter-spacing: 0.3em; text-transform: uppercase;
      color: var(--muted); margin-top: 8px; animation: fadeUp 1s ease-out 0.3s both;
    }
    .splash-cta {
      margin-top: 60px; animation: fadeUp 1s ease-out 0.6s both;
    }

    /* BUTTONS */
    .btn-primary {
      background: linear-gradient(135deg, #FF4500, #FF6B35);
      color: white; border: none; padding: 16px 48px;
      font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 0.1em;
      cursor: pointer; clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
      transition: all 0.2s; box-shadow: 0 0 30px rgba(255,69,0,0.4);
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 50px rgba(255,69,0,0.6); }
    .btn-primary:active { transform: translateY(0); }

    .btn-secondary {
      background: transparent; color: var(--accent); border: 1px solid var(--accent);
      padding: 12px 32px; font-family: 'Bebas Neue', sans-serif; font-size: 18px;
      letter-spacing: 0.1em; cursor: pointer; transition: all 0.2s;
      clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
    }
    .btn-secondary:hover { background: rgba(255,69,0,0.1); }

    .btn-ghost {
      background: transparent; color: var(--muted); border: none;
      padding: 8px 16px; font-family: 'Barlow', sans-serif; font-size: 14px;
      cursor: pointer; transition: color 0.2s;
    }
    .btn-ghost:hover { color: var(--text); }

    /* ONBOARDING */
    .onboard {
      min-height: 100vh; display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 24px; position: relative; z-index: 1;
    }
    .onboard-card {
      width: 100%; max-width: 520px;
      background: var(--surface); border: 1px solid var(--border);
      padding: 40px 36px; position: relative;
      animation: slideIn 0.4s ease-out;
    }
    .onboard-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
      background: linear-gradient(90deg, var(--accent), var(--gold));
    }
    .step-indicator {
      display: flex; gap: 8px; margin-bottom: 32px;
    }
    .step-dot {
      height: 3px; flex: 1; background: var(--border); transition: background 0.3s;
    }
    .step-dot.active { background: var(--accent); }
    .step-dot.done { background: var(--green); }

    .form-group { margin-bottom: 24px; }
    .form-label {
      display: block; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
      color: var(--muted); margin-bottom: 8px;
    }
    .form-input {
      width: 100%; background: var(--surface2); border: 1px solid var(--border);
      color: var(--text); padding: 14px 16px; font-family: 'Barlow', sans-serif;
      font-size: 16px; transition: border 0.2s; outline: none;
    }
    .form-input:focus { border-color: var(--accent); }
    .form-input::placeholder { color: var(--muted); }

    .option-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .option-btn {
      padding: 14px 10px; background: var(--surface2); border: 1px solid var(--border);
      color: var(--text); cursor: pointer; text-align: center;
      font-family: 'Barlow', sans-serif; font-size: 14px; font-weight: 600;
      transition: all 0.2s;
    }
    .option-btn:hover { border-color: var(--accent); color: var(--accent); }
    .option-btn.selected {
      border-color: var(--accent); background: rgba(255,69,0,0.1); color: var(--accent);
    }

    .range-container { padding: 8px 0; }
    .range-input {
      width: 100%; -webkit-appearance: none; height: 4px;
      background: linear-gradient(90deg, var(--accent) var(--val, 30%), var(--border) var(--val, 30%));
      outline: none; cursor: pointer;
    }
    .range-input::-webkit-slider-thumb {
      -webkit-appearance: none; width: 20px; height: 20px;
      background: var(--accent); clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    }
    .range-value {
      font-family: 'Bebas Neue', sans-serif; font-size: 48px;
      color: var(--accent); text-align: center; margin-top: 12px;
    }

    /* ROUTINE */
    .routine-wrap {
      min-height: 100vh; position: relative; z-index: 1;
      padding: 24px; max-width: 800px; margin: 0 auto;
    }
    .routine-header {
      padding: 32px 0 24px; border-bottom: 1px solid var(--border); margin-bottom: 28px;
    }
    .routine-title {
      font-size: clamp(36px, 6vw, 56px);
      background: linear-gradient(135deg, #FF4500, #FFB800);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .routine-meta {
      display: flex; gap: 24px; margin-top: 12px; flex-wrap: wrap;
    }
    .meta-chip {
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;
      color: var(--muted); background: var(--surface); border: 1px solid var(--border);
      padding: 6px 12px;
    }
    .meta-chip span { color: var(--accent); font-weight: 700; }

    .day-block {
      margin-bottom: 20px; background: var(--surface); border: 1px solid var(--border);
      overflow: hidden; animation: slideIn 0.4s ease-out;
    }
    .day-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px; cursor: pointer; transition: background 0.2s;
      background: var(--surface);
    }
    .day-header:hover { background: var(--surface2); }
    .day-title { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 0.05em; }
    .day-progress {
      display: flex; align-items: center; gap: 8px;
      font-size: 12px; color: var(--muted);
    }
    .progress-bar-wrap {
      width: 80px; height: 4px; background: var(--border); overflow: hidden;
    }
    .progress-bar-fill {
      height: 100%; background: linear-gradient(90deg, var(--accent), var(--gold));
      transition: width 0.4s ease;
    }

    .exercises-list { padding: 0 20px 20px; }
    .exercise-item {
      display: flex; align-items: flex-start; gap: 14px;
      padding: 14px 0; border-bottom: 1px solid var(--border);
    }
    .exercise-item:last-child { border-bottom: none; }

    .check-btn {
      width: 28px; height: 28px; flex-shrink: 0; border: 2px solid var(--border);
      background: transparent; cursor: pointer; display: flex; align-items: center;
      justify-content: center; transition: all 0.2s; margin-top: 2px;
      clip-path: polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%);
    }
    .check-btn.done { background: var(--green); border-color: var(--green); }
    .check-btn:hover:not(.done) { border-color: var(--accent); }

    .exercise-info { flex: 1; }
    .exercise-name {
      font-weight: 700; font-size: 15px; transition: color 0.2s;
    }
    .exercise-name.done { color: var(--muted); text-decoration: line-through; }
    .exercise-detail {
      font-size: 12px; color: var(--muted); margin-top: 3px;
    }
    .exercise-sets {
      display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap;
    }
    .set-chip {
      font-size: 11px; background: var(--surface2); border: 1px solid var(--border);
      padding: 2px 8px; color: var(--muted); transition: all 0.2s; cursor: pointer;
    }
    .set-chip.done { background: rgba(0,230,118,0.1); border-color: var(--green); color: var(--green); }

    .completion-banner {
      background: linear-gradient(135deg, rgba(0,230,118,0.1), rgba(255,184,0,0.1));
      border: 1px solid var(--green); padding: 20px; text-align: center;
      margin-top: 20px;
    }
    .completion-text { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: var(--green); }

    /* CHAT */
    .chat-fab {
      position: fixed; bottom: 28px; right: 28px; z-index: 100;
      width: 60px; height: 60px; background: linear-gradient(135deg, var(--accent), var(--accent2));
      border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
      clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
      box-shadow: 0 0 30px rgba(255,69,0,0.5); transition: all 0.2s;
      color: white;
    }
    .chat-fab:hover { transform: scale(1.1); box-shadow: 0 0 50px rgba(255,69,0,0.7); }
    .chat-fab .notif {
      position: absolute; top: -4px; right: -4px; width: 12px; height: 12px;
      background: var(--gold); border-radius: 50%;
    }

    .chat-panel {
      position: fixed; bottom: 100px; right: 28px; z-index: 99;
      width: min(420px, calc(100vw - 40px)); height: 520px;
      background: var(--surface); border: 1px solid var(--border);
      display: flex; flex-direction: column;
      animation: chatIn 0.3s ease-out;
      box-shadow: 0 0 60px rgba(0,0,0,0.8);
    }
    .chat-panel::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, var(--accent), var(--gold));
    }
    .chat-header {
      padding: 16px 20px; border-bottom: 1px solid var(--border);
      display: flex; align-items: center; gap: 10px;
    }
    .chat-avatar {
      width: 36px; height: 36px; background: linear-gradient(135deg, var(--accent), var(--gold));
      clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .chat-name { font-weight: 700; font-size: 14px; }
    .chat-status { font-size: 11px; color: var(--green); }
    .chat-close { margin-left: auto; }

    .chat-messages {
      flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px;
      scrollbar-width: thin; scrollbar-color: var(--border) transparent;
    }
    .msg {
      max-width: 85%; padding: 10px 14px; font-size: 14px; line-height: 1.5;
      animation: msgIn 0.2s ease-out;
    }
    .msg-bot {
      background: var(--surface2); border: 1px solid var(--border);
      border-left: 3px solid var(--accent); align-self: flex-start;
    }
    .msg-user {
      background: rgba(255,69,0,0.15); border: 1px solid rgba(255,69,0,0.3);
      align-self: flex-end;
    }
    .msg-typing { display: flex; gap: 4px; padding: 12px 14px; align-items: center; }
    .dot { width: 6px; height: 6px; background: var(--muted); border-radius: 50%;
      animation: bounce 1.2s infinite; }
    .dot:nth-child(2) { animation-delay: 0.2s; }
    .dot:nth-child(3) { animation-delay: 0.4s; }

    .chat-input-wrap {
      padding: 12px; border-top: 1px solid var(--border); display: flex; gap: 8px;
    }
    .chat-input {
      flex: 1; background: var(--surface2); border: 1px solid var(--border);
      color: var(--text); padding: 10px 14px; font-family: 'Barlow', sans-serif;
      font-size: 14px; outline: none; transition: border 0.2s; resize: none;
      max-height: 80px; min-height: 42px;
    }
    .chat-input:focus { border-color: var(--accent); }
    .send-btn {
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      border: none; color: white; width: 42px; flex-shrink: 0;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: opacity 0.2s;
    }
    .send-btn:hover { opacity: 0.85; }
    .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    /* LOADING SCREEN */
    .loading-screen {
      min-height: 100vh; display: flex; flex-direction: column;
      align-items: center; justify-content: center; position: relative; z-index: 1;
      gap: 24px;
    }
    .loader-ring {
      width: 80px; height: 80px; border: 3px solid var(--border);
      border-top-color: var(--accent); border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    .loader-text {
      font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: var(--muted);
      animation: pulse 1.5s ease-in-out infinite;
    }

    /* ANIMATIONS */
    @keyframes logoIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes chatIn { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
    @keyframes msgIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes pulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
    @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
    @keyframes glow { 0%,100% { box-shadow: 0 0 20px rgba(255,69,0,0.3); } 50% { box-shadow: 0 0 40px rgba(255,69,0,0.6); } }

    .glow-pulse { animation: glow 2s ease-in-out infinite; }

    /* Stats bar */
    .stats-bar {
      display: flex; gap: 12px; margin-bottom: 28px; flex-wrap: wrap;
    }
    .stat-card {
      flex: 1; min-width: 100px; background: var(--surface); border: 1px solid var(--border);
      padding: 16px; text-align: center;
    }
    .stat-num { font-family: 'Bebas Neue', sans-serif; font-size: 32px; color: var(--accent); }
    .stat-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: var(--muted); margin-top: 2px; }

    .nav-bar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 0; margin-bottom: 8px;
    }
    .nav-logo { font-family: 'Bebas Neue', sans-serif; font-size: 28px;
      background: linear-gradient(135deg, var(--accent), var(--gold));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }

    .scroll-hint {
      text-align: center; color: var(--muted); font-size: 12px; letter-spacing: 0.15em;
      text-transform: uppercase; padding: 16px 0;
    }
  `;
  document.head.appendChild(style);
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const callClaude = async (messages, system = "") => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system,
      messages,
    }),
  });
  const data = await res.json();
  return data.content?.map(b => b.text || "").join("") || "";
};

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function Splash({ onStart }) {
  return (
    <div className="splash">
      <div className="splash-logo em-heading">EASY<br />MUSCLE</div>
      <div className="splash-sub">Ciencia + IA para tu mejor físico</div>
      <div className="splash-cta">
        <button className="btn-primary glow-pulse" onClick={onStart}>
          EMPEZAR AHORA
        </button>
        <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 16 }}>
          Rutina personalizada • Basada en ciencia • IA Coach
        </p>
      </div>
      <div style={{ position: "absolute", bottom: 40, display: "flex", gap: 32 }}>
        {[["🔥", "Hipertrofia"], ["🧬", "Basado en ciencia"], ["🤖", "IA Coach"]].map(([e, t]) => (
          <div key={t} style={{ textAlign: "center", color: "var(--muted)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{e}</div>{t}
          </div>
        ))}
      </div>
    </div>
  );
}

const STEPS = ["PERFIL", "OBJETIVO", "EXPERIENCIA", "DISPONIBILIDAD"];

function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: "", age: 25, gender: "", weight: 75, height: 175,
    goal: "", experience: "", days: "", equipment: "",
  });

  const set = (k, v) => setData(p => ({ ...p, [k]: v }));

  const canNext = () => {
    if (step === 0) return data.name && data.gender;
    if (step === 1) return data.goal;
    if (step === 2) return data.experience;
    if (step === 3) return data.days && data.equipment;
    return true;
  };

  const steps = [
    // Step 0: Profile
    <>
      <div className="form-group">
        <label className="form-label">Tu nombre</label>
        <input className="form-input" placeholder="¿Cómo te llamás?" value={data.name}
          onChange={e => set("name", e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Género</label>
        <div className="option-grid">
          {["Masculino", "Femenino"].map(g => (
            <button key={g} className={`option-btn ${data.gender === g ? "selected" : ""}`}
              onClick={() => set("gender", g)}>{g}</button>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Edad: <span style={{ color: "var(--accent)" }}>{data.age} años</span></label>
        <div className="range-container">
          <input type="range" className="range-input" min={15} max={65} value={data.age}
            style={{ "--val": `${((data.age - 15) / 50) * 100}%` }}
            onChange={e => set("age", +e.target.value)} />
          <div className="range-value">{data.age}</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="form-group">
          <label className="form-label">Peso (kg): <span style={{ color: "var(--accent)" }}>{data.weight}</span></label>
          <input type="range" className="range-input" min={40} max={150} value={data.weight}
            style={{ "--val": `${((data.weight - 40) / 110) * 100}%` }}
            onChange={e => set("weight", +e.target.value)} />
          <div className="range-value" style={{ fontSize: 32 }}>{data.weight} kg</div>
        </div>
        <div className="form-group">
          <label className="form-label">Altura (cm): <span style={{ color: "var(--accent)" }}>{data.height}</span></label>
          <input type="range" className="range-input" min={140} max={220} value={data.height}
            style={{ "--val": `${((data.height - 140) / 80) * 100}%` }}
            onChange={e => set("height", +e.target.value)} />
          <div className="range-value" style={{ fontSize: 32 }}>{data.height} cm</div>
        </div>
      </div>
    </>,

    // Step 1: Goal
    <>
      <p style={{ color: "var(--muted)", marginBottom: 20, lineHeight: 1.6 }}>
        ¿Cuál es tu principal objetivo en el gym?
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          ["🏗️ Ganar masa muscular", "Ganar masa muscular"],
          ["🔥 Ganar masa y quemar grasa", "Recomposición corporal"],
          ["⚡ Fuerza + volumen", "Fuerza e hipertrofia"],
          ["🔵 Mantener y tonificar", "Mantenimiento y tono"],
        ].map(([label, val]) => (
          <button key={val} className={`option-btn ${data.goal === val ? "selected" : ""}`}
            style={{ textAlign: "left", padding: "14px 16px" }}
            onClick={() => set("goal", val)}>{label}</button>
        ))}
      </div>
    </>,

    // Step 2: Experience
    <>
      <p style={{ color: "var(--muted)", marginBottom: 20, lineHeight: 1.6 }}>
        ¿Cuánto tiempo llevas entrenando?
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          ["🌱 Principiante", "Principiante", "Menos de 1 año"],
          ["💪 Intermedio", "Intermedio", "1 a 3 años"],
          ["🔱 Avanzado", "Avanzado", "Más de 3 años"],
        ].map(([icon, val, desc]) => (
          <button key={val} className={`option-btn ${data.experience === val ? "selected" : ""}`}
            style={{ textAlign: "left", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
            onClick={() => set("experience", val)}>
            <span>{icon} {val}</span>
            <span style={{ fontSize: 12, opacity: 0.6 }}>{desc}</span>
          </button>
        ))}
      </div>
    </>,

    // Step 3: Schedule
    <>
      <div className="form-group">
        <label className="form-label">Días por semana</label>
        <div className="option-grid">
          {["3", "4", "5", "6"].map(d => (
            <button key={d} className={`option-btn ${data.days === d ? "selected" : ""}`}
              onClick={() => set("days", d)}>{d} días</button>
          ))}
        </div>
      </div>
      <div className="form-group" style={{ marginTop: 20 }}>
        <label className="form-label">Equipamiento disponible</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            ["🏋️ Gimnasio completo", "Gimnasio completo"],
            ["🏠 Casa con mancuernas", "Mancuernas en casa"],
            ["📦 Solo peso corporal", "Peso corporal"],
          ].map(([label, val]) => (
            <button key={val} className={`option-btn ${data.equipment === val ? "selected" : ""}`}
              style={{ textAlign: "left", padding: "14px 16px" }}
              onClick={() => set("equipment", val)}>{label}</button>
          ))}
        </div>
      </div>
    </>,
  ];

  return (
    <div className="onboard">
      <div className="onboard-card">
        <div style={{ marginBottom: 8 }}>
          <div className="em-heading" style={{ fontSize: 28, color: "var(--accent)" }}>
            {STEPS[step]}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
            Paso {step + 1} de {STEPS.length}
          </div>
        </div>
        <div className="step-indicator" style={{ margin: "16px 0 28px" }}>
          {STEPS.map((_, i) => (
            <div key={i} className={`step-dot ${i < step ? "done" : i === step ? "active" : ""}`} />
          ))}
        </div>

        {steps[step]}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
          {step > 0
            ? <button className="btn-ghost" onClick={() => setStep(s => s - 1)}>← ATRÁS</button>
            : <span />}
          <button className="btn-primary"
            disabled={!canNext()}
            style={{ opacity: canNext() ? 1 : 0.4, cursor: canNext() ? "pointer" : "not-allowed" }}
            onClick={() => step < STEPS.length - 1 ? setStep(s => s + 1) : onComplete(data)}>
            {step < STEPS.length - 1 ? "SIGUIENTE →" : "CREAR MI RUTINA"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingScreen() {
  const msgs = ["Analizando tu perfil...", "Calculando volumen óptimo...", "Diseñando ejercicios...", "Aplicando ciencia del entrenamiento..."];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % msgs.length), 1200);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="loading-screen">
      <div style={{ fontSize: 48, animation: "pulse 1s infinite" }}>🏋️</div>
      <div className="loader-ring" />
      <div className="loader-text">{msgs[idx]}</div>
      <div style={{ color: "var(--muted)", fontSize: 12 }}>Construyendo tu rutina personalizada con IA</div>
    </div>
  );
}

function RoutineView({ routine, profile, onReset }) {
  const [expanded, setExpanded] = useState({});
  const [checked, setChecked] = useState({});
  const [chatOpen, setChatOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(true);

  const toggleDay = (i) => setExpanded(p => ({ ...p, [i]: !p[i] }));

  const toggleExercise = (dayIdx, exIdx) => {
    const k = `${dayIdx}-${exIdx}`;
    setChecked(p => ({ ...p, [k]: !p[k] }));
  };

  const getDayProgress = (dayIdx, exCount) => {
    let done = 0;
    for (let i = 0; i < exCount; i++) if (checked[`${dayIdx}-${i}`]) done++;
    return { done, total: exCount, pct: exCount > 0 ? (done / exCount) * 100 : 0 };
  };

  const totalEx = routine.days?.reduce((a, d) => a + (d.exercises?.length || 0), 0) || 0;
  const totalDone = Object.values(checked).filter(Boolean).length;
  const weekPct = totalEx > 0 ? Math.round((totalDone / totalEx) * 100) : 0;

  return (
    <div className="routine-wrap">
      {/* NAV */}
      <div className="nav-bar">
        <div className="nav-logo em-heading">EASY MUSCLE</div>
        <button className="btn-ghost" onClick={onReset} style={{ fontSize: 12 }}>↩ REINICIAR</button>
      </div>

      {/* HEADER */}
      <div className="routine-header">
        <div className="em-heading routine-title">{routine.planName || "MI RUTINA"}</div>
        <div className="routine-meta">
          {[
            ["👤", profile.name],
            ["🎯", profile.goal],
            ["💪", profile.experience],
            ["📅", `${profile.days} días/semana`],
          ].map(([icon, val]) => (
            <div className="meta-chip" key={val}>{icon} <span>{val}</span></div>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div className="stats-bar">
        {[
          [weekPct + "%", "COMPLETADO HOY"],
          [totalDone + "/" + totalEx, "EJERCICIOS"],
          [profile.days, "DÍAS/SEMANA"],
          [routine.days?.length || 0, "SESIONES"],
        ].map(([n, l]) => (
          <div className="stat-card" key={l}>
            <div className="stat-num">{n}</div>
            <div className="stat-label">{l}</div>
          </div>
        ))}
      </div>

      {/* DAYS */}
      {routine.days?.map((day, di) => {
        const prog = getDayProgress(di, day.exercises?.length || 0);
        const isOpen = expanded[di] !== false;
        return (
          <div className="day-block" key={di}>
            <div className="day-header" onClick={() => toggleDay(di)}>
              <div>
                <div className="day-title em-heading">
                  {day.dayName}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{day.focus}</div>
              </div>
              <div className="day-progress">
                <span style={{ color: prog.done === prog.total && prog.total > 0 ? "var(--green)" : "var(--muted)" }}>
                  {prog.done}/{prog.total}
                </span>
                <div className="progress-bar-wrap">
                  <div className="progress-bar-fill" style={{ width: `${prog.pct}%` }} />
                </div>
                <span style={{ color: "var(--muted)", fontSize: 18 }}>{isOpen ? "▾" : "▸"}</span>
              </div>
            </div>

            {isOpen && (
              <div className="exercises-list">
                {day.exercises?.map((ex, ei) => {
                  const k = `${di}-${ei}`;
                  const done = checked[k];
                  return (
                    <div className="exercise-item" key={ei}>
                      <button className={`check-btn ${done ? "done" : ""}`}
                        onClick={() => toggleExercise(di, ei)}>
                        {done && <Icon d={icons.check} size={14} stroke="white" strokeWidth={3} />}
                      </button>
                      <div className="exercise-info">
                        <div className={`exercise-name ${done ? "done" : ""}`}>{ex.name}</div>
                        <div className="exercise-detail">{ex.muscle} · {ex.rest || "60-90s descanso"}</div>
                        <div className="exercise-sets">
                          {Array.from({ length: parseInt(ex.sets) || 3 }).map((_, si) => (
                            <span key={si} className={`set-chip ${done ? "done" : ""}`}>
                              {ex.reps || "8-12"} reps
                            </span>
                          ))}
                          {ex.note && (
                            <span style={{ fontSize: 11, color: "var(--accent)", padding: "2px 0", width: "100%" }}>
                              💡 {ex.note}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {prog.done === prog.total && prog.total > 0 && (
                  <div className="completion-banner" style={{ marginTop: 12, marginBottom: 0 }}>
                    <div className="completion-text">🏆 ¡SESIÓN COMPLETADA!</div>
                    <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>
                      Excelente trabajo, {profile.name}. Seguí así.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {weekPct === 100 && (
        <div className="completion-banner" style={{ marginTop: 28 }}>
          <div className="completion-text" style={{ fontSize: 36 }}>🥇 ¡SEMANA COMPLETA!</div>
          <div style={{ color: "var(--muted)", marginTop: 8 }}>
            Descansá mañana. La recuperación es parte del proceso.
          </div>
        </div>
      )}

      {routine.tips && (
        <div style={{ marginTop: 24, padding: 20, background: "var(--surface)", border: "1px solid var(--border)", borderLeft: "3px solid var(--gold)" }}>
          <div style={{ color: "var(--gold)", fontFamily: "Bebas Neue", fontSize: 16, marginBottom: 10 }}>
            💡 CONSEJOS DE TU RUTINA
          </div>
          <div style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7 }}>{routine.tips}</div>
        </div>
      )}

      <div style={{ height: 120 }} />

      {/* CHAT FAB */}
      <button className="chat-fab" onClick={() => { setChatOpen(o => !o); setShowNotif(false); }}>
        <Icon d={icons.chat} size={24} />
        {showNotif && <span className="notif" />}
      </button>

      {/* CHAT PANEL */}
      {chatOpen && <ChatPanel profile={profile} routine={routine} onClose={() => setChatOpen(false)} />}
    </div>
  );
}

function ChatPanel({ profile, routine, onClose }) {
  const [msgs, setMsgs] = useState([
    {
      role: "assistant",
      text: `¡Hola ${profile.name}! 💪 Soy tu coach de IA. Estoy al tanto de toda tu rutina. Podés preguntarme sobre:\n\n• Técnica de cualquier ejercicio\n• Nutrición y suplementos\n• Cómo progresar\n• Dudas sobre tu plan\n\n¿En qué te puedo ayudar?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMsgs(p => [...p, { role: "user", text: userMsg }]);
    setLoading(true);

    const system = `Sos un coach de fitness experto en hipertrofia y ciencia del entrenamiento. 
Hablás en español argentino, sos directo, motivador y usás un tono energético pero profesional.
El usuario se llama ${profile.name}, tiene ${profile.age} años, pesa ${profile.weight}kg, mide ${profile.height}cm.
Su objetivo: ${profile.goal}. Nivel: ${profile.experience}. Entrena ${profile.days} días/semana.
Rutina actual: ${JSON.stringify(routine?.days?.map(d => ({ day: d.dayName, exercises: d.exercises?.map(e => e.name) })))}.
Respondé siempre en español. Sé conciso (máx 3-4 párrafos). Usá emojis con moderación.`;

    const history = msgs.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text }));
    history.push({ role: "user", content: userMsg });

    try {
      const reply = await callClaude(history, system);
      setMsgs(p => [...p, { role: "assistant", text: reply }]);
    } catch {
      setMsgs(p => [...p, { role: "assistant", text: "Error de conexión. Intentá de nuevo." }]);
    }
    setLoading(false);
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div className="chat-avatar">🤖</div>
        <div>
          <div className="chat-name">EM Coach</div>
          <div className="chat-status">● Online</div>
        </div>
        <button className="btn-ghost chat-close" onClick={onClose}>✕</button>
      </div>

      <div className="chat-messages">
        {msgs.map((m, i) => (
          <div key={i} className={`msg ${m.role === "assistant" ? "msg-bot" : "msg-user"}`}>
            {m.text.split("\n").map((line, j) => (
              <span key={j}>{line}{j < m.text.split("\n").length - 1 && <br />}</span>
            ))}
          </div>
        ))}
        {loading && (
          <div className="msg msg-bot msg-typing">
            <div className="dot" /> <div className="dot" /> <div className="dot" />
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="chat-input-wrap">
        <textarea className="chat-input" placeholder="Preguntá algo..."
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          rows={1} />
        <button className="send-btn" onClick={send} disabled={!input.trim() || loading}>
          <Icon d={icons.send} size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function EasyMuscle() {
  const [screen, setScreen] = useState("splash"); // splash | onboard | loading | routine
  const [profile, setProfile] = useState(null);
  const [routine, setRoutine] = useState(null);

  useEffect(() => { injectStyles(); }, []);

  const generateRoutine = async (prof) => {
    setProfile(prof);
    setScreen("loading");

    const prompt = `Creá una rutina de hipertrofia semanal basada en evidencia científica para:
- Nombre: ${prof.name}, ${prof.age} años, ${prof.gender}
- Peso: ${prof.weight}kg, Altura: ${prof.height}cm (IMC: ${(prof.weight / ((prof.height / 100) ** 2)).toFixed(1)})
- Objetivo: ${prof.goal}
- Nivel: ${prof.experience}
- Días: ${prof.days} días por semana
- Equipamiento: ${prof.equipment}

Respondé SOLO con un JSON válido con esta estructura exacta (sin markdown, sin texto extra):
{
  "planName": "NOMBRE DEL PLAN EN MAYÚSCULAS",
  "days": [
    {
      "dayName": "DÍA 1 - NOMBRE",
      "focus": "Grupos musculares",
      "exercises": [
        {
          "name": "Nombre del ejercicio",
          "muscle": "Músculo principal",
          "sets": "4",
          "reps": "8-12",
          "rest": "90s descanso",
          "note": "Consejo técnico breve"
        }
      ]
    }
  ],
  "tips": "2-3 consejos clave sobre progresión y recuperación para este perfil."
}

Incluí entre 4-6 ejercicios por día. Aplicá principios de periodización, RIR, progresión de sobrecarga y frecuencia óptima según el nivel.`;

    try {
      const raw = await callClaude([{ role: "user", content: prompt }]);
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setRoutine(parsed);
      setScreen("routine");
    } catch (e) {
      // Fallback routine
      setRoutine({
        planName: "RUTINA PERSONALIZADA",
        days: [
          {
            dayName: "DÍA 1 - PECHO & TRÍCEPS",
            focus: "Empuje superior",
            exercises: [
              { name: "Press de banca plano", muscle: "Pectoral mayor", sets: "4", reps: "6-10", rest: "2-3 min", note: "Escápulas retraídas y pecho saliente" },
              { name: "Press inclinado con mancuernas", muscle: "Pectoral clavicular", sets: "3", reps: "10-12", rest: "90s", note: "" },
              { name: "Aperturas con cable", muscle: "Pectoral (estiramiento)", sets: "3", reps: "12-15", rest: "60s", note: "Sentí el estiramiento en la parte baja" },
              { name: "Fondos en paralelas", muscle: "Tríceps / Pectoral bajo", sets: "3", reps: "10-12", rest: "90s", note: "" },
              { name: "Extensión de tríceps en polea", muscle: "Tríceps", sets: "3", reps: "12-15", rest: "60s", note: "" },
            ],
          },
          {
            dayName: "DÍA 2 - ESPALDA & BÍCEPS",
            focus: "Tirón superior",
            exercises: [
              { name: "Dominadas o jalón al pecho", muscle: "Dorsal ancho", sets: "4", reps: "6-10", rest: "2 min", note: "Codós hacia el suelo, no hacia atrás" },
              { name: "Remo con barra", muscle: "Dorsal / Romboides", sets: "4", reps: "8-10", rest: "90s", note: "" },
              { name: "Remo con mancuerna unilateral", muscle: "Dorsal ancho", sets: "3", reps: "10-12/lado", rest: "60s", note: "" },
              { name: "Face pulls", muscle: "Deltoides posterior / Manguito", sets: "3", reps: "15-20", rest: "60s", note: "Fundamental para salud articular" },
              { name: "Curl de bíceps con barra", muscle: "Bíceps", sets: "3", reps: "10-12", rest: "60s", note: "" },
            ],
          },
          {
            dayName: "DÍA 3 - PIERNAS",
            focus: "Tren inferior completo",
            exercises: [
              { name: "Sentadilla trasera", muscle: "Cuádriceps / Glúteos", sets: "4", reps: "6-10", rest: "2-3 min", note: "Rodillas en línea con los pies" },
              { name: "Prensa de piernas", muscle: "Cuádriceps / Glúteos", sets: "3", reps: "10-12", rest: "90s", note: "" },
              { name: "Peso muerto rumano", muscle: "Isquiotibiales / Glúteos", sets: "3", reps: "10-12", rest: "90s", note: "Empujá las caderas hacia atrás" },
              { name: "Curl de isquiotibiales tumbado", muscle: "Isquiotibiales", sets: "3", reps: "12-15", rest: "60s", note: "" },
              { name: "Elevaciones de talones de pie", muscle: "Gastrocnemio", sets: "4", reps: "15-20", rest: "60s", note: "" },
            ],
          },
          {
            dayName: "DÍA 4 - HOMBROS & CORE",
            focus: "Hombros y estabilidad",
            exercises: [
              { name: "Press militar con mancuernas", muscle: "Deltoides anterior/lateral", sets: "4", reps: "8-12", rest: "90s", note: "" },
              { name: "Elevaciones laterales", muscle: "Deltoides lateral", sets: "4", reps: "15-20", rest: "60s", note: "Clave para amplitud de hombros" },
              { name: "Pájaros con mancuernas", muscle: "Deltoides posterior", sets: "3", reps: "15-20", rest: "60s", note: "" },
              { name: "Encogimientos con mancuernas", muscle: "Trapecio", sets: "3", reps: "12-15", rest: "60s", note: "" },
              { name: "Plancha frontal", muscle: "Core", sets: "3", reps: "30-60s", rest: "60s", note: "" },
            ],
          },
        ],
        tips: "Priorizá el sueño (7-9hs) para maximizar la síntesis proteica. Consumí 1.6-2.2g de proteína por kg de peso corporal. Aumentá el peso o repeticiones semanalmente para generar sobrecarga progresiva.",
      });
      setScreen("routine");
    }
  };

  return (
    <div className="em-root">
      <div className="em-bg-grid" />
      {screen === "splash" && <Splash onStart={() => setScreen("onboard")} />}
      {screen === "onboard" && <Onboarding onComplete={generateRoutine} />}
      {screen === "loading" && <LoadingScreen />}
      {screen === "routine" && routine && (
        <RoutineView
          routine={routine}
          profile={profile}
          onReset={() => { setScreen("splash"); setRoutine(null); setProfile(null); }}
        />
      )}
    </div>
  );
}
