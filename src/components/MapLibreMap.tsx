"use client";

import { useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import Supercluster from "supercluster";

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface MapLibreHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  flyToNearest: (lat: number, lng: number) => void;
}

const GEBETA_TOKEN = process.env.NEXT_PUBLIC_GEBETA_TOKEN || "";

const GREEN_PIN = `<svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0fa24b"/><stop offset="100%" stop-color="#086a32"/></linearGradient></defs><path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0z" fill="url(#pg)" stroke="white" stroke-width="2.5"/><text x="16" y="20" text-anchor="middle" fill="white" font-size="14" font-weight="900" font-family="Arial">P</text></svg>`;
const RED_PIN = `<svg width="40" height="48" viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pr" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#e54d3f"/><stop offset="100%" stop-color="#ac3c31"/></linearGradient></defs><path d="M20 0C8.95 0 0 8.95 0 20c0 15 20 28 20 28s20-13 20-28C40 8.95 31.05 0 20 0z" fill="url(#pr)" stroke="white" stroke-width="3"/><text x="20" y="24" text-anchor="middle" fill="white" font-size="16" font-weight="900" font-family="Arial">P</text></svg>`;
const BLUE_DOT = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#4098df" stroke="white" stroke-width="3"/><circle cx="12" cy="12" r="4" fill="white"/></svg>`;

const GEBETA_STYLE_URL = "https://tiles.gebeta.app/styles/standard/style.json";

const OSM_FALLBACK_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png", "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png", "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap contributors",
    },
  },
  layers: [{ id: "osm-base", type: "raster", source: "osm", minzoom: 0, maxzoom: 19 }],
} as any;

function gebetaTransformRequest(url: string, resourceType?: string): any {
  if (GEBETA_TOKEN && url.startsWith("https://tiles.gebeta.app")) {
    const sep = url.includes("?") ? "&" : "?";
    return {
      url: `${url}${sep}apiKey=${GEBETA_TOKEN}`,
    };
  }
  return { url };
}

const SATELLITE_STYLE = {
  version: 8,
  sources: {
    esri: {
      type: "raster",
      tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      attribution: "&copy; Esri, Maxar, Earthstar",
    },
  },
  layers: [{ id: "esri", type: "raster", source: "esri", minzoom: 0, maxzoom: 19 }],
} as any;

function createInfoHTML(spot: any, isNearest?: boolean, userLoc?: { lat: number; lng: number } | null): string {
  const dist = spot.distanceKm != null
    ? `${spot.distanceKm < 1 ? Math.round(spot.distanceKm * 1000) + " m" : spot.distanceKm.toFixed(1) + " km"} away`
    : "";
  const ghLink = userLoc
    ? `https://gebeta.app/maps?point=${userLoc.lat},${userLoc.lng}&point=${spot.lat},${spot.lng}`
    : `https://gebeta.app/maps?point=${spot.lat},${spot.lng}`;
  return `<div style="font-family:Arial,sans-serif;min-width:200px;max-width:260px;padding:4px 0;">
    ${isNearest ? '<div style="display:inline-block;padding:3px 7px;margin-bottom:6px;background:#4098df;color:white;border-radius:5px;font-size:9px;font-weight:800;">NEAREST TO YOU</div>' : ""}
    <b style="font-size:14px;color:#131614;">${spot.name}</b>
    <p style="margin:3px 0;color:#6c746e;font-size:11px;">${spot.address}</p>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;">
      <span style="font-weight:800;color:#0fa24b;font-size:13px;">${spot.price} ETB/hr</span>
      <span style="font-size:10px;color:#888;">${dist || spot.availableSpots + " spots"}</span>
    </div>
    <div style="display:flex;gap:6px;margin-top:8px;">
      <button onclick="window.__parkmeRoute?.(${spot.lat},${spot.lng})" style="flex:1;display:flex;align-items:center;justify-content:center;gap:4px;padding:8px;background:#dcf8e4;color:#086a32;border:none;border-radius:8px;font-size:11px;font-weight:800;cursor:pointer;">&#9654; Directions</button>
      <button onclick="window.__parkmeSelectSpot?.(${spot.id})" style="flex:1;padding:8px;background:linear-gradient(135deg,#111a13,#168b45);color:white;border:none;border-radius:8px;font-size:11px;font-weight:800;cursor:pointer;">Select & Reserve</button>
    </div>
    ${userLoc ? `<a href="${ghLink}" target="_blank" rel="noopener" style="display:block;text-align:center;margin-top:6px;color:#888;font-size:9px;text-decoration:underline;">Open full route in Gebeta</a>` : ""}
  </div>`;
}

