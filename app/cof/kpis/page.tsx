import Link from "next/link";
import { BarChart3, Gauge, ShieldCheck, TrendingUp } from "lucide-react";

import { PageIntro } from "@/components/page-intro";
import { WorkspaceMetricGrid } from "@/components/workspace-metric-grid";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { cofKpiMetrics, kpiWatchouts, performanceBands } from "@/lib/sicof-screen-data";

const icons = [BarChart3, ShieldCheck, Gauge, TrendingUp];

export default function CofKpisPage() {
  return (
    <main>
      <PageIntro
        badge="COF · KPIs"
        title="La capa ejecutiva tiene que resumir la operación sin volverla decorativa"
        description="Estos indicadores sirven para dirección, seguimiento y priorización. El diseño privilegia comparación clara y narrativa breve sobre cualquier artificio visual."
        tone="blue"
        tags={["Lectura ejecutiva", "Comparabilidad"]}
        actions={
          <>
            <Link
              href="/cof/terminales"
              className="btn btn-secondary"
            >
              Volver a terminales
            </Link>
            <Link
              href="/cof/reportes"
              className="btn btn-primary"
            >
              Exportar visión
            </Link>
          </>
        }
      />

      <WorkspaceMetricGrid items={cofKpiMetrics} icons={icons} />

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 xl:grid-cols-[1.02fr_0.98fr]">
          <Panel
            eyebrow="Bandas de desempeño"
            title="Métricas que sostienen la conversación ejecutiva"
            description="Cada bloque combina valor y tendencia para evitar la típica pantalla que muestra números sin decir si mejoran o empeoran."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {performanceBands.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-slate-100">{item.label}</h3>
                    <StatusBadge label={item.trend} tone={item.tone} />
                  </div>
                  <p className="mt-4 font-mono text-3xl font-semibold tracking-tight text-slate-50">{item.value}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            eyebrow="Watchouts"
            title="Lecturas que explican el KPI"
            description="Acá vive la capa de interpretación. Sin esto, el tablero sería solo una colección prolija de números."
          >
            <div className="space-y-3">
              {kpiWatchouts.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-slate-100">{item.title}</h3>
                    <StatusBadge label="Foco" tone={item.tone} />
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
