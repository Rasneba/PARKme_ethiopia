"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";

type Section = "dashboard" | "locations" | "analytics" | "revenue" | "spots";

interface ParkingSpot {
  id: string;
  zone: string;
  occupied: boolean;
  vehicle?: string;
}

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
};

const NAV_ITEMS: { key: Section; icon: "grid" | "map" | "clock" | "wallet" | "car"; label: string }[] = [
  { key: "dashboard", icon: "grid", label: "Live Dashboard" },
  { key: "locations", icon: "map", label: "Locations" },
  { key: "analytics", icon: "clock", label: "Analytics" },
  { key: "revenue", icon: "wallet", label: "Revenue" },
  { key: "spots", icon: "car", label: "Spot Control" },
];

const INITIAL_SPOTS: ParkingSpot[] = [
  { id: "A1", zone: "A", occupied: true, vehicle: "AA-1234" },
  { id: "A2", zone: "A", occupied: false },
  { id: "A3", zone: "A", occupied: true, vehicle: "AA-5678" },
  { id: "A4", zone: "A", occupied: false },
  { id: "B1", zone: "B", occupied: false },
  { id: "B2", zone: "B", occupied: true, vehicle: "AA-9012" },
  { id: "B3", zone: "B", occupied: false },
  { id: "B4", zone: "B", occupied: false },
];

