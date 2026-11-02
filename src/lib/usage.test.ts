import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, taskIds } from "./srs";
import { isNaturalTask, sentenceTemplate } from "./usage";
import { WORD_BY_ID } from "./words";

const w = (lemma: string) => WORD_BY_ID[lemma]!;

describe("isNaturalTask", () => {
  it("не спрашивает «до хлеба»", () => {
    expect(isNaturalTask(w("leib"), "sg", "term")).toBe(false);
    expect(taskIds(DEFAULT_SETTINGS)).not.toContain("leib|sg.term");
  });

  it("спрашивает «до» для мест", () => {
    expect(isNaturalTask(w("jõgi"), "sg", "term")).toBe(true);
    expect(isNaturalTask(w("päev"), "sg", "term")).toBe(false);
  });

  it("«работать кем / стать кем» — для людей и прилагательных", () => {
    expect(isNaturalTask(w("arst"), "sg", "ess")).toBe(true);
    expect(isNaturalTask(w("noor"), "sg", "ess")).toBe(true);
    expect(isNaturalTask(w("suur"), "sg", "transl")).toBe(true);
    expect(isNaturalTask(w("pilt"), "pl", "transl")).toBe(false);
    expect(isNaturalTask(w("laud"), "sg", "ess")).toBe(false);
  });

  it("«без / с» спрашивает у существительных, но не у прилагательных", () => {
    expect(isNaturalTask(w("leib"), "sg", "abess")).toBe(true);
    expect(isNaturalTask(w("sõber"), "sg", "com")).toBe(true);
    expect(isNaturalTask(w("ilus"), "sg", "com")).toBe(false);
  });

  it("не спрашивает множественное число у вещественных слов", () => {
    expect(isNaturalTask(w("vesi"), "pl", "ines")).toBe(false);
    expect(isNaturalTask(w("vesi"), "sg", "ines")).toBe(true);
  });

  it("не спрашивает «в маме» и «в молодого мужчину»", () => {
    expect(isNaturalTask(w("ema"), "sg", "ines")).toBe(false);
    expect(isNaturalTask(w("ema"), "sg", "ade")).toBe(true);
    expect(isNaturalTask(w("noor"), "sg", "ill")).toBe(false);
    expect(isNaturalTask(w("kiire"), "sg", "ill")).toBe(true);
  });

  it("у времени — только употребительные формы", () => {
    expect(isNaturalTask(w("nädal"), "sg", "ines")).toBe(true); // nädalas — в неделю
    expect(isNaturalTask(w("aasta"), "sg", "transl")).toBe(true); // aastaks — на год
    expect(isNaturalTask(w("päev"), "sg", "ade")).toBe(false);
  });
});

describe("sentenceTemplate", () => {
  it("даёт шаблон с местом для формы и перевод", () => {
    expect(sentenceTemplate(w("auto"), "sg.com")).toEqual({
      et: "Ma sõidan {}.",
      ru: "Я еду на машине.",
      en: "I travel by car.",
    });
  });

  it("у каждого шаблона ровно одно место для формы", () => {
    for (const id of taskIds(DEFAULT_SETTINGS)) {
      const [wordId, key] = id.split("|") as [string, `${"sg" | "pl"}.${string}`];
      const template = sentenceTemplate(w(wordId), key as never)!;
      expect(template.et.split("{}"), id).toHaveLength(2);
      expect(template.ru, id).not.toContain("{");
      expect(template.en, id).not.toContain("{");
    }
  });
});
