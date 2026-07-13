"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import Supercluster from "supercluster";

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface MapLibreHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  flyToNearest: (lat: number, lng: number) => void;
}

const GREEN_PIN = `<svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0fa24b"/><stop offset="100%" stop-color="#086a32"/></linearGradient></defs><path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0z" fill="url(#pg)" stroke="white" stroke-width="2.5"/><text x="16" y="20" text-anchor="middle" fill="white" font-size="14" font-weight="900" font-family="Arial">P</text></svg>`;
const RED_PIN = `<svg width="40" height="48" viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pr" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#e54d3f"/><stop offset="100%" stop-color="#ac3c31"/></linearGradient></defs><path d="M20 0C8.95 0 0 8.95 0 20c0 15 20 28 20 28s20-13 20-28C40 8.95 31.05 0 20 0z" fill="url(#pr)" stroke="white" stroke-width="3"/><text x="20" y="24" text-anchor="middle" fill="white" font-size="16" font-weight="900" font-family="Arial">P</text></svg>`;
const BLUE_DOT = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#4098df" stroke="white" stroke-width="3"/><circle cx="12" cy="12" r="4" fill="white"/></svg>`;

const STREET_STYLE = {
  version: 8,
  sources: {
    osm: { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, attribution: "&copy; OpenStreetMap contributors" },
  },
  layers: [{ id: "osm", type: "raster", source: "osm", minzoom: 0, maxzoom: 19 }],
} as any;

