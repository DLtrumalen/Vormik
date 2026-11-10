import { getDictionary, type Dictionary, type Locale } from "@/i18n";
import { CASE_BY_KEY, CASES, type CaseKey, type GrammaticalNumber } from "./cases";
import { normalize, type CheckResult } from "./check";
import { adjectiveNoun, sentenceTemplate } from "./usage";
import { WORD_BY_ID, type FormKey, type Word } from "./words";

export type Explanation = {
  /** Основной правильный ответ и остальные допустимые варианты. */
  answer: string;
  alternatives: string[];
  /** Что не так с ответом пользователя (пусто, если ответ верный). */
  mistake: string | null;
  /** Пошаговое образование формы именно этого слова. */
  steps: string[];
  /** Короткое правило: когда нужен этот падеж. */
  usage: string;
  /** Предложение с этим словом в нужной форме и перевод (для финского перевода нет). */
  example: Sentence;
};

export type Sentence = { et: string; translation: string | null };

/** Пропуск в предложении задания. */
export const GAP = "_____";

function first(word: Word, key: FormKey) {
  return word.forms[key][0]!;
}

function splitKey(key: FormKey) {
  return key.split(".") as [GrammaticalNumber, CaseKey];
}

/**
 * Какой форме этого же слова соответствует ответ пользователя. Одна и та же форма бывает в разных
 * падежах (kooli — omastav ед. ч. и osastav ед. ч.), поэтому сначала ищем тот же падеж в другом
 * числе, потом другие падежи того же числа и только потом остальное.
 */
function matchOtherForm(word: Word, input: string, target: FormKey): FormKey | null {
  const answer = normalize(input);
  const [number, caseKey] = splitKey(target);
  const otherNumber = number === "sg" ? "pl" : "sg";
  const candidates: FormKey[] = [
    `${otherNumber}.${caseKey}`,
    ...CASES.map((c): FormKey => `${number}.${c.key}`),
    ...CASES.map((c): FormKey => `${otherNumber}.${c.key}`),
  ];
  for (const key of candidates) {
    if (key === target) continue;
    if (word.forms[key].some((v) => normalize(v) === answer)) return key;
  }
  return null;
}

/** Основа, от которой строится падеж: родительный ед. ч. или тот родительный мн. ч., что в шагах. */
function caseStem(word: Word, number: GrammaticalNumber) {
  return number === "sg" ? first(word, "sg.gen") : pluralGenitive(word).form;
}

function describeMistake(
  t: Dictionary,
  word: Word,
  input: string,
  result: CheckResult,
  key: FormKey,
): string | null {
  if (result === "correct") return null;
  if (result === "diacritics") return t.explain.diacritics;
  if (/[а-яё]/i.test(input)) return t.explain.cyrillic;

  const [number, caseKey] = splitKey(key);
  const answer = normalize(input);
  const needed = `${CASE_BY_KEY[caseKey].et} (${t.cases[caseKey].name}), ${t.number[number]}`;
  const other = matchOtherForm(word, input, key);
  if (other) {
    const [otherNumber, otherCase] = splitKey(other);
    if (otherCase === caseKey && otherNumber !== number) {
      return t.explain.otherNumber(
        answer,
        CASE_BY_KEY[caseKey].et,
        t.number[otherNumber],
        t.number[number],
      );
    }
    const label = `${CASE_BY_KEY[otherCase].et} (${t.cases[otherCase].name}), ${t.number[otherNumber]}`;
    return t.explain.otherCase(answer, label, needed);
  }

  const suffix = CASE_BY_KEY[caseKey].suffix;
  const expectedStem = caseStem(word, number);
  // Основа верная — значит, ошибка в окончании (rongidenni вместо rongideni).
  if (suffix && answer.startsWith(expectedStem) && answer.length > expectedStem.length) {
    return t.explain.endingError(suffix, expectedStem);
  }
  if (suffix && answer.endsWith(suffix) && answer.length > suffix.length) {
    const stem = answer.slice(0, -suffix.length);
    if (stem !== expectedStem) return t.explain.stemError(suffix, stem, expectedStem);
  }

  return t.explain.noSuchForm(word.lemma, answer);
}

/**
 * Почему родительный мн. ч. оканчивается на -de или -te.
 * Правило: частичный ед. ч. на -t → -te (keelt → keelte), на гласную или -d → -de (pilti → piltide).
 * У части слов правило не работает (autot → autode) — тогда это исключение.
 */
