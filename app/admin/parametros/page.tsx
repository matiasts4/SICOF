import Link from "next/link";
import { CalendarClock, Settings2, SlidersHorizontal, Waypoints } from "lucide-react";

import { PageIntro } from "@/components/page-intro";
import { WorkspaceMetricGrid } from "@/components/workspace-metric-grid";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { adminParameterMetrics, changeCalendar, integrationFlags, parameterGroups } from "@/lib/sicof-screen-data";

const icons = [Settings2, SlidersHorizontal, CalendarClock, Waypoints];

export default function AdminParametersPage() {
  return (
    <main>
      <PageIntro
        badge="TI · Parámetros"
        title="Los parámetros visibles ordenan la conversación sobre reglas, umbrales e integraciones futuras"
        description="Este módulo no implementa backend, pero sí deja clarísimo qué grupos de configuración existen, cuáles son sensibles y cómo impactan el comportamiento del sistema."
        tone="slate"
        tags={["Configuración", "Flags", "Preparación para integración"]}
        actions={
          <>
            <Link
              href="/admin/auditoria"
              className="btn btn-secondary"
            >
              Ver auditoría
            </Link>
            <Link
              href="/"
              className="btn btn-primary"
            >
              Volver al centro
            </Link>
          </>
        }
      />

      <WorkspaceMetricGrid items={adminParameterMetrics} icons={icons} />

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 xl:grid-cols-[1.04fr_0.96fr]">
          <Panel
            eyebrow="Grupos de parámetros"
            title="Qué capas del sistema pueden configurarse"
            description="La pantalla distingue operación, energía, reportes y seguridad para no mezclar decisiones de naturaleza distinta en una misma bolsa visual."
          >
            <div className="space-y-3">
              {parameterGroups.map((item) => (
                <div key={item.group} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-slate-100">{item.group}</h3>
                    <StatusBadge label={item.group} tone={item.tone} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{item.detail}</p>
                </div>
              ))}
            </div>
          </Panel>

          <div className="grid gap-4">
            <Panel
              eyebrow="Calendario"
              title="Cambios programados"
              description="No todo ajuste es urgente. Esta pieza ayuda a visualizar ventanas y congelamientos de forma ordenada."
            >
              <div className="space-y-3">
                {changeCalendar.map((item) => (
                  <div key={`${item.slot}-${item.title}`} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-base font-semibold text-slate-100">{item.title}</h3>
                      <StatusBadge label={item.slot} tone={item.tone} />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{item.detail}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel
              eyebrow="Flags de integración"
              title="Qué superficies ya anticipan contratos reales"
              description="Esta caja conecta perfecto la fase visual actual con el diseño de integraciones que vendrá después con otros equipos."
            >
              <div className="space-y-3">
                {integrationFlags.map((item) => (
                  <div key={item.name} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-base font-semibold text-slate-100">{item.name}</h3>
                      <StatusBadge label={item.status} tone={item.tone} />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{item.detail}</p>
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
