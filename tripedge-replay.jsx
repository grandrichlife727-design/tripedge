import { useState, useEffect, useRef } from "react";

// ─── Trip Data (simulating a completed Lisbon trip) ───
const TRIP = {
  city: "Lisbon",
  country: "Portugal",
  dates: "Apr 17–21, 2026",
  days: 4,
  travelers: 4,
  groupName: "Portugal Squad",
  totalSpent: 1842,
  perPerson: 460,
  stepsWalked: 47200,
  spotsVisited: 18,
  mealsEaten: 14,
  photosCount: 243,
  savedAmount: 412,
  highlights: [
    { day: 1, name: "Alfama Golden Hour", type: "gem", note: "Got lost in the backstreets and found the best viewpoint nobody knows about" },
    { day: 1, name: "Pastéis de Belém", type: "food", note: "8-minute wait instead of the usual 35 — thanks TripEdge timing" },
    { day: 2, name: "LX Factory", type: "culture", note: "Marcus bought a vintage travel poster. Sonia found handmade ceramics." },
    { day: 2, name: "Cervejaria Ramiro", type: "food", note: "Best seafood of our lives. The garlic prawns were unreal." },
    { day: 3, name: "Sintra Day Trip", type: "adventure", note: "Pena Palace in the fog felt like a fairytale" },
    { day: 4, name: "Fado in Alfama", type: "culture", note: "Ended the trip with live fado in a tiny bar. Sonia cried." },
  ],
  photos: [
    { url: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&h=600&fit=crop", caption: "Alfama rooftops at golden hour", day: 1 },
    { url: "https://images.unsplash.com/photo-1548707309-dcebeab426c8?w=800&h=600&fit=crop", caption: "Miradouro da Graça sunset", day: 1 },
    { url: "https://images.unsplash.com/photo-1579697096985-41fe1430e5df?w=800&h=600&fit=crop", caption: "The famous pastéis de nata", day: 1 },
    { url: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=600&fit=crop", caption: "LX Factory street art", day: 2 },
    { url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop", caption: "Cervejaria Ramiro feast", day: 2 },
    { url: "https://images.unsplash.com/photo-1497862021188-42e0bc48dedc?w=800&h=600&fit=crop", caption: "Pena Palace in the clouds", day: 3 },
    { url: "https://images.unsplash.com/photo-1513735718075-2e2d37cb7cc4?w=800&h=600&fit=crop", caption: "Sintra magical gardens", day: 3 },
    { url: "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=800&h=600&fit=crop", caption: "Last night fado session", day: 4 },
  ],
};

// ─── Themes ───
const THEMES = {
  editorial: { name: "Editorial", bg: "#0A0A0A", text: "#F5F0EB", accent: "#D4A574", sub: "#8A8070", card: "#141414", border: "#222", font: "'Playfair Display'", bodyFont: "'Outfit'" },
  polaroid: { name: "Polaroid", bg: "#F5F0E8", text: "#2C2418", accent: "#C0392B", sub: "#8C7E6A", card: "#FFFFFF", border: "#E0D8CC", font: "'Playfair Display'", bodyFont: "'Outfit'" },
  minimal: { name: "Minimal", bg: "#FDFBF7", text: "#2C2418", accent: "#2A9D8F", sub: "#8C7E6A", card: "#FFFFFF", border: "#EDE8DD", font: "'Playfair Display'", bodyFont: "'Outfit'" },
};

// ─── Stats Pill ───
function Stat({ value, label, theme }) {
  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ fontSize: 28, fontWeight: 800, color: theme.accent, fontFamily: theme.font }}>{value}</p>
      <p style={{ fontSize: 11, color: theme.sub, fontWeight: 500, textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>{label}</p>
    </div>
  );
}

// ─── Main Component ───
export default function TripReplay() {
  const [phase, setPhase] = useState("select"); // select | generating | story
  const [themeKey, setThemeKey] = useState("editorial");
  const [aiCaption, setAiCaption] = useState(null);
  const [genProgress, setGenProgress] = useState(0);
  const [activePhoto, setActivePhoto] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const theme = THEMES[themeKey];

  // Simulate AI generation
  function startGeneration() {
    setPhase("generating");
    setGenProgress(0);
    const steps = [
      { pct: 15, label: "Analyzing your itinerary..." },
      { pct: 35, label: "Processing 243 photos..." },
      { pct: 55, label: "Writing your trip narrative..." },
      { pct: 75, label: "Designing visual layouts..." },
      { pct: 90, label: "Adding finishing touches..." },
      { pct: 100, label: "Your Trip Replay is ready!" },
    ];
    let i = 0;
    const iv = setInterval(() => {
      if (i < steps.length) {
        setGenProgress(steps[i].pct);
        i++;
      } else {
        clearInterval(iv);
        // Generate AI caption
        generateCaption();
      }
    }, 700);
  }

  async function generateCaption() {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 600,
          messages: [{
            role: "user",
            content: `You're writing a short, evocative trip recap for a travel app called TripEdge. The user just returned from a 4-day trip to Lisbon, Portugal with 3 friends ("Portugal Squad"). Key moments: getting lost in Alfama at golden hour, eating pastéis de nata at Belém with only an 8-minute wait, discovering LX Factory, an unforgettable seafood dinner at Cervejaria Ramiro, a foggy day trip to Sintra's Pena Palace, and ending with live fado music that made someone cry. They walked 47,200 steps, visited 18 spots, and saved $412 using TripEdge deals. Write in 2nd person. Be warm, specific, cinematic. NO generic travel clichés. Return ONLY valid JSON: {"headline":"A short poetic headline (max 8 words)","subheadline":"One evocative sentence","narrative":"3-4 paragraph narrative (keep it ~150 words total, vivid and personal)","pull_quote":"One memorable sentence to feature as a large pull quote","social_caption":"A short Instagram/TikTok caption with 2-3 relevant emojis, mention @tripedgeai"}`
          }],
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "";
      setAiCaption(JSON.parse(text.replace(/```json|```/g, "").trim()));
    } catch {
      setAiCaption({
        headline: "Four Days of Lisbon Gold",
        subheadline: "A trip that started with pastéis and ended with tears.",
        narrative: "You got lost in Alfama during golden hour and found a viewpoint that wasn't on any map. The backstreets led you somewhere better than any itinerary could — a quiet corner where the light hit terracotta and turned everything amber.\n\nAt Belém, TripEdge told you to go now. Eight-minute wait instead of thirty-five. The custard was warm, the shells shattered perfectly, and Marcus ate four.\n\nSintra was wrapped in fog so thick Pena Palace looked painted onto clouds. You climbed through gardens that felt borrowed from a dream. That evening, Cervejaria Ramiro's garlic prawns made the table go silent.\n\nThe last night was fado in a bar so small you could feel the singer's breath. Sonia cried. Nobody said anything. Some trips you plan. This one just happened.",
        pull_quote: "Some trips you plan. This one just happened.",
        social_caption: "4 days, 47K steps, and a fado night that broke us 🇵🇹✨ planned with @tripedgeai",
      });
    }
    setPhase("story");
  }

  const photosByDay = {};
  TRIP.photos.forEach(p => { if (!photosByDay[p.day]) photosByDay[p.day] = []; photosByDay[p.day].push(p); });

  return (
    <div style={{ minHeight: "100vh", background: phase === "story" ? theme.bg : "#FDFBF7", color: phase === "story" ? theme.text : "#2C2418", fontFamily: "'Outfit', sans-serif", transition: "background 0.6s ease, color 0.6s ease" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,700;0,800;1,400;1,500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: ${phase === "story" ? theme.sub + "44" : "#D4C9B5"}; border-radius: 10px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
        @keyframes typewriter { from { width:0; } to { width:100%; } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes shimmer { 0%{background-position:-300% 0} 100%{background-position:300% 0} }
        @keyframes grain { 0%,100%{transform:translate(0,0)} 10%{transform:translate(-1%,-1%)} 30%{transform:translate(1%,0)} 50%{transform:translate(-1%,1%)} 70%{transform:translate(1%,-1%)} 90%{transform:translate(0,1%)} }
        .fade-up { animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both; }
        .fade-in { animation: fadeIn 0.8s ease both; }
        .scale-in { animation: scaleIn 0.5s ease both; }
        .photo-hover { transition: transform 0.4s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s ease; }
        .photo-hover:hover { transform: scale(1.03) rotate(-0.5deg); box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
        .grain-overlay::after {
          content: ''; position: fixed; top: -50%; left: -50%; width: 200%; height: 200%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 1; animation: grain 0.5s steps(1) infinite;
        }
      `}</style>

      {/* ═══ PHASE 1: TRIP SELECTION ═══ */}
      {phase === "select" && (
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "60px 32px" }}>
          <div className="fade-up" style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #2A9D8F, #1A6DAD)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#fff" }}>✈</div>
              <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 20 }}>Trip<span style={{ color: "#2A9D8F" }}>Edge</span></span>
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 800, marginBottom: 8 }}>Trip Replay</h1>
            <p style={{ fontSize: 16, color: "#8C7E6A" }}>Turn your trip into a visual story worth sharing.</p>
          </div>

          {/* Trip card */}
          <div className="fade-up" style={{ animationDelay: "0.15s", background: "#fff", border: "1px solid #EDE8DD", borderRadius: 20, overflow: "hidden", marginBottom: 24 }}>
            <div style={{ position: "relative", height: 200 }}>
              <img src={TRIP.photos[0].url} alt={TRIP.city} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 40%, rgba(0,0,0,0.7))" }} />
              <div style={{ position: "absolute", bottom: 20, left: 24 }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: "#fff", fontFamily: "'Playfair Display', serif" }}>{TRIP.city}, {TRIP.country}</h2>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>{TRIP.dates} · {TRIP.days} days · {TRIP.travelers} travelers</p>
              </div>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
                {[{ v: TRIP.spotsVisited, l: "Spots" }, { v: TRIP.photosCount, l: "Photos" }, { v: `${(TRIP.stepsWalked / 1000).toFixed(1)}K`, l: "Steps" }, { v: `$${TRIP.savedAmount}`, l: "Saved" }].map((s, i) => (
                  <div key={i} style={{ textAlign: "center", padding: "10px 0", background: "#FDFBF7", borderRadius: 10 }}>
                    <p style={{ fontSize: 20, fontWeight: 700, color: "#2A9D8F" }}>{s.v}</p>
                    <p style={{ fontSize: 11, color: "#A89E8C", fontWeight: 500 }}>{s.l}</p>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 13, color: "#8C7E6A", marginBottom: 4 }}>✦ {TRIP.groupName} · {TRIP.highlights.length} highlights captured</p>
            </div>
          </div>

          {/* Theme picker */}
          <div className="fade-up" style={{ animationDelay: "0.25s", marginBottom: 24 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#A89E8C", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 10 }}>Choose a style</p>
            <div style={{ display: "flex", gap: 10 }}>
              {Object.entries(THEMES).map(([key, t]) => (
                <button key={key} onClick={() => setThemeKey(key)} style={{
                  flex: 1, padding: "16px 14px", borderRadius: 14, cursor: "pointer", fontFamily: "inherit",
                  background: t.bg, color: t.text, border: themeKey === key ? `2px solid ${t.accent}` : `2px solid transparent`,
                  boxShadow: themeKey === key ? `0 0 0 3px ${t.accent}33` : "none",
                  transition: "all 0.2s",
                }}>
                  <div style={{ width: "100%", height: 4, borderRadius: 2, background: t.accent, marginBottom: 10 }} />
                  <p style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</p>
                  <p style={{ fontSize: 11, color: t.sub, marginTop: 2 }}>{key === "editorial" ? "Dark & cinematic" : key === "polaroid" ? "Warm & vintage" : "Clean & modern"}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Generate CTA */}
          <button className="fade-up" onClick={startGeneration} style={{
            animationDelay: "0.35s", width: "100%", padding: "18px 0", borderRadius: 16,
            background: "linear-gradient(135deg, #2A9D8F, #1A6DAD)", color: "#fff",
            border: "none", fontSize: 17, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 4px 20px rgba(42,157,143,0.3)",
          }}>✨ Generate my Trip Replay</button>
        </div>
      )}

      {/* ═══ PHASE 2: GENERATING ═══ */}
      {phase === "generating" && (
        <div style={{ maxWidth: 500, margin: "0 auto", padding: "120px 32px", textAlign: "center" }}>
          <div className="scale-in">
            <div style={{ width: 80, height: 80, borderRadius: 20, background: "linear-gradient(135deg, #2A9D8F, #1A6DAD)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 28px", animation: "pulse 2s ease infinite" }}>✨</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Creating your story</h2>
            <p style={{ fontSize: 15, color: "#8C7E6A", marginBottom: 32 }}>
              {genProgress < 35 ? "Analyzing your itinerary..." : genProgress < 55 ? "Processing 243 photos..." : genProgress < 75 ? "Writing your trip narrative..." : genProgress < 95 ? "Designing visual layouts..." : "Almost there..."}
            </p>
            <div style={{ height: 6, background: "#F0EBE1", borderRadius: 3, overflow: "hidden", marginBottom: 12 }}>
              <div style={{ height: "100%", width: `${genProgress}%`, background: "linear-gradient(90deg, #2A9D8F, #1A6DAD)", borderRadius: 3, transition: "width 0.5s ease" }} />
            </div>
            <p style={{ fontSize: 13, color: "#A89E8C" }}>{genProgress}%</p>
          </div>
        </div>
      )}

      {/* ═══ PHASE 3: THE STORY ═══ */}
      {phase === "story" && aiCaption && (
        <div className={themeKey === "editorial" ? "grain-overlay" : ""} style={{ position: "relative", zIndex: 0 }}>
          {/* Floating toolbar */}
          <div style={{
            position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
            background: themeKey === "editorial" ? "rgba(20,20,20,0.9)" : "rgba(255,255,255,0.92)",
            backdropFilter: "blur(16px)", borderRadius: 16, padding: "10px 16px",
            display: "flex", gap: 8, alignItems: "center", zIndex: 200,
            border: `1px solid ${theme.border}`, boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          }}>
            {Object.entries(THEMES).map(([key, t]) => (
              <button key={key} onClick={() => setThemeKey(key)} style={{
                width: 28, height: 28, borderRadius: 8, border: themeKey === key ? `2px solid ${t.accent}` : "2px solid transparent",
                background: t.bg, cursor: "pointer", transition: "all 0.2s",
              }} title={t.name} />
            ))}
            <div style={{ width: 1, height: 24, background: theme.border, margin: "0 6px" }} />
            <button onClick={() => setShowShareModal(true)} style={{
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`,
              color: "#fff", border: "none", borderRadius: 10, padding: "8px 20px",
              fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 6,
            }}>Share ↗</button>
            <button onClick={() => setPhase("select")} style={{
              background: "transparent", color: theme.sub, border: `1px solid ${theme.border}`,
              borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 500,
              cursor: "pointer", fontFamily: "inherit",
            }}>Edit</button>
          </div>

          <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 32px 120px", position: "relative", zIndex: 2 }}>

            {/* ── Hero ── */}
            <div className="fade-in" style={{ paddingTop: 48, marginBottom: 64 }}>
              <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", marginBottom: 32 }}>
                <img src={TRIP.photos[0].url} alt="Hero" style={{ width: "100%", height: 420, objectFit: "cover", display: "block" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 30%, rgba(0,0,0,0.75))" }} />
                <div style={{ position: "absolute", bottom: 36, left: 36, right: 36 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: theme.accent, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>Trip Replay</p>
                  <h1 style={{ fontFamily: theme.font + ", serif", fontSize: 44, fontWeight: 800, color: "#fff", lineHeight: 1.1, marginBottom: 8 }}>{aiCaption.headline}</h1>
                  <p style={{ fontSize: 17, color: "rgba(255,255,255,0.75)", fontStyle: "italic" }}>{aiCaption.subheadline}</p>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 8px" }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>{TRIP.groupName}</p>
                  <p style={{ fontSize: 13, color: theme.sub }}>{TRIP.city}, {TRIP.country} · {TRIP.dates}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #2A9D8F, #1A6DAD)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff" }}>✈</div>
                  <span style={{ fontSize: 12, color: theme.sub }}>made with TripEdge</span>
                </div>
              </div>
            </div>

            {/* ── Stats bar ── */}
            <div className="fade-up" style={{
              display: "grid", gridTemplateColumns: "repeat(5,1fr)",
              background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 18,
              padding: "28px 16px", marginBottom: 56,
            }}>
              <Stat value={`${TRIP.days}`} label="Days" theme={theme} />
              <Stat value={`${TRIP.spotsVisited}`} label="Spots" theme={theme} />
              <Stat value={`${(TRIP.stepsWalked/1000).toFixed(0)}K`} label="Steps" theme={theme} />
              <Stat value={`${TRIP.mealsEaten}`} label="Meals" theme={theme} />
              <Stat value={`$${TRIP.savedAmount}`} label="Saved" theme={theme} />
            </div>

            {/* ── Narrative ── */}
            <div className="fade-up" style={{ marginBottom: 56, padding: "0 12px" }}>
              {aiCaption.narrative.split("\n").filter(Boolean).map((p, i) => (
                <p key={i} style={{
                  fontSize: 17, lineHeight: 1.85, color: theme.text,
                  marginBottom: 20, fontWeight: 400, opacity: 0.9,
                  animationDelay: `${i * 0.15}s`,
                }}>{p}</p>
              ))}
            </div>

            {/* ── Pull quote ── */}
            <div className="fade-up" style={{
              textAlign: "center", padding: "48px 40px", marginBottom: 56,
              borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}`,
              position: "relative",
            }}>
              <span style={{ fontSize: 64, color: theme.accent, fontFamily: theme.font + ", serif", lineHeight: 0.5, display: "block", marginBottom: 16, opacity: 0.4 }}>"</span>
              <p style={{
                fontFamily: theme.font + ", serif", fontSize: 26, fontWeight: 500,
                fontStyle: "italic", lineHeight: 1.5, color: theme.text, maxWidth: 520, margin: "0 auto",
              }}>{aiCaption.pull_quote}</p>
            </div>

            {/* ── Photo grid by day ── */}
            {Object.entries(photosByDay).map(([day, photos]) => (
              <div key={day} className="fade-up" style={{ marginBottom: 48 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: theme.accent + "22", border: `1px solid ${theme.accent}33`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 800, color: theme.accent,
                  }}>{day}</div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700 }}>Day {day}</p>
                    <p style={{ fontSize: 12, color: theme.sub }}>
                      {TRIP.highlights.filter(h => h.day === parseInt(day)).map(h => h.name).join(" · ")}
                    </p>
                  </div>
                </div>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: photos.length === 1 ? "1fr" : photos.length === 2 ? "1fr 1fr" : "2fr 1fr",
                  gridTemplateRows: photos.length > 2 ? "1fr 1fr" : "auto",
                  gap: 8,
                }}>
                  {photos.map((photo, pi) => (
                    <div key={pi} className="photo-hover" style={{
                      borderRadius: 14, overflow: "hidden", position: "relative",
                      gridRow: pi === 0 && photos.length > 2 ? "1 / 3" : "auto",
                      cursor: "pointer",
                    }}>
                      <img src={photo.url} alt={photo.caption} style={{ width: "100%", height: pi === 0 && photos.length > 2 ? "100%" : 220, objectFit: "cover", display: "block" }} />
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px 16px 14px", background: "linear-gradient(transparent, rgba(0,0,0,0.6))" }}>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{photo.caption}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Day highlights */}
                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  {TRIP.highlights.filter(h => h.day === parseInt(day)).map((h, i) => (
                    <div key={i} style={{
                      background: theme.card, border: `1px solid ${theme.border}`,
                      borderRadius: 10, padding: "10px 14px", flex: "1 1 200px",
                    }}>
                      <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{h.name}</p>
                      <p style={{ fontSize: 12, color: theme.sub, lineHeight: 1.5 }}>{h.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* ── Trip Savings Callout ── */}
            <div className="fade-up" style={{
              background: `linear-gradient(135deg, ${theme.accent}11, ${theme.accent}08)`,
              border: `1px solid ${theme.accent}22`, borderRadius: 18, padding: "28px 32px",
              marginBottom: 48, textAlign: "center",
            }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: theme.accent, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Saved with TripEdge</p>
              <p style={{ fontSize: 40, fontWeight: 800, color: theme.accent, fontFamily: theme.font + ", serif" }}>${TRIP.savedAmount}</p>
              <p style={{ fontSize: 14, color: theme.sub, marginTop: 6 }}>across flights, hotels, and hacks for {TRIP.travelers} travelers</p>
            </div>

            {/* ── Social caption ── */}
            <div className="fade-up" style={{
              background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16,
              padding: 24, marginBottom: 48,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: theme.sub, textTransform: "uppercase", letterSpacing: 1.2 }}>Ready-to-post caption</p>
                <button onClick={() => navigator.clipboard?.writeText(aiCaption.social_caption)} style={{
                  background: theme.accent + "18", color: theme.accent, border: `1px solid ${theme.accent}33`,
                  borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                }}>Copy</button>
              </div>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: theme.text }}>{aiCaption.social_caption}</p>
            </div>

            {/* ── Footer ── */}
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: "linear-gradient(135deg, #2A9D8F, #1A6DAD)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff" }}>✈</div>
                <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 15, color: theme.sub }}>Trip<span style={{ color: "#2A9D8F" }}>Edge</span></span>
              </div>
              <p style={{ fontSize: 12, color: theme.sub }}>tripedge.ai — Travel smarter, not cheaper.</p>
            </div>
          </div>

          {/* ═══ SHARE MODAL ═══ */}
          {showShareModal && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}
              onClick={() => setShowShareModal(false)}>
              <div onClick={e => e.stopPropagation()} className="scale-in" style={{
                background: themeKey === "editorial" ? "#141414" : "#fff",
                borderRadius: 24, padding: 32, width: 400, maxWidth: "90vw",
                border: `1px solid ${theme.border}`,
              }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, marginBottom: 6, color: theme.text }}>Share your story</h3>
                <p style={{ fontSize: 14, color: theme.sub, marginBottom: 24 }}>Every share helps a friend discover smarter travel.</p>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { icon: "📸", name: "Instagram Story", desc: "Vertical carousel format" },
                    { icon: "🎵", name: "TikTok", desc: "Video slideshow with music" },
                    { icon: "🔗", name: "Copy Link", desc: "Shareable web story" },
                    { icon: "📥", name: "Download Images", desc: "High-res photo set" },
                    { icon: "📄", name: "Export PDF", desc: "Printable trip journal" },
                  ].map((opt, i) => (
                    <button key={i} style={{
                      display: "flex", alignItems: "center", gap: 14, width: "100%",
                      padding: "14px 16px", borderRadius: 12,
                      background: theme.card, border: `1px solid ${theme.border}`,
                      cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.background = theme.accent + "08"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = theme.card; }}
                    >
                      <span style={{ fontSize: 22 }}>{opt.icon}</span>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>{opt.name}</p>
                        <p style={{ fontSize: 12, color: theme.sub }}>{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <button onClick={() => setShowShareModal(false)} style={{
                  width: "100%", marginTop: 16, padding: "12px 0", borderRadius: 12,
                  background: "transparent", border: `1px solid ${theme.border}`,
                  color: theme.sub, fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
