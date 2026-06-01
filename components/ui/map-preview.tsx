"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface BusData {
  id: string;
  lat: number;
  lng: number;
  label: string;
  status: "moving" | "stopped" | "delayed";
  speed?: number;
  energyType?: string;
}

export function MapPreview({ className }: { className?: string }) {
  const [buses, setBuses] = useState<BusData[]>([]);
  const [isRealData, setIsRealData] = useState(false);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // 1. Fetching GPS positions
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const terminalId = 1; // Default to terminal 1 (El Roble)
        const res = await fetch(`/api/gps?action=get_fleet_positions&terminal_id=${terminalId}`);
        const data = await res.json();
        
        if (data.status === "ok" && Array.isArray(data.data) && data.data.length > 0) {
          const mapped: BusData[] = data.data.map((b: any) => ({
            id: String(b.id_bus),
            lat: b.coordenada_lat,
            lng: b.coordenada_lon,
            label: b.patente || `BUS-${b.id_bus}`,
            status: b.velocidad_kmh > 0 ? "moving" : "stopped",
            speed: b.velocidad_kmh,
            energyType: b.tipo_energia
          }));
          setBuses(mapped);
          setIsRealData(true);
        } else {
          useMockData();
        }
      } catch (err) {
        useMockData();
      } finally {
        setLoading(false);
      }
    };

    const useMockData = () => {
      // Mock Santiago coordinates around Plaza Italia
      const mockBuses: BusData[] = [
        { id: "1", lat: -33.4372 + 0.002, lng: -70.6341 - 0.003, label: "401-FLXC-12", status: "moving", speed: 45, energyType: "Eléctrico" },
        { id: "2", lat: -33.4372 - 0.001, lng: -70.6341 + 0.002, label: "210-BJKP-88", status: "moving", speed: 30, energyType: "Diésel" },
        { id: "3", lat: -33.4372 + 0.003, lng: -70.6341 + 0.004, label: "506-DWSL-44", status: "stopped", speed: 0, energyType: "Eléctrico" },
        { id: "4", lat: -33.4372 - 0.004, lng: -70.6341 - 0.002, label: "I09-GHSW-10", status: "delayed", speed: 5, energyType: "Eléctrico" },
      ];
      setBuses(mockBuses);
      setIsRealData(false);
    };

    fetchPositions();
    const interval = setInterval(fetchPositions, 5000);
    return () => clearInterval(interval);
  }, []);

  // 2. Load MapLibre GL
  useEffect(() => {
    // Load MapLibre CSS and JS dynamically from CDN
    const cssId = "maplibre-css";
    if (!document.getElementById(cssId)) {
      const css = document.createElement("link");
      css.id = cssId;
      css.rel = "stylesheet";
      css.href = "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css";
      document.head.appendChild(css);
    }

    const scriptId = "maplibre-js";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js";
      script.async = true;
      document.head.appendChild(script);
      script.onload = () => {
        initMap();
      };
    } else {
      // @ts-ignore
      if (window.maplibregl) {
        initMap();
      }
    }

    function initMap() {
      // @ts-ignore
      if (typeof window.maplibregl === "undefined" || mapRef.current) return;
      
      // @ts-ignore
      const mapInstance = new window.maplibregl.Map({
        container: "map-container",
        style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
        center: [-70.6341, -33.4372], // Santiago Center
        zoom: 13,
        attributionControl: false
      });

      // @ts-ignore
      mapInstance.addControl(new window.maplibregl.NavigationControl(), "top-right");
      mapRef.current = mapInstance;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 3. Update Markers and Map Center
  useEffect(() => {
    const map = mapRef.current;
    // @ts-ignore
    const maplibregl = window.maplibregl;
    if (!map || !maplibregl || buses.length === 0) return;

    // Clear old markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    let sumLat = 0;
    let sumLng = 0;

    buses.forEach((bus) => {
      sumLat += bus.lat;
      sumLng += bus.lng;

      // Create Custom DOM Element for the Marker
      const el = document.createElement("div");
      el.className = "group relative pointer-events-auto cursor-pointer";

      // HTML template mirroring custom styling
      el.innerHTML = `
        <div class="flex h-8 w-8 items-center justify-center rounded-full border shadow-lg transition-transform hover:scale-125 ${
          bus.status === "moving" ? "border-blue-500/50 bg-blue-500/20 text-blue-400" :
          bus.status === "delayed" ? "border-orange-500/50 bg-orange-500/20 text-orange-400" :
          "border-slate-500/50 bg-slate-500/20 text-slate-400"
        }">
          ${
            bus.status === "moving" 
              ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-navigation h-4 w-4 rotate-45"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg><div class="absolute inset-0 animate-ping rounded-full bg-blue-500/20"></div>`
              : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin h-4 w-4"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`
          }
        </div>
        <div class="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-black/90 px-2 py-1 text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-md z-50">
          ${bus.label} • ${bus.energyType || "Motor"} • ${bus.speed ? `${bus.speed} km/h` : bus.status === "moving" ? "En tránsito" : "Detenido"}
        </div>
      `;

      // Instantiate Marker and add to Map
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([bus.lng, bus.lat])
        .addTo(map);

      markersRef.current.push(marker);
    });

    // Center map around the average bus location
    const centerLng = sumLng / buses.length;
    const centerLat = sumLat / buses.length;
    map.setCenter([centerLng, centerLat]);

  }, [buses]);

  return (
    <div className={cn("relative aspect-video w-full overflow-hidden rounded-[24px] border border-white/10 bg-[#06080c]", className)}>
      <div id="map-container" className="absolute inset-0 h-full w-full opacity-70" />

      {/* Connection Mode Indicator */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 backdrop-blur-md">
        <div className={cn("h-2.5 w-2.5 rounded-full animate-pulse", isRealData ? "bg-green-500" : "bg-orange-500")} />
        <span className="text-[11px] font-semibold text-white tracking-wide">
          {isRealData ? "Datos Reales (TCP)" : "Modo Demostración"}
        </span>
      </div>

      <div className="absolute bottom-2 right-4 flex items-center gap-1 opacity-60 pointer-events-none z-10">
        <div className="h-3 w-3 rounded-sm bg-blue-500" />
        <span className="text-[9px] font-bold text-white uppercase tracking-tighter">MapLibre GL • Santiago</span>
      </div>

      <div className="absolute bottom-4 left-4 rounded-xl border border-white/10 bg-black/40 p-3 backdrop-blur-md z-10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Estado de Flota</p>
        <div className="mt-2 flex gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-xs text-white">
              {buses.filter(b => b.status === "moving").length} En ruta
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-orange-500" />
            <span className="text-xs text-white">
              {buses.filter(b => b.status === "delayed").length} Alertas
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
