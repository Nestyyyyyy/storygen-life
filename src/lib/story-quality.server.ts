// ============================================================
//  KALİTE DEĞERLENDİRME AKIŞI — kredisiz (yerel) motor için
//  Üretilen sahneler puanlanır; motor her turda birkaç aday üretip
//  en yüksek puanlı varyantı seçer. Aynı puanlayıcı düzenli test
//  akışında (bun run eval:engine) toplu raporlama için de kullanılır.
// ============================================================

export type QualityInput = {
  title: string;
  narrative: string;
  outcomeText: string;
  choices: { label: string; recommended: boolean }[];
  facts?: string[];
  domain?: string;
};

export type QualityContext = {
  usedTitles?: string[];
  usedChoices?: string[];
  usedNarratives?: string[];
  usedDomains?: string[];
  facts?: string[];
};

export type { QualityBreakdownItem, QualityCandidate, QualityAudit } from "./quality-types";
import type { QualityBreakdownItem, QualityAudit } from "./quality-types";

export type QualityReport = {
  score: number; // 0-100
  issues: string[];
  breakdown: QualityBreakdownItem[];
};

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean);
const sentences = (s: string) =>
  s
    .split(/(?<=[.!?…])\s+/)
    .map((x) => x.trim())
    .filter((x) => x.length > 3);

const norm = (s: string) => s.toLocaleLowerCase("tr").replace(/[^\p{L}\p{N} ]/gu, "").trim();

/** İki metnin kelime örtüşme oranı (0-1). */
export function overlap(a: string, b: string) {
  const A = new Set(norm(a).split(" ").filter((w) => w.length > 3));
  const B = new Set(norm(b).split(" ").filter((w) => w.length > 3));
  if (!A.size || !B.size) return 0;
  let hit = 0;
  A.forEach((w) => {
    if (B.has(w)) hit++;
  });
  return hit / Math.min(A.size, B.size);
}

const CLICHE = [
  "her şey değişti",
  "hayat devam ediyor",
  "kader",
  "bir anda her şey",
  "devam et",
];

