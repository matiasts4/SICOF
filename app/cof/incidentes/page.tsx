/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, ClipboardCheck, ShieldAlert, Waypoints, RefreshCw } from "lucide-react";

import { PageIntro } from "@/components/page-intro";
import { WorkspaceMetricGrid } from "@/components/workspace-metric-grid";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  cofIncidentMetrics as mockIncidentMetrics,
  networkIncidentRows as mockIncidentRows,
  responseCells as mockResponseCells,
  severityBuckets as mockSeverityBuckets,
} from "@/lib/sicof-screen-data";
import type { Tone } from "@/lib/sicof-data";

const icons = [ShieldAlert, Waypoints, ClipboardCheck, AlertTriangle];

export default function CofIncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [severitySummary, setSeveritySummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRealData, setIsRealData] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resIncidents, resSummary] = await Promise.all([
        fetch("/api/incidents?action=get_incidents").then(r => r.json()),
        fetch("/api/incidents?action=get_severity_summary").then(r => r.json())
      ]);

      if (resIncidents.status === "ok" && resSummary.status === "ok") {
        setIncidents(resIncidents.data || []);
        setSeveritySummary(resSummary.data);
        setIsRealData(true);
      } else {
        setIsRealData(false);
      }
    } catch (err) {
      console.warn("Backend offline for COF incidents, using mock fallback:", err);
      setIsRealData(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  let displayIncidentMetrics = mockIncidentMetrics;
  let displayIncidentRows = mockIncidentRows;
  let displaySeverityBuckets = mockSeverityBuckets;
  let displayResponseCells = mockResponseCells;

  if (isRealData) {
    const totalCount = incidents.length;
    const criticalCount = incidents.filter(i => i.severidad === "Crítica").length;
    const activeCount = incidents.filter(i => i.estado === "Abierto" || i.estado === "Escalado").length;
    const resolvedCount = incidents.filter(i => i.estado === "Cerrado").length;

    displayIncidentMetrics = [
      { label: "Alertas activas", value: String(activeCount), detail: "Casos no resueltos en red", tone: "red" as Tone },
      { label: "Terminales afectados", value: String(new Set(incidents.map(i => i.terminal_nombre)).size), detail: "De 6 terminales totales", tone: "orange" as Tone },
      { label: "Contención de red", value: "94.2%", detail: "SLA dentro de la ventana", tone: "green" as Tone },
      { label: "Casos resueltos", value: String(resolvedCount), detail: "Turno actual", tone: "blue" as Tone },
    ];

    displayIncidentRows = incidents.map((i) => {
      let tone: Tone = "orange";
      if (i.severidad === "Crítica") tone = "red";
      else if (i.severidad === "Baja") tone = "slate";
      else if (i.severidad === "Media") tone = "orange";
      else if (i.severidad === "Alta") tone = "orange";

      return {
        code: `INC-${i.id_incidente}`,
        terminal: i.terminal_nombre,
        category: i.tipo,
        owner: i.estado === "Escalado" ? "COF" : "Despacho",
        severity: i.severidad,
        state: i.estado,
        tone
      };
    });

    if (severitySummary) {
      displaySeverityBuckets = [
        { label: "Crítica", value: String(severitySummary.critica), detail: "Acción o respuesta inmediata requerida.", tone: "red" as Tone },
        { label: "Alta", value: String(severitySummary.alta), detail: "Riesgo de regularidad en el corredor.", tone: "orange" as Tone },
        { label: "Media / Baja", value: String(severitySummary.media + severitySummary.baja), detail: "Resuelto a nivel de terminal.", tone: "blue" as Tone },
      ];
    }
  }

  return (
    <main>
      <PageIntro
        badge={`COF · Incidentes · ${isRealData ? "Datos Reales (TCP)" : "Modo Demostración (Mock)"}`}
        title="Monitoreo Global de Contingencias e Incidentes"
        description="Consola de visualización de incidentes activos en la red, niveles de severidad y estado de escalamiento de novedades."
        tone="red"
        tags={["Severidad", "Contención multi-terminal"]}
        actions={
          <>
            <button
              onClick={fetchData}
              disabled={loading}
              className="btn btn-primary cursor-pointer gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Sincronizar Incidentes
            </button>
          </>
        }
      />

      <WorkspaceMetricGrid items={displayIncidentMetrics} icons={icons} />

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
          <Panel
            eyebrow="Casos de red"
            title="Incidentes que sí merecen espacio en COF"
            description="Listado de incidentes de alta prioridad que afectan la continuidad operacional del servicio."
          >
            {loading ? (
              <div className="py-12 text-center text-slate-400 font-mono text-sm">
                Cargando incidentes globales...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm text-slate-300">
                  <thead>
                    <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      <th className="pb-2 pr-4 font-medium">Código</th>
                      <th className="pb-2 pr-4 font-medium">Terminal</th>
                      <th className="pb-2 pr-4 font-medium">Categoría</th>
                      <th className="pb-2 pr-4 font-medium">Owner</th>
                      <th className="pb-2 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayIncidentRows.map((row, idx) => (
                      <tr key={`${row.code}-${idx}`} className="bg-white/4">
                        <td className="rounded-l-2xl border-y border-l border-white/8 px-4 py-3 font-medium text-slate-100">{row.code}</td>
                        <td className="border-y border-white/8 px-4 py-3">{row.terminal}</td>
                        <td className="border-y border-white/8 px-4 py-3">{row.category}</td>
                        <td className="border-y border-white/8 px-4 py-3">{row.owner}</td>
                        <td className="rounded-r-2xl border-y border-r border-white/8 px-4 py-3">
                          <StatusBadge label={`${row.severity} · ${row.state}`} tone={row.tone} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <div className="grid gap-4">
            <Panel
              eyebrow="Buckets"
              title="Severidad distribuida"
              description="Clasificación de contingencias activas según su nivel de severidad y potencial impacto."
            >
              {loading ? (
                <div className="py-12 text-center text-slate-400 font-mono text-sm">
                  Cargando resumen de severidad...
                </div>
              ) : (
                <div className="space-y-3">
                  {displaySeverityBuckets.map((item, idx) => (
                    <div key={`${item.label}-${idx}`} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-base font-semibold text-slate-100">{item.label}</h3>
                        <StatusBadge label={item.value} tone={item.tone} />
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-400">{item.detail}</p>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <Panel
              eyebrow="Ownership"
              title="Qué célula responde según el tipo de problema"
              description="Célula de respuesta responsable asignada según la categoría y área del incidente."
            >
              <div className="space-y-3">
                {displayResponseCells.map((item, index) => (
                  <div key={`${item}-${index}`} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-500">Célula {index + 1}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{item}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </section>
    </main>
  );
}
