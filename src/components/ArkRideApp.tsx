"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MapLibreHandle } from "./MapLibreMap";

const MapLibreMap = dynamic(() => import("./MapLibreMap"), { ssr: false });

type IconName =
  | "search" | "bell" | "calendar" | "clock" | "chevron" | "car" | "pin"
  | "star" | "filter" | "wallet" | "plus" | "arrow" | "close" | "check"
  | "lock" | "grid" | "home" | "receipt" | "help" | "settings" | "building"
  | "chart" | "edit" | "copy" | "scan" | "sparkle" | "shield" | "menu" | "logout"
  | "nav" | "map" | "locate";

function Icon({ name, size = 20, stroke = 1.8 }: { name: IconName; size?: number; stroke?: number }) {
  const shared = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
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
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>,
    nav: <><polygon points="3 11 22 2 13 21 11 13 3 11" /></>,
    map: <><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></>,
    locate: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /><circle cx="12" cy="12" r="8" /></>,
  };
  return <svg {...shared}>{paths[name]}</svg>;
}

type User = { id: string; email: string; name: string; isHost?: boolean };
type ApiSpot = { id: number; slug: string; name: string; address: string; neighborhood: string; label: string; tone: string; price: number; rating: string; availableSpots: number; totalSpots: number; spaces: string; hostName: string; lat: number; lng: number; distanceKm?: number };
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

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function formatDate(d: Date) { return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }); }
function formatTime(d: Date) { return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }); }
function greetByHour() { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; }

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return <div className={`avatar avatar-${size}`} aria-label={`${name} profile`}>{initials}</div>;
}

function FlagRibbon() { return <div className="flag-ribbon" aria-hidden="true"><i /><i /><i /></div>; }
function StatusDot({ text, color = "green" }: { text: string; color?: "green" | "yellow" }) { return <span className={`status-dot ${color}`}><i />{text}</span>; }

