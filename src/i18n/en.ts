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
      name: "who? what?",
      question: "who? what?",
      ending: "—",
      explanation:
        "The subject and the dictionary form: Maja on suur. In the plural also a complete object: Ma ostsin raamatud.",
      example: "The house is big.",
    },
    gen: {
      name: "whose? of what?",
      question: "whose? of what?",
      ending: "vowel",
      explanation:
        "Whose? of what?: maja uks — the door of the house. Also a complete object (Ma ostsin raamatu) and words like juures, jaoks, kohta: maja juures.",
      example: "The door of the house is open.",
    },
    part: {
      name: "what? (part or ongoing)",
      question: "whom? what? (part of)",
      ending: "-t, -d or vowel",
      explanation:
        "An incomplete object or an action in progress (Ma loen raamatut), part of something (Ma joon vett), after negation (Ma ei näe maja) and after numbers from two (kaks maja).",
      example: "I drink water.",
    },
    ill: {
      name: "where to? into what?",
      question: "where to? into what?",
      ending: "-sse or short form",
      explanation: "Movement into something: where to? into what?",
      example: "I go into the house.",
    },
    ines: {
      name: "where? in what?",
      question: "where? in what?",
      ending: "-s",
      explanation: "Being inside something.",
      example: "I am in the house.",
    },
    ela: {
      name: "where from? out of what?",
      question: "where from? out of what?",
      ending: "-st",
      explanation: "Movement out of something, and the topic of conversation: what we talk about.",
      example: "I come out of the house.",
    },
    all: {
      name: "where to? onto what? to whom?",
      question: "where to? to whom? onto what?",
      ending: "-le",
      explanation: "Movement onto a surface, and the recipient: to whom.",
      example: "I give the book to a friend.",
    },
    ade: {
      name: "where? on what? who has?",
      question: "where? on what? who has?",
      ending: "-l",
      explanation: "Being on a surface, and possession: I have.",
      example: "The book is on the table.",
    },
    abl: {
      name: "where from? off what? from whom?",
      question: "where from? from whom? off what?",
      ending: "-lt",
      explanation: "Movement off a surface, and the source: from whom.",
      example: "I take the book from the table.",
    },
    transl: {
      name: "become what?",
      question: "into what? (become)",
      ending: "-ks",
      explanation: "What something turns into or whom someone becomes.",
      example: "He wants to become a doctor.",
    },
    term: {
      name: "up to what?",
      question: "up to whom? up to what?",
      ending: "-ni",
      explanation: "A limit in space or time: up to, until.",
      example: "I walk up to the river.",
    },
    ess: {
      name: "as what?",
      question: "as whom? as what?",
      ending: "-na",
      explanation: "In the role of someone or something.",
      example: "He works as a doctor.",
    },
    abess: {
      name: "without what?",
      question: "without whom? without what?",
      ending: "-ta",
      explanation: "The absence of something.",
      example: "I drink coffee without milk.",
    },
    com: {
      name: "with what? with whom?",
      question: "with whom? with what?",
      ending: "-ga",
      explanation: "Together with someone or by means of something.",
      example: "I go to the cinema with a friend.",
    },
  },

  site: {
    tagline: "Estonian case trainer",
    title: "Estonian cases without memorising tables",
    lead: "Vormik gives you a word, a case and a short sentence with a gap — you type the right form. Mistakes come back more often, what you know comes back less. All 14 cases, both numbers, explanations in English.",
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
      {
        title: "Word and case",
        text: "For example: jalg, sisseütlev (where to? into what?), plural — and a short sentence with a gap.",
      },
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
    downloadWindows: "Download for Windows",
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
    theme: "Appearance",
    themes: { dark: "Dark", light: "Light" },
    switchTo: { dark: "Switch to dark theme", light: "Switch to light theme" },
  },

  picker: {
    quick: "Quick select",
    number: "Number",
    groups: ["Basic", "Inner local · in / out", "Outer local · on / off", "Other"],
    presets: ["All 14", "Basic", "Local (6)", "Other (5)"],
    minHint:
      "At least one task must remain. Nominative singular is the dictionary form, so it is never asked.",
    all: "All cases",
    count: (n) => `${n} cases`,
    bothNumbers: "sg. & pl.",
  },

  explain: {
    diacritics:
      "The form is right, but the Estonian letters (õ, ä, ö, ü) are mixed up. Compare with the correct answer.",
    cyrillic:
      "It looks like a Cyrillic keyboard is on: your answer has Cyrillic letters. Switch to Latin.",
    otherNumber: (input, caseEt, actual, needed) =>
      `“${input}” is ${caseEt}, ${actual}, but ${needed} is needed.`,
    otherCase: (input, label, needed) => `“${input}” is ${label}. ${needed} is needed.`,
    stemError: (suffix, stem, expected) =>
      `The ending -${suffix} is right, the stem is wrong: not “${stem}-” but “${expected}-”.`,
    endingError: (suffix, stem) =>
      `The stem ${stem}- is right, the ending is wrong: it should be -${suffix}.`,
    noSuchForm: (lemma, input) => `The word ${lemma} has no form “${input}”.`,
    genSg: (lemma, sgGen) => [
      `Memorise the omastav (genitive) singular together with the word: ${lemma} → ${sgGen}.`,
      `Almost all other cases are built on it: ${sgGen}s, ${sgGen}st, ${sgGen}ga…`,
    ],
    partSg: (lemma, sgGen, sgPart) => [
      `Memorise the osastav (partitive) singular with the word too: ${lemma} — ${sgGen} — ${sgPart}.`,
    ],
    partPl: (forms) => [`Memorise the osastav plural: ${forms}.`],
    partPlRule: (sgPart, form) =>
      `Tip: if the osastav singular ends in a vowel, you can add -sid: ${sgPart} + sid = ${form}.`,
    takeGen: (lemma, sgGen) => `Take the omastav (genitive) singular: ${lemma} → ${sgGen}.`,
    addD: (sgGen) => `Add -d: ${sgGen} + d = ${sgGen}d.`,
    plBase: (plGen) => `Plural cases are built on the omastav plural: ${plGen}.`,
    plGenRule: (sgPart, ending, reason, plGen, others) =>
      `Look at the osastav singular ${sgPart}: it ends in ${
        { vowel: "a vowel", d: "‑d", t: "‑t" }[reason]
      }, so add ‑${ending}: ${plGen.slice(0, -2)} + ${ending} = ${plGen}.${
        others ? ` Also correct: ${others}.` : ""
      } ${
        ending === "de"
          ? "If it ended in ‑t, it would be ‑te: keelt → keelte."
          : "If it ended in a vowel, it would be ‑de: pilti → piltide."
      }`,
    plGenException: (sgPart, plGen) =>
      `This word is an exception: ${sgPart} → ${plGen}. Just memorise this form.`,
    addEnding: (suffix, base) =>
      `Add the ending -${suffix}: ${base} + ${suffix} = ${base}${suffix}.`,
    shortIll: (short) =>
      `There is also a short form, ${short}, which is common too. Both forms are correct.`,
    irregular: (forms) => `This form does not follow the general rule — memorise it: ${forms}.`,
    shortPl: (forms, many) =>
      many
        ? `There are also short forms: ${forms}. They are correct too.`
        : `There is also a short form: ${forms}. It is correct too.`,
    altPlGen: (gen, forms) =>
      `You can also build it on the second omastav plural (${gen}): ${forms}.`,
  },
};
