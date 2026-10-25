import type { Dictionary } from "./types";

export const en: Dictionary = {
  locale: "en",
  name: "English",
  meta: {
    title: "Vormik — Estonian case trainer",
    description:
      "Practise Estonian word forms in all 14 cases. Spaced repetition and clear explanations.",
  },
  number: { sg: "singular", pl: "plural" },
  numberFull: { sg: "Singular", pl: "Plural" },
  pos: { noun: "noun", adj: "adjective" },
  language: "Language",
  cases: {
    nom: {
      name: "nominative",
      question: "who? what?",
      ending: "—",
      explanation: "The dictionary form. In the plural: genitive stem + -d.",
      example: "The house is big.",
    },
    gen: {
      name: "genitive",
      question: "whose? of what?",
      ending: "vowel",
      explanation:
        "The key form to learn: most other cases are built from it. In the plural: -de or -te.",
      example: "The door of the house is open.",
    },
    part: {
      name: "partitive",
      question: "whom? what? (part of)",
      ending: "-t, -d or vowel",
      explanation:
        "Partial object, part of something, negation, numbers from two up. Learn this form together with the word.",
      example: "I drink water.",
    },
    ill: {
      name: "illative",
      question: "where to? into what?",
      ending: "-sse or short form",
      explanation: "Movement into something: where to? into what?",
      example: "I go into the house.",
    },
    ines: {
      name: "inessive",
      question: "where? in what?",
      ending: "-s",
      explanation: "Being inside something.",
      example: "I am in the house.",
    },
    ela: {
      name: "elative",
      question: "where from? out of what?",
      ending: "-st",
      explanation: "Movement out of something, and the topic of conversation: what we talk about.",
      example: "I come out of the house.",
    },
    all: {
      name: "allative",
      question: "where to? to whom? onto what?",
      ending: "-le",
      explanation: "Movement onto a surface, and the recipient: to whom.",
      example: "I give the book to a friend.",
    },
    ade: {
      name: "adessive",
      question: "where? on what? who has?",
      ending: "-l",
      explanation: "Being on a surface, and possession: I have.",
      example: "The book is on the table.",
    },
    abl: {
      name: "ablative",
      question: "where from? from whom? off what?",
      ending: "-lt",
      explanation: "Movement off a surface, and the source: from whom.",
      example: "I take the book from the table.",
    },
    transl: {
      name: "translative",
      question: "into what? (become)",
      ending: "-ks",
      explanation: "What something turns into or whom someone becomes.",
      example: "He wants to become a doctor.",
    },
    term: {
      name: "terminative",
      question: "up to whom? up to what?",
      ending: "-ni",
      explanation: "A limit in space or time: up to, until.",
      example: "I walk up to the river.",
    },
    ess: {
      name: "essive",
      question: "as whom? as what?",
      ending: "-na",
      explanation: "In the role of someone or something.",
      example: "He works as a doctor.",
    },
    abess: {
      name: "abessive",
      question: "without whom? without what?",
      ending: "-ta",
      explanation: "The absence of something.",
      example: "I drink coffee without milk.",
    },
    com: {
      name: "comitative",
      question: "with whom? with what?",
      ending: "-ga",
      explanation: "Together with someone or by means of something.",
      example: "I go to the cinema with a friend.",
    },
  },

  site: {
    tagline: "Estonian case trainer",
    title: "Estonian cases without memorising tables",
    lead: "Vormik gives you a word and a case — you type the form. Mistakes come back more often, what you know comes back less. All 14 cases, both numbers, explanations in English.",
    perks: "Free · no sign-up · works offline",
    nav: { features: "Features", cases: "Cases" },
    openTrainer: "Open trainer",
    stats: { cases: "cases", words: "common words", forms: "forms to practise" },
    featuresTitle: "Why it works",
    features: [
      {
        title: "Spaced repetition",
        text: "The FSRS algorithm, as in Anki, picks the moment to review: hard forms come back more often, learned ones less often.",
      },
      {
        title: "Clear explanations",
        text: "After each answer you see how the form is built (jala + ga), the word's key forms and an example.",
      },
      {
        title: "All correct variants",
        text: "jalgu and jalgasid, majja and majasse: the trainer knows parallel forms and accepts any correct one.",
      },
      {
        title: "Works offline",
        text: "Install the app on your phone or computer. No sign-up — your progress is stored on your device.",
      },
    ],
    stepsTitle: "How a session works",
    steps: [
      { title: "Word and case", text: "For example: jalg, illative, plural." },
      {
        title: "Your answer",
        text: "Type the form. There are buttons for õ ä ö ü — no Estonian keyboard needed.",
      },
      {
        title: "Feedback and review",
        text: "You see right away whether it's correct and why. A mistake returns in a minute, a success in days.",
      },
    ],
    casesTitle: "All 14 cases",
    casesLead:
      "A cheat sheet that is also inside the trainer: question, ending and example for every case.",
    footerProject: "Vormik — a learning project for students of Estonian.",
    footerForms: "Word forms are generated by the morphological generator",
    preview: { correct: "Correct!", alsoCorrect: "Also correct", howBuilt: "How it's built" },
  },

  install: {
    download: "Download app",
    openTrainer: "Open trainer",
  },

  app: {
    tabs: { learn: "Learn", progress: "Progress", settings: "Settings" },
    sections: "Sections",
    home: "Home",
    learned: "learned",
    due: "to review",
    fresh: "new",
    learningNow: "Learning now",
    chooseCases: "Choose cases",
    pickerTitle: "Which cases to practise",
    done: "Done",
    loading: "Loading the trainer",
  },

  task: {
    isNew: "new",
    review: "review",
    answerLabel: "Word form",
    placeholder: "Your answer",
    letters: "Estonian letters",
    empty: "Type your answer first.",
    check: "Check",
    next: "Next",
    verdict: {
      correct: "Correct!",
      diacritics: "Almost! Check the Estonian letters",
      wrong: "Not yet — this form will come back in a minute",
    },
    alsoCorrect: "Also correct",
    whatsWrong: "What went wrong.",
    howTitle: "How this form is built",
    whenTitle: "When this case is used",
    exampleTitle: "Example with this word",
  },

  done: {
    title: "All done for now",
    answered: (n) => `Answers this session: ${n}`,
    nextReview: (when) => `Next review ${when}.`,
    allDone: "You've gone through all forms for the current settings.",
    addNew: "10 more new forms",
    refresh: "Check again",
  },

  stats: {
    title: "How the cases are going",
    empty: "Answer a few tasks and your statistics will appear here.",
    weakest: "Hardest:",
    weakestNote: "These forms will come up more often.",
    notEnough: (n) =>
      `Total answers: ${n}. At least 3 answers per case are needed to draw conclusions.`,
    outOf: (n) => `of ${n}`,
    reset: "Reset progress",
    confirmReset: "Delete all progress? This can't be undone.",
  },

  settings: {
    title: "What to practise",
    lead: "Choose cases and number. Tasks will only come from your selection.",
    footer: "Vormik — Estonian case trainer.",
    about: "About",
  },

  picker: {
    quick: "Quick select",
    number: "Number",
    groups: ["Basic", "Inner local · in / out", "Outer local · on / off", "Other"],
    presets: ["All 14", "Basic", "Local (6)", "Other (5)"],
    minHint: "Select at least one case and one number.",
    all: "All cases",
    count: (n) => `${n} cases`,
    bothNumbers: "sg. & pl.",
  },

  explain: {
    diacritics:
      "Almost: the form is right, but the Estonian letters (õ, ä, ö, ü) are mixed up. Compare with the correct answer.",
    otherNumber: (input, caseEt, actual, needed) =>
      `“${input}” is ${caseEt} ${actual}, but ${needed} is needed`,
    otherCase: (input, label) => `“${input}” is a different case: ${label}`,
    stemError: (suffix, stem, expected) =>
      `The ending -${suffix} is right, the stem is wrong: not “${stem}-” but “${expected}-”.`,
    noSuchForm: (lemma, input) => `The word ${lemma} has no form “${input}”.`,
    genSg: (lemma, sgGen) => [
      `The genitive singular doesn't follow a rule — learn it together with the word: ${lemma} → ${sgGen}.`,
      `Most other cases are built from it: ${sgGen}s, ${sgGen}st, ${sgGen}ga…`,
    ],
    partSg: (lemma, sgGen, sgPart) => [
      `The partitive singular is also learned together with the word: ${lemma} — ${sgGen} — ${sgPart}.`,
      "These three forms (nominative, genitive, partitive) are the “key” to the word.",
    ],
    partPl: (forms, sgPart) => [
      `The partitive plural has to be memorised: ${forms}.`,
      `Compare: partitive singular — ${sgPart}.`,
    ],
    takeGen: (lemma, sgGen) => `Take the genitive singular: ${lemma} → ${sgGen}.`,
    addD: (sgGen) => `Add -d: ${sgGen} + d = ${sgGen}d.`,
    plIntro: (lemma, sgGen, sgPart) =>
      `Genitive singular: ${lemma} → ${sgGen}, partitive singular: ${sgPart}.`,
    plGenFrom: (sgPart, plGen) =>
      `The genitive plural is built from the partitive singular + -de or -te: ${sgPart} → ${plGen}.`,
    plGenIs: (plGen) => `Genitive plural (partitive singular + -de/-te): ${plGen}.`,
    addEnding: (suffix, base) =>
      `Add the ending -${suffix}: ${base} + ${suffix} = ${base}${suffix}.`,
    shortIll: (short) =>
      `This word also has a short form: ${short} — it is more common in speech. Both forms are correct.`,
    irregular: (forms) => `This form doesn't follow the general rule — memorise it: ${forms}.`,
    shortPl: (plPart, others) =>
      `There is also a short plural form, built from the partitive plural (${plPart}): ${others}. It is correct too.`,
    exampleNoun: (question, translation, number) => `${question} → “${translation}”, ${number}`,
    exampleAdjGenitive: (phrase, translation) =>
      `With a noun: “${phrase}” (“${translation}”). In rajav, olev, ilmaütlev and kaasaütlev an adjective before a noun takes the genitive.`,
    exampleAdj: (phrase, translation, number) =>
      `With a noun: “${phrase}” (“${translation}”, ${number}) — the adjective takes the same case as the noun.`,
    house: "house",
  },
};
