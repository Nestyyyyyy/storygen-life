import { useState } from "react";
import { Check, ShieldAlert } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const MATURE_WARN_KEY = "hs-mature-warning-hidden";

function warnSkipped() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(MATURE_WARN_KEY) === "1";
  } catch {
    return false;
  }
}

function skipWarn() {
  try {
    window.localStorage.setItem(MATURE_WARN_KEY, "1");
  } catch {
    /* yoksay */
  }
}

type Props = {
  value: boolean;
  onChange: (v: boolean) => void;
  className?: string;
};

export function MatureToggle({ value, onChange, className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [dontShow, setDontShow] = useState(false);

  return (
    <div className={className}>
      <label
        className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--color-ring)] ${
          value ? "border-primary bg-primary/10" : "border-border hover:bg-secondary"
        }`}
      >
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => {
            if (!e.target.checked) {
              onChange(false);
              return;
            }
            if (warnSkipped()) onChange(true);
            else setOpen(true);
          }}
          className="sr-only"
        />
        <span
          aria-hidden
          className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border ${
            value ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"
          }`}
        >
          {value && <Check className="size-3.5" />}
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold">
            Yetişkin modu (18+)
            {value && (
              <span className="ml-2 rounded-md bg-primary px-1.5 py-0.5 text-[11px] font-bold text-primary-foreground">
                AÇIK
              </span>
            )}
          </span>
          <span className="mt-1 block text-xs text-muted-foreground">
            Hikâye yetişkin temalara girer: tutkulu ilişkiler, aldatma, alkol ve bağımlılık, kumar,
            borç, şiddet, suç, hastalık ve yas — sert bir dille, grafik tasvir olmadan anlatılır.
          </span>
        </span>
      </label>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldAlert className="size-5 shrink-0 text-destructive" aria-hidden />
              Yetişkin modu (18+) — okumadan geçme
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-left">
                <p>
                  Bu mod açıkken anlatıcı yetişkin bir romanın sınırlarında çalışır. Karşına şunlar
                  çıkabilir: tutkulu ilişkiler ve cinsellik (ima düzeyinde), aldatma ve ayrılık,
                  alkol, madde ve bağımlılık, kumar, borç ve tefeci baskısı, şiddet, suç ve polis,
                  ağır hastalık, ölüm ve yas. Dil sert olabilir, yerine göre küfür geçer.
                </p>
                <p>
                  Sınırlar sabit: pornografik/grafik cinsel tasvir, reşit olmayanların
                  cinselleştirilmesi, cinsel şiddetin yüceltilmesi, nefret söylemi ve gerçek hayatta
                  uygulanabilir suç talimatı hiçbir modda üretilmez.
                </p>
                <p>
                  Her şey kurgudur; gerçek kişi, olay veya tavsiye değildir. Anlatılanlar zorlayıcı
                  gelirse modu kapatabilir ya da sekmeyi kapatabilirsin. Zor bir dönemden
                  geçiyorsan bu modu açmamanı öneririm.
                </p>
                <p className="font-semibold text-foreground">
                  Devam etmek için 18 yaşından büyük olmalısın.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border p-3 text-sm focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--color-ring)]">
            <input
              type="checkbox"
              checked={dontShow}
              onChange={(e) => setDontShow(e.target.checked)}
              className="sr-only"
            />
            <span
              aria-hidden
              className={`grid size-5 shrink-0 place-items-center rounded-md border ${
                dontShow
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground"
              }`}
            >
              {dontShow && <Check className="size-3.5" />}
            </span>
            Bu uyarıyı bir daha gösterme
          </label>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDontShow(false)}>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (dontShow) skipWarn();
                onChange(true);
              }}
            >
              18 yaşımı doldurdum, kabul ediyorum
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
