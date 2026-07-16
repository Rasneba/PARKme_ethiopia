"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchPanel, type ApiSpot } from "@/components/SearchPanel";
import { Icon } from "@/components/Icon";

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
    const qs = params.toString();
    fetch(`/api/spots${qs ? "?" + qs : ""}`).then((r) => r.ok ? r.json() : { spots: [] }).then((d) => { setSpots(d.spots ?? []); setSpotsLoading(false); }).catch(() => setSpotsLoading(false));
  }, []);

  useEffect(() => { fetchSpots("", "all"); }, [fetchSpots]);

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
              onBook={() => router.push("/app")}
              onDirections={() => router.push("/app")}
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
