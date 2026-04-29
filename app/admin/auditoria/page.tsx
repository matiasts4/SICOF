import Link from "next/link";
import { AlertTriangle, FileClock, ShieldCheck, TimerReset } from "lucide-react";

import { PageIntro } from "@/components/page-intro";
import { WorkspaceMetricGrid } from "@/components/workspace-metric-grid";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { adminAuditMetrics, auditFeedRows, auditHighlights } from "@/lib/sicof-screen-data";

const icons = [FileClock, AlertTriangle, TimerReset, ShieldCheck];

export default function AdminAuditPage() {
  return (
    <main>
      <PageIntro
        badge="TI · Auditoría"
        title="La auditoría se presenta como una historia legible del sistema, no como un log indescifrable"
        description="Este módulo organiza eventos críticos, atípicos y auditables para que trazabilidad y observabilidad tengan verdadero peso visual dentro de SICOF."
        tone="orange"
        tags={["Auditoría", "Trazabilidad", "Eventos críticos"]}
        actions={
          <>
            <Link
              href="/admin/permisos"
              className="btn btn-secondary"
            >
              Ver permisos
            </Link>
            <Link
              href="/cof/reportes"
              className="btn btn-primary"
            >
              Cruzar con reportes
            </Link>
          </>
        }
      />

      <WorkspaceMetricGrid items={adminAuditMetrics} icons={icons} />

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 xl:grid-cols-[1.04fr_0.96fr]">
          <Panel
            eyebrow="Feed principal"
            title="Eventos recientes que merecen lectura inmediata"
            description="La tabla mezcla actor, evento e impacto, porque sin esa combinación la auditoría se vuelve puro ruido técnico."
          >
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm text-slate-300">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    <th className="pb-2 pr-4 font-medium">Hora</th>
                    <th className="pb-2 pr-4 font-medium">Evento</th>
                    <th className="pb-2 pr-4 font-medium">Actor</th>
                    <th className="pb-2 font-medium">Impacto</th>
                  </tr>
                </thead>
                <tbody>
                  {auditFeedRows.map((row) => (
                    <tr key={`${row.time}-${row.event}`} className="bg-white/4">
                      <td className="rounded-l-2xl border-y border-l border-white/8 px-4 py-3 font-medium text-slate-100">{row.time}</td>
                      <td className="border-y border-white/8 px-4 py-3">{row.event}</td>
                      <td className="border-y border-white/8 px-4 py-3">{row.actor}</td>
                      <td className="rounded-r-2xl border-y border-r border-white/8 px-4 py-3">
                        <StatusBadge label={row.impact} tone={row.tone} className="max-w-full" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel
            eyebrow="Hallazgos"
            title="Qué hace útil esta vista para explicar el futuro sistema"
            description="Acá queda la capa narrativa que justifica por qué la auditoría necesita un módulo propio y no un rincón escondido."
          >
            <div className="space-y-3">
              {auditHighlights.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-slate-100">{item.title}</h3>
                    <StatusBadge label="Insight" tone={item.tone} />
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