export function pluralGenitive(word: Word):
  | {
      kind: "rule";
      ending: "de" | "te";
      reason: "vowel" | "d" | "t";
      form: string;
      others: string[];
    }
  | { kind: "exception"; form: string } {
  const sgPart = first(word, "sg.part");
  const forms = word.forms["pl.gen"];
  const reason = sgPart.endsWith("t") ? "t" : sgPart.endsWith("d") ? "d" : "vowel";
  const ending = reason === "t" ? "te" : "de";
  const form = forms.find((f) => f.endsWith(ending));
  if (!form) return { kind: "exception", form: forms[0]! };
  return { kind: "rule", ending, reason, form, others: forms.filter((f) => f !== form) };
}

/** Ошибся ли пользователь именно в -de/-te: написал «koolteks» вместо «koolideks». */
function mixedUpDeTe(input: string, base: string, suffix: string) {
  const answer = normalize(input);
  const stem = suffix && answer.endsWith(suffix) ? answer.slice(0, -suffix.length) : answer;
  if (base.endsWith("de")) return stem.endsWith("te");
  if (base.endsWith("te")) return stem.endsWith("de");
  return false;
}

function buildSteps(
  t: Dictionary,
  word: Word,
  number: GrammaticalNumber,
  caseKey: CaseKey,
  input: string,
) {
  const e = t.explain;
  const suffix = CASE_BY_KEY[caseKey].suffix;
  const target = word.forms[`${number}.${caseKey}`];
  const sgGen = first(word, "sg.gen");
  const sgPart = first(word, "sg.part");

  if (number === "sg" && caseKey === "gen") return e.genSg(word.lemma, sgGen);
  if (number === "sg" && caseKey === "part") return e.partSg(word.lemma, sgGen, sgPart);
  if (number === "pl" && caseKey === "part") {
    const steps = e.partPl(target.join(" / "));
    const sid = `${sgPart}sid`;
    if (/[aeiouõäöü]$/.test(sgPart) && target.includes(sid)) steps.push(e.partPlRule(sgPart, sid));
    return steps;
  }
  if (number === "pl" && caseKey === "nom") return [e.takeGen(word.lemma, sgGen), e.addD(sgGen)];

  if (number === "pl") {
    const why = pluralGenitive(word);
    const whyStep =
      why.kind === "rule"
        ? e.plGenRule(sgPart, why.ending, why.reason, why.form, why.others.join(" / "))
        : e.plGenException(sgPart, why.form);
    // Спрашивают сам родительный мн. ч. — объясняем, откуда -de или -te.
    if (caseKey === "gen") return [whyStep];
    // В остальных падежах мн. ч. правило -de/-te только мешает; показываем его, если ошибка именно в нём.
    const steps = [e.plBase(why.form)];
    if (mixedUpDeTe(input, why.form, suffix)) steps.push(whyStep);
    steps.push(e.addEnding(suffix, why.form));
    return steps;
  }

  // Единственное число, местные и остальные падежи.
  const steps = [e.takeGen(word.lemma, sgGen), e.addEnding(suffix, sgGen)];
  if (caseKey === "ill") {
    const short = target.filter((v) => v !== `${sgGen}sse`);
    if (short.length > 0) steps.push(e.shortIll(short.join(" / ")));
  }
  return steps;
}

/**
 * Слово в предложении. Существительное — сама форма; прилагательное — вместе с подходящим
 * существительным (kiires autos). «Стать каким», «будучи каким» — прилагательное без существительного.
 * Возвращает часть, которую спрашиваем, и существительное после неё.
 */
function phraseParts(word: Word, form: string, key: FormKey): [string, string | null] {
  const [, caseKey] = splitKey(key);
  if (word.pos !== "adj" || caseKey === "transl" || caseKey === "ess") return [form, null];
  // Существительное того же типа, что и прилагательное: длинная форма к длинной (headele sõpradele),
  // краткая к краткой (heile sõbrule).
  const byLength = (a: string, b: string) => b.length - a.length;
  const adjVariants = [...word.forms[key]].sort(byLength);
  const nounVariants = [...WORD_BY_ID[adjectiveNoun(word.lemma)]!.forms[key]].sort(byLength);
  const index = Math.max(0, adjVariants.indexOf(form));
  return [form, nounVariants[Math.min(index, nounVariants.length - 1)]!];
}

