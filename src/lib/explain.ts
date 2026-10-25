import { CASE_BY_KEY, CASES, NUMBER_LABEL, type CaseKey, type GrammaticalNumber } from "./cases";
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
  /** Пример с этим же словом в нужной форме. */
  example: { et: string; ru: string };
};

const NOUN_FOR_ADJECTIVES = "maja";

function formLabel(key: FormKey) {
  const [number, caseKey] = key.split(".") as [GrammaticalNumber, CaseKey];
  const info = CASE_BY_KEY[caseKey];
  return `${info.et} (${info.ru}), ${NUMBER_LABEL[number]}`;
}

function first(word: Word, key: FormKey) {
  return word.forms[key][0]!;
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
  word: Word,
  input: string,
  result: CheckResult,
  key: FormKey,
  number: GrammaticalNumber,
  caseKey: CaseKey,
): string | null {
  if (result === "correct") return null;
  if (result === "diacritics") {
    return "Почти: форма верная, но перепутаны эстонские буквы (õ, ä, ö, ü). Сравните с правильным ответом.";
  }

  const other = matchOtherForm(word, input, key);
  if (other) {
    const [otherNumber, otherCase] = other.split(".") as [GrammaticalNumber, CaseKey];
    if (otherCase === caseKey && otherNumber !== number) {
      return `«${normalize(input)}» — это ${CASE_BY_KEY[caseKey].et} ${NUMBER_LABEL[otherNumber]}, а нужно ${NUMBER_LABEL[number]}`;
    }
    return `«${normalize(input)}» — это другой падеж: ${formLabel(other)}`;
  }

  const suffix = CASE_BY_KEY[caseKey].suffix;
  const answer = normalize(input);
  if (suffix && answer.endsWith(suffix) && answer.length > suffix.length) {
    const stem = answer.slice(0, -suffix.length);
    const expectedStem = number === "sg" ? first(word, "sg.gen") : first(word, "pl.gen");
    return `Окончание -${suffix} верное, ошибка в основе: не «${stem}-», а «${expectedStem}-».`;
  }

  return `У слова ${word.lemma} нет формы «${answer}».`;
}

function buildSteps(word: Word, number: GrammaticalNumber, caseKey: CaseKey): string[] {
  const info = CASE_BY_KEY[caseKey];
  const target = word.forms[`${number}.${caseKey}`];
  const sgGen = first(word, "sg.gen");
  const sgPart = first(word, "sg.part");
  const plGen = first(word, "pl.gen");
  const steps: string[] = [];

  if (caseKey === "gen" && number === "sg") {
    return [
      `Родительный ед. ч. не строится по правилу — его запоминают вместе со словом: ${word.lemma} → ${sgGen}.`,
      `От этой формы образуется большинство других падежей: ${sgGen}s, ${sgGen}st, ${sgGen}ga…`,
    ];
  }
  if (caseKey === "part" && number === "sg") {
    return [
      `Частичный ед. ч. тоже запоминают вместе со словом: ${word.lemma} — ${sgGen} — ${sgPart}.`,
      `Эти три формы (именительный, родительный, частичный) — «ключ» к слову.`,
    ];
  }
  if (caseKey === "part" && number === "pl") {
    return [
      `Частичный мн. ч. нужно запомнить: ${target.join(" / ")}.`,
      `Для сравнения: частичный ед. ч. — ${sgPart}.`,
    ];
  }

  if (caseKey === "nom" && number === "pl") {
    steps.push(`Берём родительный ед. ч.: ${word.lemma} → ${sgGen}.`);
    steps.push(`Добавляем -d: ${sgGen} + d = ${sgGen}d.`);
    return steps;
  }

  if (number === "pl") {
    steps.push(`Родительный ед. ч.: ${word.lemma} → ${sgGen}, частичный ед. ч.: ${sgPart}.`);
    if (caseKey === "gen") {
      steps.push(
        `Родительный мн. ч. образуется от частичного ед. ч. + -de или -te: ${sgPart} → ${plGen}.`,
      );
      return steps;
    }
    steps.push(`Родительный мн. ч. (от частичного ед. ч. + -de/-te): ${plGen}.`);
    steps.push(
      `Добавляем окончание -${info.suffix}: ${plGen} + ${info.suffix} = ${plGen}${info.suffix}.`,
    );
    return steps;
  }

  // Единственное число, местные и остальные падежи.
  steps.push(`Берём родительный ед. ч.: ${word.lemma} → ${sgGen}.`);
  steps.push(
    `Добавляем окончание -${info.suffix}: ${sgGen} + ${info.suffix} = ${sgGen}${info.suffix}.`,
  );
  if (caseKey === "ill") {
    const short = target.filter((v) => !v.endsWith("sse"));
    if (short.length > 0) {
      steps.push(
        `У этого слова есть и краткая форма: ${short.join(" / ")} — в речи она встречается чаще. Обе формы правильные.`,
      );
    }
  }
  return steps;
}

