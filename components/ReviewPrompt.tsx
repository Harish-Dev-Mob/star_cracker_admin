"use client";

import { useState, useRef, useEffect } from "react";

// ─── CSS keyframes ────────────────────────────────────────────────────────────
const CSS = `
  @keyframes rp-starPop {
    0%   { opacity:0; transform: scale(0.3) translateY(10px); }
    70%  { transform: scale(1.3) translateY(-3px); }
    100% { opacity:1; transform: scale(1) translateY(0); }
  }
  @keyframes rp-fadeUp {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes rp-burst {
    0%   { opacity:1; transform: translate(0,0) scale(1); }
    100% { opacity:0; transform: translate(var(--tx),var(--ty)) scale(0.2); }
  }
  @keyframes rp-spin {
    to { transform: rotate(360deg); }
  }
  .rp-star-btn { transition: transform 0.18s cubic-bezier(.34,1.56,.64,1), filter 0.18s; }
  .rp-star-btn:hover { transform: scale(1.25); }
  .rp-input:focus { outline:none; border-color:rgba(251,191,36,0.55)!important; box-shadow:0 0 0 3px rgba(251,191,36,0.1)!important; }
`;

// ─── Confetti particle ────────────────────────────────────────────────────────
function Particle({ x, y, color, tx, ty }: { x:number; y:number; color:string; tx:number; ty:number }) {
  return (
    <div
      aria-hidden
      style={{
        position:"absolute", left:x, top:y,
        width:7, height:7, borderRadius:"50%",
        background:color, pointerEvents:"none",
        animation:"rp-burst 0.75s ease-out forwards",
        "--tx":`${tx}px`, "--ty":`${ty}px`,
      } as React.CSSProperties}
    />
  );
}

