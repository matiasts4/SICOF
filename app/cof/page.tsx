/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Activity, AlertTriangle, BarChart3, FileDown } from "lucide-react";

import { PageIntro } from "@/components/page-intro";
import { WorkspaceModuleGrid } from "@/components/workspace-module-grid";
import { Panel } from "@/components/ui/panel";
import { MetricBar } from "@/components/ui/metric-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatCard } from "@/components/ui/stat-card";
import { MapPreview } from "@/components/ui/map-preview";
import { cofWorkspace } from "@/lib/sicof-navigation";
import {
  cofMetrics as mockCofMetrics,
  escalations as mockEscalations,
  reportQueue as mockReportQueue,
  terminalHealth as mockTerminalHealth,
} from "@/lib/sicof-data";
import type { Tone } from "@/lib/sicof-data";

const icons = [BarChart3, AlertTriangle, Activity, FileDown];

export default function CofPage() {
  const [kpis, setKpis] = useState<any[]>([]);
  const [terminalHealthData, setTerminalHealthData] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRealData, setIsRealData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resKpis, resHealth, resIncidents] = await Promise.all([
          fetch("/api/reports?action=get_kpis").then(r => r.json()),
          fetch("/api/reports?action=get_terminal_health").then(r => r.json()),
          fetch("/api/incidents?action=get_incidents").then(r => r.json())
        ]);

        if (resKpis.status === "ok" && resHealth.status === "ok" && resIncidents.status === "ok") {
          setKpis(resKpis.data || []);
          setTerminalHealthData(resHealth.data || []);
          setIncidents(resIncidents.data || []);
          setIsRealData(true);
        } else {
          setIsRealData(false);
        }
      } catch (err) {
        console.warn("Backend offline for COF page, using mock fallback:", err);
        setIsRealData(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  let displayCofMetrics = mockCofMetrics;
  let displayTerminalHealth = mockTerminalHealth;
  let displayEscalations = mockEscalations;
  let displayReportQueue = mockReportQueue;

  if (isRealData && !loading) {
    // KPIs
    displayCofMetrics = kpis.map((k) => ({
      label: k.label,
      value: k.value,
      detail: k.detail,
      tone: k.tone as Tone
    }));

    // Terminal health
    displayTerminalHealth = terminalHealthData.map((t) => ({
      terminal: t.terminal,
      incidents: t.open_incidents,
      compliance: Math.round(t.compliance),
      availability: Math.round(t.availability),
      tone: t.tone as Tone
    }));

    // Escalations (using actual incidents with high/critical severity)
    displayEscalations = incidents
      .filter(i => i.severidad === "Alta" || i.severidad === "Crítica")
      .map((i) => ({
        title: `${i.tipo} · Bus ${i.patente}`,
        owner: i.estado === "Escalado" ? "COF" : "Despacho",
        detail: `Gravedad ${i.severidad}. ${i.descripcion}`,
        tone: (i.severidad === "Crítica" ? "red" : "orange") as Tone
      }));
    if (displayEscalations.length === 0) {
      displayEscalations = mockEscalations;
    }
  }

  return (
    <main>
      <PageIntro
        badge={`COF Hub · ${isRealData ? "Datos Reales (TCP)" : "Modo Demostración (Mock)"}`}
        title="Cockpit global para decidir rápido entre terminales, brechas y contingencias"
        description="Acá el diseño deja de ser micro-operativo y pasa a modo dirección. Menos detalle por bus, más salud sistémica, más comparación, más capacidad de exportar y escalar."
        tone="blue"
        tags={["US4 + US6", "Gestión multi-terminal", "Salud sistémica"]}
        actions={
          <>
            <Link
              href="/cof/frecuencia"
              className="btn btn-secondary"
            >
              Abrir frecuencia
            </Link>
            <Link
              href="/cof/reportes"
              className="btn btn-primary"
            >
              Abrir reportes
            </Link>
          </>
        }
      />

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {displayCofMetrics.map((metric, index) => {
            const Icon = icons[index] ?? Activity;
            return (
              <StatCard
                key={`${metric.label}-${index}`}
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
            eyebrow="Supervisión Global" 
            title="Vista de red en tiempo real" 
            description="Control de flota unificado entre terminales US4 y US6. Detecta cuellos de botella geográficos de forma inmediata."
          >
            <MapPreview className="h-[400px]" />
          </Panel>
        </div>
      </section>

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <Panel
            eyebrow="Salud Operacional"
            title="Salud operacional por terminal"
            description="Comparación rápida de cumplimiento, disponibilidad e incidentes. Si esta vista no se entiende en segundos, no sirve para COF."
          >
            {loading ? (
              <div className="py-12 text-center text-slate-400 font-mono text-sm">
                Cargando estado de la red...
              </div>
            ) : (
              <div className="space-y-4">
                {displayTerminalHealth.map((terminal, idx) => (
                  <div key={`${terminal.terminal}-${idx}`} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-slate-100">{terminal.terminal}</h3>
                        <p className="mt-1 text-sm text-slate-400">{terminal.incidents} incidentes abiertos</p>
                      </div>
                      <StatusBadge label={`${terminal.compliance}% cumplimiento`} tone={terminal.tone} />
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-500">
                          <span>Cumplimiento</span>
                          <span>{terminal.compliance}%</span>
                        </div>
                        <MetricBar value={terminal.compliance} tone={terminal.tone} />
                      </div>
                      <div>
                        <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-500">
                          <span>Disponibilidad</span>
                          <span>{terminal.availability}%</span>
                        </div>
                        <MetricBar value={terminal.availability} tone={terminal.tone} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel
            eyebrow="Escalamiento"
            title="Contingencias que requieren decisión"
            description="COF no gestiona todo: prioriza lo que amenaza regularidad o servicio."
          >
            {loading ? (
              <div className="py-12 text-center text-slate-400 font-mono text-sm">
                Cargando contingencias...
              </div>
            ) : (
              <div className="space-y-3">
                {displayEscalations.map((item, idx) => (
                  <div key={`${item.title}-${idx}`} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-base font-semibold text-slate-100">{item.title}</h3>
                      <StatusBadge label={item.owner} tone={item.tone} />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{item.detail}</p>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </section>

      <section className="section-shell pt-0">
        <div className="page-shell">
          <Panel
            eyebrow="Reporting Ejecutivo"
            title="Centro de exportación para cortes ejecutivos y auditoría"
            description="La clave es que el reporte no aparezca como un botón perdido. Tiene que vivir en un workspace propio, con formato, horario y estado."
          >
            <div className="grid gap-3 lg:grid-cols-2">
              {displayReportQueue.map((report, idx) => (
                <div key={`${report.name}-${idx}`} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-100">{report.name}</h3>
                      <p className="mt-1 text-sm text-slate-400">{report.schedule}</p>
                    </div>
                    <StatusBadge label={`${report.format} · ${report.status}`} tone={report.status === "En cola" ? "orange" : "blue"} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      <WorkspaceModuleGrid
        eyebrow="Rutas COF"
        title="El centro COF se reparte entre terminales, frecuencia, incidentes, KPIs y reportes"
        description="El hub global sirve para entrar rápido al ángulo correcto según la presión del turno o el tipo de decisión que necesita la operación."
        items={cofWorkspace.links.slice(1)}
      />
    </main>
  );
}
