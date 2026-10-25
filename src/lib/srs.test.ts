import { describe, expect, it } from "vitest";
import {
  addNewCards,
  emptyProgress,
  nextTask,
  review,
  taskIds,
  NEW_PER_DAY,
  type TaskId,
} from "./srs";
import { WORDS } from "./words";

const NOW = new Date("2026-10-25T10:00:00");
const first = () => 0;

describe("taskIds", () => {
  it("не спрашивает именительный ед. ч.", () => {
    const ids = taskIds({ cases: ["nom", "gen"], numbers: ["sg", "pl"] });
    expect(ids.some((id) => id.endsWith("|sg.nom"))).toBe(false);
    expect(ids).toHaveLength(WORDS.length * 3);
  });
});

describe("nextTask", () => {
  it("даёт новую карточку, если повторять нечего", () => {
    const task = nextTask(emptyProgress(NOW), NOW, first);
    expect(task).toMatchObject({ kind: "task", isNew: true });
  });

  it("сначала возвращает карточку, срок которой наступил", () => {
    let progress = emptyProgress(NOW);
    const id = taskIds(progress.settings)[5] as TaskId;
    progress = review(progress, id, false, NOW);

    const later = new Date(NOW.getTime() + 10 * 60_000);
    expect(nextTask(progress, later, first)).toEqual({ kind: "task", id, isNew: false });
  });

  it("правильный ответ откладывает карточку, ошибка возвращает её быстро", () => {
    let progress = emptyProgress(NOW);
    const [a, b] = taskIds(progress.settings) as [TaskId, TaskId];
    progress = review(progress, a, true, NOW);
    progress = review(progress, b, false, NOW);
    expect(Date.parse(progress.cards[a]!.due)).toBeGreaterThan(Date.parse(progress.cards[b]!.due));
  });

  it("соблюдает дневной лимит новых карточек", () => {
    let progress = emptyProgress(NOW);
    for (const id of taskIds(progress.settings).slice(0, NEW_PER_DAY)) {
      progress = review(progress, id, true, NOW);
    }
    expect(nextTask(progress, NOW, first)).toMatchObject({ kind: "done", canAddNew: true });

    progress = addNewCards(progress, NOW);
    expect(nextTask(progress, NOW, first)).toMatchObject({ kind: "task", isNew: true });
  });

  it("сбрасывает лимит на следующий день", () => {
    let progress = emptyProgress(NOW);
    for (const id of taskIds(progress.settings).slice(0, NEW_PER_DAY)) {
      progress = review(progress, id, true, NOW);
    }
    const tomorrow = new Date(NOW.getTime() + 24 * 3600_000);
    expect(nextTask(progress, tomorrow, first)).toMatchObject({ kind: "task" });
  });
});

describe("review", () => {
  it("ведёт статистику по формам", () => {
    let progress = emptyProgress(NOW);
    progress = review(progress, "maja|sg.ill", true, NOW);
    progress = review(progress, "jalg|sg.ill", false, NOW);
    expect(progress.stats["sg.ill"]).toEqual({ right: 1, wrong: 1 });
  });
});
