"use client";

import { useEffect, useMemo, useState } from "react";

type IconName =
  | "search"
  | "bell"
  | "calendar"
  | "clock"
  | "chevron"
  | "car"
  | "pin"
  | "star"
  | "filter"
  | "wallet"
  | "plus"
  | "arrow"
  | "close"
  | "check"
  | "lock"
  | "grid"
  | "home"
  | "receipt"
  | "help"
  | "settings"
  | "building"
  | "chart"
  | "edit"
  | "copy"
  | "scan"
  | "sparkle"
  | "shield"
  | "menu";

function Icon({ name, size = 20, stroke = 1.8 }: { name: IconName; size?: number; stroke?: number }) {
  const shared = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  const paths: Record<IconName, React.ReactNode> = {
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.5 2" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    car: <><path d="M5 16 6.7 9h10.6l1.7 7" /><path d="M3.5 16.5h17v3a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-3Z" /><circle cx="7" cy="17.5" r="1" fill="currentColor" /><circle cx="17" cy="17.5" r="1" fill="currentColor" /></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.4" /></>,
    star: <path d="m12 3 2.75 5.57 6.15.9-4.45 4.33 1.05 6.12L12 17.03l-5.5 2.89 1.05-6.12L3.1 9.47l6.15-.9L12 3Z" />,
    filter: <><path d="M4 6h16M7 12h10M10 18h4" /><circle cx="8" cy="6" r="1.5" fill="white" /><circle cx="15" cy="12" r="1.5" fill="white" /><circle cx="12" cy="18" r="1.5" fill="white" /></>,
    wallet: <><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H19v14H6.5A2.5 2.5 0 0 1 4 16.5v-9Z" /><path d="M4 8h15" /><path d="M16 13h3" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    check: <path d="m5 12 4.2 4.2L19 6.5" />,
    lock: <><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /><path d="M12 14v2" /></>,
    grid: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>,
    home: <><path d="m4 11 8-7 8 7v9H4v-9Z" /><path d="M9 20v-5h6v5" /></>,
    receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" /><path d="M9 8h6M9 12h6" /></>,
    help: <><circle cx="12" cy="12" r="9" /><path d="M9.8 9a2.4 2.4 0 1 1 4.35 1.42c-1.1 1.36-2.15 1.62-2.15 3.08" /><path d="M12 17h.01" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.2 2.2-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.04 1.56v.09h-3.12v-.09a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-2.2-2.2.06-.06A1.7 1.7 0 0 0 6.72 15a1.7 1.7 0 0 0-1.56-1.04h-.09v-3.12h.09A1.7 1.7 0 0 0 6.72 9.8a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.2-2.2.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.04-1.56v-.09h3.12v.09a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.2 2.2-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.04h.09v3.12h-.09A1.7 1.7 0 0 0 19.4 15Z" /></>,
    building: <><path d="M4 21V5l8-3v19M12 8h8v13" /><path d="M7 8h2M7 12h2M7 16h2M15 12h2M15 16h2" /></>,
    chart: <><path d="M4 20V4M4 20h17" /><path d="m7 16 4-5 3 2 5-7" /></>,
    edit: <><path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></>,
    copy: <><rect x="9" y="9" width="10" height="10" rx="1" /><path d="M15 9V5H5v10h4" /></>,
    scan: <><path d="M5 9V5h4M15 5h4v4M19 15v4h-4M9 19H5v-4" /><path d="M8 12h8" /></>,
    sparkle: <path d="m12 3 1.45 5.55L19 10l-5.55 1.45L12 17l-1.45-5.55L5 10l5.55-1.45L12 3ZM19 16l.65 2.35L22 19l-2.35.65L19 22l-.65-2.35L16 19l2.35-.65L19 16Z" />,
    shield: <><path d="M12 3 19 6v5c0 4.7-3 7.6-7 10-4-2.4-7-5.3-7-10V6l7-3Z" /><path d="m9 12 2 2 4-4" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  };
  return <svg {...shared}>{paths[name]}</svg>;
}

