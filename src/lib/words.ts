import data from "@/data/words.json";
import type { Locale } from "@/i18n";
import type { CaseKey, GrammaticalNumber } from "./cases";

export type FormKey = `${GrammaticalNumber}.${CaseKey}`;

export type Word = {
  id: string;
  lemma: string;
  pos: "noun" | "adj";
  /** Перевод слова на языки интерфейса. */
  tr: Record<Locale, string>;
  forms: Record<FormKey, string[]>;
};

export const WORDS = data as Word[];

export const WORD_BY_ID: Record<string, Word> = Object.fromEntries(WORDS.map((w) => [w.id, w]));
