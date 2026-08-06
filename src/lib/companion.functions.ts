import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  applyMeters,
  localCompanionTurn,
  makeCompanion,
} from "./companion.server";
import type { Companion, CompanionScene } from "./companion-types";
import { askAi } from "./life.server";

const GenreSchema = z.enum(["fantastik", "bilimkurgu", "dram", "gizem"]);

const CompanionSchema = z.object({
  name: z.string(),
  title: z.string(),
  persona: z.string(),
  voice: z.string(),
  genre: GenreSchema,
  world: z.string(),
  quest: z.string(),
});

const MetersSchema = z.object({
  bond: z.number(),
  trust: z.number(),
  power: z.number(),
  danger: z.number(),
});

const CreateSchema = z.object({
  genre: GenreSchema,
  hint: z.string().max(300).optional(),
  mature: z.boolean().default(false),
});

const TurnSchema = z.object({
  companion: CompanionSchema,
  meters: MetersSchema,
  history: z
    .array(z.object({ role: z.enum(["user", "companion"]), text: z.string() }))
    .default([]),
  facts: z.array(z.string()).default([]),
  action: z.string().max(600).optional(),
  mature: z.boolean().default(false),
  difficulty: z.enum(["kolay", "normal", "zorlu"]).default("normal"),
});

export type { Companion };

export type CompanionTurn = CompanionScene & {
  meters: ReturnType<typeof applyMeters>;
  facts: string[];
};

const str = (v: unknown, fallback = "") =>
  typeof v === "string" && v.trim() ? v.trim() : fallback;

/** Yeni bir yol arkadaşı + açılış sahnesi üretir. */
export const createCompanion = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => CreateSchema.parse(input))
  .handler(
    async ({
      data,
    }): Promise<{ companion: Companion; opening: string; suggestions: string[]; engine: "ai" | "local" }> => {
      const { genre, hint, mature } = data;
      const system = `Sen bir Türkçe interaktif kurgu yönetmenisin. Oyuncuya bir YOL ARKADAŞI karakteri ve açılış sahnesi yaz.
Sadece şu JSON'u döndür:
{"name":string,"title":string,"persona":string,"voice":string,"world":string,"quest":string,"opening":string,"suggestions":string[]}
- name: Türkçe ya da türe uygun tek kelime isim.
- title: kısa sıfat/meslek (örn. "sürgün büyücü").
- persona: 6-12 kelime karakter özeti.
- voice: konuşma tarzı (örn. "kısa cümleler, keskin espriler").
- world: dünyanın tek cümlelik tanımı.
- quest: ortak hedef, tek cümle.
- opening: 3-4 cümlelik sinematik açılış; karakter oyuncuyla KONUŞSUN, diyalog içersin, ikinci tekil ("sen") kullan.
- suggestions: oyuncunun söyleyebileceği 3 farklı tam cümle (5-12 kelime).
Tür: ${genre}. ${mature ? "18+ mod açık: sert temalar serbest, cinsellik kapı kapanır tekniğiyle ima edilsin." : "Genel izleyici tonu."}
Klişeden kaç, her seferinde farklı bir dünya kur.`;
      const user = `Tür: ${genre}. ${hint ? `Oyuncunun isteği (ZORUNLU uy): "${hint}".` : "Serbest, sürprizli bir kurgu."} Rastgelelik: ${Math.random().toString(36).slice(2, 10)}`;

      try {
        const p = await askAi(system, user, 1.15, ["name", "opening"]);
        const companion: Companion = {
          name: str(p.name, "Serin"),
          title: str(p.title, "yol arkadaşı"),
          persona: str(p.persona, "sadık, alaycı"),
          voice: str(p.voice, "kısa cümleler"),
          genre,
          world: str(p.world, "bilinmeyen bir diyar"),
          quest: str(p.quest, "birlikte hayatta kalmak"),
        };
        const suggestions = Array.isArray(p.suggestions)
          ? (p.suggestions as unknown[]).map((s) => str(s)).filter(Boolean).slice(0, 3)
          : [];
        return {
          companion,
          opening: str(p.opening),
          suggestions: suggestions.length ? suggestions : ["Kim olduğunu anlat.", "Buradan nasıl çıkacağız?", "Sana güvenebilir miyim?"],
          engine: "ai",
        };
      } catch (err) {
        console.error("[createCompanion]", err);
        const companion = makeCompanion(genre, hint?.split(/\s+/)[0]);
        const scene = localCompanionTurn({
          companion,
          difficulty: "normal",
          mature,
          meters: { bond: 20, trust: 25, power: 15, danger: 20 },
          usedOpeners: [],
          turn: 1,
        });
        return {
          companion,
          opening: `${companion.world}. ${scene.reply}`,
          suggestions: scene.suggestions,
          engine: "local",
        };
      }
    },
  );

