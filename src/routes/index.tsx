import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  Fingerprint,
  ChevronRight,
  Smile,
  Coins,
  Briefcase,
  Activity,
  Heart,
  Eye,
  Handshake,
  UserRound,
  Dices,
  BookOpen,
  Wand2,
  ShieldCheck,
  Flame,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StoryGen — Yapay Zekâ Hikâye Simülatörü" },
      {
        name: "description",
        content:
          "Bir karakter yarat ve anlatıcının senin için yazdığı hayatı yaşa — ya da sorgu odasına oturup kendini savun. Her seçim yeni bir hikâye.",
      },
      { property: "og:title", content: "StoryGen — Yapay Zekâ Hikâye Simülatörü" },
      {
        property: "og:description",
        content:
          "Hayat Simülatörü ve Dedektif Modu: her seçimin iz bıraktığı, her oynayışın farklı olduğu interaktif hikâyeler.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const LIFE_STATS = [
  { label: "Mutluluk", Icon: Smile, color: "var(--happiness)" },
  { label: "Servet", Icon: Coins, color: "var(--wealth)" },
  { label: "Kariyer", Icon: Briefcase, color: "var(--career)" },
  { label: "Stres", Icon: Activity, color: "var(--stress)" },
];

const CASE_STATS = [
  { label: "Şüphe", Icon: Eye, color: "var(--stress)" },
  { label: "Flört", Icon: Heart, color: "var(--happiness)" },
  { label: "Anlayış", Icon: Handshake, color: "var(--career)" },
];

const STEPS = [
  {
    Icon: UserRound,
    title: "Karakterini yarat",
    text: "Yaş, meslek, kişilik ve nihai hedefini seç — ya da öneri motoruna bırak, ipucu ver, o şekillendirsin.",
  },
  {
    Icon: Dices,
    title: "Seçimlerini yap",
    text: "Her bölümde üç yol ve bir kader zarı var. Stres yükseldikçe işler ters gider; bazen hayat senin yerine karar verir.",
  },
  {
    Icon: BookOpen,
    title: "Hikâyeni biriktir",
    text: "Tanıştığın insanlar, borçlar ve sırlar Hayat defterine işlenir; kararların birikip geri döner.",
  },
];

function Home() {
  return (
    <div className="min-h-dvh">
      <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col justify-center gap-8 p-4 py-10 md:p-8">
        {/* Hero */}
        <header className="text-center">
          <div className="glow mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-primary/20 text-primary">
            <Sparkles className="size-8" aria-hidden />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Story<span className="text-primary">Gen</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Bir karakter yarat, kararlar al ve anlatıcının senin için yazdığı hayatı yaşa. Her seçim
            yeni bir yol açar; hiçbir oynayış bir öncekine benzemez.
          </p>
        </header>

        {/* Mod kartları */}
        <section aria-label="Oyun modları" className="grid gap-5 md:grid-cols-2">
          <Link
            to="/lifestory"
            className="panel glow group relative overflow-hidden p-6 transition-transform hover:-translate-y-1"
            style={{ backgroundImage: "var(--gradient-hero)" }}
          >
            <div className="flex items-center gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/20 text-primary">
                <Sparkles className="size-5" aria-hidden />
              </div>
              <div>
                <h2 className="text-lg font-bold">Hayat Simülatörü</h2>
                <p className="text-xs text-muted-foreground">Her seçim yeni bir hayat</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Doğ, seç, tökezle, ayağa kalk. Aşk, borç, aile, sağlık ve şansın iç içe geçtiği bir
              ömrü bölüm bölüm yaşa; dört değerini dengede tutmaya çalış.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {LIFE_STATS.map(({ label, Icon, color }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{
                    color,
                    background: `color-mix(in oklab, ${color} 16%, transparent)`,
                  }}
                >
                  <Icon className="size-3" aria-hidden /> {label}
                </span>
              ))}
            </div>
            <span className="mt-5 flex items-center gap-1 text-sm font-semibold text-primary">
              Hayata başla
              <ChevronRight
                className="size-4 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </span>
          </Link>

          <Link
            to="/dedektif"
            className="panel group relative overflow-hidden p-6 transition-transform hover:-translate-y-1"
          >
            <div className="flex items-center gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/20 text-primary">
                <Fingerprint className="size-5" aria-hidden />
              </div>
              <div>
                <h2 className="text-lg font-bold">Dedektif Modu</h2>
                <p className="text-xs text-muted-foreground">Sorgu odasında hayatını savun</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Bir suç seç, masaya otur. Karşındaki sorgucuyu oku: yalan mı söylersin, dürüst mü
              olursun, flört mü edersin? Şüphe 100&apos;e dayanırsa demir kapı kapanır.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {CASE_STATS.map(({ label, Icon, color }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{
                    color,
                    background: `color-mix(in oklab, ${color} 16%, transparent)`,
                  }}
                >
                  <Icon className="size-3" aria-hidden /> {label}
                </span>
              ))}
            </div>
            <span className="mt-5 flex items-center gap-1 text-sm font-semibold text-primary">
              Sorguya gir
              <ChevronRight
                className="size-4 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </span>
          </Link>
        </section>

        {/* Nasıl çalışır */}
        <section aria-labelledby="how-heading" className="panel p-6">
          <h2 id="how-heading" className="flex items-center gap-2 text-sm font-bold">
            <Wand2 className="size-4 text-primary" aria-hidden /> Nasıl çalışır?
          </h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-3">
            {STEPS.map(({ Icon, title, text }, i) => (
              <div key={title} className="relative">
                <div className="flex items-center gap-2.5">
                  <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                    <Icon className="size-4" aria-hidden />
                  </div>
                  <p className="text-sm font-semibold">
                    <span className="text-primary">{i + 1}.</span> {title}
                  </p>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Alt şerit */}
        <footer className="flex flex-col items-center gap-2 text-center text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-primary" aria-hidden /> Kayıt gerekmez
            </span>
            <span className="flex items-center gap-1.5">
              <Flame className="size-3.5 text-primary" aria-hidden /> İsteğe bağlı 18+ modu
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="size-3.5 text-primary" aria-hidden /> Her oynayış farklı
            </span>
          </div>
          <p>Hikâyeler anında, sitenin kendi anlatı motoruyla üretilir.</p>
        </footer>
      </div>
    </div>
  );
}
