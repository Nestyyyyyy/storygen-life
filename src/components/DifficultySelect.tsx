import { DIFFICULTIES, type Difficulty } from "@/lib/difficulty";

/** Zorluk seçimi — kredisiz yerel motorda etkileri ve barları dengeler. */
export function DifficultySelect({
  value,
  onChange,
  disabled = false,
  className = "",
}: {
  value: Difficulty;
  onChange: (d: Difficulty) => void;
  disabled?: boolean;
  className?: string;
}) {
  const active = DIFFICULTIES.find((d) => d.id === value);
  return (
    <fieldset className={className} disabled={disabled}>
      <legend className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Zorluk seviyesi
      </legend>
      <div role="radiogroup" aria-label="Zorluk seviyesi" className="grid grid-cols-3 gap-2">
        {DIFFICULTIES.map((d) => {
          const on = d.id === value;
          return (
            <button
              key={d.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(d.id)}
              className={`min-h-11 rounded-xl border px-2 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50 ${
                on
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-secondary/40 text-muted-foreground hover:border-primary/40"
              }`}
            >
              {d.label}
            </button>
          );
        })}
      </div>
      {active && <p className="mt-2 text-xs text-muted-foreground">{active.hint}</p>}
    </fieldset>
  );
}
