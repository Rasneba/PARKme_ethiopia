"use client";

import { useState, useEffect } from "react";
import { Icon } from "./Icon";

export type SpotStatus = "available" | "occupied" | "reserved" | "disabled" | "entrance" | "exit";

export interface ParkingSpot {
  id: string;
  zone: string;
  floor: string;
  row: number;
  col: number;
  status: SpotStatus;
  plate?: string;
  type: "compact" | "standard" | "handicap" | "ev" | "lane" | "entrance" | "exit";
}

export interface ParkingLotConfig {
  name: string;
  floors: string[];
  zones: string[];
  floorMap: Record<string, Record<string, ParkingSpot[][]>>;
}

interface ParkingLotGridProps {
  config: ParkingLotConfig;
  selectedFloor: string;
  selectedZone: string;
  onSelectSpot?: (spot: ParkingSpot) => void;
  assignedSpot?: string;
  showGuidance?: boolean;
  onNavigateToSpot?: (spot: ParkingSpot) => void;
  readOnly?: boolean;
}

const STATUS_COLORS: Record<SpotStatus, { bg: string; border: string; text: string }> = {
  available: { bg: "#dcf8e4", border: "#0fa24b", text: "#086a32" },
  occupied: { bg: "#fde8e6", border: "#e54d3f", text: "#c53028" },
  reserved: { bg: "#fff8e1", border: "#f5a623", text: "#b8860b" },
  disabled: { bg: "#f0f0f0", border: "#ccc", text: "#999" },
  entrance: { bg: "#e8f4fd", border: "#4098df", text: "#2872b5" },
  exit: { bg: "#fce8e6", border: "#e54d3f", text: "#c53028" },
};

const TYPE_ICONS: Record<string, string> = {
  compact: "S",
  standard: "M",
  handicap: "\u267F",
  ev: "\u26A1",
  lane: "",
  entrance: "\u2192",
  exit: "\u2190",
};

