import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, emptyProgress, nextTask, review, type TaskId } from "./srs";
import { exportProgress, importProgress, sanitizeProgress } from "./storage";

const NOW = new Date("2026-11-19T10:00:00");

describe("sanitizeProgress", () => {
  it("не ломается на мусоре и возвращает чистый прогресс", () => {
    for (const raw of [null, 42, "text", [], { cards: "x", stats: 5, settings: null, daily: [] }]) {
      const progress = sanitizeProgress(raw, NOW);
      expect(progress.settings).toEqual(DEFAULT_SETTINGS);
      expect(progress.cards).toEqual({});
      expect(nextTask(progress, NOW).kind).toBe("task");
    }
  });

  it("убирает неизвестные падежи и слова, но сохраняет нормальные карточки", () => {
    const good = review(emptyProgress(NOW), "maja|sg.ill" as TaskId, true, NOW);
    const raw = JSON.parse(JSON.stringify(good));
    raw.cards["nosuchword|sg.ill"] = raw.cards["maja|sg.ill"];
    raw.cards["maja|sg.vocative"] = raw.cards["maja|sg.ill"];
    raw.cards["maja|pl.ill"] = { due: "не дата" };
    raw.settings = { cases: ["ill", "vocative"], numbers: ["sg", "dual"] };
    raw.stats["sg.vocative"] = { right: 1, wrong: 0 };

    const progress = sanitizeProgress(raw, NOW);
    expect(Object.keys(progress.cards)).toEqual(["maja|sg.ill"]);
    expect(progress.settings).toEqual({ cases: ["ill"], numbers: ["sg"] });
    expect(progress.stats).toEqual({ "sg.ill": { right: 1, wrong: 0 } });
  });

  it("выбор без единого задания заменяет на все падежи", () => {
    const progress = sanitizeProgress({ settings: { cases: ["nom"], numbers: ["sg"] } }, NOW);
    expect(progress.settings).toEqual(DEFAULT_SETTINGS);
  });
});

describe("резервная копия", () => {
  it("код переносит прогресс без потерь", () => {
    const progress = review(emptyProgress(NOW), "jõgi|sg.ill" as TaskId, false, NOW);
    expect(importProgress(exportProgress(progress), NOW)).toEqual(progress);
  });

  it("отклоняет чужой или обрезанный код", () => {
    const code = exportProgress(emptyProgress(NOW));
    expect(importProgress("hello", NOW)).toBeNull();
    expect(importProgress(code.slice(0, 20), NOW)).toBeNull();
  });
});
