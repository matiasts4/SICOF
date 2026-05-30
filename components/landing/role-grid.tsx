/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/ui/reveal";
import { StatusBadge } from "@/components/ui/status-badge";
import { roleCards } from "@/lib/sicof-data";

export function RoleGrid() {
  return (
    <section id="roles" className="section-shell">
      <div className="page-shell">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="section-label">Vistas por perfil</p>
          <h2 className="font-display mt-5 text-balance text-[clamp(2.4rem,4.8vw,4rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-[var(--text-primary)]">
            Tres ritmos cognitivos.
            <span className="block text-[rgba(207,214,226,0.72)]">Una misma columna vertebral visual.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-8 text-[var(--text-secondary)]">
            En vez de repetir tarjetas clonadas, esta sección cuenta el sistema como secuencia: velocidad para despacho, síntesis para COF y
            gobierno para TI.
          </p>
        </Reveal>

        <div className="relative mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
          <div
            className="absolute left-0 right-0 top-14 hidden h-px bg-white/12 md:block"
            aria-hidden="true"
          />

          {roleCards.map((role, index) => (
            <Reveal key={role.role} className="relative flex flex-col gap-6" delay={index * 70}>
              <span className="font-display select-none text-[clamp(4.5rem,8vw,6rem)] font-semibold leading-none tracking-[-0.08em] text-white/18" aria-hidden="true">
                0{index + 1}
              </span>

              <div>
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <span className="section-label text-[0.68rem]">Perfil {index + 1}</span>
                  <StatusBadge label={role.focus} tone={role.tone} />
                </div>

                <h3 className="font-display text-2xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">{role.role}</h3>
                <p className="mt-3 text-base leading-7 text-[var(--text-secondary)]">{role.summary}</p>
              </div>

              <div className="hero-grid-card space-y-3 rounded-[1.65rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Decisión principal</p>
                  <p className="mt-2 text-sm font-medium leading-6 text-[var(--text-primary)]">{role.decision}</p>
                </div>
                <div className="h-px bg-white/8" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Lo primero que ve</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{role.seesFirst}</p>
                </div>
              </div>

              {(role as any).bullets && (role as any).bullets.length > 0 && (
                <ul className="space-y-3 text-sm leading-6 text-[var(--text-secondary)]">
                  {(role as any).bullets?.map((bullet: string) => (
                    <li key={bullet} className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-white/70" aria-hidden="true" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}

              <Link
                href={role.route}
                className="btn btn-secondary self-start"
              >
                Ver interfaz
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
