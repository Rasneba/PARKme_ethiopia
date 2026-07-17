"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { MapLibreHandle } from "./MapLibreMap";
import { Icon, type IconName } from "./Icon";
import { SearchPanel, type ApiSpot } from "./SearchPanel";
import { formatDistance, formatDuration, greetByHour } from "@/lib/format";

const MapLibreMap = dynamic(() => import("./MapLibreMap"), { ssr: false });

type User = { id: string; email: string; name: string; isHost?: boolean };
type Booking = { id: string; reference: string; status: string; parkingDate: string; startAt: string; endAt: string; durationHours: number; spaceLabel: string; paymentMethod: string; amountEtb: number; gateCode: string; checkInAt: string | null; createdAt: string; spotId: number; spotName: string; spotAddress: string };
type WalletTx = { id: string; reference: string; type: string; amountEtb: number; provider: string | null; note: string; createdAt: string };

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDate(d: Date) { return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }); }
function formatTime(d: Date) { return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }); }

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return <div className={`avatar avatar-${size}`} aria-label={`${name} profile`}>{initials}</div>;
}

function FlagRibbon() { return <div className="flag-ribbon" aria-hidden="true"><i /><i /><i /></div>; }
function StatusDot({ text, color = "green" }: { text: string; color?: "green" | "yellow" }) { return <span className={`status-dot ${color}`}><i />{text}</span>; }

