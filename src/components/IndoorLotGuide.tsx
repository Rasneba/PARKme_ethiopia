"use client";

import { ArrowLeft, Check, HelpCircle } from "lucide-react";

// Deterministic mock layout state for each floor to keep it consistent
interface LotSpot {
  code: string; // e.g. "A-1"
  status: "occupied" | "available" | "selected";
}

interface IndoorLotGuideProps {
  selectedFloor: string;
  setSelectedFloor: (floor: string) => void;
  selectedSpotCode: string;
  setSelectedSpotCode: (code: string) => void;
  interactive?: boolean;
}

export default function IndoorLotGuide({
  selectedFloor,
  setSelectedFloor,
  selectedSpotCode,
  setSelectedSpotCode,
  interactive = true,
}: IndoorLotGuideProps) {
  const floors = ["1st Floor", "2nd Floor", "3rd Floor", "4th Floor"];

  // Statically seed spots for each floor so they remain consistent when switching floors
  const getSpotsForFloor = (floor: string): { zoneA: LotSpot[]; zoneB: LotSpot[] } => {
    // Generate deterministic states based on floor name hash
    const hash = floor.charCodeAt(0) + floor.charCodeAt(floor.length - 1);

    const zoneA: LotSpot[] = [];
    const zoneB: LotSpot[] = [];

    // 8 spots for Zone A (4 rows, 2 columns)
    for (let i = 1; i <= 8; i++) {
      const code = `A-${i}`;
      // Some simple formula to distribute occupied slots deterministically
      const isOccupied = ((hash + i) % 3 === 0) || ((hash * i) % 5 === 2);

      zoneA.push({
        code,
        status:
          code === selectedSpotCode && selectedFloor === floor
            ? "selected"
            : isOccupied
              ? "occupied"
              : "available",
      });
    }

    // 8 spots for Zone B (4 rows, 2 columns)
    for (let i = 1; i <= 8; i++) {
      const code = `B-${i}`;
      const isOccupied = ((hash + i + 2) % 3 === 0) || ((hash * (i + 1)) % 7 === 1);

      zoneB.push({
        code,
        status:
          code === selectedSpotCode && selectedFloor === floor
            ? "selected"
            : isOccupied
              ? "occupied"
              : "available",
      });
    }

    return { zoneA, zoneB };
  };

  const { zoneA, zoneB } = getSpotsForFloor(selectedFloor);

  const handleSpotClick = (spot: LotSpot) => {
    if (!interactive) return;
    if (spot.status === "occupied") return;
    setSelectedSpotCode(spot.code);
  };

  // Render a clean modern top-down vector car
  const renderTopDownCar = () => (
    <svg className="w-9 h-9 text-zinc-700 select-none pointer-events-none" viewBox="0 0 24 24" fill="currentColor">
      {/* Wheels */}
      <rect x="3.5" y="3.5" width="2" height="4" rx="1" fill="#18181b" />
      <rect x="18.5" y="3.5" width="2" height="4" rx="1" fill="#18181b" />
      <rect x="3.5" y="15.5" width="2" height="4" rx="1" fill="#18181b" />
      <rect x="18.5" y="15.5" width="2" height="4" rx="1" fill="#18181b" />
      {/* Mirrors */}
      <rect x="3" y="8" width="1.5" height="2" rx="0.5" fill="#3f3f46" />
      <rect x="19.5" y="8" width="1.5" height="2" rx="0.5" fill="#3f3f46" />
      {/* Car body */}
      <rect x="5" y="1.5" width="14" height="20" rx="3.5" fill="currentColor" />
      {/* Hood crease */}
      <path d="M 8 5 Q 12 3 16 5" stroke="#3f3f46" strokeWidth="0.5" fill="none" />
      {/* Front windshield */}
      <rect x="7" y="5.5" width="10" height="3.5" rx="1" fill="#ffffff" fillOpacity="0.25" />
      {/* Roof glass or body highlights */}
      <rect x="7" y="10" width="10" height="4" rx="0.5" fill="#ffffff" fillOpacity="0.1" />
      {/* Rear windshield */}
      <rect x="7" y="15" width="10" height="2.5" rx="1" fill="#ffffff" fillOpacity="0.25" />
      {/* Headlights */}
      <rect x="6.5" y="1.5" width="2" height="1" rx="0.5" fill="#facc15" />
      <rect x="15.5" y="1.5" width="2" height="1" rx="0.5" fill="#facc15" />
      {/* Taillights */}
      <rect x="6.5" y="21" width="2.5" height="0.8" rx="0.3" fill="#ef4444" />
      <rect x="15" y="21" width="2.5" height="0.8" rx="0.3" fill="#ef4444" />
    </svg>
  );

  return (
    <div className="bg-white rounded-3xl border border-zinc-200 shadow-xl overflow-hidden max-w-sm mx-auto flex flex-col font-sans text-zinc-900" id="indoor-lot-guide">
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-150 flex items-center justify-between bg-zinc-50/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
            📍
          </div>
          <div>
            <h4 className="text-sm font-black text-zinc-950 uppercase tracking-tight">Choose Space</h4>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider font-mono">Inside Smart Lot</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-ethio-green/10 px-2.5 py-1 rounded-full border border-ethio-green/15">
          <span className="w-1.5 h-1.5 rounded-full bg-ethio-green animate-pulse" />
          <span className="text-[9px] font-mono text-ethio-green font-extrabold uppercase">Live Sensors</span>
        </div>
      </div>

      {/* Floor selector tabs */}
      <div className="px-4 py-3 bg-white border-b border-zinc-100">
        <div className="grid grid-cols-4 gap-1.5" id="floor-tabs-container">
          {floors.map((floor) => {
            const isActive = floor === selectedFloor;
            return (
              <button
                key={floor}
                id={`floor-tab-${floor.replace(" ", "-")}`}
                onClick={() => setSelectedFloor(floor)}
                className={`py-2 rounded-xl text-[11px] font-black tracking-tight transition-all border ${
                  isActive
                    ? "bg-ethio-green border-ethio-green text-white shadow-md shadow-green-500/10"
                    : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
                }`}
              >
                {floor === "1st Floor" ? "1st Floor" : floor === "2nd Floor" ? "2nd Floor" : floor === "3rd Floor" ? "3rd Floor" : "4th Floor"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Map Layout */}
      <div className="p-6 bg-zinc-50/40 relative flex-1 flex flex-col justify-center min-h-[380px]">
        {/* Grid and lane visualizer */}
        <div className="relative mx-auto w-full max-w-[280px] grid grid-cols-11 gap-0">
          {/* ZONE A (Spots column 1 and column 2) - takes 4 columns */}
          <div className="col-span-4 flex flex-col justify-between h-full py-6">
            <div className="text-center font-display font-black text-xs text-zinc-400 mb-3 uppercase tracking-widest font-mono">
              Zone A
            </div>

            {/* Spots grid (2 cols x 4 rows) */}
            <div className="grid grid-cols-2 gap-x-2.5 gap-y-3.5" id="zone-a-spots">
              {zoneA.map((spot) => {
                const isSelected = spot.code === selectedSpotCode && selectedFloor === selectedFloor;
                return (
                  <button
                    key={spot.code}
                    id={`lot-spot-btn-${spot.code}`}
                    disabled={!interactive || spot.status === "occupied"}
                    onClick={() => handleSpotClick(spot)}
                    className={`aspect-square w-10 h-11 rounded-xl border flex flex-col items-center justify-center relative transition-all ${
                      spot.status === "selected"
                        ? "bg-green-550/15 border-ethio-green shadow-sm ring-2 ring-ethio-green/20"
                        : spot.status === "occupied"
                          ? "bg-zinc-100 border-zinc-200 text-zinc-400"
                          : "bg-white border-dashed border-zinc-300 hover:border-ethio-green hover:bg-green-50/10 hover:scale-105 cursor-pointer"
                    }`}
                  >
                    {spot.status === "occupied" ? (
                      renderTopDownCar()
                    ) : (
                      <>
                        <span className="text-[8px] font-mono font-bold text-zinc-400 tracking-tighter absolute top-1">
                          {spot.code}
                        </span>
                        {spot.status === "selected" && (
                          <div className="w-5 h-5 rounded-full bg-ethio-green flex items-center justify-center text-white scale-90 mt-2">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CENTRAL AISLE (takes 3 columns) */}
          <div className="col-span-3 flex flex-col items-center justify-between py-2 relative h-full min-h-[300px]">
            {/* ENTRY GATE SIGN */}
            <div className="flex flex-col items-center relative z-10 -mt-1" id="entry-gate-sign">
              <div className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center font-mono text-[9px] font-black border-2 border-white shadow-md animate-pulse">
                ↓
              </div>
              <span className="text-[8px] font-mono font-black text-sky-600 bg-sky-50 border border-sky-100 px-1.5 py-0.5 rounded uppercase mt-1 tracking-wider scale-90">
                Entry
              </span>
            </div>

            {/* DOTTED ROAD PATH WITH DOWN ARROWS */}
            <div className="absolute inset-y-12 left-1/2 -translate-x-1/2 w-[2px] border-l-2 border-dashed border-zinc-300 flex flex-col items-center justify-around h-[calc(100%-6rem)] pointer-events-none select-none">
              <span className="text-zinc-300 text-[10px] font-bold">↓</span>
              <span className="text-zinc-300 text-[10px] font-bold">↓</span>
              <span className="text-zinc-300 text-[10px] font-bold">↓</span>
            </div>

            {/* EXIT GATE SIGN */}
            <div className="flex flex-col items-center relative z-10 -mb-1 mt-auto" id="exit-gate-sign">
              <span className="text-[8px] font-mono font-black text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded uppercase mb-1 tracking-wider scale-90">
                Exit
              </span>
              <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center font-mono text-[9px] font-black border-2 border-white shadow-md">
                →
              </div>
            </div>
          </div>

          {/* ZONE B (Spots column 1 and column 2) - takes 4 columns */}
          <div className="col-span-4 flex flex-col justify-between h-full py-6">
            <div className="text-center font-display font-black text-xs text-zinc-400 mb-3 uppercase tracking-widest font-mono">
              Zone B
            </div>

            {/* Spots grid (2 cols x 4 rows) */}
            <div className="grid grid-cols-2 gap-x-2.5 gap-y-3.5" id="zone-b-spots">
              {zoneB.map((spot) => {
                const isSelected = spot.code === selectedSpotCode && selectedFloor === selectedFloor;
                return (
                  <button
                    key={spot.code}
                    id={`lot-spot-btn-${spot.code}`}
                    disabled={!interactive || spot.status === "occupied"}
                    onClick={() => handleSpotClick(spot)}
                    className={`aspect-square w-10 h-11 rounded-xl border flex flex-col items-center justify-center relative transition-all ${
                      spot.status === "selected"
                        ? "bg-green-550/15 border-ethio-green shadow-sm ring-2 ring-ethio-green/20"
                        : spot.status === "occupied"
                          ? "bg-zinc-100 border-zinc-200 text-zinc-400"
                          : "bg-white border-dashed border-zinc-300 hover:border-ethio-green hover:bg-green-50/10 hover:scale-105 cursor-pointer"
                    }`}
                  >
                    {spot.status === "occupied" ? (
                      renderTopDownCar()
                    ) : (
                      <>
                        <span className="text-[8px] font-mono font-bold text-zinc-400 tracking-tighter absolute top-1">
                          {spot.code}
                        </span>
                        {spot.status === "selected" && (
                          <div className="w-5 h-5 rounded-full bg-ethio-green flex items-center justify-center text-white scale-90 mt-2">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Legend / Info Footer */}
      <div className="px-5 py-4 border-t border-zinc-150 bg-zinc-50/50 flex items-center justify-between text-[11px] text-zinc-500 font-mono font-bold">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-zinc-100 border border-zinc-300 flex items-center justify-center text-[7px] text-zinc-400">
            🚗
          </div>
          <span>Occupied</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded border border-dashed border-zinc-300 bg-white" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded border border-ethio-green bg-green-50/50 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-ethio-green" />
          </div>
          <span className="text-ethio-green">Your Choice</span>
        </div>
      </div>
    </div>
  );
}
