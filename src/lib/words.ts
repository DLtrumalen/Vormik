import data from "@/data/words.json";
import type { CaseKey, GrammaticalNumber } from "./cases";

export type FormKey = `${GrammaticalNumber}.${CaseKey}`;

export type Word = {
  id: string;
  lemma: string;
  pos: "noun" | "adj";
  ru: string;
  forms: Record<FormKey, string[]>;
};

export const WORDS = data as Word[];

export const WORD_BY_ID: Record<string, Word> = Object.fromEntries(WORDS.map((w) => [w.id, w]));

/** Подсказка: как образуется форма. */
export function formationHint(
  word: Word,
  number: GrammaticalNumber,
  suffix: string,
  caseKey: CaseKey,
) {
  const sgGen = word.forms["sg.gen"][0];
  const plGen = word.forms["pl.gen"][0];
  if (caseKey === "nom") {
    return number === "pl" ? `${sgGen} + d` : null;
  }
  if (caseKey === "gen" || caseKey === "part" || !suffix) return null;
  return number === "sg" ? `${sgGen} + ${suffix}` : `${plGen} + ${suffix}`;
}
