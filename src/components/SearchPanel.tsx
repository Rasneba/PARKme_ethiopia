"use client";

import { useState } from "react";
import { Icon, IconName } from "./Icon";
import { formatDistance, greetByHour } from "@/lib/format";

export type ApiSpot = {
  id: number;
  slug: string;
  name: string;
  address: string;
  neighborhood: string;
  label: string;
  category: string;
  tone: string;
  price: number;
  rating: string;
  availableSpots: number;
  totalSpots: number;
  spaces: string;
  hostName: string;
  lat: number;
  lng: number;
  distanceKm?: number;
};

const categories = [
  { key: "all", label: "All spots", icon: "grid" as IconName },
  { key: "ev_charging", label: "EV Charging", icon: "sparkle" as IconName },
  { key: "cctv", label: "CCTV Covered", icon: "shield" as IconName },
  { key: "24hr", label: "24/7 Open", icon: "clock" as IconName },
  { key: "wheelchair", label: "Accessible", icon: "check" as IconName },
  { key: "standard", label: "Standard", icon: "car" as IconName },
];

const quickDestinations = [
  { key: "airport", label: "Bole Airport", icon: "nav" as IconName },
  { key: "stadium", label: "Stadiums", icon: "star" as IconName },
  { key: "station", label: "Stations", icon: "pin" as IconName },
  { key: "mall", label: "Malls", icon: "building" as IconName },
];

export function SearchPanel({
  spots,
  loading,
  searchQuery,
  onSearch,
  onSelectSpot,
  onBook,
  onDirections,
  totalCount,
  selectedSpotId,
  hasLocation,
  activeCategory,
  onCategoryChange,
  bookingType,
  onBookingTypeChange,
  parkFrom,
  onParkFrom,
  parkUntil,
  onParkUntil,
}: {
  spots: ApiSpot[];
  loading: boolean;
  searchQuery: string;
  onSearch: (q: string) => void;
  onSelectSpot: (s: ApiSpot) => void;
  onBook: (s: ApiSpot) => void;
  onDirections: (s: ApiSpot) => void;
  totalCount: number;
  selectedSpotId: number | null;
  hasLocation: boolean;
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  bookingType: "hourly" | "monthly" | "airport";
  onBookingTypeChange: (t: "hourly" | "monthly" | "airport") => void;
  parkFrom: string;
  onParkFrom: (v: string) => void;
  parkUntil: string;
  onParkUntil: (v: string) => void;
}) {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <section className="search-column">
      <div className="search-top">
        <div className="welcome-line"><p>{greetByHour()}</p><h1>Where are you parking today?</h1></div>

        {/* JustPark-style booking type tabs */}
        <div className="booking-type-tabs">
          {(["hourly", "monthly", "airport"] as const).map((t) => (
            <button key={t} className={`booking-type-tab ${bookingType === t ? "active" : ""}`} onClick={() => onBookingTypeChange(t)}>
              {t === "hourly" ? "Hourly / Daily" : t === "monthly" ? "Monthly" : "Airport"}
            </button>
          ))}
        </div>

        {/* JustPark "When?" date pickers */}
        {bookingType !== "monthly" && (
          <div className="when-row">
            <label className="when-field">
              <span><Icon name="clock" size={14} /> From</span>
              <input type="datetime-local" value={parkFrom} onChange={(e) => onParkFrom(e.target.value)} />
            </label>
            <label className="when-field">
              <span><Icon name="arrow" size={14} /> Until</span>
              <input type="datetime-local" value={parkUntil} onChange={(e) => onParkUntil(e.target.value)} />
            </label>
          </div>
        )}

        <div className="search-box">
          <Icon name="search" size={20} />
          <input value={searchQuery} onChange={(e) => onSearch(e.target.value)} placeholder="Search by name, area, or address..." aria-label="Search parking location" />
          <button className="filter-button" aria-label="Open filters" onClick={() => setFilterOpen(!filterOpen)}><Icon name="filter" size={19} /></button>
        </div>

        {/* JustPark quick-destination chips */}
        <div className="quick-destinations">
          {quickDestinations.map((d) => (
            <button key={d.key} className="quick-dest" onClick={() => onSearch(d.label)}>
              <Icon name={d.icon} size={15} />
              <span>{d.label}</span>
            </button>
          ))}
        </div>

        <div className="category-chips">
          {categories.map((cat) => (
            <button key={cat.key} className={`category-chip ${activeCategory === cat.key ? "active" : ""}`} onClick={() => onCategoryChange(cat.key)}>
              <Icon name={cat.icon} size={14} />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="results-heading"><div><span className="eyebrow">{hasLocation ? "AVAILABLE NEARBY" : "ALL SPOTS"}</span><h2>{totalCount} spot{totalCount !== 1 ? "s" : ""} found{hasLocation ? " nearby" : ""}</h2></div></div>
      {loading ? <div className="loading-state">Searching...</div> : (
        <div className="place-list">
          {spots.map((spot) => (
            <article className={`place-card ${selectedSpotId === spot.id ? "selected" : ""}`} key={spot.id} onClick={() => onSelectSpot(spot)}>
              <div className={`place-image ${spot.tone}`}>
                <span className="place-kind">{spot.label}</span>
                <span className="place-cat-tag">{spot.category === "ev_charging" ? "EV" : spot.category === "cctv" ? "CCTV" : spot.category === "24hr" ? "24/7" : spot.category === "wheelchair" ? "ACC" : ""}</span>
                <div className="car-shape"><Icon name="car" size={29} /></div>
              </div>
              <div className="place-info">
                <div className="place-name-line"><h3>{spot.name}</h3><span className="rating"><Icon name="star" size={13} stroke={2.4} /> {spot.rating}</span></div>
                <p>{spot.address}</p>
                <div className="place-meta">
                  <span><Icon name="pin" size={14} />{spot.availableSpots} spots</span>
                  {spot.distanceKm != null && <span className="place-distance"><Icon name="locate" size={13} /> {formatDistance(spot.distanceKm)}</span>}
                </div>
              </div>
              <div className="place-price">
                <b>{spot.price} <small>ETB</small></b>
                <span>/ hour</span>
                <div className="place-card-actions">
                  <button className="place-directions-btn" title="Get directions" onClick={(e) => { e.stopPropagation(); onDirections(spot); }}>
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
