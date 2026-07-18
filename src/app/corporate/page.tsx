"use client";

import { useState, useMemo, useEffect } from "react";
import { Icon } from "@/components/Icon";
import ParkingLotGrid, { KAZANCHIS_LOT, SpotStatus, ParkingSpot } from "@/components/ParkingLotGrid";
import IndoorLotGuide from "@/components/IndoorLotGuide";

type Section = "dashboard" | "locations" | "analytics" | "revenue" | "spots" | "guide" | "attendance";

interface ParkingLocation {
  id: string;
  name: string;
  address: string;
  lat: string;
  lng: string;
  totalSpots: number;
  occupied: number;
}

interface Transaction {
  id: string;
  time: string;
  amount: number;
  vehicle: string;
  spot: string;
  method: string;
}

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

const NAV_ITEMS: { key: Section; icon: "grid" | "map" | "clock" | "wallet" | "car" | "nav" | "check"; label: string }[] = [
  { key: "dashboard", icon: "grid", label: "Live Dashboard" },
  { key: "spots", icon: "car", label: "Parking Lot" },
  { key: "locations", icon: "map", label: "Locations" },
  { key: "analytics", icon: "clock", label: "Analytics" },
  { key: "revenue", icon: "wallet", label: "Revenue" },
  { key: "attendance", icon: "check", label: "Attendance" },
  { key: "guide", icon: "nav", label: "Driver Guide" },
];

const INITIAL_LOCATIONS: ParkingLocation[] = [
  { id: "loc1", name: "Kazanchis", address: "Bole Road, Kazanchis, Addis Ababa", lat: "9.0192", lng: "38.7525", totalSpots: 48, occupied: 21 },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: "t1", time: "10:32 AM", amount: 50, vehicle: "AA-1234", spot: "A1", method: "TeleBirr" },
  { id: "t2", time: "11:15 AM", amount: 75, vehicle: "AA-5678", spot: "A3", method: "Cash" },
  { id: "t3", time: "12:03 PM", amount: 50, vehicle: "AA-9012", spot: "B2", method: "CBE Birr" },
  { id: "t4", time: "1:45 PM", amount: 30, vehicle: "AA-3344", spot: "A2", method: "TeleBirr" },
  { id: "t5", time: "2:20 PM", amount: 60, vehicle: "AA-7788", spot: "B3", method: "Cash" },
  { id: "t6", time: "3:05 PM", amount: 45, vehicle: "BB-2233", spot: "A5", method: "CBE Birr" },
  { id: "t7", time: "3:42 PM", amount: 80, vehicle: "CC-9911", spot: "B1", method: "TeleBirr" },
];

const PEAK_HOURS = [
  { hour: "6AM", value: 15 },
  { hour: "8AM", value: 65 },
  { hour: "10AM", value: 85 },
  { hour: "12PM", value: 90 },
  { hour: "2PM", value: 70 },
  { hour: "4PM", value: 55 },
  { hour: "6PM", value: 40 },
  { hour: "8PM", value: 20 },
];

