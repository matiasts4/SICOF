import Link from "next/link";

import { Reveal } from "@/components/ui/reveal";
import { StatusBadge } from "@/components/ui/status-badge";
import { moduleCards } from "@/lib/sicof-data";

const spans = ["xl:col-span-5", "xl:col-span-3", "xl:col-span-4", "xl:col-span-4", "xl:col-span-5", "xl:col-span-3", "xl:col-span-3", "xl:col-span-5"];

export function ModuleGrid() {
  return (
    <section id="modulos" className="section-shell">
      <div className="page-shell">
        <div className="grid gap-8 xl:grid-cols-[0.78fr_1.22fr] xl:items-start">
          <Reveal className="xl:sticky xl:top-28">
            <StatusBadge label="Módulos del Sistema" tone="orange" />
            <h2 className="font-display mt-5 text-balance text-[clamp(2.5rem,4.7vw,4rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-[var(--text-primary)]">
              Modularización completa de procesos.
            </h2>
            <p className="mt-5 max-w-xl text-pretty text-lg leading-8 text-[var(--text-secondary)]">
              Esta sección toma el rol que en el landing ocupa “Servicios”: convierte capacidades en piezas memorables, con escala, variedad y
              foco visual suficiente para que cada módulo tenga peso propio.
            </p>
          </Reveal>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-8">
            {moduleCards.map((module, index) => (
              <Reveal
                key={module.title}
                className={`${spans[index] ?? "xl:col-span-4"} flex h-full flex-col rounded-[1.9rem] border border-white/12 bg-white/[0.045] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.2)] backdrop-blur-xl`}
                delay={index * 55}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="section-label text-[0.68rem]">Módulo 0{index + 1}</p>
                  <StatusBadge label="Mock data" tone={module.tone} />
                </div>

                <div className="mt-5">
                  <h3 className="font-display text-2xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">{module.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{module.description}</p>
                </div>

                <div className="hero-grid-card mt-6 rounded-[1.35rem] border border-white/10 bg-[rgba(8,10,14,0.5)] p-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Cliente</p>
                    <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{module.client}</p>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Servicio SOA</p>
                    <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{module.service}</p>
                  </div>
                </div>

                {module.nfr && module.nfr.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {module.nfr?.map((item) => (
                      <span
                        key={item}
                        className="glass-pill rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                )}

                <Link
                  href={module.route}
                  className="btn btn-secondary mt-6 self-start"
                >
                  Abrir módulo →
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