function AuthModal({ onClose, onAuth, initialRole = "driver" }: { onClose: () => void; onAuth: (u: User) => void; initialRole?: "driver" | "host" }) {
  const [role, setRole] = useState<"driver" | "host">(initialRole);
  const [mode, setMode] = useState<"choose" | "login" | "signup">("choose");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function pickRole(r: "driver" | "host") {
    setRole(r);
    setMode("login");
  }

  async function submit() {
    setLoading(true); setError("");
    try {
      const url = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const body = mode === "login"
        ? { email, password, role }
        : { name, email, password, role };
      const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = (await r.json()) as { user?: User; error?: string };
      if (!r.ok || !data.user) throw new Error(data.error ?? "Failed");
      onAuth(data.user);
      onClose();
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }

  const isDriver = role === "driver";

  if (mode === "choose") {
    return (
      <div className="overlay" role="dialog" aria-modal="true">
        <div className="booking-modal auth-modal">
          <button className="modal-close" onClick={onClose} aria-label="Close"><Icon name="close" size={21} /></button>
          <div className="modal-heading"><span className="modal-icon"><Icon name="shield" size={22} /></span><div><p className="eyebrow">WELCOME TO PARKME</p><h2>How will you use Parkme?</h2></div></div>
          <div className="auth-role-grid">
            <button className="auth-role-card" onClick={() => pickRole("driver")}>
              <span className="auth-role-emoji">ðŸš—</span>
              <b>I&apos;m a Driver</b>
              <small>Find &amp; reserve parking spots</small>
            </button>
            <button className="auth-role-card auth-role-gold" onClick={() => pickRole("host")}>
              <span className="auth-role-emoji">ðŸ </span>
              <b>I&apos;m a Host</b>
              <small>List your space &amp; earn money</small>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true">
      <div className="booking-modal auth-modal">
        <button className="modal-close" onClick={onClose} aria-label="Close"><Icon name="close" size={21} /></button>
        <button className="auth-back" onClick={() => { setMode("choose"); setError(""); }}><Icon name="arrow" size={16} /> Back</button>
        <div className="modal-heading">
          <span className={`modal-icon ${isDriver ? "" : "modal-icon-gold"}`}><Icon name={isDriver ? "car" : "building"} size={22} /></span>
          <div>
            <p className="eyebrow">{mode === "login" ? "WELCOME BACK" : "CREATE ACCOUNT"} Â· {isDriver ? "DRIVER" : "HOST"}</p>
            <h2>{mode === "login" ? "Log in to Parkme" : "Sign up for Parkme"}</h2>
          </div>
        </div>
        {mode === "signup" && <div className="auth-field"><label>Name</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" /></div>}
        <div className="auth-field"><label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></div>
        <div className="auth-field"><label>Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" /></div>
        {error && <p className="booking-error" role="alert">{error}</p>}
        <button className={`confirm-booking ${isDriver ? "" : "btn-gold"}`} disabled={loading} onClick={() => void submit()}>{loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"} <Icon name="arrow" size={18} /></button>
        <p className="auth-toggle">{mode === "login" ? "Don't have an account?" : "Already have an account?"} <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}>{mode === "login" ? "Sign up" : "Log in"}</button></p>
      </div>
    </div>
  );
}

function BookingTimerCard({ booking, onOpen }: { booking: Booking; onOpen: () => void }) {
  const [elapsed, setElapsed] = useState(() => Math.max(0, Math.floor((Date.now() - new Date(booking.startAt).getTime()) / 1000)));
  const [gateOpen, setGateOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => { const i = window.setInterval(() => setElapsed((v) => v + 1), 1000); return () => window.clearInterval(i); }, []);
  const h = String(Math.floor(elapsed / 3600)).padStart(2, "0");
  const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
  const s = String(elapsed % 60).padStart(2, "0");
  const time = `${h}:${m}:${s}`;
  const active = booking.status === "active" || booking.status === "confirmed";

  return (
    <section className="active-pass-card">
      <FlagRibbon />
      <span className="ticket-notch notch-left" /><span className="ticket-notch notch-right" />
      <div className="pass-kicker"><span className="pulse" /> {active ? "ACTIVE PARKING" : "BOOKING"}</div>
      <div className="pass-title-row">
        <div><h2>{booking.spotName}</h2><p>{booking.spaceLabel}</p></div>
        <div className="parking-mark">P</div>
      </div>
      <div className="timer-display"><span>{time}</span><small>elapsed</small></div>
      <div className="pass-divider" />
      <button className={`gate-code ${gateOpen ? "revealed" : ""}`} onClick={() => setGateOpen(!gateOpen)}>
        <span className="gate-lock"><Icon name={gateOpen ? "check" : "lock"} size={16} /></span>
        <span>{gateOpen ? `Gate code: ${booking.gateCode.split("").join(" ")}` : "Tap to reveal gate code"}</span>
        <Icon name={gateOpen ? "copy" : "chevron"} size={16} />
      </button>
      {gateOpen && <button className="copy-gate-btn" onClick={() => { navigator.clipboard.writeText(booking.gateCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }}><Icon name="copy" size={14} /> {copied ? "Copied!" : "Copy code"}</button>}
      {active && <button className="extend-btn" onClick={() => { if (confirm("Extend this booking by 1 hour?")) fetch(`/api/bookings/${booking.id}/extend`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ addHours: 1 }) }).then(() => onOpen()); }}><Icon name="clock" size={15} /> Extend by 1 hour</button>}
      <button className="pass-details" onClick={onOpen}>View parking pass <Icon name="arrow" size={16} /></button>
    </section>
  );
}

function CityMap({
  spots,
  onSelectSpot,
  onBook,
  selectedSpotId,
  onNearMe,
  onGps,
  satellite,
  onToggleSatellite,
  userLocation,
  mapRef,
  onCancel,
  onRouteData,
}: {
  spots: ApiSpot[];
  onSelectSpot: (s: ApiSpot) => void;
  onBook: (s: ApiSpot) => void;
  selectedSpotId: number | null;
  onNearMe: () => void;
  onGps: () => void;
  satellite: boolean;
  onToggleSatellite: () => void;
  userLocation?: { lat: number; lng: number } | null;
  mapRef: React.MutableRefObject<MapLibreHandle | null>;
  onCancel: () => void;
  onRouteData?: (data: { distance: number; time: number; instructions: any[] } | null) => void;
}) {
  const selected = spots.find((s) => s.id === selectedSpotId);
  return (
    <section className="map-column" aria-label="Map of parking spots">
      <div className="map-toolbar">
        <span className="map-toolbar-count"><Icon name="map" size={15} /> {spots.length} spot{spots.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="map-float-controls">
        <button className="map-float-btn gps" title="My location" onClick={onGps}>
          <Icon name="locate" size={16} /> GPS
        </button>
        <button className="map-float-btn near" title="Find nearest spot" onClick={onNearMe}>
          <Icon name="pin" size={16} /> Near me
        </button>
        <button className={`map-float-btn sat ${satellite ? "active" : ""}`} title="Toggle satellite view" onClick={onToggleSatellite}>
          <Icon name={satellite ? "map" : "home"} size={16} /> {satellite ? "Map" : "Satellite"}
        </button>
      </div>
      <MapLibreMap
        spots={spots}
        onSelectSpot={onSelectSpot}
        onBookSpot={onBook}
        selectedSpotId={selectedSpotId}
        satellite={satellite}
        userLocation={userLocation}
        mapRef={mapRef}
        onRouteData={onRouteData}
      />
      {selected && (
        <div className="map-spot-sheet">
          <div className="map-sheet-kicker">
            <span>SELECTED SPOT</span>
            <button className="map-sheet-close" onClick={() => { (window as any).__parkmeClearRoute?.(); onCancel(); }} title="Cancel and pick a new spot">
              <Icon name="close" size={14} />
            </button>
          </div>
          <div className="map-sheet-row">
            <div className="map-sheet-info">
              <b>{selected.name}</b>
              <p>{selected.address}</p>
            </div>
            <div className="map-sheet-price">
              <b>{selected.price} <small>ETB/hr</small></b>
              <span>{selected.distanceKm != null ? `${formatDistance(selected.distanceKm)} away` : `${selected.availableSpots} spots`}</span>
            </div>
          </div>
          <div className="map-sheet-actions">
            <button className="map-sheet-btn directions" onClick={() => {
              (window as any).__parkmeRoute?.(selected.lat, selected.lng);
            }}>
              <Icon name="nav" size={15} /> Directions
            </button>
            <button className="map-sheet-btn reserve" onClick={() => onBook(selected)}>
              <Icon name="car" size={15} /> Reserve now
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function BookingsView({ onBook }: { onBook: () => void }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/bookings").then((r) => r.ok ? r.json() : { bookings: [] }).then((d) => { setBookings(d.bookings ?? []); setLoading(false); }).catch(() => setLoading(false)); }, []);
  const active = bookings.filter((b) => b.status === "active" || b.status === "confirmed");
  const upcoming = bookings.filter((b) => b.status === "confirmed" && new Date(b.startAt) > new Date());

  if (loading) return <div className="view-loading"><Icon name="clock" size={24} /><p>Loading your bookings...</p></div>;

  return (
    <section className="view-panel">
      <div className="view-header"><h2>My Bookings</h2><button className="add-space" onClick={onBook}><Icon name="plus" size={16} /> New booking</button></div>
      {active.length > 0 && <div className="view-section"><h3>Active Now</h3>{active.map((b) => (
        <div className="booking-row" key={b.id}><span className="booking-status active"><Icon name="car" size={16} /></span><div><b>{b.spotName}</b><small>{b.spaceLabel} Â· {b.durationHours}h Â· {b.amountEtb} ETB</small></div><StatusDot text={b.status} /></div>
      ))}</div>}
      {upcoming.length > 0 && <div className="view-section"><h3>Upcoming</h3>{upcoming.map((b) => (
        <div className="booking-row" key={b.id}><span className="booking-status upcoming"><Icon name="calendar" size={16} /></span><div><b>{b.spotName}</b><small>{formatDate(new Date(b.startAt))} Â· {formatTime(new Date(b.startAt))} Â· {b.amountEtb} ETB</small></div><span className="booking-ref">{b.reference}</span></div>
      ))}</div>}
      {bookings.length === 0 && <div className="empty-view"><Icon name="receipt" size={40} /><h3>No bookings yet</h3><p>Find and reserve a parking spot to get started.</p><button className="confirm-booking" onClick={onBook}>Find a spot <Icon name="arrow" size={16} /></button></div>}
    </section>
  );
}

function WalletView() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [depositAmount, setDepositAmount] = useState(0);

  function loadWallet() { fetch("/api/wallet").then((r) => r.ok ? r.json() : null).then((d) => { if (d) { setBalance(d.balanceEtb); setTransactions(d.transactions ?? []); } setLoading(false); }).catch(() => setLoading(false)); }
  useEffect(() => { loadWallet(); }, []);

  async function addFunds(amount: number) {
    setAdding(true);
    try {
      const r = await fetch("/api/wallet", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amountEtb: amount, provider: "telebirr" }) });
      const d = (await r.json()) as { balanceEtb?: number };
      if (r.ok && typeof d.balanceEtb === "number") { setBalance(d.balanceEtb); setDepositAmount(0); loadWallet(); }
    } finally { setAdding(false); }
  }

  if (loading) return <div className="view-loading"><Icon name="clock" size={24} /><p>Loading wallet...</p></div>;

  return (
    <section className="view-panel">
      <div className="view-header"><h2>ParkmeWallet</h2></div>
      <section className="wallet-card">
        <FlagRibbon /><span>PARKMEWALLET BALANCE</span>
        <h3>{balance.toLocaleString()} <small>ETB</small></h3>
        <p><i /> Ready to park anywhere</p>
        <button onClick={() => setDepositAmount(depositAmount > 0 ? 0 : 100)}><Icon name="plus" size={17} /> Add money</button>
      </section>
      {depositAmount > 0 && <div className="deposit-sheet"><p>Choose amount</p><div>{[50, 100, 250, 500].map((a) => <button key={a} disabled={adding} onClick={() => void addFunds(a)}>{adding ? "Adding..." : `+${a} ETB`}</button>)}</div></div>}
      <section className="view-section"><h3>Recent Activity</h3>
        {transactions.map((tx) => (
          <div className="activity-row" key={tx.id}>
            <span className={`activity-icon ${tx.amountEtb > 0 ? "green" : "yellow"}`}><Icon name={tx.amountEtb > 0 ? "plus" : "car"} size={17} /></span>
            <div><b>{tx.note}</b><small>{formatDate(new Date(tx.createdAt))} Â· {tx.provider ?? ""}</small></div>
            <strong className={tx.amountEtb > 0 ? "positive" : ""}>{tx.amountEtb > 0 ? "+" : ""}{tx.amountEtb} ETB</strong>
          </div>
        ))}
        {transactions.length === 0 && <p className="empty-state">No transactions yet.</p>}
      </section>
    </section>
  );
}

function HistoryView() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/bookings").then((r) => r.ok ? r.json() : { bookings: [] }).then((d) => { setBookings(d.bookings ?? []); setLoading(false); }).catch(() => setLoading(false)); }, []);
  const past = bookings.filter((b) => b.status === "completed" || b.status === "active" || b.checkInAt);

  if (loading) return <div className="view-loading"><Icon name="clock" size={24} /><p>Loading history...</p></div>;

  return (
    <section className="view-panel">
      <div className="view-header"><h2>Parking History</h2></div>
      {past.length > 0 ? past.map((b) => (
        <div className="booking-row history-row" key={b.id}>
          <span className="booking-date"><b>{new Date(b.createdAt).getDate()}</b><small>{new Date(b.createdAt).toLocaleDateString("en-US", { month: "short" })}</small></span>
          <div><b>{b.spotName}</b><small>{b.durationHours}h Â· {b.amountEtb} ETB Â· {b.reference}</small></div>
          <span className={`history-status ${b.status}`}>{b.status}</span>
        </div>
      )) : <div className="empty-view"><Icon name="receipt" size={40} /><h3>No history yet</h3><p>Your past parking sessions will appear here.</p></div>}
    </section>
  );
}

function BookingModal({ spot, onClose, onBooked, user }: { spot: ApiSpot; onClose: () => void; onBooked: () => void; user: User | null }) {
  const [duration, setDuration] = useState(2);
  const [payment, setPayment] = useState("wallet");
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [complete, setComplete] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookingGateCode, setBookingGateCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const total = duration * spot.price - (couponApplied ? 20 : 0);

  async function confirmBooking() {
    if (!user) { setError("Please log in to book."); return; }
    setSubmitting(true); setError("");
    try {
      const r = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ parkingSpaceId: spot.id, durationHours: duration, paymentMethod: payment, couponCode: couponApplied ? coupon : undefined }) });
      const d = (await r.json()) as { booking?: { id: string; gateCode: string }; error?: string };
      if (!r.ok || !d.booking) throw new Error(d.error ?? "Booking failed.");
      setBookingId(d.booking.id);
      setBookingGateCode(d.booking.gateCode);
      setComplete(true);
    } catch (e) { setError(e instanceof Error ? e.message : "Booking failed."); }
    finally { setSubmitting(false); }
  }

  async function checkIn() {
    if (!bookingId) { setScanned(true); return; }
    const r = await fetch(`/api/bookings/${bookingId}/check-in`, { method: "POST" });
    if (r.ok) setScanned(true);
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Reserve your parking space">
      <div className={`booking-modal ${complete ? "ticket-complete" : ""}`}>
        <button className="modal-close" onClick={onClose} aria-label="Close"><Icon name="close" size={21} /></button>
        {!complete ? <>
          <div className="modal-heading"><span className="modal-icon"><Icon name="car" size={22} /></span><div><p className="eyebrow">RESERVE A SPACE</p><h2>Book your parking</h2></div></div>
          <div className="booking-place"><div className="booking-map-mini"><Icon name="pin" size={20} /><i /></div><div><h3>{spot.name}</h3><p>{spot.address}</p><StatusDot text={`${spot.availableSpots} spaces available`} /></div><b>{spot.price}<small> ETB/hr</small></b></div>
          <section className="booking-section"><div className="section-title"><span><Icon name="clock" size={18} /> How long?</span><b>{duration} {duration === 1 ? "hour" : "hours"}</b></div><input className="duration-range" type="range" min="1" max="8" value={duration} onChange={(e) => setDuration(Number(e.target.value))} style={{ "--range-progress": `${((duration - 1) / 7) * 100}%` } as React.CSSProperties} /><div className="range-labels"><span>1 hr</span><span>4 hrs</span><span>8 hrs</span></div><div className="duration-presets">{[1, 2, 3, 4].map((h) => <button key={h} className={duration === h ? "active" : ""} onClick={() => setDuration(h)}>{h}h</button>)}</div></section>
          <section className="booking-section"><div className="section-title"><span><Icon name="wallet" size={18} /> Payment</span></div><div className="payment-options"><button className={payment === "wallet" ? "selected" : ""} onClick={() => setPayment("wallet")}><span className="payment-symbol wallet-symbol"><Icon name="wallet" size={17} /></span><span>ParkmeWallet</span><i className="radio" /></button><button className={payment === "telebirr" ? "selected" : ""} onClick={() => setPayment("telebirr")}><span className="payment-symbol telebirr-symbol">t</span><span>telebirr</span><i className="radio" /></button></div></section>
          <section className="coupon-row"><Icon name="sparkle" size={17} /><input value={coupon} onChange={(e) => { setCoupon(e.target.value); setCouponApplied(false); }} placeholder="Promo code (try PARKME20)" /><button onClick={() => coupon.trim().toUpperCase() === "PARKME20" && setCouponApplied(true)}>{couponApplied ? "Applied!" : "Apply"}</button></section>
          {couponApplied && <p className="coupon-success"><Icon name="check" size={15} /> PARKME20 saved you 20 ETB</p>}
          <div className="booking-total"><span>Total due</span><b>{total} <small>ETB</small></b></div>
          {error && <p className="booking-error" role="alert">{error}</p>}
          <button className="confirm-booking" disabled={submitting} onClick={() => void confirmBooking()}>{submitting ? "Confirming..." : `Confirm & pay ${total} ETB`} <Icon name="arrow" size={18} /></button>
          <p className="secure-note"><Icon name="shield" size={15} /> Secured by Parkme payments</p>
        </> : <>
          <div className="ticket-celebration"><span><Icon name="sparkle" size={20} /></span><div><p>YOU&apos;RE ALL SET!</p><h2>Parking confirmed</h2></div></div>
          <div className="digital-ticket"><FlagRibbon /><span className="ticket-notch ticket-left" /><span className="ticket-notch ticket-right" /><div className="ticket-topline"><span>PARKME PARKING PASS</span><StatusDot text="Valid today" /></div><h3>{spot.name}</h3><p>{spot.address}</p><div className="ticket-dates"><div><small>ARRIVAL</small><b>{formatTime(new Date())}</b><span>{formatDate(new Date())}</span></div><div><small>DURATION</small><b>{duration} hours</b></div><div><small>SPACE</small><b>{bookingGateCode ? `${bookingGateCode.slice(0, 2)} Â· ${bookingGateCode.slice(2)}` : "B Â· 27"}</b></div></div><div className="ticket-line" /><div className="qr-area"><button className={`qr-code ${scanned ? "scanned" : ""}`} onClick={() => void checkIn()} aria-label="Check in"><span className="qr-corner top-left" /><span className="qr-corner top-right" /><span className="qr-corner bottom-left" /><span className="qr-corner bottom-right" /><i /><i /><i /><i /><i /><i /></button><div><p>{scanned ? "Checked in!" : "CHECK IN AT GATE"}</p><b>{scanned ? `Welcome! Code: ${bookingGateCode}` : "Scan your ticket"}</b><button className="scan-button" onClick={() => void checkIn()}><Icon name="scan" size={16} /> {scanned ? "Done" : "Open scanner"}</button></div></div></div>
          <button className="confirm-booking" onClick={() => { onBooked(); onClose(); }}>Done <Icon name="arrow" size={18} /></button>
        </>}
      </div>
    </div>
  );
}

