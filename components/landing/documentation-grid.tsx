import { Panel } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { documentationCards, report2Notes } from "@/lib/sicof-data";

export function DocumentationGrid() {
  return (
    <section id="documentacion" className="section-shell">
      <div className="page-shell space-y-8">
        <SectionHeading
          badge="Guía funcional"
          title="Cómo opera el SICOF"
          description="Un recorrido rápido por las funcionalidades críticas que resuelven la operación diaria en terminales y COF."
          tone="slate"
        />

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Panel eyebrow="Módulos clave" title="Flujo de trabajo" description="Entiende el recorrido del dato desde el terminal hasta el reporte ejecutivo.">
            <div className="grid gap-3">
              {documentationCards.map((card) => (
                <div key={card.path} className="hero-grid-card rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-display text-base font-semibold text-slate-100">{card.title}</h3>
                    <StatusBadge label={card.path} tone="blue" />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{card.summary}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel eyebrow="Puntos de valor" title="Qué resolvemos hoy" description="La superficie visual ya habilita las decisiones críticas del negocio.">
            <div className="mb-4 rounded-[24px] border border-blue-400/18 bg-blue-500/8 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-blue-200/80">Valor Operativo</p>
              <p className="mt-2 text-sm leading-6 text-blue-50/85">
                El SICOF transforma el caos de señales GPS y niveles de carga en una lista de tareas priorizadas para el despachador.
              </p>
            </div>

            <ul className="space-y-3">
              {report2Notes.map((note, index) => (
                <li key={note} className="hero-grid-card flex items-start gap-3 rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm leading-6 text-slate-300">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-xs font-semibold text-blue-200">
                    {index + 1}
                  </span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </section>
  );
}
