import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Heart,
  Handshake,
  Flame,
  Sparkles,
  Send,
  Loader2,
  RotateCcw,
  Swords,
  Wand2,
  KeyRound,
  Compass,
  Lightbulb,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { DifficultySelect } from "@/components/DifficultySelect";
import { EngineBadge } from "@/components/EngineBadge";
import { MatureToggle } from "@/components/MatureToggle";
import { StatBar } from "@/components/StatBar";
import {
  GENRES,
  START_METERS,
  type Companion,
  type CompanionEvent,
  type CompanionMeters,
  type Genre,
} from "@/lib/companion-types";
import { companionTurn, createCompanion } from "@/lib/companion.functions";
import type { Difficulty } from "@/lib/difficulty";

export const Route = createFileRoute("/karakter")({
  head: () => ({
    meta: [
      { title: "Karakter Modu — Bir Karakterle Sohbet Et ve Maceraya Çık" },
      {
        name: "description",
        content:
          "Kendi yol arkadaşını yarat, onunla sohbet et; doğaüstü güçler edin, savaşlara gir, sırları çöz. Bağ, güven, güç ve tehlike her cümlede değişir.",
      },
      { property: "og:title", content: "Karakter Modu — Bir Karakterle Sohbet Et ve Maceraya Çık" },
      {
        property: "og:description",
        content:
          "Fantastik, bilim kurgu, dram ya da gizem: bir karakterle konuş, birlikte maceraya çık, her cümlen hikâyeyi değiştirsin.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CharacterMode,
});

type Msg = {
  id: string;
  role: "user" | "companion";
  text: string;
  action?: string;
  event?: CompanionEvent;
  delta?: CompanionMeters;
  engine?: "ai" | "local";
};

type Session = {
  companion: Companion;
  meters: CompanionMeters;
  messages: Msg[];
  facts: string[];
  suggestions: string[];
  mature: boolean;
  difficulty: Difficulty;
  engine: "ai" | "local";
};

const KEY = "sg-companion-v1";
const uid = () => Math.random().toString(36).slice(2, 10);

const METER_META = [
  { key: "bond", label: "Bağ", icon: Heart, color: "var(--happiness)" },
  { key: "trust", label: "Güven", icon: Handshake, color: "var(--career)" },
  { key: "power", label: "Güç", icon: Zap, color: "var(--wealth)" },
  { key: "danger", label: "Tehlike", icon: Flame, color: "var(--stress)" },
] as const;

const EVENT_ICON = { savaş: Swords, güç: Wand2, sır: KeyRound, yol: Compass };

function load(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function CharacterMode() {
  const [session, setSession] = useState<Session | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [genre, setGenre] = useState<Genre>("fantastik");
  const [hint, setHint] = useState("");
  const [mature, setMature] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const saved = load();
    if (saved) {
      setSession(saved);
      setGenre(saved.companion.genre);
      setMature(saved.mature);
      setDifficulty(saved.difficulty);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (session) window.localStorage.setItem(KEY, JSON.stringify(session));
      else window.localStorage.removeItem(KEY);
    } catch {
      /* kota dolu olabilir */
    }
  }, [session, hydrated]);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: "smooth" });
  }, [session?.messages.length, busy]);

  useEffect(() => {
    if (session && !busy) inputRef.current?.focus();
  }, [session, busy]);

  const start = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await createCompanion({
        data: { genre, mature, ...(hint.trim() ? { hint: hint.trim() } : {}) },
      });
      setSession({
        companion: res.companion,
        meters: { ...START_METERS },
        messages: [
          {
            id: uid(),
            role: "companion",
            text: res.opening,
            action: "Açılış sahnesi",
            engine: res.engine,
          },
        ],
        facts: [],
        suggestions: res.suggestions,
        mature,
        difficulty,
        engine: res.engine,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Macera başlatılamadı.");
    } finally {
      setBusy(false);
    }
  }, [genre, hint, mature, difficulty]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!session || busy || !trimmed) return;
      setError(null);
      setInput("");
      const optimistic: Msg = { id: uid(), role: "user", text: trimmed };
      const base = { ...session, messages: [...session.messages, optimistic] };
      setSession(base);
      setBusy(true);
      try {
        const res = await companionTurn({
          data: {
            companion: session.companion,
            meters: session.meters,
            history: session.messages.map((m) => ({ role: m.role, text: m.text })),
            facts: session.facts,
            action: trimmed,
            mature,
            difficulty,
          },
        });
        setSession({
          ...base,
          meters: res.meters,
          facts: res.facts,
          suggestions: res.suggestions.length ? res.suggestions : base.suggestions,
          engine: res.engine,
          mature,
          difficulty,
          messages: [
            ...base.messages,
            {
              id: uid(),
              role: "companion",
              text: res.reply,
              action: res.action,
              delta: res.delta,
              engine: res.engine,
              ...(res.event ? { event: res.event } : {}),
            },
          ],
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Karakter cevap veremedi, tekrar dene.");
      } finally {
        setBusy(false);
      }
    },
    [session, busy, mature, difficulty],
  );

  // --- Kurulum ekranı ---
  if (!session) {
    return (
      <main className="min-h-dvh px-4 py-10 md:px-8">
        <div className="mx-auto w-full max-w-3xl">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden /> Ana sayfa
          </Link>

          <header className="mt-4 text-center">
            <div className="glow mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-primary/20 text-primary">
              <Sparkles className="size-7" aria-hidden />
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Karakter Modu</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Kendi yol arkadaşını yarat ve onunla konuş. Doğaüstü güçler edin, savaşlara gir,
              sırları çöz — söylediğin her cümle aranızdaki bağı ve sahnedeki tehlikeyi değiştirir.
            </p>
          </header>

          <section className="panel mt-8 p-5 sm:p-6">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              Macera türü
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {GENRES.map((g) => {
                const on = g.id === genre;
                return (
                  <button
                    key={g.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setGenre(g.id)}
                    className={`rounded-xl border p-4 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                      on
                        ? "border-primary bg-primary/10"
                        : "border-border bg-secondary/30 hover:border-primary/40"
                    }`}
                  >
                    <p className={`text-sm font-bold ${on ? "text-primary" : ""}`}>{g.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{g.blurb}</p>
                    <p className="mt-2 text-[11px] text-muted-foreground/80">{g.hint}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-5">
              <label
                htmlFor="companion-hint"
                className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase"
              >
                İstersen bir fikir ver (opsiyonel)
              </label>
              <input
                id="companion-hint"
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                placeholder="ör. gölgeleri kullanabilen inatçı bir kadın savaşçı"
                className="field w-full"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Boş bırakırsan karakteri ve dünyayı tamamen anlatı motoru kurar.
              </p>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <DifficultySelect value={difficulty} onChange={setDifficulty} />
              <MatureToggle value={mature} onChange={setMature} className="sm:self-end" />
            </div>

            {error && (
              <p className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden /> {error}
              </p>
            )}

            <button
              type="button"
              onClick={() => void start()}
              disabled={busy}
              className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Sparkles className="size-4" aria-hidden />
              )}
              {busy ? "Karakterin yaratılıyor…" : "Karakterini yarat ve sohbete başla"}
            </button>
          </section>
        </div>
      </main>
    );
  }

  const { companion, meters, messages, suggestions } = session;

  return (
    <main className="min-h-dvh px-4 py-6 md:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[300px_1fr]">
        {/* Yan panel */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden /> Ana sayfa
          </Link>

          <div className="panel mt-3 p-5">
            <div className="flex items-start gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/20 text-primary">
                <Sparkles className="size-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold">{companion.name}</h1>
                <p className="text-xs text-muted-foreground">{companion.title}</p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {companion.persona}
            </p>
            <dl className="mt-3 space-y-2 text-xs">
              <div>
                <dt className="font-semibold text-foreground">Dünya</dt>
                <dd className="text-muted-foreground">{companion.world}</dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">Ortak hedef</dt>
                <dd className="text-muted-foreground">{companion.quest}</dd>
              </div>
            </dl>
            <EngineBadge engine={session.engine} className="mt-4" />
          </div>

          <div className="panel mt-4 p-5">
            <h2 className="mb-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Durum
            </h2>
            <div className="space-y-4">
              {METER_META.map(({ key, label, icon, color }) => (
                <StatBar key={key} label={label} value={meters[key]} icon={icon} color={color} />
              ))}
            </div>
          </div>

          <div className="panel mt-4 p-5">
            <DifficultySelect value={difficulty} onChange={setDifficulty} disabled={busy} />
            <MatureToggle value={mature} onChange={setMature} className="mt-4" />
            <button
              type="button"
              onClick={() => {
                setSession(null);
                setInput("");
                setError(null);
              }}
              className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm font-semibold hover:bg-secondary"
            >
              <RotateCcw className="size-4" aria-hidden /> Yeni macera
            </button>
            {session.facts.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Hikâye defteri
                </h3>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {session.facts.slice(-8).map((f) => (
                    <li key={f} className="flex gap-1.5">
                      <span className="text-primary">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>

        {/* Sohbet */}
        <section className="flex flex-col">
          <div
            ref={boxRef}
            className="panel max-h-[68dvh] min-h-[42dvh] space-y-5 overflow-y-auto p-4 sm:p-6"
            aria-live="polite"
          >
            {messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="flex justify-end">
                  <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm leading-relaxed font-medium text-primary-foreground">
                    {m.text}
                  </p>
                </div>
              ) : (
                <article key={m.id} className="max-w-[95%]">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-primary">{companion.name}</span>
                    {m.action && (
                      <span className="rounded-full border border-border bg-secondary/50 px-2 py-0.5 text-[11px] text-muted-foreground">
                        {m.action}
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">
                    {m.text}
                  </p>
                  {m.event && (
                    <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-primary/40 bg-primary/10 p-3">
                      {(() => {
                        const Icon = EVENT_ICON[m.event.kind];
                        return <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />;
                      })()}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-primary">
                          {m.event.kind.toLocaleUpperCase("tr")} — {m.event.label}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {m.event.text}
                        </p>
                      </div>
                    </div>
                  )}
                  {m.delta && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {METER_META.map(({ key, label, icon: Icon, color }) => {
                        const d = m.delta![key];
                        const good = key === "danger" ? d < 0 : d > 0;
                        const tone =
                          d === 0
                            ? "var(--color-muted-foreground)"
                            : good
                              ? "var(--wealth)"
                              : "var(--stress)";
                        return (
                          <span
                            key={key}
                            className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-2.5 py-1 text-[11px] tabular-nums"
                          >
                            <Icon className="size-3" style={{ color }} aria-hidden />
                            <span className="text-muted-foreground">{label}</span>
                            <span className="font-bold" style={{ color: tone }}>
                              {d > 0 ? `+${d}` : d}
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </article>
              ),
            )}

            {busy && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {companion.name} düşünüyor…
              </p>
            )}
          </div>

          {error && (
            <p className="mt-3 flex items-start gap-2 rounded-xl border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden /> {error}
            </p>
          )}

          {suggestions.length > 0 && !busy && (
            <div className="mt-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Lightbulb className="size-3.5 text-primary" aria-hidden /> Ne diyebilirsin?
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void send(s)}
                    className="min-h-9 rounded-full border border-primary/50 bg-primary/10 px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="panel mt-3 flex items-end gap-2 p-2.5"
          >
            <label htmlFor="companion-input" className="sr-only">
              {companion.name}&apos;e ne söyleyeceksin?
            </label>
            <textarea
              id="companion-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              rows={2}
              placeholder={`${companion.name}'e bir şey söyle ya da bir hamle yap…`}
              className="field max-h-40 min-h-11 flex-1 resize-y py-2.5"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Gönder"
              className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Send className="size-4" aria-hidden />
              )}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
