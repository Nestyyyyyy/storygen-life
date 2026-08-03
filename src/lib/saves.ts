// Oyun kayıtları: tarayıcı localStorage üzerinde basit slot yönetimi.

export type SaveMode = "life" | "detective";

export type SaveSlot<T = unknown> = {
  id: string;
  mode: SaveMode;
  name: string;
  summary: string;
  auto: boolean;
  createdAt: number;
  updatedAt: number;
  data: T;
};

const KEY = "hs-saves-v1";
const MAX_PER_MODE = 12;

function readAll(): SaveSlot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SaveSlot[]) : [];
  } catch {
    return [];
  }
}

function writeAll(slots: SaveSlot[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(slots));
  } catch {
    /* kota dolu olabilir, yoksay */
  }
}

export function listSaves<T = unknown>(mode: SaveMode): SaveSlot<T>[] {
  return (readAll() as SaveSlot<T>[])
    .filter((s) => s.mode === mode)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function readSave<T = unknown>(id: string): SaveSlot<T> | null {
  return (readAll() as SaveSlot<T>[]).find((s) => s.id === id) ?? null;
}

export function writeSave<T>(input: {
  id?: string;
  mode: SaveMode;
  name: string;
  summary: string;
  data: T;
  auto?: boolean;
}): SaveSlot<T> {
  const all = readAll();
  const now = Date.now();
  const id = input.id ?? `${input.mode}-${now.toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const existing = all.find((s) => s.id === id);
  const slot: SaveSlot<T> = {
    id,
    mode: input.mode,
    name: input.name,
    summary: input.summary,
    auto: input.auto ?? false,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    data: input.data,
  };

  const rest = all.filter((s) => s.id !== id);
  const sameMode = rest
    .filter((s) => s.mode === input.mode && !s.auto)
    .sort((a, b) => b.updatedAt - a.updatedAt);
  const dropped = new Set(
    slot.auto ? [] : sameMode.slice(MAX_PER_MODE - 1).map((s) => s.id),
  );

  writeAll([slot as SaveSlot, ...rest.filter((s) => !dropped.has(s.id))]);
  return slot;
}

export function autoSaveId(mode: SaveMode) {
  return `auto-${mode}`;
}

export function deleteSave(id: string) {
  writeAll(readAll().filter((s) => s.id !== id));
}

export function formatSaveTime(ts: number) {
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(ts));
  } catch {
    return "";
  }
}
