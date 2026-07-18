"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import ParkingLotGrid, { KAZANCHIS_LOT, ParkingSpot } from "@/components/ParkingLotGrid";

const COLORS = {
  green: "#0fa24b",
  greenDark: "#086a32",
  greenSoft: "#dcf8e4",
  yellow: "#f7c531",
  red: "#e54d3f",
  blue: "#4098df",
  ink: "#131614",
  bg: "#f5f6f5",
  card: "#ffffff",
  border: "#e4e6e4",
  muted: "#8a8f8c",
  redSoft: "#fde8e6",
};

type Section = "scanner" | "validation" | "spots" | "guide";

type Booking = {
  ref: string;
  customer: string;
  vehicle: string;
  plate: string;
  duration: string;
  payment: "paid" | "pending";
  time: string;
  status: "validated" | "pending" | "rejected";
  spot?: string;
};

const SAMPLE_BOOKINGS: Booking[] = [
  { ref: "PK-2026-001", customer: "Abebe Kebede", vehicle: "Toyota Corolla", plate: "AA-1234", duration: "2 hrs", payment: "paid", time: "10 min ago", status: "validated", spot: "A1" },
  { ref: "PK-2026-002", customer: "Hiwot Tesfaye", vehicle: "Hyundai i10", plate: "BB-5678", duration: "3 hrs", payment: "paid", time: "25 min ago", status: "validated", spot: "A3" },
  { ref: "PK-2026-003", customer: "Dawit Mulugeta", vehicle: "Nissan Note", plate: "CC-9012", duration: "1 hr", payment: "pending", time: "42 min ago", status: "pending", spot: "B1" },
  { ref: "PK-2026-004", customer: "Sara Ahmed", vehicle: "Suzuki Swift", plate: "DD-3456", duration: "4 hrs", payment: "paid", time: "1 hr ago", status: "validated", spot: "B4" },
  { ref: "PK-2026-005", customer: "Yonas Tadesse", vehicle: "Honda Fit", plate: "EE-7890", duration: "2 hrs", payment: "pending", time: "1.5 hrs ago", status: "pending", spot: "A5" },
];

const BOOKING_DB: Record<string, Booking> = Object.fromEntries(SAMPLE_BOOKINGS.map((b) => [b.ref, b]));

const NAV_ITEMS: { key: Section; icon: "scan" | "check" | "grid" | "nav"; label: string }[] = [
  { key: "scanner", icon: "scan", label: "QR Scanner" },
  { key: "validation", icon: "check", label: "Booking Validation" },
  { key: "spots", icon: "grid", label: "Spot Management" },
  { key: "guide", icon: "nav", label: "Driver Guide" },
];

