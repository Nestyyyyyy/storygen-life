import { BEST_OF_OPTIONS, type BestOf } from "@/lib/quality-types";

/**
 * Kredisiz motorun her turda kaç aday üretip puanlayacağı (best-of-N).
 * Yüksek değer daha iyi sahne seçer, üretim biraz daha uzun sürer.
 */
export function BestOfSelect({
  value,
  onChange,
  showReport,
  onShowReportChange,
  disabled = false,
  className = "",
}: {
  value: BestOf;
  onChange: (n: BestOf) => void;
  showReport: boolean;
  onShowReportChange: (v: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <fieldset className={className} disabled={disabled}>
      <legend className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Kalite değerlendirmesi (aday sayısı)
      </legend>
      <div role="radiogroup" aria-label="Aday sayısı" className="grid grid-cols-3 gap-2">
        {BEST_OF_OPTIONS.map((n) => {
          const on = n === value;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(n)}
              className={`min-h-11 rounded-xl border px-2 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50 ${
                on
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-secondary/40 text-muted-foreground hover:border-primary/40"
              }`}
            >
              {n} aday
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Her turda {value} sahne üretilir, kalite puanı en yüksek olan otomatik seçilir. Daha fazla
        aday = daha iyi anlatı, biraz daha uzun bekleme.
      </p>
      <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-secondary/40 px-3 text-sm">
        <input
          type="checkbox"
          checked={showReport}
          onChange={(e) => onShowReportChange(e.target.checked)}
          className="size-4 accent-[var(--color-primary)]"
        />
        Kalite raporunu sahnelerde göster
      </label>
    </fieldset>
  );
}
