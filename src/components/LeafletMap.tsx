"use client";

import { useEffect, useRef, useCallback } from "react";
import type L from "leaflet";

/* eslint-disable @typescript-eslint/no-explicit-any */
type SpotData = Record<string, any>;

export default function LeafletMap({
  spots,
  onSelectSpot,
  onBookSpot,
  selectedSpotId,
  onNearMe,
  satellite,
  userLocation,
}: {
  spots: any[];
  onSelectSpot: (spot: any) => void;
  onBookSpot: (spot: any) => void;
  selectedSpotId: number | null;
  onNearMe: () => void;
  satellite: boolean;
  userLocation?: { lat: number; lng: number } | null;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const LRef = useRef<typeof L | null>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());
  const streetLayerRef = useRef<L.TileLayer | null>(null);
  const satelliteLayerRef = useRef<L.TileLayer | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const selectedPopupRef = useRef<L.Popup | null>(null);

  const createSpotPopup = useCallback(
    (spot: any, isNearest?: boolean) => {
      const distText = spot.distanceKm != null ? `${spot.distanceKm < 1 ? Math.round(spot.distanceKm * 1000) + ' m' : spot.distanceKm.toFixed(1) + ' km'} away` : '';
      return `
        <div style="font-family:Arial,sans-serif;min-width:190px;padding:4px 0;">
          ${isNearest ? '<div style="display:inline-block;padding:3px 7px;margin-bottom:6px;background:#4098df;color:white;border-radius:5px;font-size:9px;font-weight:800;">NEAREST TO YOU</div>' : ""}
          <b style="font-size:14px;color:#131614;">${spot.name}</b>
          <p style="margin:3px 0;color:#6c746e;font-size:11px;">${spot.address}</p>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;">
            <span style="font-weight:800;color:#0fa24b;font-size:13px;">${spot.price} ETB/hr</span>
            <span style="font-size:10px;color:#888;">${distText || spot.availableSpots + ' spots'}</span>
          </div>
          <div style="display:flex;gap:6px;margin-top:8px;">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}" target="_blank" rel="noopener" style="flex:1;display:flex;align-items:center;justify-content:center;gap:4px;padding:8px;background:#dcf8e4;color:#086a32;border:none;border-radius:8px;font-size:11px;font-weight:800;text-decoration:none;cursor:pointer;">&#9654; Directions</a>
            <button onclick="window.__parkmeSelectSpot?.(${spot.id})" style="flex:1;padding:8px;background:linear-gradient(135deg,#111a13,#168b45);color:white;border:none;border-radius:8px;font-size:11px;font-weight:800;cursor:pointer;">Select & Reserve</button>
          </div>
        </div>`;
    },
    [],
  );

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    async function init() {
      const L = (await import("leaflet")).default;
      LRef.current = L;
      await import("leaflet/dist/leaflet.css");

      const map = L.map(mapRef.current!, {
        center: [9.0218, 38.7575],
        zoom: 14,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      const streetLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      });

      const satelliteLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: '&copy; Esri, Maxar, Earthstar',
          maxZoom: 19,
        },
      );

      streetLayer.addTo(map);
      streetLayerRef.current = streetLayer;
      satelliteLayerRef.current = satelliteLayer;

      const greenIcon = L.divIcon({
        className: "leaflet-custom-icon green-pin",
        html: `<div style="width:32px;height:32px;background:linear-gradient(135deg,#0fa24b,#086a32);border:3px solid white;border-radius:50% 50% 50% 4px;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(0,0,0,.35);display:grid;place-items:center;cursor:pointer;">
          <span style="transform:rotate(45deg);color:white;font-weight:900;font-size:13px;">P</span>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const activeIcon = L.divIcon({
        className: "leaflet-custom-icon red-pin",
        html: `<div style="width:40px;height:40px;background:linear-gradient(135deg,#e54d3f,#ac3c31);border:4px solid white;border-radius:50% 50% 50% 4px;transform:rotate(-45deg) scale(1.1);box-shadow:0 5px 18px rgba(229,77,63,.45);display:grid;place-items:center;cursor:pointer;animation:pinBounce .4s ease;">
          <span style="transform:rotate(45deg);color:white;font-weight:900;font-size:15px;">P</span>
        </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      const userIcon = L.divIcon({
        className: "leaflet-custom-icon user-pin",
        html: `<div style="position:relative;width:20px;height:20px;">
          <div style="position:absolute;inset:0;background:rgba(64,152,223,.2);border-radius:50%;animation:userPulse 2s infinite;"></div>
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:14px;height:14px;background:#4098df;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.3);"></div>
        </div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            userMarkerRef.current = L.marker([pos.coords.latitude, pos.coords.longitude], {
              icon: userIcon,
              zIndexOffset: 1000,
            })
              .addTo(map)
              .bindPopup("<b>You are here</b>");
          },
          () => {},
          { timeout: 5000, enableHighAccuracy: true },
        );
      }

      spots.forEach((spot) => {
        const marker = L.marker([spot.lat, spot.lng], { icon: greenIcon })
          .addTo(map)
          .bindPopup(createSpotPopup(spot), { maxWidth: 240, closeButton: true });

        marker.on("click", () => {
          markersRef.current.forEach((m, id) => {
            if (id !== spot.id) m.setIcon(greenIcon);
          });
          marker.setIcon(activeIcon);
          onSelectSpot(spot);
        });

        markersRef.current.set(spot.id, marker);
      });

      mapInstance.current = map;
    }

    init();

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
      markersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Satellite toggle
  useEffect(() => {
    const map = mapInstance.current;
    const L = LRef.current;
    if (!map || !L) return;

    const streetLayer = streetLayerRef.current;
    const satelliteLayer = satelliteLayerRef.current;
    if (!streetLayer || !satelliteLayer) return;

    if (satellite && !map.hasLayer(satelliteLayer)) {
      map.removeLayer(streetLayer);
      satelliteLayer.addTo(map);
    } else if (!satellite && !map.hasLayer(streetLayer)) {
      map.removeLayer(satelliteLayer);
      streetLayer.addTo(map);
    }
  }, [satellite]);

  // Fly to user location when it changes (Near Me clicked)
  useEffect(() => {
    const map = mapInstance.current;
    const L = LRef.current;
    if (!map || !L || !userLocation) return;

    map.flyTo([userLocation.lat, userLocation.lng], 16, { duration: 1.2 });

    const userIcon = L.divIcon({
      className: "leaflet-custom-icon user-pin",
      html: `<div style="position:relative;width:20px;height:20px;">
        <div style="position:absolute;inset:0;background:rgba(64,152,223,.2);border-radius:50%;animation:userPulse 2s infinite;"></div>
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:14px;height:14px;background:#4098df;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.3);"></div>
      </div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        zIndexOffset: 1000,
      })
        .addTo(map)
        .bindPopup("<b>You are here</b>");
    }
  }, [userLocation]);

  // Update selected marker highlight
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const L = LRef.current;
      if (!L) return;
      const greenIcon = L.divIcon({
        className: "leaflet-custom-icon green-pin",
        html: `<div style="width:32px;height:32px;background:linear-gradient(135deg,#0fa24b,#086a32);border:3px solid white;border-radius:50% 50% 50% 4px;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(0,0,0,.35);display:grid;place-items:center;cursor:pointer;"><span style="transform:rotate(45deg);color:white;font-weight:900;font-size:13px;">P</span></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });
      const activeIcon = L.divIcon({
        className: "leaflet-custom-icon red-pin",
        html: `<div style="width:40px;height:40px;background:linear-gradient(135deg,#e54d3f,#ac3c31);border:4px solid white;border-radius:50% 50% 50% 4px;transform:rotate(-45deg) scale(1.1);box-shadow:0 5px 18px rgba(229,77,63,.45);display:grid;place-items:center;cursor:pointer;"><span style="transform:rotate(45deg);color:white;font-weight:900;font-size:15px;">P</span></div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });
      if (id === selectedSpotId) {
        marker.setIcon(activeIcon);
        const spot = spots.find((s) => s.id === id);
        if (spot) {
          marker.setPopupContent(createSpotPopup(spot));
          marker.openPopup();
        }
      } else {
        marker.setIcon(greenIcon);
      }
    });
  }, [selectedSpotId, spots, createSpotPopup]);

  useEffect(() => {
    (window as unknown as Record<string, unknown>).__parkmeSelectSpot = (id: number) => {
      const spot = spots.find((s) => s.id === id);
      if (spot) onSelectSpot(spot);
    };
    return () => {
      delete (window as unknown as Record<string, unknown>).__parkmeSelectSpot;
    };
  }, [spots, onSelectSpot]);

  useEffect(() => {
    (window as unknown as Record<string, unknown>).__parkmeBookSpot = (id: number) => {
      const spot = spots.find((s) => s.id === id);
      if (spot) onBookSpot(spot);
    };
    return () => {
      delete (window as unknown as Record<string, unknown>).__parkmeBookSpot;
    };
  }, [spots, onBookSpot]);

  return (
    <>
      <style>{`
        @keyframes pinBounce {
          0% { transform: rotate(-45deg) scale(0.6); }
          50% { transform: rotate(-45deg) scale(1.15); }
          100% { transform: rotate(-45deg) scale(1); }
        }
        @keyframes userPulse {
          0% { transform: scale(1); opacity: .7; }
          50% { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
        .leaflet-custom-icon { background: transparent !important; border: none !important; }
      `}</style>
      <div
        ref={mapRef}
        style={{ width: "100%", height: "100%", minHeight: "500px", borderRadius: "16px" }}
      />
    </>
  );
}
