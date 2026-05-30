/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Gauge, MoveRight, Orbit, TimerReset } from "lucide-react";

import { PageIntro } from "@/components/page-intro";
import { WorkspaceMetricGrid } from "@/components/workspace-metric-grid";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  corridorPressure as mockCorridorPressure,
  dispatchMoves as mockDispatchMoves,
  serviceWindows as mockServiceWindows,
  terminalFrequencyMetrics as mockFrequencyMetrics,
} from "@/lib/sicof-screen-data";
import type { Tone } from "@/lib/sicof-data";

const icons = [Gauge, TimerReset, Orbit, MoveRight];

export default function TerminalFrequencyPage() {
  const [terminalId, setTerminalId] = useState(1);
  const [intervals, setIntervals] = useState<any[]>([]);
  const [corridors, setCorridors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRealData, setIsRealData] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("sicof_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.terminal_id) setTerminalId(user.terminal_id);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resIntervals, resCorridors] = await Promise.all([
          fetch(`/api/frequency?action=get_intervals&terminal_id=${terminalId}`).then(r => r.json()),
          fetch(`/api/frequency?action=get_corridor_status&terminal_id=${terminalId}`).then(r => r.json())
        ]);

        if (resIntervals.status === "ok" && resCorridors.status === "ok") {
          setIntervals(resIntervals.data || []);
          setCorridors(resCorridors.data || []);
          setIsRealData(true);
        } else {
          setIsRealData(false);
        }
      } catch (err) {
        console.warn("Backend unavailable for frequency page, using mock fallback:", err);
        setIsRealData(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [terminalId]);

  let displayFrequencyMetrics = mockFrequencyMetrics;
  let displayServiceWindows = mockServiceWindows;
  let displayCorridorPressure = mockCorridorPressure;
  let displayDispatchMoves = mockDispatchMoves;

  if (isRealData && !loading) {
    const totalRoutes = intervals.length;
    const criticalAlerts = intervals.filter(i => i.severity === "Crítico").length;
    const warnAlerts = intervals.filter(i => i.severity === "Advertencia").length;
    const avgGap = intervals.reduce((acc, curr) => acc + curr.actual_min, 0) / Math.max(totalRoutes, 1);

    displayFrequencyMetrics = [
      { label: "Servicios activos", value: String(totalRoutes), detail: "Monitoreados en tiempo real", tone: "blue" as Tone },
      { label: "Brechas críticas", value: String(criticalAlerts), detail: "Superan 50% de la meta", tone: "red" as Tone },
      { label: "Alertas preventivas", value: String(warnAlerts), detail: "Buses bajo umbral de headway", tone: "orange" as Tone },
      { label: "Desviación promedio", value: `${avgGap.toFixed(1)} min`, detail: "Meta global de regularidad", tone: "green" as Tone },
    ];

    displayServiceWindows = intervals.map((i) => ({
      service: i.route,
      gap: `${i.actual_min} min`,
      headway: `${i.target_min} min`,
      nextOut: `En ${Math.max(1, Math.round(i.actual_min - i.deviation))} min`,
      pressure: i.severity === "Normal" ? "Estable" : i.severity === "Advertencia" ? "Presión" : "Brecha crítica",
      tone: i.tone as Tone
    }));

    displayCorridorPressure = corridors.map((c) => ({
      corridor: c.corridor,
      note: `Rutas: ${c.routes_count} · Desviación: ${c.avg_deviation_min} min. Estado: ${c.status}`,
      tone: c.tone as Tone
    }));

    // Movimientos del turno a partir de alertas reales
    displayDispatchMoves = intervals
      .filter(i => i.severity !== "Normal")
      .map((i) => `Regularizar servicio ${i.route}: adelantar salida o sugerir swap por brecha de ${i.deviation} min.`);
    if (displayDispatchMoves.length === 0) {
      displayDispatchMoves = mockDispatchMoves;
    }
  }

  return (
    <main>
      <PageIntro
        badge={`Terminal · Frecuencia · ${isRealData ? "Datos Reales (TCP)" : "Modo Demostración (Mock)"}`}
        title="La frecuencia se protege desde el patio mucho antes de que el problema explote en COF"
        description="Este módulo muestra la presión por servicio, la próxima salida crítica y los movimientos tácticos que pueden cerrar brechas antes de escalar." 
        tone="orange"
        tags={["Regularidad", "Ventanas críticas"]}
        actions={
          <>
            <Link
              href="/terminal/despacho"
              className="btn btn-secondary"
            >
              Ajustar despacho
            </Link>
            <Link
              href="/cof/frecuencia"
              className="btn btn-primary"
            >
              Escalar a COF
            </Link>
          </>
        }
      />

      <WorkspaceMetricGrid items={displayFrequencyMetrics} icons={icons} />

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <Panel
            eyebrow="Servicios en ventana"
            title="Brechas y próxima salida por corredor"
            description="La tabla permite ver dónde aguantar, dónde reasignar y dónde ya conviene avisar al nivel superior."
          >
            {loading ? (
              <div className="py-12 text-center text-slate-400 font-mono text-sm">
                Cargando datos de regularidad...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm text-slate-300">
                  <thead>
                    <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      <th className="pb-2 pr-4 font-medium">Servicio</th>
                      <th className="pb-2 pr-4 font-medium">Gap</th>
                      <th className="pb-2 pr-4 font-medium">Meta</th>
                      <th className="pb-2 pr-4 font-medium">Próxima</th>
                      <th className="pb-2 font-medium">Presión</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayServiceWindows.map((row, idx) => (
                      <tr key={`${row.service}-${idx}`} className="bg-white/4">
                        <td className="rounded-l-2xl border-y border-l border-white/8 px-4 py-3 font-medium text-slate-100">{row.service}</td>
                        <td className="border-y border-white/8 px-4 py-3">{row.gap}</td>
                        <td className="border-y border-white/8 px-4 py-3">{row.headway}</td>
                        <td className="border-y border-white/8 px-4 py-3">{row.nextOut}</td>
                        <td className="rounded-r-2xl border-y border-r border-white/8 px-4 py-3">
                          <StatusBadge label={row.pressure} tone={row.tone} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <Panel
            eyebrow="Presión por corredor"
            title="Dónde conviene mirar primero"
            description="COF ve red. Terminal necesita saber cuál corredor lo está apretando ahora mismo."
          >
            <div className="space-y-3">
              {displayCorridorPressure.map((item, idx) => (
                <div key={`${item.corridor}-${idx}`} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-slate-100">{item.corridor}</h3>
                    <StatusBadge label={item.corridor} tone={item.tone} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{item.note}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      <section className="section-shell pt-0">
        <div className="page-shell">
          <Panel
            eyebrow="Jugadas del turno"
            title="Tres movimientos que ordenan la ventana sin agrandar el problema"
            description="Acá la UI propone acciones concretas. Esa claridad después sirve muchísimo para diseñar lógica real y estados de aprobación."
          >
            <div className="grid gap-3 lg:grid-cols-3">
              {displayDispatchMoves.map((move, index) => (
                <div key={`${move}-${index}`} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-500">Movimiento {index + 1}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{move}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>
    </main>
  );
}
