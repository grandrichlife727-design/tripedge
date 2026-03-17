import { useState, useEffect, useRef } from "react";

// ─── DATA ───
const DEALS = [
  { id: 1, type: "flight", from: "NYC", to: "Lisbon", price: 287, typical: 485, savings: 41, carrier: "TAP Portugal", dates: "Apr 12–19", urgency: "hot", trend: "dropping", img: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=400&h=260&fit=crop" },
  { id: 2, type: "flight", from: "NYC", to: "Tokyo", price: 512, typical: 890, savings: 42, carrier: "ANA", dates: "May 3–14", urgency: "warm", trend: "stable", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=260&fit=crop" },
  { id: 3, type: "hotel", from: "", to: "Barcelona", price: 89, typical: 165, savings: 46, carrier: "Hotel Arts", dates: "Apr 20–25/night", urgency: "hot", trend: "dropping", img: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&h=260&fit=crop" },
  { id: 4, type: "flight", from: "LAX", to: "Paris", price: 341, typical: 580, savings: 41, carrier: "French Bee", dates: "Jun 1–10", urgency: "watch", trend: "rising", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=260&fit=crop" },
  { id: 5, type: "hotel", from: "", to: "Bali", price: 42, typical: 95, savings: 56, carrier: "Alila Seminyak", dates: "May 15–22/night", urgency: "hot", trend: "dropping", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=260&fit=crop" },
  { id: 6, type: "flight", from: "CHI", to: "Reykjavik", price: 198, typical: 410, savings: 52, carrier: "PLAY", dates: "Apr 5–12", urgency: "hot", trend: "dropping", img: "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=400&h=260&fit=crop" },
];
const TRENDING = [
  { city: "Lisbon", country: "Portugal", tag: "Trending", img: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=600&h=400&fit=crop", desc: "40% below seasonal avg" },
  { city: "Kyoto", country: "Japan", tag: "Hidden Gem", img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&h=400&fit=crop", desc: "Cherry blossom season deals" },
  { city: "Medellín", country: "Colombia", tag: "Underpriced", img: "https://images.unsplash.com/photo-1599070978682-e2671a82bed2?w=600&h=400&fit=crop", desc: "52% below typical fares" },
];
const ALERTS = [
  { msg: "NYC → Lisbon dropped 18% in 2 hours", time: "12m ago", type: "drop" },
  { msg: "Tokyo flights just hit a 6-month low", time: "1h ago", type: "low" },
  { msg: "Bali hotels 56% below average", time: "3h ago", type: "deal" },
];
const GROUP = {
  name: "Portugal Squad Trip",
  members: [
    { name: "You", status: "voted", pref: "Lisbon", budget: 2000 },
    { name: "Marcus", status: "voted", pref: "Porto", budget: 1800 },
    { name: "Sonia", status: "voted", pref: "Lisbon", budget: 2500 },
    { name: "Dev", status: "pending", pref: null, budget: null },
  ],
  dates: ["Apr 10–17", "Apr 17–24", "May 1–8"],
  dateVotes: { "Apr 10–17": 2, "Apr 17–24": 3, "May 1–8": 1 },
  aiRec: "Lisbon wins 2-1 on destination votes. Apr 17–24 has the most availability. Estimated $1,450/person including flights + 4-star hotel — 12% below typical April pricing.",
};
const FEATURES = [
  { icon: "📉", title: "Deal Scanner", desc: "AI monitors thousands of routes and detects when flights or hotels are mispriced below historical averages. Get alerted before prices bounce back.", tag: "Save 30-50%" },
  { icon: "🗺", title: "AI Trip Planner", desc: "Describe your vibe, budget, and travel style. Get a local-first itinerary with hidden gems, not tourist traps — built in seconds.", tag: "Powered by AI" },
  { icon: "👥", title: "Group Coordinator", desc: "Everyone votes on dates, destinations, and budget. AI reconciles preferences and finds the optimal plan that works for the whole crew.", tag: "No more group chats" },
  { icon: "🔔", title: "Price Alerts", desc: "Track any route and get instant notifications when prices drop. Steam move detection catches sudden 15%+ swings before they disappear.", tag: "Real-time" },
];
const PLANS = [
  { name: "Free", price: 0, desc: "Get started with basic trip planning", features: ["AI itinerary builder (3/month)", "Browse active deals", "1 price alert", "Basic group trip (up to 3)"], cta: "Get Started", popular: false, accent: "#8C7E6A" },
  { name: "Pro", price: 12, desc: "For travelers who want the edge", features: ["Unlimited AI itineraries", "Full Deal Scanner access", "25 price alerts + push notifications", "Steam move detection", "Group trips up to 10 people", "Price history charts", "Priority deal alerts (15 min early)"], cta: "Start Free Trial", popular: true, accent: "#2A9D8F" },
  { name: "Premium", price: 29, desc: "Concierge-level AI planning", features: ["Everything in Pro", "Unlimited price alerts", "AI concierge chat (24/7)", "Unlimited group trips", "Affiliate cashback on bookings", "Exclusive flash deal access", "Calendar sync + auto-booking", "Multi-city trip optimizer"], cta: "Start Free Trial", popular: false, accent: "#1A6DAD" },
];
const TESTIMONIALS = [
  { name: "Sarah K.", loc: "Brooklyn, NY", text: "Found a $280 round-trip to Lisbon that was normally $500+. The deal scanner actually works.", avatar: "S" },
  { name: "Marcus T.", loc: "Austin, TX", text: "The group trip feature saved our friend group from 200 messages of 'what dates work for everyone?'", avatar: "M" },
  { name: "Priya R.", loc: "San Francisco, CA", text: "The AI itinerary for Kyoto was better than any blog I found. Every spot was a genuine hidden gem.", avatar: "P" },
];

// ─── SHARED COMPONENTS ───
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Reveal({ children, delay = 0 }) {
  const [ref, visible] = useInView();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
    }}>{children}</div>
  );
}

function Badge({ text, type }) {
  const s = ({
    hot: { bg: "#FEF0E7", color: "#D4600E", border: "#FADCC8" },
    warm: { bg: "#FFF8E6", color: "#A67C00", border: "#FFF0BF" },
    watch: { bg: "#F0F4F5", color: "#6B7C85", border: "#DDE4E8" },
    drop: { bg: "#E8F5EE", color: "#1B7340", border: "#C5E8D4" },
    low: { bg: "#E6F2FA", color: "#1A6DAD", border: "#C0DDF2" },
    deal: { bg: "#FEF0E7", color: "#D4600E", border: "#FADCC8" },
  })[type] || { bg: "#F0F4F5", color: "#6B7C85", border: "#DDE4E8" };
  return <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, letterSpacing: 0.3, whiteSpace: "nowrap" }}>{text}</span>;
}

function Logo({ size = 20 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
      <div style={{ width: size * 1.7, height: size * 1.7, borderRadius: 10, background: "linear-gradient(135deg, #2A9D8F, #1A6DAD)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.85, color: "#fff" }}>✈</div>
      <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: size }}>Trip<span style={{ color: "#2A9D8F" }}>Edge</span></span>
    </div>
  );
}

// ─── GLOBAL STYLES ───
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,700;0,800;1,400;1,500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-thumb { background: #D4C9B5; border-radius: 10px; }
  html { scroll-behavior: smooth; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideIn { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:translateX(0); } }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes shimmer { 0%{background-position:-300% 0} 100%{background-position:300% 0} }
  @keyframes gradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
  .fade-up { animation: fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) both; }
  .slide-in { animation: slideIn 0.4s ease both; }
  .card-hover { transition: transform 0.25s ease, box-shadow 0.25s ease; }
  .card-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(44,36,24,0.10); }
  .deal-row { transition: background 0.15s ease; }
  .deal-row:hover { background: #F7F3EC !important; }
  .shimmer-bar { background: linear-gradient(90deg, #F0EBE1 25%, #F7F3EC 50%, #F0EBE1 75%); background-size: 300% 100%; animation: shimmer 1.8s ease infinite; border-radius: 8px; }
  .hero-gradient { background: linear-gradient(135deg, #FDFBF7 0%, #E8F5EE 40%, #E6F2FA 70%, #FDFBF7 100%); background-size: 200% 200%; animation: gradientShift 12s ease infinite; }
  .btn-p { background:linear-gradient(135deg,#2A9D8F,#1A6DAD); color:#fff; border:none; border-radius:14px; padding:16px 36px; font-size:16px; font-weight:600; cursor:pointer; font-family:inherit; transition:transform 0.2s,box-shadow 0.2s; box-shadow:0 4px 16px rgba(42,157,143,0.25); }
  .btn-p:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(42,157,143,0.35); }
  .btn-s { background:#fff; color:#2C2418; border:1.5px solid #EDE8DD; border-radius:14px; padding:16px 36px; font-size:16px; font-weight:600; cursor:pointer; font-family:inherit; transition:all 0.2s; }
  .btn-s:hover { border-color:#2A9D8F; color:#2A9D8F; }
  .nav-link { transition:color 0.15s; cursor:pointer; }
  .nav-link:hover { color:#2A9D8F !important; }
  .tab-pill { transition:all 0.2s; cursor:pointer; }
  .tab-pill:hover { background:#F0EBE1 !important; }
  .feature-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
  .feature-card:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(44,36,24,0.10); }
  .plan-card { transition: transform 0.3s ease; }
  .plan-card:hover { transform: translateY(-4px); }
  .test-card { transition: transform 0.25s; }
  .test-card:hover { transform: scale(1.02); }
`;

// ════════════════════════════════════════════
// PAGES
// ════════════════════════════════════════════

// ─── LANDING PAGE ───
function LandingPage({ navigate }) {
  const [email, setEmail] = useState("");
  return (
    <>
      {/* HERO */}
      <div className="hero-gradient" style={{ padding: "80px 48px 60px", textAlign: "center" }}>
        <Reveal><div style={{ display: "inline-block", background: "#E8F5EE", border: "1px solid #C5E8D4", borderRadius: 24, padding: "6px 18px", marginBottom: 24, fontSize: 13, fontWeight: 600, color: "#1B7340" }}>✦ AI-powered travel deals & planning</div></Reveal>
        <Reveal delay={0.1}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 62, fontWeight: 800, lineHeight: 1.08, maxWidth: 780, margin: "0 auto 20px", letterSpacing: -1 }}>
            Travel smarter,<br /><span style={{ color: "#2A9D8F" }}>not cheaper.</span>
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p style={{ fontSize: 19, color: "#8C7E6A", maxWidth: 560, margin: "0 auto 36px", lineHeight: 1.6 }}>
            TripEdge finds mispriced flights and hotels, builds hidden-gem itineraries, and coordinates group trips — all powered by AI.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", alignItems: "center", marginBottom: 48 }}>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" style={{ width: 320, padding: "16px 22px", borderRadius: 14, border: "1.5px solid #EDE8DD", background: "#fff", fontSize: 15, fontFamily: "inherit", color: "#2C2418", outline: "none" }} />
            <button className="btn-p" onClick={() => navigate("app")}>Start for free →</button>
          </div>
          <p style={{ fontSize: 13, color: "#A89E8C" }}>No credit card required · Cancel anytime</p>
        </Reveal>
        <Reveal delay={0.5}>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 48 }}>
            {[
              { dest: "Lisbon", price: "$287", saved: "41% off", img: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=320&h=200&fit=crop" },
              { dest: "Bali", price: "$42/nt", saved: "56% off", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=320&h=200&fit=crop" },
              { dest: "Reykjavik", price: "$198", saved: "52% off", img: "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=320&h=200&fit=crop" },
            ].map((c, i) => (
              <div key={i} style={{ width: 220, borderRadius: 16, overflow: "hidden", background: "#fff", border: "1px solid #EDE8DD", boxShadow: "0 8px 32px rgba(44,36,24,0.08)", animation: `float 4s ease infinite ${i * 0.6}s` }}>
                <img src={c.img} alt={c.dest} style={{ width: "100%", height: 120, objectFit: "cover" }} />
                <div style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 15, fontWeight: 600 }}>{c.dest}</span><span style={{ fontSize: 14, fontWeight: 700, color: "#1B7340" }}>{c.price}</span></div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#D4600E", background: "#FEF0E7", padding: "2px 8px", borderRadius: 6, marginTop: 6, display: "inline-block" }}>{c.saved}</span>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderTop: "1px solid #EDE8DD", borderBottom: "1px solid #EDE8DD" }}>
        {[{ val: "38%", l: "Average savings" }, { val: "12K+", l: "Trips planned/mo" }, { val: "4.8★", l: "User rating" }, { val: "<30s", l: "AI itinerary speed" }].map((s, i) => (
          <Reveal key={i} delay={i * 0.08}>
            <div style={{ textAlign: "center", padding: "36px 24px", borderRight: i < 3 ? "1px solid #EDE8DD" : "none" }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: "#2A9D8F", fontFamily: "'Playfair Display', serif" }}>{s.val}</div>
              <div style={{ fontSize: 14, color: "#8C7E6A", marginTop: 4 }}>{s.l}</div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* FEATURES */}
      <div style={{ padding: "80px 48px" }}>
        <Reveal><div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 700, marginBottom: 12 }}>Your unfair advantage in travel</h2>
          <p style={{ fontSize: 17, color: "#8C7E6A", maxWidth: 520, margin: "0 auto" }}>We treat travel like a market — find the mispriced deals, skip the overpriced tourist traps, and plan smarter.</p>
        </div></Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20, maxWidth: 900, margin: "0 auto" }}>
          {FEATURES.map((f, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="feature-card" style={{ background: "#fff", border: "1px solid #EDE8DD", borderRadius: 20, padding: "32px 28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <span style={{ fontSize: 36 }}>{f.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#2A9D8F", background: "#E8F5EE", padding: "4px 12px", borderRadius: 20, border: "1px solid #C5E8D4" }}>{f.tag}</span>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 15, color: "#8C7E6A", lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div style={{ padding: "60px 48px 80px", background: "#F7F3EC" }}>
        <Reveal><h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 700, textAlign: "center", marginBottom: 48 }}>How it works</h2></Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 32, maxWidth: 900, margin: "0 auto" }}>
          {[
            { s: "01", t: "Tell us your vibe", d: "Destination, budget, travel style, group size — or just describe your dream trip in a sentence." },
            { s: "02", t: "AI finds the edge", d: "We scan thousands of routes and properties, detect underpriced deals, and build a local-first itinerary." },
            { s: "03", t: "Book with confidence", d: "Get price alerts, group coordination, and insider recommendations — all in one place." },
          ].map((x, i) => (
            <Reveal key={i} delay={i * 0.12}>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#2A9D8F,#1A6DAD)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "#fff", margin: "0 auto 18px", fontFamily: "'Playfair Display', serif" }}>{x.s}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{x.t}</h3>
                <p style={{ fontSize: 14, color: "#8C7E6A", lineHeight: 1.65 }}>{x.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div style={{ padding: "80px 48px" }}>
        <Reveal><h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 700, textAlign: "center", marginBottom: 48 }}>Travelers love TripEdge</h2></Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, maxWidth: 960, margin: "0 auto" }}>
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="test-card" style={{ background: "#fff", border: "1px solid #EDE8DD", borderRadius: 18, padding: "28px 24px" }}>
                <p style={{ fontSize: 15, color: "#2C2418", lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#2A9D8F,#1A6DAD)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff" }}>{t.avatar}</div>
                  <div><div style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</div><div style={{ fontSize: 12, color: "#A89E8C" }}>{t.loc}</div></div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "80px 48px", textAlign: "center" }}>
        <Reveal>
          <div style={{ background: "linear-gradient(135deg,#E8F5EE,#E6F2FA)", borderRadius: 28, padding: "64px 48px", maxWidth: 800, margin: "0 auto", border: "1px solid #C5E8D4" }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, marginBottom: 12 }}>Ready to travel smarter?</h2>
            <p style={{ fontSize: 17, color: "#8C7E6A", maxWidth: 440, margin: "0 auto 32px" }}>Join thousands of travelers saving 30-50% on every trip with AI-powered deal detection.</p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
              <button className="btn-p" style={{ fontSize: 17, padding: "18px 40px" }} onClick={() => navigate("app")}>Get Started Free</button>
              <button className="btn-s" onClick={() => navigate("pricing")} style={{ fontSize: 17, padding: "18px 40px" }}>View Pricing</button>
            </div>
          </div>
        </Reveal>
      </div>

      {/* FOOTER */}
      <footer style={{ padding: "48px 48px 32px", borderTop: "1px solid #EDE8DD", display: "flex", justifyContent: "space-between" }}>
        <div>
          <Logo size={17} />
          <p style={{ fontSize: 13, color: "#A89E8C", maxWidth: 280, lineHeight: 1.6, marginTop: 12 }}>AI-powered travel deals, itineraries, and group trip coordination.</p>
        </div>
        <div style={{ display: "flex", gap: 48 }}>
          {[{ t: "Product", l: ["Features", "Pricing", "Deals", "Planner"] }, { t: "Company", l: ["About", "Blog", "Careers", "Contact"] }, { t: "Legal", l: ["Privacy", "Terms", "Cookies"] }].map((c, i) => (
            <div key={i}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#A89E8C", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>{c.t}</p>
              {c.l.map(lnk => <p key={lnk} className="nav-link" style={{ fontSize: 14, color: "#8C7E6A", marginBottom: 8 }}>{lnk}</p>)}
            </div>
          ))}
        </div>
      </footer>
      <div style={{ padding: "16px 48px 24px", textAlign: "center", fontSize: 12, color: "#D4C9B5" }}>© 2026 TripEdge AI. All rights reserved.</div>
    </>
  );
}

// ─── PRICING PAGE ───
function PricingPage({ navigate }) {
  const [billing, setBilling] = useState("monthly");
  return (
    <div style={{ padding: "60px 48px 80px" }}>
      <Reveal><div style={{ textAlign: "center", marginBottom: 48 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 44, fontWeight: 800, marginBottom: 12 }}>Simple, transparent pricing</h1>
        <p style={{ fontSize: 17, color: "#8C7E6A", maxWidth: 480, margin: "0 auto 28px" }}>Start free, upgrade when you're ready. Every plan includes AI-powered trip planning.</p>
        <div style={{ display: "inline-flex", gap: 4, background: "#F0EBE1", borderRadius: 12, padding: 4 }}>
          {["monthly", "annual"].map(b => (
            <button key={b} onClick={() => setBilling(b)} style={{ background: billing === b ? "#fff" : "transparent", color: billing === b ? "#2C2418" : "#8C7E6A", border: "none", padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: billing === b ? 600 : 400, cursor: "pointer", fontFamily: "inherit", boxShadow: billing === b ? "0 1px 4px rgba(44,36,24,0.08)" : "none" }}>
              {b === "monthly" ? "Monthly" : "Annual"}{b === "annual" && <span style={{ color: "#1B7340", marginLeft: 6, fontSize: 12, fontWeight: 600 }}>Save 20%</span>}
            </button>
          ))}
        </div>
      </div></Reveal>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, maxWidth: 1020, margin: "0 auto" }}>
        {PLANS.map((plan, i) => {
          const p = plan.price === 0 ? "$0" : "$" + (billing === "annual" ? Math.round(plan.price * 0.8) : plan.price);
          return (
            <Reveal key={i} delay={i * 0.1}>
              <div className="plan-card" style={{ background: "#fff", border: plan.popular ? "2px solid #2A9D8F" : "1px solid #EDE8DD", borderRadius: 22, padding: "36px 28px", position: "relative", overflow: "hidden", boxShadow: plan.popular ? "0 12px 40px rgba(42,157,143,0.12)" : "none" }}>
                {plan.popular && <div style={{ position: "absolute", top: 16, right: -28, background: "linear-gradient(135deg,#2A9D8F,#1A6DAD)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 36px", transform: "rotate(45deg)", letterSpacing: 0.5 }}>POPULAR</div>}
                <p style={{ fontSize: 13, fontWeight: 600, color: plan.accent, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8 }}>{plan.name}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 44, fontWeight: 800 }}>{p}</span>
                  <span style={{ fontSize: 15, color: "#A89E8C" }}>{plan.price === 0 ? "/forever" : "/mo"}</span>
                </div>
                <p style={{ fontSize: 14, color: "#8C7E6A", marginBottom: 28, lineHeight: 1.5 }}>{plan.desc}</p>
                <button onClick={() => navigate("app")} style={{ width: "100%", background: plan.popular ? "linear-gradient(135deg,#2A9D8F,#1A6DAD)" : "#fff", color: plan.popular ? "#fff" : "#2C2418", border: plan.popular ? "none" : "1.5px solid #EDE8DD", borderRadius: 12, padding: "14px 0", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: plan.popular ? "0 4px 16px rgba(42,157,143,0.25)" : "none", marginBottom: 28 }}>{plan.cta}</button>
                <div style={{ borderTop: "1px solid #F0EBE1", paddingTop: 20 }}>
                  {plan.features.map((f, fi) => (
                    <div key={fi} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                      <span style={{ color: "#2A9D8F", fontSize: 15, fontWeight: 700, lineHeight: 1.4 }}>✓</span>
                      <span style={{ fontSize: 14, color: "#5C5142", lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 680, margin: "80px auto 0" }}>
        <Reveal><h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, textAlign: "center", marginBottom: 36 }}>Frequently asked questions</h2></Reveal>
        {[
          { q: "How does the Deal Scanner find cheap flights?", a: "Our AI monitors price data across thousands of routes, compares current prices against historical averages, and flags routes that are significantly underpriced — like finding undervalued assets, but for travel." },
          { q: "Can I try Pro features before paying?", a: "Yes! Every paid plan includes a 7-day free trial. No credit card required to start. Cancel anytime during the trial." },
          { q: "How does group trip coordination work?", a: "Create a trip, invite your crew via link. Everyone votes on destinations, dates, and sets their budget. AI reconciles all preferences and suggests the optimal plan." },
          { q: "Is the AI itinerary actually good?", a: "We focus on hidden gems and local experiences, not generic tourist lists. The AI recommends places locals actually go, with realistic time estimates and budget breakdowns." },
        ].map((faq, i) => (
          <Reveal key={i} delay={i * 0.06}>
            <div style={{ background: "#fff", border: "1px solid #EDE8DD", borderRadius: 16, padding: "22px 26px", marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{faq.q}</h3>
              <p style={{ fontSize: 14, color: "#8C7E6A", lineHeight: 1.7 }}>{faq.a}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

// ─── DASHBOARD APP ───
function DashboardApp({ navigate }) {
  const APP_TABS = ["Explore", "Deals", "Plan a Trip", "Group Trips"];
  const [tab, setTab] = useState("Explore");
  const [plannerInput, setPlannerInput] = useState("");
  const [itinerary, setItinerary] = useState(null);
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [dealFilter, setDealFilter] = useState("all");
  const typeEmoji = { gem: "✦", food: "🍜", culture: "🏛", adventure: "⛰", relax: "☀" };
  const typeColor = { gem: "#8B6914", food: "#D4600E", culture: "#1A6DAD", adventure: "#1B7340", relax: "#A67C00" };

  async function generateItinerary() {
    if (!plannerInput.trim()) return;
    setPlannerLoading(true); setItinerary(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: `You are TripEdge AI, a warm and knowledgeable travel planner that specializes in hidden gems and local experiences. Generate a 3-day itinerary for: "${plannerInput}". Focus on authentic local spots, not tourist traps. Return ONLY valid JSON (no markdown, no backticks): {"destination":"city","tagline":"A short evocative tagline","days":[{"day":1,"title":"Day title","items":[{"time":"9:00 AM","activity":"Activity name","description":"One sentence why this is special","cost":"$XX","type":"gem|food|culture|adventure|relax"}]}],"estimated_daily_budget":"$XXX","insider_tip":"One local insider tip"}` }] }),
      });
      const data = await res.json();
      const text = data.content?.map(c => c.text || "").join("") || "";
      setItinerary(JSON.parse(text.replace(/```json|```/g, "").trim()));
    } catch { setItinerary({ error: true }); }
    setPlannerLoading(false);
  }

  const filteredDeals = dealFilter === "all" ? DEALS : DEALS.filter(d => d.type === dealFilter);

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1200, margin: "0 auto" }}>
      {/* App tab bar */}
      <div style={{ display: "flex", gap: 4, background: "#F0EBE1", borderRadius: 12, padding: 4, marginBottom: 28, width: "fit-content" }}>
        {APP_TABS.map(t => (
          <button key={t} className="tab-pill" onClick={() => setTab(t)} style={{ background: tab === t ? "#fff" : "transparent", color: tab === t ? "#2C2418" : "#8C7E6A", border: "none", padding: "8px 18px", borderRadius: 10, fontSize: 13.5, fontWeight: tab === t ? 600 : 400, fontFamily: "inherit", boxShadow: tab === t ? "0 1px 4px rgba(44,36,24,0.08)" : "none" }}>{t}</button>
        ))}
      </div>

      {/* EXPLORE */}
      {tab === "Explore" && (
        <div className="fade-up">
          <div style={{ marginBottom: 32 }}><h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, marginBottom: 6 }}>Where to next?</h1><p style={{ fontSize: 15, color: "#8C7E6A" }}>AI-detected deals, hidden gems, and insider itineraries — updated every hour.</p></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
            {[{ l: "Active Deals", v: "23", icon: "✦", a: "#2A9D8F" }, { l: "Avg. Savings", v: "38%", icon: "↓", a: "#D4600E" }, { l: "Price Drops Today", v: "5", icon: "📉", a: "#1A6DAD" }, { l: "Routes Tracked", v: "12", icon: "◎", a: "#8B6914" }].map((s, i) => (
              <div key={i} className="card-hover" style={{ background: "#fff", border: "1px solid #EDE8DD", borderRadius: 14, padding: "20px 22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}><span style={{ fontSize: 12, color: "#8C7E6A", fontWeight: 500, letterSpacing: 0.5, textTransform: "uppercase" }}>{s.l}</span><span style={{ fontSize: 18 }}>{s.icon}</span></div>
                <div style={{ fontSize: 30, fontWeight: 700, color: s.a }}>{s.v}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700 }}>Trending Destinations</h2><span style={{ fontSize: 13, color: "#2A9D8F", fontWeight: 500, cursor: "pointer" }} onClick={() => setTab("Deals")}>See all deals →</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
              {TRENDING.map((t, i) => (
                <div key={i} className="card-hover" style={{ borderRadius: 16, overflow: "hidden", background: "#fff", border: "1px solid #EDE8DD", cursor: "pointer" }}>
                  <div style={{ position: "relative", height: 170, overflow: "hidden" }}><img src={t.img} alt={t.city} style={{ width: "100%", height: "100%", objectFit: "cover" }} /><div style={{ position: "absolute", top: 12, left: 12 }}><Badge text={t.tag} type={t.tag === "Trending" ? "hot" : t.tag === "Hidden Gem" ? "low" : "deal"} /></div></div>
                  <div style={{ padding: "14px 18px" }}><h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 2 }}>{t.city}</h3><p style={{ fontSize: 13, color: "#8C7E6A", marginBottom: 4 }}>{t.country}</p><p style={{ fontSize: 13, color: "#2A9D8F", fontWeight: 500 }}>{t.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
            <div style={{ background: "#fff", border: "1px solid #EDE8DD", borderRadius: 16, padding: 22 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Top Edge Deals</h3>
              {DEALS.slice(0, 4).map((d, i) => (
                <div key={d.id} className="deal-row" style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 16, alignItems: "center", padding: "14px 0", borderBottom: i < 3 ? "1px solid #F0EBE1" : "none", cursor: "pointer" }}>
                  <div><div style={{ fontSize: 14, fontWeight: 600 }}>{d.type === "flight" ? `${d.from} → ${d.to}` : d.carrier}<span style={{ fontSize: 12, color: "#A89E8C", marginLeft: 8, fontWeight: 400 }}>{d.type === "flight" ? d.carrier : d.to}</span></div><div style={{ fontSize: 12, color: "#A89E8C", marginTop: 2 }}>{d.dates}</div></div>
                  <Badge text={d.urgency === "hot" ? "🔥 Hot" : d.urgency === "warm" ? "Warm" : "Watch"} type={d.urgency} />
                  <div style={{ textAlign: "right" }}><div style={{ fontSize: 18, fontWeight: 700, color: "#1B7340" }}>${d.price}</div><div style={{ fontSize: 11, color: "#A89E8C", textDecoration: "line-through" }}>${d.typical}</div></div>
                </div>
              ))}
            </div>
            <div style={{ background: "#fff", border: "1px solid #EDE8DD", borderRadius: 16, padding: 22 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Live Price Alerts</h3>
              {ALERTS.map((a, i) => (
                <div key={i} style={{ background: "#FDFBF7", border: "1px solid #EDE8DD", borderRadius: 12, padding: "14px 16px", marginBottom: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.5 }}>{a.msg}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}><span style={{ fontSize: 11, color: "#A89E8C" }}>{a.time}</span><Badge text={a.type === "drop" ? "Price Drop" : a.type === "low" ? "6mo Low" : "Deal"} type={a.type} /></div>
                </div>
              ))}
              <div style={{ marginTop: 12, padding: "14px 16px", borderRadius: 12, background: "linear-gradient(135deg,#E8F5EE,#E6F2FA)", border: "1px solid #C5E8D4" }}><p style={{ fontSize: 12, color: "#1B7340", fontWeight: 500, lineHeight: 1.6 }}>💡 <strong>AI Insight:</strong> European flights trending 22% below seasonal averages. Best window: next 48 hours.</p></div>
            </div>
          </div>
        </div>
      )}

      {/* DEALS */}
      {tab === "Deals" && (
        <div className="fade-up">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
            <div><h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Deal Scanner</h1><p style={{ fontSize: 14, color: "#8C7E6A" }}>AI-detected mispriced flights & hotels, sorted by savings edge</p></div>
            <div style={{ display: "flex", gap: 6 }}>{["all", "flight", "hotel"].map(f => (<button key={f} onClick={() => setDealFilter(f)} style={{ background: dealFilter === f ? "#2A9D8F" : "#fff", color: dealFilter === f ? "#fff" : "#8C7E6A", border: `1px solid ${dealFilter === f ? "#2A9D8F" : "#EDE8DD"}`, borderRadius: 10, padding: "8px 18px", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize" }}>{f === "all" ? "All" : f + "s"}</button>))}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {filteredDeals.map((d, i) => (
              <div key={d.id} className="card-hover fade-up" style={{ borderRadius: 16, overflow: "hidden", background: "#fff", border: "1px solid #EDE8DD", cursor: "pointer", animationDelay: `${i * 0.06}s` }}>
                <div style={{ position: "relative", height: 155, overflow: "hidden" }}><img src={d.img} alt={d.to} style={{ width: "100%", height: "100%", objectFit: "cover" }} /><div style={{ position: "absolute", top: 12, left: 12 }}><Badge text={d.urgency === "hot" ? "🔥 Hot Deal" : d.urgency === "warm" ? "Warm" : "Watch"} type={d.urgency} /></div><div style={{ position: "absolute", top: 12, right: 12, background: "#1B7340", color: "#fff", fontSize: 13, fontWeight: 700, padding: "4px 12px", borderRadius: 8 }}>-{d.savings}%</div></div>
                <div style={{ padding: "16px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}><div><h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 2 }}>{d.type === "flight" ? `${d.from} → ${d.to}` : d.carrier}</h3><p style={{ fontSize: 12, color: "#A89E8C" }}>{d.type === "flight" ? d.carrier : d.to} · {d.dates}</p></div><div style={{ textAlign: "right" }}><div style={{ fontSize: 22, fontWeight: 700, color: "#1B7340" }}>${d.price}</div><div style={{ fontSize: 12, color: "#A89E8C", textDecoration: "line-through" }}>avg ${d.typical}</div></div></div>
                  <div style={{ marginTop: 12, padding: "8px 12px", borderRadius: 8, background: d.trend === "dropping" ? "#E8F5EE" : d.trend === "rising" ? "#FEF0E7" : "#F0F4F5", fontSize: 12, fontWeight: 500, color: d.trend === "dropping" ? "#1B7340" : d.trend === "rising" ? "#D4600E" : "#6B7C85" }}>{d.trend === "dropping" ? "📉 Price dropping — book soon" : d.trend === "rising" ? "📈 Trending up" : "→ Stable"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PLAN A TRIP */}
      {tab === "Plan a Trip" && (
        <div className="fade-up">
          <div style={{ marginBottom: 24 }}><h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Plan Your Trip</h1><p style={{ fontSize: 14, color: "#8C7E6A" }}>Describe your dream trip and get a local-first itinerary in seconds</p></div>
          <div style={{ background: "#fff", border: "1px solid #EDE8DD", borderRadius: 16, padding: 24, marginBottom: 24 }}>
            <div style={{ display: "flex", gap: 12 }}>
              <input value={plannerInput} onChange={e => setPlannerInput(e.target.value)} onKeyDown={e => e.key === "Enter" && generateItinerary()} placeholder="e.g. 3 days in Tokyo, $150/day budget, love street food and hidden temples..." style={{ flex: 1, background: "#FDFBF7", border: "1px solid #EDE8DD", borderRadius: 12, padding: "16px 20px", color: "#2C2418", fontSize: 15, fontFamily: "inherit", outline: "none" }} />
              <button onClick={generateItinerary} disabled={plannerLoading} style={{ background: plannerLoading ? "#D4C9B5" : "linear-gradient(135deg,#2A9D8F,#1A6DAD)", color: "#fff", border: "none", borderRadius: 12, padding: "0 32px", fontSize: 15, fontWeight: 600, cursor: plannerLoading ? "wait" : "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>{plannerLoading ? "Planning..." : "Plan my trip ✈"}</button>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
              {["Weekend in Porto under $100/day", "5 days in Bali, adventure + culture", "Tokyo hidden gems, solo traveler"].map(s => (<button key={s} onClick={() => setPlannerInput(s)} style={{ background: "#F7F3EC", border: "1px solid #EDE8DD", borderRadius: 20, padding: "7px 16px", color: "#8C7E6A", fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" }}>{s}</button>))}
            </div>
          </div>
          {plannerLoading && <div style={{ background: "#fff", border: "1px solid #EDE8DD", borderRadius: 16, padding: 28 }}><div className="shimmer-bar" style={{ height: 24, width: "35%", marginBottom: 20 }} />{[1,2,3].map(d => <div key={d} style={{ marginBottom: 24 }}><div className="shimmer-bar" style={{ height: 18, width: "20%", marginBottom: 14 }} />{[1,2,3].map(r => <div key={r} className="shimmer-bar" style={{ height: 56, marginBottom: 10 }} />)}</div>)}</div>}
          {itinerary && !itinerary.error && (
            <div style={{ background: "#fff", border: "1px solid #EDE8DD", borderRadius: 16, padding: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                <div><h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, marginBottom: 4 }}>{itinerary.destination}</h2>{itinerary.tagline && <p style={{ fontSize: 14, color: "#8C7E6A", fontStyle: "italic" }}>{itinerary.tagline}</p>}<p style={{ fontSize: 13, color: "#2A9D8F", fontWeight: 500, marginTop: 6 }}>Est. {itinerary.estimated_daily_budget}/day</p></div>
                {itinerary.insider_tip && <div style={{ background: "#FFF8E6", border: "1px solid #FFF0BF", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#8B6914", maxWidth: 320, lineHeight: 1.5 }}>💡 <strong>Insider tip:</strong> {itinerary.insider_tip}</div>}
              </div>
              {itinerary.days?.map(day => (
                <div key={day.day} style={{ marginBottom: 28 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#A89E8C", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #F0EBE1" }}>Day {day.day} — {day.title}</div>
                  {day.items?.map((item, idx) => (
                    <div key={idx} className="slide-in" style={{ display: "grid", gridTemplateColumns: "72px 1fr auto", gap: 16, alignItems: "start", padding: "12px 0", borderBottom: idx < day.items.length - 1 ? "1px solid #F7F3EC" : "none", animationDelay: `${idx * 0.05}s` }}>
                      <span style={{ fontSize: 13, color: "#A89E8C", fontWeight: 500 }}>{item.time}</span>
                      <div><div style={{ fontSize: 14, fontWeight: 600 }}><span style={{ color: typeColor[item.type] || "#8C7E6A", marginRight: 6 }}>{typeEmoji[item.type] || "•"}</span>{item.activity}</div><div style={{ fontSize: 13, color: "#8C7E6A", marginTop: 3, lineHeight: 1.5 }}>{item.description}</div></div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#1B7340" }}>{item.cost}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
          {itinerary?.error && <div style={{ background: "#fff", border: "1px solid #FADCC8", borderRadius: 16, padding: 24, color: "#D4600E", fontSize: 14 }}>Something went wrong. Please try again.</div>}
        </div>
      )}

      {/* GROUP TRIPS */}
      {tab === "Group Trips" && (
        <div className="fade-up">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
            <div><h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Group Trips</h1><p style={{ fontSize: 14, color: "#8C7E6A" }}>Everyone votes, AI finds the sweet spot</p></div>
            <button style={{ background: "linear-gradient(135deg,#2A9D8F,#1A6DAD)", color: "#fff", border: "none", borderRadius: 12, padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>+ New Group Trip</button>
          </div>
          <div style={{ background: "#fff", border: "1px solid #EDE8DD", borderRadius: 16, padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}><h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700 }}>✈ {GROUP.name}</h2><Badge text="3/4 voted" type="low" /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 24 }}>
              <div style={{ background: "#FDFBF7", border: "1px solid #EDE8DD", borderRadius: 14, padding: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#A89E8C", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 14 }}>Members</p>
                {GROUP.members.map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < GROUP.members.length - 1 ? "1px solid #EDE8DD" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 34, height: 34, borderRadius: "50%", background: m.status === "voted" ? "linear-gradient(135deg,#2A9D8F,#1A6DAD)" : "#EDE8DD", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: m.status === "voted" ? "#fff" : "#A89E8C" }}>{m.name[0]}</div><span style={{ fontSize: 14, fontWeight: 500 }}>{m.name}</span></div>
                    <div style={{ textAlign: "right" }}>{m.status === "voted" ? <><div style={{ fontSize: 13, fontWeight: 500 }}>{m.pref}</div><div style={{ fontSize: 11, color: "#A89E8C" }}>${m.budget?.toLocaleString()} budget</div></> : <Badge text="Pending" type="warm" />}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "#FDFBF7", border: "1px solid #EDE8DD", borderRadius: 14, padding: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#A89E8C", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 14 }}>Date Votes</p>
                {GROUP.dates.map((d, i) => { const v = GROUP.dateVotes[d], mx = Math.max(...Object.values(GROUP.dateVotes)), w = v === mx; return (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 14, fontWeight: w ? 600 : 400, color: w ? "#2A9D8F" : "#2C2418" }}>{d} {w && "✓"}</span><span style={{ fontSize: 13, color: "#A89E8C" }}>{v} votes</span></div>
                    <div style={{ height: 8, background: "#EDE8DD", borderRadius: 6, overflow: "hidden" }}><div style={{ height: "100%", borderRadius: 6, width: `${(v / GROUP.members.length) * 100}%`, background: w ? "linear-gradient(90deg,#2A9D8F,#1A6DAD)" : "#D4C9B5", transition: "width 0.6s" }} /></div>
                  </div>
                ); })}
              </div>
            </div>
            <div style={{ background: "linear-gradient(135deg,#E8F5EE,#E6F2FA)", border: "1px solid #C5E8D4", borderRadius: 14, padding: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#2A9D8F", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8 }}>🧠 AI Recommendation</p>
              <p style={{ fontSize: 14, lineHeight: 1.7 }}>{GROUP.aiRec}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════
// ROOT APP WITH ROUTING
// ════════════════════════════════════════════
export default function TripEdgeApp() {
  const [route, setRoute] = useState("landing"); // landing | pricing | app
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 80); }, []);

  const navigate = (r) => { setRoute(r); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const isApp = route === "app";

  return (
    <div style={{ minHeight: "100vh", background: "#FDFBF7", color: "#2C2418", fontFamily: "'Outfit', 'Avenir Next', sans-serif", overflowX: "hidden" }}>
      <style>{GLOBAL_CSS}</style>

      {/* SHARED NAV */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: isApp ? "12px 32px" : "16px 48px",
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(253,251,247,0.88)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid #EDE8DD",
        opacity: loaded ? 1 : 0, transition: "opacity 0.5s ease",
      }}>
        <div onClick={() => navigate("landing")} style={{ cursor: "pointer" }}><Logo size={isApp ? 18 : 20} /></div>

        {!isApp && (
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <span className="nav-link" onClick={() => navigate("landing")} style={{ fontSize: 14, fontWeight: 500, color: route === "landing" ? "#2C2418" : "#8C7E6A" }}>Home</span>
            <span className="nav-link" onClick={() => navigate("pricing")} style={{ fontSize: 14, fontWeight: 500, color: route === "pricing" ? "#2A9D8F" : "#8C7E6A" }}>Pricing</span>
            <button className="btn-p" onClick={() => navigate("app")} style={{ padding: "10px 24px", fontSize: 14, borderRadius: 10 }}>Open App →</button>
          </div>
        )}

        {isApp && (
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span className="nav-link" onClick={() => navigate("pricing")} style={{ fontSize: 13, fontWeight: 500, color: "#8C7E6A" }}>Pricing</span>
            <button onClick={() => navigate("pricing")} style={{ background: "linear-gradient(135deg,#2A9D8F,#1A6DAD)", color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Upgrade to Pro</button>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#2A9D8F,#1A6DAD)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer" }}>W</div>
          </div>
        )}
      </nav>

      {/* ROUTE CONTENT */}
      {route === "landing" && <LandingPage navigate={navigate} />}
      {route === "pricing" && <PricingPage navigate={navigate} />}
      {route === "app" && <DashboardApp navigate={navigate} />}
    </div>
  );
}
