"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";

const GEBETA_TOKEN = process.env.NEXT_PUBLIC_GEBETA_MAP_TOKEN || process.env.NEXT_PUBLIC_GEBETA_TOKEN || "";

const CATEGORIES = [
  { key: "standard", label: "Standard", icon: "car" as const },
  { key: "ev_charging", label: "EV Charging", icon: "sparkle" as const },
  { key: "cctv", label: "CCTV Covered", icon: "shield" as const },
  { key: "24hr", label: "24/7 Open", icon: "clock" as const },
  { key: "wheelchair", label: "Accessible", icon: "check" as const },
];

const KINDS = ["Open air", "Garage", "Covered", "Indoor", "Driveway", "Lot"];

type Tab = "overview" | "listings" | "add" | "calendar";
type Status = "idle" | "geocoding" | "submitting" | "done" | "error";

interface HostListing {
  id: string;
  name: string;
  address: string;
  kind: string;
  category: string;
  price: number;
  totalSpots: number;
  availableSpots: number;
  active: boolean;
  revenue: number;
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

export default function HostPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [listings, setListings] = useState<HostListing[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [tempDate, setTempDate] = useState("");

  useEffect(() => {
    fetch("/api/spots")
      .then((r) => r.ok ? r.json() : { spots: [] })
      .then((d) => {
        const spots = d.spots ?? [];
        setListings(spots.map((s: any, i: number) => ({
          id: String(s.id),
          name: s.name,
          address: s.address,
          kind: "Lot",
          category: "standard",
          price: s.price,
          totalSpots: s.totalSpots || 10,
          availableSpots: s.availableSpots || 5,
          active: true,
          revenue: Math.round(Math.random() * 2000 + 500),
        })));
      })
      .catch(() => {});
  }, []);

  const totalRevenue = listings.reduce((sum, l) => sum + l.revenue, 0);
  const totalSpots = listings.reduce((sum, l) => sum + l.totalSpots, 0);
  const totalOccupied = listings.reduce((sum, l) => sum + (l.totalSpots - l.availableSpots), 0);
  const activeListings = listings.filter((l) => l.active).length;
  const occupancyRate = totalSpots > 0 ? Math.round((totalOccupied / totalSpots) * 100) : 0;

  function navigateTo(key: Tab) {
    setTab(key);
    setSidebarOpen(false);
  }

  return (
    <>
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: ${COLORS.bg}; color: ${COLORS.ink}; }
        .host-page { min-height: 100vh; display: flex; flex-direction: column; }
        .host-topbar { position: sticky; top: 0; z-index: 40; display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: linear-gradient(135deg, #f7c531, #e6a817); color: #131614; }
        .host-topbar h1 { font-size: 16px; font-weight: 700; letter-spacing: -0.3px; }
        .host-topbar-sub { font-size: 11px; opacity: 0.7; }
        .host-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 50; backdrop-filter: blur(4px); }
        .host-sidebar { position: fixed; top: 0; left: 0; bottom: 0; width: 260px; background: linear-gradient(180deg, #fff 0%, #fffdf0 56%, #f5f6f5 100%); z-index: 60; transform: translateX(-100%); transition: transform 0.25s ease; display: flex; flex-direction: column; box-shadow: 8px 0 30px rgba(0,0,0,.15); }
        .host-sidebar.open { transform: translateX(0); }
        .host-sidebar-stripe { position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #f7c531 0 50%, #0fa24b 50%); }
        .host-sidebar-header { padding: 24px 20px 16px; border-bottom: 1px solid ${COLORS.border}; }
        .host-sidebar-header h2 { font-size: 18px; font-weight: 700; color: #b8860b; }
        .host-sidebar-header p { font-size: 12px; color: ${COLORS.muted}; margin-top: 2px; }
        .host-nav { flex: 1; padding: 8px 0; overflow-y: auto; }
        .host-nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; font-size: 14px; font-weight: 600; color: ${COLORS.ink}; cursor: pointer; transition: all .15s; border: none; background: transparent; width: 100%; text-align: left; border-left: 3px solid transparent; border-radius: 0 12px 12px 0; margin-right: 4px; }
        .host-nav-item:hover { background: #fff8e1; }
        .host-nav-item.active { background: linear-gradient(100deg, #fff8e1, #fde8a0); color: #8b6914; border-left-color: #f7c531; font-weight: 700; }
        .host-nav-item svg { flex-shrink: 0; }
        .host-content { flex: 1; padding: 16px; max-width: 800px; margin: 0 auto; width: 100%; }
        .host-section-title { font-size: 18px; font-weight: 700; margin-bottom: 16px; }
        .host-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
        .host-stat-card { background: ${COLORS.card}; border-radius: 12px; padding: 16px; border: 1px solid ${COLORS.border}; }
        .host-stat-card .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: ${COLORS.muted}; font-weight: 600; margin-bottom: 6px; }
        .host-stat-card .value { font-size: 26px; font-weight: 800; }
        .host-card { background: ${COLORS.card}; border-radius: 12px; padding: 16px; border: 1px solid ${COLORS.border}; margin-bottom: 12px; }
        .host-card h3 { font-size: 14px; font-weight: 700; margin-bottom: 10px; }
        .host-listing-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid ${COLORS.border}; }
        .host-listing-row:last-child { border-bottom: none; }
        .host-toggle { width: 44px; height: 24px; border-radius: 12px; border: none; cursor: pointer; position: relative; transition: background .2s; }
        .host-toggle.on { background: ${COLORS.green}; }
        .host-toggle.off { background: ${COLORS.border}; }
        .host-toggle::after { content: ''; position: absolute; top: 2px; width: 20px; height: 20px; border-radius: 50%; background: #fff; transition: left .2s; box-shadow: 0 1px 3px rgba(0,0,0,.2); }
        .host-toggle.on::after { left: 22px; }
        .host-toggle.off::after { left: 2px; }
        .host-form { background: ${COLORS.card}; border-radius: 12px; padding: 20px; border: 1px solid ${COLORS.border}; }
        .host-form h3 { font-size: 15px; font-weight: 700; margin-bottom: 14px; }
        .host-field label { display: block; font-size: 12px; font-weight: 600; color: ${COLORS.muted}; margin-bottom: 4px; }
        .host-field input, .host-field select { width: 100%; padding: 10px 12px; border: 1px solid ${COLORS.border}; border-radius: 8px; font-size: 14px; outline: none; background: #fff; color: ${COLORS.ink}; margin-bottom: 10px; }
        .host-field input:focus { border-color: ${COLORS.green}; }
        .host-btn { padding: 10px 20px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity .15s; }
        .host-btn:active { opacity: 0.85; }
        .host-btn-primary { background: ${COLORS.green}; color: #fff; width: 100%; }
        .host-date-row { display: flex; gap: 8px; align-items: center; }
        .host-date-tag { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; background: #fde8e6; border-radius: 6px; font-size: 12px; font-weight: 600; color: ${COLORS.red}; }
        @media (min-width: 600px) { .host-cards { grid-template-columns: 1fr 1fr 1fr 1fr; } }
      `}</style>

      <div className="host-page">
        <div className="host-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", color: "#131614", cursor: "pointer", padding: 4 }} aria-label="Open menu">
              <Icon name="menu" size={22} stroke={2} />
            </button>
            <div>
              <h1>ParkAddis Host</h1>
              <div className="host-topbar-sub">Space Owner Portal</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="wallet" size={16} />
            <span style={{ fontSize: 13, fontWeight: 700 }}>{totalRevenue.toLocaleString()} Br</span>
          </div>
        </div>

        {sidebarOpen && <div className="host-backdrop" onClick={() => setSidebarOpen(false)} />}

        <div className={`host-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="host-sidebar-stripe" />
          <div className="host-sidebar-header">
            <h2>ParkAddis Host</h2>
            <p>Space Owner Portal</p>
          </div>
          <nav className="host-nav">
            {([
              { key: "overview" as const, icon: "grid" as const, label: "Overview" },
              { key: "listings" as const, icon: "list" as const, label: "My Listings" },
              { key: "add" as const, icon: "plus" as const, label: "Add Space" },
              { key: "calendar" as const, icon: "calendar" as const, label: "Availability" },
            ]).map((item) => (
              <button key={item.key} className={`host-nav-item ${tab === item.key ? "active" : ""}`} onClick={() => navigateTo(item.key)}>
                <Icon name={item.icon} size={20} />
                {item.label}
              </button>
            ))}
          </nav>
          <div style={{ padding: "12px 16px", borderTop: `1px solid ${COLORS.border}` }}>
            <button className="host-nav-item" style={{ color: COLORS.muted, marginBottom: 4 }} onClick={() => { window.location.href = "/app"; }}>
              <Icon name="car" size={20} /> Driver App
            </button>
            <button className="host-nav-item" style={{ color: COLORS.red }} onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/app"; }}>
              <Icon name="logout" size={20} /> Sign Out
            </button>
          </div>
        </div>

        <div className="host-content">
          {/* ─── Overview ─── */}
          {tab === "overview" && (
            <>
              <div className="host-section-title">Host Overview</div>
              <div className="host-cards">
                <div className="host-stat-card" style={{ borderLeft: `4px solid ${COLORS.yellow}` }}>
                  <div className="label">Total Revenue</div>
                  <div className="value" style={{ color: COLORS.greenDark }}>{totalRevenue.toLocaleString()} Br</div>
                </div>
                <div className="host-stat-card" style={{ borderLeft: `4px solid ${COLORS.green}` }}>
                  <div className="label">Active Listings</div>
                  <div className="value">{activeListings}</div>
                </div>
                <div className="host-stat-card" style={{ borderLeft: `4px solid ${COLORS.blue}` }}>
                  <div className="label">Total Spots</div>
                  <div className="value">{totalSpots}</div>
                </div>
                <div className="host-stat-card" style={{ borderLeft: `4px solid ${COLORS.red}` }}>
                  <div className="label">Occupancy</div>
                  <div className="value">{occupancyRate}%</div>
                </div>
              </div>

              <div className="host-card">
                <h3>My Spaces</h3>
                {listings.length === 0 && <div style={{ padding: 20, color: COLORS.muted, fontSize: 13, textAlign: "center" }}>No listings yet. Add your first space!</div>}
                {listings.map((l) => (
                  <div key={l.id} className="host-listing-row">
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: l.active ? COLORS.greenSoft : COLORS.border, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon name="car" size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{l.name}</div>
                        <div style={{ fontSize: 11, color: COLORS.muted }}>{l.address} · {l.price} ETB/hr</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.greenDark }}>{l.availableSpots}/{l.totalSpots}</div>
                      <div style={{ fontSize: 10, color: COLORS.muted }}>available</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="host-card">
                <h3>Revenue Breakdown</h3>
                {listings.map((l) => (
                  <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ width: 120, fontSize: 12, fontWeight: 600, color: COLORS.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.name}</span>
                    <div style={{ flex: 1, height: 8, background: COLORS.border, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: `${totalRevenue > 0 ? (l.revenue / totalRevenue) * 100 : 0}%`, height: "100%", background: COLORS.green, borderRadius: 4 }} />
                    </div>
                    <span style={{ width: 60, fontSize: 12, fontWeight: 600, textAlign: "right" }}>{l.revenue} Br</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─── Listings ─── */}
          {tab === "listings" && (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div className="host-section-title" style={{ margin: 0 }}>My Listings</div>
                <button className="host-btn" style={{ background: COLORS.green, color: "#fff", padding: "8px 16px", fontSize: 13 }} onClick={() => setTab("add")}>
                  <Icon name="plus" size={14} /> Add Space
                </button>
              </div>
              {listings.length === 0 && (
                <div className="host-card" style={{ textAlign: "center", padding: 40 }}>
                  <Icon name="building" size={48} />
                  <p style={{ marginTop: 12, fontSize: 14, color: COLORS.muted }}>You have no listings yet.</p>
                  <button className="host-btn host-btn-primary" style={{ marginTop: 16, width: "auto", padding: "10px 24px" }} onClick={() => setTab("add")}>
                    Add your first space
                  </button>
                </div>
              )}
              {listings.map((l) => (
                <div key={l.id} className="host-card">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: l.active ? COLORS.greenSoft : COLORS.border, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon name="building" size={20} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0 }}>{l.name}</h3>
                        <div style={{ fontSize: 12, color: COLORS.muted }}>{l.address}</div>
                      </div>
                    </div>
                    <button className={`host-toggle ${l.active ? "on" : "off"}`} onClick={() => setListings((prev) => prev.map((x) => x.id === l.id ? { ...x, active: !x.active } : x))} aria-label={l.active ? "Deactivate" : "Activate"} />
                  </div>
                  <div style={{ display: "flex", gap: 16, fontSize: 12, color: COLORS.muted, marginBottom: 8 }}>
                    <span><Icon name="wallet" size={12} /> {l.price} ETB/hr</span>
                    <span><Icon name="car" size={12} /> {l.totalSpots} spots</span>
                    <span><Icon name="chart" size={12} /> {l.revenue} Br earned</span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <div style={{ flex: 1, height: 6, background: COLORS.border, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${l.totalSpots > 0 ? ((l.totalSpots - l.availableSpots) / l.totalSpots) * 100 : 0}%`, height: "100%", background: COLORS.green, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.muted }}>{l.totalSpots - l.availableSpots}/{l.totalSpots}</span>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* ─── Add Space ─── */}
          {tab === "add" && (
            <HostAddForm
              onSuccess={() => {
                setTab("listings");
                fetch("/api/spots")
                  .then((r) => r.ok ? r.json() : { spots: [] })
                  .then((d) => {
                    const spots = d.spots ?? [];
                    setListings(spots.map((s: any) => ({
                      id: String(s.id),
                      name: s.name,
                      address: s.address,
                      kind: "Lot",
                      category: "standard",
                      price: s.price,
                      totalSpots: s.totalSpots || 10,
                      availableSpots: s.availableSpots || 5,
                      active: true,
                      revenue: Math.round(Math.random() * 2000 + 500),
                    })));
                  })
                  .catch(() => {});
              }}
              onCancel={() => setTab("listings")}
            />
          )}

          {/* ─── Calendar ─── */}
          {tab === "calendar" && (
            <>
              <div className="host-section-title">Availability Calendar</div>
              <div className="host-card">
                <h3>Blocked Dates</h3>
                <p style={{ fontSize: 12, color: COLORS.muted, marginBottom: 12 }}>Block dates when your space is unavailable for booking.</p>
                <div className="host-date-row" style={{ marginBottom: 12 }}>
                  <input type="date" value={tempDate} onChange={(e) => setTempDate(e.target.value)} style={{ flex: 1, padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 14 }} />
                  <button className="host-btn" style={{ background: COLORS.green, color: "#fff", padding: "10px 16px", whiteSpace: "nowrap" }} onClick={() => {
                    if (tempDate && !blockedDates.includes(tempDate)) {
                      setBlockedDates([...blockedDates, tempDate]);
                      setTempDate("");
                    }
                  }}>Block Date</button>
                </div>
                {blockedDates.length === 0 && <p style={{ fontSize: 13, color: COLORS.muted, textAlign: "center", padding: 20 }}>No blocked dates. All days available.</p>}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {blockedDates.sort().map((d) => (
                    <div key={d} className="host-date-tag">
                      {d}
                      <button onClick={() => setBlockedDates((prev) => prev.filter((x) => x !== d))} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.red, padding: 0, display: "flex" }}>
                        <Icon name="close" size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="host-card">
                <h3>Quick Schedule</h3>
                <p style={{ fontSize: 12, color: COLORS.muted, marginBottom: 12 }}>Block recurring days of the week.</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <button key={day} className="host-btn" style={{ background: COLORS.border, color: COLORS.ink, padding: "8px 14px", fontSize: 12, fontWeight: 600 }}>{day}</button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function HostAddForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [hostName, setHostName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [category, setCategory] = useState("standard");
  const [kind, setKind] = useState("Open air");
  const [price, setPrice] = useState("");
  const [spots, setSpots] = useState("1");
  const [photos, setPhotos] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const geocode = useCallback(async (query: string): Promise<{ lat: number; lng: number } | null> => {
    if (!GEBETA_TOKEN) return null;
    const url = `https://mapapi.gebeta.app/api/v1/route/geocoding?name=${encodeURIComponent(query)}&apiKey=${GEBETA_TOKEN}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      const hit = data?.data?.[0];
      if (!hit) return null;
      return { lat: Number(hit.lat ?? hit.latitude), lng: Number(hit.lon ?? hit.longitude) };
    } catch { return null; }
  }, []);

  const submit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("geocoding");
    setMessage("Locating your space...");
    const query = `${address}, ${neighborhood}, Addis Ababa`;
    let geo = await geocode(query);
    if (!geo && typeof navigator !== "undefined" && navigator.geolocation) {
      setMessage("Address not found — using your current GPS location...");
      geo = await new Promise<{ lat: number; lng: number } | null>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => resolve(null),
          { timeout: 6000, enableHighAccuracy: true },
        );
      });
    }
    if (!geo) {
      setStatus("error");
      setMessage("We couldn't locate that address. Please check and try again.");
      return;
    }
    setStatus("submitting");
    setMessage("Publishing your space...");
    const res = await fetch("/api/host/spaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hostName, email, phone, name, address, neighborhood, category, kind,
        lat: geo.lat, lng: geo.lng, photos,
        priceHourlyEtb: Number(price), totalSpots: Number(spots) || 1,
      }),
    });
    const data = await res.json().catch(() => null);
    if (res.ok && data?.space) {
      setStatus("done");
      setMessage("Space published!");
      setTimeout(() => onSuccess(), 1200);
    } else {
      setStatus("error");
      setMessage(data?.error || "Something went wrong.");
    }
  }, [geocode, hostName, email, phone, name, address, neighborhood, category, kind, price, spots, photos, onSuccess]);

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: COLORS.muted }}><Icon name="arrow" size={18} /></button>
        <div className="host-section-title" style={{ margin: 0 }}>Add New Space</div>
      </div>
      <div className="host-form">
        <form onSubmit={submit}>
          <h3>Your Details</h3>
          <div className="host-field"><label>Full name</label><input value={hostName} onChange={(e) => setHostName(e.target.value)} placeholder="e.g. Abrham Bekele" required /></div>
          <div style={{ display: "flex", gap: 8 }}>
            <div className="host-field" style={{ flex: 1 }}><label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required /></div>
            <div className="host-field" style={{ flex: 1 }}><label>Phone</label><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09..." required /></div>
          </div>

          <h3 style={{ marginTop: 16 }}>About the Space</h3>
          <div className="host-field"><label>Space name</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Bole Home Garage" required /></div>
          <div className="host-field"><label>Address</label><input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. Bole Medhanialem" required /></div>
          <div className="host-field"><label>Neighborhood</label><input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="e.g. Bole" required /></div>

          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: "block", marginBottom: 6 }}>Space type</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {KINDS.map((k) => (
                <button type="button" key={k} onClick={() => setKind(k)} className="host-btn" style={{ background: kind === k ? COLORS.greenSoft : COLORS.border, color: kind === k ? COLORS.greenDark : COLORS.muted, padding: "6px 12px", fontSize: 12, fontWeight: 600, border: kind === k ? `2px solid ${COLORS.green}` : "2px solid transparent" }}>{k}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: "block", marginBottom: 6 }}>Features</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {CATEGORIES.map((c) => (
                <button type="button" key={c.key} onClick={() => setCategory(c.key)} className="host-btn" style={{ background: category === c.key ? COLORS.greenSoft : COLORS.border, color: category === c.key ? COLORS.greenDark : COLORS.muted, padding: "6px 12px", fontSize: 12, fontWeight: 600, border: category === c.key ? `2px solid ${COLORS.green}` : "2px solid transparent" }}>
                  <Icon name={c.icon} size={13} /> {c.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <h3>Pricing &amp; Availability</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <div className="host-field" style={{ flex: 1 }}><label>Hourly price (ETB)</label><input type="number" min={10} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="30" required /></div>
              <div className="host-field" style={{ flex: 1 }}><label>Available spots</label><input type="number" min={1} value={spots} onChange={(e) => setSpots(e.target.value)} placeholder="1" required /></div>
            </div>
          </div>

          {message && <p style={{ padding: "10px 12px", borderRadius: 8, fontSize: 13, background: status === "error" ? "#fde8e6" : status === "done" ? COLORS.greenSoft : "#f5f6f5", color: status === "error" ? COLORS.red : status === "done" ? COLORS.greenDark : COLORS.muted, fontWeight: 600, marginTop: 10 }}>{message}</p>}

          <button type="submit" className="host-btn host-btn-primary" style={{ marginTop: 14 }} disabled={status === "geocoding" || status === "submitting"}>
            {status === "geocoding" || status === "submitting" ? "Publishing..." : "Publish Space"}
          </button>
        </form>
      </div>
    </>
  );
}