export default function AttendantPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [section, setSection] = useState<Section>("scanner");
  const [isOnline, setIsOnline] = useState(true);
  const [recentScans] = useState<Booking[]>(SAMPLE_BOOKINGS);
  const [searchRef, setSearchRef] = useState("");
  const [foundBooking, setFoundBooking] = useState<Booking | null>(null);
  const [searchError, setSearchError] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("G");
  const [selectedZone, setSelectedZone] = useState("A");
  const [guideSpot, setGuideSpot] = useState<string | undefined>(undefined);
  const [showGuidance, setShowGuidance] = useState(false);
  const [guidedBooking, setGuidedBooking] = useState<Booking | null>(null);

  const lot = KAZANCHIS_LOT;

  function navigateTo(key: Section) {
    setSection(key);
    setSidebarOpen(false);
  }

  const handleSearch = () => {
    const q = searchRef.trim().toUpperCase();
    const match = BOOKING_DB[q];
    if (match) { setFoundBooking(match); setSearchError(""); }
    else { setFoundBooking(null); setSearchError("Booking not found. Check the reference number."); }
  };

  const handleValidate = () => {
    if (!foundBooking) return;
    setFoundBooking({ ...foundBooking, status: "validated", payment: "paid" });
  };

  const handleReject = () => {
    if (!foundBooking) return;
    setFoundBooking({ ...foundBooking, status: "rejected" });
  };

  const handleGuideDriver = (booking: Booking) => {
    if (booking.spot) {
      const zone = booking.spot.startsWith("A") ? "A" : "B";
      setSelectedZone(zone);
      setGuideSpot(booking.spot);
      setGuidedBooking(booking);
      setShowGuidance(true);
      setSection("guide");
    }
  };

  function countSpots(filter: (s: ParkingSpot) => boolean) {
    let count = 0;
    for (const floor of lot.floors) {
      for (const zone of lot.zones) {
        const grid = lot.floorMap[floor]?.[zone] || [];
        grid.forEach((row) => row.forEach((s) => { if (filter(s)) count++; }));
      }
    }
    return count;
  }

  const totalLotSpots = countSpots((s) => s.type !== "lane" && s.type !== "entrance" && s.type !== "exit" && !!s.id);
  const availableSpots = countSpots((s) => s.status === "available");
  const occupiedSpots = countSpots((s) => s.status === "occupied");

  return (
    <>
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: ${COLORS.bg}; color: ${COLORS.ink}; }
        .att-page { min-height: 100vh; display: flex; flex-direction: column; }
        .att-topbar { position: sticky; top: 0; z-index: 40; display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: ${COLORS.greenDark}; color: #fff; }
        .att-topbar h1 { font-size: 16px; font-weight: 700; letter-spacing: -0.3px; }
        .att-topbar-sub { font-size: 11px; opacity: 0.7; }
        .att-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 50; }
        .att-sidebar { position: fixed; top: 0; left: 0; bottom: 0; width: 280px; background: #fff; z-index: 60; transform: translateX(-100%); transition: transform 0.25s ease; display: flex; flex-direction: column; }
        .att-sidebar.open { transform: translateX(0); }
        .att-sidebar-stripe { position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #0fa24b 0 33%, #f7c531 33% 66%, #e54d3f 66%); }
        .att-sidebar-header { padding: 20px 16px 16px; border-bottom: 1px solid ${COLORS.border}; position: relative; }
        .att-sidebar-header h2 { font-size: 18px; font-weight: 700; color: ${COLORS.greenDark}; }
        .att-sidebar-header p { font-size: 12px; color: ${COLORS.muted}; margin-top: 2px; }
        .att-nav { flex: 1; padding: 8px 0; overflow-y: auto; }
        .att-nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; font-size: 14px; font-weight: 500; color: ${COLORS.ink}; cursor: pointer; transition: background 0.15s; border: none; background: none; width: 100%; text-align: left; }
        .att-nav-item:hover { background: ${COLORS.greenSoft}; }
        .att-nav-item.active { background: ${COLORS.greenSoft}; color: ${COLORS.greenDark}; font-weight: 600; }
        .att-nav-item svg { flex-shrink: 0; }
        .att-content { flex: 1; padding: 16px; max-width: 800px; margin: 0 auto; width: 100%; }
        .att-section-title { font-size: 18px; font-weight: 700; margin-bottom: 16px; color: ${COLORS.ink}; }
        .att-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
        .att-stat-card { background: ${COLORS.card}; border-radius: 12px; padding: 16px; border: 1px solid ${COLORS.border}; }
        .att-stat-card .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: ${COLORS.muted}; font-weight: 600; margin-bottom: 6px; }
        .att-stat-card .value { font-size: 26px; font-weight: 800; }
        .att-stat-card.green .value { color: ${COLORS.green}; }
        .att-stat-card.red .value { color: ${COLORS.red}; }
        .att-stat-card.blue .value { color: ${COLORS.blue}; }
        .att-stat-card.yellow .value { color: ${COLORS.yellow}; }
        .att-card { background: ${COLORS.card}; border-radius: 12px; padding: 16px; border: 1px solid ${COLORS.border}; margin-bottom: 12px; }
        .att-card h3 { font-size: 14px; font-weight: 700; margin-bottom: 10px; }
        .att-input { width: 100%; padding: 10px 12px; border: 1px solid ${COLORS.border}; border-radius: 8px; font-size: 14px; outline: none; background: #fff; color: ${COLORS.ink}; }
        .att-input:focus { border-color: ${COLORS.green}; }
        .att-btn { padding: 10px 20px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
        .att-btn:active { opacity: 0.85; }
        .att-btn-primary { background: ${COLORS.green}; color: #fff; }
        .att-btn-danger { background: ${COLORS.red}; color: #fff; }
        .att-btn-blue { background: ${COLORS.blue}; color: #fff; }
        .att-btn-ghost { background: ${COLORS.bg}; color: ${COLORS.ink}; }
        .att-zone-tabs { display: flex; gap: 8px; margin-bottom: 12px; }
        .att-zone-tab { padding: 8px 18px; border-radius: 20px; font-size: 13px; font-weight: 600; border: 2px solid ${COLORS.border}; background: #fff; cursor: pointer; color: ${COLORS.muted}; }
        .att-zone-tab.active { border-color: ${COLORS.green}; background: ${COLORS.greenSoft}; color: ${COLORS.greenDark}; }
        .att-floor-tabs { display: flex; gap: 6px; margin-bottom: 12px; }
        .att-floor-tab { padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 700; border: 1.5px solid ${COLORS.border}; background: #fff; cursor: pointer; color: ${COLORS.muted}; }
        .att-floor-tab.active { border-color: ${COLORS.blue}; background: #e3f2fd; color: #1565c0; }
        .att-booking-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid ${COLORS.border}; }
        .att-booking-row:last-child { border-bottom: none; }
        .att-status-badge { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; color: #fff; flex-shrink: 0; }
        .att-guide-step { display: flex; align-items: flex-start; gap: 12px; padding: 14px 0; border-bottom: 1px solid ${COLORS.border}; }
        .att-guide-step:last-child { border-bottom: none; }
        .att-empty { text-align: center; padding: 48px 20px; color: ${COLORS.muted}; }
        @media (min-width: 600px) {
          .att-cards { grid-template-columns: 1fr 1fr 1fr 1fr; }
        }
      `}</style>

      <div className="att-page">
        {/* Top Bar */}
        <div className="att-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 4 }} aria-label="Open menu">
              <Icon name="menu" size={22} stroke={2} />
            </button>
            <div>
              <h1>ParkAddis Attendant</h1>
              <div className="att-topbar-sub">Kazanchis Parking Lot</div>
            </div>
          </div>
          <div onClick={() => setIsOnline((v) => !v)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20, background: isOnline ? COLORS.green : COLORS.red, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff", display: "inline-block" }} />
            {isOnline ? "ONLINE" : "OFFLINE"}
          </div>
        </div>

        {sidebarOpen && <div className="att-backdrop" onClick={() => setSidebarOpen(false)} />}

        {/* Sidebar */}
        <div className={`att-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="att-sidebar-stripe" />
          <div className="att-sidebar-header">
            <h2>ParkAddis</h2>
            <p>Attendant Dashboard</p>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: COLORS.muted, marginTop: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: isOnline ? COLORS.green : COLORS.red }} />
              {isOnline ? "Online" : "Offline"} · Active shift
            </div>
          </div>
          <nav className="att-nav">
            {NAV_ITEMS.map((item) => (
              <button key={item.key} className={`att-nav-item ${section === item.key ? "active" : ""}`} onClick={() => navigateTo(item.key)}>
                <Icon name={item.icon} size={20} />
                {item.label}
              </button>
            ))}
          </nav>
          <div style={{ padding: "12px 16px", borderTop: `1px solid ${COLORS.border}` }}>
            <button className="att-nav-item" style={{ color: COLORS.red }} onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/app"; }}>
              <Icon name="logout" size={20} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="att-content">

          {/* ─── QR Scanner ─── */}
          {section === "scanner" && (
            <>
              <div className="att-section-title">QR Scanner</div>
              <div className="att-card" style={{ border: `3px dashed ${COLORS.green}`, background: COLORS.greenSoft, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", cursor: "pointer" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: COLORS.green, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <Icon name="camera" size={30} stroke={2} />
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, color: COLORS.ink, marginBottom: 4 }}>Tap to scan QR code</p>
                <p style={{ fontSize: 13, color: COLORS.muted }}>Align the booking QR code within the frame</p>
              </div>

              <div className="att-card">
                <h3>Recent Scans</h3>
                {recentScans.map((b) => (
                  <div key={b.ref} className="att-booking-row">
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: b.status === "validated" ? COLORS.greenSoft : b.status === "rejected" ? COLORS.redSoft : "#fff8e1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon name={b.status === "validated" ? "check" : b.status === "rejected" ? "close" : "clock"} size={18} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{b.ref}</div>
                        <div style={{ fontSize: 11, color: COLORS.muted }}>{b.time}{b.spot ? ` · Spot ${b.spot}` : ""}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span className="att-status-badge" style={{ background: b.status === "validated" ? COLORS.green : b.status === "rejected" ? COLORS.red : COLORS.yellow }}>
                        {b.status.toUpperCase()}
                      </span>
                      {b.spot && b.status === "validated" && (
                        <button className="att-btn att-btn-blue" style={{ padding: "8px 14px", fontSize: 12 }} onClick={() => handleGuideDriver(b)}>
                          Guide
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─── Booking Validation ─── */}
          {section === "validation" && (
            <>
              <div className="att-section-title">Booking Validation</div>
              <div className="att-card">
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="att-input" value={searchRef} onChange={(e) => setSearchRef(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} placeholder="Enter booking reference (e.g. PK-2026-001)" style={{ flex: 1 }} />
                  <button className="att-btn att-btn-primary" onClick={handleSearch}>Search</button>
                </div>
              </div>

              {searchError && (
                <div className="att-card" style={{ background: COLORS.redSoft, border: `1px solid ${COLORS.red}`, display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name="close" size={16} />
                  <span style={{ fontSize: 13, color: COLORS.red, fontWeight: 600 }}>{searchError}</span>
                </div>
              )}

              {foundBooking && (
                <div className="att-card">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <span style={{ fontSize: 15, fontWeight: 800 }}>{foundBooking.ref}</span>
                    <span className="att-status-badge" style={{ background: foundBooking.payment === "paid" ? COLORS.green : COLORS.yellow }}>
                      {foundBooking.payment === "paid" ? "PAID" : "PENDING"}
                    </span>
                  </div>

                  {[
                    { label: "Customer", value: foundBooking.customer, icon: "nav" as const },
                    { label: "Vehicle", value: foundBooking.vehicle, icon: "car" as const },
                    { label: "Plate", value: foundBooking.plate, icon: "pin" as const },
                    { label: "Duration", value: foundBooking.duration, icon: "clock" as const },
                    ...(foundBooking.spot ? [{ label: "Spot", value: foundBooking.spot, icon: "grid" as const }] : []),
                  ].map((row) => (
                    <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderTop: `1px solid ${COLORS.border}` }}>
                      <span style={{ color: COLORS.muted, width: 20, display: "flex", justifyContent: "center" }}><Icon name={row.icon} size={15} /></span>
                      <span style={{ fontSize: 12, color: COLORS.muted, width: 72, flexShrink: 0 }}>{row.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{row.value}</span>
                    </div>
                  ))}

                  <div style={{ padding: "10px 12px", borderRadius: 8, background: foundBooking.status === "validated" ? COLORS.greenSoft : foundBooking.status === "rejected" ? COLORS.redSoft : "#fff8e1", display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
                    <Icon name={foundBooking.status === "validated" ? "check" : foundBooking.status === "rejected" ? "close" : "clock"} size={16} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: foundBooking.status === "validated" ? COLORS.greenDark : foundBooking.status === "rejected" ? COLORS.red : "#b8860b" }}>
                      {foundBooking.status === "validated" ? "Booking Validated" : foundBooking.status === "rejected" ? "Booking Rejected" : "Awaiting Validation"}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                    <button className="att-btn att-btn-primary" style={{ flex: 1, padding: 14 }} onClick={handleValidate}>
                      <Icon name="check" size={16} /> Validate
                    </button>
                    <button className="att-btn att-btn-danger" style={{ flex: 1, padding: 14 }} onClick={handleReject}>
                      <Icon name="close" size={16} /> Reject
                    </button>
                  </div>

                  {foundBooking.status === "validated" && foundBooking.spot && (
                    <button className="att-btn att-btn-blue" style={{ width: "100%", padding: 14, marginTop: 10 }} onClick={() => handleGuideDriver(foundBooking)}>
                      <Icon name="nav" size={16} /> Guide Driver to Spot {foundBooking.spot}
                    </button>
                  )}
                </div>
              )}

              {!foundBooking && !searchError && (
                <div className="att-empty">
                  <Icon name="search" size={48} />
                  <p style={{ marginTop: 12, fontSize: 14 }}>Search by booking reference to validate</p>
                  <p style={{ fontSize: 12, marginTop: 4, color: "#bbb" }}>e.g. PK-2026-001</p>
                </div>
              )}
            </>
          )}

          {/* ─── Spot Management ─── */}
          {section === "spots" && (
            <>
              <div className="att-section-title">Spot Management</div>
              <div className="att-card">
                <h3>Lot Overview</h3>
                <div className="att-floor-tabs">
                  {lot.floors.map((f) => (
                    <button key={f} className={`att-floor-tab ${selectedFloor === f ? "active" : ""}`} onClick={() => setSelectedFloor(f)}>Floor {f}</button>
                  ))}
                </div>
                <div className="att-zone-tabs">
                  {lot.zones.map((z) => (
                    <button key={z} className={`att-zone-tab ${selectedZone === z ? "active" : ""}`} onClick={() => setSelectedZone(z)}>Zone {z}</button>
                  ))}
                </div>
                <ParkingLotGrid config={lot} selectedFloor={selectedFloor} selectedZone={selectedZone} readOnly={false} />
              </div>

              <div className="att-cards" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                <div className="att-stat-card"><div className="label">Total</div><div className="value" style={{ color: COLORS.ink }}>{totalLotSpots}</div></div>
                <div className="att-stat-card green"><div className="label">Available</div><div className="value">{availableSpots}</div></div>
                <div className="att-stat-card red"><div className="label">Occupied</div><div className="value">{occupiedSpots}</div></div>
              </div>
            </>
          )}

          {/* ─── Driver Guide ─── */}
          {section === "guide" && (
            <>
              <div className="att-section-title">Driver Guide</div>
              {guideSpot && guidedBooking ? (
                <div className="att-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "#e3f2fd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name="nav" size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>Guide {guidedBooking.customer}</div>
                      <div style={{ fontSize: 12, color: COLORS.muted }}>{guidedBooking.vehicle} ({guidedBooking.plate}) → Spot {guideSpot}</div>
                    </div>
                  </div>

                  <ParkingLotGrid config={lot} selectedFloor={selectedFloor} selectedZone={selectedZone} assignedSpot={guideSpot} showGuidance={true} readOnly={true} />

                  <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                    <button className="att-btn att-btn-ghost" style={{ flex: 1, padding: 14 }} onClick={() => { setGuideSpot(undefined); setGuidedBooking(null); setShowGuidance(false); setSection("spots"); }}>
                      Back to Spots
                    </button>
                    <button className="att-btn att-btn-primary" style={{ flex: 1, padding: 14 }}>
                      Mark as Parked
                    </button>
                  </div>
                </div>
              ) : (
                <div className="att-card att-empty">
                  <Icon name="nav" size={48} />
                  <p style={{ marginTop: 12, fontSize: 14 }}>Scan or validate a booking first, then guide the driver to their spot</p>
                  <button className="att-btn att-btn-primary" style={{ marginTop: 16, padding: 14 }} onClick={() => setSection("validation")}>
                    Go to Validation
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
