import type { ReactNode } from "react";

import { StatusBadge } from "@/components/ui/status-badge";
import { Reveal } from "@/components/ui/reveal";
import type { Tone } from "@/lib/sicof-data";

type PageIntroProps = {
  badge: string;
  title: string;
  description: string;
  tone?: Tone;
  tags?: string[];
  actions?: ReactNode;
};

export function PageIntro({
  badge,
  title,
  description,
  tone = "blue",
  tags = [],
  actions,
}: PageIntroProps) {
  return (
    <section className="section-shell pt-6">
      <div className="page-shell">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <Reveal className="max-w-3xl space-y-5">
            <StatusBadge label={badge} tone={tone} />
            <div className="space-y-4">
              <h1 className="font-display text-balance text-[clamp(2.9rem,5vw,4.8rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-[var(--text-primary)]">
                {title}
              </h1>
              <p className="max-w-[68ch] text-pretty text-base leading-7 text-[var(--text-secondary)] sm:text-[1.05rem] sm:leading-8">{description}</p>
            </div>
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="glass-pill rounded-full px-3.5 py-1.5 text-sm font-medium text-[var(--text-secondary)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </Reveal>
          {actions ? <Reveal className="flex flex-wrap gap-3" delay={90}>{actions}</Reveal> : null}
        </div>
      </div>
    </section>
  );
}