/** Bir sahneyi 0-100 arası puanlar; düşük puanın nedenlerini de döndürür. */
export function scoreScene(scene: QualityInput, ctx: QualityContext = {}): QualityReport {
  const issues: string[] = [];
  const breakdown: QualityBreakdownItem[] = [];
  let score = 100;
  const penalty = (n: number, why: string) => {
    score -= n;
    issues.push(why);
    breakdown.push({ reason: why, delta: -n });
  };
  const bonus = (n: number, why: string) => {
    score += n;
    breakdown.push({ reason: why, delta: n });
  };


  // 1) Şablon sızıntısı — {name} gibi doldurulmamış yuvalar affedilmez.
  if (/\{[a-z]+\}/i.test(`${scene.title} ${scene.narrative} ${scene.outcomeText}`))
    penalty(60, "doldurulmamış şablon yuvası");

  // 2) Anlatı uzunluğu: 3-5 cümle, 45-130 kelime.
  const nw = words(scene.narrative).length;
  const ns = sentences(scene.narrative).length;
  if (nw < 45) penalty(25, `anlatı kısa (${nw} kelime)`);
  else if (nw > 150) penalty(12, `anlatı fazla uzun (${nw} kelime)`);
  if (ns < 3) penalty(18, `anlatı ${ns} cümle`);
  if (ns > 6) penalty(8, "anlatı dağınık (6+ cümle)");

  // 3) Somutluk: özel isim, replik ya da sayı içermeli.
  const concrete =
    /["“«]/.test(scene.narrative) ||
    /\d/.test(scene.narrative) ||
    /\p{Lu}\p{Ll}{2,}/u.test(scene.narrative.slice(1));
  if (!concrete) penalty(12, "somut ayrıntı (isim/replik/sayı) yok");

  // 4) Seçenekler: tam cümle, birbirinden farklı.
  if (scene.choices.length) {
    scene.choices.forEach((c) => {
      const cw = words(c.label).length;
      if (cw < 4) penalty(10, `seçenek çok kısa: "${c.label}"`);
      if (cw > 14) penalty(4, `seçenek çok uzun: "${c.label}"`);
    });
    for (let i = 0; i < scene.choices.length; i++)
      for (let j = i + 1; j < scene.choices.length; j++)
        if (overlap(scene.choices[i].label, scene.choices[j].label) > 0.5)
          penalty(10, "iki seçenek birbirine çok benziyor");
    const rec = scene.choices.filter((c) => c.recommended).length;
    if (rec !== 1) penalty(8, `önerilen seçenek sayısı ${rec}`);
  }

  // 5) Tekrar: geçmiş başlık / seçenek / anlatı ile çakışma.
  if (ctx.usedTitles?.some((t) => norm(t) === norm(scene.title)))
    penalty(30, "başlık daha önce kullanıldı");
  if (ctx.usedNarratives?.some((n) => overlap(n, scene.narrative) > 0.55))
    penalty(28, "anlatı geçmiş bir sahneye çok benziyor");
  if (ctx.usedChoices?.some((c) => scene.choices.some((x) => norm(x.label) === norm(c))))
    penalty(14, "seçenek cümlesi tekrar etti");
  if (scene.domain && (ctx.usedDomains ?? []).slice(-3).includes(scene.domain))
    penalty(16, `alan tekrarı: ${scene.domain}`);

  // 6) Süreklilik ödülü: bilinen bir gerçekteki isme geri dönmek iyidir.
  const known = (ctx.facts ?? []).flatMap((f) => f.match(/\p{Lu}\p{Ll}{2,}/gu) ?? []);
  if (known.length && known.some((n) => scene.narrative.includes(n)))
    bonus(8, "süreklilik ödülü: bilinen bir isme geri dönüldü");

  // 7) Klişe cezası.
  const low = norm(scene.narrative);
  CLICHE.forEach((c) => {
    if (low.includes(norm(c))) penalty(6, `klişe: "${c}"`);
  });

  // 8) Sonuç metni varsa iki cümle beklenir.
  if (scene.outcomeText) {
    const os = sentences(scene.outcomeText).length;
    if (os < 2) penalty(8, "sonuç metni tek cümle");
  }

  return { score: Math.max(0, Math.min(100, Math.round(score))), issues, breakdown };
}

/** N aday üret, en yüksek puanlıyı seç. Aynı puanda ilk aday kazanır. */
export function pickBest<T extends QualityInput>(
  make: () => T,
  ctx: QualityContext = {},
  tries = 4,
): { scene: T; report: QualityReport; audit: QualityAudit } {
  const n = Math.max(1, Math.min(12, Math.round(tries)));
  const all: { scene: T; report: QualityReport }[] = [];
  let bestIdx = 0;
  for (let i = 0; i < n; i++) {
    const scene = make();
    const report = scoreScene(scene, ctx);
    all.push({ scene, report });
    if (report.score > all[bestIdx].report.score) bestIdx = i;
    if (all[bestIdx].report.score >= 92) break; // yeterince iyi
  }
  const audit: QualityAudit = {
    tries: all.length,
    chosenIndex: bestIdx,
    chosenScore: all[bestIdx].report.score,
    candidates: all.map((c, i) => ({
      index: i,
      score: c.report.score,
      title: c.scene.title,
      preview: c.scene.narrative.slice(0, 140),
      chosen: i === bestIdx,
      breakdown: c.report.breakdown,
    })),
  };
  return { scene: all[bestIdx].scene, report: all[bestIdx].report, audit };
}


export type EvaluationReport = {
  samples: number;
  average: number;
  min: number;
  max: number;
  below70: number;
  uniqueTitles: number;
  uniqueNarratives: number;
  topIssues: { issue: string; count: number }[];
};

/** Toplu değerlendirme: motoru N kez çalıştırıp kalite raporu üretir. */
export function evaluateSamples(samples: QualityInput[], ctx: QualityContext = {}): EvaluationReport {
  const scores: number[] = [];
  const counts = new Map<string, number>();
  samples.forEach((s) => {
    const r = scoreScene(s, ctx);
    scores.push(r.score);
    r.issues.forEach((i) => {
      const key = i.replace(/".*"/, '"…"').replace(/\d+/g, "N");
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
  });
  const avg = scores.reduce((a, b) => a + b, 0) / (scores.length || 1);
  return {
    samples: samples.length,
    average: Math.round(avg * 10) / 10,
    min: Math.min(...scores),
    max: Math.max(...scores),
    below70: scores.filter((s) => s < 70).length,
    uniqueTitles: new Set(samples.map((s) => norm(s.title))).size,
    uniqueNarratives: new Set(samples.map((s) => norm(s.narrative))).size,
    topIssues: [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([issue, count]) => ({ issue, count })),
  };
}
