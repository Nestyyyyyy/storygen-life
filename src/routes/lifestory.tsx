import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
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
  Check,
  Fingerprint,
  BookOpen,
  ArrowLeft,
} from "lucide-react";

import { StatBar } from "@/components/StatBar";
import { CharacterField } from "@/components/CharacterField";
import { DeltaChips } from "@/components/DeltaChips";
import { MatureToggle } from "@/components/MatureToggle";
import { SaveMenu } from "@/components/SaveMenu";
import { autoSaveId, writeSave } from "@/lib/saves";
import {
  generateLifeEvent,
  suggestField,
  validateCharacter,
  type Character,
  type FieldIssues,
  type LifeStats,
  type LifeTurn,
} from "@/lib/life.functions";




export const Route = createFileRoute("/lifestory")({
  head: () => ({
    meta: [
      { title: "Yapay Zekâ Hayat Simülatörü — Her Seçim Yeni Bir Hayat" },
      {
        name: "description",
        content:
          "Bir karakter yarat, yapay zekâ anlatıcı hayat hikâyeni yazsın. Mutluluk, servet, kariyer ve stresi seçimlerinle dengele.",
      },
      { property: "og:title", content: "Yapay Zekâ Hayat Simülatörü — Her Seçim Yeni Bir Hayat" },
      {
        property: "og:description",
        content:
          "Bir karakter yarat, yapay zekâ anlatıcı hayat hikâyeni yazsın. Mutluluk, servet, kariyer ve stresi seçimlerinle dengele.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LifeStory,
});

const START_STATS: LifeStats = { happiness: 60, wealth: 40, career: 45, stress: 30 };

const GENDERS = ["Kadın", "Erkek", "Belirtmek istemiyorum"];

type Entry = { turn: LifeTurn; chosen?: string };

type LifeSave = {
  character: Character;
  stats: LifeStats;
  deltas: Partial<LifeStats>;
  entries: Entry[];
  facts: string[];
  age: number;
  mature: boolean;
};

const OUTCOME: Record<
  LifeTurn["outcome"],
  { label: string; color: string; Icon: typeof TrendingUp }
> = {
  success: { label: "Başarı", color: "var(--wealth)", Icon: TrendingUp },
  partial: { label: "Yarım başarı", color: "var(--happiness)", Icon: Minus },
  failure: { label: "Başarısızlık", color: "var(--stress)", Icon: TrendingDown },
  neutral: { label: "Başlangıç", color: "var(--color-primary)", Icon: Sparkles },
};

function LifeStory() {
  const generate = useServerFn(generateLifeEvent);
  const suggest = useServerFn(suggestField);
  const validate = useServerFn(validateCharacter);
  const suggestedRef = useRef<Record<string, string[]>>({});



  const [character, setCharacter] = useState<Character | null>(null);
  const [stats, setStats] = useState<LifeStats>(START_STATS);
  const [deltas, setDeltas] = useState<Partial<LifeStats>>({});
  const [entries, setEntries] = useState<Entry[]>([]);
  const [facts, setFacts] = useState<string[]>([]);
  const [age, setAge] = useState(0);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [custom, setCustom] = useState("");
  const [issues, setIssues] = useState<FieldIssues>({});
  const [mature, setMature] = useState(false);


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
          facts,
          mature,
          history: entries
            .filter((e) => e.chosen)
            .map((e) => ({
              event: e.turn.title,
              choice: e.chosen!,
              detail: [e.turn.outcomeText, e.turn.narrative].filter(Boolean).join(" "),
            })),
          action,
        },
      });
      setDeltas(turn.delta);
      setStats(turn.effects);
      setAge(turn.age);
      if (turn.facts.length)
        setFacts((prev) => Array.from(new Set([...prev, ...turn.facts])).slice(-60));
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
  ): Promise<{ value: string; source: "ai" | "local" }> {
    try {
      const res = await suggest({
        data: {
          field,
          hint,
          avoid: [...(suggestedRef.current[field] ?? [])].slice(-6),
          context: {
            age: Number(form.age) || undefined,
            gender: form.gender,
            occupation: form.occupation,
            personality: form.personality,
            goal: form.goal,
          },
        },
      });
      setError(null);
      setIssues((prev) => ({ ...prev, [field]: undefined }));
      suggestedRef.current[field] = [...(suggestedRef.current[field] ?? []), res.value].slice(-8);
      return res;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Öneri alınamadı, tekrar dene.");
      throw e;
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
      setFacts([]);
      void run(char, START_STATS);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kontrol edilemedi, tekrar dene.");
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
    setFacts([]);
    setStats(START_STATS);
    setDeltas({});
    setError(null);
    setIssues({});
  }

  const statsCard = (
    <section
      aria-labelledby="stats-heading"
      className="rounded-xl border border-border bg-secondary/30 p-4"
    >
      <h2 id="stats-heading" className="text-sm font-bold">
        {character ? "Güncel değerler" : "Başlangıç değerleri"}
      </h2>
      <p className="mt-1 mb-4 text-xs text-muted-foreground">
        Her değer 0–100 arasındadır. Seçimlerin bu değerleri artırır ya da düşürür; stres yükseldikçe
        işlerin ters gitme ihtimali artar.
      </p>
      <div className="space-y-5">
        <StatBar
          label="Mutluluk"
          value={stats.happiness}
          icon={Smile}
          color="var(--happiness)"
          delta={deltas.happiness}
        />
        <StatBar
          label="Servet"
          value={stats.wealth}
          icon={Coins}
          color="var(--wealth)"
          delta={deltas.wealth}
        />
        <StatBar
          label="Kariyer"
          value={stats.career}
          icon={Briefcase}
          color="var(--career)"
          delta={deltas.career}
        />
        <StatBar
          label="Stres"
          value={stats.stress}
          icon={Activity}
          color="var(--stress)"
          delta={deltas.stress}
        />
      </div>
    </section>
  );

  const sidebarHeader = (
    <div className="mb-6 flex items-center gap-3">
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/20 text-primary">
        <Sparkles className="size-5" aria-hidden />
      </div>
      <div className="min-w-0">
        <h1 className="truncate text-lg leading-tight font-bold">Hayat Simülatörü</h1>
        <p className="text-xs text-muted-foreground">Yapay zekâ anlatıcı</p>
      </div>
    </div>
  );

  // ---------- Onboarding ----------
  if (!character) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-4 md:p-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 lg:flex-row lg:items-stretch">
          <aside className="panel h-fit w-full shrink-0 p-5 lg:w-80">
            {sidebarHeader}
            {statsCard}
            <Link
              to="/"
              className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm text-foreground transition-colors hover:bg-secondary"
            >
              <ArrowLeft className="size-4" aria-hidden /> Ana sayfa
            </Link>
          </aside>

          <main className="min-w-0 flex-1">
            <section
              className="panel glow p-5 sm:p-8"
              style={{ backgroundImage: "var(--gradient-hero)" }}
            >
              <h2 className="text-2xl font-bold sm:text-3xl">Bu sefer kimsin?</h2>
              <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                Alanları kendin doldur ya da <strong className="text-foreground">AI ile öner</strong>{" "}
                düğmesine bas. Aklında belirli bir şey varsa{" "}
                <strong className="text-foreground">İpucu ver</strong> ile tarif et.
              </p>

              <form onSubmit={start} className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="age"
                    className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                  >
                    Yaş
                  </label>
                  <input
                    id="age"
                    type="number"
                    min={5}
                    max={100}
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    className="field"
                  />
                </div>

                <fieldset className="min-w-0">
                  <legend className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Cinsiyet
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {GENDERS.map((g) => {
                      const selected = form.gender === g;
                      return (
                        <label
                          key={g}
                          className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--color-ring)] ${
                            selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border text-foreground hover:bg-secondary"
                          }`}
                        >
                          <input
                            type="radio"
                            name="gender"
                            value={g}
                            checked={selected}
                            onChange={() => setForm({ ...form, gender: g })}
                            className="sr-only"
                          />
                          <span
                            aria-hidden
                            className={`grid size-4 shrink-0 place-items-center rounded-full border ${
                              selected
                                ? "border-primary-foreground bg-primary-foreground/20"
                                : "border-muted-foreground"
                            }`}
                          >
                            {selected && <Check className="size-3" />}
                          </span>
                          {g}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <MatureToggle
                  className="md:col-span-2"
                  value={mature}
                  onChange={setMature}
                />



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
                <CharacterField
                  className="md:col-span-2"
                  label="Nihai hedef"
                  value={form.goal}
                  onChange={(v) => setForm({ ...form, goal: v })}
                  error={issues.goal}
                  onSuggest={(h) => askSuggestion("goal", h)}
                  hintPlaceholder="Nasıl bir hedef istersin? Örn: ailemle barışmak"
                />

                <button
                  type="submit"
                  disabled={checking}
                  aria-busy={checking}
                  className="mt-1 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 font-semibold text-primary-foreground transition-transform hover:scale-[1.01] disabled:opacity-70 md:col-span-2"
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

              {error && (
                <p role="alert" className="mt-4 text-sm text-destructive">
                  {error}
                </p>
              )}
            </section>

            <Link
              to="/dedektif"
              className="panel mt-5 flex min-h-11 items-center justify-between gap-3 p-5 transition-colors hover:bg-secondary/50"
            >
              <span className="min-w-0">
                <span className="flex items-center gap-2 text-sm font-bold">
                  <Fingerprint className="size-4 shrink-0 text-primary" aria-hidden />
                  Dedektif modu
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  Bir suç seç, sorgu odasında karşına oturan dedektifi ikna et: ya serbest kalırsın
                  ya hapse girersin.
                </span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
            </Link>
          </main>
        </div>
      </div>
    );

  }

  // ---------- Game ----------
  return (
    <div className="min-h-dvh">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 p-4 md:p-8 lg:flex-row">
        <aside className="panel h-fit w-full shrink-0 p-5 lg:sticky lg:top-8 lg:w-80">
          {sidebarHeader}

          <div className="mb-5 rounded-xl border border-border bg-secondary/40 p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-sm font-semibold">{character.occupation}</span>
              <span className="text-xs text-muted-foreground">
                {age} yaşında · {character.gender}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{character.personality}</p>
            <p className="mt-3 flex items-start gap-2 text-xs text-primary">
              <Target className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              {character.goal}
            </p>
          </div>

          {statsCard}

          {facts.length > 0 && (
            <section
              aria-labelledby="facts-heading"
              className="mt-5 rounded-xl border border-border bg-secondary/30 p-4"
            >
              <h2
                id="facts-heading"
                className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
              >
                <BookOpen className="size-3.5 text-primary" aria-hidden /> Hayat defteri
              </h2>
              <ul className="mt-2.5 space-y-2">
                {facts.slice(-8).map((fct, i) => (
                  <li
                    key={i}
                    className="border-l-2 border-primary/40 pl-2.5 text-xs leading-relaxed text-muted-foreground"
                  >
                    {fct}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <button
            onClick={reset}
            className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm text-foreground transition-colors hover:bg-secondary"
          >
            <RotateCcw className="size-4" aria-hidden /> Yeni hayat
          </button>
          <Link
            to="/"
            className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm text-foreground transition-colors hover:bg-secondary"
          >
            <ArrowLeft className="size-4" aria-hidden /> Ana sayfa
          </Link>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="space-y-4">
            {entries.map((entry, i) => {
              const last = i === entries.length - 1;
              const tone = OUTCOME[entry.turn.outcome];
              return (
                <article
                  key={i}
                  className={`panel animate-fade-in relative overflow-hidden p-5 sm:p-6 ${last ? "glow" : "opacity-80"}`}
                >
                  <span
                    className="absolute inset-y-0 left-0 w-1"
                    style={{ background: tone.color }}
                    aria-hidden
                  />
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-primary/15 px-2.5 py-1 font-semibold text-primary">
                      Bölüm {i + 1}
                    </span>
                    <span className="rounded-full bg-secondary px-2.5 py-1 font-medium text-foreground">
                      {entry.turn.age} yaşında
                    </span>
                    {entry.turn.outcome !== "neutral" && (
                      <span
                        className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                        style={{
                          color: tone.color,
                          background: `color-mix(in oklab, ${tone.color} 18%, transparent)`,
                        }}
                      >
                        <tone.Icon className="size-3" aria-hidden /> {tone.label}
                      </span>
                    )}
                    {entry.turn.kind === "forced" && (
                      <span className="flex items-center gap-1 rounded-full bg-destructive/20 px-2.5 py-1 text-xs font-semibold text-destructive">
                        <Lock className="size-3" aria-hidden /> Seçim sende değil
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

                  {entry.turn.outcome !== "neutral" && (
                    <DeltaChips delta={entry.turn.delta} stats={entry.turn.effects} />
                  )}

                  <h2 className="mt-4 text-xl font-bold">{entry.turn.title}</h2>
                  <p className="mt-2 leading-relaxed text-muted-foreground">
                    {entry.turn.narrative}
                  </p>

                  {entry.chosen ? (
                    <p className="mt-4 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2 text-sm text-primary">
                      Seçimin: {entry.chosen}
                    </p>
                  ) : entry.turn.kind === "forced" ? (
                    <button
                      disabled={loading}
                      onClick={() => choose(entry.turn.choices[0].label)}
                      className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-destructive/60 bg-destructive/15 py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/25 disabled:opacity-60"
                    >
                      {entry.turn.choices[0].label}
                      <ChevronRight className="size-4" aria-hidden />
                    </button>
                  ) : (
                    <div className="mt-5 space-y-2.5">
                      {entry.turn.choices.map((c, j) => (
                        <button
                          key={j}
                          disabled={loading}
                          onClick={() => choose(c.label)}
                          className="group flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3 text-left text-sm transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:bg-secondary disabled:opacity-60"
                        >
                          <span className="flex items-center gap-3">
                            <span className="grid size-6 shrink-0 place-items-center rounded-md bg-background/70 text-xs font-bold text-foreground">
                              {j + 1}
                            </span>
                            {c.label}
                          </span>
                          {c.recommended && (
                            <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary/20 px-2 py-1 text-xs font-semibold text-primary">
                              <Wand2 className="size-3" aria-hidden /> YZ önerisi
                            </span>
                          )}
                        </button>
                      ))}

                      <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                        <label htmlFor="custom-action" className="sr-only">
                          Kendi eylemini yaz
                        </label>
                        <input
                          id="custom-action"
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
                          aria-label="Kendi eylemini gönder"
                          className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-50 sm:w-11 sm:px-0"
                        >
                          <Send className="size-4" aria-hidden />
                          <span className="sm:hidden">Gönder</span>
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}

            {loading && (
              <div
                role="status"
                className="panel flex items-center gap-3 p-5 text-sm text-muted-foreground"
              >
                <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
                Anlatıcı sıradaki olayı yazıyor…
              </div>
            )}
            {error && (
              <div role="alert" className="panel border-destructive/60 p-5 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
