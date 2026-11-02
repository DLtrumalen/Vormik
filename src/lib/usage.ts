import adjectiveNouns from "@/data/adjective-nouns.json";
import sentenceData from "@/data/sentences.json";
import type { CaseKey, GrammaticalNumber } from "./cases";
import type { FormKey, Word } from "./words";

/** Существительное, с которым показываем прилагательное в примерах: kiire auto, noor mees. */
export function adjectiveNoun(adjective: string): string {
  return (adjectiveNouns as Record<string, string>)[adjective] ?? "maja";
}

/**
 * Короткое предложение для формы: эстонский шаблон («Ma sõidan {}.», вместо {} — форма слова)
 * и готовый перевод. Генерирует scripts/generate_sentences.py.
 */
export type SentenceTemplate = { et: string; ru: string; en: string };

const SENTENCES = sentenceData as Record<string, Partial<Record<FormKey, SentenceTemplate>>>;

export function sentenceTemplate(word: Word, key: FormKey): SentenceTemplate | undefined {
  return SENTENCES[word.id]?.[key];
}

/**
 * Какие сочетания «слово + падеж» спрашивать. Грамматически форму можно построить у любого слова,
 * но часть сочетаний в жизни не встречается: leivani («до хлеба»), lauana («в качестве стола»),
 * emas («в маме»). Задание есть, только если для формы есть естественное предложение.
 */
export function isNaturalTask(word: Word, number: GrammaticalNumber, caseKey: CaseKey): boolean {
  return sentenceTemplate(word, `${number}.${caseKey}`) !== undefined;
}
