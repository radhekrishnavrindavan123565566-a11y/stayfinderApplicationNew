"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MapPin, Loader } from "lucide-react";

interface NeighborhoodMapProps {
  lat?: number;
  lng?: number;
  address: string;
  city: string;
  amenities?: Array<{
    type: string;
    name: string;
    distanceKm: number;
    walkTimeMinutes: number;
  }>;
}

const CATEGORY_COLORS: Record<string, string> = {
  school: "#4F46E5",
  hospital: "#DC2626",
  park: "#16A34A",
  transit: "#7C3AED",
  restaurant: "#EA580C",
  gym: "#0891B2",
  grocery: "#A16207",
};

export default function NeighborhoodMap({
  lat,
  lng,
  address,
  city,
  amenities,
}: NeighborhoodMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(!lat || !lng);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!lat || !lng) return;
    loadMap();
  }, [lat, lng]);

  const loadMap = async () => {
    if (!mapRef.current || !lat || !lng) return;

    // Dynamically load Google Maps script
    if (!(window as any).google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else {
      initializeMap();
    }
  };

  const initializeMap = () => {
    if (!mapRef.current || !lat || !lng) return;

    const map = new (window as any).google.maps.Map(mapRef.current, {
      zoom: 15,
      center: { lat, lng },
      styles: [
        { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
        {
          elementType: "labels.icon",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#c9c9c9" }],
        },
      ],
    });

    // Add property marker
    new (window as any).google.maps.Marker({
      position: { lat, lng },
      map,
      title: "Property Location",
      icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
    });

    // Add amenity markers
    amenities?.forEach((amenity) => {
      if (selectedCategory && amenity.type !== selectedCategory) return;

      const marker = new (window as any).google.maps.Marker({
        position: { lat: lat! + Math.random() * 0.02, lng: lng! + Math.random() * 0.02 },
        map,
        title: amenity.name,
        icon: {
          path: (window as any).google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: CATEGORY_COLORS[amenity.type.toLowerCase()] || "#999",
          fillOpacity: 0.8,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
      });

      const infoWindow = new (window as any).google.maps.InfoWindow({
        content: `
          <div style="font-family: sans-serif; padding: 8px;">
            <p style="margin: 0; font-weight: bold;">${amenity.name}</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: #666;">
              ${amenity.distanceKm} km away · ${amenity.walkTimeMinutes} min walk
            </p>
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });
    });

    setMapLoaded(true);
    setLoading(false);
  };

  const categories = Array.from(
    new Set(amenities?.map((a) => a.type.toLowerCase()) || [])
  );

  const getCategoryCount = (category: string) => {
    return amenities?.filter((a) => a.type.toLowerCase() === category).length || 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-sm">
            🗺️
          </span>
          Neighborhood Map
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Explore nearby amenities and points of interest
        </p>
      </div>

      {/* Category filters */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedCategory === null
                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            All
          </motion.button>
          {categories.map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? "text-white dark:text-zinc-900"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
              style={{
                backgroundColor: selectedCategory === cat ? CATEGORY_COLORS[cat] : undefined,
              }}
            >
              {cat} ({getCategoryCount(cat)})
            </motion.button>
          ))}
        </div>
      )}

      {/* Map container */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative w-full bg-zinc-100 dark:bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700"
        style={{ aspectRatio: "16/9" }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader className="w-6 h-6 text-green-500" />
              </motion.div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Loading map...
              </p>
            </div>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />
      </motion.div>

      {/* Amenities list */}
      {amenities && amenities.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
            Nearby Amenities ({amenities.length})
          </p>
          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
            {amenities
              .filter((a) => !selectedCategory || a.type.toLowerCase() === selectedCategory)
              .slice(0, 10)
              .map((amenity, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-100 dark:border-zinc-700"
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor:
                        CATEGORY_COLORS[amenity.type.toLowerCase()] || "#999",
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                      {amenity.name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {amenity.distanceKm} km · {amenity.walkTimeMinutes} min walk
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 capitalize flex-shrink-0">
                    {amenity.type}
                  </span>
                </motion.div>
              ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
