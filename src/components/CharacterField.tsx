import { useState } from "react";
import { Loader2, Sparkles, MessageSquarePlus, AlertCircle, Check } from "lucide-react";

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  onSuggest: (hint?: string) => Promise<string>;
  hintPlaceholder: string;
  className?: string;
};

export function CharacterField({
  label,
  value,
  onChange,
  error,
  onSuggest,
  hintPlaceholder,
  className = "",
}: Props) {
  const [busy, setBusy] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [hint, setHint] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "fail">("idle");

  const id = `field-${label.toLowerCase().replace(/\s+/g, "-")}`;

  async function ask(withHint?: string) {
    if (busy) return;
    setBusy(true);
    setStatus("idle");
    try {
      const v = await onSuggest(withHint);
      if (v) {
        onChange(v);
        setStatus("ok");
      } else {
        setStatus("fail");
      }
    } catch {
      setStatus("fail");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`min-w-0 ${className}`}>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase"
      >
        {label}
      </label>

      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="field w-full"
        style={error ? { borderColor: "var(--destructive)" } : undefined}
      />

      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void ask()}
          disabled={busy}
          aria-busy={busy}
          aria-label={`${label} için yapay zekâdan öneri al`}
          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-primary/60 bg-primary/15 px-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/25 disabled:opacity-60 sm:flex-none"
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Sparkles className="size-4" aria-hidden />
          )}
          AI ile öner
        </button>
        <button
          type="button"
          onClick={() => setHintOpen((o) => !o)}
          aria-expanded={hintOpen}
          aria-label={`${label} için ipucu ver`}
          className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold transition-colors sm:flex-none ${
            hintOpen
              ? "border-accent bg-accent/25 text-accent"
              : "border-border text-foreground hover:bg-secondary"
          }`}
        >
          <MessageSquarePlus className="size-4" aria-hidden />
          İpucu ver
        </button>
      </div>

      {hintOpen && (
        <div className="animate-fade-in mt-2 flex flex-col gap-2 sm:flex-row">
          <label htmlFor={`${id}-hint`} className="sr-only">
            {hintPlaceholder}
          </label>
          <input
            id={`${id}-hint`}
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void ask(hint.trim() || undefined);
              }
            }}
            placeholder={hintPlaceholder}
            className="field flex-1 text-sm"
          />
          <button
            type="button"
            onClick={() => void ask(hint.trim() || undefined)}
            disabled={busy}
            className="min-h-11 shrink-0 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-foreground disabled:opacity-60"
          >
            Öner
          </button>
        </div>
      )}

      <p role="status" aria-live="polite" className="sr-only">
        {busy ? `${label} önerisi hazırlanıyor` : status === "ok" ? `${label} önerisi eklendi` : ""}
      </p>

      {status === "ok" && !busy && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-primary">
          <Check className="size-3.5 shrink-0" aria-hidden /> Öneri eklendi, istersen düzenle.
        </p>
      )}
      {status === "fail" && !busy && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="size-3.5 shrink-0" aria-hidden /> Öneri alınamadı, tekrar dene.
        </p>
      )}

      {error && (
        <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="size-3.5 shrink-0" aria-hidden /> {error}
        </p>
      )}
    </div>
  );
}
