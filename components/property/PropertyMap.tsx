"use client";
import { useEffect, useRef } from "react";
import { Property } from "@/store/propertyStore";

interface Props {
  properties: Property[];
  onSelect?: (id: string) => void;
}

// Load Leaflet from CDN — no npm install needed
function loadLeaflet(): Promise<typeof import("leaflet")> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject("SSR");

    // Already loaded
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).L) { resolve((window as any).L); return; }

    // CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // JS
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => resolve((window as any).L); // eslint-disable-line @typescript-eslint/no-explicit-any
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function PropertyMap({ properties, onSelect }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    loadLeaflet().then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return;

      // Fix default marker icons
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!).setView([20.5937, 78.9629], 5);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      const bounds: [number, number][] = [];

      properties.forEach((p) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const loc = (p as any).location;
        const lat = loc?.lat ?? loc?.coordinates?.[1];
        const lng = loc?.lng ?? loc?.coordinates?.[0];
        if (!lat || !lng) return;

        bounds.push([lat, lng]);

        const marker = L.marker([lat, lng]).addTo(map);
        marker.bindPopup(`
          <div style="min-width:160px;font-family:sans-serif">
            <p style="font-weight:600;font-size:13px;margin:0 0 4px 0">${p.title}</p>
            <p style="color:#f43f5e;font-weight:700;margin:0 0 4px 0">₹${p.price.toLocaleString("en-IN")}/mo</p>
            <p style="color:#71717a;font-size:11px;margin:0 0 6px 0">${p.location.city}</p>
            <a href="/properties/${p._id}" style="font-size:11px;color:#f43f5e;font-weight:600;text-decoration:none">View property →</a>
          </div>
        `);
        marker.on("click", () => onSelect?.(p._id));
      });

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    }).catch(() => {
      // Leaflet failed to load — silently ignore
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700"
      style={{ minHeight: "400px" }}
    />
  );
}