const INITIAL_LOCATIONS: ParkingLocation[] = [
  { id: "loc1", name: "Kazanchis", address: "Bole Road, Kazanchis, Addis Ababa", lat: "9.0192", lng: "38.7525", totalSpots: 8, occupied: 3 },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: "t1", time: "10:32 AM", amount: 50, vehicle: "AA-1234", spot: "A1", method: "TeleBirr" },
  { id: "t2", time: "11:15 AM", amount: 75, vehicle: "AA-5678", spot: "A3", method: "Cash" },
  { id: "t3", time: "12:03 PM", amount: 50, vehicle: "AA-9012", spot: "B2", method: "CBE Birr" },
  { id: "t4", time: "1:45 PM", amount: 30, vehicle: "AA-3344", spot: "A2", method: "TeleBirr" },
  { id: "t5", time: "2:20 PM", amount: 60, vehicle: "AA-7788", spot: "B3", method: "Cash" },
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
  const [spots, setSpots] = useState<ParkingSpot[]>(INITIAL_SPOTS);
  const [locations, setLocations] = useState<ParkingLocation[]>(INITIAL_LOCATIONS);
  const [transactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [activeZone, setActiveZone] = useState<string>("A");
  const [newLocation, setNewLocation] = useState({ name: "", address: "", lat: "", lng: "" });

  const totalSpots = spots.length;
  const occupied = spots.filter((s) => s.occupied).length;
  const available = totalSpots - occupied;
  const revenueToday = transactions.reduce((sum, t) => sum + t.amount, 0);
  const revenueWeek = revenueToday * 5;
  const revenueMonth = revenueWeek * 4;

  function navigateTo(key: Section) {
    setSection(key);
    setSidebarOpen(false);
  }

  function toggleSpot(id: string) {
    setSpots((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, occupied: !s.occupied, vehicle: s.occupied ? undefined : "AA-" + Math.floor(1000 + Math.random() * 9000) } : s
      )
    );
  }

  function addLocation() {
    if (!newLocation.name.trim()) return;
    setLocations((prev) => [
      ...prev,
      { id: "loc" + Date.now(), ...newLocation, totalSpots: 0, occupied: 0 },
    ]);
    setNewLocation({ name: "", address: "", lat: "", lng: "" });
  }

  function handleNav(key: Section) {
    navigateTo(key);
  }

  const filteredSpots = spots.filter((s) => s.zone === activeZone);
  const zones = Array.from(new Set(spots.map((s) => s.zone)));

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
        .corp-card-full { grid-column: 1 / -1; }
        .corp-card { background: ${COLORS.card}; border-radius: 12px; padding: 16px; border: 1px solid ${COLORS.border}; margin-bottom: 12px; }
        .corp-card h3 { font-size: 14px; font-weight: 700; margin-bottom: 10px; }
        .corp-input { width: 100%; padding: 10px 12px; border: 1px solid ${COLORS.border}; border-radius: 8px; font-size: 14px; outline: none; background: #fff; color: ${COLORS.ink}; margin-bottom: 8px; }
        .corp-input:focus { border-color: ${COLORS.green}; }
        .corp-btn { padding: 10px 20px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
        .corp-btn:active { opacity: 0.85; }
        .corp-btn-primary { background: ${COLORS.green}; color: #fff; width: 100%; }
        .corp-map-placeholder { width: 100%; height: 180px; background: ${COLORS.greenSoft}; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; color: ${COLORS.greenDark}; margin-bottom: 12px; border: 1px dashed ${COLORS.green}; }
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
        .corp-spot-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .corp-spot { border-radius: 10px; padding: 12px 8px; text-align: center; cursor: pointer; border: 2px solid; transition: all 0.15s; }
        .corp-spot.available { border-color: ${COLORS.green}; background: ${COLORS.greenSoft}; }
        .corp-spot.occupied { border-color: ${COLORS.red}; background: #fde8e6; }
        .corp-spot-id { font-size: 14px; font-weight: 700; }
        .corp-spot.available .corp-spot-id { color: ${COLORS.greenDark}; }
        .corp-spot.occupied .corp-spot-id { color: ${COLORS.red}; }
        .corp-spot-status { font-size: 10px; font-weight: 500; margin-top: 4px; text-transform: uppercase; }
        .corp-spot.available .corp-spot-status { color: ${COLORS.green}; }
        .corp-spot.occupied .corp-spot-status { color: ${COLORS.red}; }
        .corp-spot-vehicle { font-size: 10px; color: ${COLORS.muted}; margin-top: 2px; }
        .corp-revenue-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 16px; }
        .corp-revenue-card { background: ${COLORS.card}; border-radius: 10px; padding: 14px 10px; text-align: center; border: 1px solid ${COLORS.border}; }
        .corp-revenue-card .period { font-size: 11px; color: ${COLORS.muted}; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }
        .corp-revenue-card .amount { font-size: 20px; font-weight: 800; color: ${COLORS.greenDark}; margin-top: 4px; }
        .corp-empty { text-align: center; padding: 40px 20px; color: ${COLORS.muted}; }
        @media (min-width: 600px) {
          .corp-cards { grid-template-columns: 1fr 1fr 1fr 1fr; }
          .corp-spot-grid { grid-template-columns: repeat(6, 1fr); }
        }
      `}</style>

      <div className="corp-page">
        {/* Top Bar */}
        <div className="corp-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 4 }}
              aria-label="Open menu"
            >
              <Icon name="menu" size={22} stroke={2} />
            </button>
            <div>
              <h1>ParkMe Corporate</h1>
              <div className="corp-topbar-sub">Parking Management</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#5cff7f",
                boxShadow: "0 0 6px #5cff7f",
              }}
            />
            <span style={{ fontSize: 11, opacity: 0.8 }}>Live</span>
          </div>
        </div>

        {/* Sidebar Backdrop */}
        {sidebarOpen && <div className="corp-backdrop" onClick={() => setSidebarOpen(false)} />}

        {/* Sidebar */}
        <div className={`corp-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="corp-sidebar-header">
            <h2>ParkMe</h2>
            <p>Corporate Dashboard</p>
          </div>
          <nav className="corp-nav">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                className={`corp-nav-item ${section === item.key ? "active" : ""}`}
                onClick={() => handleNav(item.key)}
              >
                <Icon name={item.icon} size={20} />
                {item.label}
              </button>
            ))}
          </nav>
          <div style={{ padding: "12px 16px", borderTop: `1px solid ${COLORS.border}` }}>
            <button className="corp-nav-item" style={{ color: COLORS.red }}>
              <Icon name="logout" size={20} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="corp-content">
          {/* ─── Live Dashboard ─── */}
          {section === "dashboard" && (
            <>
              <div className="corp-section-title">Live Dashboard</div>
              <div className="corp-cards">
                <div className="corp-stat-card blue">
                  <div className="label">Total Spots</div>
                  <div className="value">{totalSpots}</div>
                </div>
                <div className="corp-stat-card red">
                  <div className="label">Occupied</div>
                  <div className="value">{occupied}</div>
                </div>
                <div className="corp-stat-card green">
                  <div className="label">Available</div>
                  <div className="value">{available}</div>
                </div>
                <div className="corp-stat-card yellow">
                  <div className="label">Revenue Today</div>
                  <div className="value">{revenueToday} Br</div>
                </div>
              </div>

              <div className="corp-card">
                <h3>Occupancy Overview</h3>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <div
                    style={{
                      flex: occupied,
                      height: 12,
                      borderRadius: 6,
                      background: COLORS.red,
                      transition: "flex 0.3s",
                    }}
                  />
                  <div
                    style={{
                      flex: available,
                      height: 12,
                      borderRadius: 6,
                      background: COLORS.green,
                      transition: "flex 0.3s",
                    }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: COLORS.muted }}>
                  <span>● Occupied ({occupied})</span>
                  <span>● Available ({available})</span>
                </div>
              </div>

              <div className="corp-card">
                <h3>Active Locations</h3>
                {locations.map((loc) => (
                  <div
                    key={loc.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 0",
                      borderBottom: `1px solid ${COLORS.border}`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: COLORS.greenSoft,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon name="building" size={18} stroke={2} />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{loc.name}</div>
                        <div style={{ fontSize: 11, color: COLORS.muted }}>{loc.address}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: loc.occupied > 0 ? COLORS.red : COLORS.green }}>
                        {loc.occupied}/{loc.totalSpots}
                      </div>
                      <div style={{ fontSize: 10, color: COLORS.muted }}>spots</div>
                    </div>
                  </div>
                ))}
              </div>
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
                  <div className="corp-map-placeholder">
                    <Icon name="map" size={20} />
                    <span style={{ marginLeft: 6 }}>Map</span>
                  </div>
                </div>
              ))}

              <div className="corp-card">
                <h3>Add New Location</h3>
                <input
                  className="corp-input"
                  placeholder="Location name"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation((p) => ({ ...p, name: e.target.value }))}
                />
                <input
                  className="corp-input"
                  placeholder="Address"
                  value={newLocation.address}
                  onChange={(e) => setNewLocation((p) => ({ ...p, address: e.target.value }))}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    className="corp-input"
                    placeholder="Latitude"
                    value={newLocation.lat}
                    onChange={(e) => setNewLocation((p) => ({ ...p, lat: e.target.value }))}
                  />
                  <input
                    className="corp-input"
                    placeholder="Longitude"
                    value={newLocation.lng}
                    onChange={(e) => setNewLocation((p) => ({ ...p, lng: e.target.value }))}
                  />
                </div>
                <div className="corp-map-placeholder" style={{ height: 120, marginBottom: 12 }}>
                  <Icon name="crosshair" size={18} />
                  <span style={{ marginLeft: 6 }}>Pin Location on Map</span>
                </div>
                <button className="corp-btn corp-btn-primary" onClick={addLocation}>
                  Add Location
                </button>
              </div>
            </>
          )}

          {/* ─── User Analytics ─── */}
          {section === "analytics" && (
            <>
              <div className="corp-section-title">User Analytics</div>
              <div className="corp-cards">
                <div className="corp-stat-card blue">
                  <div className="label">Total Users</div>
                  <div className="value">1,247</div>
                </div>
                <div className="corp-stat-card green">
                  <div className="label">Active Now</div>
                  <div className="value">38</div>
                </div>
                <div className="corp-stat-card yellow">
                  <div className="label">Active Bookings</div>
                  <div className="value">{occupied}</div>
                </div>
                <div className="corp-stat-card red">
                  <div className="label">Avg Duration</div>
                  <div className="value">2.4h</div>
                </div>
              </div>

              <div className="corp-card">
                <h3>Peak Hours</h3>
                <div className="corp-bar-chart">
                  {PEAK_HOURS.map((h) => (
                    <div key={h.hour} className="corp-bar-col">
                      <div
                        className="corp-bar"
                        style={{
                          height: `${h.value}%`,
                          background:
                            h.value > 80
                              ? COLORS.red
                              : h.value > 50
                              ? COLORS.yellow
                              : COLORS.green,
                        }}
                      />
                      <div className="corp-bar-label">{h.hour}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="corp-card">
                <h3>Booking Trends</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { day: "Mon", value: 62 },
                    { day: "Tue", value: 74 },
                    { day: "Wed", value: 81 },
                    { day: "Thu", value: 68 },
                    { day: "Fri", value: 95 },
                    { day: "Sat", value: 45 },
                    { day: "Sun", value: 30 },
                  ].map((d) => (
                    <div key={d.day} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 30, fontSize: 12, fontWeight: 600, color: COLORS.muted }}>{d.day}</span>
                      <div style={{ flex: 1, height: 8, background: COLORS.border, borderRadius: 4, overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${d.value}%`,
                            height: "100%",
                            background: d.value > 80 ? COLORS.green : d.value > 50 ? COLORS.blue : COLORS.muted,
                            borderRadius: 4,
                            transition: "width 0.4s",
                          }}
                        />
                      </div>
                      <span style={{ width: 30, fontSize: 12, fontWeight: 600, textAlign: "right" }}>{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ─── Revenue Reports ─── */}
          {section === "revenue" && (
            <>
              <div className="corp-section-title">Revenue Reports</div>
              <div className="corp-revenue-row">
                <div className="corp-revenue-card">
                  <div className="period">Today</div>
                  <div className="amount">{revenueToday} Br</div>
                </div>
                <div className="corp-revenue-card">
                  <div className="period">This Week</div>
                  <div className="amount">{revenueWeek} Br</div>
                </div>
                <div className="corp-revenue-card">
                  <div className="period">This Month</div>
                  <div className="amount">{revenueMonth.toLocaleString()} Br</div>
                </div>
              </div>

              <div className="corp-card">
                <h3>Recent Transactions</h3>
                {transactions.map((t) => (
                  <div key={t.id} className="corp-txn">
                    <div className="corp-txn-left">
                      <div className="corp-txn-vehicle">{t.vehicle}</div>
                      <div className="corp-txn-meta">
                        Spot {t.spot} · {t.time} · {t.method}
                      </div>
                    </div>
                    <div className="corp-txn-amount">+{t.amount} Br</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─── Spot Control ─── */}
          {section === "spots" && (
            <>
              <div className="corp-section-title">Spot Control</div>
              <div className="corp-card" style={{ marginBottom: 16 }}>
                <h3 style={{ marginBottom: 8 }}>Kazanchis</h3>
                <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 12 }}>
                  {occupied} occupied · {available} available · {totalSpots} total
                </div>
                <div className="corp-zone-tabs">
                  {zones.map((z) => (
                    <button
                      key={z}
                      className={`corp-zone-tab ${activeZone === z ? "active" : ""}`}
                      onClick={() => setActiveZone(z)}
                    >
                      Zone {z}
                    </button>
                  ))}
                </div>
                <div className="corp-spot-grid">
                  {filteredSpots.map((spot) => (
                    <div
                      key={spot.id}
                      className={`corp-spot ${spot.occupied ? "occupied" : "available"}`}
                      onClick={() => toggleSpot(spot.id)}
                    >
                      <div className="corp-spot-id">{spot.id}</div>
                      <div className="corp-spot-status">
                        {spot.occupied ? (
                          <Icon name="close" size={12} stroke={2.5} />
                        ) : (
                          <Icon name="check" size={12} stroke={2.5} />
                        )}
                      </div>
                      <div className="corp-spot-status">{spot.occupied ? "Occupied" : "Open"}</div>
                      {spot.vehicle && <div className="corp-spot-vehicle">{spot.vehicle}</div>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="corp-card">
                <h3>Zone Summary</h3>
                {zones.map((z) => {
                  const zoneSpots = spots.filter((s) => s.zone === z);
                  const zoneOccupied = zoneSpots.filter((s) => s.occupied).length;
                  return (
                    <div
                      key={z}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 0",
                        borderBottom: `1px solid ${COLORS.border}`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: COLORS.greenSoft,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: 13,
                            color: COLORS.greenDark,
                          }}
                        >
                          {z}
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>Zone {z}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 80,
                            height: 6,
                            background: COLORS.border,
                            borderRadius: 3,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${(zoneOccupied / zoneSpots.length) * 100}%`,
                              height: "100%",
                              background: zoneOccupied > 0 ? COLORS.red : COLORS.green,
                              borderRadius: 3,
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, minWidth: 40, textAlign: "right" }}>
                          {zoneOccupied}/{zoneSpots.length}
                        </span>
                      </div>
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
