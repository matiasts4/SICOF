import { StatusBadge } from "@/components/ui/status-badge";
import { Reveal } from "@/components/ui/reveal";
import type { Tone } from "@/lib/sicof-data";

type SectionHeadingProps = {
  badge: string;
  title: string;
  description: string;
  tone?: Tone;
};

export function SectionHeading({ badge, title, description, tone = "blue" }: SectionHeadingProps) {
  return (
    <Reveal className="max-w-3xl space-y-4">
      <StatusBadge label={badge} tone={tone} />
      <div className="space-y-3">
        <h2 className="font-display text-balance text-[clamp(2.3rem,4vw,3.8rem)] font-semibold leading-[0.97] tracking-[-0.05em] text-[var(--text-primary)]">
          {title}
        </h2>
        <p className="max-w-[68ch] text-pretty text-base leading-7 text-[var(--text-secondary)] sm:text-[1.05rem] sm:leading-8">{description}</p>
      </div>
    </Reveal>
  );
}