function AuthModal({ onClose, onAuth }: { onClose: () => void; onAuth: (u: User) => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true); setError("");
    try {
      const url = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const body = mode === "login" ? { email, password } : { name, email, password };
      const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = (await r.json()) as { user?: User; error?: string };
      if (!r.ok || !data.user) throw new Error(data.error ?? "Failed");
      onAuth(data.user);
      onClose();
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true">
      <div className="booking-modal auth-modal">
        <button className="modal-close" onClick={onClose} aria-label="Close"><Icon name="close" size={21} /></button>
        <div className="modal-heading"><span className="modal-icon"><Icon name="shield" size={22} /></span><div><p className="eyebrow">{mode === "login" ? "WELCOME BACK" : "CREATE ACCOUNT"}</p><h2>{mode === "login" ? "Log in to Parkme" : "Sign up for Parkme"}</h2></div></div>
        {mode === "signup" && <div className="auth-field"><label>Name</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" /></div>}
        <div className="auth-field"><label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></div>
        <div className="auth-field"><label>Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" /></div>
        {error && <p className="booking-error" role="alert">{error}</p>}
        <button className="confirm-booking" disabled={loading} onClick={() => void submit()}>{loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"} <Icon name="arrow" size={18} /></button>
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
      <button className="pass-details" onClick={onOpen}>View parking pass <Icon name="arrow" size={16} /></button>
    </section>
  );
}

function SearchPanel({ spots, loading, searchQuery, onSearch, onSelectSpot, onBook, totalCount, selectedSpotId, hasLocation }: { spots: ApiSpot[]; loading: boolean; searchQuery: string; onSearch: (q: string) => void; onSelectSpot: (s: ApiSpot) => void; onBook: (s: ApiSpot) => void; totalCount: number; selectedSpotId: number | null; hasLocation: boolean }) {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <section className="search-column">
      <div className="welcome-line"><p>{greetByHour()}</p><h1>Where are you parking today?</h1></div>
      <div className="search-box">
        <Icon name="search" size={20} />
        <input value={searchQuery} onChange={(e) => onSearch(e.target.value)} placeholder="Search by name, area, or address..." aria-label="Search parking location" />
        <button className="filter-button" aria-label="Open filters" onClick={() => setFilterOpen(!filterOpen)}><Icon name="filter" size={19} /></button>
        {filterOpen && <div className="filter-popover"><b>Filters</b><label><input type="checkbox" defaultChecked /> Available only</label><label><input type="checkbox" /> Covered</label><label><input type="checkbox" defaultChecked /> Under 50 ETB/hr</label></div>}
      </div>
      <div className="results-heading"><div><span className="eyebrow">{hasLocation ? "AVAILABLE NEARBY" : "ALL SPOTS"}</span><h2>{totalCount} spot{totalCount !== 1 ? "s" : ""} found{hasLocation ? " nearby" : ""}</h2></div></div>
      {loading ? <div className="loading-state">Searching...</div> : (
        <div className="place-list">
          {spots.map((spot) => (
            <article className={`place-card ${selectedSpotId === spot.id ? "selected" : ""}`} key={spot.id} onClick={() => onSelectSpot(spot)}>
              <div className={`place-image ${spot.tone}`}><span>{spot.label}</span><div className="car-shape"><Icon name="car" size={29} /></div></div>
              <div className="place-info">
                <div className="place-name-line"><h3>{spot.name}</h3><span className="rating"><Icon name="star" size={13} stroke={2.4} /> {spot.rating}</span></div>
                <p>{spot.address}</p>
                <div className="place-meta">
                  <span><Icon name="pin" size={14} />{spot.availableSpots} spots available</span>
                  {spot.distanceKm != null && <span className="place-distance"><Icon name="locate" size={13} /> {formatDistance(spot.distanceKm)}</span>}
                </div>
              </div>
              <div className="place-price">
                <b>{spot.price} <small>ETB</small></b>
                <span>/ hour</span>
                <div className="place-card-actions">
                  <button className="place-directions-btn" title="Get directions" onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`, "_blank"); }}>
                    <Icon name="nav" size={14} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onBook(spot); }}>Reserve</button>
                </div>
              </div>
            </article>
          ))}
          {spots.length === 0 && <p className="empty-state">No parking spots found nearby.</p>}
        </div>
      )}
    </section>
  );
}

function CityMap({
  spots,
  onSelectSpot,
  onBook,
  selectedSpotId,
  onNearMe,
  satellite,
  onToggleSatellite,
  userLocation,
  mapRef,
}: {
  spots: ApiSpot[];
  onSelectSpot: (s: ApiSpot) => void;
  onBook: (s: ApiSpot) => void;
  selectedSpotId: number | null;
  onNearMe: () => void;
  satellite: boolean;
  onToggleSatellite: () => void;
  userLocation?: { lat: number; lng: number } | null;
  mapRef: React.MutableRefObject<MapLibreHandle | null>;
}) {
  const selected = spots.find((s) => s.id === selectedSpotId);
  return (
    <section className="map-column" aria-label="Map of parking spots">
      <div className="map-toolbar">
        <span className="map-toolbar-count"><Icon name="map" size={15} /> {spots.length} spot{spots.length !== 1 ? "s" : ""}</span>
        <div className="map-toolbar-btns">
          <button className="map-toolbar-btn zoom-btn" title="Zoom in" onClick={() => mapRef.current?.zoomIn()}>
            <span className="map-btn-icon-wrap"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg></span>
          </button>
          <button className="map-toolbar-btn zoom-btn" title="Zoom out" onClick={() => mapRef.current?.zoomOut()}>
            <span className="map-btn-icon-wrap"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg></span>
          </button>
          <button className="map-toolbar-btn near-me-btn" title="Find nearest spot" onClick={onNearMe}>
            <span className="map-btn-icon-wrap near"><Icon name="locate" size={18} /></span> Near me
          </button>
          <button className={`map-toolbar-btn sat-btn ${satellite ? "active" : ""}`} title="Toggle satellite view" onClick={onToggleSatellite}>
            <span className={`map-btn-icon-wrap ${satellite ? "sat-on" : "sat-off"}`}><Icon name={satellite ? "map" : "home"} size={18} /></span> {satellite ? "Map" : "Satellite"}
          </button>
        </div>
      </div>
      <MapLibreMap
        spots={spots}
        onSelectSpot={onSelectSpot}
        onBookSpot={onBook}
        selectedSpotId={selectedSpotId}
        satellite={satellite}
        userLocation={userLocation}
        mapRef={mapRef}
      />
      {selected && (
        <div className="map-spot-sheet">
          <div className="map-sheet-kicker">SELECTED SPOT</div>
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
              window.open(`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`, "_blank");
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
        <div className="booking-row" key={b.id}><span className="booking-status active"><Icon name="car" size={16} /></span><div><b>{b.spotName}</b><small>{b.spaceLabel} · {b.durationHours}h · {b.amountEtb} ETB</small></div><StatusDot text={b.status} /></div>
      ))}</div>}
      {upcoming.length > 0 && <div className="view-section"><h3>Upcoming</h3>{upcoming.map((b) => (
        <div className="booking-row" key={b.id}><span className="booking-status upcoming"><Icon name="calendar" size={16} /></span><div><b>{b.spotName}</b><small>{formatDate(new Date(b.startAt))} · {formatTime(new Date(b.startAt))} · {b.amountEtb} ETB</small></div><span className="booking-ref">{b.reference}</span></div>
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
            <div><b>{tx.note}</b><small>{formatDate(new Date(tx.createdAt))} · {tx.provider ?? ""}</small></div>
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
          <div><b>{b.spotName}</b><small>{b.durationHours}h · {b.amountEtb} ETB · {b.reference}</small></div>
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
          <div className="digital-ticket"><FlagRibbon /><span className="ticket-notch ticket-left" /><span className="ticket-notch ticket-right" /><div className="ticket-topline"><span>PARKME PARKING PASS</span><StatusDot text="Valid today" /></div><h3>{spot.name}</h3><p>{spot.address}</p><div className="ticket-dates"><div><small>ARRIVAL</small><b>{formatTime(new Date())}</b><span>{formatDate(new Date())}</span></div><div><small>DURATION</small><b>{duration} hours</b></div><div><small>SPACE</small><b>{bookingGateCode ? `${bookingGateCode.slice(0, 2)} · ${bookingGateCode.slice(2)}` : "B · 27"}</b></div></div><div className="ticket-line" /><div className="qr-area"><button className={`qr-code ${scanned ? "scanned" : ""}`} onClick={() => void checkIn()} aria-label="Check in"><span className="qr-corner top-left" /><span className="qr-corner top-right" /><span className="qr-corner bottom-left" /><span className="qr-corner bottom-right" /><i /><i /><i /><i /><i /><i /></button><div><p>{scanned ? "Checked in!" : "CHECK IN AT GATE"}</p><b>{scanned ? `Welcome! Code: ${bookingGateCode}` : "Scan your ticket"}</b><button className="scan-button" onClick={() => void checkIn()}><Icon name="scan" size={16} /> {scanned ? "Done" : "Open scanner"}</button></div></div></div>
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

function OwnerPortal({ onClose }: { onClose: () => void }) {
  const [data, setData] = useState<{ summary: { totalEarningsEtb: number; hostPayoutEtb: number; platformFeeEtb: number; bookingCount: number; occupancyRate: number; averageRating: number }; spaces: { id: number; name: string; priceHourlyEtb: number; availableSpots: number; totalSpots: number; isActive: boolean }[]; weeklyEarnings: { day: string; amountEtb: number }[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch("/api/host/dashboard").then((r) => r.ok ? r.json() : null).then((d) => { setData(d); setLoading(false); }).catch(() => setLoading(false)); }, []);

  async function adjustPrice(id: number, change: number) {
    const spot = data?.spaces.find((s) => s.id === id);
    if (!spot) return;
    const next = Math.max(25, spot.priceHourlyEtb + change);
    const r = await fetch(`/api/host/spaces/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ priceHourlyEtb: next }) });
    if (r.ok) setData((prev) => prev ? { ...prev, spaces: prev.spaces.map((s) => s.id === id ? { ...s, priceHourlyEtb: next } : s) } : prev);
  }

  const maxChart = Math.max(...(data?.weeklyEarnings.map((d) => d.amountEtb) ?? [1]), 1);

  return (
    <div className="owner-overlay" role="dialog" aria-modal="true">
      <section className="owner-portal">
        <header className="owner-header">
          <div className="owner-logo"><span>Park</span><b>me</b><i>host</i></div>
          <div className="owner-nav"><button className="active">Overview</button><button>Spaces</button><button>Bookings</button></div>
          <button className="icon-button" onClick={onClose} aria-label="Close"><Icon name="close" size={20} /></button>
        </header>
        <main className="owner-main">
          {loading ? <div className="view-loading"><p>Loading dashboard...</p></div> : data && <>
            <div className="owner-intro"><div><p className="eyebrow">HOST PERFORMANCE</p><h1>Welcome to your host dashboard.</h1><p>Manage your parking spaces and track earnings.</p></div></div>
            <div className="owner-metrics">
              <article><span className="metric-icon green"><Icon name="wallet" size={20} /></span><p>Your payout (85%)</p><h2>{data.summary.hostPayoutEtb.toLocaleString()} <small>ETB</small></h2></article>
              <article><span className="metric-icon yellow"><Icon name="wallet" size={20} /></span><p>Platform fee (15%)</p><h2>{data.summary.platformFeeEtb.toLocaleString()} <small>ETB</small></h2></article>
              <article><span className="metric-icon red"><Icon name="calendar" size={20} /></span><p>Bookings</p><h2>{data.summary.bookingCount}</h2></article>
              <article><span className="metric-icon slate"><Icon name="star" size={20} /></span><p>Guest rating</p><h2>{data.summary.averageRating}</h2></article>
            </div>
            <div className="owner-grid">
              <section className="earnings-chart">
                <div className="panel-heading"><h2>Weekly earnings</h2></div>
                <div className="chart-bars">{data.weeklyEarnings.map((d) => (
                  <div className="chart-bar-col" key={d.day}><div className="chart-bar" style={{ height: `${(d.amountEtb / maxChart) * 100}%` }} /><span>{d.day}</span></div>
                ))}</div>
              </section>
              <section className="active-spaces">
                <div className="panel-heading"><h2>Your spaces</h2></div>
                {data.spaces.map((s) => (
                  <div className="owner-space-row" key={s.id}>
                    <span className="owner-space-photo">P</span>
                    <div><b>{s.name}</b><small>{s.availableSpots}/{s.totalSpots} spots · {s.priceHourlyEtb} ETB/hr</small></div>
                    <div className="space-controls">
                      <button onClick={() => void adjustPrice(s.id, -5)}>-</button>
                      <button onClick={() => void adjustPrice(s.id, 5)}>+</button>
                    </div>
                  </div>
                ))}
              </section>
            </div>
          </>}
        </main>
      </section>
    </div>
  );
}

export default function ParkmeApp() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [view, setView] = useState<"spots" | "bookings" | "wallet" | "history">("spots");
  const [bookingSpot, setBookingSpot] = useState<ApiSpot | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [ownerOpen, setOwnerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [spots, setSpots] = useState<ApiSpot[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [spotsLoading, setSpotsLoading] = useState(true);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [selectedSpotId, setSelectedSpotId] = useState<number | null>(null);
  const [satellite, setSatellite] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const mapHandleRef = useRef<MapLibreHandle | null>(null);

  const fetchSpots = useCallback((q: string) => {
    setSpotsLoading(true);
    const url = q ? `/api/spots?q=${encodeURIComponent(q)}` : "/api/spots";
    fetch(url).then((r) => r.ok ? r.json() : { spots: [] }).then((d) => { setSpots(d.spots ?? []); setSpotsLoading(false); }).catch(() => setSpotsLoading(false));
  }, []);

  useEffect(() => { fetchSpots(""); }, [fetchSpots]);
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : { user: null })
      .then((d) => { if (d.user) setUser(d.user); })
      .catch(() => {})
      .finally(() => setAuthChecked(true));
  }, []);
  useEffect(() => { if (user) fetch("/api/bookings?status=active").then((r) => r.ok ? r.json() : { bookings: [] }).then((d) => { const b = (d.bookings ?? [])[0]; if (b) setActiveBooking(b); }).catch(() => {}); }, [user]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { timeout: 5000, enableHighAccuracy: true },
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

  function onSearch(q: string) {
    setSearchQuery(q);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchSpots(q), 300);
  }

  function handleNearMe() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        const nearest = [...spots].sort((a, b) =>
          haversineKm(pos.coords.latitude, pos.coords.longitude, a.lat, a.lng) -
          haversineKm(pos.coords.latitude, pos.coords.longitude, b.lat, b.lng)
        );
        if (nearest.length > 0) setSelectedSpotId(nearest[0].id);
      },
      () => {},
      { timeout: 5000, enableHighAccuracy: true },
    );
  }

  function handleSelectSpot(spot: ApiSpot) {
    setSelectedSpotId(spot.id);
  }

  const navItems = [
    { icon: "grid" as IconName, label: "Find a spot", view: "spots" as const, active: view === "spots" },
    { icon: "calendar" as IconName, label: "My bookings", view: "bookings" as const, active: view === "bookings" },
    { icon: "wallet" as IconName, label: "Wallet", view: "wallet" as const, active: view === "wallet" },
    { icon: "receipt" as IconName, label: "History", view: "history" as const, active: view === "history" },
  ];

  return (
    <main className="parkme-shell">
      <aside className={`sidebar ${menuOpen ? "mobile-visible" : ""}`}>
        <a href="/" className="brand" style={{ textDecoration: "none" }}><div className="brand-mark"><span>Park</span><b>me</b></div><em>ethiopia</em></a>
        <button className="sidebar-close" onClick={() => setMenuOpen(false)}><Icon name="close" size={20} /></button>
        <nav>{navItems.map((item) => <button key={item.label} className={item.active ? "active" : ""} onClick={() => { setView(item.view); setMenuOpen(false); }}><Icon name={item.icon} size={20} /><span>{item.label}</span>{item.label === "My bookings" && activeBooking && <i className="nav-count">1</i>}</button>)}</nav>
        <div className="sidebar-bottom">
          {user ? (
            <>
              <button className="host-callout" onClick={() => setOwnerOpen(true)}><span><Icon name="building" size={20} /></span><div><b>List your space</b><small>Earn with Parkme</small></div><Icon name="chevron" size={16} /></button>
              <div className="side-user"><Avatar name={user.name} size="sm" /><div><b>{user.name}</b><small>{user.email}</small></div><button onClick={() => setProfileOpen(true)} aria-label="Open profile"><Icon name="chevron" size={16} /></button></div>
            </>
          ) : (
            <button className="host-callout" onClick={() => setAuthOpen(true)}><span><Icon name="shield" size={20} /></span><div><b>Log in / Sign up</b><small>Access your account</small></div><Icon name="chevron" size={16} /></button>
          )}
        </div>
      </aside>

      <div className="app-content">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Icon name="menu" size={22} /></button>
          <div className="mobile-brand"><span>Park</span><b>me</b></div>
          <div className="top-location"><Icon name="pin" size={18} /><span>Addis Ababa</span></div>
          <div className="top-actions">
            {user ? (
              <>
                <button className="top-profile" onClick={() => setProfileOpen(true)}><Avatar name={user.name} size="sm" /><span>{user.name.split(" ")[0]}</span><Icon name="chevron" size={15} /></button>
              </>
            ) : (
              <button className="top-profile" onClick={() => setAuthOpen(true)}>Log in</button>
            )}
          </div>
        </header>

        <div className="workspace">
          {view === "spots" && (
            <div className="content-grid">
              <SearchPanel spots={spotsWithDistance} loading={spotsLoading} searchQuery={searchQuery} onSearch={onSearch} onSelectSpot={(s) => handleSelectSpot(s)} onBook={(s) => { if (!user) { setAuthOpen(true); return; } setBookingSpot(s); }} totalCount={spotsWithDistance.length} selectedSpotId={selectedSpotId} hasLocation={!!userLocation} />
              <CityMap spots={spotsWithDistance} onSelectSpot={(s) => handleSelectSpot(s)} onBook={(s) => { if (!user) { setAuthOpen(true); return; } setBookingSpot(s); }} selectedSpotId={selectedSpotId} onNearMe={handleNearMe} satellite={satellite} onToggleSatellite={() => setSatellite(!satellite)} userLocation={userLocation} mapRef={mapHandleRef} />
            </div>
          )}
          {view === "bookings" && <BookingsView onBook={() => setView("spots")} />}
          {view === "wallet" && (user ? <WalletView /> : <div className="empty-view"><Icon name="lock" size={40} /><h3>Please log in</h3><p>You need an account to access your wallet.</p><button className="confirm-booking" onClick={() => setAuthOpen(true)}>Log in <Icon name="arrow" size={16} /></button></div>)}
          {view === "history" && (user ? <HistoryView /> : <div className="empty-view"><Icon name="lock" size={40} /><h3>Please log in</h3><p>You need an account to view history.</p><button className="confirm-booking" onClick={() => setAuthOpen(true)}>Log in <Icon name="arrow" size={16} /></button></div>)}

          {view === "spots" && activeBooking && user && <BookingTimerCard booking={activeBooking} onOpen={() => setBookingSpot(spots[0] ?? null)} />}
        </div>
      </div>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onAuth={(u) => setUser(u)} />}
      {bookingSpot && <BookingModal spot={bookingSpot} onClose={() => setBookingSpot(null)} onBooked={() => { fetchSpots(searchQuery); setActiveBooking(null); }} user={user} />}
      {profileOpen && user && <ProfileDrawer user={user} onClose={() => setProfileOpen(false)} onOwner={() => { setProfileOpen(false); setOwnerOpen(true); }} onLogout={() => setUser(null)} />}
      {ownerOpen && <OwnerPortal onClose={() => setOwnerOpen(false)} />}
    </main>
  );
}