function ProfileDrawer({ user, onClose, onOwner, onLogout }: { user: User; onClose: () => void; onOwner: () => void; onLogout: () => void }) {
  const [tab, setTab] = useState<"wallet" | "passes">("wallet");

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    onLogout();
    onClose();
  }

  return (
    <div className="drawer-overlay" role="dialog" aria-modal="true">
      <aside className="profile-drawer">
        <div className="drawer-header"><div><p className="eyebrow">YOUR PARKME</p><h2>Account & parking</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><Icon name="close" size={21} /></button></div>
        <div className="profile-identity"><Avatar name={user.name} /><div><h3>{user.name}</h3><p>{user.email}</p></div><span className="verified"><Icon name="check" size={13} /></span></div>
        <div className="profile-tabs"><button className={tab === "wallet" ? "active" : ""} onClick={() => setTab("wallet")}>Wallet</button><button className={tab === "passes" ? "active" : ""} onClick={() => setTab("passes")}>Passes</button></div>
        {tab === "wallet" && <div className="drawer-content"><WalletView /></div>}
        {tab === "passes" && <div className="drawer-content"><BookingsView onBook={() => {}} /></div>}
        <div className="drawer-footer">
          <button onClick={onOwner}><Icon name="building" size={18} /> Host dashboard</button>
          <button><Icon name="settings" size={18} /> Settings</button>
          <button><Icon name="help" size={18} /> Help centre</button>
          <button className="sign-out" onClick={() => void handleLogout()}><Icon name="logout" size={18} /> Sign out</button>
        </div>
      </aside>
    </div>
  );
}

