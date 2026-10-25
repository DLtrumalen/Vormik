import { describe, expect, it } from "vitest";
import { CASES } from "./cases";
import { WORDS, WORD_BY_ID, formationHint } from "./words";

describe("словарь", () => {
  it("у каждого слова есть все 28 форм", () => {
    for (const word of WORDS) {
      for (const number of ["sg", "pl"] as const) {
        for (const c of CASES) {
          const variants = word.forms[`${number}.${c.key}`];
          expect(variants, `${word.lemma} ${number}.${c.key}`).not.toHaveLength(0);
        }
      }
    }
  });

  it("именительный ед. ч. совпадает со словарной формой", () => {
    for (const word of WORDS) expect(word.forms["sg.nom"]).toEqual([word.lemma]);
  });

  it("id слов уникальны", () => {
    expect(Object.keys(WORD_BY_ID)).toHaveLength(WORDS.length);
  });

  it("хранит параллельные формы", () => {
    expect(WORD_BY_ID.jalg!.forms["pl.part"]).toEqual(["jalgu", "jalgasid"]);
    expect(WORD_BY_ID.maja!.forms["sg.ill"]).toEqual(["majja", "majasse"]);
  });
});

describe("formationHint", () => {
  it("строит местные падежи от родительного", () => {
    const jalg = WORD_BY_ID.jalg!;
    expect(formationHint(jalg, "sg", "ga", "com")).toBe("jala + ga");
    expect(formationHint(jalg, "pl", "s", "ines")).toBe("jalgade + s");
    expect(formationHint(jalg, "pl", "", "nom")).toBe("jala + d");
    expect(formationHint(jalg, "sg", "", "part")).toBeNull();
  });
});
