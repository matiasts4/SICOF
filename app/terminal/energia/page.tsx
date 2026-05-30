/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BatteryCharging, BusFront, Gauge, Zap } from "lucide-react";

import { PageIntro } from "@/components/page-intro";
import { WorkspaceMetricGrid } from "@/components/workspace-metric-grid";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  chargerBays as mockChargerBays,
  chargingBoard as mockChargingBoard,
  swapRecommendations as mockSwapRecommendations,
  terminalEnergyMetrics as mockEnergyMetrics,
} from "@/lib/sicof-screen-data";
import type { Tone } from "@/lib/sicof-data";

const icons = [BusFront, Zap, Gauge, BatteryCharging];

export default function TerminalEnergyPage() {
  const [terminalId, setTerminalId] = useState(1);
  const [summary, setSummary] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [chargers, setChargers] = useState<any[]>([]);
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
        const [resSummary, resAlerts, resChargers] = await Promise.all([
          fetch(`/api/soc?action=get_terminal_summary&terminal_id=${terminalId}`).then(r => r.json()),
          fetch(`/api/soc?action=get_alerts&terminal_id=${terminalId}`).then(r => r.json()),
          fetch(`/api/soc?action=get_charger_status&terminal_id=${terminalId}`).then(r => r.json())
        ]);

        if (resSummary.status === "ok" && resAlerts.status === "ok" && resChargers.status === "ok") {
          setSummary(resSummary.data);
          setAlerts(resAlerts.data || []);
          setChargers(resChargers.data || []);
          setIsRealData(true);
        } else {
          setIsRealData(false);
        }
      } catch (err) {
        console.warn("Backend unavailable for energy page, using mock fallback:", err);
        setIsRealData(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [terminalId]);

  let displayEnergyMetrics = mockEnergyMetrics;
  let displayChargingBoard = mockChargingBoard;
  let displayChargerBays = mockChargerBays;
  let displaySwapRecommendations = mockSwapRecommendations;

  if (isRealData && !loading && summary) {
    // Métricas
    displayEnergyMetrics = [
      { label: "Unidades eléctricas", value: String(summary.total_electric), detail: `${summary.healthy} operativas sin alerta`, tone: "green" as Tone },
      { label: "Buses bajo umbral", value: String(summary.alerts), detail: "SoC menor a 50%", tone: "orange" as Tone },
      { label: "Riesgos críticos", value: String(summary.critical), detail: "SoC menor a 30%", tone: "red" as Tone },
      { label: "Cargadores en uso", value: `${chargers.filter(c => c.status !== "Listo").length}/${chargers.length || 6}`, detail: "Capacidad de bahías", tone: "blue" as Tone },
    ];

    // Charging Board
    displayChargingBoard = chargers.map((c) => ({
      unit: c.bus,
      soc: c.soc,
      bay: c.bay,
      eta: c.status === "Listo" ? "Listo" : c.status === "Crítico" ? "1h 15m" : "40 min",
      status: c.status,
      tone: c.tone as Tone
    }));

    // Charger Bays
    displayChargerBays = chargers.slice(0, 3).map((c) => ({
      name: c.bay,
      occupancy: c.status === "Listo" ? "Disponible" : "Ocupado",
      load: c.soc,
      status: c.status === "Listo" ? "Bahía lista para recibir bus." : `Cargando bus ${c.bus} (${c.soc} SoC).`,
      tone: c.tone as Tone
    }));

    // Requerir swaps sugeridos
    displaySwapRecommendations = alerts.map((alert) => ({
      service: alert.nivel_carga < 35 ? "405c" : "406",
      currentBus: alert.patente,
      recommendation: alert.nivel_carga < 30 ? "Swap inmediato por diésel" : "Swap al término de vuelta",
      reason: `Bus con ${alert.nivel_carga}% SoC. Autonomía estimada: ${alert.autonomia_km || 0} km.`,
      tone: alert.tone as Tone
    }));
    if (displaySwapRecommendations.length === 0) {
      displaySwapRecommendations = mockSwapRecommendations;
    }
  }

  return (
    <main>
      <PageIntro
        badge={`Terminal · Energía · ${isRealData ? "Datos Reales (TCP)" : "Modo Demostración (Mock)"}`}
        title="La vista energética tiene que ayudar a decidir, no solo mostrar porcentajes lindos"
        description="SoC, ocupación de cargadores y swaps sugeridos aparecen con lectura operacional directa para que energía y despacho se hablen en el mismo idioma visual." 
        tone="green"
        tags={["SoC", "Swap táctico"]}
        actions={
          <>
            <Link
              href="/terminal/flota"
              className="btn btn-secondary"
            >
              Volver a flota
            </Link>
            <Link
              href="/terminal/despacho"
              className="btn btn-primary"
            >
              Ajustar despacho
            </Link>
          </>
        }
      />

      <WorkspaceMetricGrid items={displayEnergyMetrics} icons={icons} />

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <Panel
            eyebrow="SoC por unidad"
            title="Buses eléctricos que condicionan la salida"
            description="Cada unidad muestra su cargador, ETA y riesgo operacional. El foco no es energía abstracta: es impacto sobre el turno."
          >
            {loading ? (
              <div className="py-12 text-center text-slate-400 font-mono text-sm">
                Cargando datos energéticos...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm text-slate-300">
                  <thead>
                    <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      <th className="pb-2 pr-4 font-medium">Unidad</th>
                      <th className="pb-2 pr-4 font-medium">SoC</th>
                      <th className="pb-2 pr-4 font-medium">Bahía</th>
                      <th className="pb-2 pr-4 font-medium">ETA</th>
                      <th className="pb-2 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayChargingBoard.map((row, idx) => (
                      <tr key={`${row.unit}-${idx}`} className="bg-white/4">
                        <td className="rounded-l-2xl border-y border-l border-white/8 px-4 py-3 font-medium text-slate-100">{row.unit}</td>
                        <td className="border-y border-white/8 px-4 py-3">{row.soc}</td>
                        <td className="border-y border-white/8 px-4 py-3">{row.bay}</td>
                        <td className="border-y border-white/8 px-4 py-3">{row.eta}</td>
                        <td className="rounded-r-2xl border-y border-r border-white/8 px-4 py-3">
                          <StatusBadge label={row.status} tone={row.tone} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <Panel
            eyebrow="Bahías de carga"
            title="Capacidad disponible ahora mismo"
            description="Esta lectura deja clarísimo qué punto conviene usar y dónde se está formando un cuello de botella."
          >
            <div className="space-y-3">
              {displayChargerBays.map((bay, idx) => (
                <div key={`${bay.name}-${idx}`} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-slate-100">{bay.name}</h3>
                    <StatusBadge label={`${bay.occupancy} · ${bay.load}`} tone={bay.tone} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{bay.status}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      <section className="section-shell pt-0">
        <div className="page-shell">
          <Panel
            eyebrow="Swap recomendado"
            title="Movimientos sugeridos para no romper frecuencia por energía"
            description="No alcanza con detectar riesgo. La pantalla tiene que proponer la mejor jugada visible para el turno."
          >
            <div className="grid gap-3 lg:grid-cols-3">
              {displaySwapRecommendations.map((item, idx) => (
                <div key={`${item.service}-${idx}`} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-slate-100">{item.service}</h3>
                    <StatusBadge label={item.currentBus} tone={item.tone} />
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-200">{item.recommendation}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{item.reason}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>
    </main>
  );
}
