import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Sparkles,
  Smile,
  Coins,
  Briefcase,
  Activity,
  Loader2,
  Send,
  Target,
  RotateCcw,
  Wand2,
  Lock,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

import { StatBar } from "@/components/StatBar";
import {
  generateLifeEvent,
  type Character,
  type LifeStats,
  type LifeTurn,
} from "@/lib/life.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Yapay Zekâ Hayat Simülatörü — Her Seçim Yeni Bir Hayat" },
      {
        name: "description",
        content:
          "Bir karakter yarat, yapay zekâ anlatıcı hayat hikâyeni yazsın. Mutluluk, servet, kariyer ve stresi seçimlerinle dengele.",
      },
      { property: "og:title", content: "Yapay Zekâ Hayat Simülatörü" },
      {
        property: "og:description",
        content:
          "Yapay zekâ hayatını anlatır. Seçim yap, mutluluk, servet, kariyer ve stresin anında değişsin.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const START_STATS: LifeStats = { happiness: 60, wealth: 40, career: 45, stress: 30 };

type Entry = { turn: LifeTurn; chosen?: string };

function Index() {
  const generate = useServerFn(generateLifeEvent);
  const [character, setCharacter] = useState<Character | null>(null);
  const [stats, setStats] = useState<LifeStats>(START_STATS);
  const [deltas, setDeltas] = useState<Partial<LifeStats>>({});
  const [entries, setEntries] = useState<Entry[]>([]);
  const [age, setAge] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [custom, setCustom] = useState("");

  const [form, setForm] = useState({ age: "24", occupation: "", personality: "", goal: "" });

  const current = entries[entries.length - 1];

  async function run(char: Character, base: LifeStats, action?: string) {
    setLoading(true);
    setError(null);
    try {
      const turn = await generate({
        data: {
          character: { ...char, age: age || char.age },
          stats: base,
          history: entries
            .filter((e) => e.chosen)
            .map((e) => ({ event: e.turn.title, choice: e.chosen! })),
          action,
        },
      });
      setDeltas({
        happiness: turn.effects.happiness - base.happiness,
        wealth: turn.effects.wealth - base.wealth,
        career: turn.effects.career - base.career,
        stress: turn.effects.stress - base.stress,
      });
      setStats(turn.effects);
      setAge(turn.age);
      setEntries((prev) => [...prev, { turn }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bir şeyler ters gitti.");
    } finally {
      setLoading(false);
    }
  }

  function start(e: React.FormEvent) {
    e.preventDefault();
    const char: Character = {
      age: Number(form.age) || 24,
      occupation: form.occupation.trim() || "Barista",
      personality: form.personality.trim() || "Meraklı",
      goal: form.goal.trim() || "Anlam bulmak",
    };
    setCharacter(char);
    setAge(char.age);
    setStats(START_STATS);
    setEntries([]);
    void run(char, START_STATS);
  }

  function choose(action: string) {
    if (!character || loading || !action.trim()) return;
    setEntries((prev) =>
      prev.map((e, i) => (i === prev.length - 1 ? { ...e, chosen: action } : e)),
    );
    setCustom("");
    void run(character, stats, action);
  }

  function reset() {
    setCharacter(null);
    setEntries([]);
    setStats(START_STATS);
    setDeltas({});
    setError(null);
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:py-10">
        {/* Sidebar */}
        <aside className="panel h-fit w-full shrink-0 p-5 lg:sticky lg:top-8 lg:w-80">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h1 className="text-lg leading-tight font-bold">Hayat Simülatörü</h1>
              <p className="text-xs text-muted-foreground">Yapay zekâ anlatıcı</p>
            </div>
          </div>

          {character && (
            <div className="mb-6 rounded-xl border border-border bg-secondary/40 p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold">{character.occupation}</span>
                <span className="text-xs text-muted-foreground">{age} yaşında</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{character.personality}</p>
              <p className="mt-3 flex items-start gap-2 text-xs text-primary">
                <Target className="mt-0.5 size-3.5 shrink-0" />
                {character.goal}
              </p>
            </div>
          )}

          <div className="space-y-5">
            <StatBar label="Mutluluk" value={stats.happiness} icon={Smile} color="var(--happiness)" delta={deltas.happiness} />
            <StatBar label="Servet" value={stats.wealth} icon={Coins} color="var(--wealth)" delta={deltas.wealth} />
            <StatBar label="Kariyer" value={stats.career} icon={Briefcase} color="var(--career)" delta={deltas.career} />
            <StatBar label="Stres" value={stats.stress} icon={Activity} color="var(--stress)" delta={deltas.stress} />
          </div>

          {character && (
            <button
              onClick={reset}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary"
            >
              <RotateCcw className="size-4" /> Yeni hayat
            </button>
          )}
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          {!character ? (
            <section className="panel glow p-6 sm:p-10" style={{ backgroundImage: "var(--gradient-hero)" }}>
              <h2 className="text-3xl font-bold sm:text-4xl">Bu sefer kimsin?</h2>
              <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                Bir karakter oluştur; yapay zekâ anlatıcı hayatını karar kararlar yazsın.
              </p>
              <form onSubmit={start} className="mt-8 grid gap-4 sm:grid-cols-2">
                <Field label="Yaş">
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    className="field"
                  />
                </Field>
                <Field label="Meslek">
                  <input
                    value={form.occupation}
                    onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                    placeholder="Genç mimar"
                    className="field"
                  />
                </Field>
                <Field label="Kişilik">
                  <input
                    value={form.personality}
                    onChange={(e) => setForm({ ...form, personality: e.target.value })}
                    placeholder="Cesur, sıcakkanlı, inatçı"
                    className="field"
                  />
                </Field>
                <Field label="Nihai hedef">
                  <input
                    value={form.goal}
                    onChange={(e) => setForm({ ...form, goal: e.target.value })}
                    placeholder="Deniz kenarında bir ev"
                    className="field"
                  />
                </Field>
                <button
                  type="submit"
                  className="sm:col-span-2 mt-2 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-transform hover:scale-[1.01]"
                >
                  <Sparkles className="size-4" /> Hayata başla
                </button>
              </form>
            </section>
          ) : (
            <div className="space-y-4">
              {entries.map((entry, i) => {
                const last = i === entries.length - 1;
                const tone = OUTCOME[entry.turn.outcome];
                return (
                  <article
                    key={i}
                    className={`panel animate-fade-in relative overflow-hidden p-5 sm:p-6 ${last ? "glow" : "opacity-75"}`}
                  >
                    <span
                      className="absolute inset-y-0 left-0 w-1"
                      style={{ background: tone.color }}
                      aria-hidden
                    />
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full bg-secondary px-2.5 py-1 font-medium text-foreground">
                        {entry.turn.age} yaşında
                      </span>
                      {entry.turn.outcome !== "neutral" && (
                        <span
                          className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                          style={{
                            color: tone.color,
                            background: `color-mix(in oklab, ${tone.color} 15%, transparent)`,
                          }}
                        >
                          <tone.Icon className="size-3" /> {tone.label}
                        </span>
                      )}
                      {entry.turn.kind === "forced" && (
                        <span className="flex items-center gap-1 rounded-full bg-destructive/15 px-2.5 py-1 text-[11px] font-semibold text-destructive">
                          <Lock className="size-3" /> Seçim sende değil
                        </span>
                      )}
                      <span className="h-px flex-1 bg-border" />
                    </div>

                    {entry.turn.outcomeText && (
                      <p
                        className="mt-3 border-l-2 pl-3 text-sm italic"
                        style={{ borderColor: tone.color, color: tone.color }}
                      >
                        {entry.turn.outcomeText}
                      </p>
                    )}

                    <h2 className="mt-3 text-xl font-bold">{entry.turn.title}</h2>
                    <p className="mt-2 leading-relaxed text-muted-foreground">
                      {entry.turn.narrative}
                    </p>

                    {entry.chosen ? (
                      <p className="mt-4 rounded-xl border border-primary/25 bg-primary/10 px-4 py-2 text-sm text-primary">
                        Seçimin: {entry.chosen}
                      </p>
                    ) : entry.turn.kind === "forced" ? (
                      <button
                        disabled={loading}
                        onClick={() => choose(entry.turn.choices[0].label)}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/20 disabled:opacity-50"
                      >
                        {entry.turn.choices[0].label}
                        <ChevronRight className="size-4" />
                      </button>
                    ) : (
                      <div className="mt-5 space-y-2.5">
                        {entry.turn.choices.map((c, j) => (
                          <button
                            key={j}
                            disabled={loading}
                            onClick={() => choose(c.label)}
                            className="group flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3 text-left text-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-secondary disabled:opacity-50"
                          >
                            <span className="flex items-center gap-3">
                              <span className="grid size-6 shrink-0 place-items-center rounded-md bg-background/60 text-[11px] font-bold text-muted-foreground">
                                {j + 1}
                              </span>
                              {c.label}
                            </span>
                            {c.recommended && (
                              <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary/15 px-2 py-1 text-[11px] font-semibold text-primary">
                                <Wand2 className="size-3" /> YZ önerisi
                              </span>
                            )}
                          </button>
                        ))}

                        <div className="flex gap-2 pt-2">
                          <input
                            value={custom}
                            onChange={(e) => setCustom(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && choose(custom)}
                            placeholder="Ya da tamamen başka bir şey yap…"
                            className="field flex-1"
                            disabled={loading}
                          />
                          <button
                            onClick={() => choose(custom)}
                            disabled={loading || !custom.trim()}
                            className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40"
                          >
                            <Send className="size-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}

              {loading && (
                <div className="panel flex items-center gap-3 p-5 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  Anlatıcı sıradaki olayı yazıyor…
                </div>
              )}
              {error && (
                <div className="panel border-destructive/40 p-5 text-sm text-destructive">{error}</div>
              )}
            </div>

          )}
        </main>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}