/** В этих падежах прилагательное перед существительным стоит в родительном: suure majaga. */
const GENITIVE_ATTRIBUTE: CaseKey[] = ["term", "ess", "abess", "com"];

function buildExample(
  word: Word,
  form: string,
  key: FormKey,
  number: GrammaticalNumber,
  caseKey: CaseKey,
) {
  const info = CASE_BY_KEY[caseKey];
  const et = `${info.questionEt} → ${form}`;
  if (word.pos !== "adj") {
    return { et, ru: `${info.questionRu} → «${word.ru}», ${NUMBER_LABEL[number]}` };
  }

  const nounForm = first(WORD_BY_ID[NOUN_FOR_ADJECTIVES]!, key);
  if (GENITIVE_ATTRIBUTE.includes(caseKey)) {
    const adjGen = first(word, `${number}.gen`);
    return {
      et,
      ru: `С существительным: «${adjGen} ${nounForm}» («${word.ru} дом»). В падежах rajav, olev, ilmaütlev и kaasaütlev прилагательное перед существительным ставится в родительный.`,
    };
  }
  return {
    et,
    ru: `С существительным: «${form} ${nounForm}» («${word.ru} дом», ${NUMBER_LABEL[number]}) — прилагательное стоит в том же падеже, что и существительное.`,
  };
}

export function explain(word: Word, key: FormKey, input: string, result: CheckResult): Explanation {
  const [number, caseKey] = key.split(".") as [GrammaticalNumber, CaseKey];
  const variants = word.forms[key];
  const steps = buildSteps(word, number, caseKey);

  // Форма, которая получается по правилу из шагов (строка вида «… = keeltelt.»).
  const ruleIndex = steps.findLastIndex((s) => s.includes(" = "));
  const ruleResult = ruleIndex >= 0 ? steps[ruleIndex]!.split(" = ")[1]!.replace(/\.$/, "") : null;
  let derived: string | null = null;
  if (ruleResult && variants.includes(ruleResult)) {
    derived = ruleResult;
  } else if (ruleResult) {
    // По правилу получается не словарная форма — честно говорим, что её надо запомнить.
    steps.splice(
      ruleIndex,
      1,
      `Эта форма образуется не по общему правилу — её нужно запомнить: ${variants.join(" / ")}.`,
    );
  }

  // Краткие формы мн. ч. (keelilt, jalusse) строятся от частичного мн. ч. — объясняем их отдельно.
  if (derived && number === "pl") {
    const others = variants.filter((v) => v !== derived);
    if (others.length > 0) {
      steps.push(
        `Есть и краткая форма мн. ч. — от частичного мн. ч. (${first(word, "pl.part")}): ${others.join(" / ")}. Она тоже правильная.`,
      );
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
    mistake: describeMistake(word, input, result, key, number, caseKey),
    steps,
    usage: CASE_BY_KEY[caseKey].explanation,
    example: buildExample(word, answer, key, number, caseKey),
  };
}
