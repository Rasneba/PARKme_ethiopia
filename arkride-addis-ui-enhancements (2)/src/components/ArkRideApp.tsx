"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type {
  ArkRideBooking,
  ArkRideBootstrap,
  ArkRideSpot,
  ArkRideUser,
  OwnerDashboard,
  WalletTransactionView,
} from "@/lib/arkride-types";

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

type BookingMutationPayload = {
  booking: ArkRideBooking;
  user: ArkRideUser;
  spots: ArkRideSpot[];
  walletTransactions: WalletTransactionView[];
  bookings: ArkRideBooking[];
  ownerDashboard: OwnerDashboard;
};

type JsonResult<T> = T & { ok: boolean; error?: string };

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
  const paths: Record<IconName, ReactNode> = {
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

const navItems = [
  { icon: "grid" as IconName, label: "Find a spot", active: true },
  { icon: "calendar" as IconName, label: "My bookings" },
  { icon: "wallet" as IconName, label: "Wallet" },
  { icon: "receipt" as IconName, label: "History" },
];

const mapPoints = [
  { left: "22%", top: "27%" },
  { left: "66%", top: "23%" },
  { left: "52%", top: "66%" },
  { left: "77%", top: "56%" },
  { left: "30%", top: "74%" },
];

function formatGateCode(code: string) {
  return code.split("").join(" ");
}

function formatShortTime(value: string) {
  return new Date(value).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTransactionDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function currentMonthLabel() {
  return new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function currentMonthDate(day: number) {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function deriveActiveBooking(bookings: ArkRideBooking[]) {
  const now = Date.now();
  return bookings.find((booking) => ["active", "reserved"].includes(booking.status) && new Date(booking.endsAt).getTime() > now) ?? null;
}

async function readApi<T>(response: Response): Promise<JsonResult<T>> {
  const payload = (await response.json()) as JsonResult<T>;
  if (!response.ok || payload.ok === false) {
    throw new Error(payload.error || "ArkRide backend request failed");
  }
  return payload;
}

function Avatar({ user, size = "md" }: { user: ArkRideUser; size?: "sm" | "md" }) {
  return <div className={`avatar avatar-${size}`} aria-label={`${user.name} profile`}>{user.initials}</div>;
}

function FlagRibbon() {
  return <div className="flag-ribbon" aria-hidden="true"><i /><i /><i /></div>;
}

function StatusDot({ text, color = "green" }: { text: string; color?: "green" | "yellow" }) {
  return <span className={`status-dot ${color}`}><i />{text}</span>;
}

function BackendPill({ generatedAt }: { generatedAt: string }) {
  return <span className="backend-pill"><Icon name="shield" size={14} /> Live PostgreSQL · {formatShortTime(generatedAt)}</span>;
}

function BookingTimerCard({ activeBooking, onOpen }: { activeBooking: ArkRideBooking | null; onOpen: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  const [gateOpen, setGateOpen] = useState(false);

  useEffect(() => {
    if (!activeBooking) return;
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - new Date(activeBooking.startsAt).getTime()) / 1000)));
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [activeBooking]);

  const time = `${String(Math.floor(elapsed / 3600)).padStart(2, "0")}:${String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;

  if (!activeBooking) {
    return (
      <section className="active-pass-card">
        <FlagRibbon />
        <div className="pass-kicker"><span className="pulse" /> BACKEND READY</div>
        <div className="pass-title-row">
          <div><h2>No active parking pass</h2><p>Reserve a live PostgreSQL-backed space to generate a ticket.</p></div>
          <div className="parking-mark">P</div>
        </div>
        <div className="pass-divider" />
        <button className="gate-code"><span className="gate-lock"><Icon name="lock" size={16} /></span><span>Gate code appears after booking</span><Icon name="chevron" size={16} /></button>
      </section>
    );
  }

  return (
    <section className="active-pass-card">
      <FlagRibbon />
      <span className="ticket-notch notch-left" /><span className="ticket-notch notch-right" />
      <div className="pass-kicker"><span className="pulse" /> ACTIVE PARKING</div>
      <div className="pass-title-row">
        <div><h2>{activeBooking.spotName}</h2><p>{activeBooking.level} · {activeBooking.spaceLabel}</p></div>
        <div className="parking-mark">P</div>
      </div>
      <div className="timer-display"><span>{time}</span><small>elapsed</small></div>
      <div className="pass-divider" />
      <button className={`gate-code ${gateOpen ? "revealed" : ""}`} onClick={() => setGateOpen(!gateOpen)}>
        <span className="gate-lock"><Icon name={gateOpen ? "check" : "lock"} size={16} /></span>
        <span>{gateOpen ? `Gate code: ${formatGateCode(activeBooking.gateCode)}` : "Tap to reveal gate code"}</span>
        <Icon name={gateOpen ? "copy" : "chevron"} size={16} />
      </button>
      <button className="pass-details" onClick={onOpen}>View parking pass <Icon name="arrow" size={16} /></button>
    </section>
  );
}

function SearchPanel({ spots, onBook }: { spots: ArkRideSpot[]; onBook: (place?: ArkRideSpot) => void }) {
  const [query, setQuery] = useState("Bole, Addis Ababa");
  const [selected, setSelected] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [coveredOnly, setCoveredOnly] = useState(false);
  const [evOnly, setEvOnly] = useState(false);
  const [under50, setUnder50] = useState(true);

  const visibleSpots = spots.filter((spot) => {
    const queryMatch = `${spot.name} ${spot.address} ${spot.neighborhood}`.toLowerCase().includes(query.toLowerCase().trim());
    return (!query.trim() || queryMatch) && (!coveredOnly || spot.covered) && (!evOnly || spot.evCharging) && (!under50 || spot.price <= 50);
  });
  const totalSpaces = visibleSpots.reduce((total, spot) => total + spot.availableSpaces, 0);

  return (
    <section className="search-column">
      <div className="welcome-line"><p>Good morning, Miki</p><h1>Where are you parking today?</h1></div>
      <div className="search-box">
        <Icon name="search" size={20} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search parking location" />
        <button className="filter-button" aria-label="Open parking filters" onClick={() => setFilterOpen(!filterOpen)}><Icon name="filter" size={19} /></button>
        {filterOpen && <div className="filter-popover"><b>Parking filters</b><label><input type="checkbox" checked={coveredOnly} onChange={(event) => setCoveredOnly(event.target.checked)} /> Covered spaces</label><label><input type="checkbox" checked={evOnly} onChange={(event) => setEvOnly(event.target.checked)} /> EV charging</label><label><input type="checkbox" checked={under50} onChange={(event) => setUnder50(event.target.checked)} /> Under 50 ETB/hr</label></div>}
      </div>
      <div className="date-strip" aria-label="Parking date and arrival time">
        <button className="date-pill"><Icon name="calendar" size={19} /><span><b>Today</b><small>{new Date().toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" })}</small></span><Icon name="chevron" size={16} /></button>
        <button className="date-pill"><Icon name="clock" size={19} /><span><b>Arrive now</b><small>{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</small></span><Icon name="chevron" size={16} /></button>
      </div>
      <div className="results-heading"><div><span className="eyebrow">AVAILABLE FROM DATABASE</span><h2>{totalSpaces} spots found</h2></div><button className="text-button">Map view</button></div>
      <div className="place-list">
        {visibleSpots.map((place, index) => (
          <article className={`place-card ${selected === index ? "selected" : ""}`} key={place.id} onClick={() => setSelected(index)}>
            <div className={`place-image ${place.tone}`}><span>{place.label}</span><div className="car-shape"><Icon name="car" size={29} /></div></div>
            <div className="place-info"><div className="place-name-line"><h3>{place.name}</h3><span className="rating"><Icon name="star" size={13} stroke={2.4} /> {place.rating}</span></div><p>{place.address}</p><div className="place-meta"><span><Icon name="pin" size={14} />{place.walk}</span><span>{place.spaces}</span></div></div>
            <div className="place-price"><b>{place.price} <small>ETB</small></b><span>/ hour</span><button onClick={(event) => { event.stopPropagation(); onBook(place); }}>Reserve</button></div>
          </article>
        ))}
      </div>
      {visibleSpots.length === 0 ? <div className="empty-card">No PostgreSQL spaces match these filters yet.</div> : <button className="load-more">Show more spaces <Icon name="chevron" size={16} /></button>}
    </section>
  );
}

function CityMap({ spots, onBook }: { spots: ArkRideSpot[]; onBook: (place?: ArkRideSpot) => void }) {
  const [mapSpot, setMapSpot] = useState(0);
  const active = spots[mapSpot] ?? spots[0];

  useEffect(() => {
    if (mapSpot >= spots.length) setMapSpot(0);
  }, [mapSpot, spots.length]);

  return (
    <section className="map-column" aria-label="Map of available parking spots in Addis Ababa">
      <div className="map-toolbar"><span><Icon name="pin" size={15} /> Addis Ababa</span><button aria-label="Map settings"><Icon name="settings" size={17} /></button></div>
      <div className="map-label landmark-one">National Palace</div><div className="map-label landmark-two">Unity Park</div><div className="map-label landmark-three">Bole Rd</div>
      <div className="map-road road-a" /><div className="map-road road-b" /><div className="map-road road-c" /><div className="map-road road-d" /><div className="map-road road-e" />
      {spots.slice(0, 5).map((spot, index) => (
        <button key={spot.id} className={`map-pin ${mapSpot === index ? "active" : ""}`} style={mapPoints[index]} aria-label={`View ${spot.name}`} onClick={() => setMapSpot(index)}><span>P</span></button>
      ))}
      <div className="you-are-here"><i /><span>You are here</span></div>
      {active && <div className="map-spot-popover"><span className="map-popover-kicker">{active.spaces} available</span><b>{active.name}</b><div><span>from <strong>{active.price} ETB/hr</strong></span><button onClick={() => onBook(active)}>Reserve <Icon name="arrow" size={14} /></button></div></div>}
      <div className="map-controls"><button>+</button><button>−</button></div>
      <div className="map-attribution">© OpenStreetMap · ArkRide live DB map</div>
    </section>
  );
}

function BookingModal({ place, user, onClose, onBooked }: { place: ArkRideSpot; user: ArkRideUser; onClose: () => void; onBooked: (payload: BookingMutationPayload) => void }) {
  const [duration, setDuration] = useState(2);
  const [payment, setPayment] = useState<"wallet" | "telebirr">("wallet");
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [complete, setComplete] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [booking, setBooking] = useState<ArkRideBooking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const discount = couponApplied && coupon.trim().toUpperCase() === "ARKRIDE20" ? 20 : 0;
  const total = Math.max(0, duration * place.price - discount);

  async function confirmBooking() {
    setIsSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spotId: place.id,
          startsAt: new Date().toISOString(),
          durationHours: duration,
          paymentMethod: payment,
          couponCode: couponApplied ? coupon : undefined,
        }),
      });
      const payload = await readApi<BookingMutationPayload>(response);
      onBooked(payload);
      setBooking(payload.booking);
      setComplete(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not complete booking");
    } finally {
      setIsSubmitting(false);
    }
  }

  const ticket = booking;

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Reserve your parking space">
      <div className={`booking-modal ${complete ? "ticket-complete" : ""}`}>
        <button className="modal-close" onClick={onClose} aria-label="Close booking modal"><Icon name="close" size={21} /></button>
        {!complete ? <>
          <div className="modal-heading"><span className="modal-icon"><Icon name="car" size={22} /></span><div><p className="eyebrow">POSTGRESQL RESERVATION</p><h2>Book your parking</h2></div></div>
          <div className="booking-place"><div className="booking-map-mini"><Icon name="pin" size={20} /><i /></div><div><h3>{place.name}</h3><p>{place.address} · {place.level}</p><StatusDot text={`${place.availableSpaces} spaces available`} /></div><b>{place.price}<small> ETB/hr</small></b></div>
          <section className="booking-section"><div className="section-title"><span><Icon name="clock" size={18} /> How long will you stay?</span><b>{duration} {duration === 1 ? "hour" : "hours"}</b></div><input className="duration-range" type="range" min="1" max="8" value={duration} onChange={(event) => setDuration(Number(event.target.value))} style={{ "--range-progress": `${((duration - 1) / 7) * 100}%` } as CSSProperties} /><div className="range-labels"><span>1 hr</span><span>4 hrs</span><span>8 hrs</span></div><div className="duration-presets">{[1, 2, 3, 4].map((hours) => <button key={hours} className={duration === hours ? "active" : ""} onClick={() => setDuration(hours)}>{hours}h</button>)}</div></section>
          <section className="booking-section"><div className="section-title"><span><Icon name="wallet" size={18} /> Payment method</span><button className="tiny-action">+ Add</button></div><div className="payment-options"><button className={payment === "wallet" ? "selected" : ""} onClick={() => setPayment("wallet")}><span className="payment-symbol wallet-symbol"><Icon name="wallet" size={17} /></span><span>ArkWallet <small>Balance: {user.walletBalanceEtb} ETB</small></span><i className="radio" /></button><button className={payment === "telebirr" ? "selected" : ""} onClick={() => setPayment("telebirr")}><span className="payment-symbol telebirr-symbol">t</span><span>telebirr <small>Instant external payment</small></span><i className="radio" /></button></div></section>
          <section className="coupon-row"><Icon name="sparkle" size={17} /><input value={coupon} onChange={(event) => { setCoupon(event.target.value); setCouponApplied(false); }} placeholder="Try ARKRIDE20" /><button onClick={() => coupon.trim() && setCouponApplied(true)}>{couponApplied ? "Applied" : "Apply"}</button></section>
          {couponApplied && discount > 0 && <p className="coupon-success"><Icon name="check" size={15} /> ARKRIDE20 saved you 20 ETB</p>}
          {couponApplied && discount === 0 && <p className="booking-error">Coupon will be validated by the backend at checkout.</p>}
          {error && <p className="booking-error"><Icon name="shield" size={14} /> {error}</p>}
          <div className="booking-total"><span>Total due <small>Server calculates final price and availability</small></span><b>{total} <small>ETB</small></b></div>
          <button className="confirm-booking" onClick={confirmBooking} disabled={isSubmitting}>{isSubmitting ? "Creating live booking..." : `Confirm & pay ${total} ETB`} <Icon name="arrow" size={18} /></button><p className="secure-note"><Icon name="shield" size={15} /> Saved to ArkRide PostgreSQL ledger</p>
        </> : <>
          <div className="ticket-celebration"><span><Icon name="sparkle" size={20} /></span><div><p>YOU&apos;RE ALL SET!</p><h2>Parking confirmed</h2></div></div>
          <div className="digital-ticket"><FlagRibbon /><span className="ticket-notch ticket-left" /><span className="ticket-notch ticket-right" /><div className="ticket-topline"><span>ARKRIDE PARKING PASS</span><StatusDot text="Saved live" /></div><h3>{ticket?.spotName ?? place.name}</h3><p>{ticket?.spotAddress ?? place.address}</p><div className="ticket-dates"><div><small>ARRIVAL</small><b>{ticket ? formatShortTime(ticket.startsAt) : "Now"}</b><span>{ticket ? formatShortDate(ticket.startsAt) : "Today"}</span></div><div><small>DURATION</small><b>{ticket?.durationHours ?? duration} hours</b><span>{ticket ? `Until ${formatShortTime(ticket.endsAt)}` : "Confirmed"}</span></div><div><small>SPACE</small><b>{ticket?.spaceLabel ?? place.spaceLabel}</b><span>{ticket?.level ?? place.level}</span></div></div><div className="ticket-line" /><div className="qr-area"><button className={`qr-code ${scanned ? "scanned" : ""}`} onClick={() => setScanned(true)} aria-label="Scan check-in QR code"><span className="qr-corner top-left" /><span className="qr-corner top-right" /><span className="qr-corner bottom-left" /><span className="qr-corner bottom-right" /><i /><i /><i /><i /><i /><i /></button><div><p>{scanned ? "Gate checked in" : "CHECK IN AT GATE"}</p><b>{scanned ? "Welcome to ArkRide" : `Gate ${formatGateCode(ticket?.gateCode ?? place.gateCode)}`}</b><button className="scan-button" onClick={() => setScanned(true)}><Icon name="scan" size={16} /> {scanned ? "Check-in complete" : "Open scanner"}</button></div></div></div>
          <button className="confirm-booking" onClick={onClose}>Done, view my pass <Icon name="arrow" size={18} /></button><button className="ticket-link" onClick={onClose}>Email me this ticket</button>
        </>}
      </div>
    </div>
  );
}

function ProfileDrawer({ user, bookings, transactions, ownerDashboard, onClose, onOwner, onDeposit }: { user: ArkRideUser; bookings: ArkRideBooking[]; transactions: WalletTransactionView[]; ownerDashboard: OwnerDashboard; onClose: () => void; onOwner: () => void; onDeposit: (amount: number) => Promise<void> }) {
  const [tab, setTab] = useState<"wallet" | "passes" | "hosting">("wallet");
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositing, setDepositing] = useState(false);
  const [error, setError] = useState("");
  const activeBooking = deriveActiveBooking(bookings);
  const pastBookings = bookings.filter((booking) => booking.status === "completed" || new Date(booking.endsAt).getTime() < Date.now()).slice(0, 3);

  async function handleDeposit(amount: number) {
    setDepositing(true);
    setError("");
    try {
      await onDeposit(amount);
      setDepositOpen(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Deposit failed");
    } finally {
      setDepositing(false);
    }
  }

  return (
    <div className="drawer-overlay" role="dialog" aria-modal="true" aria-label="Your ArkRide profile">
      <aside className="profile-drawer"><div className="drawer-header"><div><p className="eyebrow">YOUR LIVE ARKRIDE</p><h2>Account & parking</h2></div><button className="icon-button" onClick={onClose} aria-label="Close profile"><Icon name="close" size={21} /></button></div><div className="profile-identity"><Avatar user={user} /><div><h3>{user.name}</h3><p>{user.email}</p></div><span className="verified"><Icon name="check" size={13} /></span></div><div className="profile-tabs"><button className={tab === "wallet" ? "active" : ""} onClick={() => setTab("wallet")}>Wallet</button><button className={tab === "passes" ? "active" : ""} onClick={() => setTab("passes")}>Passes</button><button className={tab === "hosting" ? "active" : ""} onClick={() => setTab("hosting")}>Hosting</button></div>
      {tab === "wallet" && <div className="drawer-content"><section className="wallet-card"><FlagRibbon /><span>ARKWALLET BALANCE</span><h3>{user.walletBalanceEtb.toLocaleString()} <small>ETB</small></h3><p><i /> Synced with PostgreSQL wallet ledger</p><button onClick={() => setDepositOpen(!depositOpen)}><Icon name="plus" size={17} /> Add money</button></section>{depositOpen && <div className="deposit-sheet"><p>Add a quick amount</p><div>{[50, 100, 250].map(amount => <button key={amount} disabled={depositing} onClick={() => handleDeposit(amount)}>+{amount} ETB</button>)}</div>{error && <p className="booking-error">{error}</p>}</div>}<section className="drawer-section"><div className="drawer-section-title"><h3>Recent activity</h3><button>View all</button></div>{transactions.slice(0, 5).map((tx) => <div className="activity-row" key={tx.id}><span className={`activity-icon ${tx.amountEtb >= 0 ? "yellow" : "green"}`}><Icon name={tx.amountEtb >= 0 ? "plus" : "car"} size={17} /></span><div><b>{tx.note}</b><small>{formatTransactionDate(tx.createdAt)}</small></div><strong className={tx.amountEtb >= 0 ? "positive" : ""}>{tx.amountEtb > 0 ? "+" : ""}{tx.amountEtb} ETB</strong></div>)}</section><button className="help-card"><span><Icon name="help" size={20} /></span><div><b>Need a hand?</b><small>Get fast local support</small></div><Icon name="chevron" size={17} /></button></div>}
      {tab === "passes" && <div className="drawer-content">{activeBooking ? <section className="mini-pass"><FlagRibbon /><StatusDot text="ACTIVE NOW" /><h3>{activeBooking.spotName}</h3><p>{activeBooking.spaceLabel} &nbsp; · &nbsp; Ends {formatShortTime(activeBooking.endsAt)}</p><div><span>GATE CODE</span><b>{formatGateCode(activeBooking.gateCode)}</b><button><Icon name="copy" size={15} /></button></div></section> : <div className="empty-card">No active parking pass yet.</div>}<section className="drawer-section"><div className="drawer-section-title"><h3>Upcoming & active</h3><button>View all</button></div>{bookings.filter((booking) => booking.status === "active" || booking.status === "reserved").slice(0, 3).map((booking) => <div className="upcoming-pass" key={booking.id}><span className="calendar-chip"><b>{new Date(booking.startsAt).getDate()}</b><small>{new Date(booking.startsAt).toLocaleDateString("en-US", { month: "short" }).toUpperCase()}</small></span><div><b>{booking.spotName}</b><small>{formatShortDate(booking.startsAt)} · {formatShortTime(booking.startsAt)}</small></div><span>{booking.totalEtb} ETB</span></div>)}</section><section className="drawer-section"><div className="drawer-section-title"><h3>Past passes</h3></div>{pastBookings.map((booking) => <div className="history-pass" key={booking.id}><span>{formatShortDate(booking.startsAt).toUpperCase()}</span><div><b>{booking.spotName}</b><small>{booking.durationHours}h · {booking.totalEtb} ETB</small></div><Icon name="chevron" size={16} /></div>)}</section></div>}
      {tab === "hosting" && <div className="drawer-content"><section className="host-mini-hero"><span>HOSTING WITH ARKRIDE</span><h3>Earn from your space.</h3><p>Your listing data is served from PostgreSQL.</p><button onClick={onOwner}>Open host dashboard <Icon name="arrow" size={16} /></button></section><div className="host-stats"><div><span>Total earnings</span><b>{ownerDashboard.metrics.totalEarningsEtb.toLocaleString()} <small>ETB</small></b><em>+{ownerDashboard.metrics.earningsDelta}%</em></div><div><span>Bookings</span><b>{ownerDashboard.metrics.bookings}</b><em>+{ownerDashboard.metrics.bookingsDelta}%</em></div></div><section className="drawer-section"><div className="drawer-section-title"><h3>Your spaces</h3><button onClick={onOwner}>Manage</button></div>{ownerDashboard.spaces.slice(0, 2).map((space, index) => <div className="space-row" key={space.id}><span className={`space-thumbnail ${index === 1 ? "second" : ""}`}>P</span><div><b>{space.name}</b><small><i /> Live · {space.price} ETB/hr</small></div><Icon name="chevron" size={16} /></div>)}</section></div>}
      <div className="drawer-footer"><button><Icon name="settings" size={18} /> Settings</button><button><Icon name="help" size={18} /> Help centre</button><button className="sign-out">Sign out</button></div></aside>
    </div>
  );
}

function chartPath(chart: OwnerDashboard["chart"]) {
  const max = Math.max(1, ...chart.map((point) => point.amountEtb));
  const points = chart.map((point, index) => {
    const x = chart.length === 1 ? 0 : (index / (chart.length - 1)) * 620;
    const y = 176 - (point.amountEtb / max) * 148;
    return `${x.toFixed(1)} ${y.toFixed(1)}`;
  });
  return `M ${points.join(" L ")}`;
}

function chartFillPath(chart: OwnerDashboard["chart"]) {
  return `${chartPath(chart)} V 190 H 0 Z`;
}

function OwnerPortal({ dashboard, onClose, onPriceChange, onToggleBlockedDate }: { dashboard: OwnerDashboard; onClose: () => void; onPriceChange: (spotId: string, price: number) => Promise<void>; onToggleBlockedDate: (spotId: string, date: string, blocked: boolean) => Promise<void> }) {
  const [week, setWeek] = useState("This week");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const primarySpace = dashboard.spaces[0];
  const blockedDays = new Set(dashboard.blockedDates.map((date) => Number(date.date.split("-")[2])));
  const path = chartPath(dashboard.chart);
  const fillPath = chartFillPath(dashboard.chart);

  async function changePrice(spotId: string, price: number) {
    setBusy(`price-${spotId}`);
    setError("");
    try {
      await onPriceChange(spotId, price);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update price");
    } finally {
      setBusy("");
    }
  }

  async function toggleDay(day: number) {
    if (!primarySpace) return;
    const date = currentMonthDate(day);
    const nextBlocked = !blockedDays.has(day);
    setBusy(`date-${day}`);
    setError("");
    try {
      await onToggleBlockedDate(primarySpace.id, date, nextBlocked);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update calendar");
    } finally {
      setBusy("");
    }
  }

  return <div className="owner-overlay" role="dialog" aria-modal="true" aria-label="ArkRide owner portal"><section className="owner-portal"><header className="owner-header"><div className="owner-logo"><span>ark</span><b>Ride</b><i>host</i></div><div className="owner-nav"><button className="active">Overview</button><button>Spaces</button><button>Bookings</button><button>Payouts</button></div><div><button className="period-select" onClick={() => setWeek(week === "This week" ? "Last week" : "This week")}>{week} <Icon name="chevron" size={15} /></button><button className="icon-button" onClick={onClose} aria-label="Close host dashboard"><Icon name="close" size={20} /></button></div></header><main className="owner-main"><div className="owner-intro"><div><p className="eyebrow">HOST PERFORMANCE</p><h1>Hello, Miki. You&apos;re on a roll.</h1><p>Your spaces earned {dashboard.metrics.totalEarningsEtb.toLocaleString()} ETB from live booking rows.</p></div><button className="add-space"><Icon name="plus" size={18} /> List a space</button></div>{error && <p className="booking-error owner-error">{error}</p>}<div className="owner-metrics"><article><span className="metric-icon green"><Icon name="wallet" size={20} /></span><p>Total earnings</p><h2>{dashboard.metrics.totalEarningsEtb.toLocaleString()} <small>ETB</small></h2><b className="up">↗ {dashboard.metrics.earningsDelta}% <small>vs last week</small></b></article><article><span className="metric-icon yellow"><Icon name="calendar" size={20} /></span><p>Bookings</p><h2>{dashboard.metrics.bookings}</h2><b className="up">↗ {dashboard.metrics.bookingsDelta}% <small>vs last week</small></b></article><article><span className="metric-icon red"><Icon name="clock" size={20} /></span><p>Occupancy rate</p><h2>{dashboard.metrics.occupancyRate}<small>%</small></h2><b className="up">↗ {dashboard.metrics.occupancyDelta}% <small>vs last week</small></b></article><article><span className="metric-icon slate"><Icon name="star" size={20} /></span><p>Guest rating</p><h2>{dashboard.metrics.rating}</h2><b className="neutral">Based on {dashboard.metrics.reviewCount} reviews</b></article></div><div className="owner-grid"><section className="earnings-chart"><div className="panel-heading"><div><h2>Earnings overview</h2><p>Daily revenue across your spaces</p></div><button>View report <Icon name="arrow" size={15} /></button></div><div className="chart-summary"><b>{dashboard.metrics.totalEarningsEtb.toLocaleString()} <small>ETB</small></b><span className="up">↗ {dashboard.metrics.earningsDelta}%</span></div><div className="chart-wrap"><div className="chart-y"><span>{Math.max(...dashboard.chart.map(point => point.amountEtb)).toLocaleString()}</span><span>750</span><span>500</span><span>250</span><span>0</span></div><svg viewBox="0 0 620 190" preserveAspectRatio="none" aria-label="Earnings chart"><defs><linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#159447" stopOpacity=".22" /><stop offset="100%" stopColor="#159447" stopOpacity="0" /></linearGradient></defs><path className="grid-line" d="M0 12H620M0 55H620M0 98H620M0 141H620M0 184H620" /><path d={fillPath} fill="url(#chart-fill)" /><path className="chart-line" d={path} /><circle cx="530" cy="58" r="5" className="chart-point" /></svg><div className="chart-x">{dashboard.chart.map(point => <span key={point.day}>{point.day}</span>)}</div></div></section><section className="next-payout"><div className="panel-heading"><div><h2>Next payout</h2><p>Scheduled for {dashboard.payout.scheduledFor}</p></div><span className="payout-status">{dashboard.payout.status}</span></div><h3>{dashboard.payout.amountEtb.toLocaleString()} <small>ETB</small></h3><div className="payout-bank"><span>CB</span><div><b>{dashboard.payout.bankLabel}</b><small>{dashboard.payout.maskedAccount}</small></div></div><button>Manage payout details <Icon name="chevron" size={16} /></button></section></div><div className="owner-grid lower"><section className="active-spaces"><div className="panel-heading"><div><h2>Your active spaces</h2><p>Manage availability & pricing</p></div><button>All spaces <Icon name="arrow" size={15} /></button></div>{dashboard.spaces.map((space, index) => <div className="owner-space-row" key={space.id}><span className={`owner-space-photo ${index === 1 ? "second" : "first"}`}>P</span><div><b>{space.name}</b><p><i /> {space.availableSpaces} spaces · {space.neighborhood}</p></div><div className="space-price"><span>Current price</span><b>{space.price} ETB/hr</b><div><button disabled={busy === `price-${space.id}`} onClick={() => changePrice(space.id, Math.max(10, space.price - 5))}>−</button><button disabled={busy === `price-${space.id}`} onClick={() => changePrice(space.id, space.price + 5)}>+</button></div></div><button className="row-more"><Icon name="chevron" size={18} /></button></div>)}</section><section className="availability-calendar"><div className="panel-heading"><div><h2>Availability</h2><p>{currentMonthLabel()}</p></div><button className="small-outline"><Icon name="edit" size={14} /> Edit</button></div><div className="calendar-grid"><div className="calendar-days">{days.map((day, index) => <span key={`${day}${index}`}>{day}</span>)}</div><div className="dates">{Array.from({ length: 30 }, (_, index) => index + 1).map(day => <button className={`${blockedDays.has(day) ? "blocked" : ""} ${day === new Date().getDate() ? "today" : ""}`} key={day} disabled={busy === `date-${day}`} onClick={() => toggleDay(day)}>{day}</button>)}</div></div><p className="calendar-note"><i /> Available <i className="blocked-key" /> Blocked date</p></section></div></main></section></div>;
}

export default function ArkRideApp({ initialData }: { initialData: ArkRideBootstrap }) {
  const [user, setUser] = useState(initialData.user);
  const [spots, setSpots] = useState(initialData.spots);
  const [bookings, setBookings] = useState(initialData.bookings);
  const [activeBooking, setActiveBooking] = useState(initialData.activeBooking);
  const [walletTransactions, setWalletTransactions] = useState(initialData.walletTransactions);
  const [ownerDashboard, setOwnerDashboard] = useState(initialData.ownerDashboard);
  const [bookingPlace, setBookingPlace] = useState<ArkRideSpot | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [ownerOpen, setOwnerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [layoutMode, setLayoutMode] = useState<"classic" | "immersive">("classic");
  const activePlace = useMemo(() => bookingPlace ?? spots[0], [bookingPlace, spots]);

  function applyBookingPayload(payload: BookingMutationPayload) {
    setUser(payload.user);
    setSpots(payload.spots);
    setWalletTransactions(payload.walletTransactions);
    setBookings(payload.bookings);
    setActiveBooking(deriveActiveBooking(payload.bookings) ?? payload.booking);
    setOwnerDashboard(payload.ownerDashboard);
    setToast("Booking saved to PostgreSQL");
  }

  async function handleDeposit(amount: number) {
    const response = await fetch("/api/wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountEtb: amount, method: "telebirr" }),
    });
    const payload = await readApi<{ user: ArkRideUser; walletTransactions: WalletTransactionView[] }>(response);
    setUser(payload.user);
    setWalletTransactions(payload.walletTransactions);
    setToast(`Wallet topped up by ${amount} ETB`);
  }

  async function handlePriceChange(spotId: string, price: number) {
    const response = await fetch(`/api/owner/spots/${spotId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pricePerHourEtb: price }),
    });
    const payload = await readApi<{ spot: ArkRideSpot; ownerDashboard: OwnerDashboard; spots: ArkRideSpot[] }>(response);
    setOwnerDashboard(payload.ownerDashboard);
    setSpots(payload.spots);
    setToast(`${payload.spot.name} is now ${payload.spot.price} ETB/hr`);
  }

  async function handleBlockedDate(spotId: string, date: string, blocked: boolean) {
    const response = await fetch("/api/owner/blocked-dates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spotId, date, blocked, reason: blocked ? "Blocked from host dashboard" : undefined, priceMultiplier: blocked ? 1.4 : 1 }),
    });
    const payload = await readApi<{ ownerDashboard: OwnerDashboard }>(response);
    setOwnerDashboard(payload.ownerDashboard);
    setToast(blocked ? "Date blocked in PostgreSQL" : "Date reopened in PostgreSQL");
  }

  const layoutToggle = (
    <button className="layout-switch" onClick={() => setLayoutMode(layoutMode === "classic" ? "immersive" : "classic")} aria-label={`Switch to ${layoutMode === "classic" ? "immersive" : "classic"} layout`} title={`Switch to ${layoutMode === "classic" ? "Immersive" : "Classic"} layout`}>
      <Icon name={layoutMode === "classic" ? "grid" : "menu"} size={17} />
      <span>{layoutMode === "classic" ? "Immersive" : "Classic"}</span>
    </button>
  );

  const layoutModals = (
    <>
      {activePlace && bookingPlace && <BookingModal place={activePlace} user={user} onClose={() => setBookingPlace(null)} onBooked={applyBookingPayload} />}
      {profileOpen && <ProfileDrawer user={user} bookings={bookings} transactions={walletTransactions} ownerDashboard={ownerDashboard} onClose={() => setProfileOpen(false)} onOwner={() => { setProfileOpen(false); setOwnerOpen(true); }} onDeposit={handleDeposit} />}
      {ownerOpen && <OwnerPortal dashboard={ownerDashboard} onClose={() => setOwnerOpen(false)} onPriceChange={handlePriceChange} onToggleBlockedDate={handleBlockedDate} />}
    </>
  );

  const sharedToast = toast && <button className="toast" onClick={() => setToast("")}><Icon name="check" size={15} /> {toast}</button>;

  if (layoutMode === "immersive") {
    return (
      <main className="arkride-shell arkride-immersive">
        <header className="immersive-topbar">
          <div className="immersive-brand"><span>ark</span><b>Ride</b><em>addis</em></div>
          <nav className="immersive-nav">
            {navItems.map(item => <button key={item.label} className={item.active ? "active" : ""} onClick={() => item.label === "My bookings" && setProfileOpen(true)}><Icon name={item.icon} size={18} /><span>{item.label}</span>{item.label === "My bookings" && <i className="nav-count">{bookings.length}</i>}</button>)}
          </nav>
          <div className="immersive-actions">
            <BackendPill generatedAt={initialData.generatedAt} />
            {layoutToggle}
            <button className="notification" aria-label="Notifications"><Icon name="bell" size={20} /><i /></button>
            <button className="top-profile" onClick={() => setProfileOpen(true)}><Avatar user={user} size="sm" /><span>{user.name.split(" ")[0]}</span></button>
          </div>
        </header>
        <div className="immersive-body">
          <section className="immersive-hero">
            <div className="immersive-hero-map">
              <CityMap spots={spots} onBook={(place) => setBookingPlace(place ?? spots[0] ?? null)} />
            </div>
            <div className="immersive-hero-overlay">
              <div className="welcome-line"><p>Good morning, Miki</p><h1>Where are you parking today?</h1></div>
              <div className="immersive-search-row">
                <div className="search-box">
                  <Icon name="search" size={20} />
                  <input defaultValue="Bole, Addis Ababa" aria-label="Search parking location" />
                  <button className="filter-button" aria-label="Filters"><Icon name="filter" size={19} /></button>
                </div>
                <button className="date-pill"><Icon name="calendar" size={19} /><span><b>Today</b><small>{new Date().toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" })}</small></span></button>
                <button className="date-pill"><Icon name="clock" size={19} /><span><b>Now</b><small>{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</small></span></button>
              </div>
            </div>
            {activeBooking && (
              <div className="immersive-floating-pass">
                <FlagRibbon />
                <div className="immersive-pass-inner">
                  <div className="pass-kicker"><span className="pulse" /> ACTIVE · {activeBooking.spotName}</div>
                  <div className="immersive-pass-row">
                    <span className="immersive-pass-code">{formatGateCode(activeBooking.gateCode)}</span>
                    <button onClick={() => setBookingPlace(spots.find((s) => s.id === activeBooking.spotId) ?? spots[0] ?? null)}>View pass <Icon name="arrow" size={14} /></button>
                  </div>
                </div>
              </div>
            )}
          </section>
          <section className="immersive-content">
            {sharedToast}
            <div className="results-heading"><div><span className="eyebrow">AVAILABLE FROM DATABASE</span><h2>{spots.reduce((t, s) => t + s.availableSpaces, 0)} spots found</h2></div><button className="text-button">Map view</button></div>
            <div className="immersive-card-strip">
              {spots.map((place) => (
                <article className="immersive-place-card" key={place.id} onClick={() => setBookingPlace(place)}>
                  <div className={`place-image ${place.tone}`}><span>{place.label}</span><div className="car-shape"><Icon name="car" size={26} /></div></div>
                  <div className="immersive-card-body">
                    <div className="place-name-line"><h3>{place.name}</h3><span className="rating"><Icon name="star" size={12} stroke={2.4} /> {place.rating}</span></div>
                    <p>{place.address}</p>
                    <div className="place-meta"><span><Icon name="pin" size={13} />{place.walk}</span><span>{place.spaces}</span></div>
                    <div className="immersive-card-footer"><b>{place.price} <small>ETB/hr</small></b><button onClick={(e) => { e.stopPropagation(); setBookingPlace(place); }}>Reserve</button></div>
                  </div>
                </article>
              ))}
              <article className="immersive-place-card immersive-add-card">
                <div className="immersive-add-icon"><Icon name="plus" size={28} /></div>
                <div className="immersive-card-body"><h3>List your space</h3><p>Earn {ownerDashboard.metrics.totalEarningsEtb.toLocaleString()} ETB hosting with ArkRide</p><button onClick={() => setOwnerOpen(true)}>Become a host <Icon name="arrow" size={14} /></button></div>
              </article>
            </div>
            {!activeBooking && (
              <section className="active-pass-card immersive-no-pass">
                <FlagRibbon />
                <div className="pass-kicker">READY TO PARK</div>
                <div className="pass-title-row"><div><h2>No active pass yet</h2><p>Reserve a spot above to generate a live ticket.</p></div><div className="parking-mark">P</div></div>
              </section>
            )}
          </section>
        </div>
        {layoutModals}
      </main>
    );
  }

  return <main className="arkride-shell"><aside className={`sidebar ${menuOpen ? "mobile-visible" : ""}`}><div className="brand"><div className="brand-mark"><span>ark</span><b>Ride</b></div><em>addis</em></div><button className="sidebar-close" onClick={() => setMenuOpen(false)}><Icon name="close" size={20} /></button><nav>{navItems.map(item => <button key={item.label} className={item.active ? "active" : ""}><Icon name={item.icon} size={20} /><span>{item.label}</span>{item.label === "My bookings" && <i className="nav-count">{bookings.length}</i>}</button>)}</nav><div className="sidebar-bottom"><button className="host-callout" onClick={() => setOwnerOpen(true)}><span><Icon name="building" size={20} /></span><div><b>List your space</b><small>{ownerDashboard.metrics.totalEarningsEtb.toLocaleString()} ETB earned</small></div><Icon name="chevron" size={16} /></button><button className="side-help"><Icon name="help" size={19} /> Help & support</button><div className="side-user"><Avatar user={user} size="sm" /><div><b>{user.name}</b><small>Wallet {user.walletBalanceEtb} ETB</small></div><button onClick={() => setProfileOpen(true)} aria-label="Open profile"><Icon name="chevron" size={16} /></button></div></div></aside><div className="app-content"><header className="topbar"><button className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Icon name="menu" size={22} /></button><div className="mobile-brand"><span>ark</span><b>Ride</b></div><div className="top-location"><Icon name="pin" size={18} /><span>Addis Ababa</span><Icon name="chevron" size={15} /></div><BackendPill generatedAt={initialData.generatedAt} />{layoutToggle}<div className="top-actions"><button className="notification" aria-label="Notifications"><Icon name="bell" size={20} /><i /></button><button className="top-profile" onClick={() => setProfileOpen(true)}><Avatar user={user} size="sm" /><span>{user.name.split(" ")[0]}</span><Icon name="chevron" size={15} /></button></div></header><div className="workspace">{sharedToast}<div className="content-grid"><SearchPanel spots={spots} onBook={(place) => setBookingPlace(place ?? spots[0] ?? null)} /><CityMap spots={spots} onBook={(place) => setBookingPlace(place ?? spots[0] ?? null)} /></div><BookingTimerCard activeBooking={activeBooking} onOpen={() => setBookingPlace(spots.find((spot) => spot.id === activeBooking?.spotId) ?? spots[0] ?? null)} /></div></div>{layoutModals}</main>;
}
