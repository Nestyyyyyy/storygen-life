// Kredisiz yerel motorun kalite raporu: bun run eval:engine
import { buildScene } from "../src/lib/story-engine.server";
import { evaluateSamples } from "../src/lib/story-quality.server";
import type { Difficulty } from "../src/lib/difficulty";

const N = Number(process.argv[2] ?? 120);
for (const difficulty of ["kolay", "normal", "zorlu"] as Difficulty[]) {
  const titles: string[] = [];
  const samples = Array.from({ length: N }, (_, i) => {
    const s = buildScene({
      occupation: "gece vardiyası hemşiresi",
      goal: "Deniz kenarında küçük bir ev almak",
      action: i === 0 ? undefined : "Doğru bildiğini söyledin",
      outcome: (["success", "partial", "failure"] as const)[i % 3],
      forced: i % 9 === 0,
      mature: i % 4 === 0,
      difficulty,
      usedFacts: ["Köpeğinin adı Şila."],
      usedTitles: titles,
      usedDomains: [],
    });
    titles.push(s.title);
    return s;
  });
  const r = evaluateSamples(samples, { facts: ["Köpeğinin adı Şila."] });
  console.log(`\n=== ${difficulty} (${r.samples} örnek) ===`);
  console.log(`ortalama ${r.average} | min ${r.min} | max ${r.max} | 70 altı: ${r.below70}`);
  console.log(`benzersiz başlık ${r.uniqueTitles} | benzersiz anlatı ${r.uniqueNarratives}`);
  r.topIssues.forEach((i) => console.log(` - ${i.issue} × ${i.count}`));
  if (r.average < 75) process.exitCode = 1;
}
