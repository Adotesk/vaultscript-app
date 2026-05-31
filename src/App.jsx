import { useState, useRef } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #060608;
    --surface: #0d0d10;
    --card: #111116;
    --card2: #16161c;
    --border: #1e1e26;
    --border2: #252530;
    --blue: #5b7cfa;
    --blue-dim: rgba(91,124,250,0.12);
    --blue-glow: rgba(91,124,250,0.07);
    --blue-border: rgba(91,124,250,0.28);
    --text: #ececf1;
    --text2: #9090a8;
    --muted: #50505f;
    --muted2: #252530;
    --green: #34d399;
    --red: #f87171;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', sans-serif;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  .grid-bg {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      linear-gradient(rgba(91,124,250,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(91,124,250,0.025) 1px, transparent 1px);
    background-size: 52px 52px;
  }
  .glow {
    position: fixed; top: -350px; left: 50%; transform: translateX(-50%);
    width: 900px; height: 700px; pointer-events: none; z-index: 0;
    background: radial-gradient(ellipse at center, rgba(91,124,250,0.055) 0%, transparent 65%);
  }

  .app {
    position: relative; z-index: 1;
    max-width: 780px; margin: 0 auto;
    padding: 0 24px 100px;
  }

  .header {
    padding: 56px 0 48px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 52px;
  }
  .header-top {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 32px;
  }
  .logo {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800; font-size: 20px;
    letter-spacing: -0.03em; color: var(--text);
  }
  .logo span { color: var(--blue); }
  .header-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--blue-dim); border: 1px solid var(--blue-border);
    border-radius: 100px; padding: 5px 13px;
    font-size: 11px; font-weight: 600; color: var(--blue);
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .header-badge::before {
    content: ''; width: 5px; height: 5px; border-radius: 50%;
    background: var(--blue); box-shadow: 0 0 6px var(--blue);
    animation: blink 2.5s ease-in-out infinite;
  }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }

  h1 {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800; font-size: clamp(34px, 5.5vw, 52px);
    letter-spacing: -0.04em; line-height: 1.08;
    color: var(--text);
  }
  h1 em { font-style: normal; color: var(--blue); }
  .header-sub {
    margin-top: 14px; font-size: 15px; font-weight: 400;
    color: var(--text2); line-height: 1.65; max-width: 520px;
  }

  .field { margin-bottom: 22px; }
  .field-label {
    display: block; font-size: 11px; font-weight: 700;
    letter-spacing: 0.06em; text-transform: uppercase;
    color: var(--text2); margin-bottom: 9px;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .req { color: var(--blue); margin-left: 2px; }
  .opt { color: var(--muted); font-weight: 500; text-transform: none; letter-spacing: 0; font-size: 10px; margin-left: 4px; }

  input, textarea {
    width: 100%; background: var(--card);
    border: 1px solid var(--border2); border-radius: 10px;
    color: var(--text); font-family: 'Inter', sans-serif;
    font-size: 14px; padding: 13px 16px; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  input::placeholder, textarea::placeholder { color: var(--muted); }
  input:focus, textarea:focus {
    border-color: var(--blue-border);
    box-shadow: 0 0 0 3px var(--blue-glow);
  }
  textarea { resize: vertical; min-height: 78px; line-height: 1.6; }

  .pill-wrap { display: flex; flex-wrap: wrap; gap: 7px; }
  .pill {
    padding: 7px 14px; border: 1px solid var(--border2);
    border-radius: 100px; font-size: 13px; font-weight: 500;
    background: var(--card); color: var(--text2);
    cursor: pointer; transition: all 0.15s;
    font-family: 'Plus Jakarta Sans', sans-serif;
    line-height: 1;
  }
  .pill:hover { border-color: var(--blue-border); color: var(--text); }
  .pill.active { background: var(--blue-dim); border-color: var(--blue-border); color: var(--blue); }

  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  @media(max-width:580px) { .two-col { grid-template-columns: 1fr; } }

  .btn-generate {
    width: 100%; margin-top: 8px; padding: 15px;
    background: var(--blue); border: none; border-radius: 12px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 15px; font-weight: 700; letter-spacing: -0.01em;
    color: #fff; cursor: pointer;
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 4px 20px rgba(91,124,250,0.3);
  }
  .btn-generate:hover:not(:disabled) {
    opacity: 0.9; transform: translateY(-1px);
    box-shadow: 0 6px 28px rgba(91,124,250,0.4);
  }
  .btn-generate:active:not(:disabled) { transform: translateY(0); }
  .btn-generate:disabled { opacity: 0.3; cursor: not-allowed; box-shadow: none; }

  .status {
    margin-top: 10px; padding: 11px 14px;
    background: var(--card); border: 1px solid var(--border);
    border-radius: 10px; font-size: 13px; color: var(--muted);
    display: flex; align-items: center; gap: 8px; min-height: 42px;
  }
  .status.loading { border-color: var(--blue-border); color: var(--blue); }
  .spinner {
    width: 13px; height: 13px; border-radius: 50%;
    border: 2px solid var(--blue-dim); border-top-color: var(--blue);
    animation: spin 0.65s linear infinite; flex-shrink: 0;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .error-box {
    margin-top: 10px; padding: 12px 14px; border-radius: 10px;
    border: 1px solid rgba(248,113,113,0.25);
    background: rgba(248,113,113,0.06);
    font-size: 13px; color: var(--red);
  }

  .divider {
    display: flex; align-items: center; gap: 14px;
    margin: 52px 0 32px;
  }
  .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
  .divider span {
    font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--muted);
    font-family: 'Plus Jakarta Sans', sans-serif; white-space: nowrap;
  }

  .out-card {
    background: var(--card); border: 1px solid var(--border2);
    border-radius: 14px; overflow: hidden; margin-bottom: 12px;
    animation: fadeUp 0.3s ease both;
  }
  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  .out-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 11px 18px; border-bottom: 1px solid var(--border);
    background: var(--card2);
  }
  .out-label {
    font-size: 11px; font-weight: 700; letter-spacing: 0.06em;
    text-transform: uppercase; color: var(--blue);
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .copy-btn {
    padding: 4px 10px; font-size: 11px; font-weight: 600;
    border: 1px solid var(--border2); border-radius: 6px;
    background: transparent; color: var(--text2); cursor: pointer;
    transition: all 0.15s; font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .copy-btn:hover { border-color: var(--blue-border); color: var(--blue); }
  .copy-btn.copied { border-color: var(--green); color: var(--green); }

  .out-body { padding: 20px; font-size: 14px; line-height: 1.75; }

  .title-row { display: flex; gap: 14px; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid var(--border); }
  .title-row:last-child { border-bottom: none; padding-bottom: 0; }
  .title-n { font-family: 'Plus Jakarta Sans'; font-weight: 800; font-size: 11px; color: var(--blue); flex-shrink: 0; padding-top: 3px; letter-spacing: 0.04em; }
  .title-t { font-size: 14px; line-height: 1.55; font-weight: 500; color: var(--text); }

  .seg { padding-bottom: 20px; margin-bottom: 20px; border-bottom: 1px solid var(--border); }
  .seg:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
  .seg-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; flex-wrap: wrap; }
  .seg-ts {
    font-size: 11px; font-weight: 700; color: var(--blue);
    font-family: 'Plus Jakarta Sans'; letter-spacing: 0.03em;
    background: var(--blue-dim); border: 1px solid var(--blue-border);
    padding: 3px 9px; border-radius: 6px;
  }
  .seg-sec { font-size: 11px; font-weight: 600; color: var(--text2); text-transform: uppercase; letter-spacing: 0.06em; font-family: 'Plus Jakarta Sans'; }
  .seg-text { font-size: 14px; line-height: 1.8; color: var(--text); }
  .seg-broll {
    margin-top: 10px; padding: 9px 14px;
    background: var(--card2); border-left: 2px solid var(--blue-border);
    border-radius: 0 8px 8px 0; font-size: 12px; color: var(--text2);
    font-style: italic; line-height: 1.6;
  }

  .tags-wrap { padding: 16px 20px; display: flex; flex-wrap: wrap; gap: 7px; }
  .tag {
    padding: 5px 11px; border: 1px solid var(--border2);
    border-radius: 100px; font-size: 12px; color: var(--text2);
    background: var(--card2); font-family: 'Plus Jakarta Sans'; font-weight: 500;
  }

  .footer {
    margin-top: 72px; padding-top: 24px; border-top: 1px solid var(--border);
    display: flex; justify-content: space-between; align-items: center;
    font-size: 12px; color: var(--muted);
    font-family: 'Plus Jakarta Sans'; font-weight: 500;
  }
  .footer-logo { font-weight: 800; font-size: 14px; letter-spacing: -0.02em; color: var(--text2); }
  .footer-logo span { color: var(--blue); }
`;

const VIDEO_STYLES = ["Educational", "Listicle", "Documentary", "Story-Time", "Exposé / Deep-Dive", "Motivational"];
const DURATIONS = ["30–60 sec", "3–5 min", "7–10 min", "12–15 min", "20+ min"];
const TONES = ["Calm & Authoritative", "Hype & Energetic", "Dark & Mysterious", "Conversational"];

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button className={`copy-btn${copied ? " copied" : ""}`} onClick={() => {
      navigator.clipboard.writeText(text);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    }}>{copied ? "✓ Copied" : "Copy"}</button>
  );
}

function OutCard({ label, copyText, children }) {
  return (
    <div className="out-card">
      <div className="out-head">
        <span className="out-label">{label}</span>
        {copyText && <CopyBtn text={copyText} />}
      </div>
      {children}
    </div>
  );
}

export default function VaultScript() {
  const [niche, setNiche] = useState("");
  const [angle, setAngle] = useState("");
  const [style, setStyle] = useState("Educational");
  const [duration, setDuration] = useState("7–10 min");
  const [tone, setTone] = useState("Calm & Authoritative");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Ready to generate your script.");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const outputRef = useRef(null);

  async function generate() {
    if (!niche.trim()) { setError("Please enter a niche or topic."); return; }
    setError(""); setResult(null); setLoading(true);
    const statuses = ["Analyzing your niche...", "Crafting viral titles...", "Writing your script...", "Polishing the narration...", "Generating SEO metadata..."];
    let i = 0; setStatus(statuses[0]);
    const ticker = setInterval(() => { i = (i + 1) % statuses.length; setStatus(statuses[i]); }, 2000);

    const isShorts = duration === "30–60 sec";
    const scriptInstruction = isShorts
      ? "Include EXACTLY 2 fast-paced script sections (HOOK and MAIN). Total narration must be under 150 words to fit 30-60 seconds."
      : "Include 6-10 script sections appropriate for the duration. Make narration conversational and punchy. No filler.";
    const maxTokens = isShorts ? 1500 : 4000;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tool-secret": import.meta.env.VITE_TOOL_SECRET || "",
        },
        body: JSON.stringify({
          type: "tool",
          max_tokens: maxTokens,
          messages: [{ role: "user", content: `You are an elite faceless YouTube scriptwriter. Generate a complete script package.

INPUTS:
- Niche / Topic: ${niche}
- Specific angle: ${angle || "Choose the most viral angle"}
- Video style: ${style}
- Target duration: ${duration}
- Tone: ${tone}

Respond ONLY with valid JSON (no markdown, no backticks):
{
  "titles": ["SEO title 1", "SEO title 2", "SEO title 3"],
  "hook": "First 30-45 seconds spoken word hook. Gripping, no fluff.",
  "script": [
    { "timestamp": "0:00 – 0:45", "section": "HOOK", "narration": "Full narration text.", "broll": "Specific b-roll suggestion" }
  ],
  "description": "150-200 word YouTube description with CTA and keywords.",
  "tags": ["tag1","tag2","tag3","tag4","tag5","tag6","tag7","tag8","tag9","tag10","tag11","tag12"],
  "thumbnail_idea": "Specific thumbnail concept with text overlay and composition."
}

${scriptInstruction}` }],
        }),
      });
      clearInterval(ticker);
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      const raw = data.content?.map(b => b.text || "").join("") || "";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setResult(parsed);
      setStatus("Script ready.");
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (e) {
      clearInterval(ticker);
      setError("Generation failed: " + e.message);
      setStatus("Something went wrong — try again.");
    } finally { setLoading(false); }
  }

  const fullScript = result?.script?.map(s => `[${s.timestamp}] ${s.section}\n${s.narration}\nB-ROLL: ${s.broll}`).join("\n\n") || "";

  return (
    <>
      <style>{STYLES}</style>
      <div className="grid-bg" />
      <div className="glow" />
      <div className="app">
        <header className="header">
          <div className="header-top">
            <div className="logo">Vault<span>Script</span></div>
            <div className="header-badge">AI Script Generator</div>
          </div>
          <h1>Generate your<br/>next <em>viral script.</em></h1>
          <p className="header-sub">From niche to publish-ready script in seconds. Titles, hook, full timestamped script, b-roll cues, description and tags.</p>
        </header>

        <div className="field">
          <label className="field-label">Niche / Topic <span className="req">*</span></label>
          <input value={niche} onChange={e => setNiche(e.target.value)}
            placeholder="e.g. abandoned places, stoicism, dark history, AI investing..." />
        </div>

        <div className="field">
          <label className="field-label">Specific Angle <span className="opt">optional</span></label>
          <textarea value={angle} onChange={e => setAngle(e.target.value)}
            placeholder="e.g. 'The hotel abandoned mid-renovation' — or leave blank for the most viral angle" />
        </div>

        <div className="field">
          <label className="field-label">Video Style</label>
          <div className="pill-wrap">
            {VIDEO_STYLES.map(s => (
              <button key={s} className={`pill${style === s ? " active" : ""}`} onClick={() => setStyle(s)}>{s}</button>
            ))}
          </div>
        </div>

        <div className="two-col">
          <div className="field">
            <label className="field-label">Duration</label>
            <div className="pill-wrap">
              {DURATIONS.map(d => (
                <button key={d} className={`pill${duration === d ? " active" : ""}`} onClick={() => setDuration(d)}>{d}</button>
              ))}
            </div>
          </div>
          <div className="field">
            <label className="field-label">Tone</label>
            <div className="pill-wrap">
              {TONES.map(t => (
                <button key={t} className={`pill${tone === t ? " active" : ""}`} onClick={() => setTone(t)}>{t}</button>
              ))}
            </div>
          </div>
        </div>

        <button className="btn-generate" onClick={generate} disabled={loading}>
          {loading ? "Generating..." : "Generate Script →"}
        </button>
        <div className={`status${loading ? " loading" : ""}`}>
          {loading && <div className="spinner" />}
          <span>{status}</span>
        </div>
        {error && <div className="error-box">⚠ {error}</div>}

        {result && (
          <div ref={outputRef}>
            <div className="divider"><span>Generated Output</span></div>

            <OutCard label="Title Options" copyText={result.titles?.join("\n")}>
              <div className="out-body" style={{padding:"16px 20px"}}>
                {result.titles?.map((t, i) => (
                  <div className="title-row" key={i}>
                    <span className="title-n">0{i+1}</span>
                    <span className="title-t">{t}</span>
                  </div>
                ))}
              </div>
            </OutCard>

            <OutCard label="Opening Hook" copyText={result.hook}>
              <div className="out-body">{result.hook}</div>
            </OutCard>

            <OutCard label="Full Script" copyText={fullScript}>
              <div className="out-body">
                {result.script?.map((seg, i) => (
                  <div className="seg" key={i}>
                    <div className="seg-meta">
                      <span className="seg-ts">{seg.timestamp}</span>
                      <span className="seg-sec">{seg.section}</span>
                    </div>
                    <div className="seg-text">{seg.narration}</div>
                    {seg.broll && <div className="seg-broll">🎬 {seg.broll}</div>}
                  </div>
                ))}
              </div>
            </OutCard>

            {result.thumbnail_idea && (
              <OutCard label="Thumbnail Concept" copyText={result.thumbnail_idea}>
                <div className="out-body">{result.thumbnail_idea}</div>
              </OutCard>
            )}

            <OutCard label="YouTube Description" copyText={result.description}>
              <div className="out-body">{result.description}</div>
            </OutCard>

            {result.tags && (
              <OutCard label="SEO Tags" copyText={result.tags.join(", ")}>
                <div className="tags-wrap">
                  {result.tags.map((tag, i) => <span className="tag" key={i}>#{tag}</span>)}
                </div>
              </OutCard>
            )}
          </div>
        )}

        <footer className="footer">
          <div className="footer-logo">Vault<span>Script</span></div>
          <span>© 2026 VaultScript · All rights reserved</span>
        </footer>
      </div>
    </>
  );
              }
