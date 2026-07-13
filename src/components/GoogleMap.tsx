"use client";

import { useEffect, useRef } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { MarkerClusterer } from "@googlemaps/markerclusterer";

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface GoogleMapHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  flyToNearest: (lat: number, lng: number) => void;
}

const GREEN_SVG = `<svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0fa24b"/><stop offset="100%" stop-color="#086a32"/></linearGradient></defs>
  <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0z" fill="url(#pg)" stroke="white" stroke-width="2.5"/>
  <text x="16" y="20" text-anchor="middle" fill="white" font-size="14" font-weight="900" font-family="Arial">P</text>
</svg>`;

const RED_SVG = `<svg width="40" height="48" viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="pr" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#e54d3f"/><stop offset="100%" stop-color="#ac3c31"/></linearGradient></defs>
  <path d="M20 0C8.95 0 0 8.95 0 20c0 15 20 28 20 28s20-13 20-28C40 8.95 31.05 0 20 0z" fill="url(#pr)" stroke="white" stroke-width="3"/>
  <text x="20" y="24" text-anchor="middle" fill="white" font-size="16" font-weight="900" font-family="Arial">P</text>
</svg>`;

const BLUE_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="10" fill="#4098df" stroke="white" stroke-width="3"/>
  <circle cx="12" cy="12" r="4" fill="white"/>