function SpotCell({
  spot,
  isAssigned,
  isSelected,
  onClick,
}: {
  spot: ParkingSpot;
  isAssigned?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  if (spot.type === "lane") {
    return (
      <div
        style={{
          background: "#e8e8e8",
          borderRadius: 2,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 8,
        }}
      >
        {spot.type === "lane" && (
          <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: 3,
                  height: 1,
                  background: "#fff",
                  opacity: 0.7,
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (spot.type === "entrance" || spot.type === "exit") {
    const colors = STATUS_COLORS[spot.status];
    return (
      <div
        style={{
          background: colors.bg,
          border: `2px solid ${colors.border}`,
          borderRadius: 6,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 38,
          cursor: "default",
        }}
      >
        <span style={{ fontSize: 14, color: colors.text }}>
          {spot.type === "entrance" ? "\u2192" : "\u2190"}
        </span>
        <span style={{ fontSize: 7, fontWeight: 700, color: colors.text, textTransform: "uppercase", letterSpacing: 0.5 }}>
          {spot.type}
        </span>
      </div>
    );
  }

  const colors = STATUS_COLORS[spot.status];
  return (
    <div
      onClick={onClick}
      style={{
        background: isAssigned ? "#d0f0ff" : colors.bg,
        border: `2px solid ${isAssigned ? "#2196f3" : isSelected ? "#131614" : colors.border}`,
        borderRadius: 6,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 38,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.15s",
        position: "relative",
        boxShadow: isAssigned ? "0 0 0 2px #2196f3, 0 2px 8px rgba(33,150,243,0.3)" : "none",
        animation: isAssigned ? "assignedPulse 2s infinite" : "none",
      }}
    >
      {isAssigned && (
        <div
          style={{
            position: "absolute",
            top: -6,
            right: -6,
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: "#2196f3",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="check" size={8} stroke={3} />
        </div>
      )}
      {spot.type === "handicap" && (
        <span style={{ fontSize: 8, marginBottom: 1 }}>{TYPE_ICONS.handicap}</span>
      )}
      {spot.type === "ev" && (
        <span style={{ fontSize: 8, marginBottom: 1 }}>{TYPE_ICONS.ev}</span>
      )}
      <span
        style={{
          fontSize: 9,
          fontWeight: 700,
          color: isAssigned ? "#0d47a1" : colors.text,
          lineHeight: 1,
        }}
      >
        {spot.id}
      </span>
      {spot.status === "occupied" && spot.plate && (
        <span style={{ fontSize: 6, color: colors.text, lineHeight: 1, marginTop: 1, opacity: 0.8 }}>
          {spot.plate}
        </span>
      )}
    </div>
  );
}

export default function ParkingLotGrid({
  config,
  selectedFloor,
  selectedZone,
  onSelectSpot,
  assignedSpot,
  showGuidance,
  readOnly = false,
}: ParkingLotGridProps) {
  const [animFrame, setAnimFrame] = useState(0);

  useEffect(() => {
    if (!showGuidance || !assignedSpot) return;
    const interval = setInterval(() => setAnimFrame((f) => (f + 1) % 3), 600);
    return () => clearInterval(interval);
  }, [showGuidance, assignedSpot]);

  const floorData = config.floorMap[selectedFloor]?.[selectedZone];
  if (!floorData) return <div style={{ padding: 20, textAlign: "center", color: "#888" }}>No data for this floor/zone</div>;

  return (
    <div style={{ position: "relative" }}>
      <style>{`
        @keyframes assignedPulse {
          0%, 100% { box-shadow: 0 0 0 2px #2196f3, 0 2px 8px rgba(33,150,243,0.3); }
          50% { box-shadow: 0 0 0 4px #2196f3, 0 2px 12px rgba(33,150,243,0.5); }
        }
        .plg-grid {
          display: grid;
          gap: 3px;
          padding: 8px;
          background: #fafafa;
          border-radius: 12px;
          border: 1px solid #e4e6e4;
        }
        .plg-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          padding: 8px 0 4px;
          font-size: 11px;
          color: #666;
        }
        .plg-legend-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .plg-legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 3px;
          border: 1px solid;
        }
        .plg-guidance-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: #e3f2fd;
          border: 2px solid #2196f3;
          border-radius: 10px;
          margin-bottom: 10px;
          animation: slideIn 0.3s ease;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes driveBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
      `}</style>

      {showGuidance && assignedSpot && (
        <div className="plg-guidance-banner">
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#2196f3", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 16, animation: "driveBounce 0.6s infinite" }}>🚗</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#0d47a1" }}>
              Drive to spot {assignedSpot}
            </div>
            <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>
              Enter from {selectedZone === "A" ? "main" : "side"} entrance → Follow arrows → Your spot is highlighted in blue
            </div>
          </div>
          <Icon name="nav" size={20} stroke={2} />
        </div>
      )}

      <div
        className="plg-grid"
        style={{
          gridTemplateColumns: `repeat(${floorData[0]?.length || 6}, 1fr)`,
        }}
      >
        {floorData.map((row, rowIdx) =>
          row.map((spot, colIdx) => (
            <SpotCell
              key={`${spot.id}-${rowIdx}-${colIdx}`}
              spot={spot}
              isAssigned={spot.id === assignedSpot}
              onClick={!readOnly && onSelectSpot ? () => onSelectSpot(spot) : undefined}
            />
          ))
        )}
      </div>

      <div className="plg-legend">
        {[
          { color: STATUS_COLORS.available.bg, border: STATUS_COLORS.available.border, label: "Available" },
          { color: STATUS_COLORS.occupied.bg, border: STATUS_COLORS.occupied.border, label: "Occupied" },
          { color: STATUS_COLORS.reserved.bg, border: STATUS_COLORS.reserved.border, label: "Reserved" },
          { color: "#d0f0ff", border: "#2196f3", label: "Your spot" },
        ].map((item) => (
          <div key={item.label} className="plg-legend-item">
            <div className="plg-legend-dot" style={{ background: item.color, borderColor: item.border }} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export function generateParkingLot(
  name: string,
  zones: string[],
  floors: string[],
  layout: Record<string, Record<string, number[][]>>
): ParkingLotConfig {
  const floorMap: Record<string, Record<string, ParkingSpot[][]>> = {};

  for (const floor of floors) {
    floorMap[floor] = {};
    for (const zone of zones) {
      const grid = layout[floor]?.[zone] || [];
      const rows = grid.map((row, rowIdx) =>
        row.map((val, colIdx) => {
          const prefix = zone;
          let type: ParkingSpot["type"] = "standard";
          let status: SpotStatus = "available";

          switch (val) {
            case -3: type = "entrance"; status = "entrance"; break;
            case -2: type = "exit"; status = "exit"; break;
            case -1: type = "lane"; status = "available"; break;
            case 0: type = "standard"; status = "available"; break;
            case 1: type = "standard"; status = "occupied"; break;
            case 2: type = "compact"; status = "available"; break;
            case 3: type = "handicap"; status = "available"; break;
            case 4: type = "ev"; status = "available"; break;
            case 5: type = "reserved"; status = "reserved"; break;
            case 6: type = "standard"; status = "disabled"; break;
            default: type = "standard"; status = "available";
          }

          const id =
            val === -3
              ? "IN"
              : val === -2
              ? "OUT"
              : val === -1
              ? ""
              : `${prefix}${rowIdx * 2 + (colIdx + 1)}`;

          return {
            id,
            zone,
            floor,
            row: rowIdx,
            col: colIdx,
            status,
            type,
            plate: status === "occupied" ? `AA-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
          };
        })
      );
      floorMap[floor][zone] = rows;
    }
  }

  return { name, floors, zones, floorMap };
}

export const KAZANCHIS_LOT: ParkingLotConfig = {
  name: "Kazanchis Parking Lot",
  floors: ["G", "1", "2"],
  zones: ["A", "B"],
  floorMap: {
    G: {
      A: [
        [-3, -1, 0, 1, 0, 1, 3, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1],
        [0, 1, 0, 0, 1, 0, 4, 0],
        [-1, -1, -1, -1, -1, -1, -1, -1],
        [1, 0, 1, 2, 0, 1, 0, -2],
      ],
      B: [
        [0, 5, 0, 1, 0, 0, -1, -3],
        [-1, -1, -1, -1, -1, -1, -1, -1],
        [1, 0, 0, 1, 0, 3, 0, 0],
        [-1, -1, -1, -1, -1, -1, -1, -1],
        [0, 1, 2, 0, 1, 0, 1, -2],
      ],
    },
    1: {
      A: [
        [-3, -1, 0, 1, 0, 0, 0, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1],
        [1, 0, 4, 1, 0, 1, 0, 0],
        [-1, -1, -1, -1, -1, -1, -1, -1],
        [0, 1, 0, 0, 2, 0, 1, -2],
      ],
      B: [
        [1, 0, 0, 1, 0, 3, -1, -3],
        [-1, -1, -1, -1, -1, -1, -1, -1],
        [0, 1, 0, 1, 0, 0, 1, 0],
        [-1, -1, -1, -1, -1, -1, -1, -1],
        [0, 0, 1, 0, 5, 0, 0, -2],
      ],
    },
    2: {
      A: [
        [-3, -1, 0, 0, 1, 0, 0, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1],
        [1, 0, 1, 0, 0, 1, 2, 0],
        [-1, -1, -1, -1, -1, -1, -1, -1],
        [0, 1, 0, 3, 1, 0, 0, -2],
      ],
      B: [
        [0, 0, 1, 0, 1, 0, -1, -3],
        [-1, -1, -1, -1, -1, -1, -1, -1],
        [1, 0, 0, 1, 0, 1, 0, 1],
        [-1, -1, -1, -1, -1, -1, -1, -1],
        [0, 1, 2, 0, 0, 1, 0, -2],
      ],
    },
  },
};
