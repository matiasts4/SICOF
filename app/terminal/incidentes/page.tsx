import Link from "next/link";
import { AlertTriangle, ClipboardCheck, Route, Siren } from "lucide-react";

import { PageIntro } from "@/components/page-intro";
import { WorkspaceMetricGrid } from "@/components/workspace-metric-grid";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { escalationFlow, evidenceChecklist, localIncidentCards, terminalIncidentMetrics } from "@/lib/sicof-screen-data";

const icons = [Siren, ClipboardCheck, AlertTriangle, Route];

export default function TerminalIncidentsPage() {
  return (
    <main>
      <PageIntro
        badge="Terminal · Incidentes"
        title="El incidente tiene que registrar contexto útil sin romper el ritmo del despacho"
        description="La carga visual acá es mínima a propósito: severidad, evidencia, servicio afectado y ruta de escalamiento. Con eso ya se sostiene una operación mucho más clara." 
        tone="red"
        tags={["Evidencia mínima", "Escalamiento"]}
        actions={
          <>
            <Link
              href="/terminal/despacho"
              className="btn btn-secondary"
            >
              Volver a despacho
            </Link>
            <Link
              href="/cof/incidentes"
              className="btn btn-primary"
            >
              Abrir tablero COF
            </Link>
          </>
        }
      />

      <WorkspaceMetricGrid items={terminalIncidentMetrics} icons={icons} />

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <Panel
            eyebrow="Casos abiertos"
            title="Incidentes locales con el mínimo contexto necesario"
            description="Cada tarjeta deja claro qué pasó, dónde pega y si el caso se queda local o ya exige coordinación más arriba."
          >
            <div className="space-y-3">
              {localIncidentCards.map((item) => (
                <div key={item.code} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-500">{item.code}</p>
                      <h3 className="mt-2 text-base font-semibold text-slate-100">{item.title}</h3>
                    </div>
                    <StatusBadge label={`${item.severity} · ${item.state}`} tone={item.tone} />
                  </div>
                  <p className="mt-3 text-sm text-slate-300">{item.bus} · {item.area}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            eyebrow="Checklist de evidencia"
            title="Qué no puede faltar antes de escalar"
            description="La mejor UX para incidentes no es meter mil campos: es obligar visualmente a registrar lo que realmente explica el caso."
          >
            <div className="space-y-3">
              {evidenceChecklist.map((item, index) => (
                <div key={item} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-500">Evidencia {index + 1}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      <section className="section-shell pt-0">
        <div className="page-shell">
          <Panel
            eyebrow="Ruta de escalamiento"
            title="Cuándo se queda en terminal y cuándo sube de nivel"
            description="Esta separación ordena perfecto la futura lógica real de ownership, notificaciones y tiempos de respuesta."
          >
            <div className="grid gap-3 lg:grid-cols-3">
              {escalationFlow.map((item) => (
                <div key={item.step} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-slate-100">{item.step}</h3>
                    <StatusBadge label={item.step} tone={item.tone} />
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