export default function ParkmeApp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authOpen, setAuthOpen] = useState<false | "driver" | "host">(false);
  const [view, setView] = useState<"spots" | "bookings" | "wallet" | "history">("spots");
  const [bookingSpot, setBookingSpot] = useState<ApiSpot | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [spots, setSpots] = useState<ApiSpot[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [spotsLoading, setSpotsLoading] = useState(true);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [selectedSpotId, setSelectedSpotId] = useState<number | null>(null);
  const [satellite, setSatellite] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [routeActive, setRouteActive] = useState(false);
  const [routeData, setRouteData] = useState<{ distance: number; time: number; instructions: any[] } | null>(null);
  const [pendingRouteSpot, setPendingRouteSpot] = useState<ApiSpot | null>(null);
  const pendingRouteSpotRef = useRef<ApiSpot | null>(null);
  const [locationStatus, setLocationStatus] = useState<"loading" | "granted" | "denied" | "unavailable">("loading");
  const [locationError, setLocationError] = useState<string | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const mapHandleRef = useRef<MapLibreHandle | null>(null);
  const didLocate = useRef(false);

  useEffect(() => {
    if (didLocate.current) return;
    didLocate.current = true;
    handleLocate();
  }, [handleLocate]);

  const fetchSpots = useCallback((q: string, cat: string = "all") => {
    setSpotsLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (cat && cat !== "all") params.set("category", cat);
    const qs = params.toString();
    fetch(`/api/spots${qs ? "?" + qs : ""}`).then((r) => r.ok ? r.json() : { spots: [] }).then((d) => { setSpots(d.spots ?? []); setSpotsLoading(false); }).catch(() => setSpotsLoading(false));
  }, []);

  const onSearch = useCallback((q: string) => {
    setSearchQuery(q);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchSpots(q, activeCategory), 300);
  }, [fetchSpots, activeCategory]);

  const onCategoryChange = useCallback((cat: string) => {
    setActiveCategory(cat);
    fetchSpots(searchQuery, cat);
  }, [fetchSpots, searchQuery]);

  useEffect(() => { fetchSpots(""); }, [fetchSpots]);

  // Deep-link from /find: ?spot=ID[&route=1]
  useEffect(() => {
    const spotParam = searchParams.get("spot");
    if (!spotParam || spots.length === 0) return;
    const id = Number(spotParam);
    const spot = spots.find((s) => s.id === id);
    if (!spot) return;
    setSelectedSpotId(id);
    if (searchParams.get("route") === "1") {
      handleDirections(spot);
    }
    window.history.replaceState({}, "", "/app");
  }, [spots, searchParams, handleDirections]);
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : { user: null })
      .then((d) => {
        if (d.user) { setUser(d.user); return; }
        const params = new URLSearchParams(window.location.search);
        const r = params.get("role");
        if (r === "driver" || r === "host") { setAuthOpen(r); window.history.replaceState({}, "", "/app"); }
      })
      .catch(() => {})
      .finally(() => setAuthChecked(true));
  }, []);
  useEffect(() => { if (user) fetch("/api/bookings?status=active").then((r) => r.ok ? r.json() : { bookings: [] }).then((d) => { const b = (d.bookings ?? [])[0]; if (b) setActiveBooking(b); }).catch(() => {}); }, [user]);

  useEffect(() => {
    // Restore last known location from cache so we don't re-prompt every load
    try {
      const raw = localStorage.getItem("parkme_loc");
      if (raw) {
        const cached = JSON.parse(raw);
        if (cached && typeof cached.lat === "number" && typeof cached.lng === "number") {
          setUserLocation({ lat: cached.lat, lng: cached.lng });
          setLocationStatus("granted");
        }
      }
    } catch {}
    if (!navigator.geolocation) { setLocationStatus("unavailable"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        saveLocation(loc);
        setLocationStatus("granted");
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setLocationStatus("denied");
        else if (err.code === err.POSITION_UNAVAILABLE) setLocationStatus("unavailable");
        else setLocationStatus("denied");
      },
      { timeout: 5000, enableHighAccuracy: true, maximumAge: 60000 },
    );
  }, []);

  const spotsWithDistance = useMemo(() => {
    const enriched = spots.map((s) => ({
      ...s,
      distanceKm: userLocation ? haversineKm(userLocation.lat, userLocation.lng, s.lat, s.lng) : undefined,
    }));
    enriched.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    return enriched;
  }, [spots, userLocation]);

  function handleNearMe() {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Location is not available on this device.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        saveLocation(loc);
        setLocationStatus("granted");
        const nearest = [...spots].sort((a, b) =>
          haversineKm(pos.coords.latitude, pos.coords.longitude, a.lat, a.lng) -
          haversineKm(pos.coords.latitude, pos.coords.longitude, b.lat, b.lng)
        );
        if (nearest.length > 0) {
          setSelectedSpotId(nearest[0].id);
          handleDirections(nearest[0]);
        }
      },
      (err) => {
        let msg = "Could not get your location.";
        if (err.code === err.PERMISSION_DENIED) {
          msg = "Location permission denied. Please enable location in your browser settings.";
          setLocationStatus("denied");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = "Location unavailable. Showing closest spot to city center.";
        }
        const fallback = [...spots].sort((a, b) =>
          haversineKm(9.0218, 38.7575, a.lat, a.lng) -
          haversineKm(9.0218, 38.7575, b.lat, b.lng)
        );
        if (fallback.length > 0) setSelectedSpotId(fallback[0].id);
        setLocationError(msg);
        setTimeout(() => setLocationError(null), 5000);
      },
      { timeout: 8000, enableHighAccuracy: true, maximumAge: 0 },
    );
  }

  function saveLocation(loc: { lat: number; lng: number }) {
    try { localStorage.setItem("parkme_loc", JSON.stringify({ ...loc, t: Date.now() })); } catch {}
  }

  function handleLocate() {
    try {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          saveLocation(loc);
          setLocationStatus("granted");
          mapHandleRef.current?.flyToNearest(loc.lat, loc.lng);
          const pending = pendingRouteSpotRef.current;
          if (pending) {
            pendingRouteSpotRef.current = null;
            setPendingRouteSpot(null);
            setTimeout(() => handleDirections(pending), 50);
          }
        },
        () => {},
        { timeout: 5000, enableHighAccuracy: true, maximumAge: 60000 },
      );
    } catch {}
  }


  function handleSelectSpot(spot: ApiSpot) {
    setSelectedSpotId(spot.id);
    setRouteActive(false);
    setRouteData(null);
  }

  function handleDirections(spot: ApiSpot) {
    setSelectedSpotId(spot.id);
    setRouteActive(true);
    setRouteData(null);
    if (!userLocation) {
      pendingRouteSpotRef.current = spot;
      setPendingRouteSpot(spot);
      handleLocate();
      return;
    }
    (window as any).__parkmeRoute?.(spot.lat, spot.lng);
  }

  const navItems = [
    { icon: "grid" as IconName, label: "Find a spot", view: "spots" as const, active: view === "spots" },
    { icon: "calendar" as IconName, label: "My bookings", view: "bookings" as const, active: view === "bookings" },
    { icon: "wallet" as IconName, label: "Wallet", view: "wallet" as const, active: view === "wallet" },
    { icon: "receipt" as IconName, label: "History", view: "history" as const, active: view === "history" },
  ];

  const [isMobile, setIsMobile] = useState(true);
  useEffect(() => {
    function check() { setIsMobile(window.innerWidth <= 860); }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!isMobile) {
    return (
      <main className="parkme-desktop-redirect">
        <div className="desktop-redirect-card">
          <div className="desktop-redirect-flag"><i /><i /><i /></div>
          <div className="desktop-redirect-logo"><span className="logo-mark">P</span><div className="logo-text"><b>Park</b><span>me</span></div></div>
          <h2>Parkme works best on your phone</h2>
          <p>Scan the QR code or tap below to open the app on your mobile device.</p>
          <a href="/" className="btn btn-primary btn-lg">Go to home page</a>
        </div>
      </main>
    );
  }

  return (
    <main className="parkme-shell parkme-mobile">
      <div className="app-content">
        <div className="mobile-topbar">
          <button className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Menu"><Icon name="menu" size={22} /></button>
          <div className="mobile-brand"><span>Park</span><b>me</b></div>
          <div style={{ flex: 1 }} />
          {user ? (
            <button className="mobile-profile" onClick={() => setProfileOpen(true)}><Avatar name={user.name} size="sm" /></button>
          ) : (
            <button className="mobile-profile" onClick={() => setAuthOpen("driver")}>Log in</button>
          )}
        </div>

        <div className="mobile-sidebar-overlay" style={{ display: menuOpen ? "block" : "none" }} onClick={() => setMenuOpen(false)} />
        <aside className={`mobile-sidebar ${menuOpen ? "open" : ""}`}>
          <div className="mobile-sidebar-head">
            <div className="mobile-brand"><span>Park</span><b>me</b></div>
            <button onClick={() => setMenuOpen(false)} aria-label="Close"><Icon name="close" size={20} /></button>
          </div>
          {user ? (
            <div className="mobile-sidebar-user"><Avatar name={user.name} size="sm" /><div><b>{user.name}</b><small>{user.email}</small></div></div>
          ) : (
            <button className="mobile-sidebar-login" onClick={() => { setMenuOpen(false); setAuthOpen("driver"); }}>Log in / Sign up</button>
          )}
          <nav className="mobile-sidebar-nav">
            {navItems.map((item) => (
              <button key={item.label} className={item.active ? "active" : ""} onClick={() => { setMenuOpen(false); setView(item.view); }}>
                <Icon name={item.icon} size={20} /><span>{item.label}</span>
                {item.label === "My bookings" && activeBooking && <i className="nav-count">1</i>}
              </button>
            ))}
            <button onClick={() => { setMenuOpen(false); router.push("/host"); }}><Icon name="building" size={20} /><span>Become a host</span></button>
          </nav>
          {user && (
            <div className="mobile-sidebar-footer">
              <button onClick={() => { setMenuOpen(false); setProfileOpen(true); }}><Icon name="settings" size={18} /><span>Profile & Wallet</span></button>
              <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); setUser(null); setMenuOpen(false); }}><Icon name="logout" size={18} /><span>Sign out</span></button>
            </div>
          )}
        </aside>

        <div className="workspace">
          {locationStatus === "denied" && (
            <div className="location-banner" role="alert">
              <Icon name="locate" size={18} />
              <div><b>Location access needed</b><p>Enable location in your browser settings to find the nearest parking spots.</p></div>
              <button className="location-banner-btn" onClick={() => {
                if ("geolocation" in navigator) {
                  navigator.geolocation.getCurrentPosition(
                    (pos) => { const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }; setUserLocation(loc); saveLocation(loc); setLocationStatus("granted"); },
                    () => {},
                    { timeout: 5000, enableHighAccuracy: true, maximumAge: 0 },
                  );
                }
              }}><Icon name="locate" size={15} /> Try again</button>
            </div>
          )}
          {locationError && (
            <div className="location-error-toast" onClick={() => setLocationError(null)}>
              <Icon name="locate" size={15} /> {locationError}
            </div>
          )}
          {view === "spots" && (
            <div className={`content-grid ${routeActive ? "route-active" : ""}`}>
              <CityMap spots={spotsWithDistance} onSelectSpot={(s) => handleSelectSpot(s)} onBook={(s) => { if (!user) { setAuthOpen("driver"); return; } setBookingSpot(s); }} selectedSpotId={selectedSpotId} onNearMe={handleNearMe} onGps={handleLocate} satellite={satellite} onToggleSatellite={() => setSatellite(!satellite)} userLocation={userLocation} mapRef={mapHandleRef} onCancel={() => { setSelectedSpotId(null); setRouteActive(false); setRouteData(null); (window as any).__parkmeClearRoute?.(); }} onRouteData={(d) => { if (d) setRouteData({ distance: d.distance / 1000, time: d.time, instructions: d.instructions }); else { setRouteData(null); setRouteActive(false); } }} />

              {selectedSpotId && (() => {
                const spot = spotsWithDistance.find((s) => s.id === selectedSpotId);
                if (!spot) return null;
                return (
                  <div className={`mobile-action-bar ${routeActive ? "route-mode" : ""}`}>
                    <div className="sheet-handle" />
                    {routeActive ? (
                      <div className="mobile-route-panel">
                        <div className="route-panel-header">
                          <div className="route-panel-info">
                            <b>Route to {spot.name}</b>
                            {routeData && <span>{formatDistance(routeData.distance)} &middot; {formatDuration(routeData.time)}</span>}
                          </div>
                          <button className="route-panel-close" onClick={() => { setRouteActive(false); setRouteData(null); (window as any).__parkmeClearRoute?.(); }}><Icon name="close" size={18} /></button>
                        </div>
                        <div className="route-steps">
                          {routeData?.instructions?.filter((ins: any) => ins.distance > 0 || ins.sign === 0).map((ins: any, i: number) => (
                            <div className="route-step" key={i}>
                              <span className="route-step-icon">{ins.sign === 0 ? "\u2192" : ins.sign < 0 ? "\u21BA" : "\u21BB"}</span>
                              <div><span>{ins.text}</span><small>{formatDistance((ins.distance || 0) / 1000)}</small></div>
                            </div>
                          ))}
                          {!routeData && <div className="route-loading">Calculating route...</div>}
                        </div>
                      </div>
                    ) : (
                      <div className="mobile-spot-bar">
                        <div className="mobile-spot-info">
                          <b>{spot.name}</b>
                          <span>{spot.price} ETB/hr &middot; {spot.distanceKm != null ? formatDistance(spot.distanceKm) : `${spot.availableSpots} spots`}</span>
                        </div>
                        <div className="mobile-spot-actions">
                          <button className="mobile-btn directions" onClick={() => handleDirections(spot)}><Icon name="nav" size={16} /> Directions</button>
                          <button className="mobile-btn reserve" onClick={() => { if (!user) { setAuthOpen("driver"); return; } setBookingSpot(spot); }}><Icon name="car" size={16} /> Reserve</button>
                        </div>
                        <button className="mobile-back-btn" onClick={() => { setSelectedSpotId(null); setRouteActive(false); setRouteData(null); (window as any).__parkmeClearRoute?.(); }}><Icon name="close" size={16} /> Back to map</button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
          {view === "bookings" && <BookingsView onBook={() => setView("spots")} />}
          {view === "wallet" && (user ? <WalletView /> : <div className="empty-view"><Icon name="lock" size={40} /><h3>Please log in</h3><p>You need an account to access your wallet.</p><button className="confirm-booking" onClick={() => setAuthOpen("driver")}>Log in <Icon name="arrow" size={16} /></button></div>)}
          {view === "history" && (user ? <HistoryView /> : <div className="empty-view"><Icon name="lock" size={40} /><h3>Please log in</h3><p>You need an account to view history.</p><button className="confirm-booking" onClick={() => setAuthOpen("driver")}>Log in <Icon name="arrow" size={16} /></button></div>)}
          {view === "spots" && activeBooking && user && <BookingTimerCard booking={activeBooking} onOpen={() => setBookingSpot(spots[0] ?? null)} />}
        </div>
      </div>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onAuth={(u) => setUser(u)} initialRole={authOpen} />}
      {bookingSpot && <BookingModal spot={bookingSpot} onClose={() => setBookingSpot(null)} onBooked={() => { fetchSpots(searchQuery); setActiveBooking(null); }} user={user} />}
      {profileOpen && user && <ProfileDrawer user={user} onClose={() => setProfileOpen(false)} onOwner={() => { setProfileOpen(false); setMenuOpen(false); router.push("/host"); }} onLogout={() => setUser(null)} />}
    </main>
  );
}
