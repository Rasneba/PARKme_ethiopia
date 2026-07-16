"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";

const GEBETA_TOKEN = process.env.NEXT_PUBLIC_GEBETA_TOKEN || process.env.NEXT_PUBLIC_GEBETA_MAP_TOKEN || "";

const CATEGORIES = [
  { key: "standard", label: "Standard", icon: "car" as const },
  { key: "ev_charging", label: "EV Charging", icon: "sparkle" as const },
  { key: "cctv", label: "CCTV Covered", icon: "shield" as const },
  { key: "24hr", label: "24/7 Open", icon: "clock" as const },
  { key: "wheelchair", label: "Accessible", icon: "check" as const },
];

const KINDS = ["Open air", "Garage", "Covered", "Indoor", "Driveway", "Lot"];

type Status = "idle" | "geocoding" | "submitting" | "done" | "error";

export default function HostPage() {
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
  const [createdSlug, setCreatedSlug] = useState("");

  const geocode = useCallback(async (query: string): Promise<{ lat: number; lng: number; label?: string } | null> => {
    if (!GEBETA_TOKEN) return null;
    const url = `https://mapapi.gebeta.app/api/v1/route/geocoding?name=${encodeURIComponent(query)}&apiKey=${GEBETA_TOKEN}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      const hit = data?.data?.[0];
      if (!hit) return null;
      return { lat: Number(hit.lat ?? hit.latitude), lng: Number(hit.lon ?? hit.longitude), label: hit.name || query };
    } catch {
      return null;
    }
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
      setMessage("We couldn't locate that address. Please check the address and neighborhood, or allow location access.");
      return;
    }
    setStatus("submitting");
    setMessage("Publishing your space to the marketplace...");
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
      setCreatedSlug(data.space.slug);
      setStatus("done");
      setMessage("Your space is live on the Parkme marketplace!");
    } else {
      setStatus("error");
      setMessage(data?.error || "Something went wrong. Please try again.");
    }
  }, [geocode, hostName, email, phone, name, address, neighborhood, category, kind, price, spots, photos]);

  if (status === "done") {
    return (
      <main className="host-page">
        <div className="host-success">
          <span className="host-success-icon"><Icon name="check" size={34} /></span>
          <h1>Space published!</h1>
          <p>Your parking space is now live on the Parkme marketplace and drivers can find and book it.</p>
          <div className="host-success-actions">
            <Link href="/app" className="host-btn primary">View on map</Link>
            <button className="host-btn" onClick={() => { setStatus("idle"); setMessage(""); setCreatedSlug(""); }}>List another space</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="host-page">
      <header className="host-header">
        <Link href="/" className="host-back" aria-label="Back"><Icon name="chevron" size={18} /></Link>
        <div className="host-brand"><span>Park</span><b>me</b><i>host</i></div>
        <span className="host-header-tag">Marketplace</span>
      </header>

      <section className="host-hero">
        <h1>List your parking space</h1>
        <p>Earn passive income by renting out your driveway, garage, or lot. It takes less than 2 minutes.</p>
      </section>

      <form className="host-form" onSubmit={submit}>
        <div className="host-section">
          <h2>Your details</h2>
          <label className="host-field">
            <span>Full name</span>
            <input value={hostName} onChange={(e) => setHostName(e.target.value)} placeholder="e.g. Abrham Bekele" required />
          </label>
          <div className="host-row">
            <label className="host-field">
              <span>Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required />
            </label>
            <label className="host-field">
              <span>Phone</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09..." required />
            </label>
          </div>
        </div>

        <div className="host-section">
          <h2>About the space</h2>
          <label className="host-field">
            <span>Space name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Bole Home Garage" required />
          </label>
          <label className="host-field">
            <span>Address</span>
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. Bole Medhanialem" required />
          </label>
          <label className="host-field">
            <span>Neighborhood</span>
            <input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="e.g. Bole" required />
          </label>

          <span className="host-label">Space type</span>
          <div className="host-chips">
            {KINDS.map((k) => (
              <button type="button" key={k} className={kind === k ? "active" : ""} onClick={() => setKind(k)}>{k}</button>
            ))}
          </div>

          <span className="host-label">Features</span>
          <div className="host-chips">
            {CATEGORIES.map((c) => (
              <button type="button" key={c.key} className={category === c.key ? "active" : ""} onClick={() => setCategory(c.key)}>
                <Icon name={c.icon} size={15} /> {c.label}
              </button>
            ))}
          </div>

          <span className="host-label">Photos <em>(3 required)</em></span>
          <div className="host-photos">
            {[0, 1, 2].map((i) => (
              <label key={i} className={`host-photo ${photos[i] ? "filled" : ""}`}>
                {photos[i] ? <img src={photos[i]} alt={`Space photo ${i + 1}`} /> : <span><Icon name="camera" size={22} /><em>Photo {i + 1}</em></span>}
                <input
                  type="file"
                  accept="image/*"
                  capture={typeof navigator !== "undefined" && /Mobi/i.test(navigator.userAgent) ? "environment" : undefined}
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      const dataUrl = reader.result as string;
                      setPhotos((prev) => {
                        const next = [...prev];
                        next[i] = dataUrl;
                        return next;
                      });
                    };
                    reader.readAsDataURL(file);
                  }}
                />
                {photos[i] && <button type="button" className="host-photo-remove" onClick={(ev) => { ev.preventDefault(); setPhotos((prev) => prev.filter((_, idx) => idx !== i)); }}><Icon name="close" size={14} /></button>}
              </label>
            ))}
          </div>
        </div>

        <div className="host-section">
          <h2>Pricing &amp; availability</h2>
          <div className="host-row">
            <label className="host-field">
              <span>Hourly price (ETB)</span>
              <input type="number" min={10} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="30" required />
            </label>
            <label className="host-field">
              <span>Available spots</span>
              <input type="number" min={1} value={spots} onChange={(e) => setSpots(e.target.value)} placeholder="1" required />
            </label>
          </div>
        </div>

        {message && <p className={`host-message ${status === "error" ? "err" : "info"}`}>{message}</p>}

        <button type="submit" className="host-submit" disabled={status === "geocoding" || status === "submitting"}>
          {status === "geocoding" || status === "submitting" ? "Publishing..." : "Publish my space"}
        </button>
        <p className="host-fineprint">By publishing you agree to list your space on the Parkme Ethiopia marketplace.</p>
      </form>
    </main>
  );
}
