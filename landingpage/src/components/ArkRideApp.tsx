"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

/* ─── Icon system ─── */
type IconName = "search"|"bell"|"calendar"|"clock"|"chevron"|"car"|"pin"|"star"|"filter"|"wallet"|"plus"|"arrow"|"close"|"check"|"lock"|"grid"|"home"|"receipt"|"help"|"settings"|"building"|"chart"|"edit"|"copy"|"scan"|"sparkle"|"shield"|"menu"|"up"|"down"|"layers";
function Icon({name,size=20,stroke=1.8}:{name:IconName;size?:number;stroke?:number}){
  const s={width:size,height:size,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:stroke,strokeLinecap:"round" as const,strokeLinejoin:"round" as const,"aria-hidden":true};
  const p:Record<IconName,React.ReactNode>={
    search:<><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></>,
    bell:<><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    calendar:<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    clock:<><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/></>,
    chevron:<path d="m9 18 6-6-6-6"/>,
    car:<><path d="M5 16 6.7 9h10.6l1.7 7"/><path d="M3.5 16.5h17v3a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-3Z"/><circle cx="7" cy="17.5" r="1" fill="currentColor"/><circle cx="17" cy="17.5" r="1" fill="currentColor"/></>,
    pin:<><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.4"/></>,
    star:<path d="m12 3 2.75 5.57 6.15.9-4.45 4.33 1.05 6.12L12 17.03l-5.5 2.89 1.05-6.12L3.1 9.47l6.15-.9L12 3Z"/>,
    filter:<><path d="M4 6h16M7 12h10M10 18h4"/><circle cx="8" cy="6" r="1.5" fill="white"/><circle cx="15" cy="12" r="1.5" fill="white"/><circle cx="12" cy="18" r="1.5" fill="white"/></>,
    wallet:<><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H19v14H6.5A2.5 2.5 0 0 1 4 16.5v-9Z"/><path d="M4 8h15"/><path d="M16 13h3"/></>,
    plus:<path d="M12 5v14M5 12h14"/>,
    arrow:<><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    close:<path d="m6 6 12 12M18 6 6 18"/>,
    check:<path d="m5 12 4.2 4.2L19 6.5"/>,
    lock:<><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 14v2"/></>,
    grid:<><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></>,
    home:<><path d="m4 11 8-7 8 7v9H4v-9Z"/><path d="M9 20v-5h6v5"/></>,
    receipt:<><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6"/></>,
    help:<><circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 1 1 4.35 1.42c-1.1 1.36-2.15 1.62-2.15 3.08"/><path d="M12 17h.01"/></>,
    settings:<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.2 2.2-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.04 1.56v.09h-3.12v-.09a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-2.2-2.2.06-.06A1.7 1.7 0 0 0 6.72 15a1.7 1.7 0 0 0-1.56-1.04h-.09v-3.12h.09A1.7 1.7 0 0 0 6.72 9.8a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.2-2.2.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.04-1.56v-.09h3.12v.09a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.2 2.2-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.04h.09v3.12h-.09A1.7 1.7 0 0 0 19.4 15Z"/></>,
    building:<><path d="M4 21V5l8-3v19M12 8h8v13"/><path d="M7 8h2M7 12h2M7 16h2M15 12h2M15 16h2"/></>,
    chart:<><path d="M4 20V4M4 20h17"/><path d="m7 16 4-5 3 2 5-7"/></>,
    edit:<><path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/></>,
    copy:<><rect x="9" y="9" width="10" height="10" rx="1"/><path d="M15 9V5H5v10h4"/></>,
    scan:<><path d="M5 9V5h4M15 5h4v4M19 15v4h-4M9 19H5v-4"/><path d="M8 12h8"/></>,
    sparkle:<path d="m12 3 1.45 5.55L19 10l-5.55 1.45L12 17l-1.45-5.55L5 10l5.55-1.45L12 3ZM19 16l.65 2.35L22 19l-2.35.65L19 22l-.65-2.35L16 19l2.35-.65L19 16Z"/>,
    shield:<><path d="M12 3 19 6v5c0 4.7-3 7.6-7 10-4-2.4-7-5.3-7-10V6l7-3Z"/><path d="m9 12 2 2 4-4"/></>,
    menu:<><path d="M4 7h16M4 12h16M4 17h16"/></>,
    up:<path d="m18 15-6-6-6 6"/>,
    down:<path d="m6 9 6 6 6-6"/>,
    layers:<><path d="m12 3-9 5 9 5 9-5-9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/></>,
  };
  return <svg {...s}>{p[name]}</svg>;
}