function fill(template: string, part: string, noun: string | null) {
  const text = template.replace("{}", noun ? `${part} ${noun}` : part);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function translate(word: Word, key: FormKey, locale: Locale) {
  const template = sentenceTemplate(word, key);
  return template && locale !== "fi" ? template[locale] : null;
}

/** Предложение задания с пропуском на месте нужной формы: «Ma sõidan _____.» */
export function taskSentence(word: Word, key: FormKey, locale: Locale): Sentence | null {
  const template = sentenceTemplate(word, key);
  if (!template) return null;
  // Существительное подбираем к той же форме, что покажем в ответе: иначе в задании могло бы
  // стоять «teile», а в ответе «lühikestele teedele».
  const [, noun] = phraseParts(word, explain(word, key, "", "wrong", locale).answer, key);
  return { et: fill(template.et, GAP, noun), translation: translate(word, key, locale) };
}

/** То же предложение с правильной формой: «Ma sõidan autoga.» */
export function fullSentence(word: Word, key: FormKey, form: string, locale: Locale): Sentence {
  const template = sentenceTemplate(word, key);
  const [part, noun] = phraseParts(word, form, key);
  if (!template) return { et: noun ? `${part} ${noun}` : part, translation: null };
  return { et: fill(template.et, part, noun), translation: translate(word, key, locale) };
}

export function explain(
  word: Word,
  key: FormKey,
  input: string,
  result: CheckResult,
  locale: Locale = "ru",
): Explanation {
  const t = getDictionary(locale);
  const [number, caseKey] = splitKey(key);
  const variants = word.forms[key];
  const steps = buildSteps(t, word, number, caseKey, input);

  // Форма, которая получается по правилу из шагов (строка вида «… = keeltelt.»).
  const ruleIndex = steps.findLastIndex((s) => s.includes(" = "));
  // Слово сразу после « = » (дальше в шаге может идти пояснение).
  const ruleResult =
    ruleIndex >= 0 ? (steps[ruleIndex]!.split(" = ")[1]!.match(/^[^\s.,]+/)?.[0] ?? null) : null;
  let derived: string | null = null;
  if (ruleResult && variants.includes(ruleResult)) {
    derived = ruleResult;
  } else if (ruleResult) {
    // По правилу получается не словарная форма — честно говорим, что её надо запомнить.
    steps.splice(ruleIndex, 1, t.explain.irregular(variants.join(" / ")));
  }

  // Краткие формы мн. ч. (keelilt, jalusse) строятся от частичного мн. ч. — объясняем их отдельно.
  // В родительном мн. ч. другие варианты уже названы в правиле -de/-te.
  if (derived && number === "pl" && caseKey !== "gen") {
    const others = variants.filter((v) => v !== derived);
    const suffix = CASE_BY_KEY[caseKey].suffix;
    const base = pluralGenitive(word).form;
    const altGens = word.forms["pl.gen"].filter((g) => g !== base);
    for (const gen of altGens) {
      const forms = others.filter((v) => v === `${gen}${suffix}`);
      if (forms.length > 0) steps.push(t.explain.altPlGen(gen, forms.join(" / ")));
    }
    const short = others.filter((v) => !altGens.some((g) => v === `${g}${suffix}`));
    if (short.length > 0) steps.push(t.explain.shortPl(short.join(" / "), short.length > 1));
  }

  // Крупно показываем то, что написал пользователь (если верно), иначе — форму из шагов.
  const typed = variants.find((v) => normalize(v) === normalize(input));
  // В иллативе ед. ч. первой стоит краткая форма (majja) — она употребительнее;
  // в родительном мн. ч. показываем форму, которую объясняет правило -de/-te (koerade, а не koerte).
  const preferred =
    number === "sg" && caseKey === "ill"
      ? variants[0]!
      : number === "pl" && caseKey === "gen"
        ? pluralGenitive(word).form
        : derived;
  const answer = (result === "correct" && typed) || preferred || variants[0]!;

  return {
    answer,
    alternatives: variants.filter((v) => v !== answer),
    // «ед. ч.» в конце фразы + точка предложения дали бы «ед. ч..».
    mistake: describeMistake(t, word, input, result, key)?.replace(/\.\./g, ".") ?? null,
    steps,
    usage: t.cases[caseKey].explanation,
    example: fullSentence(word, key, answer, locale),
  };
}
