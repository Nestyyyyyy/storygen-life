import { useEffect, useState } from "react";
import { Check, Download, Loader2, Save, Trash2, Zap } from "lucide-react";

import {
  autoSaveId,
  deleteSave,
  formatSaveTime,
  listSaves,
  writeSave,
  type SaveMode,
  type SaveSlot,
} from "@/lib/saves";

type Props<T> = {
  mode: SaveMode;
  /** Oyun içinde mi? Kayıt oluşturma sadece oyun sürerken açık olur. */
  canSave?: boolean;
  /** Kaydedilecek anlık durumu üretir. */
  snapshot?: () => { name: string; summary: string; data: T };
  onLoad: (data: T) => void;
  className?: string;
};

export function SaveMenu<T>({
  mode,
  canSave = false,
  snapshot,
  onLoad,
  className = "",
}: Props<T>) {
  const [slots, setSlots] = useState<SaveSlot<T>[]>([]);
  const [justSaved, setJustSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSlots(listSaves<T>(mode));
  }, [mode]);

  function refresh() {
    setSlots(listSaves<T>(mode));
  }

  function save() {
    if (!snapshot) return;
    setBusy(true);
    const snap = snapshot();
    writeSave({ mode, name: snap.name, summary: snap.summary, data: snap.data });
    refresh();
    setBusy(false);
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 1800);
  }

  return (
    <section aria-labelledby={`saves-${mode}`} className={`rounded-xl border border-border bg-secondary/30 p-4 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <h2
          id={`saves-${mode}`}
          className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
        >
          <Save className="size-3.5 text-primary" aria-hidden /> Kayıtlar
        </h2>
        <span className="text-[11px] text-muted-foreground">{slots.length} kayıt</span>
      </div>

      {canSave && (
        <button
          onClick={save}
          disabled={busy}
          className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01] disabled:opacity-60"
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : justSaved ? (
            <Check className="size-4" aria-hidden />
          ) : (
            <Save className="size-4" aria-hidden />
          )}
          {justSaved ? "Kaydedildi" : "Oyunu kaydet"}
        </button>
      )}

      {slots.length === 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Henüz kayıt yok. Oyun sırasında “Oyunu kaydet”e basarsan buradan kaldığın yerden devam
          edebilirsin; ayrıca her tur otomatik kayıt alınır.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {slots.map((s) => (
            <li
              key={s.id}
              className="rounded-xl border border-border bg-background/40 p-3 transition-colors hover:border-primary/50"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
                    {s.id === autoSaveId(mode) && (
                      <Zap className="size-3.5 shrink-0 text-primary" aria-hidden />
                    )}
                    {s.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{s.summary}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {formatSaveTime(s.updatedAt)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    deleteSave(s.id);
                    refresh();
                  }}
                  aria-label={`${s.name} kaydını sil`}
                  className="grid size-11 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-destructive/60 hover:text-destructive"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
              <button
                onClick={() => onLoad(s.data)}
                className="mt-2.5 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-primary/50 bg-primary/10 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
              >
                <Download className="size-4" aria-hidden /> Yükle
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
