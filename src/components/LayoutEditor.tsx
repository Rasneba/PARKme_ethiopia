"use client";

import { useRef, useState } from "react";
import type { SpotLayout } from "./SearchPanel";
import { Icon } from "./Icon";

type SpotState = "available" | "occupied" | "maintenance" | "reserved";

const STATE_COLORS: Record<SpotState, string> = {
  available: "#0fa24b",
  occupied: "#c0392b",
  maintenance: "#b8860b",
  reserved: "#4098df",
};

const CANVAS_W = 360;
const CANVAS_H = 260;

export default function LayoutEditor({
  spaceId,
  initialLayout,
  onSaved,
  isGuide = false,
}: {
  spaceId: number;
  initialLayout: SpotLayout | null;
  onSaved?: (layout: SpotLayout) => void;
  isGuide?: boolean;
}) {
  const defaultLayout: SpotLayout = {
    floors: [{
      id: "f1",
      name: "Ground Floor",
      spots: [
        { id: "f1_s1", label: "A-1", x: 60, y: 60, state: "available" },
        { id: "f1_s2", label: "A-2", x: 160, y: 60, state: "available" },
        { id: "f1_s3", label: "A-3", x: 260, y: 60, state: "available" },
        { id: "f1_s4", label: "A-4", x: 360, y: 60, state: "available" },
        { id: "f1_s5", label: "B-1", x: 60, y: 160, state: "available" },
        { id: "f1_s6", label: "B-2", x: 160, y: 160, state: "available" },
        { id: "f1_s7", label: "B-3", x: 260, y: 160, state: "available" },
        { id: "f1_s8", label: "B-4", x: 360, y: 160, state: "available" },
      ]
    }],
  };

  const [layout, setLayout] = useState<SpotLayout>(
    initialLayout ?? defaultLayout,
  );
  const [activeFloorId, setActiveFloorId] = useState(layout.floors[0]?.id ?? "f1");
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  const activeFloor = layout.floors.find((f) => f.id === activeFloorId) ?? layout.floors[0];

  function addFloor() {
    const id = `f${layout.floors.length + 1}`;
    setLayout((l) => ({ ...l, floors: [...l.floors, { id, name: `Floor ${l.floors.length + 1}`, spots: [] }] }));
    setActiveFloorId(id);
    setSelectedSpotId(null);
  }

  function renameFloor(name: string) {
    setLayout((l) => ({ ...l, floors: l.floors.map((f) => (f.id === activeFloorId ? { ...f, name } : f)) }));
  }

  function addSpot() {
    const floor = layout.floors.find((f) => f.id === activeFloorId);
    if (!floor) return;
    const letter = String.fromCharCode(65 + (floor.spots.length % 26));
    const num = Math.floor(floor.spots.length / 26) + 1;
    const id = `s${Date.now()}`;
    setLayout((l) => ({
      ...l,
      floors: l.floors.map((f) =>
        f.id === activeFloorId
          ? { ...f, spots: [...f.spots, { id, label: `${letter}${num}`, x: CANVAS_W / 2, y: CANVAS_H / 2, state: "available" }] }
          : f,
      ),
    }));
    setSelectedSpotId(id);
  }

  function removeSpot(id: string) {
    setLayout((l) => ({
      ...l,
      floors: l.floors.map((f) => (f.id === activeFloorId ? { ...f, spots: f.spots.filter((s) => s.id !== id) } : f)),
    }));
    setSelectedSpotId(null);
  }

  function setState(id: string, state: SpotState) {
    setLayout((l) => ({
      ...l,
      floors: l.floors.map((f) =>
        f.id === activeFloorId ? { ...f, spots: f.spots.map((s) => (s.id === id ? { ...s, state } : s)) } : f,
      ),
    }));
  }

  function onPointerDown(e: React.PointerEvent, spotId: string) {
    if (!dragging) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const spot = activeFloor.spots.find((s) => s.id === spotId);
      if (!spot) return;
      dragOffset.current = { dx: e.clientX - rect.left - spot.x, dy: e.clientY - rect.top - spot.y };
      setDragging(spotId);
      setSelectedSpotId(spotId);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left - dragOffset.current.dx;
    let y = e.clientY - rect.top - dragOffset.current.dy;
    x = Math.max(20, Math.min(CANVAS_W - 20, x));
    y = Math.max(20, Math.min(CANVAS_H - 20, y));
    setLayout((l) => ({
      ...l,
      floors: l.floors.map((f) =>
        f.id === activeFloorId ? { ...f, spots: f.spots.map((s) => (s.id === dragging ? { ...s, x, y } : s)) } : f,
      ),
    }));
  }

  function onPointerUp() {
    setDragging(null);
  }

  async function save() {
    setSaving(true);
    try {
      const r = await fetch(`/api/host/spaces/${spaceId}/layout`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layout }),
      });
      if (r.ok) {
        setSavedAt(Date.now());
        onSaved?.(layout);
      }
    } finally {
      setSaving(false);
    }
  }

  const selectedSpot = activeFloor.spots.find((s) => s.id === selectedSpotId);

  return (
    <div>
      {layout.floors.length > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {layout.floors.map((f) => (
              <button key={f.id} onClick={() => setActiveFloorId(f.id)} style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, border: activeFloorId === f.id ? "2px solid #0fa24b" : "1.5px solid #e0e0e0", background: activeFloorId === f.id ? "#edfcf3" : "#fff", cursor: "pointer" }}>
                {f.name}
              </button>
            ))}
            {!isGuide && (
              <button onClick={addFloor} style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, border: "1.5px dashed #0fa24b", background: "#fff", color: "#0fa24b", cursor: "pointer" }}>+ Floor</button>
            )}
          </div>
          {!isGuide && (
            <button onClick={save} disabled={saving} style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: "#0fa24b", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              {saving ? "Saving..." : savedAt ? "Saved ✓" : "Save layout"}
            </button>
          )}
        </div>
      )}

      {!isGuide && (
        <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
          <input value={activeFloor.name} onChange={(e) => renameFloor(e.target.value)} style={{ padding: "8px 10px", borderRadius: 8, border: "1.5px solid #e0e0e0", fontSize: 13, fontWeight: 700 }} />
          <button onClick={addSpot} style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#111a13", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Add spot</button>
          {selectedSpot && (
            <button onClick={() => removeSpot(selectedSpot.id)} style={{ padding: "8px 14px", borderRadius: 8, border: "1.5px solid #e0e0e0", background: "#fff", color: "#c0392b", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Remove</button>
          )}
        </div>
      )}

      <div
        ref={canvasRef}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ position: "relative", width: "100%", maxWidth: CANVAS_W, height: CANVAS_H, background: "#eef1ee", borderRadius: 12, border: "1px solid #d6dbd6", overflow: "hidden", touchAction: "none" }}
      >
        {activeFloor.spots.length === 0 && !isGuide && (
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#8a8f8c", fontSize: 13, textAlign: "center", padding: 20 }}>
            <div><Icon name="grid" size={28} /><p style={{ marginTop: 8 }}>Tap "+ Add spot" then drag spots to design your lot.</p></div>
          </div>
        )}

        {activeFloor.spots.length === 0 && isGuide && (
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#8a8f8c", fontSize: 13, textAlign: "center", padding: 20 }}>
            <div><Icon name="grid" size={28} /><p style={{ marginTop: 8 }}>No spots configured for this floor yet.</p></div>
          </div>
        )}

        {isGuide
          ? activeFloor.spots.map((s) => {
              const isSelectable = s.state === "available" || s.state === "reserved";
              return (
                <button
                  key={s.id}
                  onClick={() => isSelectable && setSelectedSpotId(s.id)}
                  disabled={!isSelectable}
                  title={`${s.label} — ${s.state}`}
                  style={{
                    position: "absolute",
                    left: s.x,
                    top: s.y,
                    transform: "translate(-50%,-50%)",
                    width: 40, height: 40, borderRadius: 8,
                    border: selectedSpotId === s.id ? "3px solid #111a13" : "1.5px solid rgba(0,0,0,.1)",
                    background: s.state === "available" ? "#0fa24b" : s.state === "reserved" ? "#4098df" : s.state === "maintenance" ? "#b8860b" : "#c0392b",
                    color: "#fff", fontSize: 11, fontWeight: 800,
                    cursor: isSelectable ? "pointer" : "default",
                    opacity: isSelectable ? 1 : 0.45,
                  }}
                >
                  {s.label}
                </button>
              );
            })
          : activeFloor.spots.map((s) => (
              <button
                key={s.id}
                onPointerDown={(e) => onPointerDown(e, s.id)}
                title={`${s.label} — ${s.state}`}
                style={{
                  position: "absolute", left: s.x, top: s.y,
                  transform: "translate(-50%,-50%)",
                  width: 40, height: 40, borderRadius: 8,
                  border: selectedSpotId === s.id ? "3px solid #111a13" : "1.5px solid rgba(0,0,0,.12)",
                  background: STATE_COLORS[s.state],
                  color: "#fff", fontSize: 11, fontWeight: 800,
                  cursor: "grab", touchAction: "none", userSelect: "none",
                }}
              >
                {s.label}
              </button>
            ))}
      </div>

      {selectedSpot && !isGuide && (
        <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input
            value={selectedSpot.label}
            onChange={(e) => setLayout((l) => ({ ...l, floors: l.floors.map((f) => (f.id === activeFloorId ? { ...f, spots: f.spots.map((s) => (s.id === selectedSpot.id ? { ...s, label: e.target.value } : s)) } : f)) }))}
            style={{ width: 90, padding: "8px 10px", borderRadius: 8, border: "1.5px solid #e0e0e0", fontSize: 13, fontWeight: 700 }}
          />
          {(["available", "occupied", "maintenance", "reserved"] as SpotState[]).map((st) => (
            <button
              key={st}
              onClick={() => setState(selectedSpot.id, st)}
              style={{ padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, border: selectedSpot.state === st ? `2px solid ${STATE_COLORS[st]}` : "1.5px solid #e0e0e0", background: selectedSpot.state === st ? STATE_COLORS[st] : "#fff", color: selectedSpot.state === st ? "#fff" : "#374137", cursor: "pointer", textTransform: "capitalize" }}
            >
              {st}
            </button>
          ))}
        </div>
      )}

      {selectedSpot && isGuide && (
        <div style={{ marginTop: 12, padding: 12, background: "#edfcf3", borderRadius: 8, border: "1px solid #0fa24b" }}>
          <p style={{ fontSize: 13, color: "#0fa24b", margin: 0 }}>
            Selected: {selectedSpot.label} — {selectedSpot.state}
          </p>
        </div>
      )}
    </div>
  );
}
