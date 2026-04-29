import Link from "next/link";
import { Activity, AlarmClockCheck, MoveRight, Radar } from "lucide-react";

import { PageIntro } from "@/components/page-intro";
import { WorkspaceMetricGrid } from "@/components/workspace-metric-grid";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { cofFrequencyMetrics, corridorStatus, criticalSlots, interventionDeck } from "@/lib/sicof-screen-data";

const icons = [Radar, Activity, MoveRight, AlarmClockCheck];

export default function CofFrequencyPage() {
  return (
    <main>
      <PageIntro
        badge="COF · Frecuencia"
        title="Acá se ve la red como un tablero de regulación, no como una suma desordenada de alarmas"
        description="COF necesita comparar corredores, entender desviación contra meta y elegir intervención táctica. Todo en un solo plano visual."
        tone="orange"
        tags={["Control multi-terminal", "Intervención táctica"]}
        actions={
          <>
            <Link
              href="/cof/terminales"
              className="btn btn-secondary"
            >
              Ver terminales
            </Link>
            <Link
              href="/cof/incidentes"
              className="btn btn-primary"
            >
              Ver incidentes
            </Link>
          </>
        }
      />

      <WorkspaceMetricGrid items={cofFrequencyMetrics} icons={icons} />

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
          <Panel
            eyebrow="Estado por corredor"
            title="Desviación, headway y acción sugerida"
            description="La tabla ordena lo que se sostiene, lo que se corrige y lo que ya exige decisión más dura."
          >
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm text-slate-300">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    <th className="pb-2 pr-4 font-medium">Corredor</th>
                    <th className="pb-2 pr-4 font-medium">Headway</th>
                    <th className="pb-2 pr-4 font-medium">Desvío</th>
                    <th className="pb-2 font-medium">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {corridorStatus.map((row) => (
                    <tr key={row.corridor} className="bg-white/4">
                      <td className="rounded-l-2xl border-y border-l border-white/8 px-4 py-3 font-medium text-slate-100">{row.corridor}</td>
                      <td className="border-y border-white/8 px-4 py-3">{row.headway}</td>
                      <td className="border-y border-white/8 px-4 py-3">{row.deviation}</td>
                      <td className="rounded-r-2xl border-y border-r border-white/8 px-4 py-3">
                        <StatusBadge label={row.action} tone={row.tone} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel
            eyebrow="Deck de intervención"
            title="Jugadas tácticas priorizadas"
            description="La pantalla no solo alerta: propone. Esa diferencia es clave para que el módulo se sienta realmente útil."
          >
            <div className="space-y-3">
              {interventionDeck.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-slate-100">{item.title}</h3>
                    <StatusBadge label="Acción" tone={item.tone} />
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
            eyebrow="Ventanas críticas"
            title="Dónde puede quebrarse la regularidad si no actuamos"
            description="Estas franjas horarias permiten explicar rapidísimo por qué un corredor sube en jerarquía sobre otro."
          >
            <div className="grid gap-3 lg:grid-cols-3">
              {criticalSlots.map((slot) => (
                <div key={slot.slot} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-slate-100">{slot.slot}</h3>
                    <StatusBadge label={slot.slot} tone={slot.tone} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{slot.note}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>
    </main>
  );
}
