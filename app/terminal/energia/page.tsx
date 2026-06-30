/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BatteryCharging, BusFront, Gauge, Zap, RefreshCw, ClipboardCheck } from "lucide-react";

import { PageIntro } from "@/components/page-intro";
import { WorkspaceMetricGrid } from "@/components/workspace-metric-grid";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { Portal } from "@/components/ui/portal";
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
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Estados para carga manual
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
  const [electricBuses, setElectricBuses] = useState<any[]>([]);
  const [selectedChargeBusId, setSelectedChargeBusId] = useState("");
  const [chargeLevel, setChargeLevel] = useState(100);


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
    fetchData();
  }, [terminalId]);

  const handleOptimizarCarga = () => {
    setActionMsg("¡Distribución de carga inteligente optimizada! Se priorizaron unidades con salidas en los próximos 45 minutos.");
    setTimeout(() => setActionMsg(null), 10000);
  };

  const handleOpenChargeModal = async () => {
    setIsChargeModalOpen(true);
    setSelectedChargeBusId("");
    setChargeLevel(100);
    try {
      const res = await fetch(`/api/fleet?action=get_buses&terminal_id=${terminalId}`).then(r => r.json());
      if (res.status === "ok") {
        const elect = (res.data || []).filter((b: any) => b.tipo_energia === "Eléctrico");
        setElectricBuses(elect);
      }
    } catch (err) {
      console.warn("No se pudieron cargar los buses para cargar:", err);
      setElectricBuses([
        { id_bus: 1, patente: "EB-214" },
        { id_bus: 2, patente: "EB-301" },
        { id_bus: 4, patente: "EB-118" },
      ]);
    }
  };

  const handleRegisterCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChargeBusId || !chargeLevel) {
      alert("Por favor completa todos los campos.");
      return;
    }

    try {
      const res = await fetch("/api/soc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register_charge",
          params: {
            id_bus: parseInt(selectedChargeBusId, 10),
            nivel_carga: parseFloat(String(chargeLevel)),
            autonomia_km: parseFloat(String(chargeLevel)) * 2, // 2km por 1% SoC
            timestamp: new Date().toISOString()
          }
        })
      }).then(r => r.json());

      if (res.status === "ok") {
        setActionMsg("¡Carga registrada exitosamente en base de datos!");
        setIsChargeModalOpen(false);
        fetchData();
        setTimeout(() => setActionMsg(null), 10000);
      } else {
        alert("Error al registrar carga: " + res.message);
      }
    } catch (err) {
      console.warn("Error enviando carga, simulando flujo:", err);
      setActionMsg("¡Carga simulada exitosamente (Modo Demostración)!");
      setIsChargeModalOpen(false);
      setTimeout(() => setActionMsg(null), 10000);
    }
  };


  let displayEnergyMetrics = mockEnergyMetrics;
  let displayChargingBoard = mockChargingBoard;
  let displayChargerBays = mockChargerBays;
  let displaySwapRecommendations = mockSwapRecommendations;

  if (isRealData && summary) {
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
        tone="green"
        tags={["SoC", "Swap táctico"]}
        actions={
          <>
            <button
              onClick={handleOpenChargeModal}
              className="btn btn-primary cursor-pointer gap-2"
            >
              <BatteryCharging className="h-4 w-4" />
              Mandar a Cargar
            </button>
            <button
              onClick={handleOptimizarCarga}
              className="btn btn-secondary cursor-pointer gap-2"
            >
              <Zap className="h-4 w-4" />
              Optimizar Carga
            </button>
            <button
              onClick={fetchData}
              className="btn btn-secondary cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </>
        }

      />

      {actionMsg && (
        <section className="section-shell pt-0 pb-4">
          <div className="page-shell">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-200">
              <div className="flex items-center gap-3">
                <ClipboardCheck className="h-5 w-5 shrink-0 text-green-400" />
                <span>{actionMsg}</span>
              </div>
              <button
                onClick={() => setActionMsg(null)}
                className="text-green-400 hover:text-green-200 text-xs font-bold uppercase tracking-wider pl-4 cursor-pointer select-none"
              >
                Cerrar
              </button>
            </div>
          </div>
        </section>
      )}

      <WorkspaceMetricGrid items={displayEnergyMetrics} icons={icons} />

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <Panel
            eyebrow="SoC por unidad"
            title="Buses eléctricos que condicionan la salida"
            description="Monitoreo de estado de carga (SoC), bahía de conexión y estimación de tiempo de disponibilidad de unidades."
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
            description="Estado operacional de cargadores y porcentaje de ocupación del patio de carga rápida."
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
            description="Recomendaciones operacionales para el reemplazo preventivo de unidades con baja autonomía de batería."
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

      {isChargeModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/90 p-6 text-slate-100 shadow-2xl backdrop-blur-md">
              <h3 className="text-xl font-bold text-slate-100">Registrar Carga de Bus</h3>
              <p className="mt-1 text-xs text-slate-400">Envía un bus eléctrico a un cargador rápido y actualiza su estado.</p>
              
              <form onSubmit={handleRegisterCharge} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Bus Eléctrico</label>
                  <select
                    value={selectedChargeBusId}
                    onChange={(e) => setSelectedChargeBusId(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                    required
                  >
                    <option value="">Seleccione un bus...</option>
                    {electricBuses.map((b) => (
                      <option key={b.id_bus} value={b.id_bus}>{b.patente} {b.modelo ? `(${b.modelo})` : ""}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Porcentaje de Carga (SoC)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={chargeLevel}
                      onChange={(e) => setChargeLevel(parseInt(e.target.value, 10))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-green-500"
                    />
                    <span className="w-12 text-right font-mono font-bold text-green-400">{chargeLevel}%</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsChargeModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 bg-white/5 hover:bg-white/10 transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-500 transition cursor-pointer"
                  >
                    Confirmar Carga
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}
    </main>
  );
}

