"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/Icon";
import IndoorLotGuide from "@/components/IndoorLotGuide";
import type { SpotLayout } from "@/components/SearchPanel";

type Booking = {
  id: string;
  reference: string;
  status: string;
  spotId: number;
  spotName: string;
  spotAddress: string;
  spaceLabel: string;
  gateCode: string;
  durationHours: number;
  amountEtb: number;
  startAt: string;
  endAt: string;
  checkInAt: string | null;
};

function SpotGuideSteps({ booking, floor, space }: { booking: Booking; floor: string; space: string }) {
  const steps = [
    { icon: "gate" as const, title: "Enter through the main gate", text: `Show your gate code ${booking.gateCode} to the attendant or tap at the barrier.` },
    { icon: "arrow" as const, title: `Head to ${floor}`, text: "Drive straight and keep right toward the marked zone as you enter the lot." },
    { icon: "pin" as const, title: `Park at space ${space}`, text: "Your spot is highlighted green on the indoor map below. Walkways are marked with arrows." },
    { icon: "check" as const, title: "Confirm your spot", text: "Tap check-in once parked so we bill your timer accurately." },
  ];
  return (
    <ol className="spot-guide-steps">
      {steps.map((s, i) => (
        <li className="spot-guide-step" key={i}>
          <span className="spot-guide-step-icon"><Icon name={s.icon} size={16} /></span>
          <div><b>{s.title}</b><small>{s.text}</small></div>
          {i < steps.length - 1 && <span className="spot-guide-connector" />}
        </li>
      ))}
    </ol>
  );
}

function CorporateLayoutGuide({ layout, floorName, spotLabel }: { layout: SpotLayout; floorName: string; spotLabel: string }) {
  const [activeFloor, setActiveFloor] = useState(
    layout.floors.find((f) => f.name === floorName)?.id ?? layout.floors[0]?.id ?? "",
  );
  const floor = layout.floors.find((f) => f.id === activeFloor) ?? layout.floors[0];
  return (
    <div>
      {layout.floors.length > 1 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          {layout.floors.map((f) => (
            <button key={f.id} onClick={() => setActiveFloor(f.id)} style={{ padding: "8px 14px", borderRadius: 10, border: activeFloor === f.id ? "2px solid #0fa24b" : "1.5px solid #e0e0e0", background: activeFloor === f.id ? "#edfcf3" : "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{f.name}</button>
          ))}
        </div>
      )}
      {floor && (
        <div style={{ position: "relative", width: "100%", height: 240, background: "#f3f5f3", borderRadius: 12, border: "1px solid #e4e7e4", overflow: "hidden" }}>
          {floor.spots.map((s) => {
            const isBooked = s.label === spotLabel && floor.name === floorName;
            const stateColor = isBooked ? "#0fa24b" : s.state === "available" ? "#8fd9ad" : s.state === "occupied" ? "#c0392b" : s.state === "maintenance" ? "#b8860b" : "#4098df";
            return (
              <div key={s.id} title={`${s.label} — ${s.state}`} style={{ position: "absolute", left: s.x, top: s.y, transform: "translate(-50%,-50%)", width: 38, height: 38, borderRadius: 8, border: isBooked ? "3px solid #111a13" : "1.5px solid rgba(0,0,0,.1)", background: stateColor, color: "#fff", fontSize: 11, fontWeight: 800, display: "grid", placeItems: "center" }}>{s.label}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SpotGuidePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("booking");
  const spotId = searchParams.get("spot");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [floor, setFloor] = useState("1st Floor");
  const [spotCode, setSpotCode] = useState("A-1");
  const [checkedIn, setCheckedIn] = useState(false);
  const [layout, setLayout] = useState<SpotLayout | null>(null);

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => (r.ok ? r.json() : { bookings: [] }))
      .then((d) => {
        const list: Booking[] = d.bookings ?? [];
        const b = bookingId ? list.find((x) => x.id === bookingId) : list.find((x) => x.status === "active" || x.status === "confirmed");
        if (b) {
          setBooking(b);
          const parts = b.spaceLabel.split("·");
          setFloor(parts[0]?.trim() || "1st Floor");
          setSpotCode(parts[1]?.trim() || "A-1");
          setCheckedIn(Boolean(b.checkInAt));
          fetch(`/api/spots?q=`).then((r) => (r.ok ? r.json() : { spots: [] })).then((sd) => {
            const spot = (sd.spots ?? []).find((s: any) => s.id === b.spotId);
            if (spot?.corporate && spot.layout) setLayout(spot.layout as SpotLayout);
          }).catch(() => {});
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [bookingId]);

  async function checkIn() {
    if (!booking) return;
    const r = await fetch(`/api/bookings/${booking.id}/check-in`, { method: "POST" });
    if (r.ok) setCheckedIn(true);
  }

  function navigate() {
    if (spotId) router.push(`/app?spot=${spotId}&route=1`);
    else router.push("/app");
  }

  return (
    <main className="spot-guide-page">
      <header className="spot-guide-topbar">
        <button className="mobile-menu" onClick={() => router.back()} aria-label="Back"><Icon name="close" size={22} /></button>
        <div className="mobile-brand"><span>Park</span><b>Addis</b></div>
        <div style={{ width: 40 }} />
      </header>

      {loading ? (
        <div className="view-loading"><Icon name="clock" size={24} /><p>Loading your spot guide...</p></div>
      ) : !booking ? (
        <div className="empty-view">
          <Icon name="locate" size={40} />
          <h3>No booking found</h3>
          <p>Reserve a spot and open this guide after you arrive to get walked to your space.</p>
          <button className="confirm-booking" onClick={() => router.push("/app")}>Find a spot <Icon name="arrow" size={16} /></button>
        </div>
      ) : (
        <div className="spot-guide-body">
          <div className="spot-guide-hero">
            <div className="arrival-badge"><Icon name="check" size={14} /> Spot guide</div>
            <h1>{booking.spotName}</h1>
            <p>{booking.spotAddress}</p>
            <div className="spot-guide-pills">
              <span><Icon name="pin" size={14} /> {booking.spaceLabel}</span>
              <span><Icon name="lock" size={14} /> Gate {booking.gateCode}</span>
            </div>
          </div>

          <button className="spot-guide-nav-btn" onClick={navigate}>
            <Icon name="nav" size={16} /> Start navigation to lot
          </button>

          <section className="spot-guide-section">
            <h3>Turn-by-turn to your spot</h3>
            <SpotGuideSteps booking={booking} floor={floor} space={spotCode} />
          </section>

          <section className="spot-guide-section">
            <h3>{layout ? "Your host's lot layout" : "Indoor lot guide"}</h3>
            {layout ? (
              <CorporateLayoutGuide layout={layout} floorName={floor} spotLabel={spotCode} />
            ) : (
              <IndoorLotGuide
                selectedFloor={floor}
                setSelectedFloor={setFloor}
                selectedSpotCode={spotCode}
                setSelectedSpotCode={setSpotCode}
                interactive={false}
              />
            )}
          </section>

          <button className={`spot-guide-checkin ${checkedIn ? "done" : ""}`} onClick={() => void checkIn()} disabled={checkedIn}>
            <Icon name={checkedIn ? "check" : "scan"} size={16} /> {checkedIn ? "Checked in — welcome!" : "Check in at my spot"}
          </button>
        </div>
      )}
    </main>
  );
}

export default function SpotGuidePageDefault() {
  return (
    <Suspense fallback={null}>
      <SpotGuidePage />
    </Suspense>
  );
}
