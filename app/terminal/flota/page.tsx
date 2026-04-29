import Link from "next/link";
import { Bus, ShieldCheck, UserRound, Waves } from "lucide-react";

import { PageIntro } from "@/components/page-intro";
import { WorkspaceMetricGrid } from "@/components/workspace-metric-grid";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  terminalDriverNotes,
  terminalFleetMetrics,
  terminalFleetRows,
  terminalReserveBlocks,
} from "@/lib/sicof-screen-data";

const icons = [Bus, UserRound, ShieldCheck, Waves];

export default function TerminalFleetPage() {
  return (
    <main>
      <PageIntro
        badge="Terminal · Flota"
        title="La flota del patio se lee por disponibilidad real, no por una lista plana sin contexto"
        description="Esta vista separa bloque, conductor, energía y nivel de preparación para que el despachador vea rápido qué unidad puede salir, cuál conviene guardar y cuál necesita decisión." 
        tone="blue"
        tags={["Patio segmentado", "Disponibilidad inmediata"]}
        actions={
          <>
            <Link
              href="/terminal/despacho"
              className="btn btn-secondary"
            >
              Ir a despacho
            </Link>
            <Link
              href="/terminal/energia"
              className="btn btn-primary"
            >
              Ver energía
            </Link>
          </>
        }
      />

      <WorkspaceMetricGrid items={terminalFleetMetrics} icons={icons} />

      <section className="section-shell pt-0">
        <div className="page-shell">
          <Panel
            eyebrow="Roster operativo"
            title="Inventario táctico del patio"
            description="Cada fila mezcla padrón, servicio, conductor, bloque y estado de preparación. Eso baja la fricción para decidir cobertura sin saltar entre módulos."
          >
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm text-slate-300">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    <th className="pb-2 pr-4 font-medium">Padrón</th>
                    <th className="pb-2 pr-4 font-medium">Servicio</th>
                    <th className="pb-2 pr-4 font-medium">Conductor</th>
                    <th className="pb-2 pr-4 font-medium">Bloque</th>
                    <th className="pb-2 pr-4 font-medium">Energía</th>
                    <th className="pb-2 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {terminalFleetRows.map((row) => (
                    <tr key={row.padron} className="bg-white/4">
                      <td className="rounded-l-2xl border-y border-l border-white/8 px-4 py-3 font-medium text-slate-100">{row.padron}</td>
                      <td className="border-y border-white/8 px-4 py-3">{row.service}</td>
                      <td className="border-y border-white/8 px-4 py-3">{row.driver}</td>
                      <td className="border-y border-white/8 px-4 py-3">{row.block}</td>
                      <td className="border-y border-white/8 px-4 py-3">{row.energy}</td>
                      <td className="rounded-r-2xl border-y border-r border-white/8 px-4 py-3">
                        <StatusBadge label={row.readiness} tone={row.tone} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      </section>

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
          <Panel
            eyebrow="Reserva táctica"
            title="Buffers que realmente sostienen el patio"
            description="La reserva no es un número abstracto. Se divide por velocidad de activación y por riesgo operativo asociado."
          >
            <div className="space-y-3">
              {terminalReserveBlocks.map((item) => (
                <div key={item.name} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-slate-100">{item.name}</h3>
                    <StatusBadge label={item.name} tone={item.tone} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{item.detail}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            eyebrow="Conductores en foco"
            title="Notas cortas para evitar decisiones ciegas"
            description="El valor está en unir la situación del bus con el contexto del conductor. Ese cruce después ordena mejor despacho y frecuencia."
          >
            <div className="space-y-3">
              {terminalDriverNotes.map((note, index) => (
                <div key={note} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-500">Nota {index + 1}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{note}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>
    </main>
  );
}
