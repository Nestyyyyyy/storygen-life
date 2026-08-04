import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  ChevronRight,
  Eye,
  Fingerprint,
  Handshake,
  Heart,
  Loader2,
  Lock,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Check,
  StickyNote,
} from "lucide-react";

import { StatBar } from "@/components/StatBar";
import { CharacterField } from "@/components/CharacterField";
import { EngineBadge } from "@/components/EngineBadge";
import { DifficultySelect } from "@/components/DifficultySelect";
import { type Difficulty } from "@/lib/difficulty";
import { MatureToggle } from "@/components/MatureToggle";
import { SaveMenu } from "@/components/SaveMenu";
import { autoSaveId, writeSave } from "@/lib/saves";
import {
  interrogate,
  suggestCrime,
  type InterrogationTurn,
} from "@/lib/interrogation.functions";

export const Route = createFileRoute("/dedektif")({
  head: () => ({
    meta: [
      { title: "Dedektif Modu — Sorgu Odasında Hayatını Savun" },
      {
        name: "description",
        content:
          "Bir suç seç, sorgu odasında karşına oturan dedektifi ikna et. Flört, şüphe ve anlayış barlarını yönet: ya serbest kalırsın ya hapse girersin.",
      },
      { property: "og:title", content: "Dedektif Modu — Sorgu Odasında Hayatını Savun" },
      {
        property: "og:description",
        content:
          "Suçunu seç ya da yapay zekâya seçtir, sonra sorguda her cümlenle şüpheyi düşürmeye çalış.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Detective,
});

const GENDERS = ["Kadın", "Erkek", "Belirtmek istemiyorum"];

const KIND_STYLE: Record<string, { label: string; color: string }> = {
  yalan: { label: "Yalan", color: "var(--stress)" },
  doğru: { label: "Dürüst", color: "var(--wealth)" },
  flört: { label: "Flört", color: "var(--happiness)" },
  duygu: { label: "Duygusal", color: "var(--career)" },
  sessiz: { label: "Sessizlik", color: "var(--color-muted-foreground)" },
  serbest: { label: "Serbest", color: "var(--color-primary)" },
};

const START_METERS = { flirt: 10, suspicion: 45, empathy: 15 };

type Line = { turn: InterrogationTurn; answer?: string };

type DetectiveSave = {
  crime: string;
  name: string;
  gender: string;
  mature: boolean;
  lines: Line[];
  meters: typeof START_METERS;
  delta: Partial<typeof START_METERS>;
  facts: string[];
};

function Detective() {
  const ask = useServerFn(interrogate);
  const suggest = useServerFn(suggestCrime);
  const suggestedRef = useRef<string[]>([]);

  const [started, setStarted] = useState(false);
  const [crime, setCrime] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState(GENDERS[0]);
  const [mature, setMature] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [engine, setEngine] = useState<"ai" | "local" | null>(null);

  const [lines, setLines] = useState<Line[]>([]);
  const [meters, setMeters] = useState(START_METERS);
  const [delta, setDelta] = useState<Partial<typeof START_METERS>>({});
  const [facts, setFacts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [custom, setCustom] = useState("");

  const lastTurn = lines.at(-1)?.turn;
  const finished = lastTurn && lastTurn.status !== "ongoing";

  async function step(answer?: string, answerKind: string = "serbest") {
    setLoading(true);
    setError(null);
    try {
      const turn = await ask({
        data: {
          crime: crime.trim(),
          playerGender: gender,
          playerName: name.trim(),
          mature,
          difficulty,
          interrogator: lastTurn?.interrogator ?? null,
          meters,
          turnNo: lines.length,
          answer,
          answerKind: answerKind as
            | "yalan"
            | "doğru"
            | "flört"
            | "duygu"
            | "sessiz"
            | "serbest",
          facts,
          history: lines
            .filter((l) => l.answer)
            .map((l) => ({ question: l.turn.question, answer: l.answer! })),
        },
      });
      setMeters(turn.meters);
      setDelta(turn.delta);
      if (turn.facts.length)
        setFacts((prev) => Array.from(new Set([...prev, ...turn.facts])).slice(-60));
      setLines((prev) => [...prev, { turn }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sorgu sürdürülemedi.");
    } finally {
      setLoading(false);
    }
  }

  function answerWith(label: string, kind: string) {
    if (loading || !label.trim() || finished) return;
    setLines((prev) => prev.map((l, i) => (i === prev.length - 1 ? { ...l, answer: label } : l)));
    setCustom("");
    void step(label, kind);
  }

  async function startCase(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    if (crime.trim().length < 2) {
      setError("Önce bir suç seç ya da yapay zekâya seçtir.");
      return;
    }
    setStarted(true);
    setLines([]);
    setFacts([]);
    setMeters(START_METERS);
    setDelta({});
    void step();
  }

  function reset() {
    setStarted(false);
    setLines([]);
    setFacts([]);
    setMeters(START_METERS);
    setDelta({});
    setError(null);
  }

  function snapshot(): { name: string; summary: string; data: DetectiveSave } {
    return {
      name: crime.trim().slice(0, 40) || "Dosya",
      summary: `${lines.length}. tur · Şüphe ${meters.suspicion} · Flört ${meters.flirt}`,
      data: { crime, name, gender, mature, lines, meters, delta, facts },
    };
  }

  function applySave(data: DetectiveSave) {
    setCrime(data.crime ?? "");
    setName(data.name ?? "");
    setGender(data.gender ?? GENDERS[0]);
    setMature(Boolean(data.mature));
    setLines(data.lines ?? []);
    setMeters(data.meters ?? START_METERS);
    setDelta(data.delta ?? {});
    setFacts(data.facts ?? []);
    setError(null);
    setStarted(true);
  }

  // Her tur otomatik kayıt
  useEffect(() => {
    if (!started || lines.length === 0 || loading) return;
    const snap = snapshot();
    writeSave<DetectiveSave>({
      id: autoSaveId("detective"),
      mode: "detective",
      name: `Otomatik kayıt · ${snap.name}`,
      summary: snap.summary,
      data: snap.data,
      auto: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines, loading, started]);


  const metersCard = (
    <section
      aria-labelledby="meters-heading"
      className="rounded-xl border border-border bg-secondary/30 p-4"
    >
      <h2 id="meters-heading" className="text-sm font-bold">
        Sorgu masası
      </h2>
      <p className="mt-1 mb-4 text-xs text-muted-foreground">
        Her değer 0–100 arası. <strong className="text-foreground">Şüphe</strong> 100'e ulaşırsa
        tutuklanırsın; düşük tutup birkaç tur dayanırsan serbest kalırsın. Flört ve anlayış şüpheyi
        düşürür ama tuttuğu garanti değil — geri teperse şüphe fırlar.
      </p>
      <div className="space-y-5">
        <StatBar
          label="Şüphe"
          value={meters.suspicion}
          icon={Eye}
          color="var(--stress)"
          delta={delta.suspicion}
        />
        <StatBar
          label="Flört"
          value={meters.flirt}
          icon={Heart}
          color="var(--happiness)"
          delta={delta.flirt}
        />
        <StatBar
          label="Anlayış"
          value={meters.empathy}
          icon={Handshake}
          color="var(--career)"
          delta={delta.empathy}
        />
      </div>
    </section>
  );

  const header = (
    <div className="mb-6 flex items-center gap-3">
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/20 text-primary">
        <Fingerprint className="size-5" aria-hidden />
      </div>
      <div className="min-w-0">
        <h1 className="truncate text-lg leading-tight font-bold">Dedektif Modu</h1>
        <p className="text-xs text-muted-foreground">Sorgu odası simülasyonu</p>
      </div>
    </div>
  );

  // ---------- Dosya kurulumu ----------
  if (!started) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-4 md:p-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 lg:flex-row lg:items-stretch">
          <aside className="panel h-fit w-full shrink-0 p-5 lg:w-80">
            {header}
            {metersCard}
            <SaveMenu<DetectiveSave> className="mt-5" mode="detective" onLoad={applySave} />
            <Link
              to="/"
              className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm transition-colors hover:bg-secondary"
            >
              <ArrowLeft className="size-4" aria-hidden /> Ana sayfa
            </Link>
            <Link
              to="/lifestory"
              className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm transition-colors hover:bg-secondary"
            >
              <Sparkles className="size-4" aria-hidden /> Hayat Simülatörü
            </Link>
          </aside>

          <main className="min-w-0 flex-1">
            <section
              className="panel glow p-5 sm:p-8"
              style={{ backgroundImage: "var(--gradient-hero)" }}
            >
              <h2 className="text-2xl font-bold sm:text-3xl">Ne yaptın?</h2>
              <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                Suçu kendin yaz ya da <strong className="text-foreground">AI ile öner</strong>{" "}
                düğmesine bas. Sonra seni bulup sorguya alıyorlar: karşındaki kişiyi okumak ve
                doğru anda doğru cümleyi söylemek sana kalıyor.
              </p>

              <form onSubmit={startCase} className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="min-w-0">
                  <label
                    htmlFor="susp-name"
                    className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                  >
                    Adın (isteğe bağlı)
                  </label>
                  <input
                    id="susp-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="field w-full"
                    placeholder="Örn: Selin"
                  />
                </div>

                <fieldset className="min-w-0">
                  <legend className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Cinsiyet
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {GENDERS.map((g) => {
                      const selected = gender === g;
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
                            name="susp-gender"
                            value={g}
                            checked={selected}
                            onChange={() => setGender(g)}
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

                <CharacterField
                  className="md:col-span-2"
                  label="İşlediğin suç"
                  value={crime}
                  onChange={setCrime}
                  onSuggest={async (hint) => {
                    const res = await suggest({
                      data: { hint, avoid: suggestedRef.current.slice(-6) },
                    });
                    suggestedRef.current = [...suggestedRef.current, res.value].slice(-8);
                    return res;
                  }}
                  hintPlaceholder="Nasıl bir suç istersin? Örn: parayla ilgili"
                />

                <DifficultySelect
                  className="md:col-span-2"
                  value={difficulty}
                  onChange={setDifficulty}
                />
                <MatureToggle className="md:col-span-2" value={mature} onChange={setMature} />

                <button
                  type="submit"
                  disabled={loading}
                  aria-busy={loading}
                  className="mt-1 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 font-semibold text-primary-foreground transition-transform hover:scale-[1.01] disabled:opacity-70 md:col-span-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Dosya açılıyor…
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" /> Sorguya gir
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
          </main>
        </div>
      </div>
    );
  }

  // ---------- Sorgu ----------
  const cop = lastTurn?.interrogator;

  const hudItems = [
    { label: "Şüphe", value: meters.suspicion, color: "var(--stress)" },
    { label: "Flört", value: meters.flirt, color: "var(--happiness)" },
    { label: "Anlayış", value: meters.empathy, color: "var(--career)" },
  ];

  return (
    <div className="min-h-dvh">
      <div className="hud lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto">
          <span className="chip shrink-0 bg-primary/15 text-primary">{lines.length}. tur</span>
          {hudItems.map((h) => (
            <span
              key={h.label}
              className="chip shrink-0"
              style={{
                color: h.color,
                background: `color-mix(in oklab, ${h.color} 16%, transparent)`,
              }}
            >
              {h.label} {h.value}
            </span>
          ))}
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-5 p-4 md:p-8 lg:flex-row">

        <aside className="panel h-fit w-full shrink-0 p-5 lg:sticky lg:top-8 lg:w-80">
          {header}

          <div className="mb-5 rounded-xl border border-border bg-secondary/40 p-4">
            <p className="text-xs tracking-wide text-muted-foreground uppercase">Dosya</p>
            <p className="mt-1 text-sm font-semibold">{crime}</p>
            {cop && (
              <>
                <p className="mt-3 text-xs tracking-wide text-muted-foreground uppercase">
                  Karşındaki
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {cop.name}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    · {cop.rank} · {cop.gender}
                  </span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{cop.style}</p>
              </>
            )}
          </div>

          {metersCard}

          {facts.length > 0 && (
            <section
              aria-labelledby="case-notes-heading"
              className="mt-5 rounded-xl border border-border bg-secondary/30 p-4"
            >
              <h2
                id="case-notes-heading"
                className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
              >
                <StickyNote className="size-3.5 text-primary" aria-hidden /> Dosya notları
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

          <SaveMenu<DetectiveSave>
            className="mt-5"
            mode="detective"
            canSave={lines.length > 0}
            snapshot={snapshot}
            onLoad={applySave}
          />

          <button
            onClick={reset}
            className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm transition-colors hover:bg-secondary"
          >
            <RotateCcw className="size-4" aria-hidden /> Yeni dosya
          </button>
          <Link
            to="/"
            className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm transition-colors hover:bg-secondary"
          >
            <ArrowLeft className="size-4" aria-hidden /> Ana sayfa
          </Link>
        </aside>

        <main className="min-w-0 flex-1 space-y-4">
          {lines.map((line, i) => {
            const last = i === lines.length - 1;
            const t = line.turn;
            return (
              <article
                key={i}
                className={`panel animate-fade-in relative overflow-hidden p-5 sm:p-6 ${
                  last ? "glow" : "opacity-80"
                }`}
              >
                <span
                  className="absolute inset-y-0 left-0 w-1"
                  style={{
                    background:
                      t.status === "jailed"
                        ? "var(--stress)"
                        : t.status === "freed"
                          ? "var(--wealth)"
                          : "var(--color-primary)",
                  }}
                  aria-hidden
                />

                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-secondary px-2.5 py-1 font-medium text-foreground">
                    {i + 1}. tur
                  </span>
                  {t.status === "jailed" && (
                    <span className="flex items-center gap-1 rounded-full bg-destructive/20 px-2.5 py-1 font-semibold text-destructive">
                      <Lock className="size-3" aria-hidden /> Tutuklandın
                    </span>
                  )}
                  {t.status === "freed" && (
                    <span
                      className="flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold"
                      style={{
                        color: "var(--wealth)",
                        background: "color-mix(in oklab, var(--wealth) 18%, transparent)",
                      }}
                    >
                      <ShieldCheck className="size-3" aria-hidden /> Serbest kaldın
                    </span>
                  )}
                  <span className="h-px flex-1 bg-border" />
                </div>

                {t.reaction && (
                  <p className="mt-3 border-l-2 border-border pl-3 text-sm italic text-muted-foreground">
                    {t.reaction}
                  </p>
                )}

                {t.question && (
                  <p className="mt-4 text-lg leading-relaxed font-semibold">“{t.question}”</p>
                )}

                {t.verdictText && (
                  <p
                    className="mt-4 rounded-xl border p-4 text-sm"
                    style={{
                      borderColor: t.status === "jailed" ? "var(--stress)" : "var(--wealth)",
                      color: t.status === "jailed" ? "var(--stress)" : "var(--wealth)",
                    }}
                  >
                    {t.verdictText}
                  </p>
                )}

                {line.answer ? (
                  <p className="mt-4 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2 text-sm text-primary">
                    Cevabın: {line.answer}
                  </p>
                ) : (
                  t.status === "ongoing" && (
                    <div className="mt-5 space-y-2.5">
                      {t.options.map((o, j) => {
                        const ks = KIND_STYLE[o.kind] ?? KIND_STYLE.serbest;
                        return (
                          <button
                            key={j}
                            disabled={loading}
                            onClick={() => answerWith(o.label, o.kind)}
                            className="group flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3 text-left text-sm transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:bg-secondary disabled:opacity-60"
                          >
                            <span className="flex items-center gap-3">
                              <span className="grid size-6 shrink-0 place-items-center rounded-md bg-background/70 text-xs font-bold">
                                {j + 1}
                              </span>
                              {o.label}
                            </span>
                            <span
                              className="shrink-0 rounded-full px-2 py-1 text-xs font-semibold"
                              style={{
                                color: ks.color,
                                background: `color-mix(in oklab, ${ks.color} 18%, transparent)`,
                              }}
                            >
                              {ks.label}
                            </span>
                          </button>
                        );
                      })}

                      <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                        <label htmlFor="own-answer" className="sr-only">
                          Kendi cevabını yaz
                        </label>
                        <input
                          id="own-answer"
                          value={custom}
                          onChange={(e) => setCustom(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && answerWith(custom, "serbest")
                          }
                          placeholder="Ya da kendi cevabını yaz…"
                          className="field flex-1"
                          disabled={loading}
                        />
                        <button
                          onClick={() => answerWith(custom, "serbest")}
                          disabled={loading || !custom.trim()}
                          aria-label="Kendi cevabını gönder"
                          className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-50 sm:w-11 sm:px-0"
                        >
                          <Send className="size-4" aria-hidden />
                          <span className="sm:hidden">Gönder</span>
                        </button>
                      </div>
                    </div>
                  )
                )}
              </article>
            );
          })}

          {finished && (
            <button
              onClick={reset}
              className="panel flex min-h-12 w-full items-center justify-center gap-2 p-4 text-sm font-semibold transition-colors hover:bg-secondary"
            >
              Yeni bir dosyayla tekrar dene
              <ChevronRight className="size-4" aria-hidden />
            </button>
          )}

          {loading && (
            <div
              role="status"
              className="panel flex items-center gap-3 p-5 text-sm text-muted-foreground"
            >
              <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
              Karşındaki kişi not alıyor…
            </div>
          )}
          {error && (
            <div role="alert" className="panel border-destructive/60 p-5 text-sm text-destructive">
              {error}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
