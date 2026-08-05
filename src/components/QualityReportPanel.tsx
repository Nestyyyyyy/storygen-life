import { BarChart3, Check } from "lucide-react";

import type { QualityAudit } from "@/lib/quality-types";

/**
 * İsteğe bağlı rapor paneli: kredisiz motorun bu turda ürettiği tüm adaylar,
 * kalite puanları ve puanın nasıl oluştuğu (kırılım) gösterilir.
 */
export function QualityReportPanel({
  audit,
  className = "",
}: {
  audit?: QualityAudit | null;
  className?: string;
}) {
  if (!audit || !audit.candidates.length) return null;
  return (
    <details className={`mt-4 rounded-xl border border-border bg-secondary/30 ${className}`}>
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground">
        <BarChart3 className="size-3.5 text-primary" aria-hidden />
        Kalite raporu — {audit.candidates.length} aday, seçilen puan {audit.chosenScore}
      </summary>
      <ul className="space-y-2 px-3 pb-3">
        {audit.candidates.map((c) => (
          <li
            key={c.index}
            className={`rounded-lg border p-2.5 text-xs ${
              c.chosen ? "border-primary/60 bg-primary/10" : "border-border bg-background/40"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-1.5 font-semibold">
                {c.chosen && <Check className="size-3.5 shrink-0 text-primary" aria-hidden />}
                <span className="truncate">
                  Aday {c.index + 1}: {c.title}
                </span>
              </span>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 font-bold ${
                  c.score >= 85
                    ? "bg-primary/20 text-primary"
                    : c.score >= 70
                      ? "bg-secondary text-foreground"
                      : "bg-destructive/20 text-destructive"
                }`}
              >
                {c.score}/100
              </span>
            </div>
            <p className="mt-1 text-muted-foreground">{c.preview}…</p>
            <ul className="mt-1.5 space-y-0.5">
              <li className="text-muted-foreground">Taban puan: 100</li>
              {c.breakdown.length === 0 ? (
                <li className="text-muted-foreground">Ceza yok — temiz sahne.</li>
              ) : (
                c.breakdown.map((b, i) => (
                  <li key={i} className="flex items-baseline gap-1.5">
                    <span
                      className={`font-mono font-semibold ${b.delta < 0 ? "text-destructive" : "text-primary"}`}
                    >
                      {b.delta > 0 ? `+${b.delta}` : b.delta}
                    </span>
                    <span className="text-muted-foreground">{b.reason}</span>
                  </li>
                ))
              )}
            </ul>
          </li>
        ))}
      </ul>
    </details>
  );
}
