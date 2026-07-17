"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";

const GREEN = "#0fa24b";
const GREEN_DARK = "#086a32";
const RED = "#e54d3f";
const INK = "#131614";
const GRAY = "#f0f0f0";
const GRAY_MID = "#888";
const WHITE = "#fff";

type Tab = "scanner" | "validation" | "spots";

type SpotStatus = "available" | "occupied";

type Spot = {
  id: string;
  zone: string;
  status: SpotStatus;
  plate?: string;
};

type Booking = {
  ref: string;
  customer: string;
  vehicle: string;
  plate: string;
  duration: string;
  payment: "paid" | "pending";
  time: string;
  status: "validated" | "pending" | "rejected";
};

const INITIAL_SPOTS: Spot[] = [
  { id: "A1", zone: "Zone A", status: "occupied", plate: "AA-1234" },
  { id: "A2", zone: "Zone A", status: "available" },
  { id: "A3", zone: "Zone A", status: "occupied", plate: "BB-5678" },
  { id: "A4", zone: "Zone A", status: "available" },
  { id: "B1", zone: "Zone B", status: "occupied", plate: "CC-9012" },
  { id: "B2", zone: "Zone B", status: "available" },
  { id: "B3", zone: "Zone B", status: "available" },
  { id: "B4", zone: "Zone B", status: "occupied", plate: "DD-3456" },
];

const SAMPLE_BOOKINGS: Booking[] = [
  { ref: "PK-2026-001", customer: "Abebe Kebede", vehicle: "Toyota Corolla", plate: "AA-1234", duration: "2 hrs", payment: "paid", time: "10 min ago", status: "validated" },
  { ref: "PK-2026-002", customer: "Hiwot Tesfaye", vehicle: "Hyundai i10", plate: "BB-5678", duration: "3 hrs", payment: "paid", time: "25 min ago", status: "validated" },
  { ref: "PK-2026-003", customer: "Dawit Mulugeta", vehicle: "Nissan Note", plate: "CC-9012", duration: "1 hr", payment: "pending", time: "42 min ago", status: "pending" },
  { ref: "PK-2026-004", customer: "Sara Ahmed", vehicle: "Suzuki Swift", plate: "DD-3456", duration: "4 hrs", payment: "paid", time: "1 hr ago", status: "validated" },
  { ref: "PK-2026-005", customer: "Yonas Tadesse", vehicle: "Honda Fit", plate: "EE-7890", duration: "2 hrs", payment: "pending", time: "1.5 hrs ago", status: "pending" },
];

const BOOKING_DB: Record<string, Booking> = Object.fromEntries(
  SAMPLE_BOOKINGS.map((b) => [b.ref, b])
);

