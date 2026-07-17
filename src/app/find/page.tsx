"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchPanel, type ApiSpot } from "@/components/SearchPanel";
import { Icon } from "@/components/Icon";

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function FindPage() {
  const router = useRouter();
  const [spots, setSpots] = useState<ApiSpot[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [spotsLoading, setSpotsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedSpotId, setSelectedSpotId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [bookingType, setBookingType] = useState<"hourly" | "monthly" | "airport">("hourly");
  const [parkFrom, setParkFrom] = useState(() => { const d = new Date(); d.setMinutes(0, 0, 0); return d.toISOString().slice(0, 16); });
  const [parkUntil, setParkUntil] = useState(() => { const d = new Date(); d.setHours(d.getHours() + 2, 0, 0, 0); return d.toISOString().slice(0, 16); });
  const [menuOpen, setMenuOpen] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchSpots = useCallback((q: string, cat: string = "all") => {
    setSpotsLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (cat && cat !== "all") params.set("category", cat);
    if (userLocation) { params.set("from_lat", String(userLocation.lat)); params.set("from_lng", String(userLocation.lng)); }
    const qs = params.toString();
    fetch(`/api/spots${qs ? "?" + qs : ""}`).then((r) => r.ok ? r.json() : { spots: [] }).then((d) => {
      const list: ApiSpot[] = (d.spots ?? []).map((s: ApiSpot) => ({
        ...s,
        distanceKm: userLocation ? haversineKm(userLocation.lat, userLocation.lng, s.lat, s.lng) : s.distanceKm,
      }));
      list.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
      setSpots(list);
      setSpotsLoading(false);
    }).catch(() => setSpotsLoading(false));
  }, [userLocation]);

  useEffect(() => { fetchSpots("", "all"); }, [fetchSpots]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("parkme_loc");
      if (raw) { const c = JSON.parse(raw); if (c && typeof c.lat === "number") setUserLocation({ lat: c.lat, lng: c.lng }); }
    } catch {}
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => { const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }; setUserLocation(loc); try { localStorage.setItem("parkme_loc", JSON.stringify({ ...loc, t: Date.now() })); } catch {} },
      () => {
        const fallback = { lat: 9.0218, lng: 38.7575 };
        setUserLocation(fallback);
      },
      { timeout: 5000, enableHighAccuracy: true, maximumAge: 60000 },
    );
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

  const navItems = [
    { icon: "grid" as const, label: "Find a spot", href: "/find" },
    { icon: "map" as const, label: "Map view", href: "/app" },
    { icon: "calendar" as const, label: "My bookings", href: "/app" },
    { icon: "wallet" as const, label: "Wallet", href: "/app" },
    { icon: "receipt" as const, label: "History", href: "/app" },
  ];

  return (
    <main className="parkme-shell">
      <aside className={`sidebar ${menuOpen ? "mobile-visible" : ""}`}>
        <a href="/" className="brand" style={{ textDecoration: "none" }}><div className="brand-mark"><span>Park</span><b>me</b></div><em>ethiopia</em></a>
        <button className="sidebar-close" onClick={() => setMenuOpen(false)}><Icon name="close" size={20} /></button>
        <nav>{navItems.map((item) => <button key={item.label} className={item.href === "/find" && item.label === "Find a spot" ? "active" : ""} onClick={() => { setMenuOpen(false); router.push(item.href); }}><Icon name={item.icon} size={20} /><span>{item.label}</span></button>)}</nav>
        <div className="sidebar-bottom">
          <button className="host-callout" onClick={() => router.push("/app")}><span><Icon name="building" size={20} /></span><div><b>List your space</b><small>Earn with Parkme</small></div><Icon name="chevron" size={16} /></button>
        </div>
      </aside>

      <div className="app-content">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Icon name="menu" size={22} /></button>
          <div className="mobile-brand"><span>Park</span><b>me</b></div>
          <div className="top-location"><Icon name="pin" size={18} /><span>Addis Ababa</span></div>
          <div className="top-actions">
            <button className="top-profile" onClick={() => router.push("/app")}>Open map <Icon name="arrow" size={15} /></button>
          </div>
        </header>

        <div className="workspace find-workspace">
          <div className="find-list">
            <SearchPanel
              spots={spots}
              loading={spotsLoading}
              searchQuery={searchQuery}
              onSearch={onSearch}
              onSelectSpot={(s) => setSelectedSpotId(s.id)}
              onBook={(s) => router.push(`/app?spot=${s.id}`)}
              onDirections={(s) => router.push(`/app?spot=${s.id}&route=1`)}
              totalCount={spots.length}
              selectedSpotId={selectedSpotId}
              hasLocation={!!userLocation}
              activeCategory={activeCategory}
              onCategoryChange={onCategoryChange}
              bookingType={bookingType}
              onBookingTypeChange={setBookingType}
              parkFrom={parkFrom}
              onParkFrom={setParkFrom}
              parkUntil={parkUntil}
              onParkUntil={setParkUntil}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
