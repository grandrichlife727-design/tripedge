'use client';

import { useState, useEffect } from "react";

// ─── Shared ───
function Badge({ text, type }) {
  const s = ({ hot: { bg:"#FEF0E7",c:"#D4600E",b:"#FADCC8" }, warm: { bg:"#FFF8E6",c:"#A67C00",b:"#FFF0BF" }, drop: { bg:"#E8F5EE",c:"#1B7340",b:"#C5E8D4" }, low: { bg:"#E6F2FA",c:"#1A6DAD",b:"#C0DDF2" }, pro: { bg:"#E6F2FA",c:"#1A6DAD",b:"#C0DDF2" }, premium: { bg:"#F3EEFF",c:"#7C3AED",b:"#DDD6FE" }, error: { bg:"#FEE2E2",c:"#DC2626",b:"#FECACA" }, gold: { bg:"#FFF8E6",c:"#92400E",b:"#FDE68A" } })[type] || { bg:"#F0F4F5",c:"#6B7C85",b:"#DDE4E8" };
  return <span style={{ background:s.bg, color:s.c, border:`1px solid ${s.b}`, fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20, letterSpacing:0.3, whiteSpace:"nowrap" }}>{text}</span>;
}
function Card({ children, style = {} }) {
  return <div style={{ background:"#fff", border:"1px solid #EDE8DD", borderRadius:16, padding:20, ...style }}>{children}</div>;
}

// ════════════════════════════════════════
// 1. AFFILIATE BOOKING LAYER
// ════════════════════════════════════════
const AFFILIATE_DEALS = [
  { id:1, name:"TAP Portugal — NYC → Lisbon", price:287, sites:[
    { name:"Booking.com", price:287, commission:"8%", earnings:22.96, logo:"🅱️" },
    { name:"Expedia", price:295, commission:"6%", earnings:17.70, logo:"🔵" },
    { name:"KAYAK", price:291, commission:"50% CPC", earnings:1.40, logo:"🟠" },
    { name:"Direct", price:310, commission:"0%", earnings:0, logo:"✈" },
  ]},
  { id:2, name:"Alila Seminyak — Bali", price:42, perNight:true, nights:7, sites:[
    { name:"Booking.com", price:42, commission:"12%", earnings:35.28, logo:"🅱️" },
    { name:"Hotels.com", price:45, commission:"10%", earnings:31.50, logo:"🏨" },
    { name:"Agoda", price:39, commission:"7%", earnings:19.11, logo:"🔴" },
  ]},
];

