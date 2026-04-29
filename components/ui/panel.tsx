import type { ReactNode } from "react";

import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

type PanelProps = {
  children: ReactNode;
  className?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
};

export function Panel({
  children,
  className,
  eyebrow,
  title,
  description,
  action,
}: PanelProps) {
  return (
    <Reveal
      className={cn(
        "panel-surface relative overflow-hidden rounded-[30px] border border-white/10 px-5 py-5 sm:px-6",
        className,
      )}
    >
      {(eyebrow ?? title ?? description ?? action) && (
        <header className="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-white/8 pb-4">
          <div className="space-y-2">
            {eyebrow ? (
              <p className="section-label text-[0.68rem] text-[var(--text-muted)]">
                {eyebrow}
              </p>
            ) : null}
            {title ? <h3 className="font-display text-xl font-semibold tracking-[-0.035em] text-[var(--text-primary)]">{title}</h3> : null}
            {description ? <p className="max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">{description}</p> : null}
          </div>
          {action}
        </header>
      )}
      {children}
    </Reveal>
  );
}
