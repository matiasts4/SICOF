import type { LucideIcon } from "lucide-react";
import { Activity } from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";
import type { Tone } from "@/lib/sicof-data";

type MetricItem = {
  label: string;
  value: string;
  detail: string;
  tone: Tone;
};

type WorkspaceMetricGridProps = {
  items: MetricItem[];
  icons?: LucideIcon[];
};

export function WorkspaceMetricGrid({ items, icons = [] }: WorkspaceMetricGridProps) {
  return (
    <section className="section-shell pt-0">
      <div className="page-shell grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((metric, index) => {
          const Icon = icons[index] ?? Activity;

          return (
            <StatCard
              key={metric.label}
              icon={Icon}
              label={metric.label}
              value={metric.value}
              detail={metric.detail}
              tone={metric.tone}
            />
          );
        })}
      </div>
    </section>
  );
}