export default function AttendantPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("scanner");
  const [isOnline, setIsOnline] = useState(true);
  const [spots, setSpots] = useState<Spot[]>(INITIAL_SPOTS);
  const [recentScans] = useState<Booking[]>(SAMPLE_BOOKINGS);
  const [searchRef, setSearchRef] = useState("");
  const [foundBooking, setFoundBooking] = useState<Booking | null>(null);
  const [searchError, setSearchError] = useState("");

  const handleSearch = () => {
    const q = searchRef.trim().toUpperCase();
    const match = BOOKING_DB[q];
    if (match) {
      setFoundBooking(match);
      setSearchError("");
    } else {
      setFoundBooking(null);
      setSearchError("Booking not found. Please check the reference.");
    }
  };

  const handleValidate = () => {
    if (!foundBooking) return;
    setFoundBooking({ ...foundBooking, status: "validated", payment: "paid" });
  };

  const handleReject = () => {
    if (!foundBooking) return;
    setFoundBooking({ ...foundBooking, status: "rejected" });
  };

  const toggleSpot = (id: string) => {
    setSpots((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: s.status === "available" ? "occupied" : "available",
              plate: s.status === "available" ? "NEW-0000" : undefined,
            }
          : s
      )
    );
  };

  const tabs: { key: Tab; icon: "scan" | "check" | "grid"; label: string }[] = [
    { key: "scanner", icon: "scan", label: "Scan" },
    { key: "validation", icon: "check", label: "Validate" },
    { key: "spots", icon: "grid", label: "Spots" },
  ];

  const sidebarItems = [
    { icon: "scan" as const, label: "QR Scanner", action: () => setTab("scanner") },
    { icon: "check" as const, label: "Booking Validation", action: () => setTab("validation") },
    { icon: "grid" as const, label: "Spot Management", action: () => setTab("spots") },
    { icon: "settings" as const, label: "Settings", action: () => {} },
    { icon: "help" as const, label: "Help", action: () => {} },
    { icon: "logout" as const, label: "Logout", action: () => {} },
  ];

  return (
    <>
    <style>{`
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: ${GRAY}; color: ${INK}; -webkit-tap-highlight-color: transparent; }
    `}</style>
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: GRAY, position: "relative", overflow: "hidden" }}>
      {/* Offline / Online indicator */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: INK, color: WHITE }}>
        <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", color: WHITE, cursor: "pointer", padding: 4 }} aria-label="Menu">
          <Icon name="menu" size={22} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Parkme Attendant</span>
        </div>
        <div
          onClick={() => setIsOnline((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "4px 10px",
            borderRadius: 20,
            background: isOnline ? GREEN : RED,
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.5,
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: WHITE, display: "inline-block" }} />
          {isOnline ? "ONLINE" : "OFFLINE"}
        </div>
      </div>

      {/* Location badge */}
      <div style={{ padding: "8px 16px", background: WHITE, borderBottom: `1px solid ${GRAY}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: GRAY_MID }}>
          <Icon name="pin" size={14} />
          <span>Kazanchis Parking Lot</span>
        </div>
      </div>

      {/* Content area */}
      <div style={{ flex: 1, padding: "16px", paddingBottom: 80 }}>
        {tab === "scanner" && (
          <div>
            {/* Camera placeholder */}
            <div
              style={{
                background: "#e6f9ee",
                border: `3px dashed ${GREEN}`,
                borderRadius: 16,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "48px 24px",
                cursor: "pointer",
              }}
            >
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: GREEN, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Icon name="camera" size={30} stroke={2} />
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, color: INK, marginBottom: 4 }}>Tap to scan QR code</p>
              <p style={{ fontSize: 13, color: GRAY_MID }}>Align the booking QR code within the frame</p>
            </div>

            {/* Recent scans */}
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: INK }}>Recent Scans</h3>
              {recentScans.map((b) => (
                <div key={b.ref} style={{ background: WHITE, borderRadius: 12, padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: b.status === "validated" ? "#e6f9ee" : b.status === "rejected" ? "#fde8e6" : "#fff8e1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon name={b.status === "validated" ? "check" : b.status === "rejected" ? "close" : "clock"} size={18} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.ref}</div>
                      <div style={{ fontSize: 11, color: GRAY_MID }}>{b.time}</div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: 6,
                      background: b.status === "validated" ? GREEN : b.status === "rejected" ? RED : "#f5a623",
                      color: WHITE,
                      flexShrink: 0,
                    }}
                  >
                    {b.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "validation" && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Booking Validation</h2>

            {/* Search input */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              <div style={{ flex: 1, position: "relative" }}>
                <input
                  value={searchRef}
                  onChange={(e) => setSearchRef(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Enter booking reference"
                  style={{
                    width: "100%",
                    padding: "12px 12px 12px 36px",
                    borderRadius: 10,
                    border: `1.5px solid #ddd`,
                    fontSize: 14,
                    outline: "none",
                    background: WHITE,
                  }}
                />
                <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: GRAY_MID, pointerEvents: "none" }}>
                  <Icon name="search" size={16} />
                </span>
              </div>
              <button
                onClick={handleSearch}
                style={{
                  padding: "12px 18px",
                  borderRadius: 10,
                  background: GREEN,
                  color: WHITE,
                  border: "none",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Search
              </button>
            </div>

            {searchError && (
              <div style={{ padding: "12px 14px", borderRadius: 10, background: "#fde8e6", color: RED, fontSize: 13, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="close" size={16} /> {searchError}
              </div>
            )}

            {foundBooking && (
              <div style={{ background: WHITE, borderRadius: 14, padding: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ fontSize: 15, fontWeight: 800 }}>{foundBooking.ref}</span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: 6,
                      background: foundBooking.payment === "paid" ? GREEN : "#f5a623",
                      color: WHITE,
                    }}
                  >
                    {foundBooking.payment === "paid" ? "PAID" : "PENDING"}
                  </span>
                </div>

                {[
                  { label: "Customer", value: foundBooking.customer, icon: "nav" },
                  { label: "Vehicle", value: foundBooking.vehicle, icon: "car" },
                  { label: "Plate", value: foundBooking.plate, icon: "pin" },
                  { label: "Duration", value: foundBooking.duration, icon: "clock" },
                ].map((row) => (
                  <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderTop: `1px solid ${GRAY}` }}>
                    <span style={{ color: GRAY_MID, width: 20, display: "flex", justifyContent: "center" }}><Icon name={row.icon as any} size={15} /></span>
                    <span style={{ fontSize: 12, color: GRAY_MID, width: 72, flexShrink: 0 }}>{row.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{row.value}</span>
                  </div>
                ))}

                {/* Status badge */}
                <div style={{ marginTop: 12, padding: "8px 12px", borderRadius: 8, background: foundBooking.status === "validated" ? "#e6f9ee" : foundBooking.status === "rejected" ? "#fde8e6" : "#fff8e1", display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <Icon name={foundBooking.status === "validated" ? "check" : foundBooking.status === "rejected" ? "close" : "clock"} size={16} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: foundBooking.status === "validated" ? GREEN_DARK : foundBooking.status === "rejected" ? RED : "#b8860b" }}>
                    {foundBooking.status === "validated" ? "Booking Validated" : foundBooking.status === "rejected" ? "Booking Rejected" : "Awaiting Validation"}
                  </span>
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={handleValidate}
                    style={{
                      flex: 1,
                      padding: "14px",
                      borderRadius: 10,
                      background: GREEN,
                      color: WHITE,
                      border: "none",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <Icon name="check" size={16} /> Validate
                  </button>
                  <button
                    onClick={handleReject}
                    style={{
                      flex: 1,
                      padding: "14px",
                      borderRadius: 10,
                      background: RED,
                      color: WHITE,
                      border: "none",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <Icon name="close" size={16} /> Reject
                  </button>
                </div>
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
            <p style={{ fontSize: 12, color: GRAY_MID, marginBottom: 16 }}>Tap a spot to toggle availability</p>

            {/* Legend */}
            <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: GREEN, display: "inline-block" }} /> Available
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: RED, display: "inline-block" }} /> Occupied
              </div>
            </div>

            {(["Zone A", "Zone B"] as const).map((zone) => {
              const zoneSpots = spots.filter((s) => s.zone === zone);
              return (
                <div key={zone} style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: GRAY_MID, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>{zone}</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {zoneSpots.map((spot) => (
                      <div
                        key={spot.id}
                        onClick={() => toggleSpot(spot.id)}
                        style={{
                          background: WHITE,
                          borderRadius: 12,
                          padding: 14,
                          cursor: "pointer",
                          border: `2px solid ${spot.status === "available" ? GREEN : RED}`,
                          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                          transition: "all 0.15s",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontSize: 16, fontWeight: 800 }}>{spot.id}</span>
                          <span style={{ width: 10, height: 10, borderRadius: "50%", background: spot.status === "available" ? GREEN : RED }} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: GRAY_MID }}>
                          {spot.status === "occupied" ? (
                            <>
                              <Icon name="car" size={13} />
                              <span style={{ fontWeight: 600, color: INK }}>{spot.plate}</span>
                            </>
                          ) : (
                            <span>Available</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Summary */}
            <div style={{ background: WHITE, borderRadius: 12, padding: 14, display: "flex", justifyContent: "space-around", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              {[
                { label: "Total", value: spots.length, color: INK },
                { label: "Available", value: spots.filter((s) => s.status === "available").length, color: GREEN },
                { label: "Occupied", value: spots.filter((s) => s.status === "occupied").length, color: RED },
              ].map((item) => (
                <div key={item.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: item.color }}>{item.value}</div>
                  <div style={{ fontSize: 11, color: GRAY_MID, marginTop: 2 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom tab bar */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: WHITE, borderTop: `1px solid ${GRAY}`, display: "flex", zIndex: 40, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "10px 0",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: tab === t.key ? GREEN : GRAY_MID,
              fontSize: 10,
              fontWeight: tab === t.key ? 700 : 500,
            }}
          >
            <Icon name={t.icon} size={20} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 90 }}
        />
      )}

      {/* Sidebar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: 280,
          maxWidth: "80vw",
          background: WHITE,
          zIndex: 100,
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Sidebar header */}
        <div style={{ padding: "24px 20px 16px", borderBottom: `1px solid ${GRAY}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: GREEN, display: "flex", alignItems: "center", justifyContent: "center", color: WHITE }}>
                <Icon name="shield" size={20} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: INK }}>Attendant</div>
                <div style={{ fontSize: 11, color: GRAY_MID }}>Kazanchis Lot</div>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: INK }} aria-label="Close menu">
              <Icon name="close" size={20} />
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: GRAY_MID }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: isOnline ? GREEN : RED }} />
            {isOnline ? "Online" : "Offline"} &middot; Active shift
          </div>
        </div>

        {/* Sidebar links */}
        <div style={{ flex: 1, padding: "12px 0" }}>
          {sidebarItems.map((item, i) => (
            <button
              key={item.label}
              onClick={() => {
                item.action();
                setSidebarOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                width: "100%",
                padding: "13px 20px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 500,
                color: INK,
                textAlign: "left",
                borderTop: i === sidebarItems.length - 1 ? `1px solid ${GRAY}` : "none",
              }}
            >
              <Icon name={item.icon} size={18} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Sidebar footer */}
        <div style={{ padding: "16px 20px", borderTop: `1px solid ${GRAY}`, fontSize: 11, color: "#ccc", textAlign: "center" }}>
          Parkme Ethiopia v1.0
        </div>
      </div>
    </div>
    </>
  );
}
