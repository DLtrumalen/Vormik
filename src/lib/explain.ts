import { getDictionary, type Dictionary, type Locale } from "@/i18n";
import { CASE_BY_KEY, CASES, type CaseKey, type GrammaticalNumber } from "./cases";
import { normalize, type CheckResult } from "./check";
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
  /** Пример с этим же словом в нужной форме и пояснение к нему на языке интерфейса. */
  example: { et: string; note: string };
};

const NOUN_FOR_ADJECTIVES = "maja";

/** В этих падежах прилагательное перед существительным стоит в родительном: suure majaga. */
const GENITIVE_ATTRIBUTE: CaseKey[] = ["term", "ess", "abess", "com"];

function first(word: Word, key: FormKey) {
  return word.forms[key][0]!;
}

function splitKey(key: FormKey) {
  return key.split(".") as [GrammaticalNumber, CaseKey];
}

/** Какой форме этого же слова соответствует ответ пользователя. */
function matchOtherForm(word: Word, input: string, target: FormKey): FormKey | null {
  const answer = normalize(input);
  for (const number of ["sg", "pl"] as const) {
    for (const c of CASES) {
      const key: FormKey = `${number}.${c.key}`;
      if (key === target) continue;
      if (word.forms[key].some((v) => normalize(v) === answer)) return key;
    }
  }
  return null;
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

  const [number, caseKey] = splitKey(key);
  const answer = normalize(input);
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
    return t.explain.otherCase(answer, label);
  }

  const suffix = CASE_BY_KEY[caseKey].suffix;
  if (suffix && answer.endsWith(suffix) && answer.length > suffix.length) {
    const stem = answer.slice(0, -suffix.length);
    const expectedStem = number === "sg" ? first(word, "sg.gen") : first(word, "pl.gen");
    return t.explain.stemError(suffix, stem, expectedStem);
  }

  return t.explain.noSuchForm(word.lemma, answer);
}

function buildSteps(t: Dictionary, word: Word, number: GrammaticalNumber, caseKey: CaseKey) {
  const e = t.explain;
  const suffix = CASE_BY_KEY[caseKey].suffix;
  const target = word.forms[`${number}.${caseKey}`];
  const sgGen = first(word, "sg.gen");
  const sgPart = first(word, "sg.part");
  const plGen = first(word, "pl.gen");

  if (number === "sg" && caseKey === "gen") return e.genSg(word.lemma, sgGen);
  if (number === "sg" && caseKey === "part") return e.partSg(word.lemma, sgGen, sgPart);
  if (number === "pl" && caseKey === "part") return e.partPl(target.join(" / "), sgPart);
  if (number === "pl" && caseKey === "nom") return [e.takeGen(word.lemma, sgGen), e.addD(sgGen)];

  if (number === "pl") {
    const intro = e.plIntro(word.lemma, sgGen, sgPart);
    if (caseKey === "gen") return [intro, e.plGenFrom(sgPart, plGen)];
    return [intro, e.plGenIs(plGen), e.addEnding(suffix, plGen)];
  }

  // Единственное число, местные и остальные падежи.
  const steps = [e.takeGen(word.lemma, sgGen), e.addEnding(suffix, sgGen)];
  if (caseKey === "ill") {
    const short = target.filter((v) => !v.endsWith("sse"));
    if (short.length > 0) steps.push(e.shortIll(short.join(" / ")));
  }
  return steps;
}

function buildExample(t: Dictionary, word: Word, form: string, key: FormKey) {
  const [number, caseKey] = splitKey(key);
  const et = `${CASE_BY_KEY[caseKey].questionEt} → ${form}`;
  const translation = word.tr[t.locale];
  if (word.pos !== "adj") {
    return {
      et,
      note: t.explain.exampleNoun(t.cases[caseKey].question, translation, t.number[number]),
    };
  }

  const nounForm = first(WORD_BY_ID[NOUN_FOR_ADJECTIVES]!, key);
  const phraseTranslation = `${translation} ${t.explain.house}`;
  if (GENITIVE_ATTRIBUTE.includes(caseKey)) {
    const adjGen = first(word, `${number}.gen`);
    return { et, note: t.explain.exampleAdjGenitive(`${adjGen} ${nounForm}`, phraseTranslation) };
  }
  return {
    et,
    note: t.explain.exampleAdj(`${form} ${nounForm}`, phraseTranslation, t.number[number]),
  };
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
  const steps = buildSteps(t, word, number, caseKey);

  // Форма, которая получается по правилу из шагов (строка вида «… = keeltelt.»).
  const ruleIndex = steps.findLastIndex((s) => s.includes(" = "));
  const ruleResult = ruleIndex >= 0 ? steps[ruleIndex]!.split(" = ")[1]!.replace(/\.$/, "") : null;
  let derived: string | null = null;
  if (ruleResult && variants.includes(ruleResult)) {
    derived = ruleResult;
  } else if (ruleResult) {
    // По правилу получается не словарная форма — честно говорим, что её надо запомнить.
    steps.splice(ruleIndex, 1, t.explain.irregular(variants.join(" / ")));
  }

  // Краткие формы мн. ч. (keelilt, jalusse) строятся от частичного мн. ч. — объясняем их отдельно.
  if (derived && number === "pl") {
    const others = variants.filter((v) => v !== derived);
    if (others.length > 0) {
      steps.push(t.explain.shortPl(first(word, "pl.part"), others.join(" / ")));
    }
  }

  // Крупно показываем то, что написал пользователь (если верно), иначе — форму из шагов.
  const typed = variants.find((v) => normalize(v) === normalize(input));
  // В иллативе ед. ч. первой стоит краткая форма (majja) — она употребительнее.
  const preferred = number === "sg" && caseKey === "ill" ? variants[0]! : derived;
  const answer = (result === "correct" && typed) || preferred || variants[0]!;

  return {
    answer,
    alternatives: variants.filter((v) => v !== answer),
    mistake: describeMistake(t, word, input, result, key),
    steps,
    usage: t.cases[caseKey].explanation,
    example: buildExample(t, word, answer, key),
  };
}
