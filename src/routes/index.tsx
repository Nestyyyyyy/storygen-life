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
import { CharacterField } from "@/components/CharacterField";
import { DeltaChips } from "@/components/DeltaChips";
import {
  generateLifeEvent,
  suggestField,
  validateCharacter,
  type Character,
  type FieldIssues,
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

const GENDERS = ["Kadın", "Erkek", "Belirtmek istemiyorum"];

type Entry = { turn: LifeTurn; chosen?: string };

const OUTCOME: Record<
  LifeTurn["outcome"],
  { label: string; color: string; Icon: typeof TrendingUp }
> = {
  success: { label: "Başarı", color: "var(--wealth)", Icon: TrendingUp },
  partial: { label: "Yarım başarı", color: "var(--happiness)", Icon: Minus },
  failure: { label: "Başarısızlık", color: "var(--stress)", Icon: TrendingDown },
  neutral: { label: "Başlangıç", color: "var(--color-primary)", Icon: Sparkles },
};

function Index() {
  const generate = useServerFn(generateLifeEvent);
  const suggest = useServerFn(suggestField);
  const validate = useServerFn(validateCharacter);

  const [character, setCharacter] = useState<Character | null>(null);
  const [stats, setStats] = useState<LifeStats>(START_STATS);
  const [deltas, setDeltas] = useState<Partial<LifeStats>>({});
  const [entries, setEntries] = useState<Entry[]>([]);
  const [age, setAge] = useState(0);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [custom, setCustom] = useState("");
  const [issues, setIssues] = useState<FieldIssues>({});

  const [form, setForm] = useState({
    age: "24",
    gender: GENDERS[0],
    occupation: "",
    personality: "",
    goal: "",
  });

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
      setDeltas(turn.delta);
      setStats(turn.effects);
      setAge(turn.age);
      setEntries((prev) => [...prev, { turn }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bir şeyler ters gitti.");
    } finally {
      setLoading(false);
    }
  }

  async function askSuggestion(
    field: "occupation" | "personality" | "goal",
    hint?: string,
  ): Promise<string> {
    try {
      const res = await suggest({
        data: {
          field,
          hint,
          context: {
            age: Number(form.age) || undefined,
            gender: form.gender,
            occupation: form.occupation,
            personality: form.personality,
            goal: form.goal,
          },
        },
      });
      setIssues((prev) => ({ ...prev, [field]: undefined }));
      return res.value;
    } catch {
      setError("Öneri alınamadı, tekrar dene.");
      return "";
    }
  }

  async function start(e: React.FormEvent) {
    e.preventDefault();
    if (checking || loading) return;
    setChecking(true);
    setError(null);
    try {
      const check = await validate({
        data: {
          occupation: form.occupation.trim(),
          personality: form.personality.trim(),
          goal: form.goal.trim(),
        },
      });
      setIssues(check.issues);
      if (!check.ok) return;

      const char: Character = {
        age: Number(form.age) || 24,
        gender: form.gender,
        occupation: form.occupation.trim(),
        personality: form.personality.trim(),
        goal: form.goal.trim(),
      };
      setCharacter(char);
      setAge(char.age);
      setStats(START_STATS);
      setEntries([]);
      void run(char, START_STATS);
    } catch {
      setError("Kontrol edilemedi, tekrar dene.");
    } finally {
      setChecking(false);
    }
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
    setIssues({});
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
                <span className="text-xs text-muted-foreground">
                  {age} yaşında · {character.gender}
                </span>
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
                Kendin yaz ya da <Sparkles className="inline size-3.5 text-primary" /> düğmesine
                basıp yapay zekâdan öneri al. Ne istediğini biliyorsan konuşma balonuna dokun.
              </p>
              <form onSubmit={start} className="mt-8 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Yaş
                  </span>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    className="field"
                  />
                </label>

                <div>
                  <span className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Cinsiyet
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {GENDERS.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setForm({ ...form, gender: g })}
                        className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                          form.gender === g
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-border text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <CharacterField
                  label="Meslek"
                  value={form.occupation}
                  onChange={(v) => setForm({ ...form, occupation: v })}
                  error={issues.occupation}
                  onSuggest={(h) => askSuggestion("occupation", h)}
                  hintPlaceholder="Nasıl bir meslek istersin? Örn: denizle ilgili"
                />
                <CharacterField
                  label="Kişilik"
                  value={form.personality}
                  onChange={(v) => setForm({ ...form, personality: v })}
                  error={issues.personality}
                  onSuggest={(h) => askSuggestion("personality", h)}
                  hintPlaceholder="Nasıl bir kişilik istersin? Örn: biraz karanlık"
                />
                <div className="sm:col-span-2">
                  <CharacterField
                    label="Nihai hedef"
                    value={form.goal}
                    onChange={(v) => setForm({ ...form, goal: v })}
                    error={issues.goal}
                    onSuggest={(h) => askSuggestion("goal", h)}
                    hintPlaceholder="Nasıl bir hedef istersin? Örn: ailemle barışmak"
                  />
                </div>

                <button
                  type="submit"
                  disabled={checking}
                  className="sm:col-span-2 mt-2 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-transform hover:scale-[1.01] disabled:opacity-60"
                >
                  {checking ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Kontrol ediliyor…
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" /> Hayata başla
                    </>
                  )}
                </button>
              </form>
              {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
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

                    <DeltaChips delta={entry.turn.delta} stats={entry.turn.effects} />

                    <h2 className="mt-4 text-xl font-bold">{entry.turn.title}</h2>
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
