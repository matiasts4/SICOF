import Link from "next/link";
import { CalendarClock, FileDown, MailCheck, PackageCheck } from "lucide-react";

import { PageIntro } from "@/components/page-intro";
import { WorkspaceMetricGrid } from "@/components/workspace-metric-grid";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { cofReportMetrics, deliveryMatrix, reportCatalog } from "@/lib/sicof-screen-data";

const icons = [PackageCheck, MailCheck, CalendarClock, FileDown];

export default function CofReportsPage() {
  return (
    <main>
      <PageIntro
        badge="COF · Reportes"
        title="Los reportes se tratan como un producto dentro del sistema, no como un botón suelto al final del flujo"
        description="Este workspace ordena formatos, cadencia y audiencia para que la exportación tenga peso visual propio y sirva de base al diseño documental futuro."
        tone="slate"
        tags={["PDF / Excel", "Distribución por audiencia"]}
        actions={
          <>
            <Link
              href="/cof/kpis"
              className="btn btn-secondary"
            >
              Volver a KPIs
            </Link>
            <Link
              href="/admin/auditoria"
              className="btn btn-primary"
            >
              Revisar trazabilidad
            </Link>
          </>
        }
      />

      <WorkspaceMetricGrid items={cofReportMetrics} icons={icons} />

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
          <Panel
            eyebrow="Catálogo de reportes"
            title="Packs disponibles por corte y formato"
            description="La tabla organiza nombre, formato, cadencia y audiencia, que son justo las piezas que después definirán exportaciones reales."
          >
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm text-slate-300">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    <th className="pb-2 pr-4 font-medium">Reporte</th>
                    <th className="pb-2 pr-4 font-medium">Formato</th>
                    <th className="pb-2 pr-4 font-medium">Cadencia</th>
                    <th className="pb-2 font-medium">Audiencia</th>
                  </tr>
                </thead>
                <tbody>
                  {reportCatalog.map((row) => (
                    <tr key={row.name} className="bg-white/4">
                      <td className="rounded-l-2xl border-y border-l border-white/8 px-4 py-3 font-medium text-slate-100">{row.name}</td>
                      <td className="border-y border-white/8 px-4 py-3">
                        <StatusBadge label={row.format} tone={row.tone} />
                      </td>
                      <td className="border-y border-white/8 px-4 py-3">{row.cadence}</td>
                      <td className="rounded-r-2xl border-y border-r border-white/8 px-4 py-3">{row.audience}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel
            eyebrow="Lógica de distribución"
            title="Cómo se reparte el paquete correcto a la audiencia correcta"
            description="Sirve para mostrar que no todo reporte vale para todos. Esa diferenciación mejora mucho la percepción de sistema serio."
          >
            <div className="space-y-3">
              {deliveryMatrix.map((item, index) => (
                <div key={item} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-500">Regla {index + 1}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>
    </main>
  );
}
