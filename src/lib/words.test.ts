import { describe, expect, it } from "vitest";
import { CASES } from "./cases";
import { WORDS, WORD_BY_ID } from "./words";

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

  it("не смешивает типы склонения омонимов (kool → kooli, а не koola)", () => {
    // Два родительных ед. ч. — признак того, что генератор смешал два разных слова.
    const allowed = new Set(["väike"]); // väikese / väikse — оба нормативны
    for (const word of WORDS) {
      if (allowed.has(word.lemma)) continue;
      expect(word.forms["sg.gen"], word.lemma).toHaveLength(1);
    }
    expect(WORD_BY_ID.kool!.forms["pl.gen"]).toEqual(["koolide"]);
    expect(WORD_BY_ID.silm!.forms["sg.gen"]).toEqual(["silma"]);
  });

  it("хранит параллельные формы", () => {
    expect(WORD_BY_ID.jalg!.forms["pl.part"]).toEqual(["jalgu", "jalgasid"]);
    expect(WORD_BY_ID.maja!.forms["sg.ill"]).toEqual(["majja", "majasse"]);
  });
});
