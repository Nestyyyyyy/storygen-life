import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const StatsSchema = z.object({
  happiness: z.number(),
  wealth: z.number(),
  career: z.number(),
  stress: z.number(),
});

const CharacterSchema = z.object({
  age: z.number(),
  occupation: z.string(),
  personality: z.string(),
  goal: z.string(),
});

const InputSchema = z.object({
  character: CharacterSchema,
  stats: StatsSchema,
  history: z.array(z.object({ event: z.string(), choice: z.string() })).default([]),
  action: z.string().optional(),
});

export type LifeStats = z.infer<typeof StatsSchema>;
export type Character = z.infer<typeof CharacterSchema>;

export type LifeTurn = {
  age: number;
  title: string;
  narrative: string;
  choices: { label: string; recommended: boolean }[];
  effects: LifeStats;
};

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export const generateLifeEvent = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<LifeTurn> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const { character, stats, history, action } = data;

    const system = `You are the narrator of a gritty, surprising life simulator.
ALWAYS write every piece of text (title, narrative, choice labels) in TURKISH, in natural, idiomatic Türkçe.
Write in second person ("sen"), vivid but concise (max 70 words).
Return ONLY JSON of shape:
{"title":string,"narrative":string,"choices":[{"label":string,"recommended":boolean}],"effects":{"happiness":number,"wealth":number,"career":number,"stress":number},"ageDelta":number}
Rules: exactly 3 choices, short actionable Turkish labels (max 9 words), exactly one has recommended=true (the wisest given the goal).
"effects" are the DELTAS (-25..25) applied by the action that JUST happened (all zero on the first event).
ageDelta is 0 for the first event, otherwise 1-3.`;


    const userMsg = action
      ? `Character: ${character.age}y ${character.occupation}, personality: ${character.personality}, ultimate goal: ${character.goal}.
Current stats: ${JSON.stringify(stats)}.
Recent life: ${history
          .slice(-5)
          .map((h) => `${h.event} -> ${h.choice}`)
          .join(" | ")}
They just chose: "${action}". Resolve consequences and present the next life event.`
      : `Create the opening life event for: ${character.age}y ${character.occupation}, personality: ${character.personality}, ultimate goal: ${character.goal}. All effects zero, ageDelta 0.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMsg },
        ],
      }),
    });

    if (res.status === 429) throw new Error("Rate limit reached. Please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Add credits to continue.");
    if (!res.ok) throw new Error(`AI request failed (${res.status})`);

    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = json.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw.replace(/^```json\s*|```$/g, "")) as Record<string, unknown>;

    const choicesRaw = Array.isArray(parsed.choices) ? parsed.choices.slice(0, 3) : [];
    const choices = choicesRaw.map((c) => {
      const o = c as { label?: string; recommended?: boolean };
      return { label: String(o.label ?? "Keep going"), recommended: Boolean(o.recommended) };
    });
    while (choices.length < 3) choices.push({ label: "Wait and see what happens", recommended: false });
    if (!choices.some((c) => c.recommended)) choices[0].recommended = true;

    const e = (parsed.effects ?? {}) as Record<string, number>;
    const eff = {
      happiness: Number(e.happiness ?? 0) || 0,
      wealth: Number(e.wealth ?? 0) || 0,
      career: Number(e.career ?? 0) || 0,
      stress: Number(e.stress ?? 0) || 0,
    };

    const ageDelta = action ? Math.max(0, Math.min(3, Number(parsed.ageDelta ?? 1) || 1)) : 0;

    return {
      age: character.age + ageDelta,
      title: String(parsed.title ?? "A new chapter"),
      narrative: String(parsed.narrative ?? ""),
      choices,
      effects: {
        happiness: clamp(stats.happiness + eff.happiness),
        wealth: clamp(stats.wealth + eff.wealth),
        career: clamp(stats.career + eff.career),
        stress: clamp(stats.stress + eff.stress),
      },
    };
  });
