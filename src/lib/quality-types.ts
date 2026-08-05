// Kalite raporu tipleri — tarayıcı tarafında da kullanılabilir (saf tip dosyası).

/** Puan kırılımı: her kalem puanı ne kadar düşürdü ya da yükseltti. */
export type QualityBreakdownItem = { reason: string; delta: number };

/** Rapor panelinde gösterilen aday özeti. */
export type QualityCandidate = {
  index: number;
  score: number;
  title: string;
  preview: string;
  chosen: boolean;
  breakdown: QualityBreakdownItem[];
};

/** Bir turda üretilen tüm adaylar ve seçim bilgisi. */
export type QualityAudit = {
  tries: number;
  chosenIndex: number;
  chosenScore: number;
  candidates: QualityCandidate[];
};

/** Ayarlardan seçilebilen best-of-N değerleri. */
export const BEST_OF_OPTIONS = [3, 5, 8] as const;
export type BestOf = (typeof BEST_OF_OPTIONS)[number];
