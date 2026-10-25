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

export function resetProgress() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Нечего удалять.
  }
}
