import { useId, useState } from "react";
import {
  Loader2,
  Sparkles,
  MessageSquarePlus,
  AlertCircle,
  Check,
} from "lucide-react";

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
  className,
}: Props) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [hint, setHint] = useState("");
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);

  async function ask(withHint?: string) {
    if (busy) return;
    setBusy(true);
    setDone(false);
    setFailed(false);
    try {
      const v = await onSuggest(withHint);
      if (v) {
        onChange(v);
        setDone(true);
        setTimeout(() => setDone(false), 4000);
      } else {
        setFailed(true);
      }
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={className}>
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
        className="field"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        style={error ? { borderColor: "var(--destructive)" } : undefined}
      />

      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => void ask()}
          disabled={busy}
          aria-label={`${label} için yapay zekâdan öneri al`}
          aria-busy={busy}
          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-primary/60 bg-primary/15 px-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/25 disabled:opacity-60"
        >
          {busy ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Öneriliyor…
            </>
          ) : (
            <>
              <Sparkles className="size-4" /> AI ile öner
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => setHintOpen((o) => !o)}
          aria-expanded={hintOpen}
          aria-controls={`${id}-hint`}
          aria-label={`${label} için nasıl bir şey istediğini yaz`}
          className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold transition-colors ${
            hintOpen
              ? "border-accent bg-accent/25 text-foreground"
              : "border-border text-foreground hover:bg-secondary"
          }`}
        >
          <MessageSquarePlus className="size-4" /> İpucu ver
        </button>
      </div>

      {hintOpen && (
        <div id={`${id}-hint`} className="animate-fade-in mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void ask(hint.trim() || undefined);
              }
            }}
            placeholder={hintPlaceholder}
            aria-label={`${label} için istek`}
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
        {busy ? `${label} önerisi hazırlanıyor` : done ? `${label} önerisi eklendi` : ""}
      </p>

      {done && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-primary">
          <Check className="size-3.5 shrink-0" /> Öneri eklendi, dilediğin gibi düzenle.
        </p>
      )}

      {failed && (
        <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="size-3.5 shrink-0" /> Öneri alınamadı, tekrar dene.
        </p>
      )}

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive"
        >
          <AlertCircle className="size-3.5 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}
