import { CASES, type CaseKey, type GrammaticalNumber } from "./cases";
import {
  DEFAULT_SETTINGS,
  emptyProgress,
  taskIds,
  type CaseStats,
  type Progress,
  type Settings,
  type StoredCard,
} from "./srs";
import { WORD_BY_ID, type FormKey } from "./words";

const KEY = "vormik:progress:v1";
/** Префикс кода резервной копии: по нему понятно, что вставили именно код Vormik. */
const BACKUP_PREFIX = "VORMIK1:";

const CASE_KEYS = new Set<string>(CASES.map((c) => c.key));
const NUMBERS = new Set<string>(["sg", "pl"]);
const CARD_NUMBERS = [
  "stability",
  "difficulty",
  "elapsed_days",
  "scheduled_days",
  "reps",
  "lapses",
  "state",
];

type Raw = Record<string, unknown>;

const isObject = (value: unknown): value is Raw =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isCount = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

function isFormKey(value: string): value is FormKey {
  const [number, caseKey, extra] = value.split(".");
  return extra === undefined && NUMBERS.has(number ?? "") && CASE_KEYS.has(caseKey ?? "");
}

function sanitizeSettings(raw: unknown): Settings {
  if (!isObject(raw)) return DEFAULT_SETTINGS;
  const pick = <T extends string>(list: unknown, allowed: Set<string>) =>
    Array.isArray(list)
      ? [...new Set(list.filter((v): v is T => typeof v === "string" && allowed.has(v)))]
      : [];
  const settings = {
    cases: pick<CaseKey>(raw.cases, CASE_KEYS),
    numbers: pick<GrammaticalNumber>(raw.numbers, NUMBERS),
  };
  // Выбор, при котором нет ни одного задания, тренажёр показать не сможет.
  return taskIds(settings).length > 0 ? settings : DEFAULT_SETTINGS;
}

function sanitizeCard(raw: unknown): StoredCard | null {
  if (!isObject(raw) || typeof raw.due !== "string" || Number.isNaN(Date.parse(raw.due)))
    return null;
  if (!CARD_NUMBERS.every((field) => isCount(raw[field]))) return null;
  if (
    raw.last_review !== undefined &&
    (typeof raw.last_review !== "string" || Number.isNaN(Date.parse(raw.last_review)))
  ) {
    return null;
  }
  return raw as unknown as StoredCard;
}

/**
 * Проверяет прогресс, прочитанный из хранилища или из резервной копии. Всё, что не подходит
 * (старый формат, удалённые слова и падежи, испорченные значения), отбрасывается, а не роняет
 * тренажёр: иначе он не открылся бы вовсе, вместе с кнопкой «Сбросить прогресс».
 */
export function sanitizeProgress(raw: unknown, now: Date): Progress {
  const empty = emptyProgress(now);
  if (!isObject(raw)) return empty;

  const cards: Progress["cards"] = {};
  if (isObject(raw.cards)) {
    for (const [id, value] of Object.entries(raw.cards)) {
      const [wordId, formKey, extra] = id.split("|");
      if (extra !== undefined || !wordId || !formKey || !WORD_BY_ID[wordId] || !isFormKey(formKey))
        continue;
      const card = sanitizeCard(value);
      if (card) cards[id] = card;
    }
  }

  const stats: Progress["stats"] = {};
  if (isObject(raw.stats)) {
    for (const [key, value] of Object.entries(raw.stats)) {
      if (isFormKey(key) && isObject(value) && isCount(value.right) && isCount(value.wrong)) {
        stats[key] = { right: value.right, wrong: value.wrong } satisfies CaseStats;
      }
    }
  }

  const daily = isObject(raw.daily) ? raw.daily : {};
  return {
    cards,
    stats,
    daily:
      typeof daily.day === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(daily.day) &&
      isCount(daily.newCount) &&
      isCount(daily.newLimit) &&
      daily.newLimit > 0
        ? { day: daily.day, newCount: daily.newCount, newLimit: daily.newLimit }
        : empty.daily,
    settings: sanitizeSettings(raw.settings),
  };
}

export function loadProgress(now: Date): Progress {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return sanitizeProgress(JSON.parse(raw), now);
  } catch {
    // Повреждённые данные или недоступное хранилище — начинаем заново.
  }
  return emptyProgress(now);
}

export function saveProgress(progress: Progress) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // Хранилище недоступно (приватный режим) — прогресс живёт до закрытия вкладки.
  }
}

/**
 * Сообщает, когда прогресс сохранила другая вкладка: иначе каждая вкладка держит свою копию,
 * и та, что сохранит последней, затрёт ответы, данные в другой.
 */
export function onProgressChangedElsewhere(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}

export function resetProgress() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Нечего удалять.
  }
}

/** Код резервной копии: прогресс одной строкой, чтобы перенести его на другое устройство. */
export function exportProgress(progress: Progress): string {
  const bytes = new TextEncoder().encode(JSON.stringify(progress));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return BACKUP_PREFIX + btoa(binary);
}

/** Прогресс из кода резервной копии или null, если код не подходит. */
export function importProgress(code: string, now: Date): Progress | null {
  const text = code.trim();
  if (!text.startsWith(BACKUP_PREFIX)) return null;
  try {
    const binary = atob(text.slice(BACKUP_PREFIX.length));
    const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
    return sanitizeProgress(JSON.parse(new TextDecoder().decode(bytes)), now);
  } catch {
    return null;
  }
}
