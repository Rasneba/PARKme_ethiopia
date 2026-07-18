"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/Icon";
import IndoorLotGuide from "@/components/IndoorLotGuide";

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

function SpotGuideSteps({ booking }: { booking: Booking }) {
  const floor = booking.spaceLabel.split("·")[0]?.trim() || "Ground floor";
  const space = booking.spaceLabel.split("·")[1]?.trim() || "—";
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

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => (r.ok ? r.json() : { bookings: [] }))
      .then((d) => {
        const list: Booking[] = d.bookings ?? [];
        const b = bookingId ? list.find((x) => x.id === bookingId) : list.find((x) => x.status === "active" || x.status === "confirmed");
        if (b) {
          setBooking(b);
          setSpotCode(b.spaceLabel.split("·")[1]?.trim() || "A-1");
          setCheckedIn(Boolean(b.checkInAt));
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
            <SpotGuideSteps booking={booking} />
          </section>

          <section className="spot-guide-section">
            <h3>Indoor lot guide</h3>
            <IndoorLotGuide
              selectedFloor={floor}
              setSelectedFloor={setFloor}
              selectedSpotCode={spotCode}
              setSelectedSpotCode={setSpotCode}
              interactive={false}
            />
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
