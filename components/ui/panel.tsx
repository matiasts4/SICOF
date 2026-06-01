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
  noReveal?: boolean;
};

export function Panel({
  children,
  className,
  eyebrow,
  title,
  description,
  action,
  noReveal = true,
}: PanelProps) {
  const panelContent = (
    <div
      className={cn(
        "panel-surface relative overflow-hidden rounded-[24px] border border-white/8 px-5 py-5 sm:px-6",
        className,
      )}
    >
      {(eyebrow ?? title ?? description ?? action) && (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-4 border-b border-white/8 pb-3.5">
          <div className="space-y-1">
            {eyebrow ? (
              <p className="section-label text-[0.68rem] text-[var(--text-muted)]">
                {eyebrow}
              </p>
            ) : null}
            {title ? <h3 className="font-display text-base font-semibold tracking-tight text-white">{title}</h3> : null}
            {description ? <p className="max-w-2xl text-xs text-[var(--text-secondary)]">{description}</p> : null}
          </div>
          {action}
        </header>
      )}
      {children}
    </div>
  );

  if (noReveal) {
    return panelContent;
  }

  return (
    <Reveal>
      {panelContent}
    </Reveal>
  );
}
