/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bus, ShieldCheck, UserRound, Waves } from "lucide-react";

import { PageIntro } from "@/components/page-intro";
import { WorkspaceMetricGrid } from "@/components/workspace-metric-grid";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  terminalDriverNotes as mockDriverNotes,
  terminalFleetMetrics as mockFleetMetrics,
  terminalFleetRows as mockFleetRows,
  terminalReserveBlocks as mockReserveBlocks,
} from "@/lib/sicof-screen-data";
import type { Tone } from "@/lib/sicof-data";

const icons = [Bus, UserRound, ShieldCheck, Waves];

export default function TerminalFleetPage() {
  const [terminalId, setTerminalId] = useState(1);
  const [buses, setBuses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
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
        // Intentar obtener de las API routes
        const [resBuses, resAssignments, resSegments, resChargers] = await Promise.all([
          fetch(`/api/fleet?action=get_buses&terminal_id=${terminalId}`).then(r => r.json()),
          fetch(`/api/fleet?action=get_assignments&terminal_id=${terminalId}`).then(r => r.json()),
          fetch(`/api/fleet?action=get_segments&terminal_id=${terminalId}`).then(r => r.json()),
          fetch(`/api/soc?action=get_charger_status&terminal_id=${terminalId}`).then(r => r.json())
        ]);

        if (
          resBuses.status === "ok" &&
          resAssignments.status === "ok" &&
          resSegments.status === "ok"
        ) {
          setBuses(resBuses.data || []);
          setAssignments(resAssignments.data || []);
          setSegments(resSegments.data || []);
          setChargers(resChargers.status === "ok" ? resChargers.data : []);
          setIsRealData(true);
        } else {
          setIsRealData(false);
        }
      } catch (err) {
        console.warn("Backend unavailable, using offline mock data:", err);
        setIsRealData(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [terminalId]);

  // Construir filas a partir de datos reales o mock
  let displayFleetRows = mockFleetRows;
  let displayReserveBlocks = mockReserveBlocks;
  let displayDriverNotes = mockDriverNotes;

  let displayFleetMetrics = mockFleetMetrics;

  if (isRealData && !loading) {
    // Generar métricas a partir del backend
    const electricCount = buses.filter(b => b.tipo_energia === "Eléctrico").length;
    const dieselCount = buses.filter(b => b.tipo_energia === "Diésel").length;
    const totalBuses = buses.length;
    const assignedCount = assignments.length;
    const reserveCount = Math.max(0, totalBuses - assignedCount);

    displayFleetMetrics = [
      { label: "Unidades visibles", value: String(totalBuses), detail: `Patio (${electricCount} Elec / ${dieselCount} Diésel)`, tone: "blue" as Tone },
      { label: "Conductores listos", value: String(assignedCount + reserveCount), detail: `${assignedCount} activos en ruta`, tone: "green" as Tone },
      { label: "Reserva táctica", value: String(reserveCount), detail: "Unidades listas para reemplazo", tone: "orange" as Tone },
      { label: "Asignaciones activas", value: String(assignedCount), detail: "Servicios con conductor y bus", tone: "red" as Tone },
    ];

    // Mapear filas
    displayFleetRows = buses.map((bus) => {
      // Buscar si el bus tiene asignación activa
      const activeAssign = assignments.find(a => a.id_bus === bus.id_bus);
      // Buscar nivel de carga si es eléctrico
      const chargerInfo = chargers.find(c => c.bus === bus.patente);
      const energyLevel = bus.tipo_energia === "Diésel" ? "Diésel" : (chargerInfo ? chargerInfo.soc : "75%");

      let readiness = "En espera";
      let tone: Tone = "slate";

      if (activeAssign) {
        readiness = "Asignado";
        tone = "blue";
      } else if (bus.tipo_energia === "Eléctrico") {
        const socPercent = parseInt(energyLevel.replace("%", ""), 10);
        if (socPercent < 30) {
          readiness = "Crítico";
          tone = "red";
        } else if (socPercent < 50) {
          readiness = "Swap sugerido";
          tone = "orange";
        } else {
          readiness = "Listo";
          tone = "green";
        }
      } else {
        readiness = "Listo";
        tone = "green";
      }

      return {
        padron: bus.patente,
        service: activeAssign ? activeAssign.codigo_recorrido : "—",
        driver: activeAssign ? activeAssign.conductor_nombre : "—",
        block: activeAssign ? "Andén troncal" : (bus.tipo_energia === "Eléctrico" ? "Andén eléctrico" : "Reserva"),
        energy: energyLevel,
        readiness,
        tone,
      };
    });

    // Mapear bloques de reserva
    displayReserveBlocks = segments
      .filter(s => s.name === "Reserva táctica")
      .map(s => ({
        name: s.name,
        detail: `${s.buses} buses y ${s.drivers} conductores listos para cobertura inmediata.`,
        tone: s.tone as Tone
      }));
    if (displayReserveBlocks.length === 0) {
      displayReserveBlocks = mockReserveBlocks;
    }

    // Notas de conductores
    displayDriverNotes = assignments.slice(0, 3).map((a) => 
      `${a.conductor_nombre} asignado a ruta ${a.codigo_recorrido} con bus ${a.patente} (${a.tipo_energia}).`
    );
    if (displayDriverNotes.length === 0) {
      displayDriverNotes = mockDriverNotes;
    }
  }

  return (
    <main>
      <PageIntro
        badge={`Terminal · Flota · ${isRealData ? "Datos Reales (TCP)" : "Modo Demostración (Mock)"}`}
        title="La flota del patio se lee por disponibilidad real, no por una lista plana sin contexto"
        description="Esta vista separa bloque, conductor, energía y nivel de preparación para que el despachador vea rápido qué unidad puede salir, cuál conviene guardar y cuál necesita decisión." 
        tone="blue"
        tags={["Patio segmentado", "Disponibilidad inmediata"]}
        actions={
          <>
            <Link
              href="/terminal/despacho"
              className="btn btn-secondary"
            >
              Ir a despacho
            </Link>
            <Link
              href="/terminal/energia"
              className="btn btn-primary"
            >
              Ver energía
            </Link>
          </>
        }
      />

      <WorkspaceMetricGrid items={displayFleetMetrics} icons={icons} />

      <section className="section-shell pt-0">
        <div className="page-shell">
          <Panel
            eyebrow="Roster operativo"
            title="Inventario táctico del patio"
            description="Cada fila mezcla padrón, servicio, conductor, bloque y estado de preparación. Eso baja la fricción para decidir cobertura sin saltar entre módulos."
          >
            {loading ? (
              <div className="py-12 text-center text-slate-400 font-mono text-sm">
                Cargando datos del patio...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm text-slate-300">
                  <thead>
                    <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      <th className="pb-2 pr-4 font-medium">Padrón</th>
                      <th className="pb-2 pr-4 font-medium">Servicio</th>
                      <th className="pb-2 pr-4 font-medium">Conductor</th>
                      <th className="pb-2 pr-4 font-medium">Bloque</th>
                      <th className="pb-2 pr-4 font-medium">Energía</th>
                      <th className="pb-2 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayFleetRows.map((row, idx) => (
                      <tr key={`${row.padron}-${idx}`} className="bg-white/4">
                        <td className="rounded-l-2xl border-y border-l border-white/8 px-4 py-3 font-medium text-slate-100">{row.padron}</td>
                        <td className="border-y border-white/8 px-4 py-3">{row.service}</td>
                        <td className="border-y border-white/8 px-4 py-3">{row.driver}</td>
                        <td className="border-y border-white/8 px-4 py-3">{row.block}</td>
                        <td className="border-y border-white/8 px-4 py-3">{row.energy}</td>
                        <td className="rounded-r-2xl border-y border-r border-white/8 px-4 py-3">
                          <StatusBadge label={row.readiness} tone={row.tone} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>
      </section>

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
          <Panel
            eyebrow="Reserva táctica"
            title="Buffers que realmente sostienen el patio"
            description="La reserva no es un número abstracto. Se divide por velocidad de activación y por riesgo operativo asociado."
          >
            <div className="space-y-3">
              {displayReserveBlocks.map((item, idx) => (
                <div key={`${item.name}-${idx}`} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-slate-100">{item.name}</h3>
                    <StatusBadge label={item.name} tone={item.tone} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{item.detail}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            eyebrow="Conductores en foco"
            title="Notas cortas para evitar decisiones ciegas"
            description="El valor está en unir la situación del bus con el contexto del conductor. Ese cruce después ordena mejor despacho y frecuencia."
          >
            <div className="space-y-3">
              {displayDriverNotes.map((note, index) => (
                <div key={`${note}-${index}`} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-500">Nota {index + 1}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{note}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>
    </main>
  );
}
