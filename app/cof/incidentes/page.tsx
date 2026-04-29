import Link from "next/link";
import { AlertTriangle, ClipboardCheck, ShieldAlert, Waypoints } from "lucide-react";

import { PageIntro } from "@/components/page-intro";
import { WorkspaceMetricGrid } from "@/components/workspace-metric-grid";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { cofIncidentMetrics, networkIncidentRows, responseCells, severityBuckets } from "@/lib/sicof-screen-data";

const icons = [ShieldAlert, Waypoints, ClipboardCheck, AlertTriangle];

export default function CofIncidentsPage() {
  return (
    <main>
      <PageIntro
        badge="COF · Incidentes"
        title="El tablero de incidentes de red separa severidad, ownership y estado de contención con muy poco ruido"
        description="COF no necesita ver todos los campos de un formulario. Necesita distinguir qué caso compromete servicio, quién lo toma y si la respuesta está dentro de la ventana correcta."
        tone="red"
        tags={["Severidad", "Contención multi-terminal"]}
        actions={
          <>
            <Link
              href="/cof/frecuencia"
              className="btn btn-secondary"
            >
              Volver a frecuencia
            </Link>
            <Link
              href="/admin/auditoria"
              className="btn btn-primary"
            >
              Ver auditoría TI
            </Link>
          </>
        }
      />

      <WorkspaceMetricGrid items={cofIncidentMetrics} icons={icons} />

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
          <Panel
            eyebrow="Casos de red"
            title="Incidentes que sí merecen espacio en COF"
            description="La tabla deja afuera lo anecdótico y sube solo lo que afecta continuidad, frecuencia o lectura ejecutiva."
          >
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
                  {networkIncidentRows.map((row) => (
                    <tr key={row.code} className="bg-white/4">
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
          </Panel>

          <div className="grid gap-4">
            <Panel
              eyebrow="Buckets"
              title="Severidad distribuida"
              description="Esta caja hace visible el peso relativo de la contingencia, no solo la lista infinita de casos."
            >
              <div className="space-y-3">
                {severityBuckets.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-base font-semibold text-slate-100">{item.label}</h3>
                      <StatusBadge label={item.value} tone={item.tone} />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{item.detail}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel
              eyebrow="Ownership"
              title="Qué célula responde según el tipo de problema"
              description="La UI deja clara la división entre despacho, COF y TI para preparar bien el diseño de responsabilidades futuras."
            >
              <div className="space-y-3">
                {responseCells.map((item, index) => (
                  <div key={item} className="rounded-2xl border border-white/8 bg-white/4 p-4">
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
