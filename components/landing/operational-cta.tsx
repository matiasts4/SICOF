import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/ui/reveal";
import { StatusBadge } from "@/components/ui/status-badge";
import { homeRouteInventory } from "@/lib/sicof-screen-data";

export function OperationalCta() {
  return (
    <section className="section-shell">
      <div className="page-shell">
        <Reveal className="grid gap-10 rounded-[2.4rem] border border-white/12 bg-white/[0.045] p-6 shadow-[0_26px_90px_rgba(0,0,0,0.26)] backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:p-10">
          <div>
            <StatusBadge label="Mapa completo" tone="orange" />
            <h2 className="font-display mt-5 max-w-xl text-balance text-[clamp(2.4rem,4vw,3.8rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-[var(--text-primary)]">
              El sistema ya tiene forma.
              <span className="block text-[rgba(207,214,226,0.72)]">Ahora se siente como producto.</span>
            </h2>
            <p className="mt-5 max-w-xl text-pretty text-lg leading-8 text-[var(--text-secondary)]">
              Terminal, COF y TI ya no viven como un montón de tarjetas iguales. Cada grupo de rutas aparece como bloque operativo claro, con
              suficiente jerarquía para pasar la prueba de entrecerrar los ojos.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/terminal"
                className="btn btn-primary"
              >
                Ir al command center
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/#documentacion"
                className="btn btn-secondary"
              >
                Ver documentación base
              </Link>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            {homeRouteInventory.map((group) => (
              <div key={group.group} className="hero-grid-card rounded-[1.6rem] border border-white/10 bg-[rgba(8,10,14,0.44)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-display text-lg font-semibold tracking-[-0.03em] text-[var(--text-primary)]">{group.group}</p>
                  <StatusBadge label={`${group.pages.length} vistas`} tone={group.tone} />
                </div>
                <div className="mt-4 space-y-2">
                  {group.pages.map((page) => (
                    <div
                      key={page}
                      className="rounded-[1rem] border border-white/8 bg-white/[0.04] px-3 py-2 text-sm font-medium text-[var(--text-secondary)]"
                    >
                      {page}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
