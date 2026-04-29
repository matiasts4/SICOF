import Link from "next/link";
import { ArrowUpDown, Building2, ShieldCheck, Siren } from "lucide-react";

import { PageIntro } from "@/components/page-intro";
import { WorkspaceMetricGrid } from "@/components/workspace-metric-grid";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { cofTerminalMetrics, terminalComparisonRows, terminalPressureNotes } from "@/lib/sicof-screen-data";

const icons = [Building2, Siren, ShieldCheck, ArrowUpDown];

export default function CofTerminalsPage() {
  return (
    <main>
      <PageIntro
        badge="COF · Terminales"
        title="Comparar terminales no es apilar tablas: es mostrar dónde conviene intervenir primero"
        description="Este tablero resume salud, foco y nivel de riesgo por patio para que COF decida con lectura transversal y sin caer en microdetalle innecesario."
        tone="blue"
        tags={["Comparativa multi-terminal", "Priorización"]}
        actions={
          <>
            <Link
              href="/cof/frecuencia"
              className="btn btn-secondary"
            >
              Ir a frecuencia
            </Link>
            <Link
              href="/cof/kpis"
              className="btn btn-primary"
            >
              Ver KPIs
            </Link>
          </>
        }
      />

      <WorkspaceMetricGrid items={cofTerminalMetrics} icons={icons} />

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
          <Panel
            eyebrow="Comparativa de patios"
            title="Terminales bajo un mismo criterio visual"
            description="La idea es que COF lea estabilidad, foco y riesgo sin tener que reconstruir mentalmente cada terminal por separado."
          >
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm text-slate-300">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    <th className="pb-2 pr-4 font-medium">Terminal</th>
                    <th className="pb-2 pr-4 font-medium">Estado</th>
                    <th className="pb-2 pr-4 font-medium">Foco</th>
                    <th className="pb-2 font-medium">Riesgo</th>
                  </tr>
                </thead>
                <tbody>
                  {terminalComparisonRows.map((row) => (
                    <tr key={row.terminal} className="bg-white/4">
                      <td className="rounded-l-2xl border-y border-l border-white/8 px-4 py-3 font-medium text-slate-100">{row.terminal}</td>
                      <td className="border-y border-white/8 px-4 py-3">{row.readiness}</td>
                      <td className="border-y border-white/8 px-4 py-3">{row.focus}</td>
                      <td className="rounded-r-2xl border-y border-r border-white/8 px-4 py-3">
                        <StatusBadge label={row.risk} tone={row.tone} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel
            eyebrow="Lectura rápida"
            title="Notas que explican la presión del turno"
            description="A veces un comentario bien escrito vale más que otra tarjeta repetida. Acá vive esa capa de síntesis."
          >
            <div className="space-y-3">
              {terminalPressureNotes.map((note, index) => (
                <div key={note} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-500">Lectura {index + 1}</p>
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