// ─── Animated star input ──────────────────────────────────────────────────────
function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  const labels = ["", "Poor", "Fair", "Good", "Great", "Excellent! 🎆"];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="rp-star-btn focus:outline-none select-none"
            style={{
              fontSize: 40,
              lineHeight: 1,
              display: "block",
              filter: star <= active
                ? "drop-shadow(0 0 9px rgba(251,191,36,0.85))"
                : "none",
              color: star <= active ? "#fbbf24" : "rgba(255,255,255,0.1)",
              transform: star <= active ? "scale(1.2)" : "scale(1)",
            }}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
          >
            ★
          </button>
        ))}
      </div>
      <span style={{
        fontSize: 11, fontWeight: 800, letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: active ? "#fbbf24" : "rgba(255,255,255,0.25)",
        transition: "color 0.2s",
        minHeight: 18,
      }}>
        {labels[active]}
      </span>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface ReviewPromptProps {
  userName: string;
  userCity?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ReviewPrompt({ userName, userCity }: ReviewPromptProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [name, setName] = useState(userName || "");
  const [location, setLocation] = useState(userCity || "");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [particles, setParticles] = useState<{ id:number; x:number; y:number; color:string; tx:number; ty:number }[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  const burst = () => {
    const colors = ["#fbbf24","#f97316","#ef4444","#a855f7","#22d3ee","#4ade80","#fb7185"];
    const cx = (wrapRef.current?.offsetWidth ?? 340) / 2;
    setParticles(Array.from({length:28},(_,i)=>({
      id: Date.now()+i,
      x: cx + (Math.random()-0.5)*180,
      y: 50 + (Math.random()-0.5)*60,
      color: colors[i % colors.length],
      tx: (Math.random()-0.5)*200,
      ty: -60 - Math.random()*80,
    })));
    setTimeout(()=>setParticles([]), 800);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), location: location.trim(), rating, text: text.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong. Please try again."); return; }
      burst();
      setTimeout(() => setSubmitted(true), 350);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open]);

  // ── Trigger card ─────────────────────────────────────────────────────────
  if (!open) {
    return (
      <>
        <style>{CSS}</style>
        <div
          className="mt-8 relative overflow-hidden rounded-3xl"
          style={{ padding: "1px", background: "linear-gradient(135deg,#f97316 0%,#fbbf24 40%,#ef4444 70%,#a855f7 100%)" }}
        >
          <div
            className="rounded-3xl px-7 py-8 text-center relative overflow-hidden"
            style={{ background: "linear-gradient(145deg,#1a0800 0%,#0f0018 100%)" }}
          >
            {/* Ambient glow */}
            <div aria-hidden style={{
              position:"absolute", top:-50, right:-50, width:200, height:200,
              borderRadius:"50%",
              background:"radial-gradient(circle,rgba(251,191,36,0.15) 0%,transparent 70%)",
              pointerEvents:"none",
            }}/>
            <div aria-hidden style={{
              position:"absolute", bottom:-40, left:-40, width:160, height:160,
              borderRadius:"50%",
              background:"radial-gradient(circle,rgba(168,85,247,0.12) 0%,transparent 70%)",
              pointerEvents:"none",
            }}/>
            {/* Stars */}
            <div className="flex justify-center gap-1.5 mb-4">
              {[1,2,3,4,5].map((s,i) => (
                <span key={s} style={{
                  fontSize:30, color:"#fbbf24",
                  filter:"drop-shadow(0 0 8px rgba(251,191,36,0.75))",
                  animation:`rp-starPop 0.45s ${i*0.07}s both`,
                }}>★</span>
              ))}
            </div>
            <p className="font-black text-white text-lg mb-1.5" style={{letterSpacing:"-0.01em"}}>
              Loved your experience? ✨
            </p>
            <p className="text-sm mb-6" style={{color:"rgba(255,255,255,0.45)"}}>
              Share your celebration story — it helps thousands of happy families!
            </p>
            <button
              id="btn-open-review-prompt"
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl font-black text-sm text-white transition-all hover:-translate-y-0.5 active:scale-95"
              style={{
                background:"linear-gradient(135deg,#f97316,#ef4444)",
                boxShadow:"0 8px 28px rgba(249,115,22,0.45)",
              }}
            >
              ✍️ Write a Review
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── Submitted ─────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <>
        <style>{CSS}</style>
        <div
          ref={wrapRef}
          className="mt-8 relative overflow-hidden rounded-3xl"
          style={{ padding:"1px", background:"linear-gradient(135deg,#4ade80,#22d3ee,#a855f7)" }}
        >
          <div
            className="rounded-3xl px-7 py-12 text-center relative overflow-hidden"
            style={{ background:"linear-gradient(145deg,#021507,#030d10,#0d0318)", animation:"rp-fadeUp 0.5s both" }}
          >
            {particles.map(p => <Particle key={p.id} {...p} />)}
            <div style={{
              width:80, height:80, borderRadius:"50%", margin:"0 auto 20px",
              background:"linear-gradient(135deg,rgba(74,222,128,0.18),rgba(34,211,238,0.18))",
              border:"1px solid rgba(74,222,128,0.3)",
              boxShadow:"0 0 40px rgba(74,222,128,0.2)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:36, animation:"rp-fadeUp 0.5s 0.1s both",
            }}>🎉</div>
            <p className="font-black text-white text-xl mb-2">Thank you so much!</p>
            <p className="text-sm" style={{color:"rgba(255,255,255,0.45)"}}>
              Your review is submitted and will appear after a quick approval.
            </p>
          </div>
        </div>
      </>
    );
  }

  // ── Review form ──────────────────────────────────────────────────────────
  return (
    <>
      <style>{CSS}</style>
      <div
        ref={wrapRef}
        className="mt-8 relative rounded-3xl overflow-hidden"
        style={{ padding:"1px", background:"linear-gradient(135deg,#f97316,#fbbf24,#ef4444,#a855f7)", animation:"rp-fadeUp 0.4s both" }}
      >
        <div
          className="rounded-3xl overflow-hidden"
          style={{ background:"linear-gradient(160deg,#140800 0%,#0d0014 100%)" }}
        >
          {/* Header */}
          <div
            className="px-7 py-5 flex items-center justify-between"
            style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}
          >
            <div>
              <p className="font-black text-white text-base" style={{letterSpacing:"-0.01em"}}>
                Share Your Experience
              </p>
              <p className="text-xs mt-0.5" style={{color:"rgba(255,255,255,0.4)"}}>Takes less than a minute ✨</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-xl font-bold transition-all hover:opacity-70"
              style={{
                background:"rgba(255,255,255,0.07)",
                color:"rgba(255,255,255,0.55)",
                border:"1px solid rgba(255,255,255,0.1)",
              }}
              aria-label="Close review form"
            >×</button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-7 py-6 space-y-5">
            {error && (
              <div
                className="px-4 py-3 rounded-2xl text-sm font-medium"
                style={{
                  background:"rgba(239,68,68,0.12)",
                  border:"1px solid rgba(239,68,68,0.3)",
                  color:"#fca5a5",
                }}
              >{error}</div>
            )}

            {/* Stars */}
            <div className="py-1">
              <p
                className="text-center text-[10px] font-black uppercase tracking-[0.18em] mb-4"
                style={{color:"rgba(255,255,255,0.3)"}}
              >Your Rating</p>
              <StarInput value={rating} onChange={setRating} />
            </div>

            {/* Name & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id:"review-prompt-name", label:"Your Name", value:name, setter:setName, placeholder:"e.g. Priya Sharma" },
                { id:"review-prompt-location", label:"City / State", value:location, setter:setLocation, placeholder:"e.g. Chennai, TN" },
              ].map(({ id, label, value:val, setter, placeholder }) => (
                <div key={id}>
                  <label
                    htmlFor={id}
                    className="block text-[10px] font-black uppercase tracking-[0.14em] mb-2"
                    style={{color:"rgba(255,255,255,0.38)"}}
                  >
                    {label} <span style={{color:"#f97316"}}>*</span>
                  </label>
                  <input
                    id={id}
                    type="text"
                    value={val}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={placeholder}
                    required
                    className="rp-input w-full px-4 py-3 rounded-2xl text-sm font-medium transition-all"
                    style={{
                      background:"rgba(255,255,255,0.05)",
                      border:"1px solid rgba(255,255,255,0.1)",
                      color:"white",
                      caretColor:"#fbbf24",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Review text */}
            <div>
              <label
                htmlFor="review-prompt-text"
                className="block text-[10px] font-black uppercase tracking-[0.14em] mb-2"
                style={{color:"rgba(255,255,255,0.38)"}}
              >
                Your Review <span style={{color:"#f97316"}}>*</span>
              </label>
              <textarea
                id="review-prompt-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="How was your experience? Did the firecrackers light up your celebration? 🎆"
                required
                rows={3}
                className="rp-input w-full px-4 py-3 rounded-2xl text-sm font-medium transition-all resize-none"
                style={{
                  background:"rgba(255,255,255,0.05)",
                  border:"1px solid rgba(255,255,255,0.1)",
                  color:"white",
                  caretColor:"#fbbf24",
                }}
              />
              <p
                className="text-right text-[10px] mt-1"
                style={{color: text.length > 0 ? "rgba(251,191,36,0.5)" : "rgba(255,255,255,0.2)"}}
              >{text.length} chars</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold transition-all hover:opacity-75"
                style={{
                  background:"rgba(255,255,255,0.05)",
                  border:"1px solid rgba(255,255,255,0.1)",
                  color:"rgba(255,255,255,0.5)",
                }}
              >Maybe Later</button>
              <button
                type="submit"
                id="btn-submit-review"
                disabled={saving}
                className="flex-1 px-4 py-3 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                style={{
                  background: saving ? "rgba(249,115,22,0.45)" : "linear-gradient(135deg,#f97316,#ef4444)",
                  boxShadow: saving ? "none" : "0 6px 22px rgba(249,115,22,0.4)",
                }}
              >
                {saving ? (
                  <>
                    <div
                      className="w-4 h-4 rounded-full border-2"
                      style={{
                        borderColor:"rgba(255,255,255,0.25)",
                        borderTopColor:"white",
                        animation:"rp-spin 0.7s linear infinite",
                      }}
                    />
                    Submitting…
                  </>
                ) : "⭐ Submit Review"}
              </button>
            </div>

            <p className="text-center text-[10px]" style={{color:"rgba(255,255,255,0.2)"}}>
              Reviews appear after a quick moderation check.
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
