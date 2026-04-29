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
import { cofMetrics, escalations, reportQueue, terminalHealth } from "@/lib/sicof-data";

const icons = [BarChart3, AlertTriangle, Activity, FileDown];

export default function CofPage() {
  return (
    <main>
      <PageIntro
        badge="Vista Administrador de Operaciones (COF)"
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
          {cofMetrics.map((metric, index) => {
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
            <div className="space-y-4">
              {terminalHealth.map((terminal) => (
                <div key={terminal.terminal} className="rounded-2xl border border-white/8 bg-white/4 p-4">
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
          </Panel>

          <Panel
            eyebrow="Escalamiento"
            title="Contingencias que requieren decisión"
            description="COF no gestiona todo: prioriza lo que amenaza regularidad o servicio."
          >
            <div className="space-y-3">
              {escalations.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-slate-100">{item.title}</h3>
                    <StatusBadge label={item.owner} tone={item.tone} />
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
            eyebrow="Reporting Ejecutivo"
            title="Centro de exportación para cortes ejecutivos y auditoría"
            description="La clave es que el reporte no aparezca como un botón perdido. Tiene que vivir en un workspace propio, con formato, horario y estado."
          >
            <div className="grid gap-3 lg:grid-cols-2">
              {reportQueue.map((report) => (
                <div key={report.name} className="rounded-2xl border border-white/8 bg-white/4 p-4">
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
