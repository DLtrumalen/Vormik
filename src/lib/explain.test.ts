import { describe, expect, it } from "vitest";
import { explain } from "./explain";
import { DEFAULT_SETTINGS, parseTaskId, taskIds } from "./srs";
import { WORD_BY_ID } from "./words";

const nimi = WORD_BY_ID.nimi!;
const jalg = WORD_BY_ID.jalg!;
const maja = WORD_BY_ID.maja!;
const uus = WORD_BY_ID.uus!;

describe("explain", () => {
  it("строит мн. ч. иллатив шаг за шагом от этого же слова", () => {
    const e = explain(nimi, "pl.ill", "nimisse", "wrong");
    expect(e.answer).toBe("nimedesse");
    expect(e.steps.at(-1)).toBe("Добавляем окончание -sse: nimede + sse = nimedesse.");
  });

  it("объясняет ошибку в основе при верном окончании", () => {
    const e = explain(nimi, "pl.ill", "nimisse", "wrong");
    expect(e.mistake).toBe("Окончание -sse верное, ошибка в основе: не «nimi-», а «nimede-».");
  });

  it("узнаёт форму другого числа", () => {
    const e = explain(nimi, "pl.ill", "nimesse", "wrong");
    expect(e.mistake).toContain("ед. ч., а нужно мн. ч.");
  });

  it("узнаёт другой падеж", () => {
    const e = explain(maja, "sg.ill", "majas", "wrong");
    expect(e.mistake).toContain("seesütlev");
  });

  it("не пишет об ошибке при верном ответе", () => {
    expect(explain(maja, "sg.ill", "majja", "correct").mistake).toBeNull();
  });

  it("упоминает краткий иллатив", () => {
    const e = explain(maja, "sg.ill", "majja", "correct");
    expect(e.steps.join(" ")).toContain("краткая форма: majja");
    expect(e.alternatives).toEqual(["majasse"]);
  });

  it("пример всегда содержит само слово в нужной форме", () => {
    expect(explain(nimi, "pl.ill", "", "wrong").example.et).toContain("nimedesse");
    expect(explain(jalg, "pl.part", "", "wrong").example.et).toContain("jalgu");
  });

  it("для прилагательного показывает согласование с существительным", () => {
    expect(explain(uus, "sg.ill", "", "wrong").example.ru).toContain("«uude majja»");
  });

  it("в kaasaütlev прилагательное с существительным стоит в родительном", () => {
    expect(explain(uus, "sg.com", "", "wrong").example.ru).toContain("«uue majaga»");
  });

  it("объясняет краткую форму мн. ч. и показывает ту, что разобрана в шагах", () => {
    const keel = WORD_BY_ID.keel!;
    const wrong = explain(keel, "pl.abl", "keelelt", "wrong");
    expect(wrong.answer).toBe("keeltelt");
    expect(wrong.steps.at(-1)).toContain("keelilt");
    expect(explain(keel, "pl.abl", "keelilt", "correct").answer).toBe("keelilt");
  });

  it("работает для каждой формы словаря, и пример содержит саму форму", () => {
    for (const id of taskIds(DEFAULT_SETTINGS)) {
      const { wordId, formKey } = parseTaskId(id);
      const word = WORD_BY_ID[wordId]!;
      const e = explain(word, formKey, "x", "wrong");
      expect(e.steps.length, id).toBeGreaterThan(0);
      const otherNumber = formKey.startsWith("sg") ? "pl" : "sg";
      const wrongNumber =
        word.forms[`${otherNumber}.${formKey.split(".")[1]}` as typeof formKey][0]!;
      const texts = [
        ...e.steps,
        e.example.ru,
        explain(word, formKey, wrongNumber, "wrong").mistake,
      ];
      for (const text of texts) expect(text, id).not.toMatch(/\.\./);
      expect(e.example.et, id).toContain(e.answer);
      for (const step of e.steps) {
        const result = step.split(" = ")[1]?.replace(/\.$/, "");
        if (result) expect(word.forms[formKey], `${id}: ${step}`).toContain(result);
      }
    }
  });

  it("строит мн. ч. именительный от родительного ед. ч.", () => {
    expect(explain(jalg, "pl.nom", "", "wrong").steps.at(-1)).toBe(
      "Добавляем -d: jala + d = jalad.",
    );
  });
});
