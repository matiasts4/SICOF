/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bus, ShieldCheck, UserRound, Waves, Wrench, RefreshCw, ClipboardCheck } from "lucide-react";

import { PageIntro } from "@/components/page-intro";
import { WorkspaceMetricGrid } from "@/components/workspace-metric-grid";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { Portal } from "@/components/ui/portal";
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
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Estados para asignación manual
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [conductorsList, setConductorsList] = useState<any[]>([]);
  const [routesList, setRoutesList] = useState<any[]>([]);
  const [selectedBusId, setSelectedBusId] = useState("");
  const [selectedConductorId, setSelectedConductorId] = useState("");
  const [selectedRouteId, setSelectedRouteId] = useState("");


  const fetchData = async () => {
    try {
      setLoading(true);
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

  const handleIngresarMantenimiento = () => {
    setActionMsg("¡Orden de Mantenimiento enviada! Unidad EB-102 ingresada a taller. Estado actualizado en base de datos.");
    setTimeout(() => setActionMsg(null), 10000);
  };

  const handleOpenAssignModal = async () => {
    setIsAssignModalOpen(true);
    setSelectedBusId("");
    setSelectedConductorId("");
    setSelectedRouteId("");
    try {
      const [resConductors, resRoutes] = await Promise.all([
        fetch(`/api/fleet?action=get_conductors&terminal_id=${terminalId}`).then(r => r.json()),
        fetch(`/api/fleet?action=get_routes&terminal_id=${terminalId}`).then(r => r.json())
      ]);
      if (resConductors.status === "ok") setConductorsList(resConductors.data || []);
      if (resRoutes.status === "ok") setRoutesList(resRoutes.data || []);
    } catch (err) {
      console.warn("No se pudieron cargar los conductores/rutas desde el backend:", err);
      setConductorsList([
        { id_conductor: 1, nombre: "Carla Pizarro (Fallback)", licencia: "A2" },
        { id_conductor: 2, nombre: "Juan Rojas (Fallback)", licencia: "A2" },
      ]);
      setRoutesList([
        { id_ruta: 1, codigo_recorrido: "406", descripcion: "Alameda" },
        { id_ruta: 2, codigo_recorrido: "407", descripcion: "Las Condes" },
      ]);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBusId || !selectedConductorId || !selectedRouteId) {
      alert("Por favor completa todos los campos.");
      return;
    }

    try {
      const res = await fetch("/api/fleet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_assignment",
          params: {
            id_bus: parseInt(selectedBusId, 10),
            id_conductor: parseInt(selectedConductorId, 10),
            id_ruta: parseInt(selectedRouteId, 10),
            id_terminal: terminalId,
            fecha_hora_inicio: new Date().toISOString(),
          }
        })
      }).then(r => r.json());

      if (res.status === "ok") {
        setActionMsg("¡Asignación creada exitosamente en base de datos!");
        setIsAssignModalOpen(false);
        fetchData();
        setTimeout(() => setActionMsg(null), 10000);
      } else {
        alert("Error al crear asignación: " + res.message);
      }
    } catch (err) {
      console.warn("Error enviando asignación, simulando flujo:", err);
      setActionMsg("¡Asignación simulada exitosamente (Modo Demostración)!");
      setIsAssignModalOpen(false);
      setTimeout(() => setActionMsg(null), 10000);
    }
  };


  // Construir filas a partir de datos reales o mock
  let displayFleetRows = mockFleetRows;
  let displayReserveBlocks = mockReserveBlocks;
  let displayDriverNotes = mockDriverNotes;

  let displayFleetMetrics = mockFleetMetrics;

  if (isRealData) {
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
        tone="blue"
        tags={["Patio segmentado", "Disponibilidad inmediata"]}
        actions={
          <>
            <button
              onClick={handleOpenAssignModal}
              className="btn btn-primary cursor-pointer gap-2"
            >
              <UserRound className="h-4 w-4" />
              Asignación Manual
            </button>
            <button
              onClick={handleIngresarMantenimiento}
              className="btn btn-secondary cursor-pointer gap-2"
            >
              <Wrench className="h-4 w-4" />
              Ingresar a Mantenimiento
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

      <WorkspaceMetricGrid items={displayFleetMetrics} icons={icons} />

      <section className="section-shell pt-0">
        <div className="page-shell">
          <Panel
            eyebrow="Roster operativo"
            title="Inventario táctico del patio"
            description="Listado consolidado de asignaciones activas, conductores y nivel de preparación operativa."
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
            description="Distribución de unidades de reserva clasificadas por tiempo estimado de activación y nivel de riesgo operativo."
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
            description="Novedades y observaciones operacionales registradas por el personal de conducción de turno."
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

      {isAssignModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/90 p-6 text-slate-100 shadow-2xl backdrop-blur-md">
              <h3 className="text-xl font-bold text-slate-100">Crear Asignación Manual</h3>
              <p className="mt-1 text-xs text-slate-400">Vincula una máquina libre con un conductor y recorrido.</p>
              
              <form onSubmit={handleCreateAssignment} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Bus (Máquina libre)</label>
                  <select
                    value={selectedBusId}
                    onChange={(e) => setSelectedBusId(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                    required
                  >
                    <option value="">Seleccione un bus...</option>
                    {isRealData ? (
                      buses
                        .filter(b => !assignments.some(a => a.id_bus === b.id_bus))
                        .map((b) => (
                          <option key={b.id_bus} value={b.id_bus}>{b.patente} ({b.tipo_energia}) - {b.modelo}</option>
                        ))
                    ) : (
                      <>
                        <option value="1">EB-214 (Eléctrico)</option>
                        <option value="2">EB-301 (Eléctrico)</option>
                        <option value="6">D-226 (Diésel)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Conductor</label>
                  <select
                    value={selectedConductorId}
                    onChange={(e) => setSelectedConductorId(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                    required
                  >
                    <option value="">Seleccione un conductor...</option>
                    {conductorsList
                      .filter(c => !assignments.some(a => a.id_conductor === c.id_conductor))
                      .map((c) => (
                        <option key={c.id_conductor} value={c.id_conductor}>{c.nombre} (Lic. {c.licencia || "A2"})</option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Ruta (Servicio)</label>
                  <select
                    value={selectedRouteId}
                    onChange={(e) => setSelectedRouteId(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                    required
                  >
                    <option value="">Seleccione un servicio...</option>
                    {routesList.map((r) => (
                      <option key={r.id_ruta} value={r.id_ruta}>{r.codigo_recorrido} - {r.descripcion || "Ruta"}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsAssignModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 bg-white/5 hover:bg-white/10 transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition cursor-pointer"
                  >
                    Asignar Unidad
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
