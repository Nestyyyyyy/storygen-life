// Zorluk seviyeleri — kredisiz (yerel) motor için denge ayarları.
// Hem hayat simülasyonunda stat etkilerini hem sorgu odasındaki
// Şüphe / Flört / Anlayış barlarını ölçekler.

export type Difficulty = "kolay" | "normal" | "zorlu";

export const DIFFICULTIES: { id: Difficulty; label: string; hint: string }[] = [
  { id: "kolay", label: "Kolay", hint: "Şüphe yavaş artar, flört ve anlayış daha kolay tutar." },
  { id: "normal", label: "Normal", hint: "Dengeli: risk var ama şans da var." },
  { id: "zorlu", label: "Zorlu", hint: "Şüphe hızla tırmanır, sorgucu kolay etkilenmez." },
];

export type DifficultyTuning = {
  /** Kazançların çarpanı. */
  gain: number;
  /** Kayıpların/cezaların çarpanı. */
  loss: number;
  /** Her tur otomatik eklenen şüphe baskısı. */
  pressure: number;
  /** Hamlenin tutması için gereken eşiğe eklenen zorluk. */
  threshold: number;
  /** Sorgunun bitiş kararlarında tolerans (şüphe eşiği kaydırması). */
  verdictBias: number;
};

export const TUNING: Record<Difficulty, DifficultyTuning> = {
  kolay: { gain: 1.3, loss: 0.65, pressure: 1, threshold: -0.12, verdictBias: 10 },
  normal: { gain: 1, loss: 1, pressure: 2, threshold: 0, verdictBias: 0 },
  zorlu: { gain: 0.75, loss: 1.4, pressure: 4, threshold: 0.14, verdictBias: -10 },
};

export const tune = (d: Difficulty | undefined) => TUNING[d ?? "normal"];
