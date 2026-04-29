"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { MapPin, Navigation } from "lucide-react";

interface Bus {
  id: string;
  x: number;
  y: number;
  label: string;
  status: "moving" | "stopped" | "delayed";
}

export function MapPreview({ className }: { className?: string }) {
  const [buses, setBuses] = useState<Bus[]>([
    { id: "1", x: 48, y: 45, label: "401-FLXC-12", status: "moving" },
    { id: "2", x: 52, y: 48, label: "210-BJKP-88", status: "moving" },
    { id: "3", x: 45, y: 35, label: "506-DWSL-44", status: "stopped" },
    { id: "4", x: 55, y: 65, label: "I09-GHSW-10", status: "delayed" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBuses((prev) =>
        prev.map((bus) => ({
          ...bus,
          x: bus.status === "moving" ? (bus.x + (Math.random() - 0.5) * 0.1) : bus.x,
          y: bus.status === "moving" ? (bus.y + (Math.random() - 0.5) * 0.1) : bus.y,
        }))
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let mapInstance: any = null;

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
      if (typeof window.maplibregl === "undefined" || mapInstance) return;
      
      // @ts-ignore
      mapInstance = new window.maplibregl.Map({
        container: "map-container",
        style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
        center: [-70.6341, -33.4372], // Plaza Italia, Santiago
        zoom: 14,
        attributionControl: false
      });

      // @ts-ignore
      mapInstance.addControl(new window.maplibregl.NavigationControl(), "top-right");
    }

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, []);

  return (
    <div className={cn("relative aspect-video w-full overflow-hidden rounded-[24px] border border-white/10 bg-[#06080c]", className)}>
      <div id="map-container" className="absolute inset-0 h-full w-full opacity-60" />

      <div className="absolute bottom-2 right-4 flex items-center gap-1 opacity-60 pointer-events-none">
        <div className="h-3 w-3 rounded-sm bg-blue-500" />
        <span className="text-[9px] font-bold text-white uppercase tracking-tighter">MapLibre GL • Santiago</span>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {buses.map((bus) => (
          <div
            key={bus.id}
            className="absolute transition-all duration-[2000ms] ease-linear"
            style={{ left: `${bus.x}%`, top: `${bus.y}%`, transform: "translate(-50%, -50%)" }}
          >
            <div className="group relative pointer-events-auto">
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border shadow-lg transition-transform hover:scale-125",
                bus.status === "moving" ? "border-blue-500/50 bg-blue-500/20 text-blue-400" :
                bus.status === "delayed" ? "border-orange-500/50 bg-orange-500/20 text-orange-400" :
                "border-slate-500/50 bg-slate-500/20 text-slate-400"
              )}>
                {bus.status === "moving" ? <Navigation className="h-4 w-4 rotate-45" /> : <MapPin className="h-4 w-4" />}
                {bus.status === "moving" && <div className="absolute inset-0 animate-ping rounded-full bg-blue-500/20" />}
              </div>
              <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-black/80 px-2 py-1 text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-md">
                {bus.label} • {bus.status === "moving" ? "En tránsito" : bus.status === "delayed" ? "Retrasado" : "Detenido"}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-4 left-4 rounded-xl border border-white/10 bg-black/40 p-3 backdrop-blur-md">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Estado de Flota</p>
        <div className="mt-2 flex gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-xs text-white">42 En ruta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-orange-500" />
            <span className="text-xs text-white">3 Alertas</span>
          </div>
        </div>
      </div>
    </div>
  );
}
