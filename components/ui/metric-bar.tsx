import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/sicof-data";

const toneClass: Record<Tone, string> = {
  blue: "bg-gradient-to-r from-blue-500 to-cyan-400",
  green: "bg-gradient-to-r from-emerald-500 to-teal-400",
  orange: "bg-gradient-to-r from-amber-500 to-orange-400",
  red: "bg-gradient-to-r from-rose-500 to-pink-400",
  slate: "bg-gradient-to-r from-slate-400 to-slate-200",
};

type MetricBarProps = {
  value: number;
  tone?: Tone;
  className?: string;
};

export function MetricBar({ value, tone = "blue", className }: MetricBarProps) {
  return (
    <div className={cn("metric-track h-2 w-full", className)} aria-hidden="true">
      <div className={cn("metric-fill", toneClass[tone])} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