export default function CorporatePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [section, setSection] = useState<Section>("dashboard");
  const [locations] = useState<ParkingLocation[]>(INITIAL_LOCATIONS);
  const [transactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [selectedFloor, setSelectedFloor] = useState("G");
  const [selectedZone, setSelectedZone] = useState("A");
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [spotFilter, setSpotFilter] = useState<"all" | SpotStatus>("all");
  const [guideSpot, setGuideSpot] = useState<string | undefined>(undefined);
  const [showGuidance, setShowGuidance] = useState(false);
  const [indoorFloor, setIndoorFloor] = useState("1st Floor");
  const [indoorSpot, setIndoorSpot] = useState("");
  const [showIndoor, setShowIndoor] = useState(false);
  const [newLocation, setNewLocation] = useState({ name: "", address: "", lat: "", lng: "" });
  const [apiSpots, setApiSpots] = useState<{ id: number; name: string; address: string; lat: number; lng: number; price: number; availableSpots: number; totalSpots: number }[]>([]);

  useEffect(() => {
    fetch("/api/spots")
      .then((r) => r.ok ? r.json() : { spots: [] })
      .then((d) => setApiSpots(d.spots ?? []))
      .catch(() => {});
  }, []);

  const lot = KAZANCHIS_LOT;

  const allSpots = useMemo(() => {
    const spots: ParkingSpot[] = [];
    for (const floor of lot.floors) {
      for (const zone of lot.zones) {
        const grid = lot.floorMap[floor]?.[zone] || [];
        grid.forEach((row, ri) =>
          row.forEach((_, ci) => {
            const spot = grid[ri][ci];
            if (spot.type !== "lane" && spot.type !== "entrance" && spot.type !== "exit" && spot.id) {
              spots.push(spot);
            }
          })
        );
      }
    }
    return spots;
  }, [lot]);

  const totalSpots = allSpots.filter((s) => s.type !== "lane" && s.type !== "entrance" && s.type !== "exit").length;
  const occupied = allSpots.filter((s) => s.status === "occupied").length;
  const available = allSpots.filter((s) => s.status === "available").length;
  const reserved = allSpots.filter((s) => s.status === "reserved").length;
  const revenueToday = transactions.reduce((sum, t) => sum + t.amount, 0);
  const revenueWeek = revenueToday * 5;
  const revenueMonth = revenueWeek * 4;

  function navigateTo(key: Section) {
    setSection(key);
    setSidebarOpen(false);
  }

  function handleAssignDriver(spotId: string) {
    setGuideSpot(spotId);
    setShowGuidance(true);
    setSection("guide");
  }

  return (
    <>
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: ${COLORS.bg}; color: ${COLORS.ink}; }
        .corp-page { min-height: 100vh; display: flex; flex-direction: column; }
        .corp-topbar { position: sticky; top: 0; z-index: 40; display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: ${COLORS.greenDark}; color: #fff; }
        .corp-topbar h1 { font-size: 16px; font-weight: 700; letter-spacing: -0.3px; }
        .corp-topbar-sub { font-size: 11px; opacity: 0.7; }
        .corp-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 50; }
        .corp-sidebar { position: fixed; top: 0; left: 0; bottom: 0; width: 260px; background: #fff; z-index: 60; transform: translateX(-100%); transition: transform 0.25s ease; display: flex; flex-direction: column; }
        .corp-sidebar.open { transform: translateX(0); }
        .corp-sidebar-header { padding: 20px 16px 16px; border-bottom: 1px solid ${COLORS.border}; }
        .corp-sidebar-header h2 { font-size: 18px; font-weight: 700; color: ${COLORS.greenDark}; }
        .corp-sidebar-header p { font-size: 12px; color: ${COLORS.muted}; margin-top: 2px; }
        .corp-nav { flex: 1; padding: 8px 0; overflow-y: auto; }
        .corp-nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; font-size: 14px; font-weight: 500; color: ${COLORS.ink}; cursor: pointer; transition: background 0.15s; border: none; background: none; width: 100%; text-align: left; }
        .corp-nav-item:hover { background: ${COLORS.greenSoft}; }
        .corp-nav-item.active { background: ${COLORS.greenSoft}; color: ${COLORS.greenDark}; font-weight: 600; }
        .corp-nav-item svg { flex-shrink: 0; }
        .corp-content { flex: 1; padding: 16px; max-width: 800px; margin: 0 auto; width: 100%; }
        .corp-section-title { font-size: 18px; font-weight: 700; margin-bottom: 16px; color: ${COLORS.ink}; }
        .corp-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
        .corp-stat-card { background: ${COLORS.card}; border-radius: 12px; padding: 16px; border: 1px solid ${COLORS.border}; }
        .corp-stat-card .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: ${COLORS.muted}; font-weight: 600; margin-bottom: 6px; }
        .corp-stat-card .value { font-size: 26px; font-weight: 800; }
        .corp-stat-card.green .value { color: ${COLORS.green}; }
        .corp-stat-card.red .value { color: ${COLORS.red}; }
        .corp-stat-card.blue .value { color: ${COLORS.blue}; }
        .corp-stat-card.yellow .value { color: ${COLORS.yellow}; }
        .corp-card { background: ${COLORS.card}; border-radius: 12px; padding: 16px; border: 1px solid ${COLORS.border}; margin-bottom: 12px; }
        .corp-card h3 { font-size: 14px; font-weight: 700; margin-bottom: 10px; }
        .corp-input { width: 100%; padding: 10px 12px; border: 1px solid ${COLORS.border}; border-radius: 8px; font-size: 14px; outline: none; background: #fff; color: ${COLORS.ink}; margin-bottom: 8px; }
        .corp-input:focus { border-color: ${COLORS.green}; }
        .corp-btn { padding: 10px 20px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
        .corp-btn:active { opacity: 0.85; }
        .corp-btn-primary { background: ${COLORS.green}; color: #fff; width: 100%; }
        .corp-bar-chart { display: flex; align-items: flex-end; gap: 6px; height: 140px; padding-top: 8px; }
        .corp-bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; justify-content: flex-end; }
        .corp-bar { width: 100%; border-radius: 4px 4px 0 0; background: ${COLORS.green}; transition: height 0.3s; min-height: 4px; }
        .corp-bar-label { font-size: 10px; color: ${COLORS.muted}; font-weight: 500; }
        .corp-txn { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid ${COLORS.border}; }
        .corp-txn:last-child { border-bottom: none; }
        .corp-txn-left { display: flex; flex-direction: column; gap: 2px; }
        .corp-txn-vehicle { font-size: 13px; font-weight: 600; }
        .corp-txn-meta { font-size: 11px; color: ${COLORS.muted}; }
        .corp-txn-amount { font-size: 15px; font-weight: 700; color: ${COLORS.greenDark}; }
        .corp-zone-tabs { display: flex; gap: 8px; margin-bottom: 12px; }
        .corp-zone-tab { padding: 8px 18px; border-radius: 20px; font-size: 13px; font-weight: 600; border: 2px solid ${COLORS.border}; background: #fff; cursor: pointer; color: ${COLORS.muted}; }
        .corp-zone-tab.active { border-color: ${COLORS.green}; background: ${COLORS.greenSoft}; color: ${COLORS.greenDark}; }
        .corp-floor-tabs { display: flex; gap: 6px; margin-bottom: 12px; }
        .corp-floor-tab { padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 700; border: 1.5px solid ${COLORS.border}; background: #fff; cursor: pointer; color: ${COLORS.muted}; }
        .corp-floor-tab.active { border-color: ${COLORS.blue}; background: #e3f2fd; color: #1565c0; }
        .corp-spot-detail { background: ${COLORS.card}; border-radius: 14px; padding: 18px; border: 1px solid ${COLORS.border}; margin-top: 12px; }
        .corp-revenue-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 16px; }
        .corp-revenue-card { background: ${COLORS.card}; border-radius: 10px; padding: 14px 10px; text-align: center; border: 1px solid ${COLORS.border}; }
        .corp-revenue-card .period { font-size: 11px; color: ${COLORS.muted}; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }
        .corp-revenue-card .amount { font-size: 20px; font-weight: 800; color: ${COLORS.greenDark}; margin-top: 4px; }
        .corp-empty { text-align: center; padding: 40px 20px; color: ${COLORS.muted}; }
        .corp-filter-pills { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
        .corp-filter-pill { padding: 5px 12px; border-radius: 16px; font-size: 11px; font-weight: 600; border: 1.5px solid ${COLORS.border}; background: #fff; cursor: pointer; color: ${COLORS.muted}; }
        .corp-filter-pill.active { border-color: ${COLORS.green}; background: ${COLORS.greenSoft}; color: ${COLORS.greenDark}; }
        .corp-guide-step { display: flex; align-items: flex-start; gap: 12px; padding: 14px 0; border-bottom: 1px solid ${COLORS.border}; }
        .corp-guide-step:last-child { border-bottom: none; }
        .corp-guide-num { width: 28px; height: 28px; border-radius: 50%; background: ${COLORS.green}; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; }
        .corp-guide-step.active .corp-guide-num { background: ${COLORS.blue}; animation: guidePulse 1.5s infinite; }
        @keyframes guidePulse { 0%,100%{box-shadow:0 0 0 0 rgba(64,152,223,0.4)} 50%{box-shadow:0 0 0 8px rgba(64,152,223,0)} }
        @media (min-width: 600px) {
          .corp-cards { grid-template-columns: 1fr 1fr 1fr 1fr; }
        }
      `}</style>

      <div className="corp-page">
        {/* Top Bar */}
        <div className="corp-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 4 }} aria-label="Open menu">
              <Icon name="menu" size={22} stroke={2} />
            </button>
            <div>
              <h1>ParkAddis Corporate</h1>
              <div className="corp-topbar-sub">Parking Management</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#5cff7f", boxShadow: "0 0 6px #5cff7f" }} />
            <span style={{ fontSize: 11, opacity: 0.8 }}>Live</span>
          </div>
        </div>

        {sidebarOpen && <div className="corp-backdrop" onClick={() => setSidebarOpen(false)} />}

        <div className={`corp-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="corp-sidebar-header">
            <h2>ParkAddis</h2>
            <p>Corporate Dashboard</p>
          </div>
          <nav className="corp-nav">
            {NAV_ITEMS.map((item) => (
              <button key={item.key} className={`corp-nav-item ${section === item.key ? "active" : ""}`} onClick={() => navigateTo(item.key)}>
                <Icon name={item.icon} size={20} />
                {item.label}
              </button>
            ))}
          </nav>
          <div style={{ padding: "12px 16px", borderTop: `1px solid ${COLORS.border}` }}>
            <button className="corp-nav-item" style={{ color: COLORS.muted, marginBottom: 4 }} onClick={() => { window.location.href = "/attendant"; }}>
              <Icon name="check" size={20} />
              Attendant
            </button>
            <button className="corp-nav-item" style={{ color: COLORS.red }} onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/app"; }}>
              <Icon name="logout" size={20} />
              Sign Out
            </button>
          </div>
        </div>

        <div className="corp-content">
          {/* ─── Live Dashboard ─── */}
          {section === "dashboard" && (
            <>
              <div className="corp-section-title">Live Dashboard</div>
              <div className="corp-cards">
                <div className="corp-stat-card blue"><div className="label">Total Spots</div><div className="value">{totalSpots}</div></div>
                <div className="corp-stat-card red"><div className="label">Occupied</div><div className="value">{occupied}</div></div>
                <div className="corp-stat-card green"><div className="label">Available</div><div className="value">{available}</div></div>
                <div className="corp-stat-card yellow"><div className="label">Revenue Today</div><div className="value">{revenueToday} Br</div></div>
              </div>

              <div className="corp-card">
                <h3>Occupancy by Floor</h3>
                {lot.floors.map((floor) => {
                  let floorOccupied = 0;
                  let floorTotal = 0;
                  for (const zone of lot.zones) {
                    const grid = lot.floorMap[floor]?.[zone] || [];
                    grid.forEach((row) => row.forEach((spot) => {
                      if (spot.type !== "lane" && spot.type !== "entrance" && spot.type !== "exit" && spot.id) {
                        floorTotal++;
                        if (spot.status === "occupied") floorOccupied++;
                      }
                    }));
                  }
                  const pct = floorTotal > 0 ? (floorOccupied / floorTotal) * 100 : 0;
                  return (
                    <div key={floor} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, width: 70, color: COLORS.muted }}>Floor {floor}</span>
                      <div style={{ flex: 1, height: 10, background: COLORS.border, borderRadius: 5, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: pct > 80 ? COLORS.red : pct > 50 ? COLORS.yellow : COLORS.green, borderRadius: 5, transition: "width 0.4s" }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, minWidth: 45, textAlign: "right" }}>{floorOccupied}/{floorTotal}</span>
                    </div>
                  );
                })}
              </div>

              <div className="corp-card">
                <h3>Active Locations ({apiSpots.length} spots from map)</h3>
                {apiSpots.length === 0 && <div style={{ padding: 12, color: COLORS.muted, fontSize: 13 }}>Loading map spots...</div>}
                {apiSpots.map((spot) => (
                  <div key={spot.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: spot.availableSpots > 0 ? COLORS.greenSoft : COLORS.redSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon name="car" size={18} stroke={2} />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{spot.name}</div>
                        <div style={{ fontSize: 11, color: COLORS.muted }}>{spot.address}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: spot.availableSpots > 0 ? COLORS.greenDark : COLORS.red }}>{spot.availableSpots} / {spot.totalSpots || spot.availableSpots}</div>
                      <div style={{ fontSize: 10, color: COLORS.muted }}>available</div>
                    </div>
                  </div>
                ))}
                {locations.map((loc) => (
                  <div key={loc.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: COLORS.greenSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon name="building" size={18} stroke={2} />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{loc.name}</div>
                        <div style={{ fontSize: 11, color: COLORS.muted }}>{loc.address}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.red }}>{loc.occupied}/{loc.totalSpots}</div>
                      <div style={{ fontSize: 10, color: COLORS.muted }}>spots</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─── Parking Lot ─── */}
          {section === "spots" && (
            <>
              <div className="corp-section-title">Parking Lot — {lot.name}</div>

              <div className="corp-card" style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <h3 style={{ margin: 0 }}>Floor {selectedFloor}</h3>
                  <div style={{ fontSize: 12, color: COLORS.muted }}>
                    {allSpots.filter((s) => s.status === "occupied").length} occupied · {allSpots.filter((s) => s.status === "available").length} available
                  </div>
                </div>

                <div className="corp-floor-tabs">
                  {lot.floors.map((f) => (
                    <button key={f} className={`corp-floor-tab ${selectedFloor === f ? "active" : ""}`} onClick={() => { setSelectedFloor(f); setSelectedSpot(null); }}>
                      Floor {f}
                    </button>
                  ))}
                </div>

                <div className="corp-zone-tabs">
                  {lot.zones.map((z) => (
                    <button key={z} className={`corp-zone-tab ${selectedZone === z ? "active" : ""}`} onClick={() => { setSelectedZone(z); setSelectedSpot(null); }}>
                      Zone {z}
                    </button>
                  ))}
                </div>

                <ParkingLotGrid
                  config={lot}
                  selectedFloor={selectedFloor}
                  selectedZone={selectedZone}
                  onSelectSpot={(s) => {
                    if (s.type !== "lane" && s.type !== "entrance" && s.type !== "exit") {
                      setSelectedSpot(s);
                    }
                  }}
                />
              </div>

              {selectedSpot && (
                <div className="corp-spot-detail">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 18 }}>Spot {selectedSpot.id}</h3>
                      <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>Floor {selectedSpot.floor} · Zone {selectedSpot.zone} · {selectedSpot.type}</div>
                    </div>
                    <span style={{
                      padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                      background: selectedSpot.status === "available" ? COLORS.greenSoft : selectedSpot.status === "occupied" ? "#fde8e6" : "#fff8e1",
                      color: selectedSpot.status === "available" ? COLORS.greenDark : selectedSpot.status === "occupied" ? COLORS.red : "#b8860b",
                    }}>
                      {selectedSpot.status.toUpperCase()}
                    </span>
                  </div>
                  {selectedSpot.plate && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#fde8e6", borderRadius: 8, marginBottom: 12 }}>
                      <Icon name="car" size={16} />
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{selectedSpot.plate}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="corp-btn corp-btn-primary" style={{ flex: 1 }} onClick={() => handleAssignDriver(selectedSpot.id)}>
                      <Icon name="nav" size={16} /> Assign & Guide Driver
                    </button>
                  </div>
                </div>
              )}

              <div className="corp-card" style={{ marginTop: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <h3 style={{ margin: 0 }}>Indoor Lot Guide</h3>
                  <button onClick={() => setShowIndoor(!showIndoor)} style={{ fontSize: 12, fontWeight: 700, color: COLORS.green, background: "none", border: "none", cursor: "pointer" }}>
                    {showIndoor ? "Hide" : "Show"} Indoor Map
                  </button>
                </div>
                {showIndoor && (
                  <IndoorLotGuide
                    selectedFloor={indoorFloor}
                    setSelectedFloor={setIndoorFloor}
                    selectedSpotCode={indoorSpot}
                    setSelectedSpotCode={setIndoorSpot}
                    interactive={true}
                  />
                )}
              </div>

              <div className="corp-card" style={{ marginTop: 12 }}>
                <h3>Zone Summary</h3>
                {lot.zones.map((z) => {
                  let zOccupied = 0;
                  let zTotal = 0;
                  for (const floor of lot.floors) {
                    const grid = lot.floorMap[floor]?.[z] || [];
                    grid.forEach((row) => row.forEach((spot) => {
                      if (spot.type !== "lane" && spot.type !== "entrance" && spot.type !== "exit" && spot.id) {
                        zTotal++;
                        if (spot.status === "occupied") zOccupied++;
                      }
                    }));
                  }
                  return (
                    <div key={z} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: COLORS.greenSoft, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: COLORS.greenDark }}>{z}</div>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>Zone {z}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 80, height: 6, background: COLORS.border, borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ width: `${(zOccupied / zTotal) * 100}%`, height: "100%", background: zOccupied > 0 ? COLORS.red : COLORS.green, borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, minWidth: 40, textAlign: "right" }}>{zOccupied}/{zTotal}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ─── Driver Guide ─── */}
          {section === "guide" && (
            <>
              <div className="corp-section-title">Driver Guidance</div>

              {guideSpot ? (
                <div className="corp-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "#e3f2fd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name="nav" size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0 }}>Spot {guideSpot} Assigned</h3>
                      <div style={{ fontSize: 12, color: COLORS.muted }}>Follow these steps to guide the driver</div>
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

                  <div style={{ marginTop: 16 }}>
                    {[
                      { num: 1, title: "Driver enters the lot", desc: "Direct driver to the main entrance", active: false },
                      { num: 2, title: `Guide to Floor ${selectedFloor}`, desc: selectedFloor === "G" ? "Ground floor — no elevator needed" : `Take elevator to Floor ${selectedFloor}`, active: selectedFloor !== "G" },
                      { num: 3, title: `Navigate to Zone ${selectedZone}`, desc: `Follow arrows to Zone ${selectedZone} section`, active: true },
                      { num: 4, title: `Park at Spot ${guideSpot}`, desc: "Driver parks and confirms via the app", active: false },
                    ].map((step) => (
                      <div key={step.num} className={`corp-guide-step ${step.active ? "active" : ""}`}>
                        <div className="corp-guide-num">{step.num}</div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700 }}>{step.title}</div>
                          <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>{step.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                    <button className="corp-btn" style={{ flex: 1, background: COLORS.border, color: COLORS.ink }} onClick={() => { setGuideSpot(undefined); setShowGuidance(false); setSection("spots"); }}>
                      Back to Lot
                    </button>
                    <button className="corp-btn corp-btn-primary" style={{ flex: 1 }}>
                      Send SMS to Driver
                    </button>
                  </div>
                </div>
              ) : (
                <div className="corp-card">
                  <div className="corp-empty">
                    <Icon name="nav" size={48} />
                    <p style={{ marginTop: 12, fontSize: 14 }}>Select a spot from the Parking Lot to assign and guide a driver</p>
                    <button className="corp-btn corp-btn-primary" style={{ marginTop: 16, width: "auto", padding: "10px 24px" }} onClick={() => setSection("spots")}>
                      Open Parking Lot
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ─── Location Management ─── */}
          {section === "locations" && (
            <>
              <div className="corp-section-title">Location Management</div>
              {locations.map((loc) => (
                <div key={loc.id} className="corp-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <Icon name="building" size={18} stroke={2} />
                    <div>
                      <h3 style={{ margin: 0 }}>{loc.name}</h3>
                      <div style={{ fontSize: 12, color: COLORS.muted }}>{loc.address}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 16, fontSize: 12, color: COLORS.muted, marginBottom: 8 }}>
                    <span>Lat: {loc.lat}</span>
                    <span>Lng: {loc.lng}</span>
                  </div>
                  <div style={{ width: "100%", height: 140, background: COLORS.greenSoft, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", border: `1px dashed ${COLORS.green}` }}>
                    <Icon name="map" size={20} />
                    <span style={{ marginLeft: 6, fontSize: 14, fontWeight: 600, color: COLORS.greenDark }}>Map View</span>
                  </div>
                </div>
              ))}
              <div className="corp-card">
                <h3>Add New Location</h3>
                <input className="corp-input" placeholder="Location name" value={newLocation.name} onChange={(e) => setNewLocation((p) => ({ ...p, name: e.target.value }))} />
                <input className="corp-input" placeholder="Address" value={newLocation.address} onChange={(e) => setNewLocation((p) => ({ ...p, address: e.target.value }))} />
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="corp-input" placeholder="Latitude" value={newLocation.lat} onChange={(e) => setNewLocation((p) => ({ ...p, lat: e.target.value }))} />
                  <input className="corp-input" placeholder="Longitude" value={newLocation.lng} onChange={(e) => setNewLocation((p) => ({ ...p, lng: e.target.value }))} />
                </div>
                <button className="corp-btn corp-btn-primary">Add Location</button>
              </div>
            </>
          )}

          {/* ─── Analytics ─── */}
          {section === "analytics" && (
            <>
              <div className="corp-section-title">User Analytics</div>
              <div className="corp-cards">
                <div className="corp-stat-card blue"><div className="label">Total Users</div><div className="value">1,247</div></div>
                <div className="corp-stat-card green"><div className="label">Active Now</div><div className="value">38</div></div>
                <div className="corp-stat-card yellow"><div className="label">Active Bookings</div><div className="value">{occupied}</div></div>
                <div className="corp-stat-card red"><div className="label">Avg Duration</div><div className="value">2.4h</div></div>
              </div>
              <div className="corp-card">
                <h3>Peak Hours</h3>
                <div className="corp-bar-chart">
                  {PEAK_HOURS.map((h) => (
                    <div key={h.hour} className="corp-bar-col">
                      <div className="corp-bar" style={{ height: `${h.value}%`, background: h.value > 80 ? COLORS.red : h.value > 50 ? COLORS.yellow : COLORS.green }} />
                      <div className="corp-bar-label">{h.hour}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="corp-card">
                <h3>Booking Trends</h3>
                {[{ day: "Mon", value: 62 }, { day: "Tue", value: 74 }, { day: "Wed", value: 81 }, { day: "Thu", value: 68 }, { day: "Fri", value: 95 }, { day: "Sat", value: 45 }, { day: "Sun", value: 30 }].map((d) => (
                  <div key={d.day} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ width: 30, fontSize: 12, fontWeight: 600, color: COLORS.muted }}>{d.day}</span>
                    <div style={{ flex: 1, height: 8, background: COLORS.border, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: `${d.value}%`, height: "100%", background: d.value > 80 ? COLORS.green : d.value > 50 ? COLORS.blue : COLORS.muted, borderRadius: 4 }} />
                    </div>
                    <span style={{ width: 30, fontSize: 12, fontWeight: 600, textAlign: "right" }}>{d.value}%</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─── Revenue ─── */}
          {section === "revenue" && (
            <>
              <div className="corp-section-title">Revenue Reports</div>
              <div className="corp-revenue-row">
                <div className="corp-revenue-card"><div className="period">Today</div><div className="amount">{revenueToday} Br</div></div>
                <div className="corp-revenue-card"><div className="period">This Week</div><div className="amount">{revenueWeek} Br</div></div>
                <div className="corp-revenue-card"><div className="period">This Month</div><div className="amount">{revenueMonth.toLocaleString()} Br</div></div>
              </div>
              <div className="corp-card">
                <h3>Recent Transactions</h3>
                {transactions.map((t) => (
                  <div key={t.id} className="corp-txn">
                    <div className="corp-txn-left">
                      <div className="corp-txn-vehicle">{t.vehicle}</div>
                      <div className="corp-txn-meta">Spot {t.spot} · {t.time} · {t.method}</div>
                    </div>
                    <div className="corp-txn-amount">+{t.amount} Br</div>
                  </div>
                ))}
              </div>
            </>
          )}
          {/* ─── Attendance ─── */}
          {section === "attendance" && (
            <>
              <div className="corp-section-title">Attendant Attendance</div>
              <div className="corp-cards">
                <div className="corp-stat-card green"><div className="label">On Duty</div><div className="value">3</div></div>
                <div className="corp-stat-card blue"><div className="label">Checked In Today</div><div className="value">5</div></div>
                <div className="corp-stat-card yellow"><div className="label">Late Arrivals</div><div className="value">1</div></div>
                <div className="corp-stat-card red"><div className="label">Absent</div><div className="value">0</div></div>
              </div>

              <div className="corp-card">
                <h3>Today&apos;s Attendance Log</h3>
                {[
                  { name: "Abebe Kebede", shift: "Morning (6AM–2PM)", checkIn: "5:58 AM", checkOut: "—", status: "On Duty", avatar: "AK" },
                  { name: "Fatuma Ahmed", shift: "Morning (6AM–2PM)", checkIn: "6:12 AM", checkOut: "—", status: "On Duty", late: true, avatar: "FA" },
                  { name: "Dawit Tadesse", shift: "Afternoon (2PM–10PM)", checkIn: "1:55 PM", checkOut: "—", status: "On Duty", avatar: "DT" },
                  { name: "Sara Mohammed", shift: "Morning (6AM–2PM)", checkIn: "6:01 AM", checkOut: "2:05 PM", status: "Completed", avatar: "SM" },
                  { name: "Yonas Girma", shift: "Evening (10PM–6AM)", checkIn: "—", checkOut: "—", status: "Scheduled", avatar: "YG" },
                ].map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: a.status === "On Duty" ? COLORS.greenSoft : a.status === "Completed" ? "#e3f2fd" : COLORS.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: a.status === "On Duty" ? COLORS.greenDark : COLORS.muted }}>{a.avatar}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                          {a.name}
                          {a.late && <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "#fff8e1", color: "#b8860b", fontWeight: 700 }}>LATE</span>}
                        </div>
                        <div style={{ fontSize: 11, color: COLORS.muted }}>{a.shift}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: a.status === "On Duty" ? COLORS.greenDark : a.status === "Completed" ? COLORS.blue : COLORS.muted }}>{a.status}</div>
                      <div style={{ fontSize: 11, color: COLORS.muted }}>In: {a.checkIn} · Out: {a.checkOut}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="corp-card">
                <h3>Weekly Overview</h3>
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                  const present = day === "Sun" ? 1 : 5;
                  const total = 5;
                  return (
                    <div key={day} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{ width: 30, fontSize: 12, fontWeight: 600, color: COLORS.muted }}>{day}</span>
                      <div style={{ flex: 1, height: 8, background: COLORS.border, borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${(present / total) * 100}%`, height: "100%", background: COLORS.green, borderRadius: 4 }} />
                      </div>
                      <span style={{ width: 30, fontSize: 12, fontWeight: 600, textAlign: "right" }}>{present}/{total}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
