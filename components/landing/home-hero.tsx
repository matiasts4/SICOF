import Link from "next/link";
import { Activity, ArrowRight, LayoutGrid, ShieldCheck, Users } from "lucide-react";

import { Reveal } from "@/components/ui/reveal";
import { StatusBadge } from "@/components/ui/status-badge";
import { homeLaunchMetrics, homeOperationalPulse, homeQuickLaunch } from "@/lib/sicof-screen-data";

const heroIcons = [LayoutGrid, Users, Activity, ShieldCheck];

export function HomeHero() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-[calc(100svh-7rem)] items-center overflow-hidden px-4 pb-14 pt-10 sm:px-6 sm:pt-16"
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 56% 34% at 50% 26%, rgba(159,184,255,0.16) 0%, transparent 72%), radial-gradient(ellipse 32% 20% at 18% 82%, rgba(215,193,163,0.08) 0%, transparent 72%)",
        }}
      />

      <div className="page-shell relative z-10">
        <div className="mx-auto max-w-6xl text-center">
          <Reveal className="mb-8 flex justify-center">
            <StatusBadge label="SICOF · centro de mando visual" tone="blue" className="px-4 py-2 text-[0.72rem]" />
          </Reveal>

          <Reveal className="mx-auto max-w-5xl space-y-6" delay={60}>
            <h1 className="font-display text-balance text-[clamp(3.4rem,9vw,7.6rem)] font-semibold leading-[0.9] tracking-[-0.065em] text-[var(--text-primary)]">
              Control visual
              <span className="block text-[rgba(219,225,236,0.76)]">para decidir antes del atraso.</span>
            </h1>

            <p className="mx-auto max-w-[61ch] text-pretty text-[1.05rem] leading-8 text-[var(--text-secondary)] sm:text-[1.2rem] sm:leading-9">
              SICOF toma la actitud del landing de ArxonLabs y la convierte en otra cosa: un lobby táctico, oscuro y contundente para
              Terminal, COF y TI. No explica de más. Te mete directo en la operación.
            </p>
          </Reveal>

          <Reveal className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row" delay={120}>
            <Link
              href="/terminal/despacho"
              className="btn btn-primary btn-lg"
            >
              Entrar al turno terminal
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/cof/frecuencia"
              className="btn btn-secondary btn-lg"
            >
              Abrir control COF
            </Link>
          </Reveal>

          <Reveal className="mt-6 flex flex-wrap items-center justify-center gap-2.5" delay={180}>
            {[
              "18 pantallas activas",
              "3 workspaces",
              "Mock data coordinada",
              "US4 + US6 + TI",
            ].map((signal) => (
              <span
                key={signal}
                className="glass-pill inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-[0.72rem] font-semibold tracking-[0.16em] text-[var(--text-secondary)] uppercase"
              >
                {signal}
              </span>
            ))}
          </Reveal>

          <div className="mt-16 grid gap-4 lg:grid-cols-[1.08fr_0.92fr] lg:text-left">
            <Reveal className="rounded-[2rem] border border-white/12 bg-white/[0.035] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.26)] backdrop-blur-xl sm:p-7" delay={120}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="section-label text-[0.68rem]">Accesos inmediatos</p>
                <StatusBadge label="Operación en vivo" tone="green" />
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {homeQuickLaunch.map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="hero-grid-card group rounded-[1.6rem] border border-white/10 bg-[rgba(8,10,14,0.56)] p-4 text-left"
                    style={{ transitionDelay: `${index * 40}ms` }}
                  >
                    <StatusBadge label={item.title} tone={item.tone} className="max-w-full" />
                    <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">{item.summary}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                      Abrir
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </Reveal>

            <Reveal className="rounded-[2rem] border border-white/12 bg-[rgba(10,12,18,0.72)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:p-7" delay={200}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="section-label text-[0.68rem]">Pulso transversal</p>
                <StatusBadge label="Lectura priorizada" tone="blue" />
              </div>
              <div className="mt-5 space-y-3">
                {homeOperationalPulse.map((item) => (
                  <div
                    key={item.title}
                    className="hero-grid-card rounded-[1.4rem] border border-white/10 bg-white/[0.035] px-4 py-4 text-left"
                  >
                    <StatusBadge label={item.title} tone={item.tone} />
                    <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{item.detail}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <div className="mt-6 grid gap-px overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 sm:grid-cols-2 xl:grid-cols-4">
            {homeLaunchMetrics.map((metric, index) => {
              const Icon = heroIcons[index] ?? ShieldCheck;

              return (
                <Reveal
                  key={metric.label}
                  className="flex flex-col gap-4 bg-[rgba(255,255,255,0.04)] px-5 py-6 text-left backdrop-blur-xl"
                  delay={220 + index * 60}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="glass-pill flex size-10 items-center justify-center rounded-2xl">
                      <Icon className="h-4 w-4 text-[var(--text-primary)]" strokeWidth={1.9} />
                    </span>
                    <StatusBadge label={metric.label} tone={metric.tone} />
                  </div>
                  <div>
                    <p className="mono-kpi text-4xl font-semibold text-[var(--text-primary)]">{metric.value}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{metric.detail}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
