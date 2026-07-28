import { Smile, Coins, Briefcase, Activity } from "lucide-react";

import type { LifeStats } from "@/lib/life.functions";

const ITEMS = [
  { key: "happiness", label: "Mutluluk", icon: Smile, color: "var(--happiness)" },
  { key: "wealth", label: "Servet", icon: Coins, color: "var(--wealth)" },
  { key: "career", label: "Kariyer", icon: Briefcase, color: "var(--career)" },
  { key: "stress", label: "Stres", icon: Activity, color: "var(--stress)" },
] as const;

export function DeltaChips({ delta, stats }: { delta: LifeStats; stats: LifeStats }) {
  return (
    <div className="mt-4 flex flex-wrap gap-1.5">
      {ITEMS.map(({ key, label, icon: Icon, color }) => {
        const d = delta[key];
        const good = key === "stress" ? d < 0 : d > 0;
        const tone = d === 0 ? "var(--color-muted-foreground)" : good ? "var(--wealth)" : "var(--stress)";
        return (
          <span
            key={key}
            className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-2.5 py-1 text-[11px] tabular-nums"
            title={`${label}: ${stats[key]}%`}
          >
            <Icon className="size-3" style={{ color }} />
            <span className="text-muted-foreground">{label}</span>
            <span className="font-bold" style={{ color: tone }}>
              {d > 0 ? `+${d}` : d}
            </span>
            <span className="text-muted-foreground/70">→ {stats[key]}%</span>
          </span>
        );
      })}
    </div>
  );
}
