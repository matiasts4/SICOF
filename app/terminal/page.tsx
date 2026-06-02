"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, AlertTriangle, BatteryCharging, Bus, Clock3, RefreshCw, Shuffle, ClipboardCheck } from "lucide-react";

import { PageIntro } from "@/components/page-intro";
import { WorkspaceModuleGrid } from "@/components/workspace-module-grid";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatCard } from "@/components/ui/stat-card";
import { MapPreview } from "@/components/ui/map-preview";
import { terminalWorkspace } from "@/lib/sicof-navigation";
import { 
  departureTimeline as mockTimeline, 
  incidentLog as mockIncidents, 
  liveFleet as mockFleet, 
  terminalAlerts as mockAlerts, 
  terminalMetrics as mockMetrics, 
  terminalSegments as mockSegments 
} from "@/lib/sicof-data";
import type { Tone } from "@/lib/sicof-data";

const icons = [Bus, Clock3, BatteryCharging, AlertTriangle];

export default function TerminalPage() {
  const [terminalId, setTerminalId] = useState(1);
  const [buses, setBuses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [socAlerts, setSocAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRealData, setIsRealData] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchData = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const [resBuses, resAssignments, resSegments, resIncidents, resSocAlerts] = await Promise.all([
        fetch(`/api/fleet?action=get_buses&terminal_id=${terminalId}`).then(r => r.json()),
        fetch(`/api/fleet?action=get_assignments&terminal_id=${terminalId}`).then(r => r.json()),
        fetch(`/api/fleet?action=get_segments&terminal_id=${terminalId}`).then(r => r.json()),
        fetch(`/api/incidents?action=get_incidents&terminal_id=${terminalId}`).then(r => r.json()),
        fetch(`/api/soc?action=get_alerts&terminal_id=${terminalId}`).then(r => r.json())
      ]);

      if (
        resBuses.status === "ok" &&
        resAssignments.status === "ok" &&
        resSegments.status === "ok"
      ) {
        setBuses(resBuses.data || []);
        setAssignments(resAssignments.data || []);
        setSegments(resSegments.data || []);
        setIncidents(resIncidents.status === "ok" ? resIncidents.data : []);
        setSocAlerts(resSocAlerts.status === "ok" ? resSocAlerts.data : []);
        setIsRealData(true);
      } else {
        setIsRealData(false);
      }
    } catch (err) {
      console.warn("SOA backend services offline, falling back to mock data.", err);
      setIsRealData(false);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
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
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 6000);
    return () => clearInterval(interval);
  }, [terminalId]);

  const handleToggleTerminal = () => {
    const nextId = terminalId === 1 ? 2 : 1;
    setTerminalId(nextId);
    const userStr = localStorage.getItem("sicof_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        user.terminal_id = nextId;
        localStorage.setItem("sicof_user", JSON.stringify(user));
      } catch (e) {}
    }
    setActionMsg(`Monitoreo cambiado a Terminal ${nextId === 1 ? "El Roble (ID: 1)" : "Los Libertadores (ID: 2)"}`);
    setTimeout(() => setActionMsg(null), 10000);
  };

  // Map real data to display lists with fallback to mock data
  let displayMetrics = mockMetrics;
  let displaySegments = mockSegments;
  let displayLiveFleet = mockFleet;
  let displayIncidents = mockIncidents;

  if (isRealData) {
    // 1. Metrics Calculation
    const totalBuses = buses.length;
    const assignedCount = assignments.length;
    const readyBuses = Math.max(0, totalBuses - assignedCount);
    const activeIncidents = incidents.filter(i => i.estado !== "Cerrado").length;
    const urgentSoC = socAlerts.length;

    displayMetrics = [
      { label: "Buses listos", value: String(readyBuses), detail: `${buses.filter(b => b.tipo_energia === "Eléctrico").length} Eléctricos`, tone: "green" as Tone },
      { label: "Salidas activas", value: String(assignedCount), detail: "Próximas salidas en turno", tone: "blue" as Tone },
      { label: "Alertas SoC", value: String(urgentSoC), detail: "Bajo autonomía mínima", tone: "orange" as Tone },
      { label: "Incidentes abiertos", value: String(activeIncidents), detail: "Requieren revisión", tone: "red" as Tone },
    ];

    // 2. Segments Mapping
    displaySegments = segments;

    // 3. Live Fleet Table Mapping
    if (assignments.length > 0) {
      displayLiveFleet = assignments.map((asg) => {
        // Find corresponding SoC alert or generate normal value
        const matchingAlert = socAlerts.find(alert => alert.id_bus === asg.id_bus);
        const socVal = asg.tipo_energia === "Eléctrico" 
          ? (matchingAlert ? `${Math.round(matchingAlert.nivel_carga)}%` : "85%") 
          : "—";
        const statusLabel = asg.tipo_energia === "Eléctrico" && matchingAlert 
          ? "Umbral bajo" 
          : "Listo";
        const toneVal = statusLabel === "Umbral bajo" ? "orange" : "green";

        return {
          padron: asg.patente || `BUS-${asg.id_bus}`,
          route: asg.codigo_recorrido,
          driver: asg.conductor_nombre,
          soc: socVal,
          eta: asg.fecha_hora_inicio.substring(11, 16),
          status: statusLabel,
          tone: toneVal as Tone
        };
      });
    }

    // 4. Incidents List Mapping
    if (incidents.length > 0) {
      displayIncidents = incidents.slice(0, 3).map((inc) => ({
        type: inc.tipo,
        bus: inc.patente || `BUS-${inc.id_bus}`,
        detail: inc.descripcion,
        status: inc.estado,
        tone: inc.estado === "Abierto" ? "red" : inc.estado === "Escalado" ? "orange" : "blue" as Tone
      }));
    }
  }

  return (
    <main>
      <PageIntro
        badge="Vista Despachador de Terminal"
        title="Despacho enfocado, sin ruido y con lectura inmediata del estado del patio"
        tone="green"
        tags={[`Terminal ID: ${terminalId}`, isRealData ? "Datos Reales (TCP)" : "Modo Demostración"]}
        actions={
          <>
            <button
              onClick={handleToggleTerminal}
              className="btn btn-primary cursor-pointer gap-2"
            >
              <Shuffle className="h-4 w-4" />
              Cambiar Terminal
            </button>
            <button
              onClick={() => fetchData(true)}
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

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {displayMetrics.map((metric, index) => {
            const Icon = icons[index] ?? Activity;

            return (
              <StatCard
                key={metric.label}
                icon={Icon}
                label={metric.label}
                value={metric.value}
                detail={metric.detail}
                tone={metric.tone}
              />
            );
          })}
        </div>
      </section>

      <section className="section-shell pt-0">
        <div className="page-shell">
          <Panel 
            eyebrow="Monitoreo Georeferenciado" 
            title="Ubicación de flota en tiempo real" 
            description="Posición geográfica de unidades en ruta y estado de carga de batería."
          >
            <MapPreview className="h-[400px]" />
          </Panel>
        </div>
      </section>

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
          <Panel
            eyebrow="Flota segmentada"
            title="Segmentos del patio"
            description="Disponibilidad de material rodante y conductores asignados a este patio de operaciones."
          >
            <div className="space-y-3">
              {displaySegments.map((segment) => (
                <div key={segment.name} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                     <div>
                      <h3 className="text-base font-semibold text-slate-100">{segment.name}</h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {segment.buses} buses · {segment.drivers} conductores
                      </p>
                    </div>
                    <StatusBadge label={segment.status} tone={segment.tone as Tone} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            eyebrow="Energía y Frecuencia"
            title="Fleet board para salida inminente"
            description="Estado de preparación, SoC de batería y tiempo estimado de salida para unidades programadas."
          >
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm text-slate-300">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    <th className="pb-2 pr-4 font-medium">Bus</th>
                    <th className="pb-2 pr-4 font-medium">Conductor</th>
                    <th className="pb-2 pr-4 font-medium">SoC</th>
                    <th className="pb-2 pr-4 font-medium">ETA</th>
                    <th className="pb-2 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {displayLiveFleet.map((bus, idx) => (
                    <tr key={`${bus.padron}-${idx}`} className="bg-white/4">
                      <td className="rounded-l-2xl border-y border-l border-white/8 px-4 py-3 font-medium text-slate-100">
                        {bus.padron} · {bus.route}
                      </td>
                      <td className="border-y border-white/8 px-4 py-3">{bus.driver}</td>
                      <td className="border-y border-white/8 px-4 py-3">{bus.soc}</td>
                      <td className="border-y border-white/8 px-4 py-3">{bus.eta}</td>
                      <td className="rounded-r-2xl border-y border-r border-white/8 px-4 py-3">
                        <StatusBadge label={bus.status} tone={bus.tone} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      </section>

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <Panel
            eyebrow="Marcaje automático"
            title="Timeline de salida por geocerca"
            description="Eventos automáticos de salida y paso por geocercas registrados durante el turno."
          >
            <div className="space-y-4">
              {mockTimeline.map((item) => (
                <div key={`${item.time}-${item.title}`} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/12 font-mono text-sm font-semibold text-blue-200">
                      {item.time}
                    </div>
                    <div className="mt-2 h-full w-px bg-gradient-to-b from-blue-400/40 to-transparent" />
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                    <p className="font-medium text-slate-100">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <div className="grid gap-4">
            <Panel
              eyebrow="Alertas preventivas"
              title="Prioridades del turno"
              description="Alertas críticas prioritarias del turno que requieren acción inmediata."
            >
              <div className="space-y-3">
                {mockAlerts.map((alert) => (
                  <div key={alert.label} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-base font-semibold text-slate-100">{alert.label}</h3>
                      <StatusBadge label="En foco" tone={alert.tone} />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{alert.detail}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel
              eyebrow="Incidentes operativos"
              title="Bitácora mínima para escalar sin fricción"
              description="Registro y seguimiento inmediato de novedades en el terminal."
            >
              <div className="space-y-3">
                {displayIncidents.map((incident, idx) => (
                  <div key={`${incident.type}-${incident.bus}-${idx}`} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-100">{incident.type} · {incident.bus}</p>
                        <p className="mt-1 text-sm text-slate-400">{incident.detail}</p>
                      </div>
                      <StatusBadge label={incident.status} tone={incident.tone} />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </section>

      <WorkspaceModuleGrid
        eyebrow="Rutas del despacho"
        title="El workspace terminal se expande en cinco vistas operacionales"
        description="Acceso a los módulos específicos para la gestión del terminal."
        items={terminalWorkspace.links.slice(1)}
      />
    </main>
  );
}
