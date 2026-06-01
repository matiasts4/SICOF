import type { ReactNode } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Tone } from "@/lib/sicof-data";

type PageIntroProps = {
  badge: string;
  title: string;
  description?: string;
  tone?: Tone;
  tags?: string[];
  actions?: ReactNode;
};

export function PageIntro({
  badge,
  title,
  tone = "blue",
  tags = [],
  actions,
}: PageIntroProps) {
  // Extract category from badge (e.g. "COF Hub · Demo" -> "COF Hub")
  const category = badge.split(" · ")[0];

  return (
    <div className="sticky top-0 z-20 -mx-4 -mt-6 mb-6 flex h-16 items-center justify-between border-b border-white/8 bg-[#05070a]/95 px-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 shadow-md">
      {/* Lado izquierdo: Breadcrumb y Título */}
      <div className="flex items-center gap-2.5 overflow-hidden">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline whitespace-nowrap">
          {category}
        </span>
        <span className="text-slate-600 hidden sm:inline select-none">/</span>
        <h1 className="font-display text-sm sm:text-base md:text-lg font-bold tracking-tight text-white truncate leading-none">
          {title}
        </h1>

        {/* Tags */}
        <div className="hidden xl:flex items-center gap-2 ml-3 border-l border-white/10 pl-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-white/[0.04] border border-white/8 px-2.5 py-1 text-[10px] font-semibold text-slate-300 whitespace-nowrap uppercase tracking-wider"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Lado derecho: Acciones */}
      {actions ? (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