/* ─── Data ─── */
const places=[
  {id:1,name:"Unity Park Garage",address:"Arat Kilo, Addis Ababa",walk:"3 min",price:35,rating:"4.9",spaces:"12 spots",tone:"sage",label:"Best value",lat:22,lng:27},
  {id:2,name:"Bole Medhanialem",address:"Bole Road, Addis Ababa",walk:"6 min",price:45,rating:"4.8",spaces:"6 spots",tone:"sand",label:"Covered",lat:66,lng:23},
  {id:3,name:"Meskel Square Lot",address:"Meskel Square, Addis",walk:"8 min",price:30,rating:"4.7",spaces:"18 spots",tone:"rose",label:"Open air",lat:52,lng:66},
];
type Place = typeof places[number];

function Avatar({size="md"}:{size?:"sm"|"md"|"lg"}){return<div className={`av av-${size}`} aria-label="Miki">MT</div>}
function FlagRibbon(){return<div className="fr" aria-hidden="true"><i/><i/><i/></div>}
function StatusDot({text,color="green"}:{text:string;color?:"green"|"yellow"}){return<span className={`sd sd-${color}`}><i/>{text}</span>}

/* ─── Full-screen map ─── */
function MapHero({active,onPinClick}:{active:number;onPinClick:(i:number)=>void}){
  const pins=[
    {left:"22%",top:"28%"},{left:"66%",top:"24%"},{left:"52%",top:"64%"},
    {left:"77%",top:"54%"},{left:"30%",top:"72%"},{left:"43%",top:"38%"},
    {left:"84%",top:"38%"},{left:"14%",top:"52%"},
  ];
  return(
    <div className="map-hero" aria-label="Parking map of Addis Ababa">
      <div className="map-road ra"/><div className="map-road rb"/><div className="map-road rc"/><div className="map-road rd"/><div className="map-road re"/>
      <span className="map-lbl l1">National Palace</span><span className="map-lbl l2">Unity Park</span><span className="map-lbl l3">Bole Rd</span><span className="map-lbl l4">Meskel Sq</span><span className="map-lbl l5">Churchill Ave</span>
      {pins.map((pt,i)=>(
        <button key={i} className={`mpin ${active===i%3?"active":""} tone-${places[i%3].tone}`} style={pt} onClick={()=>onPinClick(i%3)} aria-label={places[i%3].name}>
          <span>{places[i%3].price}</span>
        </button>
      ))}
      <div className="pulse-me"><i/><span>You</span></div>
      <div className="map-zoom"><button>+</button><button>−</button></div>
      <span className="map-attr">© OpenStreetMap · ArkRide</span>
    </div>
  );
}

