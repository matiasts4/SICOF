import Link from "next/link";
import { Gauge, MoveRight, Orbit, TimerReset } from "lucide-react";

import { PageIntro } from "@/components/page-intro";
import { WorkspaceMetricGrid } from "@/components/workspace-metric-grid";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { corridorPressure, dispatchMoves, serviceWindows, terminalFrequencyMetrics } from "@/lib/sicof-screen-data";

const icons = [Gauge, TimerReset, Orbit, MoveRight];

export default function TerminalFrequencyPage() {
  return (
    <main>
      <PageIntro
        badge="Terminal · Frecuencia"
        title="La frecuencia se protege desde el patio mucho antes de que el problema explote en COF"
        description="Este módulo muestra la presión por servicio, la próxima salida crítica y los movimientos tácticos que pueden cerrar brechas antes de escalar." 
        tone="orange"
        tags={["Regularidad", "Ventanas críticas"]}
        actions={
          <>
            <Link
              href="/terminal/despacho"
              className="btn btn-secondary"
            >
              Ajustar despacho
            </Link>
            <Link
              href="/cof/frecuencia"
              className="btn btn-primary"
            >
              Escalar a COF
            </Link>
          </>
        }
      />

      <WorkspaceMetricGrid items={terminalFrequencyMetrics} icons={icons} />

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <Panel
            eyebrow="Servicios en ventana"
            title="Brechas y próxima salida por corredor"
            description="La tabla permite ver dónde aguantar, dónde reasignar y dónde ya conviene avisar al nivel superior."
          >
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm text-slate-300">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    <th className="pb-2 pr-4 font-medium">Servicio</th>
                    <th className="pb-2 pr-4 font-medium">Gap</th>
                    <th className="pb-2 pr-4 font-medium">Meta</th>
                    <th className="pb-2 pr-4 font-medium">Próxima</th>
                    <th className="pb-2 font-medium">Presión</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceWindows.map((row) => (
                    <tr key={row.service} className="bg-white/4">
                      <td className="rounded-l-2xl border-y border-l border-white/8 px-4 py-3 font-medium text-slate-100">{row.service}</td>
                      <td className="border-y border-white/8 px-4 py-3">{row.gap}</td>
                      <td className="border-y border-white/8 px-4 py-3">{row.headway}</td>
                      <td className="border-y border-white/8 px-4 py-3">{row.nextOut}</td>
                      <td className="rounded-r-2xl border-y border-r border-white/8 px-4 py-3">
                        <StatusBadge label={row.pressure} tone={row.tone} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel
            eyebrow="Presión por corredor"
            title="Dónde conviene mirar primero"
            description="COF ve red. Terminal necesita saber cuál corredor lo está apretando ahora mismo."
          >
            <div className="space-y-3">
              {corridorPressure.map((item) => (
                <div key={item.corridor} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-slate-100">{item.corridor}</h3>
                    <StatusBadge label={item.corridor} tone={item.tone} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{item.note}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      <section className="section-shell pt-0">
        <div className="page-shell">
          <Panel
            eyebrow="Jugadas del turno"
            title="Tres movimientos que ordenan la ventana sin agrandar el problema"
            description="Acá la UI propone acciones concretas. Esa claridad después sirve muchísimo para diseñar lógica real y estados de aprobación."
          >
            <div className="grid gap-3 lg:grid-cols-3">
              {dispatchMoves.map((move, index) => (
                <div key={move} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-500">Movimiento {index + 1}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{move}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>
    </main>
  );
}
