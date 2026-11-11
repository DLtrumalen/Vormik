import { createEmptyCard, fsrs, Rating, State, type Card, type CardInput } from "ts-fsrs";
import { CASES, type CaseKey, type GrammaticalNumber } from "./cases";
import { WORDS, type FormKey } from "./words";

/** Карточка — одна форма одного слова: «jalg|pl.part». */
export type TaskId = `${string}|${FormKey}`;

export type StoredCard = Omit<CardInput, "due" | "last_review"> & {
  due: string;
  last_review?: string;
};

export type CaseStats = { right: number; wrong: number };

export type Settings = {
  cases: CaseKey[];
  numbers: GrammaticalNumber[];
};

export type Progress = {
  cards: Record<string, StoredCard>;
  stats: Partial<Record<FormKey, CaseStats>>;
  /** Сколько новых карточек открыто сегодня (day — дата в формате YYYY-MM-DD). */
  daily: { day: string; newCount: number; newLimit: number };
  settings: Settings;
};

export const NEW_PER_DAY = 20;

export const DEFAULT_SETTINGS: Settings = {
  cases: CASES.map((c) => c.key),
  numbers: ["sg", "pl"],
};

const scheduler = fsrs({ enable_fuzz: true });

export function emptyProgress(now: Date): Progress {
  return {
    cards: {},
    stats: {},
    daily: { day: dayKey(now), newCount: 0, newLimit: NEW_PER_DAY },
    settings: DEFAULT_SETTINGS,
  };
}

export function dayKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseTaskId(id: TaskId) {
  const [wordId, formKey] = id.split("|") as [string, FormKey];
  const [number, caseKey] = formKey.split(".") as [GrammaticalNumber, CaseKey];
  return { wordId, formKey, number, caseKey };
}

/** Все задания, доступные при текущих настройках. Именительный ед. ч. — это сама словарная форма, его не спрашиваем. */
export function taskIds(settings: Settings): TaskId[] {
  const ids: TaskId[] = [];
  for (const word of WORDS) {
    for (const number of settings.numbers) {
      for (const caseKey of settings.cases) {
        if (number === "sg" && caseKey === "nom") continue;
        ids.push(`${word.id}|${number}.${caseKey}`);
      }
    }
  }
  return ids;
}

function withToday(progress: Progress, now: Date): Progress {
  const day = dayKey(now);
  if (progress.daily.day === day) return progress;
  return { ...progress, daily: { day, newCount: 0, newLimit: NEW_PER_DAY } };
}

export type NextTask =
  | { kind: "task"; id: TaskId; isNew: boolean }
  | { kind: "done"; nextDue: Date | null; canAddNew: boolean };

/** Выбирает следующее задание: сначала карточки, срок которых наступил, потом новые в пределах дневного лимита. */
export function nextTask(
  progress: Progress,
  now: Date,
  random: () => number = Math.random,
): NextTask {
  const today = withToday(progress, now);
  const ids = taskIds(today.settings);

  let dueId: TaskId | null = null;
  let dueTime = Infinity;
  let nextDue = Infinity;
  const fresh: TaskId[] = [];

  for (const id of ids) {
    const card = today.cards[id];
    if (!card) {
      fresh.push(id);
      continue;
    }
    const time = Date.parse(card.due);
    if (time <= now.getTime() && time < dueTime) {
      dueId = id;
      dueTime = time;
    } else if (time > now.getTime()) {
      nextDue = Math.min(nextDue, time);
    }
  }

  if (dueId) return { kind: "task", id: dueId, isNew: false };

  const canAddNew = fresh.length > 0;
  if (canAddNew && today.daily.newCount < today.daily.newLimit) {
    const id = fresh[Math.floor(random() * fresh.length)] ?? fresh[0]!;
    return { kind: "task", id, isNew: true };
  }

  return { kind: "done", nextDue: Number.isFinite(nextDue) ? new Date(nextDue) : null, canAddNew };
}

function toStored(card: Card): StoredCard {
  return {
    ...card,
    due: card.due.toISOString(),
    last_review: card.last_review?.toISOString(),
  };
}

/** Записывает ответ: правильный — Good, ошибка — Again (карточка вернётся через минуту). */
export function review(progress: Progress, id: TaskId, correct: boolean, now: Date): Progress {
  const today = withToday(progress, now);
  const existing = today.cards[id];
  const card: StoredCard | Card = existing ?? createEmptyCard<Card>(now);
  const { card: next } = scheduler.next(card, now, correct ? Rating.Good : Rating.Again);

  const { formKey } = parseTaskId(id);
  const prev = today.stats[formKey] ?? { right: 0, wrong: 0 };

  return {
    ...today,
    cards: { ...today.cards, [id]: toStored(next) },
    stats: {
      ...today.stats,
      [formKey]: correct ? { ...prev, right: prev.right + 1 } : { ...prev, wrong: prev.wrong + 1 },
    },
    daily: existing ? today.daily : { ...today.daily, newCount: today.daily.newCount + 1 },
  };
}

/** Разрешает открыть ещё порцию новых карточек сегодня. */
export function addNewCards(progress: Progress, now: Date, amount = 10): Progress {
  const today = withToday(progress, now);
  return { ...today, daily: { ...today.daily, newLimit: today.daily.newLimit + amount } };
}

export function countDue(progress: Progress, now: Date) {
  const ids = new Set<string>(taskIds(progress.settings));
  return Object.entries(progress.cards).filter(
    ([id, card]) => ids.has(id) && Date.parse(card.due) <= now.getTime(),
  ).length;
}

export function countLearned(progress: Progress) {
  return Object.values(progress.cards).filter((card) => card.state === State.Review).length;
}
