import { useState, useEffect, useRef } from "react";

// ─── Shared ───
function Badge({ text, type }) {
  const s = ({ hot: { bg: "#FEF0E7", c: "#D4600E", b: "#FADCC8" }, warm: { bg: "#FFF8E6", c: "#A67C00", b: "#FFF0BF" }, watch: { bg: "#F0F4F5", c: "#6B7C85", b: "#DDE4E8" }, drop: { bg: "#E8F5EE", c: "#1B7340", b: "#C5E8D4" }, low: { bg: "#E6F2FA", c: "#1A6DAD", b: "#C0DDF2" }, deal: { bg: "#FEF0E7", c: "#D4600E", b: "#FADCC8" }, pro: { bg: "#E6F2FA", c: "#1A6DAD", b: "#C0DDF2" }, premium: { bg: "#F3EEFF", c: "#7C3AED", b: "#DDD6FE" } })[type] || { bg: "#F0F4F5", c: "#6B7C85", b: "#DDE4E8" };
  return <span style={{ background: s.bg, color: s.c, border: `1px solid ${s.b}`, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, letterSpacing: 0.3, whiteSpace: "nowrap" }}>{text}</span>;
}

// ════════════════════════════════════════
// FEATURE 1: LIVE TRIP COMPANION
// ════════════════════════════════════════

const COMPANION_CARDS = [
  {
    id: 1, type: "nearby_gem", priority: "high",
    icon: "✦", title: "Hidden courtyard café — 200m away",
    body: "Café da Garagem is inside a theater courtyard. 4.9★ on Google, almost zero tourist traffic. Their galão is the best in Graça.",
    action: "Navigate", time: "Just now",
    meta: { distance: "200m", rating: 4.9, reviews: 87 },
  },
  {
    id: 2, type: "weather_alert", priority: "high",
    icon: "🌧", title: "Rain starting in ~90 minutes",
    body: "Your afternoon plans include Miradouro da Graça (outdoor). Here's an indoor backup: Museu do Fado is 8 min walk and highly rated.",
    action: "Swap plan", time: "15 min ago",
    meta: { rainChance: 92, startTime: "3:30 PM" },
  },
  {
    id: 3, type: "timing", priority: "medium",
    icon: "⏰", title: "Pastéis de Belém — go now",
    body: "The line is currently 8 minutes (usually 35+ at peak). If you leave in the next 20 min you'll beat the lunch rush.",
    action: "Get directions", time: "28 min ago",
    meta: { waitNow: "8 min", waitPeak: "35 min" },
  },
  {
    id: 4, type: "deal_nearby", priority: "medium",
    icon: "🏷", title: "Happy hour starts in 30 min nearby",
    body: "Topo Chiado rooftop bar — cocktails half price 4-6 PM. Great sunset views. 5 min walk from your current location.",
    action: "Add to plan", time: "42 min ago",
    meta: { discount: "50% off", endsAt: "6:00 PM" },
  },
  {
    id: 5, type: "transit", priority: "low",
    icon: "🚊", title: "Tram 28 — skip it today",
    body: "Current wait is 45+ minutes with heavy crowds. Take Tram 12E instead — same route through Alfama, fraction of the tourists.",
    action: "Show route", time: "1 hr ago",
    meta: { wait28: "45 min", wait12: "6 min" },
  },
];