const places = [
  { id: 1, name: "Unity Park Garage", address: "Arat Kilo, Addis Ababa", walk: "3 min walk", price: 35, rating: "4.9", spaces: "12 spots", tone: "sage", label: "Best value" },
  { id: 2, name: "Bole Medhanialem", address: "Bole Road, Addis Ababa", walk: "6 min walk", price: 45, rating: "4.8", spaces: "6 spots", tone: "sand", label: "Covered" },
  { id: 3, name: "Meskel Square Lot", address: "Meskel Square, Addis", walk: "8 min walk", price: 30, rating: "4.7", spaces: "18 spots", tone: "rose", label: "Open air" },
];

const navItems = [
  { icon: "grid" as IconName, label: "Find a spot", active: true },
  { icon: "calendar" as IconName, label: "My bookings" },
  { icon: "wallet" as IconName, label: "Wallet" },
  { icon: "receipt" as IconName, label: "History" },
];

function Avatar({ size = "md" }: { size?: "sm" | "md" }) {
  return <div className={`avatar avatar-${size}`} aria-label="Miki Tadesse profile">MT</div>;
}

function FlagRibbon() {
  return <div className="flag-ribbon" aria-hidden="true"><i /><i /><i /></div>;
}

function StatusDot({ text, color = "green" }: { text: string; color?: "green" | "yellow" }) {
  return <span className={`status-dot ${color}`}><i />{text}</span>;
}

