import Link from "next/link";
import { ClipboardList, Clock3, MapPinned, ShieldCheck } from "lucide-react";

import { PageIntro } from "@/components/page-intro";
import { WorkspaceMetricGrid } from "@/components/workspace-metric-grid";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  terminalDispatchChecklist,
  terminalDispatchMetrics,
  terminalDispatchQueue,
  terminalGeofenceFeed,
} from "@/lib/sicof-screen-data";

const icons = [Clock3, MapPinned, ClipboardList, ShieldCheck];

export default function TerminalDispatchPage() {
  return (
    <main>
      <PageIntro
        badge="Terminal · Despacho"
        title="La cola de salida tiene que contar qué sale, qué frena y qué se destraba en la próxima ventana"
        description="Acá el sistema se vuelve quirúrgico: ventana, andén, conductor, estado de liberación y trazas de geocerca aparecen en una misma lectura para no improvisar." 
        tone="orange"
        tags={["Geocercas", "Ventana inmediata"]}
        actions={
          <>
            <Link
              href="/terminal/frecuencia"
              className="btn btn-secondary"
            >
              Ver frecuencia
            </Link>
            <Link
              href="/terminal/incidentes"
              className="btn btn-primary"
            >
              Ver incidentes
            </Link>
          </>
        }
      />

      <WorkspaceMetricGrid items={terminalDispatchMetrics} icons={icons} />

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <Panel
            eyebrow="Cola de salida"
            title="Ventanas activas del turno"
            description="La tabla prioriza secuencia, canal y bloqueo operativo para que el turno se ordene en segundos."
          >
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm text-slate-300">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    <th className="pb-2 pr-4 font-medium">Hora</th>
                    <th className="pb-2 pr-4 font-medium">Servicio</th>
                    <th className="pb-2 pr-4 font-medium">Unidad</th>
                    <th className="pb-2 pr-4 font-medium">Conductor</th>
                    <th className="pb-2 pr-4 font-medium">Canal</th>
                    <th className="pb-2 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {terminalDispatchQueue.map((row) => (
                    <tr key={`${row.window}-${row.service}`} className="bg-white/4">
                      <td className="rounded-l-2xl border-y border-l border-white/8 px-4 py-3 font-medium text-slate-100">{row.window}</td>
                      <td className="border-y border-white/8 px-4 py-3">{row.service}</td>
                      <td className="border-y border-white/8 px-4 py-3">{row.unit}</td>
                      <td className="border-y border-white/8 px-4 py-3">{row.driver}</td>
                      <td className="border-y border-white/8 px-4 py-3">{row.channel}</td>
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
            eyebrow="Checklist mínimo"
            title="Antes de liberar una salida"
            description="Cuatro preguntas, no veinte. Si esta lista es clara, el operador no se enreda en burocracia visual."
          >
            <div className="space-y-3">
              {terminalDispatchChecklist.map((item, index) => (
                <div key={item.title} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-500">Chequeo {index + 1}</p>
                  <h3 className="mt-2 text-base font-semibold text-slate-100">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{item.detail}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      <section className="section-shell pt-0">
        <div className="page-shell">
          <Panel
            eyebrow="Feed geocerca"
            title="Trazas de salida que reemplazan marcaje manual"
            description="El timeline deja ver cómo se comporta la ventana sin pedir digitación extra. Eso prepara muy bien la futura automatización real."
          >
            <div className="space-y-4">
              {terminalGeofenceFeed.map((item) => (
                <div key={`${item.time}-${item.event}`} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500/12 font-mono text-sm font-semibold text-orange-200">
                    {item.time}
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                    <p className="font-medium text-slate-100">{item.event}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>
    </main>
  );
}