function AffiliateLayer() {
  const [selectedDeal, setSelectedDeal] = useState(0);
  const deal = AFFILIATE_DEALS[selectedDeal];
  const totalMonthly = 1247; // simulated
  const bestSite = [...deal.sites].sort((a,b) => b.earnings - a.earnings)[0];

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:700, marginBottom:4 }}>Affiliate Revenue Dashboard</h2>
        <p style={{ fontSize:14, color:"#8C7E6A" }}>Every booking through TripEdge earns commission. This runs silently behind every deal, hack, and itinerary link.</p>
      </div>

      {/* Revenue overview */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
        {[
          { label:"This Month", val:"$1,247", accent:"#1B7340" },
          { label:"Bookings", val:"43", accent:"#2A9D8F" },
          { label:"Avg Commission", val:"$29", accent:"#1A6DAD" },
          { label:"Conv. Rate", val:"12.4%", accent:"#D4600E" },
        ].map((s,i) => (
          <Card key={i} style={{ padding:"18px 20px" }}>
            <p style={{ fontSize:11, color:"#A89E8C", fontWeight:500, textTransform:"uppercase", letterSpacing:0.5, marginBottom:6 }}>{s.label}</p>
            <p style={{ fontSize:26, fontWeight:700, color:s.accent }}>{s.val}</p>
          </Card>
        ))}
      </div>

      {/* How it works */}
      <Card style={{ marginBottom:20 }}>
        <p style={{ fontSize:11, fontWeight:600, color:"#A89E8C", textTransform:"uppercase", letterSpacing:1.2, marginBottom:14 }}>How affiliate links embed</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
          {[
            { icon:"📉", title:"Deal Scanner", desc:"Every deal card's 'Book' button routes through your affiliate link to the cheapest booking site." },
            { icon:"✂️", title:"Hack Finder", desc:"'Book this hack' links use affiliate URLs. Split tickets use two separate affiliate links = double commission." },
            { icon:"🗺", title:"AI Itinerary", desc:"Restaurant, activity, and hotel mentions embed GetYourGuide, Viator, and Booking.com links." },
          ].map((f,i) => (
            <div key={i} style={{ padding:"16px", background:"#FDFBF7", borderRadius:12, border:"1px solid #F0EBE1" }}>
              <span style={{ fontSize:24, display:"block", marginBottom:8 }}>{f.icon}</span>
              <p style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>{f.title}</p>
              <p style={{ fontSize:12, color:"#8C7E6A", lineHeight:1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Deal breakdown */}
      <Card>
        <div style={{ display:"flex", gap:8, marginBottom:16 }}>
          {AFFILIATE_DEALS.map((d,i) => (
            <button key={i} onClick={() => setSelectedDeal(i)} style={{
              background:selectedDeal===i ? "#2A9D8F" : "#F7F3EC", color:selectedDeal===i ? "#fff" : "#8C7E6A",
              border:"none", borderRadius:8, padding:"8px 16px", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit",
            }}>{d.name.split("—")[0].trim()}</button>
          ))}
        </div>
        <p style={{ fontSize:15, fontWeight:600, marginBottom:14 }}>{deal.name}</p>
        {deal.sites.map((site,i) => (
          <div key={i} style={{ display:"grid", gridTemplateColumns:"140px 1fr 80px 100px", gap:14, alignItems:"center", padding:"12px 0", borderBottom:i<deal.sites.length-1 ? "1px solid #F0EBE1" : "none" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:18 }}>{site.logo}</span>
              <span style={{ fontSize:13, fontWeight:500 }}>{site.name}</span>
            </div>
            <div style={{ height:6, background:"#F0EBE1", borderRadius:3, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${(site.earnings / Math.max(...deal.sites.map(s=>s.earnings))) * 100}%`, background:site.earnings === bestSite.earnings ? "linear-gradient(90deg,#2A9D8F,#1A6DAD)" : "#D4C9B5", borderRadius:3 }} />
            </div>
            <span style={{ fontSize:12, color:"#8C7E6A", textAlign:"right" }}>{site.commission}</span>
            <span style={{ fontSize:16, fontWeight:700, color:site.earnings === bestSite.earnings ? "#1B7340" : "#2C2418", textAlign:"right" }}>${site.earnings.toFixed(2)}</span>
          </div>
        ))}
        <div style={{ marginTop:14, padding:"12px 16px", background:"#E8F5EE", border:"1px solid #C5E8D4", borderRadius:10 }}>
          <p style={{ fontSize:13, color:"#1B7340", fontWeight:500 }}>🧠 AI auto-routes users to <strong>{bestSite.name}</strong> — highest commission at ${bestSite.earnings.toFixed(2)} per booking</p>
        </div>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════
// 2. CREATOR PLATFORM
// ════════════════════════════════════════
const CREATORS = [
  { name:"@lisbon.secrets", followers:"48K", itineraries:6, earnings:842, rating:4.9, avatar:"L", verified:true },
  { name:"@tokyo.eats", followers:"125K", itineraries:12, earnings:3240, rating:4.8, avatar:"T", verified:true },
  { name:"@nomad.marcus", followers:"22K", itineraries:3, earnings:310, rating:4.7, avatar:"M", verified:false },
];
const CREATOR_ITINERARIES = [
  { title:"Hidden Lisbon in 3 Days", creator:"@lisbon.secrets", clones:847, bookings:124, revenue:1860, rating:4.9, img:"https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=400&h=200&fit=crop" },
  { title:"Tokyo Street Food Marathon", creator:"@tokyo.eats", clones:2100, bookings:312, revenue:4680, rating:4.8, img:"https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=200&fit=crop" },
];

function CreatorPlatform() {
  const [view, setView] = useState("browse"); // browse | dashboard

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:700 }}>Creator Marketplace</h2>
        </div>
        <p style={{ fontSize:14, color:"#8C7E6A" }}>Travel creators publish verified itineraries. Users clone them. Creators earn on every booking.</p>
      </div>

      <div style={{ display:"flex", gap:6, marginBottom:20 }}>
        {["browse","dashboard"].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            background:view===v ? "#2A9D8F" : "#F7F3EC", color:view===v ? "#fff" : "#8C7E6A",
            border:"none", borderRadius:8, padding:"8px 18px", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit", textTransform:"capitalize",
          }}>{v === "browse" ? "Browse Itineraries" : "Creator Dashboard"}</button>
        ))}
      </div>

      {view === "browse" && (
        <>
          {/* Featured itineraries */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24 }}>
            {CREATOR_ITINERARIES.map((it,i) => (
              <Card key={i} style={{ padding:0, overflow:"hidden", cursor:"pointer", transition:"transform 0.25s, box-shadow 0.25s" }}>
                <div style={{ position:"relative", height:160 }}>
                  <img src={it.img} alt={it.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"20px 16px 12px", background:"linear-gradient(transparent,rgba(0,0,0,0.7))" }}>
                    <p style={{ fontSize:16, fontWeight:700, color:"#fff" }}>{it.title}</p>
                    <p style={{ fontSize:12, color:"rgba(255,255,255,0.75)" }}>by {it.creator}</p>
                  </div>
                </div>
                <div style={{ padding:"14px 18px" }}>
                  <div style={{ display:"flex", gap:12, marginBottom:12 }}>
                    <span style={{ fontSize:12, color:"#2A9D8F", fontWeight:500 }}>⭐ {it.rating}</span>
                    <span style={{ fontSize:12, color:"#8C7E6A" }}>{it.clones.toLocaleString()} clones</span>
                    <span style={{ fontSize:12, color:"#8C7E6A" }}>{it.bookings} bookings</span>
                  </div>
                  <button style={{ width:"100%", padding:"10px 0", borderRadius:10, background:"linear-gradient(135deg,#2A9D8F,#1A6DAD)", color:"#fff", border:"none", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Clone this itinerary</button>
                </div>
              </Card>
            ))}
          </div>

          {/* Top creators */}
          <Card>
            <p style={{ fontSize:11, fontWeight:600, color:"#A89E8C", textTransform:"uppercase", letterSpacing:1.2, marginBottom:14 }}>Top Creators</p>
            {CREATORS.map((c,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderBottom:i<CREATORS.length-1 ? "1px solid #F0EBE1" : "none" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,#2A9D8F,#1A6DAD)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:700, color:"#fff" }}>{c.avatar}</div>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ fontSize:14, fontWeight:600 }}>{c.name}</span>
                      {c.verified && <span style={{ fontSize:10, color:"#2A9D8F" }}>✓</span>}
                    </div>
                    <span style={{ fontSize:12, color:"#A89E8C" }}>{c.followers} followers · {c.itineraries} itineraries</span>
                  </div>
                </div>
                <span style={{ fontSize:14, fontWeight:600, color:"#1B7340" }}>${c.earnings.toLocaleString()} earned</span>
              </div>
            ))}
          </Card>
        </>
      )}

      {view === "dashboard" && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
            {[{ l:"Total Earnings", v:"$842", a:"#1B7340" }, { l:"Itinerary Clones", v:"847", a:"#2A9D8F" }, { l:"Bookings via You", v:"124", a:"#1A6DAD" }].map((s,i) => (
              <Card key={i} style={{ textAlign:"center", padding:"20px 16px" }}>
                <p style={{ fontSize:11, color:"#A89E8C", fontWeight:500, textTransform:"uppercase", letterSpacing:0.5, marginBottom:6 }}>{s.l}</p>
                <p style={{ fontSize:30, fontWeight:700, color:s.a }}>{s.v}</p>
              </Card>
            ))}
          </div>
          <Card>
            <p style={{ fontSize:11, fontWeight:600, color:"#A89E8C", textTransform:"uppercase", letterSpacing:1.2, marginBottom:14 }}>Revenue breakdown</p>
            <p style={{ fontSize:13, color:"#5C5142", lineHeight:1.7, marginBottom:16 }}>You earn a share of affiliate revenue when users book through your itineraries. Current split: <strong>70% creator / 30% TripEdge</strong>. Paid out monthly via Stripe Connect.</p>
            <button style={{ background:"linear-gradient(135deg,#2A9D8F,#1A6DAD)", color:"#fff", border:"none", borderRadius:12, padding:"12px 28px", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>+ Publish New Itinerary</button>
          </Card>
        </>
      )}
    </div>
  );
}

// ════════════════════════════════════════
// 3. PRICE HISTORY DATABASE
// ════════════════════════════════════════
function PriceHistory() {
  const [route] = useState({ from:"NYC", to:"Lisbon" });
  const months = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
  const prices = [380,420,510,580,545,390,340,295,310,355,320,287];
  const maxP = Math.max(...prices);
  const minP = Math.min(...prices);
  const avgP = Math.round(prices.reduce((a,b) => a+b,0) / prices.length);

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:700, marginBottom:4 }}>Price History</h2>
        <p style={{ fontSize:14, color:"#8C7E6A" }}>12-month price data for any route. Free to browse — forecasts and alerts require Pro.</p>
      </div>

      <Card style={{ marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
          <div>
            <h3 style={{ fontSize:20, fontWeight:700 }}>{route.from} → {route.to}</h3>
            <p style={{ fontSize:13, color:"#8C7E6A" }}>Round trip · Economy · 12-month view</p>
          </div>
          <div style={{ display:"flex", gap:16, textAlign:"center" }}>
            <div><p style={{ fontSize:20, fontWeight:700, color:"#1B7340" }}>${minP}</p><p style={{ fontSize:10, color:"#A89E8C" }}>12mo Low</p></div>
            <div><p style={{ fontSize:20, fontWeight:700, color:"#2C2418" }}>${avgP}</p><p style={{ fontSize:10, color:"#A89E8C" }}>Average</p></div>
            <div><p style={{ fontSize:20, fontWeight:700, color:"#D4600E" }}>${maxP}</p><p style={{ fontSize:10, color:"#A89E8C" }}>12mo High</p></div>
          </div>
        </div>

        {/* Chart */}
        <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:140, marginBottom:8 }}>
          {prices.map((p,i) => {
            const h = ((p - minP + 20) / (maxP - minP + 20)) * 120;
            const isNow = i === prices.length - 1;
            const isCheap = p <= avgP * 0.85;
            return (
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                <span style={{ fontSize:10, color:isNow ? "#1B7340" : isCheap ? "#2A9D8F" : "#A89E8C", fontWeight:isNow||isCheap ? 700 : 400 }}>${p}</span>
                <div style={{
                  width:"100%", height:h, borderRadius:6,
                  background:isNow ? "linear-gradient(180deg,#2A9D8F,#1A6DAD)" : isCheap ? "#E8F5EE" : "#F0EBE1",
                  border:isCheap && !isNow ? "1px solid #C5E8D4" : "none",
                }} />
                <span style={{ fontSize:10, color:"#D4C9B5" }}>{months[i]}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginTop:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:4 }}><div style={{ width:10, height:10, borderRadius:3, background:"#E8F5EE", border:"1px solid #C5E8D4" }}/><span style={{ fontSize:11, color:"#8C7E6A" }}>Below average</span></div>
          <div style={{ display:"flex", alignItems:"center", gap:4 }}><div style={{ width:10, height:10, borderRadius:3, background:"linear-gradient(135deg,#2A9D8F,#1A6DAD)" }}/><span style={{ fontSize:11, color:"#8C7E6A" }}>Current</span></div>
        </div>
      </Card>

      <div style={{ background:"linear-gradient(135deg,#E8F5EE,#E6F2FA)", border:"1px solid #C5E8D4", borderRadius:16, padding:20, textAlign:"center" }}>
        <p style={{ fontSize:15, fontWeight:600, color:"#1B7340", marginBottom:4 }}>Current price is 26% below the 12-month average</p>
        <p style={{ fontSize:13, color:"#2A9D8F", marginBottom:14 }}>Want to know if it'll drop more?</p>
        <button style={{ background:"linear-gradient(135deg,#2A9D8F,#1A6DAD)", color:"#fff", border:"none", borderRadius:10, padding:"10px 28px", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>🔮 Unlock AI Forecast — Pro</button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// 4. ERROR FARE ALERTS
// ════════════════════════════════════════
const ERROR_FARES = [
  { id:1, route:"NYC → Tokyo", price:89, normal:890, savings:90, airline:"ANA", dates:"May 12–26", found:"14 min ago", status:"live", type:"Round trip", note:"Pricing glitch on ANA JP site. Book in incognito. May be honored — ANA has a good track record." },
  { id:2, route:"LAX → Barcelona", price:142, normal:620, savings:77, airline:"Norse Atlantic", dates:"Jun 3–17", found:"2 hrs ago", status:"live", type:"Round trip", note:"Currency conversion error on NOK pricing. Use Norwegian VPN for best results." },
  { id:3, route:"Chicago → Bali", price:218, normal:1100, savings:80, airline:"Qatar Airways", dates:"Sep 1–15", found:"6 hrs ago", status:"expired", type:"Round trip", note:"Was live for ~3 hours. Fixed by Qatar revenue team." },
];

function ErrorFareAlerts() {
  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:700 }}>Error Fare Alerts</h2>
          <Badge text="Premium Exclusive" type="premium" />
        </div>
        <p style={{ fontSize:14, color:"#8C7E6A" }}>Airline pricing mistakes caught by AI. 60-90% off. Book fast — they get fixed quickly.</p>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {ERROR_FARES.map(ef => {
          const isLive = ef.status === "live";
          return (
            <Card key={ef.id} style={{ border:isLive ? "2px solid #DC2626" : "1px solid #EDE8DD", opacity:isLive ? 1 : 0.6, position:"relative", overflow:"hidden" }}>
              {isLive && <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"linear-gradient(90deg,#DC2626,#F59E0B)" }} />}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    <h3 style={{ fontSize:18, fontWeight:700 }}>{ef.route}</h3>
                    <Badge text={isLive ? "🔴 LIVE" : "Expired"} type={isLive ? "error" : "watch"} />
                  </div>
                  <p style={{ fontSize:13, color:"#8C7E6A" }}>{ef.airline} · {ef.type} · {ef.dates}</p>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                    <span style={{ fontSize:14, color:"#A89E8C", textDecoration:"line-through" }}>${ef.normal}</span>
                    <span style={{ fontSize:32, fontWeight:800, color:isLive ? "#DC2626" : "#8C7E6A" }}>${ef.price}</span>
                  </div>
                  <span style={{ fontSize:13, fontWeight:700, color:isLive ? "#DC2626" : "#8C7E6A" }}>{ef.savings}% off</span>
                </div>
              </div>
              <div style={{ padding:"12px 16px", background:isLive ? "#FEF2F2" : "#F7F3EC", border:`1px solid ${isLive ? "#FECACA" : "#EDE8DD"}`, borderRadius:10, marginBottom:14 }}>
                <p style={{ fontSize:13, color:isLive ? "#991B1B" : "#8C7E6A", lineHeight:1.6 }}>💡 {ef.note}</p>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:12, color:"#A89E8C" }}>Found {ef.found}</span>
                {isLive && <button style={{ background:"#DC2626", color:"#fff", border:"none", borderRadius:10, padding:"10px 24px", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Book NOW before it's gone →</button>}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// 5. TRIPEDGE SCORE + PASSPORT
// ════════════════════════════════════════
const STAMPS = [
  { name:"First Trip", icon:"🎫", earned:true, rarity:"common" },
  { name:"Deal Hunter", icon:"📉", earned:true, rarity:"common", desc:"Saved $100+" },
  { name:"Squad Leader", icon:"👥", earned:true, rarity:"uncommon", desc:"Led a group trip" },
  { name:"Globe Trotter", icon:"🌍", earned:true, rarity:"uncommon", desc:"5+ countries" },
  { name:"Error Fare Legend", icon:"⚡", earned:false, rarity:"rare", desc:"Booked an error fare" },
  { name:"Content Creator", icon:"🎬", earned:false, rarity:"rare", desc:"Published a Trip Replay with 100+ views" },
  { name:"Platinum Saver", icon:"💎", earned:false, rarity:"legendary", desc:"Saved $2,000+ lifetime" },
  { name:"OG Explorer", icon:"👑", earned:false, rarity:"legendary", desc:"Top 1% TripEdge Score" },
];
const rarityColors = { common:{ bg:"#F0EBE1",c:"#8C7E6A",b:"#D4C9B5" }, uncommon:{ bg:"#E8F5EE",c:"#1B7340",b:"#C5E8D4" }, rare:{ bg:"#E6F2FA",c:"#1A6DAD",b:"#C0DDF2" }, legendary:{ bg:"#FFF8E6",c:"#92400E",b:"#FDE68A" } };

function TripEdgePassport() {
  const score = 742;
  const level = "Gold Explorer";
  const nextLevel = 1000;

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:700, marginBottom:4 }}>Your TripEdge Passport</h2>
        <p style={{ fontSize:14, color:"#8C7E6A" }}>Your travel identity. Earn stamps, build your score, unlock perks.</p>
      </div>

      {/* Score card */}
      <Card style={{ marginBottom:20, background:"linear-gradient(135deg, #2A9D8F, #1A6DAD)", border:"none", color:"#fff", padding:28 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <p style={{ fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:1.5, opacity:0.75, marginBottom:6 }}>TripEdge Score</p>
            <p style={{ fontSize:52, fontWeight:800, fontFamily:"'Playfair Display',serif", lineHeight:1 }}>{score}</p>
            <p style={{ fontSize:15, fontWeight:500, marginTop:8, opacity:0.9 }}>{level}</p>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ width:100, height:100, borderRadius:"50%", border:"4px solid rgba(255,255,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
              <svg width="100" height="100" style={{ position:"absolute", transform:"rotate(-90deg)" }}>
                <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
                <circle cx="50" cy="50" r="46" fill="none" stroke="#fff" strokeWidth="4" strokeDasharray={`${(score/nextLevel)*289} 289`} strokeLinecap="round" />
              </svg>
              <span style={{ fontSize:14, fontWeight:700 }}>{Math.round((score/nextLevel)*100)}%</span>
            </div>
            <p style={{ fontSize:11, opacity:0.7, marginTop:6 }}>{nextLevel - score} pts to Platinum</p>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginTop:24 }}>
          {[{ l:"Trips", v:"7" }, { l:"Countries", v:"5" }, { l:"Saved", v:"$1,842" }, { l:"Stamps", v:`${STAMPS.filter(s=>s.earned).length}/${STAMPS.length}` }].map((s,i) => (
            <div key={i} style={{ textAlign:"center", padding:"10px 0", background:"rgba(255,255,255,0.12)", borderRadius:10 }}>
              <p style={{ fontSize:18, fontWeight:700 }}>{s.v}</p>
              <p style={{ fontSize:10, opacity:0.7 }}>{s.l}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Stamps */}
      <Card>
        <p style={{ fontSize:11, fontWeight:600, color:"#A89E8C", textTransform:"uppercase", letterSpacing:1.2, marginBottom:14 }}>Passport Stamps</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
          {STAMPS.map((stamp,i) => {
            const rc = rarityColors[stamp.rarity];
            return (
              <div key={i} style={{
                textAlign:"center", padding:"16px 10px", borderRadius:14,
                background:stamp.earned ? rc.bg : "#F7F3EC",
                border:`1.5px solid ${stamp.earned ? rc.b : "#EDE8DD"}`,
                opacity:stamp.earned ? 1 : 0.45,
                transition:"transform 0.2s",
                cursor:"pointer",
              }}>
                <span style={{ fontSize:28, display:"block", marginBottom:6, filter:stamp.earned ? "none" : "grayscale(1)" }}>{stamp.icon}</span>
                <p style={{ fontSize:12, fontWeight:600, color:stamp.earned ? rc.c : "#A89E8C" }}>{stamp.name}</p>
                {stamp.desc && <p style={{ fontSize:10, color:stamp.earned ? rc.c : "#D4C9B5", marginTop:2 }}>{stamp.desc}</p>}
                <p style={{ fontSize:9, fontWeight:700, color:rc.c, textTransform:"uppercase", letterSpacing:0.8, marginTop:6, opacity:stamp.earned ? 0.7 : 0.4 }}>{stamp.rarity}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════
// ROOT
// ════════════════════════════════════════
const FEATURES = [
  { id:"affiliate", label:"Affiliates", icon:"💰" },
  { id:"creators", label:"Creators", icon:"🎬" },
  { id:"history", label:"Price History", icon:"📊" },
  { id:"errors", label:"Error Fares", icon:"⚡" },
  { id:"passport", label:"Passport", icon:"🛂" },
];

export default function MillionDollarPart1({ embedded = false }) {
  const [active, setActive] = useState("affiliate");
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 80); }, []);

  return (
    <div style={{ minHeight:embedded ? "auto" : "100vh", background:"#FDFBF7", color:"#2C2418", fontFamily:"'Outfit',sans-serif" }}>
      {!embedded && (
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,700;0,800;1,500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-thumb { background:#D4C9B5; border-radius:10px; }
      `}</style>
      )}

      {!embedded && (
        <nav style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 32px", borderBottom:"1px solid #EDE8DD", background:"rgba(253,251,247,0.92)", backdropFilter:"blur(12px)", position:"sticky", top:0, zIndex:100, opacity:loaded?1:0, transition:"opacity 0.5s" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:10, background:"linear-gradient(135deg,#2A9D8F,#1A6DAD)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, color:"#fff" }}>✈</div>
            <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:18 }}>Trip<span style={{ color:"#2A9D8F" }}>Edge</span></span>
            <Badge text="Revenue Features" type="gold" />
          </div>
          <div style={{ display:"flex", gap:4, background:"#F0EBE1", borderRadius:12, padding:4 }}>
            {FEATURES.map(f => (
              <button key={f.id} onClick={() => setActive(f.id)} style={{
                background:active===f.id ? "#fff" : "transparent", color:active===f.id ? "#2C2418" : "#8C7E6A",
                border:"none", padding:"8px 14px", borderRadius:10, fontSize:12.5, fontWeight:active===f.id?600:400,
                fontFamily:"inherit", cursor:"pointer", boxShadow:active===f.id ? "0 1px 4px rgba(44,36,24,0.08)" : "none",
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
                background:active===f.id ? "#fff" : "transparent", color:active===f.id ? "#2C2418" : "#8C7E6A",
                border:"none", padding:"8px 14px", borderRadius:10, fontSize:12.5, fontWeight:active===f.id?600:400,
                fontFamily:"inherit", cursor:"pointer", boxShadow:active===f.id ? "0 1px 4px rgba(44,36,24,0.08)" : "none",
                transition:"all 0.2s", display:"flex", alignItems:"center", gap:5,
              }}><span>{f.icon}</span>{f.label}</button>
            ))}
          </div>
        )}
        {active === "affiliate" && <AffiliateLayer />}
        {active === "creators" && <CreatorPlatform />}
        {active === "history" && <PriceHistory />}
        {active === "errors" && <ErrorFareAlerts />}
        {active === "passport" && <TripEdgePassport />}
      </div>
    </div>
  );
}
