import { Cpu, Sparkles } from "lucide-react";

/**
 * Hangi anlatı motorunun çalıştığını gösterir:
 * "ai" = gerçek yapay zekâ, "local" = kredisiz yerel kombinasyonel motor.
 */
export function EngineBadge({
  engine,
  className = "",
}: {
  engine?: "ai" | "local" | null;
  className?: string;
}) {
  const ai = engine === "ai";
  const unknown = !engine;
  const label = unknown ? "Motor bekleniyor" : ai ? "Yapay zekâ motoru" : "Kredisiz yerel motor";
  const Icon = ai ? Sparkles : Cpu;
  return (
    <span
      title={
        unknown
          ? "İlk sahne üretildiğinde hangi motorun çalıştığı burada görünür."
          : ai
            ? "Sahneler gerçek zamanlı olarak yapay zekâ tarafından yazılıyor."
            : "Yapay zekâya ulaşılamadı (kredi/kota/ağ). Sahneler cihazın için hazırlanmış yerel kombinasyonel motorla yazılıyor."
      }
      aria-live="polite"
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
        unknown
          ? "border-border bg-secondary/40 text-muted-foreground"
          : ai
            ? "border-primary/50 bg-primary/10 text-primary"
            : "border-border bg-secondary/60 text-foreground"
      } ${className}`}
    >
      <Icon className="size-3.5" aria-hidden />
      {label}
    </span>
  );
}
