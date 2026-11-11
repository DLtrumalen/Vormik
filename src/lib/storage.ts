import { emptyProgress, type Progress } from "./srs";

const KEY = "vormik:progress:v1";

export function loadProgress(now: Date): Progress {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return { ...emptyProgress(now), ...(JSON.parse(raw) as Progress) };
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