function BookingTimerCard({ onOpen }: { onOpen: () => void }) {
  const [elapsed, setElapsed] = useState(78 * 60 + 32);
  const [gateOpen, setGateOpen] = useState(false);
  useEffect(() => {
    const interval = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(interval);
  }, []);
  const time = `${String(Math.floor(elapsed / 3600)).padStart(2, "0")}:${String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;
  return (
    <section className="active-pass-card">
      <FlagRibbon />
      <span className="ticket-notch notch-left" /><span className="ticket-notch notch-right" />
      <div className="pass-kicker"><span className="pulse" /> ACTIVE PARKING</div>
      <div className="pass-title-row">
        <div><h2>Unity Park Garage</h2><p>Level B · Space 27</p></div>
        <div className="parking-mark">P</div>
      </div>
      <div className="timer-display"><span>{time}</span><small>elapsed</small></div>
      <div className="pass-divider" />
      <button className={`gate-code ${gateOpen ? "revealed" : ""}`} onClick={() => setGateOpen(!gateOpen)}>
        <span className="gate-lock"><Icon name={gateOpen ? "check" : "lock"} size={16} /></span>
        <span>{gateOpen ? "Gate code: 4 8 2 6" : "Tap to reveal gate code"}</span>
        <Icon name={gateOpen ? "copy" : "chevron"} size={16} />
      </button>
      <button className="pass-details" onClick={onOpen}>View parking pass <Icon name="arrow" size={16} /></button>
    </section>
  );
}

function SearchPanel({ onBook }: { onBook: (place?: typeof places[number]) => void }) {
  const [query, setQuery] = useState("Bole, Addis Ababa");
  const [selected, setSelected] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  return (
    <section className="search-column">
      <div className="welcome-line"><p>Good morning, Miki</p><h1>Where are you parking today?</h1></div>
      <div className="search-box">
        <Icon name="search" size={20} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search parking location" />
        <button className="filter-button" aria-label="Open parking filters" onClick={() => setFilterOpen(!filterOpen)}><Icon name="filter" size={19} /></button>
        {filterOpen && <div className="filter-popover"><b>Parking filters</b><label><input type="checkbox" defaultChecked /> Covered spaces</label><label><input type="checkbox" /> EV charging</label><label><input type="checkbox" defaultChecked /> Under 50 ETB/hr</label></div>}
      </div>
      <div className="date-strip" aria-label="Parking date and arrival time">
        <button className="date-pill"><Icon name="calendar" size={19} /><span><b>Today</b><small>Thu, 27 June</small></span><Icon name="chevron" size={16} /></button>
        <button className="date-pill"><Icon name="clock" size={19} /><span><b>Arrive now</b><small>10:30 AM</small></span><Icon name="chevron" size={16} /></button>
      </div>
      <div className="results-heading"><div><span className="eyebrow">AVAILABLE NEARBY</span><h2>18 spots found</h2></div><button className="text-button">Map view</button></div>
      <div className="place-list">
        {places.map((place, index) => (
          <article className={`place-card ${selected === index ? "selected" : ""}`} key={place.id} onClick={() => setSelected(index)}>
            <div className={`place-image ${place.tone}`}><span>{place.label}</span><div className="car-shape"><Icon name="car" size={29} /></div></div>
            <div className="place-info"><div className="place-name-line"><h3>{place.name}</h3><span className="rating"><Icon name="star" size={13} stroke={2.4} /> {place.rating}</span></div><p>{place.address}</p><div className="place-meta"><span><Icon name="pin" size={14} />{place.walk}</span><span>{place.spaces}</span></div></div>
            <div className="place-price"><b>{place.price} <small>ETB</small></b><span>/ hour</span><button onClick={(event) => { event.stopPropagation(); onBook(place); }}>Reserve</button></div>
          </article>
        ))}
      </div>
      <button className="load-more">Show more spaces <Icon name="chevron" size={16} /></button>
    </section>
  );
}

function CityMap({ onBook }: { onBook: (place?: typeof places[number]) => void }) {
  const [mapSpot, setMapSpot] = useState(0);
  const labels = ["Unity Park Garage", "Bole Medhanialem", "Meskel Square Lot"];
  return (
    <section className="map-column" aria-label="Map of available parking spots in Addis Ababa">
      <div className="map-toolbar"><span><Icon name="pin" size={15} /> Addis Ababa</span><button aria-label="Map settings"><Icon name="settings" size={17} /></button></div>
      <div className="map-label landmark-one">National Palace</div><div className="map-label landmark-two">Unity Park</div><div className="map-label landmark-three">Bole Rd</div>
      <div className="map-road road-a" /><div className="map-road road-b" /><div className="map-road road-c" /><div className="map-road road-d" /><div className="map-road road-e" />
      {[{ left: "22%", top: "27%" }, { left: "66%", top: "23%" }, { left: "52%", top: "66%" }, { left: "77%", top: "56%" }, { left: "30%", top: "74%" }].map((point, index) => (
        <button key={index} className={`map-pin ${mapSpot === index % 3 ? "active" : ""}`} style={point} aria-label={`View ${labels[index % 3]}`} onClick={() => setMapSpot(index % 3)}><span>P</span></button>
      ))}
      <div className="you-are-here"><i /><span>You are here</span></div>
      <div className="map-spot-popover"><span className="map-popover-kicker">{places[mapSpot].spaces} available</span><b>{labels[mapSpot]}</b><div><span>from <strong>{places[mapSpot].price} ETB/hr</strong></span><button onClick={() => onBook(places[mapSpot])}>Reserve <Icon name="arrow" size={14} /></button></div></div>
      <div className="map-controls"><button>+</button><button>−</button></div>
      <div className="map-attribution">© OpenStreetMap · Prakme map</div>
    </section>
  );
}

function BookingModal({ place, onClose, onBooked }: { place: typeof places[number]; onClose: () => void; onBooked: () => void }) {
  const [duration, setDuration] = useState(2);
  const [payment, setPayment] = useState("wallet");
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [complete, setComplete] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const total = duration * place.price - (couponApplied ? 20 : 0);

  async function confirmBooking() {
    setSubmitting(true);
    setBookingError("");
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parkingSpaceId: place.id,
          durationHours: duration,
          paymentMethod: payment,
          couponCode: couponApplied ? coupon : undefined,
        }),
      });
      const data = (await response.json()) as { booking?: { id: string }; error?: string };
      if (!response.ok || !data.booking) throw new Error(data.error ?? "Booking could not be created.");
      setBookingId(data.booking.id);
      setComplete(true);
    } catch (caught) {
      setBookingError(caught instanceof Error ? caught.message : "Booking could not be created.");
    } finally {
      setSubmitting(false);
    }
  }

  async function checkIn() {
    if (!bookingId) {
      setScanned(true);
      return;
    }
    const response = await fetch(`/api/bookings/${bookingId}/check-in`, { method: "POST" });
    if (response.ok) setScanned(true);
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Reserve your parking space">
      <div className={`booking-modal ${complete ? "ticket-complete" : ""}`}>
        <button className="modal-close" onClick={onClose} aria-label="Close booking modal"><Icon name="close" size={21} /></button>
        {!complete ? <>
          <div className="modal-heading"><span className="modal-icon"><Icon name="car" size={22} /></span><div><p className="eyebrow">RESERVE A SPACE</p><h2>Book your parking</h2></div></div>
          <div className="booking-place"><div className="booking-map-mini"><Icon name="pin" size={20} /><i /></div><div><h3>{place.name}</h3><p>{place.address} · Level B</p><StatusDot text="12 spaces available" /></div><b>{place.price}<small> ETB/hr</small></b></div>
          <section className="booking-section"><div className="section-title"><span><Icon name="clock" size={18} /> How long will you stay?</span><b>{duration} {duration === 1 ? "hour" : "hours"}</b></div><input className="duration-range" type="range" min="1" max="8" value={duration} onChange={(event) => setDuration(Number(event.target.value))} style={{ "--range-progress": `${((duration - 1) / 7) * 100}%` } as React.CSSProperties} /><div className="range-labels"><span>1 hr</span><span>4 hrs</span><span>8 hrs</span></div><div className="duration-presets">{[1, 2, 3, 4].map((hours) => <button key={hours} className={duration === hours ? "active" : ""} onClick={() => setDuration(hours)}>{hours}h</button>)}</div></section>
          <section className="booking-section"><div className="section-title"><span><Icon name="wallet" size={18} /> Payment method</span><button className="tiny-action">+ Add</button></div><div className="payment-options"><button className={payment === "wallet" ? "selected" : ""} onClick={() => setPayment("wallet")}><span className="payment-symbol wallet-symbol"><Icon name="wallet" size={17} /></span><span>PrakmeWallet <small>Balance: 250 ETB</small></span><i className="radio" /></button><button className={payment === "telebirr" ? "selected" : ""} onClick={() => setPayment("telebirr")}><span className="payment-symbol telebirr-symbol">t</span><span>telebirr <small>Instant payment</small></span><i className="radio" /></button></div></section>
          <section className="coupon-row"><Icon name="sparkle" size={17} /><input value={coupon} onChange={(event) => { setCoupon(event.target.value); setCouponApplied(false); }} placeholder="Promo or coupon code" /><button onClick={() => setCouponApplied(coupon.trim().toUpperCase() === "PRAKME20")}>{couponApplied ? "Applied" : "Apply"}</button></section>
          {couponApplied && <p className="coupon-success"><Icon name="check" size={15} /> PRAKME20 saved you 20 ETB</p>}
          <div className="booking-total"><span>Total due <small>Includes secure space reservation</small></span><b>{total} <small>ETB</small></b></div>
          {bookingError && <p className="booking-error" role="alert">{bookingError}</p>}
          <button className="confirm-booking" disabled={submitting} onClick={() => void confirmBooking()}>{submitting ? "Confirming secure payment…" : `Confirm & pay ${total} ETB`} <Icon name="arrow" size={18} /></button><p className="secure-note"><Icon name="shield" size={15} /> Secured by Prakme payments</p>
        </> : <>
          <div className="ticket-celebration"><span><Icon name="sparkle" size={20} /></span><div><p>YOU&apos;RE ALL SET!</p><h2>Parking confirmed</h2></div></div>
          <div className="digital-ticket"><FlagRibbon /><span className="ticket-notch ticket-left" /><span className="ticket-notch ticket-right" /><div className="ticket-topline"><span>PRAKME PARKING PASS</span><StatusDot text="Valid today" /></div><h3>{place.name}</h3><p>{place.address}</p><div className="ticket-dates"><div><small>ARRIVAL</small><b>10:30 AM</b><span>Thu, 27 June</span></div><div><small>DURATION</small><b>{duration} hours</b><span>Until {10 + duration}:30 PM</span></div><div><small>SPACE</small><b>B · 27</b><span>Level B</span></div></div><div className="ticket-line" /><div className="qr-area"><button className={`qr-code ${scanned ? "scanned" : ""}`} onClick={() => void checkIn()} aria-label="Scan check-in QR code"><span className="qr-corner top-left" /><span className="qr-corner top-right" /><span className="qr-corner bottom-left" /><span className="qr-corner bottom-right" /><i /><i /><i /><i /><i /><i /></button><div><p>{scanned ? "Gate checked in" : "CHECK IN AT GATE"}</p><b>{scanned ? "Welcome to Unity Park" : "Scan your ticket QR code"}</b><button className="scan-button" onClick={() => void checkIn()}><Icon name="scan" size={16} /> {scanned ? "Check-in complete" : "Open scanner"}</button></div></div></div>
          <button className="confirm-booking" onClick={() => { onBooked(); onClose(); }}>Done, view my pass <Icon name="arrow" size={18} /></button><button className="ticket-link" onClick={onClose}>Email me this ticket</button>
        </>}
      </div>
    </div>
  );
}

function ProfileDrawer({ onClose, onOwner }: { onClose: () => void; onOwner: () => void }) {
  const [tab, setTab] = useState<"wallet" | "passes" | "hosting">("wallet");
  const [depositOpen, setDepositOpen] = useState(false);
  const [balance, setBalance] = useState(250);
  const [addingFunds, setAddingFunds] = useState(false);

  useEffect(() => {
    void fetch("/api/wallet")
      .then((response) => response.ok ? response.json() as Promise<{ balanceEtb: number }> : null)
      .then((data) => { if (data) setBalance(data.balanceEtb); })
      .catch(() => undefined);
  }, []);

  async function addFunds(amount: number) {
    setAddingFunds(true);
    try {
      const response = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountEtb: amount, provider: "telebirr" }),
      });
      const data = (await response.json()) as { balanceEtb?: number };
      if (response.ok && typeof data.balanceEtb === "number") {
        setBalance(data.balanceEtb);
        setDepositOpen(false);
      }
    } finally {
      setAddingFunds(false);
    }
  }

  return (
    <div className="drawer-overlay" role="dialog" aria-modal="true" aria-label="Your Prakme profile">
      <aside className="profile-drawer"><div className="drawer-header"><div><p className="eyebrow">YOUR PRAKME</p><h2>Account & parking</h2></div><button className="icon-button" onClick={onClose} aria-label="Close profile"><Icon name="close" size={21} /></button></div><div className="profile-identity"><Avatar /><div><h3>Miki Tadesse</h3><p>miki.t@prakme.et</p></div><span className="verified"><Icon name="check" size={13} /></span></div><div className="profile-tabs"><button className={tab === "wallet" ? "active" : ""} onClick={() => setTab("wallet")}>Wallet</button><button className={tab === "passes" ? "active" : ""} onClick={() => setTab("passes")}>Passes</button><button className={tab === "hosting" ? "active" : ""} onClick={() => setTab("hosting")}>Hosting</button></div>
      {tab === "wallet" && <div className="drawer-content"><section className="wallet-card"><FlagRibbon /><span>ARKWALLET BALANCE</span><h3>{balance.toLocaleString()} <small>ETB</small></h3><p><i /> Ready to park anywhere</p><button onClick={() => setDepositOpen(!depositOpen)}><Icon name="plus" size={17} /> Add money</button></section>{depositOpen && <div className="deposit-sheet"><p>Add a quick amount</p><div>{[50, 100, 250].map(amount => <button key={amount} disabled={addingFunds} onClick={() => void addFunds(amount)}>{addingFunds ? "Adding…" : `+${amount} ETB`}</button>)}</div></div>}<section className="drawer-section"><div className="drawer-section-title"><h3>Recent activity</h3><button>View all</button></div><div className="activity-row"><span className="activity-icon green"><Icon name="car" size={17} /></span><div><b>Unity Park Garage</b><small>Today · 10:30 AM</small></div><strong>−70 ETB</strong></div><div className="activity-row"><span className="activity-icon yellow"><Icon name="plus" size={17} /></span><div><b>Wallet top up</b><small>25 June · telebirr</small></div><strong className="positive">+300 ETB</strong></div></section><button className="help-card"><span><Icon name="help" size={20} /></span><div><b>Need a hand?</b><small>Get fast local support</small></div><Icon name="chevron" size={17} /></button></div>}
      {tab === "passes" && <div className="drawer-content"><section className="mini-pass"><FlagRibbon /><StatusDot text="ACTIVE NOW" /><h3>Unity Park Garage</h3><p>Space B · 27 &nbsp; · &nbsp; Ends 12:30 PM</p><div><span>GATE CODE</span><b>4 8 2 6</b><button><Icon name="copy" size={15} /></button></div></section><section className="drawer-section"><div className="drawer-section-title"><h3>Upcoming</h3><button>View all</button></div><div className="upcoming-pass"><span className="calendar-chip"><b>29</b><small>JUN</small></span><div><b>Edna Mall Parking</b><small>Saturday · 2:00 PM</small></div><span>45 ETB</span></div></section><section className="drawer-section"><div className="drawer-section-title"><h3>Past passes</h3></div><div className="history-pass"><span>24 JUN</span><div><b>Meskel Square Lot</b><small>1h 30m · 45 ETB</small></div><Icon name="chevron" size={16} /></div><div className="history-pass"><span>20 JUN</span><div><b>Bole Medhanialem</b><small>2h · 90 ETB</small></div><Icon name="chevron" size={16} /></div></section></div>}
      {tab === "hosting" && <div className="drawer-content"><section className="host-mini-hero"><span>HOSTING WITH PRAKME</span><h3>Earn from your space.</h3><p>Your listing has 86% visibility this week.</p><button onClick={onOwner}>Open host dashboard <Icon name="arrow" size={16} /></button></section><div className="host-stats"><div><span>This month</span><b>4,680 <small>ETB</small></b><em>+18.5%</em></div><div><span>Bookings</span><b>42</b><em>+12%</em></div></div><section className="drawer-section"><div className="drawer-section-title"><h3>Your spaces</h3><button onClick={onOwner}>Manage</button></div><div className="space-row"><span className="space-thumbnail">P</span><div><b>Bole Road Space #12</b><small><i /> Live · 45 ETB/hr</small></div><Icon name="chevron" size={16} /></div><div className="space-row"><span className="space-thumbnail second">P</span><div><b>Mexico Square Space #4</b><small><i /> Live · 35 ETB/hr</small></div><Icon name="chevron" size={16} /></div></section></div>}
      <div className="drawer-footer"><button><Icon name="settings" size={18} /> Settings</button><button><Icon name="help" size={18} /> Help centre</button><button className="sign-out">Sign out</button></div></aside>
    </div>
  );
}

function OwnerPortal({ onClose }: { onClose: () => void }) {
  const [week, setWeek] = useState("This week");
  const [calendar, setCalendar] = useState<Set<number>>(new Set([6, 13, 20]));
  const [price, setPrice] = useState(45);
  const days = ["M", "T", "W", "T", "F", "S", "S"];

  async function adjustPrice(change: number) {
    const nextPrice = Math.max(25, price + change);
    const response = await fetch("/api/host/spaces/2", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceHourlyEtb: nextPrice }),
    });
    if (response.ok) setPrice(nextPrice);
  }

  async function toggleCalendarDay(day: number) {
    const isBlocked = calendar.has(day);
    const blockedDate = `2024-06-${String(day).padStart(2, "0")}`;
    const response = await fetch(
      isBlocked ? `/api/host/availability?parkingSpaceId=2&blockedDate=${blockedDate}` : "/api/host/availability",
      isBlocked
        ? { method: "DELETE" }
        : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ parkingSpaceId: 2, blockedDate }) },
    );
    if (!response.ok) return;
    setCalendar((previous) => {
      const next = new Set(previous);
      if (next.has(day)) next.delete(day); else next.add(day);
      return next;
    });
  }
  return <div className="owner-overlay" role="dialog" aria-modal="true" aria-label="Prakme owner portal"><section className="owner-portal"><header className="owner-header"><div className="owner-logo"><span>Prak</span><b>me</b><i>host</i></div><div className="owner-nav"><button className="active">Overview</button><button>Spaces</button><button>Bookings</button><button>Payouts</button></div><div><button className="period-select" onClick={() => setWeek(week === "This week" ? "Last week" : "This week")}>{week} <Icon name="chevron" size={15} /></button><button className="icon-button" onClick={onClose} aria-label="Close host dashboard"><Icon name="close" size={20} /></button></div></header><main className="owner-main"><div className="owner-intro"><div><p className="eyebrow">HOST PERFORMANCE</p><h1>Hello, Miki. You&apos;re on a roll.</h1><p>Your spaces earned more than Addis average this week.</p></div><button className="add-space"><Icon name="plus" size={18} /> List a space</button></div><div className="owner-metrics"><article><span className="metric-icon green"><Icon name="wallet" size={20} /></span><p>Total earnings</p><h2>4,680 <small>ETB</small></h2><b className="up">↗ 18.5% <small>vs last week</small></b></article><article><span className="metric-icon yellow"><Icon name="calendar" size={20} /></span><p>Bookings</p><h2>42</h2><b className="up">↗ 12.0% <small>vs last week</small></b></article><article><span className="metric-icon red"><Icon name="clock" size={20} /></span><p>Occupancy rate</p><h2>76<small>%</small></h2><b className="up">↗ 8.2% <small>vs last week</small></b></article><article><span className="metric-icon slate"><Icon name="star" size={20} /></span><p>Guest rating</p><h2>4.9</h2><b className="neutral">Based on 38 reviews</b></article></div><div className="owner-grid"><section className="earnings-chart"><div className="panel-heading"><div><h2>Earnings overview</h2><p>Daily revenue across your spaces</p></div><button>View report <Icon name="arrow" size={15} /></button></div><div className="chart-summary"><b>4,680 <small>ETB</small></b><span className="up">↗ 18.5%</span></div><div className="chart-wrap"><div className="chart-y"><span>1k</span><span>750</span><span>500</span><span>250</span><span>0</span></div><svg viewBox="0 0 620 190" preserveAspectRatio="none" aria-label="Earnings chart"><defs><linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#159447" stopOpacity=".22" /><stop offset="100%" stopColor="#159447" stopOpacity="0" /></linearGradient></defs><path className="grid-line" d="M0 12H620M0 55H620M0 98H620M0 141H620M0 184H620" /><path d="M0 150 C35 142 38 135 75 139 S124 104 151 121 S199 145 228 104 S278 115 306 77 S351 88 380 67 S428 113 458 77 S501 54 532 58 S570 26 620 19 V190 H0Z" fill="url(#chart-fill)" /><path className="chart-line" d="M0 150 C35 142 38 135 75 139 S124 104 151 121 S199 145 228 104 S278 115 306 77 S351 88 380 67 S428 113 458 77 S501 54 532 58 S570 26 620 19" /><circle cx="380" cy="67" r="5" className="chart-point" /></svg><div className="chart-x">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => <span key={day}>{day}</span>)}</div></div></section><section className="next-payout"><div className="panel-heading"><div><h2>Next payout</h2><p>Scheduled for Monday</p></div><span className="payout-status">Processing</span></div><h3>3,240 <small>ETB</small></h3><div className="payout-bank"><span>CB</span><div><b>Commercial Bank of Ethiopia</b><small>•••• 4928</small></div></div><button>Manage payout details <Icon name="chevron" size={16} /></button></section></div><div className="owner-grid lower"><section className="active-spaces"><div className="panel-heading"><div><h2>Your active spaces</h2><p>Manage availability & pricing</p></div><button>All spaces <Icon name="arrow" size={15} /></button></div><div className="owner-space-row"><span className="owner-space-photo first">P</span><div><b>Bole Road Space #12</b><p><i /> Available now · Bole, Addis Ababa</p></div><div className="space-price"><span>Current price</span><b>{price} ETB/hr</b><div><button onClick={() => void adjustPrice(-5)}>−</button><button onClick={() => void adjustPrice(5)}>+</button></div></div><button className="row-more"><Icon name="chevron" size={18} /></button></div><div className="owner-space-row"><span className="owner-space-photo second">P</span><div><b>Mexico Square Space #4</b><p><i /> Available now · Churchill Ave</p></div><div className="space-price"><span>Current price</span><b>35 ETB/hr</b><div><button>−</button><button>+</button></div></div><button className="row-more"><Icon name="chevron" size={18} /></button></div></section><section className="availability-calendar"><div className="panel-heading"><div><h2>Availability</h2><p>June 2024</p></div><button className="small-outline"><Icon name="edit" size={14} /> Edit</button></div><div className="calendar-grid"><div className="calendar-days">{days.map((day, index) => <span key={`${day}${index}`}>{day}</span>)}</div><div className="dates">{Array.from({ length: 30 }, (_, index) => index + 1).map(day => <button className={`${calendar.has(day) ? "blocked" : ""} ${day === 27 ? "today" : ""}`} key={day} onClick={() => void toggleCalendarDay(day)}>{day}</button>)}</div></div><p className="calendar-note"><i /> Available <i className="blocked-key" /> Blocked date</p></section></div></main></section></div>;
}

export default function PrakmeApp() {
  const [bookingPlace, setBookingPlace] = useState<typeof places[number] | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [ownerOpen, setOwnerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const activePlace = useMemo(() => bookingPlace ?? places[0], [bookingPlace]);
  return <main className="prakme-shell"><aside className={`sidebar ${menuOpen ? "mobile-visible" : ""}`}><div className="brand"><div className="brand-mark"><span>Prak</span><b>me</b></div><em>ethiopia</em></div><button className="sidebar-close" onClick={() => setMenuOpen(false)}><Icon name="close" size={20} /></button><nav>{navItems.map(item => <button key={item.label} className={item.active ? "active" : ""}><Icon name={item.icon} size={20} /><span>{item.label}</span>{item.label === "My bookings" && <i className="nav-count">1</i>}</button>)}</nav><div className="sidebar-bottom"><button className="host-callout" onClick={() => setOwnerOpen(true)}><span><Icon name="building" size={20} /></span><div><b>List your space</b><small>Earn with Prakme</small></div><Icon name="chevron" size={16} /></button><button className="side-help"><Icon name="help" size={19} /> Help & support</button><div className="side-user"><Avatar size="sm" /><div><b>Miki Tadesse</b><small>Personal account</small></div><button onClick={() => setProfileOpen(true)} aria-label="Open profile"><Icon name="chevron" size={16} /></button></div></div></aside><div className="app-content"><header className="topbar"><button className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Icon name="menu" size={22} /></button><div className="mobile-brand"><span>Prak</span><b>me</b></div><div className="top-location"><Icon name="pin" size={18} /><span>Addis Ababa</span><Icon name="chevron" size={15} /></div><div className="top-actions"><button className="notification" aria-label="Notifications"><Icon name="bell" size={20} /><i /></button><button className="top-profile" onClick={() => setProfileOpen(true)}><Avatar size="sm" /><span>Miki</span><Icon name="chevron" size={15} /></button></div></header><div className="workspace"><div className="content-grid"><SearchPanel onBook={(place) => setBookingPlace(place ?? places[0])} /><CityMap onBook={(place) => setBookingPlace(place ?? places[0])} /></div><BookingTimerCard onOpen={() => setBookingPlace(places[0])} /></div></div>{bookingPlace && <BookingModal place={activePlace} onClose={() => setBookingPlace(null)} onBooked={() => undefined} />}{profileOpen && <ProfileDrawer onClose={() => setProfileOpen(false)} onOwner={() => { setProfileOpen(false); setOwnerOpen(true); }} />}{ownerOpen && <OwnerPortal onClose={() => setOwnerOpen(false)} />}</main>;
}
