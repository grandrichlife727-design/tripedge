'use client';

import { useState, useEffect } from "react";

function Badge({ text, type }) {
  const s = ({ hot:{bg:"#FEF0E7",c:"#D4600E",b:"#FADCC8"}, warm:{bg:"#FFF8E6",c:"#A67C00",b:"#FFF0BF"}, drop:{bg:"#E8F5EE",c:"#1B7340",b:"#C5E8D4"}, low:{bg:"#E6F2FA",c:"#1A6DAD",b:"#C0DDF2"}, pro:{bg:"#E6F2FA",c:"#1A6DAD",b:"#C0DDF2"}, premium:{bg:"#F3EEFF",c:"#7C3AED",b:"#DDD6FE"}, teams:{bg:"#FEF0E7",c:"#92400E",b:"#FDE68A"}, success:{bg:"#E8F5EE",c:"#1B7340",b:"#C5E8D4"}, warn:{bg:"#FFF8E6",c:"#A67C00",b:"#FFF0BF"}, danger:{bg:"#FEE2E2",c:"#DC2626",b:"#FECACA"} })[type] || {bg:"#F0F4F5",c:"#6B7C85",b:"#DDE4E8"};
  return <span style={{background:s.bg,color:s.c,border:`1px solid ${s.b}`,fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20,letterSpacing:0.3,whiteSpace:"nowrap"}}>{text}</span>;
}
function Card({children,style={}}) {
  return <div style={{background:"#fff",border:"1px solid #EDE8DD",borderRadius:16,padding:20,...style}}>{children}</div>;
}

// ════════════════════════════════════════
// 6. CORPORATE / TEAMS TIER
// ════════════════════════════════════════
const TEAM_MEMBERS = [
  { name:"Willy D.", role:"Admin", trips:3, spent:2400, status:"active" },
  { name:"Sarah M.", role:"Member", trips:5, spent:3800, status:"active" },
  { name:"James K.", role:"Member", trips:2, spent:1600, status:"active" },
  { name:"Priya R.", role:"Member", trips:0, spent:0, status:"invited" },
];

