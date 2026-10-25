import type { CaseKey, GrammaticalNumber } from "@/lib/cases";

export const LOCALES = ["ru", "en", "fi"] as const;
export type Locale = (typeof LOCALES)[number];

/** Тексты разбора ответа. Шаг с формулой обязан иметь вид «… основа + окончание = форма.». */
export type ExplainText = {
  diacritics: string;
  otherNumber: (input: string, caseEt: string, actual: string, needed: string) => string;
  otherCase: (input: string, label: string) => string;
  stemError: (suffix: string, stem: string, expected: string) => string;
  noSuchForm: (lemma: string, input: string) => string;
  genSg: (lemma: string, sgGen: string) => string[];
  partSg: (lemma: string, sgGen: string, sgPart: string) => string[];
  partPl: (forms: string, sgPart: string) => string[];
  takeGen: (lemma: string, sgGen: string) => string;
  addD: (sgGen: string) => string;
  plIntro: (lemma: string, sgGen: string, sgPart: string) => string;
  plGenFrom: (sgPart: string, plGen: string) => string;
  plGenIs: (plGen: string) => string;
  addEnding: (suffix: string, base: string) => string;
  shortIll: (short: string) => string;
  irregular: (forms: string) => string;
  shortPl: (plPart: string, others: string) => string;
  exampleNoun: (question: string, translation: string, number: string) => string;
  exampleAdjGenitive: (phrase: string, translation: string) => string;
  exampleAdj: (phrase: string, translation: string, number: string) => string;
  /** Слово «дом» для примеров с прилагательными (maja). */
  house: string;
};

export type CaseText = {
  name: string;
  question: string;
  ending: string;
  explanation: string;
  example: string;
};

export type Dictionary = {
  locale: Locale;
  /** Название языка в переключателе. */
  name: string;
  meta: { title: string; description: string };
  number: Record<GrammaticalNumber, string>;
  numberFull: Record<GrammaticalNumber, string>;
  pos: { noun: string; adj: string };
  cases: Record<CaseKey, CaseText>;
  language: string;

  site: {
    tagline: string;
    title: string;
    lead: string;
    perks: string;
    nav: { features: string; cases: string };
    openTrainer: string;
    stats: { cases: string; words: string; forms: string };
    featuresTitle: string;
    features: { title: string; text: string }[];
    stepsTitle: string;
    steps: { title: string; text: string }[];
    casesTitle: string;
    casesLead: string;
    footerProject: string;
    footerForms: string;
    preview: { correct: string; alsoCorrect: string; howBuilt: string };
  };

  install: {
    download: string;
    openTrainer: string;
  };

  app: {
    tabs: { learn: string; progress: string; settings: string };
    sections: string;
    home: string;
    learned: string;
    due: string;
    fresh: string;
    learningNow: string;
    chooseCases: string;
    pickerTitle: string;
    done: string;
    loading: string;
  };

  task: {
    isNew: string;
    review: string;
    answerLabel: string;
    placeholder: string;
    letters: string;
    empty: string;
    check: string;
    next: string;
    verdict: { correct: string; diacritics: string; wrong: string };
    alsoCorrect: string;
    whatsWrong: string;
    howTitle: string;
    whenTitle: string;
    exampleTitle: string;
  };

  done: {
    title: string;
    answered: (n: number) => string;
    nextReview: (when: string) => string;
    allDone: string;
    addNew: string;
    refresh: string;
  };

  stats: {
    title: string;
    empty: string;
    weakest: string;
    weakestNote: string;
    notEnough: (total: number) => string;
    outOf: (total: number) => string;
    reset: string;
    confirmReset: string;
  };

  settings: { title: string; lead: string; footer: string; about: string };

  picker: {
    quick: string;
    number: string;
    groups: [string, string, string, string];
    presets: [string, string, string, string];
    minHint: string;
    all: string;
    count: (n: number) => string;
    bothNumbers: string;
  };

  explain: ExplainText;
};
