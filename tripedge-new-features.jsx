import { useState, useEffect, useRef } from "react";

// ─── Shared ───
function Badge({ text, type }) {
  const s = ({ hot: { bg: "#FEF0E7", c: "#D4600E", b: "#FADCC8" }, warm: { bg: "#FFF8E6", c: "#A67C00", b: "#FFF0BF" }, watch: { bg: "#F0F4F5", c: "#6B7C85", b: "#DDE4E8" }, drop: { bg: "#E8F5EE", c: "#1B7340", b: "#C5E8D4" }, low: { bg: "#E6F2FA", c: "#1A6DAD", b: "#C0DDF2" }, deal: { bg: "#FEF0E7", c: "#D4600E", b: "#FADCC8" }, pro: { bg: "#E6F2FA", c: "#1A6DAD", b: "#C0DDF2" } })[type] || { bg: "#F0F4F5", c: "#6B7C85", b: "#DDE4E8" };
  return <span style={{ background: s.bg, color: s.c, border: `1px solid ${s.b}`, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, letterSpacing: 0.3, whiteSpace: "nowrap" }}>{text}</span>;
}

// ─── Feature 1: Social Save Pipeline ───
const SAVED_SPOTS = [
  { id: 1, name: "Time Out Market", city: "Lisbon", source: "TikTok", type: "food", img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&h=200&fit=crop", note: "From @miguelseats reel", savedAt: "2 days ago" },
  { id: 2, name: "Miradouro da Graça", city: "Lisbon", source: "Instagram", type: "gem", img: "https://images.unsplash.com/photo-1548707309-dcebeab426c8?w=300&h=200&fit=crop", note: "Sunset viewpoint from @lisbon.secrets", savedAt: "3 days ago" },
  { id: 3, name: "LX Factory", city: "Lisbon", source: "Blog", type: "culture", img: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=300&h=200&fit=crop", note: "Creative market complex", savedAt: "5 days ago" },
  { id: 4, name: "Pastéis de Belém", city: "Lisbon", source: "TikTok", type: "food", img: "https://images.unsplash.com/photo-1579697096985-41fe1430e5df?w=300&h=200&fit=crop", note: "The original pastéis de nata", savedAt: "1 week ago" },
  { id: 5, name: "Alfama District", city: "Lisbon", source: "Instagram", type: "gem", img: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=300&h=200&fit=crop", note: "Wander the oldest neighborhood", savedAt: "1 week ago" },
];

function SocialSavePipeline() {
  const [spots, setSpots] = useState(SAVED_SPOTS);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [url, setUrl] = useState("");
  const srcIcon = { TikTok: "♪", Instagram: "◎", Blog: "✎" };
  const srcColor = { TikTok: "#010101", Instagram: "#C13584", Blog: "#2A9D8F" };

  function handleGenerate() {
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setGenerated(true); }, 2200);
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Saved Spots</h2>
        <p style={{ fontSize: 14, color: "#8C7E6A" }}>Save places from anywhere on the web. AI turns them into a real itinerary.</p>
      </div>

      {/* Save bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", background: "#fff", border: "1px solid #EDE8DD", borderRadius: 12, padding: "0 16px", gap: 10 }}>
          <span style={{ fontSize: 18 }}>🔗</span>
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Paste a TikTok, Instagram, or blog link..." style={{ flex: 1, border: "none", padding: "14px 0", fontSize: 14, fontFamily: "inherit", color: "#2C2418", background: "transparent", outline: "none" }} />
        </div>
        <button style={{ background: "linear-gradient(135deg, #2A9D8F, #1A6DAD)", color: "#fff", border: "none", borderRadius: 12, padding: "0 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>+ Save Spot</button>
      </div>

      {/* Saved spots grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
        {spots.map((s, i) => (
          <div key={s.id} style={{ background: "#fff", border: "1px solid #EDE8DD", borderRadius: 14, overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(44,36,24,0.08)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
            <div style={{ position: "relative", height: 120, overflow: "hidden" }}>
              <img src={s.img} alt={s.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(255,255,255,0.92)", borderRadius: 8, padding: "3px 10px", display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ color: srcColor[s.source], fontSize: 13, fontWeight: 700 }}>{srcIcon[s.source]}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#2C2418" }}>{s.source}</span>
              </div>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, background: "linear-gradient(transparent, rgba(0,0,0,0.5))" }} />
            </div>
            <div style={{ padding: "12px 14px" }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{s.name}</h4>
              <p style={{ fontSize: 12, color: "#8C7E6A", marginBottom: 6 }}>{s.note}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "#A89E8C" }}>{s.savedAt}</span>
                <Badge text={s.type === "food" ? "🍜 Food" : s.type === "gem" ? "✦ Gem" : "🏛 Culture"} type={s.type === "food" ? "warm" : s.type === "gem" ? "deal" : "low"} />
              </div>
            </div>
          </div>
        ))}
        {/* Add new placeholder */}
        <div style={{ background: "#F7F3EC", border: "2px dashed #D4C9B5", borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 200, cursor: "pointer", transition: "border-color 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = "#2A9D8F"} onMouseLeave={e => e.currentTarget.style.borderColor = "#D4C9B5"}>
          <span style={{ fontSize: 32, color: "#D4C9B5", marginBottom: 8 }}>+</span>
          <span style={{ fontSize: 13, color: "#A89E8C", fontWeight: 500 }}>Save a spot</span>
        </div>
      </div>

      {/* Deal tie-in */}
      <div style={{ background: "linear-gradient(135deg, #E8F5EE, #E6F2FA)", border: "1px solid #C5E8D4", borderRadius: 14, padding: "16px 20px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#1B7340" }}>💡 Flights to Lisbon are 41% off right now</p>
          <p style={{ fontSize: 12, color: "#2A9D8F", marginTop: 2 }}>5 of your saved spots are in Lisbon — perfect time to book</p>
        </div>
        <button style={{ background: "#1B7340", color: "#fff", border: "none", borderRadius: 10, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>View Deal</button>
      </div>

      {/* Generate itinerary CTA */}
      <button onClick={handleGenerate} disabled={generating} style={{
        width: "100%", padding: "16px 0", borderRadius: 14,
        background: generating ? "#D4C9B5" : "linear-gradient(135deg, #2A9D8F, #1A6DAD)",
        color: "#fff", border: "none", fontSize: 16, fontWeight: 600, cursor: generating ? "wait" : "pointer", fontFamily: "inherit",
        boxShadow: generating ? "none" : "0 4px 16px rgba(42,157,143,0.25)",
        transition: "all 0.2s",
      }}>
        {generating ? "Building your Lisbon itinerary from 5 saved spots..." : "✨ Turn saved spots into an itinerary"}
      </button>

      {generated && (
        <div style={{ marginTop: 20, background: "#fff", border: "1px solid #EDE8DD", borderRadius: 14, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><span style={{ fontSize: 18 }}>✅</span><span style={{ fontSize: 15, fontWeight: 600 }}>3-day Lisbon itinerary generated from your saved spots</span></div>
          <div style={{ display: "flex", gap: 10 }}>
            {["Day 1: Alfama + Pastéis de Belém", "Day 2: LX Factory + Time Out Market", "Day 3: Miradouro da Graça + Fado night"].map((d, i) => (
              <div key={i} style={{ flex: 1, background: "#FDFBF7", border: "1px solid #EDE8DD", borderRadius: 10, padding: "12px 14px" }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#2A9D8F", marginBottom: 4 }}>Day {i + 1}</p>
                <p style={{ fontSize: 13, color: "#2C2418" }}>{d.split(": ")[1]}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Feature 2: Price Forecasting ───
function PriceForecasting() {
  const [route] = useState({ from: "NYC", to: "Lisbon", carrier: "TAP Portugal", current: 287, predicted: 247, direction: "dropping", confidence: 87, daysToWait: 5, history: [420, 390, 355, 340, 310, 295, 287] });
  const maxP = Math.max(...route.history);
  const minP = Math.min(...route.history);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Price Forecast</h2>
        <p style={{ fontSize: 14, color: "#8C7E6A" }}>AI predicts whether to book now or wait — with confidence scores.</p>
      </div>

      <div style={{ background: "#fff", border: "1px solid #EDE8DD", borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>{route.from} → {route.to}</h3>
            <p style={{ fontSize: 13, color: "#8C7E6A" }}>{route.carrier} · Round trip · Apr 12–19</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#1B7340" }}>${route.current}</div>
            <p style={{ fontSize: 12, color: "#A89E8C" }}>current price</p>
          </div>
        </div>

        {/* Price chart */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#A89E8C", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12 }}>30-Day Price Trend</p>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 100 }}>
            {route.history.map((p, i) => {
              const h = ((p - minP) / (maxP - minP)) * 80 + 20;
              const isLast = i === route.history.length - 1;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 10, color: isLast ? "#1B7340" : "#A89E8C", fontWeight: isLast ? 700 : 400 }}>${p}</span>
                  <div style={{
                    width: "100%", height: h, borderRadius: 6,
                    background: isLast ? "linear-gradient(180deg, #2A9D8F, #1A6DAD)" : "#F0EBE1",
                    transition: "height 0.6s ease",
                  }} />
                </div>
              );
            })}
            {/* Predicted */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 10, color: "#2A9D8F", fontWeight: 700 }}>${route.predicted}?</span>
              <div style={{
                width: "100%", height: ((route.predicted - minP) / (maxP - minP)) * 80 + 20,
                borderRadius: 6, border: "2px dashed #2A9D8F", background: "#E8F5EE",
              }} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ fontSize: 10, color: "#D4C9B5" }}>30 days ago</span>
            <span style={{ fontSize: 10, color: "#D4C9B5" }}>Today</span>
            <span style={{ fontSize: 10, color: "#2A9D8F", fontWeight: 600 }}>+5 days</span>
          </div>
        </div>

        {/* AI Verdict */}
        <div style={{ background: "#E8F5EE", border: "1px solid #C5E8D4", borderRadius: 14, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fff", border: "3px solid #2A9D8F", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: "#2A9D8F" }}>{route.confidence}%</span>
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#1B7340" }}>⏳ Wait {route.daysToWait} more days</p>
              <p style={{ fontSize: 13, color: "#2C2418", marginTop: 2 }}>
                {route.confidence}% confidence prices will drop to ~${route.predicted}. You could save an additional ${route.current - route.predicted}.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ flex: 1, padding: "12px 0", borderRadius: 10, background: "#fff", border: "1.5px solid #C5E8D4", color: "#1B7340", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>🔔 Alert me when it drops</button>
            <button style={{ flex: 1, padding: "12px 0", borderRadius: 10, background: "#1B7340", border: "none", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Book now at $287</button>
          </div>
        </div>
      </div>

      {/* Opposite scenario */}
      <div style={{ background: "#fff", border: "1px solid #EDE8DD", borderRadius: 16, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div><h3 style={{ fontSize: 16, fontWeight: 600 }}>LAX → Paris</h3><p style={{ fontSize: 12, color: "#8C7E6A" }}>French Bee · Jun 1–10</p></div>
          <span style={{ fontSize: 22, fontWeight: 700, color: "#D4600E" }}>$341</span>
        </div>
        <div style={{ background: "#FEF0E7", border: "1px solid #FADCC8", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#fff", border: "3px solid #D4600E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#D4600E" }}>91%</span>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#D4600E" }}>🔥 Book now — prices rising</p>
            <p style={{ fontSize: 12, color: "#5C5142" }}>91% confidence this hits $420+ within 7 days. Summer demand is spiking.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Feature 3: Hack Finder ───
const HACKS = [
  {
    id: 1, route: "NYC → Lisbon", directPrice: 287, hackPrice: 198, savings: 89,
    type: "hidden_city", label: "Hidden City Hack",
    description: "Book NYC → Madrid with a connection in Lisbon. Skip the Madrid leg.",
    steps: ["Book NYC → Madrid on TAP (connecting in LIS)", "Exit at Lisbon connection", "One-way only, no checked bags"],
    risk: "low", note: "Works with carry-on only. Don't do this on frequent flyer bookings.",
  },
  {
    id: 2, route: "NYC → Tokyo", directPrice: 512, hackPrice: 389, savings: 123,
    type: "split_ticket", label: "Split Ticket",
    description: "NYC → Seoul on Korean Air ($295) + Seoul → Tokyo on Peach ($94). Save $123 total.",
    steps: ["NYC → ICN on Korean Air: $295", "ICN → NRT on Peach Aviation: $94", "Allow 4+ hour layover in Seoul"],
    risk: "medium", note: "Book with travel insurance. If first leg delays, second isn't protected.",
  },
  {
    id: 3, route: "Bali Hotel", directPrice: 89, hackPrice: 54, savings: 35,
    type: "direct_booking", label: "Direct Booking Hack",
    description: "Alila Seminyak is $89/night on Booking.com but $54/night on their direct site with code ALISUMMER.",
    steps: ["Go to alila.com/seminyak", "Apply code: ALISUMMER", "Includes free breakfast (not on Booking.com)"],
    risk: "low", note: "Same cancellation policy. Direct booking also includes loyalty points.",
  },
];

function HackFinder() {
  const [expanded, setExpanded] = useState(null);
  const riskColors = { low: { bg: "#E8F5EE", c: "#1B7340", b: "#C5E8D4" }, medium: { bg: "#FFF8E6", c: "#A67C00", b: "#FFF0BF" }, high: { bg: "#FEF0E7", c: "#D4600E", b: "#FADCC8" } };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700 }}>Hack Finder</h2>
          <Badge text="Pro Feature" type="pro" />
        </div>
        <p style={{ fontSize: 14, color: "#8C7E6A" }}>AI finds booking tricks savvy travelers use — hidden cities, split tickets, direct booking codes.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {HACKS.map(h => {
          const isOpen = expanded === h.id;
          const rc = riskColors[h.risk];
          return (
            <div key={h.id} onClick={() => setExpanded(isOpen ? null : h.id)} style={{
              background: "#fff", border: isOpen ? "2px solid #2A9D8F" : "1px solid #EDE8DD",
              borderRadius: 16, overflow: "hidden", cursor: "pointer",
              transition: "all 0.25s ease",
              boxShadow: isOpen ? "0 8px 28px rgba(42,157,143,0.10)" : "none",
            }}>
              <div style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, #E8F5EE, #E6F2FA)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                    {h.type === "hidden_city" ? "🎭" : h.type === "split_ticket" ? "✂️" : "🏷️"}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 16, fontWeight: 600 }}>{h.route}</span>
                      <Badge text={h.label} type="low" />
                    </div>
                    <p style={{ fontSize: 13, color: "#8C7E6A" }}>{h.description}</p>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 20 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontSize: 14, color: "#A89E8C", textDecoration: "line-through" }}>${h.directPrice}</span>
                    <span style={{ fontSize: 24, fontWeight: 800, color: "#1B7340" }}>${h.hackPrice}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#2A9D8F" }}>Save ${h.savings}</span>
                </div>
              </div>

              {isOpen && (
                <div style={{ padding: "0 24px 20px", borderTop: "1px solid #F0EBE1" }}>
                  <div style={{ paddingTop: 16 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "#A89E8C", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 10 }}>How it works</p>
                    {h.steps.map((step, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg, #2A9D8F, #1A6DAD)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                        <span style={{ fontSize: 14, color: "#2C2418", lineHeight: 1.5 }}>{step}</span>
                      </div>
                    ))}
                    <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                      <div style={{ flex: 1, background: rc.bg, border: `1px solid ${rc.b}`, borderRadius: 10, padding: "10px 14px" }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: rc.c, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Risk: {h.risk}</p>
                        <p style={{ fontSize: 12, color: "#5C5142", lineHeight: 1.5 }}>{h.note}</p>
                      </div>
                      <button style={{ padding: "0 28px", borderRadius: 10, background: "linear-gradient(135deg, #2A9D8F, #1A6DAD)", color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>Book this hack</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Feature 4: Group Expense Splitting ───
const EXPENSES = [
  { id: 1, desc: "Airbnb (4 nights)", amount: 480, paidBy: "You", split: [120, 120, 120, 120], cat: "stay", date: "Apr 17" },
  { id: 2, desc: "Dinner at Cervejaria Ramiro", amount: 186, paidBy: "Marcus", split: [46.5, 46.5, 46.5, 46.5], cat: "food", date: "Apr 18" },
  { id: 3, desc: "Fado show tickets (×4)", amount: 100, paidBy: "Sonia", split: [25, 25, 25, 25], cat: "activity", date: "Apr 19" },
  { id: 4, desc: "Uber to Belém", amount: 22, paidBy: "You", split: [5.5, 5.5, 5.5, 5.5], cat: "transport", date: "Apr 18" },
];
const MEMBERS = ["You", "Marcus", "Sonia", "Dev"];
const catEmoji = { stay: "🏠", food: "🍽", activity: "🎭", transport: "🚗" };

function ExpenseSplitter() {
  const [showSettle, setShowSettle] = useState(false);

  // Calculate balances
  const balances = {};
  MEMBERS.forEach(m => { balances[m] = 0; });
  EXPENSES.forEach(e => {
    const perPerson = e.amount / MEMBERS.length;
    MEMBERS.forEach(m => {
      if (m === e.paidBy) balances[m] += e.amount - perPerson;
      else balances[m] -= perPerson;
    });
  });

  const totalSpent = EXPENSES.reduce((s, e) => s + e.amount, 0);
  const perPerson = totalSpent / MEMBERS.length;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Trip Expenses</h2>
        <p style={{ fontSize: 14, color: "#8C7E6A" }}>Portugal Squad Trip · Track spending, split costs, settle up</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
        <div style={{ background: "#fff", border: "1px solid #EDE8DD", borderRadius: 14, padding: "18px 20px" }}>
          <p style={{ fontSize: 11, color: "#A89E8C", fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Total Spent</p>
          <p style={{ fontSize: 26, fontWeight: 700, color: "#2C2418" }}>${totalSpent.toFixed(0)}</p>
        </div>
        <div style={{ background: "#fff", border: "1px solid #EDE8DD", borderRadius: 14, padding: "18px 20px" }}>
          <p style={{ fontSize: 11, color: "#A89E8C", fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Per Person</p>
          <p style={{ fontSize: 26, fontWeight: 700, color: "#2A9D8F" }}>${perPerson.toFixed(0)}</p>
        </div>
        <div style={{ background: "#fff", border: "1px solid #EDE8DD", borderRadius: 14, padding: "18px 20px" }}>
          <p style={{ fontSize: 11, color: "#A89E8C", fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Expenses</p>
          <p style={{ fontSize: 26, fontWeight: 700, color: "#1A6DAD" }}>{EXPENSES.length}</p>
        </div>
      </div>

      {/* Balances */}
      <div style={{ background: "#fff", border: "1px solid #EDE8DD", borderRadius: 16, padding: 20, marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#A89E8C", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 14 }}>Who owes whom</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {MEMBERS.map(m => {
            const bal = balances[m];
            const positive = bal >= 0;
            return (
              <div key={m} style={{ textAlign: "center", padding: "14px 10px", borderRadius: 12, background: positive ? "#E8F5EE" : "#FEF0E7", border: `1px solid ${positive ? "#C5E8D4" : "#FADCC8"}` }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #2A9D8F, #1A6DAD)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, margin: "0 auto 8px" }}>{m[0]}</div>
                <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{m}</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: positive ? "#1B7340" : "#D4600E" }}>
                  {positive ? "+" : ""}{bal >= 0 ? `$${bal.toFixed(0)}` : `-$${Math.abs(bal).toFixed(0)}`}
                </p>
                <p style={{ fontSize: 11, color: "#8C7E6A", marginTop: 2 }}>{positive ? "is owed" : "owes"}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expense list */}
      <div style={{ background: "#fff", border: "1px solid #EDE8DD", borderRadius: 16, padding: 20, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#A89E8C", textTransform: "uppercase", letterSpacing: 1.2 }}>All expenses</p>
          <button style={{ background: "linear-gradient(135deg, #2A9D8F, #1A6DAD)", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>+ Add Expense</button>
        </div>
        {EXPENSES.map((e, i) => (
          <div key={e.id} style={{ display: "grid", gridTemplateColumns: "40px 1fr auto", gap: 14, alignItems: "center", padding: "12px 0", borderBottom: i < EXPENSES.length - 1 ? "1px solid #F0EBE1" : "none" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#F7F3EC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{catEmoji[e.cat]}</div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600 }}>{e.desc}</p>
              <p style={{ fontSize: 12, color: "#A89E8C" }}>Paid by {e.paidBy} · {e.date} · ${(e.amount / MEMBERS.length).toFixed(0)}/person</p>
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#2C2418" }}>${e.amount}</span>
          </div>
        ))}
      </div>

      {/* Settle up */}
      <button onClick={() => setShowSettle(!showSettle)} style={{
        width: "100%", padding: "16px 0", borderRadius: 14,
        background: "linear-gradient(135deg, #2A9D8F, #1A6DAD)",
        color: "#fff", border: "none", fontSize: 16, fontWeight: 600,
        cursor: "pointer", fontFamily: "inherit",
        boxShadow: "0 4px 16px rgba(42,157,143,0.25)",
      }}>🤝 Settle Up</button>

      {showSettle && (
        <div style={{ marginTop: 16, background: "#E8F5EE", border: "1px solid #C5E8D4", borderRadius: 14, padding: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#1B7340", marginBottom: 12 }}>AI-optimized settlements (fewest transactions)</p>
          {[
            { from: "Dev", to: "You", amount: 72 },
            { from: "Dev", to: "Sonia", amount: 25 },
            { from: "Marcus", to: "You", amount: 50.5 },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 2 ? "1px solid #C5E8D4" : "none" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#2A9D8F", border: "1px solid #C5E8D4" }}>{s.from[0]}</div>
              <span style={{ fontSize: 14, color: "#2C2418" }}>{s.from}</span>
              <span style={{ fontSize: 13, color: "#A89E8C" }}>→</span>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#2A9D8F", border: "1px solid #C5E8D4" }}>{s.to[0]}</div>
              <span style={{ fontSize: 14, color: "#2C2418" }}>{s.to}</span>
              <span style={{ marginLeft: "auto", fontSize: 16, fontWeight: 700, color: "#1B7340" }}>${s.amount.toFixed(0)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════
// ROOT APP
// ════════════════════════════════════════════
const FEATURES = [
  { id: "save", label: "Social Save", icon: "📌" },
  { id: "forecast", label: "Price Forecast", icon: "📈" },
  { id: "hacks", label: "Hack Finder", icon: "✂️" },
  { id: "expenses", label: "Expenses", icon: "💰" },
];

export default function NewFeaturesDemo() {
  const [active, setActive] = useState("save");
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 80); }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#FDFBF7", color: "#2C2418", fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,500;0,700;0,800;1,500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #D4C9B5; border-radius: 10px; }
      `}</style>

      {/* Nav */}
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
          <Badge text="New Features Preview" type="pro" />
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
              transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span>{f.icon}</span> {f.label}
            </button>
          ))}
        </div>
      </nav>

      <div style={{ padding: "28px 32px", maxWidth: 1000, margin: "0 auto" }}>
        {active === "save" && <SocialSavePipeline />}
        {active === "forecast" && <PriceForecasting />}
        {active === "hacks" && <HackFinder />}
        {active === "expenses" && <ExpenseSplitter />}
      </div>
    </div>
  );
}