function formatDuration(ms: number): string {
  const totalMin = Math.round(ms / 60000);
  if (totalMin < 1) return "< 1 min";
  if (totalMin < 60) return `${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}h ${m}m`;
}

function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

function createDirectionsHTML(instructions: any[], distance: number, time: number, spotName: string, fromLat: number, fromLng: number, toLat: number, toLng: number): string {
  const filtered = instructions.filter((ins: any) => ins.distance > 0 || ins.sign === 0);
  const steps = filtered.map((ins: any, i: number) => {
    const icon = ins.sign === 0 ? "&#8594;" : ins.sign === -1 ? "&#8619;" : ins.sign === 1 ? "&#8618;" : ins.sign === -2 ? "&#8634;" : ins.sign === 2 ? "&#8635;" : ins.sign === -3 ? "&#8634;" : ins.sign === 3 ? "&#8635;" : "&#9654;";
    const text = ins.text || "";
    const d = formatDistance(ins.distance || 0);
    return `<div style="display:flex;align-items:flex-start;gap:8px;padding:6px 0;border-bottom:1px solid #f0f0f0;">
      <span style="font-size:16px;min-width:22px;text-align:center;color:#0fa24b;font-weight:700;">${icon}</span>
      <div style="flex:1;"><span style="font-size:12px;color:#131614;font-weight:500;">${text}</span><br/><span style="font-size:10px;color:#888;">${d}</span></div>
    </div>`;
  }).join("");

  return `<div style="font-family:Arial,sans-serif;min-width:260px;width:300px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
      <b style="font-size:13px;color:#131614;">Route to ${spotName}</b>
      <button onclick="window.__parkmeClearRoute?.()" style="background:none;border:none;color:#e54d3f;cursor:pointer;font-size:18px;line-height:1;padding:0 4px;">&times;</button>
    </div>
    <div style="display:flex;gap:16px;margin-bottom:10px;padding:8px 0;background:#f7faf8;border-radius:8px;justify-content:center;">
      <span style="font-size:12px;color:#131614;font-weight:700;">&#128207; ${formatDistance(distance)}</span>
      <span style="font-size:12px;color:#131614;font-weight:700;">&#9200; ${formatDuration(time)}</span>
    </div>
    <div style="max-height:360px;overflow-y:auto;scrollbar-width:thin;">
      ${steps}
    </div>
    <a href="https://gebeta.app/maps?point=${fromLat},${fromLng}&point=${toLat},${toLng}" target="_blank" rel="noopener" style="display:block;text-align:center;margin-top:10px;padding:8px;background:#0fa24b;color:white;border-radius:8px;font-size:12px;font-weight:800;text-decoration:none;">Open in Gebeta</a>
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
  const userLocRef = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => { selectedIdRef.current = selectedSpotId; }, [selectedSpotId]);
  const spotsRef = useRef(spots);
  useEffect(() => { spotsRef.current = spots; }, [spots]);
  const onSelectSpotRef = useRef(onSelectSpot);
  useEffect(() => { onSelectSpotRef.current = onSelectSpot; }, [onSelectSpot]);
  useEffect(() => { userLocRef.current = userLocation || null; }, [userLocation]);

  const clearRoute = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    try {
      if (map.getLayer("route-line")) map.removeLayer("route-line");
      if (map.getLayer("route-line-bg")) map.removeLayer("route-line-bg");
      if (map.getSource("route")) map.removeSource("route");
    } catch {}
    popupRef.current?.remove();
  }, []);

  const showRoute = useCallback(async (destLat: number, destLng: number) => {
    const map = mapRef.current;
    if (!map) return;
    const userLoc = userLocRef.current;
    if (!userLoc) {
      popupRef.current?.remove();
      popupRef.current = new maplibregl.Popup({ offset: 25, closeButton: true, maxWidth: "260px" })
        .setLngLat([destLng, destLat])
        .setHTML('<div style="font-family:Arial;padding:8px;font-size:12px;color:#333;">Enable <b>location</b> to get directions from your position.</div>')
        .addTo(map);
      return;
    }

    popupRef.current?.remove();
    popupRef.current = new maplibregl.Popup({ offset: 25, closeButton: true, maxWidth: "280px" })
      .setLngLat([destLng, destLat])
      .setHTML('<div style="font-family:Arial;padding:12px;font-size:12px;color:#888;text-align:center;">Calculating route...</div>')
      .addTo(map);

    try {
      const res = await fetch(
        `/api/directions?from_lat=${userLoc.lat}&from_lng=${userLoc.lng}&to_lat=${destLat}&to_lng=${destLng}`
      );
      const data = await res.json();

      if (!res.ok || !data.route) {
        popupRef.current?.setHTML(`<div style="font-family:Arial;padding:12px;font-size:12px;color:#e54d3f;">${data.error || "No route found"}</div>`);
        return;
      }

      const coords = data.route.points?.coordinates || [];
      if (coords.length < 2) return;

      clearRoute();
      if (!map.getSource("route")) {
        map.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: { type: "LineString", coordinates: coords },
            properties: {},
          },
        });
      }
      if (!map.getLayer("route-line-bg")) {
        map.addLayer({ id: "route-line-bg", type: "line", source: "route", paint: { "line-color": "#ffffff", "line-width": 8, "line-opacity": 0.8 } });
      }
      if (!map.getLayer("route-line")) {
        map.addLayer({ id: "route-line", type: "line", source: "route", paint: { "line-color": "#0fa24b", "line-width": 5, "line-opacity": 0.9 } });
      }

      const destSpot = spotsRef.current.find((s: any) => s.lat === destLat && s.lng === destLng);
      const spotName = destSpot?.name || "destination";
      const dirHTML = createDirectionsHTML(data.instructions, data.distance, data.time, spotName, userLoc.lat, userLoc.lng, destLat, destLng);
      popupRef.current?.remove();
      popupRef.current = new maplibregl.Popup({ offset: 25, closeButton: false, maxWidth: "340px" })
        .setLngLat([destLng, destLat])
        .setHTML(dirHTML)
        .addTo(map);

      const bounds = new maplibregl.LngLatBounds();
      bounds.extend([userLoc.lng, userLoc.lat]);
      bounds.extend([destLng, destLat]);
      coords.forEach((c: number[]) => bounds.extend(c as [number, number]));
      map.fitBounds(bounds, { padding: 60, duration: 800 });
    } catch {
      popupRef.current?.setHTML('<div style="font-family:Arial;padding:12px;font-size:12px;color:#e54d3f;">Route calculation failed.</div>');
    }
  }, [clearRoute]);

  useEffect(() => {
    (window as any).__parkmeRoute = (lat: number, lng: number) => {
      showRoute(lat, lng);
    };
    (window as any).__parkmeClearRoute = () => {
      clearRoute();
    };
    return () => {
      delete (window as any).__parkmeRoute;
      delete (window as any).__parkmeClearRoute;
    };
  }, [showRoute, clearRoute]);

  useEffect(() => { selectedIdRef.current = selectedSpotId; }, [selectedSpotId]);

  // ---- INIT MAP ----
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: GEBETA_STYLE_URL,
        center: [38.7575, 9.0218],
        zoom: 13,
        transformRequest: gebetaTransformRequest,
      });
    } catch {
      return;
    }

    let styleFailed = false;
    const fallbackToOsm = () => {
      if (styleFailed) return;
      styleFailed = true;
      try { map.setStyle(OSM_FALLBACK_STYLE); } catch {}
    };
    map.on("error", (e: any) => {
      if (!styleFailed && (e?.error?.message || "").toString().toLowerCase().includes("style")) {
        fallbackToOsm();
      }
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false, visualizePitch: false }), "top-right");

    mapRef.current = map;

    map.on("load", () => {
      renderClusteredMarkers(map);
    });

    const fallbackTimer = setTimeout(() => {
      if (!map.isStyleLoaded() || Object.keys(map.getStyle()?.sources || {}).length === 0) {
        fallbackToOsm();
        setTimeout(() => renderClusteredMarkers(map), 600);
      }
    }, 6000);

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();
      popupRef.current?.remove();
      clearTimeout(fallbackTimer);
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
      .setHTML(createInfoHTML(spot, isNearest, userLocRef.current))
      .addTo(map);

    markersRef.current.forEach((m) => m.remove());
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
        map.setStyle(GEBETA_STYLE_URL);
        map.setTransformRequest(gebetaTransformRequest);
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
        style={{ width: "100%", height: "100%", minHeight: "300px", borderRadius: "16px" }}
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
