"use client";

import { useEffect, useRef } from "react";
import type { Court } from "@/lib/courts";

declare global {
  interface Window {
    L?: typeof import("leaflet");
  }
}

const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

function loadLeaflet(): Promise<typeof import("leaflet")> {
  return new Promise((resolve, reject) => {
    if (window.L) return resolve(window.L);
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }
    const existing = document.querySelector(`script[src="${LEAFLET_JS}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(window.L!));
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = LEAFLET_JS;
    script.onload = () => resolve(window.L!);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function CourtsMap({
  center,
  courts,
  selectedId,
  onSelect,
}: {
  center: { lat: number; lng: number };
  courts: Court[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    let cancelled = false;
    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current) return;
        if (!mapRef.current) {
          mapRef.current = L.map(containerRef.current, {
            zoomControl: true,
            attributionControl: true,
          }).setView([center.lat, center.lng], 12);
          L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
            {
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
              maxZoom: 19,
            },
          ).addTo(mapRef.current);
        } else {
          mapRef.current.setView([center.lat, center.lng], 12);
        }

        // Clear old markers
        markersRef.current.forEach((m) => m.remove());
        markersRef.current.clear();

        // Search-center marker
        const centerMarker = L.circleMarker([center.lat, center.lng], {
          radius: 7,
          color: "#e8eef2",
          weight: 2,
          fillColor: "#e8eef2",
          fillOpacity: 0.9,
        }).addTo(mapRef.current);
        centerMarker.bindTooltip("Search center");
        markersRef.current.set("__center", centerMarker);

        const bounds: [number, number][] = [[center.lat, center.lng]];
        for (const c of courts) {
          const marker = L.circleMarker([c.lat, c.lng], {
            radius: 9,
            color: "#0a0f14",
            weight: 2,
            fillColor: "#d7f549",
            fillOpacity: 0.95,
          }).addTo(mapRef.current);
          marker.bindTooltip(c.name);
          marker.on("click", () => onSelect(c.id));
          markersRef.current.set(c.id, marker);
          bounds.push([c.lat, c.lng]);
        }
        if (bounds.length > 1) {
          mapRef.current.fitBounds(bounds, { padding: [36, 36], maxZoom: 14 });
        }
      })
      .catch(() => {
        /* map is progressive enhancement — the list still works */
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng, courts]);

  // Highlight selection from the list
  useEffect(() => {
    const m = selectedId && markersRef.current.get(selectedId);
    if (m && mapRef.current) {
      m.setStyle({ fillColor: "#ffffff", radius: 11 });
      mapRef.current.panTo(m.getLatLng());
      m.openTooltip();
      return () => m.setStyle({ fillColor: "#d7f549", radius: 9 });
    }
  }, [selectedId]);

  // Cleanup on unmount
  useEffect(
    () => () => {
      mapRef.current?.remove();
      mapRef.current = null;
    },
    [],
  );

  return (
    <div
      ref={containerRef}
      className="h-[380px] w-full overflow-hidden rounded-card border border-line bg-court-900 sm:h-[460px]"
      aria-label="Map of pickleball courts"
    />
  );
}
