import { describe, expect, it } from "vitest";
import { LOCALES } from "@/i18n";
import { explain, GAP, pluralGenitive, taskSentence } from "./explain";
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
    expect(e.steps.join(" ")).toContain("краткая форма majja");
    expect(e.alternatives).toEqual(["majasse"]);
  });

  it("пример — предложение с этим словом в нужной форме и переводом", () => {
    const lennuk = WORD_BY_ID.lennuk!;
    expect(explain(lennuk, "sg.com", "", "wrong").example).toEqual({
      et: "Ma sõidan lennukiga.",
      translation: "Я еду на самолёте.",
    });
    expect(explain(lennuk, "sg.com", "", "wrong", "en").example.translation).toBe(
      "I travel by plane.",
    );
    expect(explain(WORD_BY_ID.sõber!, "sg.ade", "", "wrong").example).toEqual({
      et: "Sõbral on koer.",
      translation: "У друга есть собака.",
    });
  });

  it("в задании на месте формы пропуск", () => {
    expect(taskSentence(WORD_BY_ID.lennuk!, "sg.com", "ru")).toEqual({
      et: `Ma sõidan ${GAP}.`,
      translation: "Я еду на самолёте.",
    });
    expect(taskSentence(WORD_BY_ID.sõber!, "sg.ade", "fi")).toEqual({
      et: `${GAP} on koer.`,
      translation: null,
    });
  });

  it("прилагательное стоит в предложении вместе с существительным", () => {
    const kiire = WORD_BY_ID.kiire!;
    expect(explain(kiire, "sg.ines", "", "wrong").example).toEqual({
      et: "Ma olen kiires autos.",
      translation: "Я в быстрой машине.",
    });
    expect(taskSentence(kiire, "sg.ines", "ru")?.et).toBe(`Ma olen ${GAP} autos.`);
    expect(explain(uus, "sg.transl", "", "wrong").example.et).toBe("Kõik saab uueks.");
  });

  it("объясняет краткую форму мн. ч. и показывает ту, что разобрана в шагах", () => {
    const keel = WORD_BY_ID.keel!;
    const wrong = explain(keel, "pl.abl", "keelelt", "wrong");
    expect(wrong.answer).toBe("keeltelt");
    expect(wrong.steps.at(-1)).toContain("keelilt");
    expect(explain(keel, "pl.abl", "keelilt", "correct").answer).toBe("keelilt");
  });

  it("объясняет выбор -de / -te по частичному ед. ч.", () => {
    expect(pluralGenitive(WORD_BY_ID.pilt!)).toMatchObject({
      kind: "rule",
      ending: "de",
      reason: "vowel",
      form: "piltide",
    });
    expect(pluralGenitive(WORD_BY_ID.keel!)).toMatchObject({
      kind: "rule",
      ending: "te",
      reason: "t",
    });
    expect(pluralGenitive(WORD_BY_ID.lumi!)).toMatchObject({
      kind: "rule",
      ending: "de",
      reason: "d",
    });
    expect(explain(WORD_BY_ID.pilt!, "pl.gen", "", "wrong").steps[0]).toContain(
      "osastav ед. ч. pilti: он оканчивается на гласную, поэтому добавляем ‑de: pilti + de = piltide.",
    );
  });

  it("не показывает правило -de / -te, когда оно ни при чём", () => {
    const kool = WORD_BY_ID.kool!;
    const plain = explain(kool, "pl.ade", "koolil", "wrong");
    expect(plain.steps).toEqual([
      "Падежи мн. ч. строятся от omastav мн. ч.: koolide.",
      "Добавляем окончание -l: koolide + l = koolidel.",
    ]);
  });

  it("показывает правило -de / -te, если ошибка именно в нём", () => {
    const steps = explain(WORD_BY_ID.kool!, "pl.ade", "kooltel", "wrong").steps;
    expect(steps).toHaveLength(3);
    expect(steps[1]).toContain("kooli: он оканчивается на гласную");
  });

  it("честно называет исключения из правила -de / -te", () => {
    expect(pluralGenitive(WORD_BY_ID.auto!)).toEqual({ kind: "exception", form: "autode" });
    expect(explain(WORD_BY_ID.auto!, "pl.gen", "", "wrong").steps[0]).toContain(
      "исключение: autot → autode",
    );
  });

  it("при двух вариантах берёт тот, что по правилу, и называет второй", () => {
    expect(pluralGenitive(WORD_BY_ID.koer!)).toMatchObject({
      kind: "rule",
      form: "koerade",
      others: ["koerte"],
    });
  });

  it("говорит на английском и финском", () => {
    expect(explain(nimi, "pl.ill", "nimisse", "wrong", "en").steps.at(-1)).toBe(
      "Add the ending -sse: nimede + sse = nimedesse.",
    );
    expect(explain(nimi, "pl.ill", "nimesse", "wrong", "fi").mistake).toBe(
      "”nimesse” on sisseütlev, yksikkö, mutta tarvitaan monikko.",
    );
    expect(explain(uus, "sg.ill", "", "wrong", "fi").example).toEqual({
      et: "Ma lähen uude majja.",
      translation: null,
    });
  });

  it.each(LOCALES)(
    "работает для каждой формы словаря (%s), и в каждом задании есть предложение с этой формой",
    (locale) => {
      for (const id of taskIds(DEFAULT_SETTINGS)) {
        const { wordId, formKey } = parseTaskId(id);
        const word = WORD_BY_ID[wordId]!;
        const e = explain(word, formKey, "x", "wrong", locale);
        expect(e.steps.length, id).toBeGreaterThan(0);
        const otherNumber = formKey.startsWith("sg") ? "pl" : "sg";
        const wrongNumber =
          word.forms[`${otherNumber}.${formKey.split(".")[1]}` as typeof formKey][0]!;
        const texts = [
          ...e.steps,
          e.example.translation ?? "",
          explain(word, formKey, wrongNumber, "wrong", locale).mistake,
        ];
        for (const text of texts) expect(text, id).not.toMatch(/\.\./);
        expect(e.example.et.toLowerCase(), id).toContain(e.answer.toLowerCase());
        const gap = taskSentence(word, formKey, locale)!.et;
        expect(gap, id).toContain(GAP);
        // Пропуск, заполненный ответом, даёт ровно предложение из примера (без расхождений вроде teile/teedele).
        expect(gap.replace(GAP, e.answer).toLowerCase(), id).toBe(e.example.et.toLowerCase());
        if (locale !== "fi") expect(e.example.translation, id).toBeTruthy();
        for (const step of e.steps) {
          const result = step.split(" = ")[1]?.match(/^[^\s.,]+/)?.[0];
          if (result) expect(word.forms[formKey], `${id}: ${step}`).toContain(result);
        }
      }
    },
  );

  it("замечает русскую раскладку", () => {
    expect(explain(maja, "sg.ill", "mаjja", "wrong").mistake).toContain("русская раскладка");
  });

  it("называет ошибку в окончании, если основа верная", () => {
    expect(explain(WORD_BY_ID.rong!, "pl.term", "rongidenni", "wrong").mistake).toBe(
      "Основа rongide- верная, ошибка в окончании: нужно -ni.",
    );
  });

  it("форму другого числа того же падежа узнаёт раньше совпадения с другим падежом", () => {
    expect(explain(WORD_BY_ID.kool!, "pl.part", "kooli", "wrong").mistake).toContain(
      "osastav, ед. ч., а нужно мн. ч.",
    );
  });

  it("формы от второго родительного мн. ч. не называет краткими", () => {
    const steps = explain(WORD_BY_ID.koer!, "pl.ade", "", "wrong").steps;
    expect(steps.join(" ")).toContain("от второй формы omastav мн. ч. (koerte): koertel");
  });

  it("строит мн. ч. именительный от родительного ед. ч.", () => {
    expect(explain(jalg, "pl.nom", "", "wrong").steps.at(-1)).toBe(
      "Добавляем -d: jala + d = jalad.",
    );
  });
});
