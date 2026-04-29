import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/ui/reveal";
import { StatusBadge } from "@/components/ui/status-badge";
import { workspaceCards } from "@/lib/sicof-navigation";

export function WorkspaceShowcase() {
  return (
    <section id="workspaces" className="section-shell pt-0">
      <div className="page-shell">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="section-label">Workspaces</p>
          <h2 className="font-display mt-5 text-balance text-[clamp(2.6rem,5vw,4.5rem)] font-semibold leading-[0.96] tracking-[-0.055em] text-[var(--text-primary)]">
            Tres entradas distintas.
            <span className="block text-[rgba(207,214,226,0.72)]">Mismo sistema. Otra actitud.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-8 text-[var(--text-secondary)]">
            El home ya no repite paneles genéricos. Presenta Terminal, COF y TI como superficies con personalidad propia, igual que un landing
            premium presenta sus ofertas principales.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-4 xl:grid-cols-3">
          {workspaceCards.map((workspace, index) => (
            <Reveal
              key={workspace.href}
              className="relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/12 bg-white/[0.045] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl"
              delay={index * 70}
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-40"
                aria-hidden="true"
                style={{
                  background:
                    workspace.tone === "green"
                      ? "radial-gradient(circle at top, rgba(141,215,176,0.18), transparent 72%)"
                      : workspace.tone === "blue"
                        ? "radial-gradient(circle at top, rgba(159,184,255,0.18), transparent 72%)"
                        : "radial-gradient(circle at top, rgba(215,193,163,0.14), transparent 72%)",
                }}
              />

              <div className="relative z-10 flex h-full flex-col">
                <div className="flex items-start justify-between gap-4">
                  <span className="font-display text-[clamp(3rem,6vw,4.5rem)] font-semibold leading-none tracking-[-0.08em] text-white/18">
                    0{index + 1}
                  </span>
                  <StatusBadge label={workspace.href} tone={workspace.tone} />
                </div>

                <div className="mt-8">
                  <p className="section-label text-[0.68rem]">Workspace activo</p>
                  <h3 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">{workspace.title}</h3>
                  <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">{workspace.summary}</p>
                </div>

                <div className="mt-8 space-y-3">
                  {workspace.quickLinks.map((link) => (
                    <div key={link.href} className="hero-grid-card rounded-[1.35rem] border border-white/10 bg-[rgba(8,10,14,0.48)] px-4 py-4">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{link.label}</p>
                      <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{link.description}</p>
                    </div>
                  ))}
                </div>

                <Link
                  href={workspace.href}
                  className="btn btn-primary mt-8"
                >
                  Abrir {workspace.title}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
