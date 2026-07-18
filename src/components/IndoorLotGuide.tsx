"use client";

import React, { useState } from "react";

interface LotSpot {
  code: string;
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

  const getSpotsForFloor = (floor: string): { zoneA: LotSpot[]; zoneB: LotSpot[] } => {
    const hash = floor.charCodeAt(0) + floor.charCodeAt(floor.length - 1);
    const zoneA: LotSpot[] = [];
    const zoneB: LotSpot[] = [];

    for (let i = 1; i <= 8; i++) {
      const code = `A-${i}`;
      const isOccupied = ((hash + i) % 3 === 0) || ((hash * i) % 5 === 2);
      zoneA.push({
        code,
        status: code === selectedSpotCode && selectedFloor === floor
          ? "selected"
          : isOccupied ? "occupied" : "available",
      });
    }

    for (let i = 1; i <= 8; i++) {
      const code = `B-${i}`;
      const isOccupied = ((hash + i + 2) % 3 === 0) || ((hash * (i + 1)) % 7 === 1);
      zoneB.push({
        code,
        status: code === selectedSpotCode && selectedFloor === floor
          ? "selected"
          : isOccupied ? "occupied" : "available",
      });
    }

    return { zoneA, zoneB };
  };

  const { zoneA, zoneB } = getSpotsForFloor(selectedFloor);

  const handleSpotClick = (spot: LotSpot) => {
    if (!interactive || spot.status === "occupied") return;
    setSelectedSpotCode(spot.code);
  };