function CorporateTeams() {
  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:700 }}>TripEdge for Teams</h2>
          <Badge text="$49/mo per team" type="teams" />
        </div>
        <p style={{ fontSize:14, color:"#8C7E6A" }}>Centralized travel planning for companies, agencies, and creator teams.</p>
      </div>

      {/* Team stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        {[{ l:"Team Members", v:"4", a:"#2A9D8F" }, { l:"Total Trips", v:"10", a:"#1A6DAD" }, { l:"Total Spend", v:"$7,800", a:"#D4600E" }, { l:"Total Saved", v:"$1,240", a:"#1B7340" }].map((s,i) => (
          <Card key={i} style={{ textAlign:"center", padding:"18px 16px" }}>
            <p style={{ fontSize:11, color:"#A89E8C", fontWeight:500, textTransform:"uppercase", letterSpacing:0.5, marginBottom:6 }}>{s.l}</p>
            <p style={{ fontSize:26, fontWeight:700, color:s.a }}>{s.v}</p>
          </Card>
        ))}
      </div>

      {/* Team roster */}
      <Card style={{ marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <p style={{ fontSize:11, fontWeight:600, color:"#A89E8C", textTransform:"uppercase", letterSpacing:1.2 }}>Team Members</p>
          <button style={{ background:"linear-gradient(135deg,#2A9D8F,#1A6DAD)", color:"#fff", border:"none", borderRadius:8, padding:"6px 14px", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>+ Invite</button>
        </div>
        {TEAM_MEMBERS.map((m,i) => (
          <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 80px 80px 80px 80px", gap:14, alignItems:"center", padding:"12px 0", borderBottom:i<TEAM_MEMBERS.length-1?"1px solid #F0EBE1":"none" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#2A9D8F,#1A6DAD)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff" }}>{m.name[0]}</div>
              <div><p style={{ fontSize:14, fontWeight:500 }}>{m.name}</p><p style={{ fontSize:11, color:"#A89E8C" }}>{m.role}</p></div>
            </div>
            <span style={{ fontSize:13, color:"#2C2418", textAlign:"center" }}>{m.trips}</span>
            <span style={{ fontSize:13, color:"#2C2418", textAlign:"center" }}>${m.spent.toLocaleString()}</span>
            <Badge text={m.status === "active" ? "Active" : "Invited"} type={m.status === "active" ? "success" : "warn"} />
            <span style={{ fontSize:12, color:"#2A9D8F", cursor:"pointer", textAlign:"center", fontWeight:500 }}>Manage</span>
          </div>
        ))}
      </Card>

      {/* Policies */}
      <Card style={{ marginBottom:20 }}>
        <p style={{ fontSize:11, fontWeight:600, color:"#A89E8C", textTransform:"uppercase", letterSpacing:1.2, marginBottom:14 }}>Travel Policies</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {[
            { icon:"💰", title:"Max per trip", val:"$2,500", desc:"Per-person budget cap" },
            { icon:"🏨", title:"Hotel rating", val:"3★ min", desc:"Quality floor" },
            { icon:"✈", title:"Flight class", val:"Economy only", desc:"Unless 6+ hrs" },
            { icon:"📄", title:"Receipt required", val:"Over $50", desc:"Auto-flagged" },
          ].map((p,i) => (
            <div key={i} style={{ padding:"14px 16px", background:"#FDFBF7", borderRadius:12, border:"1px solid #F0EBE1" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                <span style={{ fontSize:18 }}>{p.icon}</span>
                <span style={{ fontSize:13, fontWeight:600 }}>{p.title}</span>
              </div>
              <p style={{ fontSize:18, fontWeight:700, color:"#2A9D8F" }}>{p.val}</p>
              <p style={{ fontSize:11, color:"#A89E8C", marginTop:2 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Export */}
      <Card>
        <p style={{ fontSize:11, fontWeight:600, color:"#A89E8C", textTransform:"uppercase", letterSpacing:1.2, marginBottom:14 }}>Expense Reporting</p>
        <p style={{ fontSize:13, color:"#5C5142", lineHeight:1.7, marginBottom:14 }}>All team travel expenses sync automatically. Export monthly reports to QuickBooks, Xero, or download as CSV.</p>
        <div style={{ display:"flex", gap:10 }}>
          {["Export to QuickBooks","Export to Xero","Download CSV"].map((btn,i) => (
            <button key={i} style={{ background:i===0?"linear-gradient(135deg,#2A9D8F,#1A6DAD)":"#F7F3EC", color:i===0?"#fff":"#8C7E6A", border:i===0?"none":"1px solid #EDE8DD", borderRadius:10, padding:"10px 20px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>{btn}</button>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════
// 7. WHATSAPP / IMESSAGE BOT
// ════════════════════════════════════════
const CHAT_MESSAGES = [
  { from:"user", text:"hey tripedge, flights to lisbon from NYC?", time:"2:14 PM" },
  { from:"bot", text:"Found 3 deals for NYC → Lisbon:", time:"2:14 PM", deals:[
    { route:"TAP Portugal", price:"$287", badge:"🔥 41% off" },
    { route:"Norse Atlantic", price:"$312", badge:"32% off" },
    { route:"French Bee (via Paris)", price:"$245", badge:"✂️ Split ticket hack" },
  ]},
  { from:"user", text:"is 287 a good price or should i wait?", time:"2:15 PM" },
  { from:"bot", text:"87% confidence it'll drop to ~$247 in 5 days. I'd wait. Want me to set an alert?", time:"2:15 PM", forecast:true },
  { from:"user", text:"yeah alert me", time:"2:15 PM" },
  { from:"bot", text:"✅ Alert set! I'll message you the moment NYC→LIS drops below $260. In the meantime, your saved spots in Lisbon are looking good — want me to build an itinerary?", time:"2:16 PM" },
];

function WhatsAppBot() {
  const [messages, setMessages] = useState(CHAT_MESSAGES);
  const [input, setInput] = useState("");

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:700, marginBottom:4 }}>WhatsApp / iMessage Bot</h2>
        <p style={{ fontSize:14, color:"#8C7E6A" }}>TripEdge lives in your group chat. No app needed — just text.</p>
      </div>

      {/* Phone mockup */}
      <div style={{ maxWidth:420, margin:"0 auto" }}>
        <Card style={{ borderRadius:28, padding:0, overflow:"hidden", border:"2px solid #EDE8DD" }}>
          {/* Phone header */}
          <div style={{ background:"#075E54", padding:"14px 20px", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#2A9D8F,#1A6DAD)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:"#fff" }}>✈</div>
            <div><p style={{ fontSize:15, fontWeight:600, color:"#fff" }}>TripEdge AI</p><p style={{ fontSize:11, color:"rgba(255,255,255,0.7)" }}>online</p></div>
          </div>

          {/* Chat area */}
          <div style={{ background:"#ECE5DD", padding:"16px 14px", minHeight:400, display:"flex", flexDirection:"column", gap:8 }}>
            {messages.map((msg,i) => (
              <div key={i} style={{ display:"flex", justifyContent:msg.from==="user"?"flex-end":"flex-start" }}>
                <div style={{
                  maxWidth:"80%", padding:"10px 14px", borderRadius:12,
                  background:msg.from==="user"?"#DCF8C6":"#fff",
                  borderTopRightRadius:msg.from==="user"?4:12,
                  borderTopLeftRadius:msg.from==="bot"?4:12,
                  boxShadow:"0 1px 2px rgba(0,0,0,0.08)",
                }}>
                  <p style={{ fontSize:14, color:"#111", lineHeight:1.5 }}>{msg.text}</p>

                  {msg.deals && (
                    <div style={{ marginTop:10, display:"flex", flexDirection:"column", gap:6 }}>
                      {msg.deals.map((d,j) => (
                        <div key={j} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 10px", background:"#F0FAF0", borderRadius:8 }}>
                          <div><p style={{ fontSize:13, fontWeight:500 }}>{d.route}</p><p style={{ fontSize:11, color:"#666" }}>{d.badge}</p></div>
                          <span style={{ fontSize:16, fontWeight:700, color:"#1B7340" }}>{d.price}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.forecast && (
                    <div style={{ marginTop:8, padding:"8px 10px", background:"#FFF8E6", borderRadius:8, border:"1px solid #FDE68A" }}>
                      <p style={{ fontSize:12, color:"#92400E" }}>🔮 AI Forecast: Wait 5 days</p>
                    </div>
                  )}

                  <p style={{ fontSize:10, color:"#999", textAlign:"right", marginTop:4 }}>{msg.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{ background:"#F0F0F0", padding:"10px 14px", display:"flex", gap:8 }}>
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Message TripEdge..." style={{ flex:1, padding:"10px 14px", borderRadius:20, border:"none", fontSize:14, fontFamily:"inherit", outline:"none" }} />
            <button style={{ width:40, height:40, borderRadius:"50%", background:"#075E54", border:"none", color:"#fff", fontSize:16, cursor:"pointer" }}>→</button>
          </div>
        </Card>

        {/* Capabilities */}
        <div style={{ marginTop:20, display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {[
            { cmd:"\"flights to [city]\"", desc:"Get instant deals" },
            { cmd:"Forward a screenshot", desc:"AI extracts route + checks price" },
            { cmd:"\"save [restaurant link]\"", desc:"Adds to your collection" },
            { cmd:"\"tripedge [city]\"", desc:"Top 3 deals + itinerary link" },
          ].map((c,i) => (
            <div key={i} style={{ padding:"12px 14px", background:"#fff", border:"1px solid #EDE8DD", borderRadius:10 }}>
              <p style={{ fontSize:12, fontWeight:600, color:"#2A9D8F", fontFamily:"monospace", marginBottom:4 }}>{c.cmd}</p>
              <p style={{ fontSize:12, color:"#8C7E6A" }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// 8. VISA & ENTRY REQUIREMENTS AI
// ════════════════════════════════════════
function VisaAI() {
  const [passport, setPassport] = useState("US");
  const [dest, setDest] = useState("Japan");
  const result = {
    visaRequired: false, stayLimit: "90 days", purpose: "Tourism",
    requirements: ["Valid passport (6+ months validity)", "Return flight ticket", "Proof of accommodation", "No visa needed for US citizens"],
    processing: "N/A — Visa-free entry",
    cost: "$0",
    advisories: [{ type: "info", text: "Japan requires Visit Japan Web registration before arrival" }],
    vaccinations: "None required. COVID vaccine not mandatory as of 2026.",
    currency: "JPY (¥) — $1 ≈ ¥148",
    plugType: "Type A/B (same as US)",
    emergency: "110 (Police) · 119 (Ambulance)",
  };

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:700, marginBottom:4 }}>Visa & Entry AI</h2>
        <p style={{ fontSize:14, color:"#8C7E6A" }}>Instant visa requirements, travel docs, and entry info for any destination.</p>
      </div>

      {/* Input */}
      <Card style={{ marginBottom:20 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:12 }}>
          <div>
            <p style={{ fontSize:11, color:"#A89E8C", fontWeight:500, marginBottom:6 }}>Your passport</p>
            <select value={passport} onChange={e => setPassport(e.target.value)} style={{ width:"100%", padding:"12px 16px", borderRadius:10, border:"1px solid #EDE8DD", fontSize:14, fontFamily:"inherit", background:"#FDFBF7", color:"#2C2418" }}>
              <option value="US">🇺🇸 United States</option>
              <option value="UK">🇬🇧 United Kingdom</option>
              <option value="IN">🇮🇳 India</option>
            </select>
          </div>
          <div>
            <p style={{ fontSize:11, color:"#A89E8C", fontWeight:500, marginBottom:6 }}>Destination</p>
            <select value={dest} onChange={e => setDest(e.target.value)} style={{ width:"100%", padding:"12px 16px", borderRadius:10, border:"1px solid #EDE8DD", fontSize:14, fontFamily:"inherit", background:"#FDFBF7", color:"#2C2418" }}>
              <option value="Japan">🇯🇵 Japan</option>
              <option value="Brazil">🇧🇷 Brazil</option>
              <option value="India">🇮🇳 India</option>
            </select>
          </div>
          <div style={{ display:"flex", alignItems:"flex-end" }}>
            <button style={{ background:"linear-gradient(135deg,#2A9D8F,#1A6DAD)", color:"#fff", border:"none", borderRadius:10, padding:"12px 24px", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Check</button>
          </div>
        </div>
      </Card>

      {/* Result */}
      <div style={{ background:result.visaRequired ? "#FEF0E7" : "#E8F5EE", border:`1px solid ${result.visaRequired ? "#FADCC8" : "#C5E8D4"}`, borderRadius:16, padding:20, marginBottom:20, display:"flex", alignItems:"center", gap:16 }}>
        <div style={{ width:56,height:56,borderRadius:"50%",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28 }}>{result.visaRequired ? "📋" : "✅"}</div>
        <div>
          <p style={{ fontSize:18, fontWeight:700, color:result.visaRequired ? "#D4600E" : "#1B7340" }}>{result.visaRequired ? "Visa Required" : "No Visa Required"}</p>
          <p style={{ fontSize:14, color:"#5C5142" }}>US citizens can stay up to {result.stayLimit} for {result.purpose.toLowerCase()}</p>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
        {/* Requirements */}
        <Card>
          <p style={{ fontSize:11, fontWeight:600, color:"#A89E8C", textTransform:"uppercase", letterSpacing:1.2, marginBottom:12 }}>Entry Requirements</p>
          {result.requirements.map((r,i) => (
            <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:8 }}>
              <span style={{ color:"#2A9D8F", fontSize:14, fontWeight:700 }}>✓</span>
              <span style={{ fontSize:13, color:"#5C5142", lineHeight:1.5 }}>{r}</span>
            </div>
          ))}
        </Card>

        {/* Quick info */}
        <Card>
          <p style={{ fontSize:11, fontWeight:600, color:"#A89E8C", textTransform:"uppercase", letterSpacing:1.2, marginBottom:12 }}>Quick Info</p>
          {[
            { icon:"💰", label:"Currency", val:result.currency },
            { icon:"🔌", label:"Plug type", val:result.plugType },
            { icon:"💉", label:"Vaccinations", val:result.vaccinations },
            { icon:"🚨", label:"Emergency", val:result.emergency },
          ].map((info,i) => (
            <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:10 }}>
              <span style={{ fontSize:16 }}>{info.icon}</span>
              <div><p style={{ fontSize:12, fontWeight:600, color:"#2C2418" }}>{info.label}</p><p style={{ fontSize:12, color:"#8C7E6A" }}>{info.val}</p></div>
            </div>
          ))}
        </Card>
      </div>

      {/* Advisory */}
      {result.advisories.map((a,i) => (
        <div key={i} style={{ padding:"12px 16px", background:"#E6F2FA", border:"1px solid #C0DDF2", borderRadius:10, marginBottom:10 }}>
          <p style={{ fontSize:13, color:"#1A6DAD", fontWeight:500 }}>ℹ️ {a.text}</p>
        </div>
      ))}

      <button style={{ marginTop:10, background:"#F7F3EC", border:"1px solid #EDE8DD", borderRadius:10, padding:"10px 20px", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit", color:"#8C7E6A" }}>🔗 Need a visa? Apply through iVisa (affiliate)</button>
    </div>
  );
}

// ════════════════════════════════════════
// 9. TRIP DARES
// ════════════════════════════════════════
const DARES = [
  { id:1, title:"The €40 Lisbon Feast", desc:"Eat at 5 different restaurants in Lisbon spending €40 or less total. Document each meal.", difficulty:"Medium", xp:150, completions:342, city:"Lisbon", emoji:"🍽", timeLimit:"1 day" },
  { id:2, title:"Sunset Collector", desc:"Photograph sunset from 3 different viewpoints in one evening. No repeats.", difficulty:"Easy", xp:75, completions:891, city:"Any", emoji:"🌅", timeLimit:"1 evening" },
  { id:3, title:"Tokyo Neighborhood Crawl", desc:"Visit all 5 major neighborhoods (Shinjuku, Shibuya, Asakusa, Akihabara, Ginza) using only trains. Take a photo in each.", difficulty:"Hard", xp:250, completions:127, city:"Tokyo", emoji:"🚃", timeLimit:"1 day" },
  { id:4, title:"Local's Choice", desc:"Ask 3 different locals for their favorite hidden spot. Visit all 3. Rate them.", difficulty:"Medium", xp:200, completions:564, city:"Any", emoji:"🗣", timeLimit:"1 day" },
];

function TripDares() {
  const [accepted, setAccepted] = useState(new Set());
  const diffColors = { Easy:{ bg:"#E8F5EE",c:"#1B7340" }, Medium:{ bg:"#FFF8E6",c:"#A67C00" }, Hard:{ bg:"#FEE2E2",c:"#DC2626" } };

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:700, marginBottom:4 }}>Trip Dares</h2>
        <p style={{ fontSize:14, color:"#8C7E6A" }}>AI-generated travel challenges. Complete them, earn XP, share on social.</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        {DARES.map(dare => {
          const dc = diffColors[dare.difficulty];
          const isAccepted = accepted.has(dare.id);
          return (
            <Card key={dare.id} style={{ border:isAccepted ? "2px solid #2A9D8F" : "1px solid #EDE8DD", transition:"all 0.2s" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                <span style={{ fontSize:36 }}>{dare.emoji}</span>
                <div style={{ display:"flex", gap:6 }}>
                  <span style={{ background:dc.bg, color:dc.c, fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20 }}>{dare.difficulty}</span>
                  <span style={{ background:"#FFF8E6", color:"#92400E", fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20 }}>+{dare.xp} XP</span>
                </div>
              </div>
              <h3 style={{ fontSize:16, fontWeight:700, marginBottom:4 }}>{dare.title}</h3>
              <p style={{ fontSize:13, color:"#5C5142", lineHeight:1.6, marginBottom:12 }}>{dare.desc}</p>
              <div style={{ display:"flex", gap:12, marginBottom:14 }}>
                <span style={{ fontSize:12, color:"#A89E8C" }}>📍 {dare.city}</span>
                <span style={{ fontSize:12, color:"#A89E8C" }}>⏱ {dare.timeLimit}</span>
                <span style={{ fontSize:12, color:"#A89E8C" }}>{dare.completions} completed</span>
              </div>
              <button onClick={() => setAccepted(prev => { const n = new Set(prev); isAccepted ? n.delete(dare.id) : n.add(dare.id); return n; })} style={{
                width:"100%", padding:"10px 0", borderRadius:10,
                background:isAccepted ? "#fff" : "linear-gradient(135deg,#2A9D8F,#1A6DAD)",
                color:isAccepted ? "#2A9D8F" : "#fff",
                border:isAccepted ? "1.5px solid #2A9D8F" : "none",
                fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
              }}>{isAccepted ? "✓ Challenge Accepted!" : "Accept Challenge"}</button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// ROOT
// ════════════════════════════════════════
const FEATURES = [
  { id:"teams", label:"Teams", icon:"🏢" },
  { id:"bot", label:"Chat Bot", icon:"💬" },
  { id:"visa", label:"Visa AI", icon:"🛂" },
  { id:"dares", label:"Trip Dares", icon:"🎯" },
];

export default function MillionDollarPart2({ embedded = false }) {
  const [active, setActive] = useState("teams");
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 80); }, []);

  return (
    <div style={{ minHeight:embedded ? "auto" : "100vh", background:"#FDFBF7", color:"#2C2418", fontFamily:"'Outfit',sans-serif" }}>
      {!embedded && (
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,700;0,800;1,500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-thumb{background:#D4C9B5;border-radius:10px}
      `}</style>
      )}

      {!embedded && (
        <nav style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 32px", borderBottom:"1px solid #EDE8DD", background:"rgba(253,251,247,0.92)", backdropFilter:"blur(12px)", position:"sticky", top:0, zIndex:100, opacity:loaded?1:0, transition:"opacity 0.5s" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32,height:32,borderRadius:10,background:"linear-gradient(135deg,#2A9D8F,#1A6DAD)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,color:"#fff" }}>✈</div>
            <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:18 }}>Trip<span style={{ color:"#2A9D8F" }}>Edge</span></span>
            <Badge text="Growth Features" type="teams" />
          </div>
          <div style={{ display:"flex", gap:4, background:"#F0EBE1", borderRadius:12, padding:4 }}>
            {FEATURES.map(f => (
              <button key={f.id} onClick={() => setActive(f.id)} style={{
                background:active===f.id?"#fff":"transparent", color:active===f.id?"#2C2418":"#8C7E6A",
                border:"none", padding:"8px 14px", borderRadius:10, fontSize:12.5, fontWeight:active===f.id?600:400,
                fontFamily:"inherit", cursor:"pointer", boxShadow:active===f.id?"0 1px 4px rgba(44,36,24,0.08)":"none",
                transition:"all 0.2s", display:"flex", alignItems:"center", gap:5,
              }}><span>{f.icon}</span>{f.label}</button>
            ))}
          </div>
        </nav>
      )}

      <div style={{ padding:"28px 32px", maxWidth:1000, margin:"0 auto" }}>
        {embedded && (
          <div style={{ display:"flex", gap:4, background:"#F0EBE1", borderRadius:12, padding:4, width:"fit-content", marginBottom:20, flexWrap:"wrap" }}>
            {FEATURES.map(f => (
              <button key={f.id} onClick={() => setActive(f.id)} style={{
                background:active===f.id?"#fff":"transparent", color:active===f.id?"#2C2418":"#8C7E6A",
                border:"none", padding:"8px 14px", borderRadius:10, fontSize:12.5, fontWeight:active===f.id?600:400,
                fontFamily:"inherit", cursor:"pointer", boxShadow:active===f.id?"0 1px 4px rgba(44,36,24,0.08)":"none",
                transition:"all 0.2s", display:"flex", alignItems:"center", gap:5,
              }}><span>{f.icon}</span>{f.label}</button>
            ))}
          </div>
        )}
        {active === "teams" && <CorporateTeams />}
        {active === "bot" && <WhatsAppBot />}
        {active === "visa" && <VisaAI />}
        {active === "dares" && <TripDares />}
      </div>
    </div>
  );
}
