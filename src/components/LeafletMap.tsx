"use client";

import { useEffect, useRef } from "react";
import type L from "leaflet";

/* eslint-disable @typescript-eslint/no-explicit-any */
type SpotData = Record<string, any>;

export default function LeafletMap({
  spots,
  onSelectSpot,
}: {
  spots: any[];
  onSelectSpot: (spot: any) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    async function init() {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      const map = L.map(mapRef.current!, {
        center: [9.0218, 38.7575],
        zoom: 13,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const greenIcon = L.divIcon({
        className: "leaflet-custom-icon green-pin",
        html: '<div style="width:28px;height:28px;background:#0fa24b;border:3px solid white;border-radius:50% 50% 50% 4px;transform:rotate(-45deg);box-shadow:0 3px 8px rgba(0,0,0,.3);display:grid;place-items:center;"><span style="transform:rotate(45deg);color:white;font-weight:800;font-size:11px;">P</span></div>',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });

      const activeIcon = L.divIcon({
        className: "leaflet-custom-icon red-pin",
        html: '<div style="width:34px;height:34px;background:#e54d3f;border:3px solid white;border-radius:50% 50% 50% 4px;transform:rotate(-45deg) scale(1.1);box-shadow:0 4px 12px rgba(0,0,0,.35);display:grid;place-items:center;"><span style="transform:rotate(45deg);color:white;font-weight:800;font-size:13px;">P</span></div>',
        iconSize: [34, 34],
        iconAnchor: [17, 34],
      });

      const userIcon = L.divIcon({
        className: "leaflet-custom-icon user-pin",
        html: '<div style="width:16px;height:16px;background:#4098df;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(64,152,223,.3),0 2px 6px rgba(0,0,0,.25);"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            L.marker([pos.coords.latitude, pos.coords.longitude], { icon: userIcon })
              .addTo(map)
              .bindPopup("<b>You are here</b>");
            map.setView([pos.coords.latitude, pos.coords.longitude], 14);
          },
          () => {},
          { timeout: 5000 },
        );
      }

      spots.forEach((spot) => {
        const marker = L.marker([spot.lat, spot.lng], { icon: greenIcon })
          .addTo(map)
          .bindPopup(
            `<div style="font-family:Arial,sans-serif;min-width:160px;">
              <b style="font-size:13px;">${spot.name}</b>
              <p style="margin:4px 0 2px;color:#666;font-size:11px;">${spot.address}</p>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;">
                <span style="font-weight:800;color:#0fa24b;">${spot.price} ETB/hr</span>
                <span style="font-size:11px;color:#888;">${spot.spaces}</span>
              </div>
              <button onclick="window.__prakmeSelectSpot?.(${spot.id})" style="margin-top:8px;width:100%;padding:6px;background:#131614;color:white;border:none;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;">Reserve</button>
            </div>`,
          );

        marker.on("click", () => {
          markersRef.current.forEach((m) => m.setIcon(greenIcon));
          marker.setIcon(activeIcon);
        });

        markersRef.current.push(marker);
      });

      mapInstance.current = map;
    }

    init();

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, [spots]);

  useEffect(() => {
    (window as unknown as Record<string, unknown>).__prakmeSelectSpot = (id: number) => {
      const spot = spots.find((s) => s.id === id);
      if (spot) onSelectSpot(spot);
    };
    return () => {
      delete (window as unknown as Record<string, unknown>).__prakmeSelectSpot;
    };
  }, [spots, onSelectSpot]);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "100%", minHeight: "500px", borderRadius: "16px" }}
    />
  );
}
