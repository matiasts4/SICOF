import Link from "next/link";
import { BatteryCharging, BusFront, Gauge, Zap } from "lucide-react";

import { PageIntro } from "@/components/page-intro";
import { WorkspaceMetricGrid } from "@/components/workspace-metric-grid";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { chargerBays, chargingBoard, swapRecommendations, terminalEnergyMetrics } from "@/lib/sicof-screen-data";

const icons = [BusFront, Zap, Gauge, BatteryCharging];

export default function TerminalEnergyPage() {
  return (
    <main>
      <PageIntro
        badge="Terminal · Energía"
        title="La vista energética tiene que ayudar a decidir, no solo mostrar porcentajes lindos"
        description="SoC, ocupación de cargadores y swaps sugeridos aparecen con lectura operacional directa para que energía y despacho se hablen en el mismo idioma visual." 
        tone="green"
        tags={["SoC", "Swap táctico"]}
        actions={
          <>
            <Link
              href="/terminal/flota"
              className="btn btn-secondary"
            >
              Volver a flota
            </Link>
            <Link
              href="/terminal/despacho"
              className="btn btn-primary"
            >
              Ajustar despacho
            </Link>
          </>
        }
      />

      <WorkspaceMetricGrid items={terminalEnergyMetrics} icons={icons} />

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <Panel
            eyebrow="SoC por unidad"
            title="Buses eléctricos que condicionan la salida"
            description="Cada unidad muestra su cargador, ETA y riesgo operacional. El foco no es energía abstracta: es impacto sobre el turno."
          >
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm text-slate-300">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    <th className="pb-2 pr-4 font-medium">Unidad</th>
                    <th className="pb-2 pr-4 font-medium">SoC</th>
                    <th className="pb-2 pr-4 font-medium">Bahía</th>
                    <th className="pb-2 pr-4 font-medium">ETA</th>
                    <th className="pb-2 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {chargingBoard.map((row) => (
                    <tr key={row.unit} className="bg-white/4">
                      <td className="rounded-l-2xl border-y border-l border-white/8 px-4 py-3 font-medium text-slate-100">{row.unit}</td>
                      <td className="border-y border-white/8 px-4 py-3">{row.soc}</td>
                      <td className="border-y border-white/8 px-4 py-3">{row.bay}</td>
                      <td className="border-y border-white/8 px-4 py-3">{row.eta}</td>
                      <td className="rounded-r-2xl border-y border-r border-white/8 px-4 py-3">
                        <StatusBadge label={row.status} tone={row.tone} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel
            eyebrow="Bahías de carga"
            title="Capacidad disponible ahora mismo"
            description="Esta lectura deja clarísimo qué punto conviene usar y dónde se está formando un cuello de botella."
          >
            <div className="space-y-3">
              {chargerBays.map((bay) => (
                <div key={bay.name} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-slate-100">{bay.name}</h3>
                    <StatusBadge label={`${bay.occupancy} · ${bay.load}`} tone={bay.tone} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{bay.status}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      <section className="section-shell pt-0">
        <div className="page-shell">
          <Panel
            eyebrow="Swap recomendado"
            title="Movimientos sugeridos para no romper frecuencia por energía"
            description="No alcanza con detectar riesgo. La pantalla tiene que proponer la mejor jugada visible para el turno."
          >
            <div className="grid gap-3 lg:grid-cols-3">
              {swapRecommendations.map((item) => (
                <div key={`${item.service}-${item.currentBus}`} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-slate-100">{item.service}</h3>
                    <StatusBadge label={item.currentBus} tone={item.tone} />
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-200">{item.recommendation}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{item.reason}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>
    </main>
  );
}
