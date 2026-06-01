"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, AlarmClockCheck, MoveRight, Radar } from "lucide-react";

import { PageIntro } from "@/components/page-intro";
import { WorkspaceMetricGrid } from "@/components/workspace-metric-grid";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { 
  cofFrequencyMetrics as mockMetrics, 
  corridorStatus as mockCorridors, 
  criticalSlots as mockSlots, 
  interventionDeck as mockDeck 
} from "@/lib/sicof-screen-data";
import type { Tone } from "@/lib/sicof-data";

const icons = [Radar, Activity, MoveRight, AlarmClockCheck];

export default function CofFrequencyPage() {
  const [intervals, setIntervals] = useState<any[]>([]);
  const [corridors, setCorridors] = useState<any[]>([]);
  const [isRealData, setIsRealData] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resIntervals, resCorridors] = await Promise.all([
          fetch("/api/frequency?action=get_intervals").then(r => r.json()),
          fetch("/api/frequency?action=get_corridor_status").then(r => r.json())
        ]);

        if (resIntervals.status === "ok" && resCorridors.status === "ok") {
          setIntervals(resIntervals.data || []);
          setCorridors(resCorridors.data || []);
          setIsRealData(true);
        } else {
          setIsRealData(false);
        }
      } catch (err) {
        console.warn("SOA frequency service offline, falling back to mock data.", err);
        setIsRealData(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  let displayMetrics = mockMetrics;
  let displayCorridors = mockCorridors;
  let displayDeck = mockDeck;
  let displaySlots = mockSlots;

  if (isRealData && !loading) {
    // 1. Calculate Metrics from real intervals
    const totalRoutes = intervals.length;
    const criticalCount = intervals.filter(i => i.severity === "Crítico").length;
    const warningCount = intervals.filter(i => i.severity === "Advertencia").length;
    const normalCount = intervals.filter(i => i.severity === "Normal").length;

    displayMetrics = [
      { label: "Rutas en observación", value: String(totalRoutes), detail: "Monitoreo de headway GPS", tone: "blue" as Tone },
      { label: "Brechas críticas", value: String(criticalCount), detail: "Desvío mayor a tolerancia", tone: "red" as Tone },
      { label: "Intervenciones sugeridas", value: String(criticalCount + warningCount), detail: "Reasignación / swaps", tone: "orange" as Tone },
      { label: "Rutas estables", value: String(normalCount), detail: "Mantienen meta de paso", tone: "green" as Tone },
    ];

    // 2. Map Corridor/Route Status Table
    if (intervals.length > 0) {
      displayCorridors = intervals.map((item) => {
        let actionLabel = "Sostener";
        if (item.severity === "Crítico") actionLabel = "Escalar / Inyectar";
        else if (item.severity === "Advertencia") actionLabel = "Reasignar / Swap";

        return {
          corridor: item.route,
          headway: `${item.actual_min} min (Meta ${item.target_min})`,
          deviation: `${item.deviation > 0 ? "+" : ""}${item.deviation}`,
          action: actionLabel,
          tone: item.tone as Tone
        };
      });
    }

    // 3. Dynamically build Deck based on real critical/warning lines
    const activeInterventions = intervals
      .filter(item => item.severity !== "Normal")
      .map(item => {
        const isCritical = item.severity === "Crítico";
        return {
          title: `${isCritical ? "Inyección prioritaria" : "Ajuste preventivo"} en ${item.route}`,
          detail: isCritical 
            ? `Desvío crítico de +${item.deviation} min. Se sugiere liberar reserva táctica del patio.` 
            : `Headway de ${item.actual_min} min en observación. Monitorear ventana de salida de siguientes buses.`,
          tone: item.tone as Tone
        };
      });

    if (activeInterventions.length > 0) {
      displayDeck = activeInterventions.slice(0, 3);
    } else {
      displayDeck = [
        { title: "Operación regular", detail: "Todos los corredores se mantienen dentro del SLA de regularidad.", tone: "green" as Tone }
      ];
    }

    // 4. Adapt slots to real data
    displaySlots = corridors.map(corr => ({
      slot: corr.corridor,
      note: `${corr.status}: Desvío promedio de ${corr.avg_deviation_min > 0 ? "+" : ""}${corr.avg_deviation_min} min en ${corr.routes_count} rutas.`,
      tone: corr.tone as Tone
    }));
  }

  return (
    <main>
      <PageIntro
        badge="COF · Frecuencia"
        title="Acá se ve la red como un tablero de regulación, no como una suma desordenada de alarmas"
        description="COF necesita comparar corredores, entender desviación contra meta y elegir intervención táctica. Todo en un solo plano visual."
        tone="orange"
        tags={["Control multi-terminal", isRealData ? "Datos Reales (TCP)" : "Modo Demostración"]}
        actions={
          <>
            <Link
              href="/cof/terminales"
              className="btn btn-secondary"
            >
              Ver terminales
            </Link>
            <Link
              href="/cof/incidentes"
              className="btn btn-primary"
            >
              Ver incidentes
            </Link>
          </>
        }
      />

      <WorkspaceMetricGrid items={displayMetrics} icons={icons} />

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
          <Panel
            eyebrow="Estado por corredor"
            title="Desviación, headway y acción sugerida"
            description="La tabla ordena lo que se sostiene, lo que se corrige y lo que ya exige decisión más dura."
          >
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm text-slate-300">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    <th className="pb-2 pr-4 font-medium">Corredor / Ruta</th>
                    <th className="pb-2 pr-4 font-medium">Headway</th>
                    <th className="pb-2 pr-4 font-medium">Desvío</th>
                    <th className="pb-2 font-medium">Acción Recomendada</th>
                  </tr>
                </thead>
                <tbody>
                  {displayCorridors.map((row) => (
                    <tr key={row.corridor} className="bg-white/4">
                      <td className="rounded-l-2xl border-y border-l border-white/8 px-4 py-3 font-medium text-slate-100">{row.corridor}</td>
                      <td className="border-y border-white/8 px-4 py-3">{row.headway}</td>
                      <td className="border-y border-white/8 px-4 py-3">{row.deviation}</td>
                      <td className="rounded-r-2xl border-y border-r border-white/8 px-4 py-3">
                        <StatusBadge label={row.action} tone={row.tone} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel
            eyebrow="Deck de intervención"
            title="Jugadas tácticas priorizadas"
            description="La pantalla no solo alerta: propone. Esa diferencia es clave para que el módulo se sienta realmente útil."
          >
            <div className="space-y-3">
              {displayDeck.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-slate-100">{item.title}</h3>
                    <StatusBadge label="Acción" tone={item.tone} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{item.detail}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      <section className="section-shell pt-0">
        <div className="page-shell">
          <Panel
            eyebrow="Estado consolidado por unidades de servicio"
            title="Desviaciones agregadas por zona de concesión"
            description="Permite comprender de forma inmediata qué áreas de la red presentan mayor presión operacional."
          >
            <div className="grid gap-3 lg:grid-cols-3">
              {displaySlots.map((slot) => (
                <div key={slot.slot} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-slate-100">{slot.slot}</h3>
                    <StatusBadge label="Estado" tone={slot.tone} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{slot.note}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>
    </main>
  );
}