/* ─── Horizontal carousel ─── */
function SpotCarousel({activeIdx,onSelect,onBook}:{activeIdx:number;onSelect:(i:number)=>void;onBook:(p:Place)=>void}){
  return(
    <div className="carousel-wrap">
      <div className="carousel">
        {places.map((pl,i)=>(
          <article key={pl.id} className={`spot-card ${i===activeIdx?"picked":""}`} onClick={()=>onSelect(i)}>
            <div className={`spot-thumb ${pl.tone}`}>
              <span className="spot-badge">{pl.label}</span>
              <div className="spot-car"><Icon name="car" size={26}/></div>
            </div>
            <div className="spot-body">
              <div className="spot-top">
                <h3>{pl.name}</h3>
                <span className="spot-rating"><Icon name="star" size={12} stroke={2.6}/> {pl.rating}</span>
              </div>
              <p className="spot-addr">{pl.address}</p>
              <div className="spot-chips">
                <span><Icon name="pin" size={13}/>{pl.walk}</span>
                <span><Icon name="layers" size={13}/>{pl.spaces}</span>
              </div>
              <div className="spot-bottom">
                <b>{pl.price} <small>ETB</small><span>/hr</span></b>
                <button onClick={(e)=>{e.stopPropagation();onBook(pl);}}>Reserve <Icon name="arrow" size={14}/></button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ─── Active pass bottom sheet ─── */
function ActivePassSheet({onExpand}:{onExpand:()=>void}){
  const [open,setOpen]=useState(false);
  const [elapsed,setElapsed]=useState(78*60+32);
  const [gate,setGate]=useState(false);
  useEffect(()=>{const t=setInterval(()=>setElapsed(v=>v+1),1000);return()=>clearInterval(t);},[]);
  const time=`${String(Math.floor(elapsed/3600)).padStart(2,"0")}:${String(Math.floor((elapsed%3600)/60)).padStart(2,"0")}:${String(elapsed%60).padStart(2,"0")}`;
  return(
    <div className={`sheet ${open?"expanded":""}`}>
      <button className="sheet-handle" onClick={()=>setOpen(!open)} aria-label={open?"Collapse pass":"Expand pass"}>
        <i/><span className="sheet-pulse"/><b>Active parking pass</b><Icon name={open?"down":"up"} size={18}/>
      </button>
      {open&&(
        <div className="sheet-body">
          <FlagRibbon/>
          <div className="sheet-title">
            <div><h2>Unity Park Garage</h2><p>Level B · Space 27</p></div>
            <div className="sheet-p">P</div>
          </div>
          <div className="sheet-timer"><span>{time}</span><small>elapsed</small></div>
          <div className="sheet-divider"/>
          <button className={`sheet-gate ${gate?"open":""}`} onClick={()=>setGate(!gate)}>
            <span className="gate-icon"><Icon name={gate?"check":"lock"} size={15}/></span>
            <span>{gate?"Gate code: 4 8 2 6":"Tap to reveal gate code"}</span>
            <Icon name={gate?"copy":"chevron"} size={15}/>
          </button>
          <button className="sheet-expand" onClick={onExpand}>View full pass <Icon name="arrow" size={15}/></button>
        </div>
      )}
    </div>
  );
}

/* ─── Booking Modal ─── */
function BookingModal({place,onClose,onBooked}:{place:Place;onClose:()=>void;onBooked:()=>void}){
  const [dur,setDur]=useState(2);
  const [pay,setPay]=useState("wallet");
  const [coupon,setCoupon]=useState("");
  const [applied,setApplied]=useState(false);
  const [done,setDone]=useState(false);
  const [scanned,setScanned]=useState(false);
  const [bid,setBid]=useState<string|null>(null);
  const [busy,setBusy]=useState(false);
  const [err,setErr]=useState("");
  const total=dur*place.price-(applied?20:0);

  const book=useCallback(async()=>{
    setBusy(true);setErr("");
    try{
      const r=await fetch("/api/bookings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({parkingSpaceId:place.id,durationHours:dur,paymentMethod:pay,couponCode:applied?coupon:undefined})});
      const d=(await r.json()) as {booking?:{id:string};error?:string};
      if(!r.ok||!d.booking)throw new Error(d.error??"Booking failed.");
      setBid(d.booking.id);setDone(true);
    }catch(c){setErr(c instanceof Error?c.message:"Booking failed.");}finally{setBusy(false);}
  },[place.id,dur,pay,applied,coupon]);

  const ci=useCallback(async()=>{
    if(!bid){setScanned(true);return;}
    const r=await fetch(`/api/bookings/${bid}/check-in`,{method:"POST"});
    if(r.ok)setScanned(true);
  },[bid]);

  return(
    <div className="overlay" role="dialog" aria-modal="true">
      <div className={`bmodal ${done?"bm-done":""}`}>
        <button className="bm-close" onClick={onClose}><Icon name="close" size={20}/></button>
        {!done?<>
          <header className="bm-head"><span className="bm-icon"><Icon name="car" size={22}/></span><div><p className="ey">RESERVE A SPACE</p><h2>Book your parking</h2></div></header>
          <div className="bm-place">
            <div className="bm-map-mini"><Icon name="pin" size={18}/></div>
            <div className="bm-place-info"><h3>{place.name}</h3><p>{place.address} · Level B</p><StatusDot text={`${place.spaces} available`}/></div>
            <b className="bm-price">{place.price}<small> ETB/hr</small></b>
          </div>
          <section className="bm-sec">
            <div className="bm-sec-head"><span><Icon name="clock" size={17}/> Duration</span><b>{dur}h</b></div>
            <input className="bm-range" type="range" min={1} max={8} value={dur} onChange={e=>setDur(+e.target.value)} style={{"--rp":`${((dur-1)/7)*100}%`} as React.CSSProperties}/>
            <div className="bm-range-labels"><span>1h</span><span>4h</span><span>8h</span></div>
            <div className="bm-presets">{[1,2,3,4].map(h=><button key={h} className={dur===h?"on":""} onClick={()=>setDur(h)}>{h}h</button>)}</div>
          </section>
          <section className="bm-sec">
            <div className="bm-sec-head"><span><Icon name="wallet" size={17}/> Payment</span><button className="bm-tiny">+ Add</button></div>
            <div className="bm-pays">
              <button className={pay==="wallet"?"sel":""} onClick={()=>setPay("wallet")}><span className="pay-ic w-ic"><Icon name="wallet" size={16}/></span><span>ArkWallet<small>250 ETB</small></span><i className="rad"/></button>
              <button className={pay==="telebirr"?"sel":""} onClick={()=>setPay("telebirr")}><span className="pay-ic t-ic">t</span><span>telebirr<small>Instant</small></span><i className="rad"/></button>
            </div>
          </section>
          <div className="bm-coupon"><Icon name="sparkle" size={16}/><input value={coupon} onChange={e=>{setCoupon(e.target.value);setApplied(false);}} placeholder="Promo code"/><button onClick={()=>setApplied(coupon.trim().toUpperCase()==="ARKRIDE20")}>{applied?"Applied":"Apply"}</button></div>
          {applied&&<p className="bm-saved"><Icon name="check" size={14}/> ARKRIDE20 saved 20 ETB</p>}
          <div className="bm-total"><span>Total<small>Includes reservation</small></span><b>{total}<small> ETB</small></b></div>
          {err&&<p className="bm-err" role="alert">{err}</p>}
          <button className="bm-cta" disabled={busy} onClick={()=>void book()}>{busy?"Processing…":`Pay ${total} ETB`} <Icon name="arrow" size={17}/></button>
          <p className="bm-secure"><Icon name="shield" size={14}/> Secured by ArkRide</p>
        </>:<>
          <div className="bm-celebrate"><span><Icon name="sparkle" size={18}/></span><div><p>ALL SET!</p><h2>Parking confirmed</h2></div></div>
          <div className="bm-ticket"><FlagRibbon/><span className="tn tl"/><span className="tn tr"/>
            <div className="tk-top"><span>ARKRIDE PASS</span><StatusDot text="Valid today"/></div>
            <h3>{place.name}</h3><p>{place.address}</p>
            <div className="tk-dates">
              <div><small>ARRIVE</small><b>10:30 AM</b><span>Today</span></div>
              <div><small>DURATION</small><b>{dur}h</b><span>Until {10+dur}:30</span></div>
              <div><small>SPACE</small><b>B·27</b><span>Level B</span></div>
            </div>
            <div className="tk-line"/>
            <div className="tk-qr">
              <button className={`qr ${scanned?"qr-ok":""}`} onClick={()=>void ci()}>{scanned?"✓":"QR"}</button>
              <div><p>{scanned?"Checked in":"CHECK IN"}</p><b>{scanned?"Welcome!":"Scan QR"}</b><button className="qr-btn" onClick={()=>void ci()}><Icon name="scan" size={15}/>{scanned?"Done":"Scan"}</button></div>
            </div>
          </div>
          <button className="bm-cta" onClick={()=>{onBooked();onClose();}}>View my pass <Icon name="arrow" size={17}/></button>
          <button className="bm-link" onClick={onClose}>Email ticket</button>
        </>}
      </div>
    </div>
  );
}

/* ─── Profile Drawer ─── */
function ProfileDrawer({onClose,onOwner}:{onClose:()=>void;onOwner:()=>void}){
  const [tab,setTab]=useState<"wallet"|"passes"|"hosting">("wallet");
  const [depOpen,setDepOpen]=useState(false);
  const [bal,setBal]=useState(250);
  const [adding,setAdding]=useState(false);

  useEffect(()=>{void fetch("/api/wallet").then(r=>r.ok?r.json() as Promise<{balanceEtb:number}>:null).then(d=>{if(d)setBal(d.balanceEtb);}).catch(()=>undefined);},[]);

  async function addFunds(a:number){setAdding(true);try{const r=await fetch("/api/wallet",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({amountEtb:a,provider:"telebirr"})});const d=(await r.json()) as {balanceEtb?:number};if(r.ok&&typeof d.balanceEtb==="number"){setBal(d.balanceEtb);setDepOpen(false);}}finally{setAdding(false);}}

  return(
    <div className="overlay drawer-over" role="dialog" aria-modal="true">
      <aside className="pdrawer">
        <div className="pd-head"><div><p className="ey">YOUR ARKRIDE</p><h2>Account</h2></div><button className="ic-btn" onClick={onClose}><Icon name="close" size={20}/></button></div>
        <div className="pd-id"><Avatar size="lg"/><div><h3>Miki Tadesse</h3><p>miki.t@arkride.et</p></div><span className="pd-v"><Icon name="check" size={12}/></span></div>
        <div className="pd-tabs">
          <button className={tab==="wallet"?"on":""} onClick={()=>setTab("wallet")}>Wallet</button>
          <button className={tab==="passes"?"on":""} onClick={()=>setTab("passes")}>Passes</button>
          <button className={tab==="hosting"?"on":""} onClick={()=>setTab("hosting")}>Hosting</button>
        </div>
        <div className="pd-body">
          {tab==="wallet"&&<>
            <section className="wal-card"><FlagRibbon/><span>ARKWALLET</span><h3>{bal.toLocaleString()}<small> ETB</small></h3><p><i/>Ready to park</p><button onClick={()=>setDepOpen(!depOpen)}><Icon name="plus" size={16}/> Add money</button></section>
            {depOpen&&<div className="dep-sheet"><p>Quick add</p><div>{[50,100,250].map(a=><button key={a} disabled={adding} onClick={()=>void addFunds(a)}>{adding?"…":`+${a}`}</button>)}</div></div>}
            <section className="pd-sec"><div className="pd-sec-h"><h3>Activity</h3><button>All</button></div>
              <div className="act-row"><span className="act-ic g"><Icon name="car" size={16}/></span><div><b>Unity Park Garage</b><small>Today · 10:30 AM</small></div><strong>−70 ETB</strong></div>
              <div className="act-row"><span className="act-ic y"><Icon name="plus" size={16}/></span><div><b>Wallet top up</b><small>25 Jun · telebirr</small></div><strong className="pos">+300 ETB</strong></div>
            </section>
          </>}
          {tab==="passes"&&<>
            <section className="mini-pass"><FlagRibbon/><StatusDot text="ACTIVE"/><h3>Unity Park Garage</h3><p>Space B·27 · Ends 12:30</p><div className="mp-gate"><span>GATE</span><b>4 8 2 6</b><button><Icon name="copy" size={14}/></button></div></section>
            <section className="pd-sec"><div className="pd-sec-h"><h3>Upcoming</h3><button>All</button></div><div className="up-pass"><span className="cal-chip"><b>29</b><small>JUN</small></span><div><b>Edna Mall</b><small>Sat · 2 PM</small></div><span>45 ETB</span></div></section>
            <section className="pd-sec"><div className="pd-sec-h"><h3>Past</h3></div><div className="h-pass"><span>24 JUN</span><div><b>Meskel Lot</b><small>1h30 · 45</small></div><Icon name="chevron" size={15}/></div><div className="h-pass"><span>20 JUN</span><div><b>Bole Med.</b><small>2h · 90</small></div><Icon name="chevron" size={15}/></div></section>
          </>}
          {tab==="hosting"&&<>
            <section className="host-hero"><span>HOSTING</span><h3>Earn from your space.</h3><p>86% visibility this week</p><button onClick={onOwner}>Host dashboard <Icon name="arrow" size={15}/></button></section>
            <div className="host-stats"><div><span>Earnings</span><b>4,680<small> ETB</small></b><em>+18.5%</em></div><div><span>Bookings</span><b>42</b><em>+12%</em></div></div>
            <section className="pd-sec"><div className="pd-sec-h"><h3>Spaces</h3><button onClick={onOwner}>Manage</button></div>
              <div className="sp-row"><span className="sp-th">P</span><div><b>Bole #12</b><small><i/>45 ETB/hr</small></div><Icon name="chevron" size={15}/></div>
              <div className="sp-row"><span className="sp-th sp2">P</span><div><b>Mexico #4</b><small><i/>35 ETB/hr</small></div><Icon name="chevron" size={15}/></div>
            </section>
          </>}
        </div>
        <div className="pd-foot"><button><Icon name="settings" size={17}/> Settings</button><button><Icon name="help" size={17}/> Help</button><button className="pd-out">Sign out</button></div>
      </aside>
    </div>
  );
}

/* ─── Owner Portal ─── */
function OwnerPortal({onClose}:{onClose:()=>void}){
  const [week,setWeek]=useState("This week");
  const [cal,setCal]=useState<Set<number>>(new Set([6,13,20]));
  const [price,setPrice]=useState(45);
  const wd=["M","T","W","T","F","S","S"];
  async function adj(d:number){const n=Math.max(25,price+d);const r=await fetch("/api/host/spaces/2",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({priceHourlyEtb:n})});if(r.ok)setPrice(n);}
  async function togDay(day:number){const b=cal.has(day);const bd=`2024-06-${String(day).padStart(2,"0")}`;const r=await fetch(b?`/api/host/availability?parkingSpaceId=2&blockedDate=${bd}`:"/api/host/availability",b?{method:"DELETE"}:{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({parkingSpaceId:2,blockedDate:bd})});if(!r.ok)return;setCal(p=>{const n=new Set(p);n.has(day)?n.delete(day):n.add(day);return n;});}

  return(
    <div className="overlay own-over" role="dialog" aria-modal="true">
      <section className="oportal">
        <header className="op-head">
          <div className="op-logo"><span>ark</span><b>Ride</b><i>host</i></div>
          <nav className="op-nav"><button className="on">Overview</button><button>Spaces</button><button>Bookings</button><button>Payouts</button></nav>
          <div className="op-acts"><button className="op-period" onClick={()=>setWeek(w=>w==="This week"?"Last week":"This week")}>{week} <Icon name="chevron" size={14}/></button><button className="ic-btn" onClick={onClose}><Icon name="close" size={19}/></button></div>
        </header>
        <main className="op-main">
          <div className="op-intro"><div><p className="ey">HOST PERFORMANCE</p><h1>Hello, Miki.</h1><p>Beating the Addis average this week.</p></div><button className="op-add"><Icon name="plus" size={17}/> List a space</button></div>
          <div className="op-metrics">
            <article className="opm opm-g"><span className="om-ic g"><Icon name="wallet" size={19}/></span><p>Earnings</p><h2>4,680<small> ETB</small></h2><b className="up">↗ 18.5%</b></article>
            <article className="opm opm-y"><span className="om-ic y"><Icon name="calendar" size={19}/></span><p>Bookings</p><h2>42</h2><b className="up">↗ 12%</b></article>
            <article className="opm opm-r"><span className="om-ic r"><Icon name="clock" size={19}/></span><p>Occupancy</p><h2>76<small>%</small></h2><b className="up">↗ 8.2%</b></article>
            <article className="opm opm-p"><span className="om-ic p"><Icon name="star" size={19}/></span><p>Rating</p><h2>4.9</h2><b className="neu">38 reviews</b></article>
          </div>
          <div className="op-grid">
            <section className="op-chart">
              <div className="op-panel-h"><div><h2>Earnings overview</h2><p>Daily revenue</p></div><button>Report <Icon name="arrow" size={14}/></button></div>
              <div className="chart-sum"><b>4,680<small> ETB</small></b><span className="up">↗18.5%</span></div>
              <div className="chart-wrap">
                <svg viewBox="0 0 620 170" preserveAspectRatio="none"><defs><linearGradient id="cf" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#0fa24b" stopOpacity=".22"/><stop offset="100%" stopColor="#0fa24b" stopOpacity="0"/></linearGradient></defs><path className="cg" d="M0 10H620M0 45H620M0 80H620M0 115H620M0 150H620"/><path d="M0 130C40 122 60 115 90 118S130 84 160 100S210 130 240 85S290 95 320 60S370 70 400 50S450 95 480 60S530 35 560 40S600 10 620 3V170H0Z" fill="url(#cf)"/><path className="cl" d="M0 130C40 122 60 115 90 118S130 84 160 100S210 130 240 85S290 95 320 60S370 70 400 50S450 95 480 60S530 35 560 40S600 10 620 3"/><circle cx="400" cy="50" r="5" className="cp"/></svg>
                <div className="chart-x">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=><span key={d}>{d}</span>)}</div>
              </div>
            </section>
            <section className="op-payout">
              <div className="op-panel-h"><div><h2>Next payout</h2><p>Monday</p></div><span className="pay-badge">Processing</span></div>
              <h3>3,240<small> ETB</small></h3>
              <div className="pay-bank"><span>CB</span><div><b>Commercial Bank</b><small>•••• 4928</small></div></div>
              <button className="pay-manage">Manage <Icon name="chevron" size={15}/></button>
            </section>
          </div>
          <div className="op-grid op-lower">
            <section className="op-spaces">
              <div className="op-panel-h"><div><h2>Active spaces</h2><p>Pricing & availability</p></div><button>All <Icon name="arrow" size={14}/></button></div>
              <div className="osp-row"><span className="osp-ph">P</span><div><b>Bole Road #12</b><p><i/> Available · Bole</p></div><div className="osp-price"><span>Price</span><b>{price} ETB/hr</b><div><button onClick={()=>void adj(-5)}>−</button><button onClick={()=>void adj(5)}>+</button></div></div></div>
              <div className="osp-row"><span className="osp-ph osp2">P</span><div><b>Mexico Sq #4</b><p><i/> Available · Churchill</p></div><div className="osp-price"><span>Price</span><b>35 ETB/hr</b><div><button>−</button><button>+</button></div></div></div>
            </section>
            <section className="op-cal">
              <div className="op-panel-h"><div><h2>Availability</h2><p>June 2024</p></div><button className="op-sm-btn"><Icon name="edit" size={13}/> Edit</button></div>
              <div className="cal-grid"><div className="cal-days">{wd.map((d,i)=><span key={`${d}${i}`}>{d}</span>)}</div><div className="cal-dates">{Array.from({length:30},(_,i)=>i+1).map(d=><button key={d} className={`${cal.has(d)?"blk":""} ${d===27?"today":""}`} onClick={()=>void togDay(d)}>{d}</button>)}</div></div>
              <p className="cal-legend"><i className="av-dot"/> Available <i className="blk-dot"/> Blocked</p>
            </section>
          </div>
        </main>
      </section>
    </div>
  );
}

/* ─── Root shell ─── */
export default function ArkRideApp(){
  const [activePin,setActivePin]=useState(0);
  const [booking,setBooking]=useState<Place|null>(null);
  const [profile,setProfile]=useState(false);
  const [owner,setOwner]=useState(false);
  const [searchOpen,setSearchOpen]=useState(false);
  const [query,setQuery]=useState("Bole, Addis Ababa");
  const activePlace=useMemo(()=>booking??places[0],[booking]);

  return(
    <main className="shell">
      {/* Full screen map */}
      <MapHero active={activePin} onPinClick={i=>{setActivePin(i);}}/>

      {/* Floating top bar */}
      <header className="topbar">
        <div className="tb-left">
          <div className="tb-logo"><span>ark</span><b>Ride</b></div>
          <em className="tb-badge">addis</em>
        </div>
        <button className={`tb-search ${searchOpen?"open":""}`} onClick={()=>setSearchOpen(!searchOpen)}>
          <Icon name="search" size={18}/>
          {!searchOpen&&<span>{query||"Where to park?"}</span>}
          {searchOpen&&<input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search Addis…" onClick={e=>e.stopPropagation()}/>}
          <Icon name="filter" size={17}/>
        </button>
        <div className="tb-right">
          <button className="tb-bell" aria-label="Notifications"><Icon name="bell" size={20}/><i/></button>
          <button className="tb-wallet" onClick={()=>setProfile(true)}><Icon name="wallet" size={18}/><span>250</span></button>
          <button className="tb-av" onClick={()=>setProfile(true)}><Avatar size="sm"/></button>
        </div>
      </header>

      {/* Date/time pills */}
      <div className="float-pills">
        <button className="fp"><Icon name="calendar" size={17}/><b>Today</b></button>
        <button className="fp"><Icon name="clock" size={17}/><b>Now</b></button>
      </div>

      {/* Spot popover on map */}
      <div className="map-popover">
        <div className="mp-flag"><FlagRibbon/></div>
        <StatusDot text={places[activePin].spaces}/>
        <h3>{places[activePin].name}</h3>
        <p>{places[activePin].address}</p>
        <div className="mp-bottom">
          <b>{places[activePin].price} <small>ETB</small><span>/hr</span></b>
          <button onClick={()=>setBooking(places[activePin])}>Reserve <Icon name="arrow" size={14}/></button>
        </div>
      </div>

      {/* FABs */}
      <div className="fabs">
        <button className="fab fab-host" onClick={()=>setOwner(true)} aria-label="Host dashboard"><Icon name="building" size={20}/></button>
        <button className="fab fab-me" onClick={()=>setProfile(true)} aria-label="Profile"><Icon name="grid" size={20}/></button>
      </div>

      {/* Horizontal carousel */}
      <SpotCarousel activeIdx={activePin} onSelect={setActivePin} onBook={setBooking}/>

      {/* Active pass bottom sheet */}
      <ActivePassSheet onExpand={()=>setBooking(places[0])}/>

      {/* Overlays */}
      {booking&&<BookingModal place={activePlace} onClose={()=>setBooking(null)} onBooked={()=>undefined}/>}
      {profile&&<ProfileDrawer onClose={()=>setProfile(false)} onOwner={()=>{setProfile(false);setOwner(true);}}/>}
      {owner&&<OwnerPortal onClose={()=>setOwner(false)}/>}
    </main>
  );
}