  const renderTopDownCar = () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#3c4f43", userSelect: "none", pointerEvents: "none" }}>
      <rect x="3.5" y="3.5" width="2" height="4" rx="1" fill="#101411" />
      <rect x="18.5" y="3.5" width="2" height="4" rx="1" fill="#101411" />
      <rect x="3.5" y="15.5" width="2" height="4" rx="1" fill="#101411" />
      <rect x="18.5" y="15.5" width="2" height="4" rx="1" fill="#101411" />
      <rect x="3" y="8" width="1.5" height="2" rx="0.5" fill="#2d3b32" />
      <rect x="19.5" y="8" width="1.5" height="2" rx="0.5" fill="#2d3b32" />
      <rect x="5" y="1.5" width="14" height="20" rx="3.5" fill="currentColor" />
      <path d="M 8 5 Q 12 3 16 5" stroke="#2d3b32" strokeWidth="0.5" fill="none" />
      <rect x="7" y="5.5" width="10" height="3.5" rx="1" fill="#ffffff" fillOpacity="0.25" />
      <rect x="7" y="10" width="10" height="4" rx="0.5" fill="#ffffff" fillOpacity="0.1" />
      <rect x="7" y="15" width="10" height="2.5" rx="1" fill="#ffffff" fillOpacity="0.25" />
      <rect x="6.5" y="1.5" width="2" height="1" rx="0.5" fill="#facc15" />
      <rect x="15.5" y="1.5" width="2" height="1" rx="0.5" fill="#facc15" />
      <rect x="6.5" y="21" width="2.5" height="0.8" rx="0.3" fill="#e54d3f" />
      <rect x="15" y="21" width="2.5" height="0.8" rx="0.3" fill="#e54d3f" />
    </svg>
  );

  const s = {
    container: {
      background: "#fff",
      borderRadius: 20,
      border: "1px solid #eef3f0",
      boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
      overflow: "hidden",
      maxWidth: 380,
      margin: "0 auto",
      fontFamily: "'Inter', sans-serif",
    } as React.CSSProperties,
    header: {
      padding: "16px 20px",
      borderBottom: "1px solid #eef3f0",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: "#fafafa",
    } as React.CSSProperties,
    headerLeft: {
      display: "flex",
      alignItems: "center",
      gap: 12,
    } as React.CSSProperties,
    headerIcon: {
      width: 32,
      height: 32,
      borderRadius: "50%",
      background: "#eef3f0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 14,
    } as React.CSSProperties,
    liveBadge: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      background: "rgba(18,138,66,0.08)",
      padding: "4px 10px",
      borderRadius: 20,
      border: "1px solid rgba(18,138,66,0.12)",
    } as React.CSSProperties,
    liveDot: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: "#128a42",
      animation: "pulse 1.5s infinite",
    } as React.CSSProperties,
    floorTabs: {
      padding: "12px 16px",
      background: "#fff",
      borderBottom: "1px solid #eef3f0",
    } as React.CSSProperties,
    floorGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 6,
    } as React.CSSProperties,
    floorTab: (active: boolean) => ({
      padding: "8px 4px",
      borderRadius: 12,
      fontSize: 11,
      fontWeight: 700 as const,
      border: active ? "2px solid #128a42" : "1.5px solid #eef3f0",
      background: active ? "#128a42" : "#fff",
      color: active ? "#fff" : "#88a693",
      cursor: "pointer" as const,
      transition: "all 0.15s",
      textAlign: "center" as const,
      boxShadow: active ? "0 2px 8px rgba(18,138,66,0.2)" : "none",
    }),
    mapArea: {
      padding: 20,
      background: "#fafafa",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      minHeight: 360,
    } as React.CSSProperties,
    gridContainer: {
      display: "grid",
      gridTemplateColumns: "4fr 3fr 4fr",
      gap: 0,
      width: "100%",
      maxWidth: 320,
    } as React.CSSProperties,
    zoneHeader: {
      textAlign: "center" as const,
      fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: 800 as const,
      fontSize: 11,
      color: "#b0c7ba",
      marginBottom: 12,
      textTransform: "uppercase" as const,
      letterSpacing: 2,
    } as React.CSSProperties,
    spotsGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "6px 8px",
    } as React.CSSProperties,
    spotButton: (status: string) => ({
      aspectRatio: "1",
      width: 42,
      height: 46,
      borderRadius: 12,
      border: status === "selected"
        ? "2px solid #128a42"
        : status === "occupied"
          ? "1.5px solid #eef3f0"
          : "1.5px dashed #d6e3db",
      background: status === "selected"
        ? "rgba(18,138,66,0.06)"
        : status === "occupied"
          ? "#f4f4f5"
          : "#fff",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      justifyContent: "center",
      position: "relative" as const,
      cursor: status === "occupied" || !interactive ? "default" : "pointer",
      transition: "all 0.15s",
      boxShadow: status === "selected" ? "0 0 0 3px rgba(18,138,66,0.12)" : "none",
      opacity: status === "occupied" ? 0.7 : 1,
    }),
    spotCode: {
      position: "absolute" as const,
      top: 2,
      fontSize: 8,
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: 700 as const,
      color: "#b0c7ba",
      letterSpacing: -0.5,
    } as React.CSSProperties,
    checkCircle: {
      width: 20,
      height: 20,
      borderRadius: "50%",
      background: "#128a42",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 6,
    } as React.CSSProperties,
    aisle: {
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      justifyContent: "space-between",
      padding: "8px 0",
      position: "relative" as const,
      minHeight: 300,
    } as React.CSSProperties,
    entryCircle: {
      width: 20,
      height: 20,
      borderRadius: "50%",
      background: "#4098df",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 10,
      fontWeight: 800 as const,
      border: "2px solid #fff",
      boxShadow: "0 2px 8px rgba(64,152,223,0.3)",
      animation: "pulse 2s infinite",
    } as React.CSSProperties,
    entryLabel: {
      fontSize: 8,
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: 800 as const,
      color: "#4098df",
      background: "#e3f2fd",
      border: "1px solid #bbdefb",
      padding: "2px 6px",
      borderRadius: 4,
      textTransform: "uppercase" as const,
      letterSpacing: 1,
      marginTop: 4,
    } as React.CSSProperties,
    roadLine: {
      position: "absolute" as const,
      top: 44,
      bottom: 44,
      left: "50%",
      transform: "translateX(-50%)",
      width: 2,
      borderLeft: "2px dashed #d6e3db",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      justifyContent: "space-around",
      pointerEvents: "none",
    } as React.CSSProperties,
    exitLabel: {
      fontSize: 8,
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: 800 as const,
      color: "#e54d3f",
      background: "#fde8e6",
      border: "1px solid #f8c4c0",
      padding: "2px 6px",
      borderRadius: 4,
      textTransform: "uppercase" as const,
      letterSpacing: 1,
      marginBottom: 4,
    } as React.CSSProperties,
    exitCircle: {
      width: 20,
      height: 20,
      borderRadius: "50%",
      background: "#e54d3f",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 10,
      fontWeight: 800 as const,
      border: "2px solid #fff",
      boxShadow: "0 2px 8px rgba(229,77,63,0.3)",
    } as React.CSSProperties,
    footer: {
      padding: "14px 20px",
      borderTop: "1px solid #eef3f0",
      background: "#fafafa",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontSize: 11,
      color: "#88a693",
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: 700 as const,
    } as React.CSSProperties,
    legendItem: {
      display: "flex",
      alignItems: "center",
      gap: 6,
    } as React.CSSProperties,
    legendSwatch: (type: string) => ({
      width: 14,
      height: 14,
      borderRadius: 4,
      border: type === "occupied"
        ? "1px solid #eef3f0"
        : type === "available"
          ? "1.5px dashed #d6e3db"
          : "1.5px solid #128a42",
      background: type === "occupied" ? "#f4f4f5" : type === "available" ? "#fff" : "rgba(18,138,66,0.05)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }) as React.CSSProperties,
    selectedDot: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: "#128a42",
    } as React.CSSProperties,
  };

  return (
    <div style={s.container}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .indoor-spot-btn:hover:not(:disabled) {
          transform: scale(1.08);
          border-color: #128a42 !important;
          background: rgba(18,138,66,0.03) !important;
        }
      `}</style>

      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.headerIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#88a693" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 800, color: "#0a0d0a", textTransform: "uppercase", letterSpacing: -0.3, margin: 0 }}>Choose Space</h4>
            <p style={{ fontSize: 9, color: "#88a693", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "'JetBrains Mono', monospace", margin: 0 }}>Inside Smart Lot</p>
          </div>
        </div>
        <div style={s.liveBadge}>
          <span style={s.liveDot} />
          <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: "#128a42", fontWeight: 800, textTransform: "uppercase" }}>Live Sensors</span>
        </div>
      </div>

      {/* Floor Tabs */}
      <div style={s.floorTabs}>
        <div style={s.floorGrid}>
          {floors.map((floor) => (
            <button key={floor} onClick={() => setSelectedFloor(floor)} style={s.floorTab(floor === selectedFloor)}>
              {floor}
            </button>
          ))}
        </div>
      </div>

      {/* Map Area */}
      <div style={s.mapArea}>
        <div style={s.gridContainer}>
          {/* Zone A */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "20px 0" }}>
            <div style={s.zoneHeader}>Zone A</div>
            <div style={s.spotsGrid}>
              {zoneA.map((spot) => (
                <button
                  key={spot.code}
                  disabled={!interactive || spot.status === "occupied"}
                  onClick={() => handleSpotClick(spot)}
                  className="indoor-spot-btn"
                  style={s.spotButton(spot.status)}
                >
                  {spot.status === "occupied" ? (
                    renderTopDownCar()
                  ) : (
                    <>
                      <span style={s.spotCode}>{spot.code}</span>
                      {spot.status === "selected" && (
                        <div style={s.checkCircle}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Central Aisle */}
          <div style={s.aisle}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 10, marginTop: -4 }}>
              <div style={s.entryCircle}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
              </div>
              <span style={s.entryLabel}>Entry</span>
            </div>

            <div style={s.roadLine}>
              <span style={{ color: "#d6e3db", fontSize: 10, fontWeight: 700 }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#d6e3db" strokeWidth="3" strokeLinecap="round"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
              </span>
              <span style={{ color: "#d6e3db", fontSize: 10, fontWeight: 700 }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#d6e3db" strokeWidth="3" strokeLinecap="round"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
              </span>
              <span style={{ color: "#d6e3db", fontSize: 10, fontWeight: 700 }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#d6e3db" strokeWidth="3" strokeLinecap="round"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 10, marginBottom: -4 }}>
              <span style={s.exitLabel}>Exit</span>
              <div style={s.exitCircle}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </div>
            </div>
          </div>

          {/* Zone B */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "20px 0" }}>
            <div style={s.zoneHeader}>Zone B</div>
            <div style={s.spotsGrid}>
              {zoneB.map((spot) => (
                <button
                  key={spot.code}
                  disabled={!interactive || spot.status === "occupied"}
                  onClick={() => handleSpotClick(spot)}
                  className="indoor-spot-btn"
                  style={s.spotButton(spot.status)}
                >
                  {spot.status === "occupied" ? (
                    renderTopDownCar()
                  ) : (
                    <>
                      <span style={s.spotCode}>{spot.code}</span>
                      {spot.status === "selected" && (
                        <div style={s.checkCircle}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={s.footer}>
        <div style={s.legendItem}>
          <div style={s.legendSwatch("occupied")}>
            <svg width="8" height="8" viewBox="0 0 24 24" fill="#88a693"><rect x="5" y="1.5" width="14" height="20" rx="3.5" /></svg>
          </div>
          <span>Occupied</span>
        </div>
        <div style={s.legendItem}>
          <div style={s.legendSwatch("available")} />
          <span>Available</span>
        </div>
        <div style={s.legendItem}>
          <div style={s.legendSwatch("selected")}>
            <div style={s.selectedDot} />
          </div>
          <span style={{ color: "#128a42" }}>Your Choice</span>
        </div>
      </div>
    </div>
  );
}