const SATELLITE_STYLE = {
  version: 8,
  sources: {
    esri: { type: "raster", tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"], tileSize: 256, attribution: "&copy; Esri, Maxar, Earthstar" },
  },
  layers: [{ id: "esri", type: "raster", source: "esri", minzoom: 0, maxzoom: 19 }],
} as any;

function createInfoHTML(spot: any, isNearest?: boolean): string {
  const dist = spot.distanceKm != null
    ? `${spot.distanceKm < 1 ? Math.round(spot.distanceKm * 1000) + " m" : spot.distanceKm.toFixed(1) + " km"} away`
    : "";
  return `<div style="font-family:Arial,sans-serif;min-width:200px;max-width:260px;padding:4px 0;">
    ${isNearest ? '<div style="display:inline-block;padding:3px 7px;margin-bottom:6px;background:#4098df;color:white;border-radius:5px;font-size:9px;font-weight:800;">NEAREST TO YOU</div>' : ""}
    <b style="font-size:14px;color:#131614;">${spot.name}</b>
    <p style="margin:3px 0;color:#6c746e;font-size:11px;">${spot.address}</p>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;">
      <span style="font-weight:800;color:#0fa24b;font-size:13px;">${spot.price} ETB/hr</span>
      <span style="font-size:10px;color:#888;">${dist || spot.availableSpots + " spots"}</span>
    </div>
    <div style="display:flex;gap:6px;margin-top:8px;">
      <a href="https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}" target="_blank" rel="noopener" style="flex:1;display:flex;align-items:center;justify-content:center;gap:4px;padding:8px;background:#dcf8e4;color:#086a32;border:none;border-radius:8px;font-size:11px;font-weight:800;text-decoration:none;cursor:pointer;">&#9654; Directions</a>
      <button onclick="window.__parkmeSelectSpot?.(${spot.id})" style="flex:1;padding:8px;background:linear-gradient(135deg,#111a13,#168b45);color:white;border:none;border-radius:8px;font-size:11px;font-weight:800;cursor:pointer;">Select & Reserve</button>
    </div>
  </div>`;
}

export default function MapLibreMap(
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
    mapRef?: React.MutableRefObject<MapLibreHandle | null>;
  },
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<number, maplibregl.Marker>>(new Map());
  const clusterIndex = useRef(new Supercluster({ radius: 60, maxZoom: 17 }));
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const selectedIdRef = useRef<number | null>(null);

  useEffect(() => { selectedIdRef.current = selectedSpotId; }, [selectedSpotId]);
  const spotsRef = useRef(spots);
  useEffect(() => { spotsRef.current = spots; }, [spots]);
  const onSelectSpotRef = useRef(onSelectSpot);
  useEffect(() => { onSelectSpotRef.current = onSelectSpot; }, [onSelectSpot]);

  // ---- INIT MAP ----
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: STREET_STYLE,
        center: [38.7575, 9.0218],
        zoom: 13,
      });
    } catch {
      return;
    }

    map.on("error", () => {});

    map.addControl(new maplibregl.AttributionControl({ compact: true }));
    map.addControl(new maplibregl.NavigationControl({ showCompass: false, visualizePitch: false }), "bottom-right");

    mapRef.current = map;

    map.on("load", () => {
      renderClusteredMarkers(map);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- RENDER CLUSTERED MARKERS ----
  function renderClusteredMarkers(map: maplibregl.Map) {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();

    const geojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: spotsRef.current.map((s) => ({
        type: "Feature",
        properties: { ...s, id: s.id },
        geometry: { type: "Point", coordinates: [s.lng, s.lat] },
      })),
    };

    clusterIndex.current = new Supercluster({ radius: 60, maxZoom: 17 });
    clusterIndex.current.load(geojson.features as any);

    const bounds = map.getBounds();
    const bbox: [number, number, number, number] = [
      bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth(),
    ];
    const zoom = map.getZoom();
    const clusters = clusterIndex.current.getClusters(bbox, Math.floor(zoom));

    clusters.forEach((feature: any) => {
      const [lng, lat] = feature.geometry.coordinates;
      const isCluster = feature.properties.cluster;

      if (isCluster) {
        const count = feature.properties.point_count;
        const size = count > 10 ? 52 : count > 4 ? 44 : 36;
        const el = document.createElement("div");
        el.style.cssText = `width:${size}px;height:${size}px;display:grid;place-items:center;background:linear-gradient(135deg,#0fa24b,#086a32);border:3px solid white;border-radius:50%;box-shadow:0 3px 12px rgba(0,0,0,.3);color:white;font-weight:800;font-size:${size > 44 ? 16 : 13}px;cursor:pointer;`;
        el.textContent = String(count);
        el.addEventListener("click", () => {
          const expansionZoom = clusterIndex.current.getClusterExpansionZoom(feature.properties.cluster_id);
          map.flyTo({ center: [lng, lat], zoom: Math.min(expansionZoom, 18), duration: 500 });
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(map);
        markersRef.current.set(-feature.properties.cluster_id, marker);
      } else {
        const spot = feature.properties;
        const isActive = selectedIdRef.current === spot.id;
        const el = document.createElement("div");
        el.innerHTML = isActive ? RED_PIN : GREEN_PIN;
        el.style.cssText = isActive ? "width:40px;height:48px;cursor:pointer;" : "width:32px;height:40px;cursor:pointer;";
        el.style.filter = "drop-shadow(0 3px 6px rgba(0,0,0,.3))";

        el.addEventListener("click", (e) => {
          e.stopPropagation();
          openSpotPopup(map, spot, [lng, lat]);
          onSelectSpotRef.current(spot);
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(map);
        markersRef.current.set(spot.id, marker);
      }
    });
  }

  function openSpotPopup(map: maplibregl.Map, spot: any, lnglat: [number, number], isNearest?: boolean) {
    popupRef.current?.remove();
    popupRef.current = new maplibregl.Popup({ offset: 25, closeButton: true, maxWidth: "280px" })
      .setLngLat(lnglat)
      .setHTML(createInfoHTML(spot, isNearest))
      .addTo(map);

    // Highlight marker — remove and recreate since MapLibre doesn't support setElement
    markersRef.current.forEach((m, id) => {
      m.remove();
    });
    markersRef.current.clear();

    spotsRef.current.forEach((s) => {
      const isActive = s.id === spot.id;
      const el = document.createElement("div");
      el.innerHTML = isActive ? RED_PIN : GREEN_PIN;
      el.style.cssText = isActive
        ? "width:40px;height:48px;cursor:pointer;filter:drop-shadow(0 3px 6px rgba(0,0,0,.3));"
        : "width:32px;height:40px;cursor:pointer;filter:drop-shadow(0 3px 6px rgba(0,0,0,.3));";
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        openSpotPopup(map, s, [s.lng, s.lat]);
        onSelectSpotRef.current(s);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([s.lng, s.lat])
        .addTo(map);
      markersRef.current.set(s.id, marker);
    });

    // Re-add user marker if exists
    if (userMarkerRef.current) {
      const pos = userMarkerRef.current.getLngLat();
      const el = document.createElement("div");
      el.innerHTML = BLUE_DOT;
      el.style.cssText = "width:24px;height:24px;animation:userPulse 2s infinite;filter:drop-shadow(0 2px 6px rgba(64,152,223,.5));";
      userMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat(pos)
        .addTo(map);
    }
  }

  function placeUserMarker(map: maplibregl.Map, lat: number, lng: number) {
    const el = document.createElement("div");
    el.innerHTML = BLUE_DOT;
    el.style.cssText = "width:24px;height:24px;animation:userPulse 2s infinite;filter:drop-shadow(0 2px 6px rgba(64,152,223,.5));";

    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat([lng, lat]);
    } else {
      userMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(new maplibregl.Popup({ offset: 15 }).setHTML("<b>You are here</b>"))
        .addTo(map);
    }
  }

  // ---- UPDATE MARKERS on spots / moveend ----
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const onMove = () => renderClusteredMarkers(map);
    map.on("moveend", onMove);
    map.on("zoomend", onMove);

    return () => {
      map.off("moveend", onMove);
      map.off("zoomend", onMove);
    };
  }, [spots]); // eslint-disable-line

  // ---- SATELLITE TOGGLE ----
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    try {
      const currentStyle = map.getStyle();
      const isSatellite = currentStyle.sources.esri != null;
      if (satellite && !isSatellite) {
        map.setStyle(SATELLITE_STYLE);
      } else if (!satellite && isSatellite) {
        map.setStyle(STREET_STYLE);
      }
    } catch {}
  }, [satellite]);

  // ---- NEAR ME ----
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;

    map.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 16, duration: 1200 });
    placeUserMarker(map, userLocation.lat, userLocation.lng);

    const withDist = spots.map((s) => ({
      ...s,
      dist: haversineKm(userLocation.lat, userLocation.lng, s.lat, s.lng),
    }));
    withDist.sort((a, b) => a.dist - b.dist);
    const nearest = withDist[0];
    if (!nearest) return;

    const onIdle = () => {
      setTimeout(() => {
        openSpotPopup(map, nearest, [nearest.lng, nearest.lat], true);
        map.panTo([nearest.lng, nearest.lat]);
      }, 500);
      map.off("idle", onIdle);
    };
    map.on("idle", onIdle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation]);

  // ---- SELECTED SPOT ----
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (selectedSpotId != null) {
      const spot = spots.find((s) => s.id === selectedSpotId);
      if (spot) {
        openSpotPopup(map, spot, [spot.lng, spot.lat]);
        map.panTo([spot.lng, spot.lat]);
        if (map.getZoom() < 16) map.setZoom(16);
      }
    } else {
      popupRef.current?.remove();
      renderClusteredMarkers(map);
    }
  }, [selectedSpotId, spots]); // eslint-disable-line

  // ---- EXPOSE ZOOM ----
  useEffect(() => {
    if (!externalMapRef) return;
    externalMapRef.current = {
      zoomIn: () => mapRef.current?.zoomIn(),
      zoomOut: () => mapRef.current?.zoomOut(),
      flyToNearest: (lat: number, lng: number) => mapRef.current?.flyTo({ center: [lng, lat], zoom: 16, duration: 1200 }),
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
        .maplibregl-popup-content {
          border-radius: 12px !important;
          padding: 12px 14px !important;
          box-shadow: 0 10px 30px rgba(0,0,0,.18) !important;
          border: 1px solid #e3e5dd !important;
          margin-bottom: 8px !important;
        }
        .maplibregl-popup-tip { display: none !important; }
        .maplibregl-ctrl-bottom-right { bottom: 50px !important; }
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