function LiveCompanion() {
  const [dismissed, setDismissed] = useState(new Set());
  const [activeDay, setActiveDay] = useState(2);
  const [simTime, setSimTime] = useState("2:14 PM");

  const priorityColor = { high: "#D4600E", medium: "#A67C00", low: "#6B7C85" };
  const typeColor = { nearby_gem: "#2A9D8F", weather_alert: "#1A6DAD", timing: "#1B7340", deal_nearby: "#D4600E", transit: "#8C7E6A" };

  const visibleCards = COMPANION_CARDS.filter(c => !dismissed.has(c.id));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700 }}>Live Companion</h2>
          <Badge text="Premium" type="premium" />
        </div>
        <p style={{ fontSize: 14, color: "#8C7E6A" }}>Contextual suggestions based on your location, weather, and real-time conditions.</p>
      </div>

      {/* Trip context bar */}
      <div style={{ background: "#fff", border: "1px solid #EDE8DD", borderRadius: 14, padding: "16px 20px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {[1, 2, 3].map(d => (
              <button key={d} onClick={() => setActiveDay(d)} style={{
                width: 36, height: 36, borderRadius: 10,
                background: activeDay === d ? "linear-gradient(135deg, #2A9D8F, #1A6DAD)" : "#F7F3EC",
                color: activeDay === d ? "#fff" : "#8C7E6A",
                border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}>D{d}</button>
            ))}
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600 }}>Day {activeDay} in Lisbon</p>
            <p style={{ fontSize: 12, color: "#A89E8C" }}>Graça & Alfama · {simTime}</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 13, fontWeight: 600 }}>22°C · Partly Cloudy</p>
            <p style={{ fontSize: 11, color: "#D4600E", fontWeight: 500 }}>Rain at ~3:30 PM</p>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#FEF0E7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>⛅</div>
        </div>
      </div>

      {/* Location indicator */}
      <div style={{ background: "linear-gradient(135deg, #E8F5EE, #E6F2FA)", border: "1px solid #C5E8D4", borderRadius: 14, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#2A9D8F", boxShadow: "0 0 0 3px rgba(42,157,143,0.2)" }} />
        <p style={{ fontSize: 13, color: "#1B7340", fontWeight: 500 }}>📍 You're near Miradouro da Graça · 7,842 steps today</p>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#2A9D8F", fontWeight: 600 }}>3 suggestions nearby</span>
      </div>

      {/* Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {visibleCards.map((card, i) => (
          <div key={card.id} style={{
            background: "#fff",
            border: card.priority === "high" ? `1.5px solid ${typeColor[card.type]}33` : "1px solid #EDE8DD",
            borderRadius: 16, padding: "18px 22px",
            animation: `fadeUp 0.4s ease ${i * 0.08}s both`,
            position: "relative", overflow: "hidden",
          }}>
            {card.priority === "high" && (
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${typeColor[card.type]}, ${typeColor[card.type]}44)` }} />
            )}
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: `${typeColor[card.type]}11`,
                border: `1px solid ${typeColor[card.type]}22`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
              }}>{card.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 600, color: "#2C2418" }}>{card.title}</h4>
                  <span style={{ fontSize: 11, color: "#A89E8C", flexShrink: 0, marginLeft: 12 }}>{card.time}</span>
                </div>
                <p style={{ fontSize: 13, color: "#5C5142", lineHeight: 1.6, marginBottom: 12 }}>{card.body}</p>

                {/* Meta pills */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                  {card.meta.distance && <span style={{ fontSize: 11, color: "#2A9D8F", background: "#E8F5EE", padding: "2px 8px", borderRadius: 6, fontWeight: 500 }}>📍 {card.meta.distance}</span>}
                  {card.meta.rating && <span style={{ fontSize: 11, color: "#8B6914", background: "#FFF8E6", padding: "2px 8px", borderRadius: 6, fontWeight: 500 }}>⭐ {card.meta.rating} ({card.meta.reviews})</span>}
                  {card.meta.rainChance && <span style={{ fontSize: 11, color: "#1A6DAD", background: "#E6F2FA", padding: "2px 8px", borderRadius: 6, fontWeight: 500 }}>🌧 {card.meta.rainChance}% at {card.meta.startTime}</span>}
                  {card.meta.waitNow && <span style={{ fontSize: 11, color: "#1B7340", background: "#E8F5EE", padding: "2px 8px", borderRadius: 6, fontWeight: 500 }}>⏱ {card.meta.waitNow} wait (vs {card.meta.waitPeak} usual)</span>}
                  {card.meta.discount && <span style={{ fontSize: 11, color: "#D4600E", background: "#FEF0E7", padding: "2px 8px", borderRadius: 6, fontWeight: 500 }}>🏷 {card.meta.discount} until {card.meta.endsAt}</span>}
                  {card.meta.wait12 && <span style={{ fontSize: 11, color: "#2A9D8F", background: "#E8F5EE", padding: "2px 8px", borderRadius: 6, fontWeight: 500 }}>🚊 12E: {card.meta.wait12} vs 28: {card.meta.wait28}</span>}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{
                    background: `linear-gradient(135deg, ${typeColor[card.type]}, ${typeColor[card.type]}cc)`,
                    color: "#fff", border: "none", borderRadius: 10, padding: "8px 18px",
                    fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                  }}>{card.action}</button>
                  <button onClick={() => setDismissed(prev => new Set([...prev, card.id]))} style={{
                    background: "#F7F3EC", color: "#8C7E6A", border: "1px solid #EDE8DD",
                    borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 500,
                    cursor: "pointer", fontFamily: "inherit",
                  }}>Dismiss</button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {visibleCards.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#A89E8C" }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>✨</p>
            <p style={{ fontSize: 15, fontWeight: 500 }}>All caught up! Enjoy your trip.</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>New suggestions appear as conditions change.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// FEATURE 2: FITNESS-AWARE PACING
// ════════════════════════════════════════

const ITINERARY_ITEMS = [
  { time: "9:00 AM", name: "Breakfast at Heim Café", type: "food", steps: 300, energy: "low", duration: 45, note: null },
  { time: "10:00 AM", name: "Explore Alfama streets", type: "adventure", steps: 4200, energy: "high", duration: 90, note: null },
  { time: "11:30 AM", name: "Sé Cathedral", type: "culture", steps: 800, energy: "medium", duration: 45, note: null },
  { time: "12:30 PM", name: "Lunch at Taberna da Rua das Flores", type: "food", steps: 400, energy: "low", duration: 60, note: null },
  { time: "1:30 PM", name: "Rest break", type: "relax", steps: 0, energy: "rest", duration: 45, note: "AI added: You typically hit a wall around 8K steps. Recharge at your Airbnb before the afternoon." },
  { time: "2:30 PM", name: "Tram 28 to Belém", type: "transport", steps: 200, energy: "low", duration: 30, note: null },
  { time: "3:00 PM", name: "Jerónimos Monastery", type: "culture", steps: 1800, energy: "medium", duration: 60, note: null },
  { time: "4:15 PM", name: "Pastéis de Belém", type: "food", steps: 300, energy: "low", duration: 30, note: null },
  { time: "5:00 PM", name: "Sunset at Miradouro da Graça", type: "gem", steps: 1200, energy: "medium", duration: 60, note: "AI swapped: Originally Castelo de S. Jorge (steep 30min hike). Graça viewpoint is flat and equally stunning at sunset." },
];

function FitnessPacing() {
  const [healthConnected, setHealthConnected] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  const totalSteps = ITINERARY_ITEMS.reduce((s, i) => s + i.steps, 0);
  const energyColors = { low: "#1B7340", medium: "#A67C00", high: "#D4600E", rest: "#1A6DAD", transport: "#8C7E6A" };
  const typeEmoji = { food: "🍽", adventure: "⛰", culture: "🏛", relax: "☕", transport: "🚊", gem: "✦" };

  // Simulated energy curve
  const energyCurve = [85, 80, 62, 55, 70, 72, 58, 65, 50];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700 }}>Fitness-Aware Pacing</h2>
          <Badge text="Premium" type="premium" />
        </div>
        <p style={{ fontSize: 14, color: "#8C7E6A" }}>Itineraries that match your actual energy levels — never over-plan a day again.</p>
      </div>

      {/* Health connect card */}
      <div style={{ background: "#fff", border: "1px solid #EDE8DD", borderRadius: 16, padding: 20, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: healthConnected ? "#E8F5EE" : "#F7F3EC", border: `1px solid ${healthConnected ? "#C5E8D4" : "#EDE8DD"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
              {healthConnected ? "❤️" : "⌚"}
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600 }}>{healthConnected ? "Apple Health Connected" : "Connect Health Data"}</p>
              <p style={{ fontSize: 12, color: "#8C7E6A" }}>{healthConnected ? "Avg 8,200 steps/day · Comfort zone: 10K" : "Sync to get energy-aware itineraries"}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowProfile(!showProfile)} style={{ background: "#F7F3EC", border: "1px solid #EDE8DD", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", color: "#8C7E6A" }}>
              {showProfile ? "Hide profile" : "View profile"}
            </button>
            <div onClick={() => setHealthConnected(!healthConnected)} style={{
              width: 44, height: 24, borderRadius: 12, cursor: "pointer",
              background: healthConnected ? "#2A9D8F" : "#D4C9B5",
              padding: 2, transition: "background 0.2s",
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: 10, background: "#fff",
                transform: healthConnected ? "translateX(20px)" : "translateX(0)",
                transition: "transform 0.2s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
              }} />
            </div>
          </div>
        </div>

        {showProfile && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #F0EBE1", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {[
              { label: "Daily avg", val: "8,200", unit: "steps" },
              { label: "Comfort zone", val: "10K", unit: "steps" },
              { label: "Fatigue threshold", val: "~2 PM", unit: "" },
              { label: "Rest preference", val: "45 min", unit: "midday" },
            ].map((s, i) => (
              <div key={i} style={{ background: "#FDFBF7", borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
                <p style={{ fontSize: 11, color: "#A89E8C", fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{s.label}</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: "#2C2418" }}>{s.val}</p>
                {s.unit && <p style={{ fontSize: 11, color: "#A89E8C" }}>{s.unit}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Energy curve visualization */}
      <div style={{ background: "#fff", border: "1px solid #EDE8DD", borderRadius: 16, padding: 20, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#A89E8C", textTransform: "uppercase", letterSpacing: 1.2 }}>Predicted Energy Level — Day 2</p>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#2A9D8F" }}>{totalSteps.toLocaleString()} steps</span>
            <span style={{ fontSize: 11, color: "#A89E8C" }}>estimated</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80, marginBottom: 6 }}>
          {energyCurve.map((e, i) => {
            const isRest = ITINERARY_ITEMS[i]?.type === "relax";
            const color = e > 65 ? "#2A9D8F" : e > 45 ? "#A67C00" : "#D4600E";
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <span style={{ fontSize: 9, color: "#A89E8C", fontWeight: 500 }}>{e}%</span>
                <div style={{
                  width: "100%", height: `${e * 0.75}px`, borderRadius: 5,
                  background: isRest ? `repeating-linear-gradient(45deg, ${color}33, ${color}33 4px, ${color}11 4px, ${color}11 8px)` : color,
                  border: isRest ? `1.5px dashed ${color}` : "none",
                  transition: "height 0.4s ease",
                }} />
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 10, color: "#D4C9B5" }}>9 AM</span>
          <span style={{ fontSize: 10, color: "#D4C9B5" }}>12 PM</span>
          <span style={{ fontSize: 10, color: "#1A6DAD", fontWeight: 600 }}>Rest</span>
          <span style={{ fontSize: 10, color: "#D4C9B5" }}>3 PM</span>
          <span style={{ fontSize: 10, color: "#D4C9B5" }}>5 PM</span>
        </div>
      </div>

      {/* Paced itinerary */}
      <div style={{ background: "#fff", border: "1px solid #EDE8DD", borderRadius: 16, padding: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#A89E8C", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 16 }}>Energy-Optimized Itinerary — Day 2</p>

        {ITINERARY_ITEMS.map((item, i) => {
          const eColor = energyColors[item.energy] || "#8C7E6A";
          const isAI = !!item.note;

          return (
            <div key={i}>
              <div style={{
                display: "grid", gridTemplateColumns: "64px 36px 1fr auto",
                gap: 14, alignItems: "center", padding: "12px 0",
                borderBottom: i < ITINERARY_ITEMS.length - 1 ? "1px solid #F7F3EC" : "none",
              }}>
                <span style={{ fontSize: 13, color: "#A89E8C", fontWeight: 500 }}>{item.time}</span>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${eColor}11`, border: `1px solid ${eColor}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
                  {typeEmoji[item.type] || "•"}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{item.name}</span>
                    {isAI && <span style={{ fontSize: 10, fontWeight: 600, color: "#7C3AED", background: "#F3EEFF", padding: "1px 7px", borderRadius: 4, border: "1px solid #DDD6FE" }}>AI adjusted</span>}
                  </div>
                  <p style={{ fontSize: 12, color: "#A89E8C", marginTop: 1 }}>{item.duration} min · {item.steps > 0 ? `~${item.steps.toLocaleString()} steps` : "No walking"}</p>
                </div>
                <div style={{
                  padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                  background: `${eColor}11`, color: eColor, border: `1px solid ${eColor}22`,
                  textTransform: "capitalize",
                }}>{item.energy === "rest" ? "☕ Rest" : item.energy}</div>
              </div>

              {isAI && (
                <div style={{
                  marginLeft: 78, marginBottom: 8, padding: "10px 14px",
                  background: "#F3EEFF", border: "1px solid #DDD6FE", borderRadius: 10,
                  fontSize: 12, color: "#5B21B6", lineHeight: 1.6,
                }}>
                  🧠 {item.note}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// FEATURE 3: AI NEGOTIATOR / PRICE COMPARISON
// ════════════════════════════════════════

const COMPARISON_DATA = {
  route: { from: "NYC", to: "Lisbon", dates: "Apr 12–19", carrier: "TAP Portugal" },
  sites: [
    { name: "Google Flights", price: 287, url: "#", logo: "🔍", note: null },
    { name: "Skyscanner", price: 295, url: "#", logo: "🟢", note: null },
    { name: "Kayak", price: 291, url: "#", logo: "🟠", note: null },
    { name: "Direct (TAP)", price: 310, url: "#", logo: "✈", note: "Includes free seat selection + extra baggage" },
    { name: "Hopper", price: 289, url: "#", logo: "🐰", note: null },
  ],
  hacks: [
    { type: "timing", title: "Book on Tuesday", savings: 18, desc: "Historical data shows TAP drops NYC-LIS fares by ~$18 on Tuesdays at 2 AM EST." },
    { type: "nearby", title: "Fly from EWR instead", savings: 42, desc: "Same TAP flight departs from Newark at $245. 30 min further but saves $42." },
    { type: "package", title: "Bundle with hotel", savings: 65, desc: "TAP Holidays package: flight + 3★ hotel in Alfama for $389/person vs $287 flight + $165 cheapest hotel ($452)." },
  ],
  bestDeal: { site: "AI Negotiator Pick", price: 245, method: "Fly EWR → LIS on Tuesday", totalSaved: 42 },
};

function AINegotiator() {
  const [showHacks, setShowHacks] = useState(true);
  const d = COMPARISON_DATA;
  const cheapest = Math.min(...d.sites.map(s => s.price));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700 }}>AI Negotiator</h2>
          <Badge text="Pro Feature" type="pro" />
        </div>
        <p style={{ fontSize: 14, color: "#8C7E6A" }}>Real-time price comparison + booking tricks a savvy traveler would find — but automated.</p>
      </div>

      {/* Route header */}
      <div style={{ background: "#fff", border: "1px solid #EDE8DD", borderRadius: 16, padding: 20, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>{d.route.from} → {d.route.to}</h3>
            <p style={{ fontSize: 13, color: "#8C7E6A" }}>{d.route.carrier} · {d.route.dates} · Round trip · 1 adult</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 11, color: "#A89E8C", marginBottom: 2 }}>Best found</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: "#1B7340" }}>${d.bestDeal.price}</p>
          </div>
        </div>
      </div>

      {/* Site comparison */}
      <div style={{ background: "#fff", border: "1px solid #EDE8DD", borderRadius: 16, padding: 20, marginBottom: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#A89E8C", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 14 }}>Price across booking sites</p>

        {d.sites.sort((a, b) => a.price - b.price).map((site, i) => {
          const isCheapest = site.price === cheapest;
          const diff = site.price - cheapest;
          const barWidth = (cheapest / site.price) * 100;

          return (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "140px 1fr 80px 80px",
              gap: 14, alignItems: "center", padding: "12px 0",
              borderBottom: i < d.sites.length - 1 ? "1px solid #F7F3EC" : "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>{site.logo}</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{site.name}</span>
              </div>
              <div style={{ height: 8, background: "#F0EBE1", borderRadius: 4, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${barWidth}%`, borderRadius: 4,
                  background: isCheapest ? "linear-gradient(90deg, #2A9D8F, #1A6DAD)" : "#D4C9B5",
                  transition: "width 0.6s ease",
                }} />
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: isCheapest ? "#1B7340" : "#2C2418" }}>${site.price}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                {diff > 0 ? (
                  <span style={{ fontSize: 12, color: "#D4600E", fontWeight: 500 }}>+${diff}</span>
                ) : (
                  <Badge text="Cheapest" type="drop" />
                )}
              </div>
            </div>
          );
        })}

        {d.sites.find(s => s.note) && (
          <div style={{ marginTop: 10, padding: "10px 14px", background: "#FFF8E6", border: "1px solid #FFF0BF", borderRadius: 10, fontSize: 12, color: "#8B6914", lineHeight: 1.5 }}>
            💡 <strong>Note:</strong> {d.sites.find(s => s.note).name} is ${d.sites.find(s => s.note).price - cheapest} more but {d.sites.find(s => s.note).note.toLowerCase()}
          </div>
        )}
      </div>

      {/* AI Hacks */}
      <div style={{ background: "#fff", border: "1px solid #EDE8DD", borderRadius: 16, padding: 20, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#A89E8C", textTransform: "uppercase", letterSpacing: 1.2 }}>AI-Found Tricks</p>
          <button onClick={() => setShowHacks(!showHacks)} style={{ background: "none", border: "none", fontSize: 12, color: "#2A9D8F", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            {showHacks ? "Hide" : "Show"} {d.hacks.length} tricks
          </button>
        </div>

        {showHacks && d.hacks.map((hack, i) => {
          const icons = { timing: "🕐", nearby: "📍", package: "📦" };
          return (
            <div key={i} style={{
              display: "flex", gap: 14, alignItems: "flex-start",
              padding: "14px 0",
              borderBottom: i < d.hacks.length - 1 ? "1px solid #F7F3EC" : "none",
            }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "#E8F5EE", border: "1px solid #C5E8D4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>
                {icons[hack.type]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{hack.title}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#1B7340" }}>Save ${hack.savings}</span>
                </div>
                <p style={{ fontSize: 13, color: "#5C5142", lineHeight: 1.6 }}>{hack.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Best deal CTA */}
      <div style={{
        background: "linear-gradient(135deg, #E8F5EE, #E6F2FA)",
        border: "1px solid #C5E8D4", borderRadius: 16, padding: 24,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#2A9D8F", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 6 }}>🧠 AI Negotiator Pick</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#2C2418" }}>{d.bestDeal.method}</p>
            <p style={{ fontSize: 13, color: "#1B7340", marginTop: 4 }}>Saves ${d.bestDeal.totalSaved} vs best listed price</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 32, fontWeight: 800, color: "#1B7340", fontFamily: "'Playfair Display', serif" }}>${d.bestDeal.price}</p>
            <button style={{
              marginTop: 8, background: "#1B7340", color: "#fff", border: "none", borderRadius: 10,
              padding: "10px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}>Book this deal →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// ROOT
// ════════════════════════════════════════
const FEATURES = [
  { id: "companion", label: "Live Companion", icon: "📍" },
  { id: "fitness", label: "Fitness Pacing", icon: "❤️" },
  { id: "negotiator", label: "AI Negotiator", icon: "🤝" },
];

export default function Tier2Features() {
  const [active, setActive] = useState("companion");
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 80); }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#FDFBF7", color: "#2C2418", fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,700;0,800;1,400;1,500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #D4C9B5; border-radius: 10px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 32px", borderBottom: "1px solid #EDE8DD",
        background: "rgba(253,251,247,0.92)", backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 100,
        opacity: loaded ? 1 : 0, transition: "opacity 0.5s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #2A9D8F, #1A6DAD)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#fff" }}>✈</div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 18 }}>Trip<span style={{ color: "#2A9D8F" }}>Edge</span></span>
          <Badge text="Tier 2 Features" type="premium" />
        </div>
        <div style={{ display: "flex", gap: 4, background: "#F0EBE1", borderRadius: 12, padding: 4 }}>
          {FEATURES.map(f => (
            <button key={f.id} onClick={() => setActive(f.id)} style={{
              background: active === f.id ? "#fff" : "transparent",
              color: active === f.id ? "#2C2418" : "#8C7E6A",
              border: "none", padding: "8px 16px", borderRadius: 10,
              fontSize: 13, fontWeight: active === f.id ? 600 : 400,
              fontFamily: "inherit", cursor: "pointer",
              boxShadow: active === f.id ? "0 1px 4px rgba(44,36,24,0.08)" : "none",
              transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6,
            }}>
              <span>{f.icon}</span> {f.label}
            </button>
          ))}
        </div>
      </nav>

      <div style={{ padding: "28px 32px", maxWidth: 1000, margin: "0 auto" }}>
        {active === "companion" && <LiveCompanion />}
        {active === "fitness" && <FitnessPacing />}
        {active === "negotiator" && <AINegotiator />}
      </div>
    </div>
  );
}
