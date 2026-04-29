import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/sicof-data";

const toneStyles: Record<Tone, string> = {
  blue: "border-[rgba(167,187,255,0.18)] bg-[rgba(167,187,255,0.08)] text-[rgba(228,235,255,0.92)]",
  green: "border-[rgba(141,215,176,0.18)] bg-[rgba(141,215,176,0.08)] text-[rgba(220,246,232,0.92)]",
  orange: "border-[rgba(215,193,163,0.2)] bg-[rgba(215,193,163,0.08)] text-[rgba(247,236,221,0.92)]",
  red: "border-[rgba(255,155,177,0.2)] bg-[rgba(255,155,177,0.08)] text-[rgba(255,225,232,0.92)]",
  slate: "border-white/10 bg-white/[0.045] text-[rgba(226,230,238,0.88)]",
};

const toneDot: Record<Tone, string> = {
  blue: "bg-[rgba(167,187,255,0.92)]",
  green: "bg-[rgba(141,215,176,0.92)]",
  orange: "bg-[rgba(215,193,163,0.92)]",
  red: "bg-[rgba(255,155,177,0.92)]",
  slate: "bg-[rgba(196,202,214,0.78)]",
};

type StatusBadgeProps = {
  label: string;
  tone?: Tone;
  className?: string;
};

export function StatusBadge({ label, tone = "slate", className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "glass-pill inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.7rem] font-medium tracking-[0.12em] uppercase",
        toneStyles[tone],
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full shadow-[0_0_12px_currentColor]", toneDot[tone])} aria-hidden="true" />
      {label}
    </span>
  );
}
