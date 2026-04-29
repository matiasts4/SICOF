import Link from "next/link";
import { ArrowRight, Radar, Route, Zap } from "lucide-react";

import { Panel } from "@/components/ui/panel";
import { Reveal } from "@/components/ui/reveal";
import { StatusBadge } from "@/components/ui/status-badge";
import { commandPreview } from "@/lib/sicof-data";

export function CommandPreview() {
  return (
    <Panel
      className="command-grid overflow-hidden border-white/12 bg-[rgba(8,11,16,0.78)] px-6 py-6 shadow-[0_30px_100px_rgba(0,0,0,0.34)] sm:px-8"
      eyebrow="Turno activo"
      title="Lectura inmediata del patio sin pasar por un dashboard genérico"
      description="El home ahora desemboca en un deck protagonista: despacho, energía, frecuencia e incidentes priorizados en una sola escena visual."
      action={<StatusBadge label={`${commandPreview.terminal} · en vivo`} tone="blue" />}
    >
      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Reveal className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="hero-grid-card rounded-[1.55rem] border border-white/10 bg-white/[0.055] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Ventana</p>
              <p className="mono-kpi mt-2 text-2xl font-semibold text-slate-50">{commandPreview.operatingWindow}</p>
            </div>
            <div className="hero-grid-card rounded-[1.55rem] border border-white/10 bg-white/[0.055] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Despachos</p>
              <p className="mono-kpi mt-2 text-2xl font-semibold text-slate-50">{commandPreview.departuresReady}</p>
            </div>
            <div className="hero-grid-card rounded-[1.55rem] border border-white/10 bg-white/[0.055] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Frecuencia</p>
              <p className="mono-kpi mt-2 text-2xl font-semibold text-amber-300">{commandPreview.delayedWindow}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="hero-grid-card rounded-[1.55rem] border border-white/10 bg-[rgba(7,9,14,0.68)] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Qué decide</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">Despacho inmediato, reasignación de bus y cobertura del turno.</p>
            </div>
            <div className="hero-grid-card rounded-[1.55rem] border border-white/10 bg-[rgba(7,9,14,0.68)] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Qué lo destraba</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">SoC, ETA y frecuencia en la misma lectura operacional.</p>
            </div>
            <div className="hero-grid-card rounded-[1.55rem] border border-white/10 bg-[rgba(7,9,14,0.68)] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Qué evita</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">Excel local, doble digitación y reporte tardío de incidentes.</p>
            </div>
          </div>

          <div className="space-y-3">
            {commandPreview.buses.map((bus) => (
              <div
                key={bus.padron}
                className="hero-grid-card flex flex-col gap-3 rounded-[1.55rem] border border-white/10 bg-[rgba(7,9,14,0.78)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-white/[0.06] p-2.5 ring-1 ring-inset ring-white/10">
                    <Route className="h-4 w-4 text-slate-200" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-50">{bus.padron} · servicio {bus.route}</p>
                    <p className="text-sm text-slate-400">{bus.driver}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <StatusBadge label={`SoC ${bus.soc}`} tone={bus.tone} />
                  <StatusBadge label={bus.status} tone={bus.tone} />
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="space-y-4 rounded-[1.8rem] border border-white/10 bg-[rgba(8,10,15,0.9)] p-5" delay={120}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Lecturas simultáneas</p>
              <h3 className="font-display mt-2 text-lg font-semibold text-slate-50">Estado del turno</h3>
            </div>
            <Radar className="h-5 w-5 text-blue-300" />
          </div>

          <div className="space-y-3 rounded-[1.45rem] border border-emerald-400/18 bg-emerald-500/8 p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-300" />
              <p className="text-sm font-medium text-emerald-100">Bus eléctrico listo para salida prioritaria</p>
            </div>
            <p className="text-sm leading-6 text-emerald-50/80">
              El mock visual fuerza a que la información crítica aparezca antes de abrir cualquier detalle.
            </p>
          </div>

          <ul className="space-y-3">
            {commandPreview.incidents.map((incident) => (
              <li key={incident} className="hero-grid-card rounded-[1.3rem] border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-slate-300">
                {incident}
              </li>
            ))}
          </ul>

          <Link
            href="/terminal"
            className="btn btn-primary self-start"
          >
            Abrir vista Despachador
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>
    </Panel>
  );
}
