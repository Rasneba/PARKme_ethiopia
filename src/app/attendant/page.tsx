"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import ParkingLotGrid, { KAZANCHIS_LOT, SpotStatus, ParkingSpot } from "@/components/ParkingLotGrid";

const GREEN = "#0fa24b";
const GREEN_DARK = "#086a32";
const RED = "#e54d3f";
const INK = "#131614";
const GRAY = "#f0f0f0";
const GRAY_MID = "#888";
const WHITE = "#fff";
const BLUE = "#4098df";

type Tab = "scanner" | "validation" | "spots" | "guide";

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

export default function AttendantPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("scanner");
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
      const floor = booking.spot.startsWith("A") ? "G" : "G";
      setSelectedFloor(floor);
      setSelectedZone(booking.spot.startsWith("A") ? "A" : "B");
      setGuideSpot(booking.spot);
      setGuidedBooking(booking);
      setShowGuidance(true);
      setTab("guide");
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

  const tabs: { key: Tab; icon: "scan" | "check" | "grid" | "nav"; label: string }[] = [
    { key: "scanner", icon: "scan", label: "Scan" },
    { key: "validation", icon: "check", label: "Validate" },
    { key: "spots", icon: "grid", label: "Spots" },
    { key: "guide", icon: "nav", label: "Guide" },
  ];

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: ${GRAY}; color: ${INK}; -webkit-tap-highlight-color: transparent; }
        .att-card { background: ${WHITE}; border-radius: 14px; padding: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); margin-bottom: 12px; }
        .att-floor-tabs { display: flex; gap: 6px; margin-bottom: 10px; }
        .att-floor-tab { padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 700; border: 1.5px solid #ddd; background: #fff; cursor: pointer; color: ${GRAY_MID}; }
        .att-floor-tab.active { border-color: ${BLUE}; background: #e3f2fd; color: #1565c0; }
        .att-zone-tabs { display: flex; gap: 6px; margin-bottom: 10px; }
        .att-zone-tab { padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; border: 1.5px solid #ddd; background: #fff; cursor: pointer; color: ${GRAY_MID}; }
        .att-zone-tab.active { border-color: ${GREEN}; background: #dcf8e4; color: ${GREEN_DARK}; }
      `}</style>
      <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: GRAY, position: "relative", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{ position: "sticky", top: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: INK, color: WHITE }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", color: WHITE, cursor: "pointer", padding: 12, minWidth: 48, minHeight: 48, display: "grid", placeItems: "center" }} aria-label="Menu">
            <Icon name="menu" size={22} />
          </button>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Parkme Attendant</span>
          <div onClick={() => setIsOnline((v) => !v)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: isOnline ? GREEN : RED, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: WHITE, display: "inline-block" }} />
            {isOnline ? "ONLINE" : "OFFLINE"}
          </div>
        </div>

        {/* Location */}
        <div style={{ padding: "8px 16px", background: WHITE, borderBottom: `1px solid ${GRAY}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: GRAY_MID }}>
            <Icon name="pin" size={14} />
            <span>Kazanchis Parking Lot</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "16px", paddingBottom: 80, overflowY: "auto" }}>
          {tab === "scanner" && (
            <div>
              <div style={{ background: "#e6f9ee", border: `3px dashed ${GREEN}`, borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", cursor: "pointer" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: GREEN, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <Icon name="camera" size={30} stroke={2} />
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, color: INK, marginBottom: 4 }}>Tap to scan QR code</p>
                <p style={{ fontSize: 13, color: GRAY_MID }}>Align the booking QR code within the frame</p>
              </div>
              <div style={{ marginTop: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Recent Scans</h3>
                {recentScans.map((b) => (
                  <div key={b.ref} className="att-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: b.status === "validated" ? "#e6f9ee" : b.status === "rejected" ? "#fde8e6" : "#fff8e1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon name={b.status === "validated" ? "check" : b.status === "rejected" ? "close" : "clock"} size={18} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.ref}</div>
                        <div style={{ fontSize: 11, color: GRAY_MID }}>{b.time}{b.spot ? ` · Spot ${b.spot}` : ""}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: b.status === "validated" ? GREEN : b.status === "rejected" ? RED : "#f5a623", color: WHITE, flexShrink: 0 }}>
                        {b.status.toUpperCase()}
                      </span>
                      {b.spot && b.status === "validated" && (
                        <button onClick={() => handleGuideDriver(b)} style={{ padding: "8px 14px", borderRadius: 8, background: BLUE, color: WHITE, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0, minHeight: 44 }}>
                          Guide
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "validation" && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Booking Validation</h2>
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <input value={searchRef} onChange={(e) => setSearchRef(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} placeholder="Enter booking reference" style={{ width: "100%", padding: "12px 12px 12px 36px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: 14, outline: "none", background: WHITE }} />
                  <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: GRAY_MID, pointerEvents: "none" }}><Icon name="search" size={16} /></span>
                </div>
                <button onClick={handleSearch} style={{ padding: "12px 18px", borderRadius: 10, background: GREEN, color: WHITE, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Search</button>
              </div>

              {searchError && (
                <div style={{ padding: "12px 14px", borderRadius: 10, background: "#fde8e6", color: RED, fontSize: 13, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name="close" size={16} /> {searchError}
                </div>
              )}

              {foundBooking && (
                <div className="att-card">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <span style={{ fontSize: 15, fontWeight: 800 }}>{foundBooking.ref}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6, background: foundBooking.payment === "paid" ? GREEN : "#f5a623", color: WHITE }}>
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
                    <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderTop: `1px solid ${GRAY}` }}>
                      <span style={{ color: GRAY_MID, width: 20, display: "flex", justifyContent: "center" }}><Icon name={row.icon} size={15} /></span>
                      <span style={{ fontSize: 12, color: GRAY_MID, width: 72, flexShrink: 0 }}>{row.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{row.value}</span>
                    </div>
                  ))}

                  <div style={{ marginTop: 12, padding: "8px 12px", borderRadius: 8, background: foundBooking.status === "validated" ? "#e6f9ee" : foundBooking.status === "rejected" ? "#fde8e6" : "#fff8e1", display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <Icon name={foundBooking.status === "validated" ? "check" : foundBooking.status === "rejected" ? "close" : "clock"} size={16} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: foundBooking.status === "validated" ? GREEN_DARK : foundBooking.status === "rejected" ? RED : "#b8860b" }}>
                      {foundBooking.status === "validated" ? "Booking Validated" : foundBooking.status === "rejected" ? "Booking Rejected" : "Awaiting Validation"}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={handleValidate} style={{ flex: 1, padding: "14px", borderRadius: 10, background: GREEN, color: WHITE, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <Icon name="check" size={16} /> Validate
                    </button>
                    <button onClick={handleReject} style={{ flex: 1, padding: "14px", borderRadius: 10, background: RED, color: WHITE, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <Icon name="close" size={16} /> Reject
                    </button>
                  </div>

                  {foundBooking.status === "validated" && foundBooking.spot && (
                    <button onClick={() => handleGuideDriver(foundBooking)} style={{ width: "100%", padding: "12px", borderRadius: 10, background: BLUE, color: WHITE, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <Icon name="nav" size={16} /> Guide Driver to Spot {foundBooking.spot}
                    </button>
                  )}
                </div>
              )}

              {!foundBooking && !searchError && (
                <div style={{ textAlign: "center", padding: "40px 20px", color: GRAY_MID }}>
                  <Icon name="search" size={40} />
                  <p style={{ marginTop: 12, fontSize: 13 }}>Search by booking reference to validate</p>
                  <p style={{ fontSize: 11, marginTop: 4, color: "#bbb" }}>e.g. PK-2026-001</p>
                </div>
              )}
            </div>
          )}

          {tab === "spots" && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Spot Management</h2>
              <p style={{ fontSize: 12, color: GRAY_MID, marginBottom: 14 }}>Tap a spot to view details</p>

              <div className="att-card">
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
                <ParkingLotGrid
                  config={lot}
                  selectedFloor={selectedFloor}
                  selectedZone={selectedZone}
                  readOnly={false}
                />
              </div>

              <div className="att-card" style={{ display: "flex", justifyContent: "space-around" }}>
                {[
                  { label: "Total", value: totalLotSpots, color: INK },
                  { label: "Available", value: availableSpots, color: GREEN },
                  { label: "Occupied", value: occupiedSpots, color: RED },
                ].map((item) => (
                  <div key={item.label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: item.color }}>{item.value}</div>
                    <div style={{ fontSize: 11, color: GRAY_MID, marginTop: 2 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "guide" && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Driver Guide</h2>
              {guideSpot && guidedBooking ? (
                <div className="att-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "#e3f2fd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name="nav" size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>Guide {guidedBooking.customer}</div>
                      <div style={{ fontSize: 12, color: GRAY_MID }}>{guidedBooking.vehicle} ({guidedBooking.plate}) &rarr; Spot {guideSpot}</div>
                    </div>
                  </div>

                  <ParkingLotGrid
                    config={lot}
                    selectedFloor={selectedFloor}
                    selectedZone={selectedZone}
                    assignedSpot={guideSpot}
                    showGuidance={true}
                    readOnly={true}
                  />

                  <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                    <button onClick={() => { setGuideSpot(undefined); setGuidedBooking(null); setShowGuidance(false); setTab("spots"); }} style={{ flex: 1, padding: "14px", borderRadius: 12, background: GRAY, color: INK, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 50 }}>Back to Spots</button>
                    <button style={{ flex: 1, padding: "14px", borderRadius: 12, background: GREEN, color: WHITE, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", minHeight: 50 }}>Mark as Parked</button>
                  </div>
                </div>
              ) : (
                <div className="att-card" style={{ textAlign: "center", padding: "40px 20px", color: GRAY_MID }}>
                  <Icon name="nav" size={40} />
                  <p style={{ marginTop: 12, fontSize: 13 }}>Scan or validate a booking first, then guide the driver to their spot</p>
                  <button onClick={() => setTab("validation")} style={{ marginTop: 16, padding: "14px 24px", borderRadius: 12, background: GREEN, color: WHITE, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", minHeight: 50 }}>
                    Go to Validation
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom tab bar */}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: WHITE, borderTop: `1px solid ${GRAY}`, display: "flex", zIndex: 40, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "12px 0", background: "none", border: "none", cursor: "pointer", color: tab === t.key ? GREEN : GRAY_MID, fontSize: 11, fontWeight: tab === t.key ? 700 : 500, minHeight: 56 }}>
              <Icon name={t.icon} size={22} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Sidebar */}
        {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 90 }} />}
        <div style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 280, maxWidth: "80vw", background: WHITE, zIndex: 100, transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.25s ease", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "24px 20px 16px", borderBottom: `1px solid ${GRAY}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: GREEN, display: "flex", alignItems: "center", justifyContent: "center", color: WHITE }}><Icon name="shield" size={20} /></div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>Attendant</div>
                  <div style={{ fontSize: 11, color: GRAY_MID }}>Kazanchis Lot</div>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: INK }} aria-label="Close menu"><Icon name="close" size={20} /></button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: GRAY_MID }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: isOnline ? GREEN : RED }} />
              {isOnline ? "Online" : "Offline"} · Active shift
            </div>
          </div>
          <div style={{ flex: 1, padding: "12px 0" }}>
            {[
              { icon: "scan" as const, label: "QR Scanner", action: () => setTab("scanner") },
              { icon: "check" as const, label: "Booking Validation", action: () => setTab("validation") },
              { icon: "grid" as const, label: "Spot Management", action: () => setTab("spots") },
              { icon: "nav" as const, label: "Driver Guide", action: () => setTab("guide") },
              { icon: "settings" as const, label: "Settings", action: () => {} },
              { icon: "help" as const, label: "Help", action: () => {} },
              { icon: "logout" as const, label: "Logout", action: () => { fetch("/api/auth/logout", { method: "POST" }).then(() => { window.location.href = "/app"; }).catch(() => { window.location.href = "/app"; }); } },
            ].map((item, i) => (
              <button key={item.label} onClick={() => { item.action(); setSidebarOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", padding: "14px 20px", minHeight: 48, background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500, color: INK, textAlign: "left", borderTop: i === 6 ? `1px solid ${GRAY}` : "none" }}>
                <Icon name={item.icon} size={18} />
                {item.label}
              </button>
            ))}
          </div>
          <div style={{ padding: "16px 20px", borderTop: `1px solid ${GRAY}`, fontSize: 11, color: "#ccc", textAlign: "center" }}>Parkme Ethiopia v1.0</div>
        </div>
      </div>
    </>
  );
}