</svg>`;

function makeGreenEl(): HTMLDivElement {
  const el = document.createElement("div");
  el.innerHTML = GREEN_SVG;
  el.style.cssText = "width:32px;height:40px;cursor:pointer;";
  return el;
}

function makeRedEl(): HTMLDivElement {
  const el = document.createElement("div");
  el.innerHTML = RED_SVG;
  el.style.cssText = "width:40px;height:48px;cursor:pointer;";
  return el;
}

function makeBlueEl(): HTMLDivElement {
  const el = document.createElement("div");
  el.innerHTML = BLUE_SVG;
  el.style.cssText = "width:24px;height:24px;animation:userPulse 2s infinite;";
  return el;
}

function createSpotInfoContent(spot: any, isNearest?: boolean): string {
  const distText = spot.distanceKm != null
    ? `${spot.distanceKm < 1 ? Math.round(spot.distanceKm * 1000) + " m" : spot.distanceKm.toFixed(1) + " km"} away`
    : "";
  return `
    <div style="font-family:Arial,sans-serif;min-width:200px;max-width:260px;padding:4px 0;">
      ${isNearest ? '<div style="display:inline-block;padding:3px 7px;margin-bottom:6px;background:#4098df;color:white;border-radius:5px;font-size:9px;font-weight:800;">NEAREST TO YOU</div>' : ""}
      <b style="font-size:14px;color:#131614;">${spot.name}</b>
      <p style="margin:3px 0;color:#6c746e;font-size:11px;">${spot.address}</p>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;">
        <span style="font-weight:800;color:#0fa24b;font-size:13px;">${spot.price} ETB/hr</span>
        <span style="font-size:10px;color:#888;">${distText || spot.availableSpots + " spots"}</span>
      </div>
      <div style="display:flex;gap:6px;margin-top:8px;">
        <a href="https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}" target="_blank" rel="noopener" style="flex:1;display:flex;align-items:center;justify-content:center;gap:4px;padding:8px;background:#dcf8e4;color:#086a32;border:none;border-radius:8px;font-size:11px;font-weight:800;text-decoration:none;cursor:pointer;">&#9654; Directions</a>
        <button onclick="window.__parkmeSelectSpot?.(${spot.id})" style="flex:1;padding:8px;background:linear-gradient(135deg,#111a13,#168b45);color:white;border:none;border-radius:8px;font-size:11px;font-weight:800;cursor:pointer;">Select & Reserve</button>
      </div>
    </div>`;
}

export default function GoogleMap(
  {
    spots,
    onSelectSpot,
    onBookSpot,
    selectedSpotId,
    satellite,
    userLocation,
    mapRef: externalMapRef,
  }: {
    spots: any[];
    onSelectSpot: (spot: any) => void;
    onBookSpot: (spot: any) => void;
    selectedSpotId: number | null;
    satellite: boolean;
    userLocation?: { lat: number; lng: number } | null;
    mapRef?: React.MutableRefObject<GoogleMapHandle | null>;
  },
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<Map<number, any>>(new Map());
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const infoWindowRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const AdvancedMarkerRef = useRef<any>(null);
  const InfoWindowRef = useRef<any>(null);

  const selectedIdRef = useRef(selectedSpotId);
  useEffect(() => { selectedIdRef.current = selectedSpotId; }, [selectedSpotId]);

  const spotsRef = useRef(spots);
  useEffect(() => { spotsRef.current = spots; }, [spots]);

  const onSelectSpotRef = useRef(onSelectSpot);
  useEffect(() => { onSelectSpotRef.current = onSelectSpot; }, [onSelectSpot]);

  // ---- INIT MAP ----
  useEffect(() => {
    if (!containerRef.current || mapInstance.current) return;
    let cancelled = false;

    async function init() {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) { console.error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY not set"); return; }

      setOptions({ key: apiKey, v: "weekly" });

      const [maps, markerLib] = await Promise.all([
        importLibrary("maps"),
        importLibrary("marker"),
      ]);

      if (cancelled || !containerRef.current) return;

      AdvancedMarkerRef.current = markerLib.AdvancedMarkerElement;
      InfoWindowRef.current = maps.InfoWindow;

      const map = new maps.Map(containerRef.current, {
        center: { lat: 9.0218, lng: 38.7575 },
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: false,
        gestureHandling: "greedy",
        styles: [
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "off" }] },
        ],
      });

      mapInstance.current = map;
      infoWindowRef.current = new maps.InfoWindow();

      const clusterer = new MarkerClusterer({
        map,
        markers: [],
        renderer: {
          render: ({ count, position }: { count: number; position: any }) => {
            const size = count > 10 ? 52 : count > 4 ? 44 : 36;
            const el = document.createElement("div");
            el.style.cssText = `width:${size}px;height:${size}px;display:grid;place-items:center;background:linear-gradient(135deg,#0fa24b,#086a32);border:3px solid white;border-radius:50%;box-shadow:0 3px 12px rgba(0,0,0,.3);color:white;font-weight:800;font-size:${size > 44 ? 16 : 13}px;cursor:pointer;`;
            el.textContent = String(count);
            return new markerLib.AdvancedMarkerElement({ position, content: el });
          },
        },
      });
      clustererRef.current = clusterer;

      spots.forEach((spot) => addMarker(map, clusterer, spot));

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => { if (!cancelled) placeUserMarker(map, pos.coords.latitude, pos.coords.longitude); },
          () => {},
          { timeout: 5000, enableHighAccuracy: true },
        );
      }
    }

    init();

    return () => {
      cancelled = true;
      clustererRef.current?.clearMarkers();
      markersRef.current.clear();
      mapInstance.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addMarker(map: any, clusterer: MarkerClusterer, spot: any) {
    if (markersRef.current.has(spot.id)) return;

    const marker = new AdvancedMarkerRef.current({
      position: { lat: spot.lat, lng: spot.lng },
      map,
      content: makeGreenEl(),
      title: spot.name,
    });

    marker.addListener("click", () => {
      markersRef.current.forEach((m, id) => {
        if (id !== spot.id) m.content = makeGreenEl();
      });
      marker.content = makeRedEl();

      infoWindowRef.current?.close();
      infoWindowRef.current = new InfoWindowRef.current({ content: createSpotInfoContent(spot) });
      infoWindowRef.current.open({ map, anchor: marker });
      onSelectSpotRef.current(spot);
    });

    markersRef.current.set(spot.id, marker);
    clusterer.addMarker(marker);
  }

  function placeUserMarker(map: any, lat: number, lng: number) {
    if (userMarkerRef.current) {
      userMarkerRef.current.position = { lat, lng };
    } else {
      userMarkerRef.current = new AdvancedMarkerRef.current({
        position: { lat, lng },
        map,
        content: makeBlueEl(),
        zIndex: 9999,
      });
    }
  }

  // ---- UPDATE MARKERS when spots change ----
  useEffect(() => {
    const map = mapInstance.current;
    const clusterer = clustererRef.current;
    if (!map || !clusterer) return;

    markersRef.current.forEach((marker, id) => {
      if (!spots.find((s) => s.id === id)) {
        clusterer.removeMarker(marker);
        markersRef.current.delete(id);
      }
    });

    spots.forEach((spot) => addMarker(map, clusterer, spot));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spots]);

  // ---- SATELLITE TOGGLE ----
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    const g = (window as any).google;
    map.setMapTypeId(satellite ? g?.maps?.MapTypeId?.SATELLITE : g?.maps?.MapTypeId?.ROADMAP);
  }, [satellite]);

  // ---- NEAR ME: fly to user, expand cluster, highlight nearest ----
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !userLocation) return;

    map.panTo({ lat: userLocation.lat, lng: userLocation.lng });
    map.setZoom(16);
    placeUserMarker(map, userLocation.lat, userLocation.lng);

    const withDist = spots.map((s) => ({
      ...s,
      dist: haversineKm(userLocation.lat, userLocation.lng, s.lat, s.lng),
    }));
    withDist.sort((a, b) => a.dist - b.dist);
    const nearest = withDist[0];
    if (!nearest) return;

    const g = (window as any).google;
    const listener = g?.maps?.event?.addListenerOnce(map, "idle", () => {
      setTimeout(() => {
        const marker = markersRef.current.get(nearest.id);
        if (!marker) return;
        marker.content = makeRedEl();
        infoWindowRef.current?.close();
        infoWindowRef.current = new InfoWindowRef.current({
          content: createSpotInfoContent(nearest, true),
        });
        infoWindowRef.current.open({ map, anchor: marker });
        map.panTo({ lat: nearest.lat, lng: nearest.lng });
        if (map.getZoom() < 16) map.setZoom(16);
      }, 500);
    });

    return () => { if (listener) g?.maps?.event?.removeListener(listener); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation]);

  // ---- SELECTED SPOT HIGHLIGHT ----
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    markersRef.current.forEach((marker, id) => {
      if (id === selectedSpotId) {
        marker.content = makeRedEl();
        const spot = spots.find((s) => s.id === id);
        if (spot) {
          infoWindowRef.current?.close();
          infoWindowRef.current = new InfoWindowRef.current({
            content: createSpotInfoContent(spot),
          });
          infoWindowRef.current.open({ map, anchor: marker });
          map.panTo({ lat: spot.lat, lng: spot.lng });
          if (map.getZoom() < 16) map.setZoom(16);
        }
      } else {
        marker.content = makeGreenEl();
      }
    });
  }, [selectedSpotId, spots]);

  // ---- EXPOSE zoom controls ----
  useEffect(() => {
    if (!externalMapRef) return;
    externalMapRef.current = {
      zoomIn: () => { const m = mapInstance.current; if (m) m.setZoom((m.getZoom() ?? 13) + 1); },
      zoomOut: () => { const m = mapInstance.current; if (m) m.setZoom((m.getZoom() ?? 13) - 1); },
      flyToNearest: (lat: number, lng: number) => { const m = mapInstance.current; if (m) { m.panTo({ lat, lng }); m.setZoom(16); } },
    };
    return () => { if (externalMapRef) externalMapRef.current = null; };
  }, [externalMapRef]);

  // ---- GLOBAL CLICK HANDLERS ----
  useEffect(() => {
    (window as any).__parkmeSelectSpot = (id: number) => {
      const spot = spots.find((s) => s.id === id);
      if (spot) onSelectSpot(spot);
    };
    return () => { delete (window as any).__parkmeSelectSpot; };
  }, [spots, onSelectSpot]);

  useEffect(() => {
    (window as any).__parkmeBookSpot = (id: number) => {
      const spot = spots.find((s) => s.id === id);
      if (spot) onBookSpot(spot);
    };
    return () => { delete (window as any).__parkmeBookSpot; };
  }, [spots, onBookSpot]);

  return (
    <>
      <style>{`
        @keyframes userPulse {
          0% { transform: scale(1); opacity: .7; }
          50% { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
      `}</style>
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%", minHeight: "500px", borderRadius: "16px" }}
      />
    </>
  );
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