/** Oyuncunun sözüne karakterin cevabı + ölçü değişimleri. */
export const companionTurn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TurnSchema.parse(input))
  .handler(async ({ data }): Promise<CompanionTurn> => {
    const { companion, meters, history, facts, action, mature, difficulty } = data;

    const system = `Sen "${companion.name}" adlı karakteri canlandıran bir Türkçe interaktif kurgu yönetmenisin.
Karakter: ${companion.title}. Kişilik: ${companion.persona}. Konuşma tarzı: ${companion.voice}.
Dünya: ${companion.world}. Ortak hedef: ${companion.quest}. Tür: ${companion.genre}.
Sadece şu JSON'u döndür:
{"reply":string,"action":string,"suggestions":string[],"delta":{"bond":number,"trust":number,"power":number,"danger":number},"event":{"kind":"savaş"|"güç"|"sır"|"yol","label":string,"text":string}|null,"facts":string[]}
KURALLAR:
- reply: 3-5 cümle. Karakterin repliği + sahnenin görüntüsü. İkinci tekil ("sen"). Karakter oyuncuya CEVAP versin, soruyu boş bırakmasın.
- action: sahnede olan şeyin 2-5 kelimelik etiketi.
- suggestions: oyuncunun söyleyebileceği 3 farklı tam cümle (5-12 kelime), hepsi farklı yön.
- delta: -25..25 arası tam sayılar; bond/trust/power/danger değişimi. Riskli hamlede danger artsın.
- event: sahne savaşa, güç edinmeye, bir sırra ya da yola dönüştüyse doldur; yoksa null.
- facts: bu turda kesinleşen kalıcı bilgiler (isim, yara, borç, yetenek). Önceki gerçeklerle ÇELİŞME.
- Tekrar yasak: aynı cümleyi/olayı yeniden yazma.
${mature ? "18+ mod açık: şiddet, ihanet, arzu serbest; cinsellik kapı kapanır tekniğiyle ima edilsin, açık tasvir yok." : "Genel izleyici tonu."}
Zorluk: ${difficulty} (zorluk arttıkça kazanç az, tehlike çok).`;

    const transcript = history
      .slice(-24)
      .map((h) => `${h.role === "user" ? "Oyuncu" : companion.name}: ${h.text}`)
      .join("\n");
    const user = `Kalıcı gerçekler: ${facts.slice(-40).join(" | ") || "yok"}
Ölçüler: bağ ${meters.bond}, güven ${meters.trust}, güç ${meters.power}, tehlike ${meters.danger}
Sohbet:
${transcript || "(yeni sahne)"}
Oyuncunun yeni sözü: ${action ? `"${action}"` : "(sessiz kaldı, sahne devam ediyor)"}
Rastgelelik: ${Math.random().toString(36).slice(2, 10)}`;

    try {
      const p = await askAi(system, user, 1.1, ["reply"]);
      const d = (p.delta ?? {}) as Record<string, unknown>;
      const num = (v: unknown) => {
        const n = Number(v);
        return Number.isFinite(n) ? Math.max(-25, Math.min(25, Math.round(n))) : 0;
      };
      const delta = {
        bond: num(d.bond),
        trust: num(d.trust),
        power: num(d.power),
        danger: num(d.danger),
      };
      const rawEvent = p.event as Record<string, unknown> | null | undefined;
      const kind = str(rawEvent?.kind);
      const event =
        rawEvent && ["savaş", "güç", "sır", "yol"].includes(kind)
          ? {
              kind: kind as "savaş" | "güç" | "sır" | "yol",
              label: str(rawEvent.label, "Olay"),
              text: str(rawEvent.text),
            }
          : undefined;
      const newFacts = Array.isArray(p.facts)
        ? (p.facts as unknown[]).map((f) => str(f)).filter(Boolean).slice(0, 6)
        : [];

      return {
        reply: str(p.reply),
        action: str(p.action, "Sahne devam ediyor"),
        suggestions: Array.isArray(p.suggestions)
          ? (p.suggestions as unknown[]).map((s) => str(s)).filter(Boolean).slice(0, 3)
          : [],
        delta,
        ...(event ? { event } : {}),
        engine: "ai" as const,
        meters: applyMeters(meters, delta),
        facts: Array.from(new Set([...facts, ...newFacts])).slice(-60),
      };
    } catch (err) {
      console.error("[companionTurn]", err);
      const scene = localCompanionTurn({
        companion,
        ...(action ? { action } : {}),
        difficulty,
        mature,
        meters,
        usedOpeners: history.filter((h) => h.role === "companion").map((h) => h.text),
        turn: history.filter((h) => h.role === "user").length + 1,
      });
      return {
        ...scene,
        engine: "local" as const,
        meters: applyMeters(meters, scene.delta),
        facts: scene.event ? Array.from(new Set([...facts, scene.event.label])).slice(-60) : facts,
      };
    }
  });
