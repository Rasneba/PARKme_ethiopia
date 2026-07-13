"use client";

import { useEffect, useRef, useCallback } from "react";
import type L from "leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

/* eslint-disable @typescript-eslint/no-explicit-any */
type SpotData = Record<string, any>;

export interface LeafletMapHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  flyToNearest: (lat: number, lng: number) => void;
}

export default function LeafletMap(
  {
    spots,
    onSelectSpot,
    onBookSpot,
    selectedSpotId,
    onNearMe,
    satellite,
    userLocation,
    mapRef: externalMapRef,
  }: {
    spots: any[];
    onSelectSpot: (spot: any) => void;
    onBookSpot: (spot: any) => void;
    selectedSpotId: number | null;
    onNearMe: () => void;
    satellite: boolean;
    userLocation?: { lat: number; lng: number } | null;
    mapRef?: React.MutableRefObject<LeafletMapHandle | null>;
  },
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const LRef = useRef<typeof L | null>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());
  const streetLayerRef = useRef<L.TileLayer | null>(null);
  const satelliteLayerRef = useRef<L.TileLayer | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const selectedSpotIdRef = useRef<number | null>(null);

  const greenIconHtml = `<div style="width:32px;height:32px;background:linear-gradient(135deg,#0fa24b,#086a32);border:3px solid white;border-radius:50% 50% 50% 4px;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(0,0,0,.35);display:grid;place-items:center;cursor:pointer;">
    <span style="transform:rotate(45deg);color:white;font-weight:900;font-size:13px;">P</span>
  </div>`;

  const activeIconHtml = `<div style="width:40px;height:40px;background:linear-gradient(135deg,#e54d3f,#ac3c31);border:4px solid white;border-radius:50% 50% 50% 4px;transform:rotate(-45deg) scale(1.1);box-shadow:0 5px 18px rgba(229,77,63,.45);display:grid;place-items:center;cursor:pointer;animation:pinBounce .4s ease;">
    <span style="transform:rotate(45deg);color:white;font-weight:900;font-size:15px;">P</span>
  </div>`;

  const userIconHtml = `<div style="position:relative;width:20px;height:20px;">
    <div style="position:absolute;inset:0;background:rgba(64,152,223,.2);border-radius:50%;animation:userPulse 2s infinite;"></div>
    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:14px;height:14px;background:#4098df;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.3);"></div>
  </div>`;

  const createSpotPopup = useCallback(
    (spot: any, isNearest?: boolean) => {
      const distText = spot.distanceKm != null
        ? `${spot.distanceKm < 1 ? Math.round(spot.distanceKm * 1000) + " m" : spot.distanceKm.toFixed(1) + " km"} away`
        : "";
      return `
        <div style="font-family:Arial,sans-serif;min-width:190px;padding:4px 0;">
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
    },
    [],
  );

  const makeGreenIcon = useCallback(
    (L: any) =>
      L.divIcon({
        className: "leaflet-custom-icon green-pin",
        html: greenIconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      }),
    [],
  );

  const makeActiveIcon = useCallback(
    (L: any) =>
      L.divIcon({
        className: "leaflet-custom-icon red-pin",
        html: activeIconHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      }),
    [],
  );

  const makeUserIcon = useCallback(
    (L: any) =>
      L.divIcon({
        className: "leaflet-custom-icon user-pin",
        html: userIconHtml,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      }),
    [],
  );

  // Keep selectedSpotId in sync for popup logic inside cluster events
  useEffect(() => {
    selectedSpotIdRef.current = selectedSpotId;
  }, [selectedSpotId]);

  // ---- INIT MAP ----
  useEffect(() => {
    if (!containerRef.current || mapInstance.current) return;

    async function init() {
      const L = (await import("leaflet")).default;
      LRef.current = L;
      await import("leaflet/dist/leaflet.css");

      const map = L.map(containerRef.current!, {
        center: [9.0218, 38.7575],
        zoom: 13,
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

      const clusterGroup = (L as any).markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        disableClusteringAtZoom: 17,
        iconCreateFunction: (cluster: any) => {
          const count = cluster.getChildCount();
          let size = 36;
          let className = "marker-cluster-small";
          if (count > 10) { size = 52; className = "marker-cluster-large"; }
          else if (count > 4) { size = 44; className = "marker-cluster-medium"; }
          return L.divIcon({
            html: `<div style="width:${size}px;height:${size}px;display:grid;place-items:center;background:linear-gradient(135deg,#0fa24b,#086a32);border:3px solid white;border-radius:50%;box-shadow:0 3px 12px rgba(0,0,0,.3);color:white;font-weight:800;font-size:${size > 44 ? 16 : 13}px;">${count}</div>`,
            className: `marker-cluster-custom ${className}`,
            iconSize: L.point(size, size),
          });
        },
      });

      map.addLayer(clusterGroup);
      clusterRef.current = clusterGroup;

      const greenIcon = makeGreenIcon(L);

      spots.forEach((spot) => {
        const marker = L.marker([spot.lat, spot.lng], { icon: greenIcon });

        marker.on("click", () => {
          markersRef.current.forEach((m, id) => {
            if (id !== spot.id) m.setIcon(makeGreenIcon(L));
          });
          marker.setIcon(makeActiveIcon(L));
          onSelectSpot(spot);
        });

        clusterGroup.addLayer(marker);
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

  // ---- UPDATE MARKERS when spots change ----
  useEffect(() => {
    const cluster = clusterRef.current;
    const L = LRef.current;
    if (!cluster || !L) return;

    const greenIcon = makeGreenIcon(L);
    const activeIcon = makeActiveIcon(L);

    // Remove stale markers
    markersRef.current.forEach((marker, id) => {
      if (!spots.find((s) => s.id === id)) {
        cluster.removeLayer(marker);
        markersRef.current.delete(id);
      }
    });

    // Add new markers
    spots.forEach((spot) => {
      if (markersRef.current.has(spot.id)) return;
      const marker = L.marker([spot.lat, spot.lng], { icon: greenIcon });
      marker.on("click", () => {
        markersRef.current.forEach((m, mid) => {
          if (mid !== spot.id) m.setIcon(makeGreenIcon(L));
        });
        marker.setIcon(makeActiveIcon(L));
        onSelectSpot(spot);
      });
      cluster.addLayer(marker);
      markersRef.current.set(spot.id, marker);
    });

    // Refresh all popups with updated distance data
    markersRef.current.forEach((marker, id) => {
      const spot = spots.find((s) => s.id === id);
      if (spot && id === selectedSpotIdRef.current) {
        marker.setIcon(activeIcon);
        marker.setPopupContent(createSpotPopup(spot));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spots]);

  // ---- SATELLITE TOGGLE ----
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

  // ---- NEAR ME: fly to user, expand cluster, highlight nearest ----
  useEffect(() => {
    const map = mapInstance.current;
    const L = LRef.current;
    const cluster = clusterRef.current;
    if (!map || !L || !userLocation || !cluster) return;

    // Fly to user at zoom 16 so nearby clusters expand
    map.flyTo([userLocation.lat, userLocation.lng], 16, { duration: 1.2 });

    // Place / move user marker
    const userIcon = makeUserIcon(L);

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

    // Find nearest spot
    const withDist = spots.map((s) => ({
      ...s,
      dist: haversineKm(userLocation.lat, userLocation.lng, s.lat, s.lng),
    }));
    withDist.sort((a, b) => a.dist - b.dist);
    const nearest = withDist[0];
    if (!nearest) return;

    // After flyTo completes, zoom to the nearest cluster and spiderfy to reveal the marker
    map.once("moveend", () => {
      const nearestMarker = markersRef.current.get(nearest.id);
      if (!nearestMarker) return;

      // If the marker is in a cluster, zoom in enough to un-cluster it
      const parent = (nearestMarker as any)._parent;
      if (parent && parent._markers) {
        // Marker is clustered — zoom in to disable clustering and show it
        const targetZoom = Math.max(map.getZoom(), 17);
        map.setZoom(targetZoom, { animate: true });
      }

      // After a short delay, spiderfy and open popup
      setTimeout(() => {
        nearestMarker.setIcon(makeActiveIcon(L));
        nearestMarker.setPopupContent(createSpotPopup(nearest, true));

        // Spiderfy the cluster containing this marker
        const latlng = nearestMarker.getLatLng();
        const bounds = map.getBounds();
        if (!bounds.contains(latlng)) {
          map.setView(latlng, 17, { animate: true });
        }
        nearestMarker.openPopup();
      }, 600);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation]);

  // ---- SELECTED SPOT HIGHLIGHT ----
  useEffect(() => {
    const L = LRef.current;
    if (!L) return;

    markersRef.current.forEach((marker, id) => {
      const greenIcon = makeGreenIcon(L);
      const activeIcon = makeActiveIcon(L);

      if (id === selectedSpotId) {
        marker.setIcon(activeIcon);
        const spot = spots.find((s) => s.id === id);
        if (spot) {
          marker.setPopupContent(createSpotPopup(spot));
          // Ensure the marker is visible by expanding its parent cluster
          const cluster = clusterRef.current;
          if (cluster) {
            cluster.zoomToShowLayer(marker, () => {
              marker.openPopup();
            });
          }
        }
      } else {
        marker.setIcon(greenIcon);
      }
    });
  }, [selectedSpotId, spots, createSpotPopup, makeGreenIcon, makeActiveIcon]);

  // ---- EXPOSE zoom controls via external ref ----
  useEffect(() => {
    if (!externalMapRef) return;
    externalMapRef.current = {
      zoomIn: () => mapInstance.current?.zoomIn(),
      zoomOut: () => mapInstance.current?.zoomOut(),
      flyToNearest: (lat: number, lng: number) => {
        mapInstance.current?.flyTo([lat, lng], 16, { duration: 1.2 });
      },
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
        .marker-cluster-custom { background: transparent !important; border: none !important; }
        .marker-cluster-custom div { transition: transform .2s ease; }
        .marker-cluster-custom div:hover { transform: scale(1.12); }
        .marker-cluster-small div { background: linear-gradient(135deg,#0fa24b,#086a32) !important; }
        .marker-cluster-medium div { background: linear-gradient(135deg,#1a8a52,#0d7a3c) !important; }
        .marker-cluster-large div { background: linear-gradient(135deg,#086a32,#064f24) !important; }
        .marker-cluster .marker-cluster-small,
        .marker-cluster .marker-cluster-medium,
        .marker-cluster .marker-cluster-large { background: transparent !important; }
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
