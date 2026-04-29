import type { LucideIcon } from "lucide-react";

import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Tone } from "@/lib/sicof-data";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  tone?: Tone;
};

export function StatCard({ icon: Icon, label, value, detail, tone = "blue" }: StatCardProps) {
  return (
    <Panel className="h-full">
      <div className="flex items-start justify-between gap-3">
        <div className="glass-pill rounded-[1.15rem] p-2.5">
          <Icon className="h-5 w-5 text-[var(--text-primary)]" strokeWidth={1.8} />
        </div>
        <StatusBadge label={label} tone={tone} />
      </div>
      <div className="mt-6 space-y-2.5">
        <p className="mono-kpi text-[clamp(2rem,3vw,2.6rem)] font-semibold tracking-tight text-[var(--text-primary)]">{value}</p>
        <p className="text-sm leading-6 text-[var(--text-secondary)]">{detail}</p>
      </div>
    </Panel>
  );
}
