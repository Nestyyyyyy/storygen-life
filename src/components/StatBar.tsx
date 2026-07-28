import type { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  delta?: number;
};

export function StatBar({ label, value, icon: Icon, color, delta }: Props) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-medium">
          <Icon className="size-4" style={{ color }} />
          {label}
        </span>
        <span className="flex items-baseline gap-2 tabular-nums">
          {delta !== undefined && delta !== 0 && (
            <span
              className="animate-fade-in text-xs font-semibold"
              style={{ color: delta > 0 ? "var(--wealth)" : "var(--stress)" }}
            >
              {delta > 0 ? `+${delta}` : delta}
            </span>
          )}
          <span className="font-semibold">{value}%</span>
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="stat-bar h-full rounded-full"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, color-mix(in oklab, ${color} 55%, transparent), ${color})`,
            boxShadow: `0 0 16px -2px ${color}`,
          }}
        />
      </div>
    </div>
  );
}
