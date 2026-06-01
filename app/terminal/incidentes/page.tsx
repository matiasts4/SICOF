/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ClipboardCheck, Route, Siren, Plus, RefreshCw, X } from "lucide-react";

import { PageIntro } from "@/components/page-intro";
import { WorkspaceMetricGrid } from "@/components/workspace-metric-grid";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  escalationFlow as mockEscalationFlow,
  evidenceChecklist as mockEvidenceChecklist,
  localIncidentCards as mockIncidentCards,
  terminalIncidentMetrics as mockIncidentMetrics,
} from "@/lib/sicof-screen-data";
import type { Tone } from "@/lib/sicof-data";

const icons = [Siren, ClipboardCheck, AlertTriangle, Route];

export default function TerminalIncidentsPage() {
  const [terminalId, setTerminalId] = useState(1);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRealData, setIsRealData] = useState(false);

  // Estado del formulario
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBusId, setSelectedBusId] = useState("");
  const [incidentType, setIncidentType] = useState("Vial");
  const [severity, setSeverity] = useState("Media");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resIncidents, resBuses] = await Promise.all([
        fetch(`/api/incidents?action=get_incidents&terminal_id=${terminalId}`).then(r => r.json()),
        fetch(`/api/fleet?action=get_buses&terminal_id=${terminalId}`).then(r => r.json())
      ]);

      if (resIncidents.status === "ok" && resBuses.status === "ok") {
        setIncidents(resIncidents.data || []);
        setBuses(resBuses.data || []);
        setIsRealData(true);
      } else {
        setIsRealData(false);
      }
    } catch (err) {
      console.warn("Backend offline for incidents page, using mock fallback:", err);
      setIsRealData(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [terminalId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBusId || !description) return;

    setSubmitting(true);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_incident",
          params: {
            id_bus: parseInt(selectedBusId, 10),
            tipo: incidentType,
            severidad: severity,
            descripcion: description,
            fecha_hora: new Date().toISOString()
          }
        }),
      });

      const data = await res.json();
      if (data.status === "ok") {
        setSuccessMsg("¡Incidente registrado exitosamente en el BUS!");
        setSelectedBusId("");
        setDescription("");
        setIsFormOpen(false);
        fetchData(); // Refrescar lista
        setTimeout(() => setSuccessMsg(null), 10000);
      } else {
        alert("Error al registrar: " + data.message);
      }
    } catch (err) {
      alert("Error de comunicación: " + err);
    } finally {
      setSubmitting(false);
    }
  };

  let displayIncidentMetrics = mockIncidentMetrics;
  let displayIncidentCards = mockIncidentCards;
  const displayEscalationFlow = mockEscalationFlow;
  const displayEvidenceChecklist = mockEvidenceChecklist;

  if (isRealData) {
    const totalCount = incidents.length;
    const openCount = incidents.filter(i => i.estado === "Abierto").length;
    const escalatedCount = incidents.filter(i => i.estado === "Escalado").length;
    const closedCount = incidents.filter(i => i.estado === "Cerrado").length;

    displayIncidentMetrics = [
      { label: "Casos activos", value: String(openCount), detail: `${escalatedCount} escalados al COF`, tone: "red" as Tone },
      { label: "Evidencia OK", value: `${totalCount - escalatedCount}/${totalCount}`, detail: "Casos con registros válidos", tone: "green" as Tone },
      { label: "Tiempo de paso", value: "Normal", detail: "Sin desvíos mayores en ruta", tone: "blue" as Tone },
      { label: "Cerrados hoy", value: String(closedCount), detail: "Turno actual", tone: "slate" as Tone },
    ];

    displayIncidentCards = incidents.map((i) => {
      let tone: Tone = "orange";
      if (i.severidad === "Crítica") tone = "red";
      else if (i.severidad === "Baja") tone = "slate";
      else if (i.severidad === "Media") tone = "orange";
      else if (i.severidad === "Alta") tone = "orange";

      return {
        code: `INC-${i.id_incidente}`,
        title: `${i.tipo} · ${i.patente}`,
        severity: i.severidad,
        state: i.estado,
        bus: `Bus: ${i.patente} (${i.tipo_energia})`,
        area: i.conductor_nombre ? `Conductor: ${i.conductor_nombre}` : "Sin conductor asignado",
        description: i.descripcion,
        tone
      };
    });
  }

  return (
    <main>
      <PageIntro
        badge={`Terminal · Incidentes · ${isRealData ? "Datos Reales (TCP)" : "Modo Demostración (Mock)"}`}
        title="Registro de Novedades e Incidentes"
        description="Gestión y escalamiento de novedades operativas, contingencias en ruta y material rodante afectado." 
        tone="red"
        tags={["Evidencia mínima", "Escalamiento"]}
        actions={
          <>
            <button
              onClick={() => setIsFormOpen(true)}
              className="btn btn-primary cursor-pointer gap-2"
            >
              <Plus className="h-4 w-4" />
              Registrar Incidente
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

      <WorkspaceMetricGrid items={displayIncidentMetrics} icons={icons} />

      {successMsg && (
        <section className="section-shell pt-0 pb-4">
          <div className="page-shell">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-200">
              <div className="flex items-center gap-3">
                <ClipboardCheck className="h-5 w-5 shrink-0 text-green-400" />
                <span>{successMsg}</span>
              </div>
              <button
                onClick={() => setSuccessMsg(null)}
                className="text-green-400 hover:text-green-200 text-xs font-bold uppercase tracking-wider pl-4 cursor-pointer select-none"
              >
                Cerrar
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Formulario Modal de Registro de Incidentes */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/8 pb-4">
              <h3 className="text-xl font-bold text-white font-display">Registrar Incidente (BUS TCP)</h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-white/8 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Bus Involucrado</label>
                <select
                  required
                  value={selectedBusId}
                  onChange={(e) => setSelectedBusId(e.target.value)}
                  className="mt-2 block w-full rounded-2xl border border-white/10 bg-white/5 py-3 px-3 text-white focus:border-blue-400 focus:outline-none sm:text-sm"
                >
                  <option value="" disabled className="bg-slate-900 text-slate-400">Seleccionar unidad...</option>
                  {buses.map((bus) => (
                    <option key={bus.id_bus} value={bus.id_bus} className="bg-slate-900 text-white">
                      {bus.patente} ({bus.tipo_energia} - {bus.modelo})
                    </option>
                  ))}
                  {buses.length === 0 && (
                    <option value="1" className="bg-slate-900 text-white">EB-214 (Fallback)</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Tipo de Incidente</label>
                  <select
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value)}
                    className="mt-2 block w-full rounded-2xl border border-white/10 bg-white/5 py-3 px-3 text-white focus:border-blue-400 focus:outline-none sm:text-sm"
                  >
                    <option value="Vial" className="bg-slate-900">Vial / Choque</option>
                    <option value="Energía" className="bg-slate-900">Energía / SoC</option>
                    <option value="Mantenimiento" className="bg-slate-900">Mantenimiento</option>
                    <option value="Médico" className="bg-slate-900">Médico / Conductor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Severidad</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="mt-2 block w-full rounded-2xl border border-white/10 bg-white/5 py-3 px-3 text-white focus:border-blue-400 focus:outline-none sm:text-sm"
                  >
                    <option value="Baja" className="bg-slate-900">Baja</option>
                    <option value="Media" className="bg-slate-900">Media</option>
                    <option value="Alta" className="bg-slate-900">Alta</option>
                    <option value="Crítica" className="bg-slate-900">Crítica</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Descripción</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalles sobre lo ocurrido, retrasos proyectados..."
                  className="mt-2 block w-full rounded-2xl border border-white/10 bg-white/5 py-3 px-3 text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none sm:text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="btn btn-secondary btn-sm cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary btn-sm cursor-pointer"
                >
                  {submitting ? "Registrando..." : "Registrar en el BUS"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <Panel
            eyebrow="Casos abiertos"
            title="Incidentes locales con el mínimo contexto necesario"
            description="Listado de incidentes activos detectados en patio o reportados en ruta."
          >
            {loading ? (
              <div className="py-12 text-center text-slate-400 font-mono text-sm">
                Cargando incidentes del patio...
              </div>
            ) : (
              <div className="space-y-3">
                {displayIncidentCards.map((item, idx) => (
                  <div key={`${item.code}-${idx}`} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-500">{item.code}</p>
                        <h3 className="mt-2 text-base font-semibold text-slate-100">{item.title}</h3>
                      </div>
                      <StatusBadge label={`${item.severity} · ${item.state}`} tone={item.tone} />
                    </div>
                    <p className="mt-3 text-sm text-slate-300">{item.bus} · {item.area}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
                  </div>
                ))}
                {displayIncidentCards.length === 0 && (
                  <div className="text-center text-slate-400 py-6 text-sm">
                    Sin incidentes abiertos en este patio.
                  </div>
                )}
              </div>
            )}
          </Panel>

          <Panel
            eyebrow="Checklist de evidencia"
            title="Qué no puede faltar antes de escalar"
            description="Requisitos mínimos de información y registros requeridos para el escalamiento de novedades."
          >
            <div className="space-y-3">
              {displayEvidenceChecklist.map((item, index) => (
                <div key={`${item}-${index}`} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-500">Evidencia {index + 1}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      <section className="section-shell pt-0">
        <div className="page-shell">
          <Panel
            eyebrow="Ruta de escalamiento"
            title="Cuándo se queda en terminal y cuándo sube de nivel"
            description="Protocolo de asignación de responsabilidades y flujo de comunicación según criticidad."
          >
            <div className="grid gap-3 lg:grid-cols-3">
              {displayEscalationFlow.map((item, idx) => (
                <div key={`${item.step}-${idx}`} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-slate-100">{item.step}</h3>
                    <StatusBadge label={item.step} tone={item.tone} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{item.detail}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>
    </main>
  );
}
