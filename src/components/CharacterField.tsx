import { useState } from "react";
import { Loader2, Sparkles, MessageSquarePlus, AlertCircle } from "lucide-react";

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  onSuggest: (hint?: string) => Promise<string>;
  hintPlaceholder: string;
};

export function CharacterField({
  label,
  value,
  onChange,
  error,
  onSuggest,
  hintPlaceholder,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [hint, setHint] = useState("");

  async function ask(withHint?: string) {
    if (busy) return;
    setBusy(true);
    try {
      const v = await onSuggest(withHint);
      if (v) onChange(v);
    } finally {
      setBusy(false);
    }
  }

  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="field flex-1"
          style={error ? { borderColor: "var(--destructive)" } : undefined}
        />
        <button
          type="button"
          onClick={() => ask()}
          disabled={busy}
          title="Yapay zekâ önersin"
          className="grid size-11 shrink-0 place-items-center rounded-xl border border-primary/40 bg-primary/10 text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
        </button>
        <button
          type="button"
          onClick={() => setHintOpen((o) => !o)}
          title="Nasıl bir şey istersin?"
          className={`grid size-11 shrink-0 place-items-center rounded-xl border transition-colors ${
            hintOpen
              ? "border-accent/50 bg-accent/20 text-accent"
              : "border-border text-muted-foreground hover:bg-secondary"
          }`}
        >
          <MessageSquarePlus className="size-4" />
        </button>
      </div>

      {hintOpen && (
        <div className="animate-fade-in mt-2 flex gap-2">
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
            className="field flex-1 text-xs"
          />
          <button
            type="button"
            onClick={() => void ask(hint.trim() || undefined)}
            disabled={busy}
            className="shrink-0 rounded-xl bg-accent px-3 text-xs font-semibold text-accent-foreground disabled:opacity-50"
          >
            Öner
          </button>
        </div>
      )}

      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="size-3.5 shrink-0" /> {error}
        </p>
      )}
    </label>
  );
}
