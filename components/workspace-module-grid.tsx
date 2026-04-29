import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Panel } from "@/components/ui/panel";
import { Reveal } from "@/components/ui/reveal";
import { StatusBadge } from "@/components/ui/status-badge";
import type { WorkspaceLink } from "@/lib/sicof-navigation";

type WorkspaceModuleGridProps = {
  eyebrow: string;
  title: string;
  description: string;
  items: WorkspaceLink[];
};

export function WorkspaceModuleGrid({ eyebrow, title, description, items }: WorkspaceModuleGridProps) {
  return (
    <section className="section-shell pt-0">
      <div className="page-shell">
        <Panel eyebrow={eyebrow} title={title} description={description}>
          <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {items.map((item, index) => (
              <Reveal key={item.href} delay={index * 60}>
                <Link
                  href={item.href}
                  className="hero-grid-card group block rounded-[24px] border border-white/8 bg-white/4 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-base font-semibold text-slate-100">{item.label}</p>
                      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{item.description}</p>
                    </div>
                    <StatusBadge label={item.tag ?? "Ruta"} tone={item.tone} />
                  </div>

                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-100">
                    Abrir vista
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Panel>
      </div>
    </section>
  );
}
