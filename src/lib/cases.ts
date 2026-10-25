export type CaseKey =
  | "nom"
  | "gen"
  | "part"
  | "ill"
  | "ines"
  | "ela"
  | "all"
  | "ade"
  | "abl"
  | "transl"
  | "term"
  | "ess"
  | "abess"
  | "com";

export type GrammaticalNumber = "sg" | "pl";

export type CaseInfo = {
  key: CaseKey;
  /** Эстонское название падежа. */
  et: string;
  /** Русское название. */
  ru: string;
  /** Вопросы по-эстонски. */
  questionEt: string;
  /** Вопросы по-русски. */
  questionRu: string;
  /** Окончание единственного числа. */
  ending: string;
  /** Окончание, которое добавляется к форме родительного падежа (пусто — форма не строится от неё). */
  suffix: string;
  explanation: string;
  example: { et: string; ru: string };
};

export const CASES: CaseInfo[] = [
  {
    key: "nom",
    et: "nimetav",
    ru: "именительный",
    questionEt: "kes? mis?",
    questionRu: "кто? что?",
    ending: "—",
    suffix: "",
    explanation: "Словарная форма. Во множественном числе: основа родительного + -d.",
    example: { et: "Maja on suur.", ru: "Дом большой." },
  },
  {
    key: "gen",
    et: "omastav",
    ru: "родительный",
    questionEt: "kelle? mille?",
    questionRu: "чей? чего?",
    ending: "гласная",
    suffix: "",
    explanation:
      "Главная форма для запоминания: от неё образуется большинство других падежей. Во множественном числе: -de или -te.",
    example: { et: "Maja uks on lahti.", ru: "Дверь дома открыта." },
  },
  {
    key: "part",
    et: "osastav",
    ru: "частичный (партитив)",
    questionEt: "keda? mida?",
    questionRu: "кого? что? (часть)",
    ending: "-t, -d или гласная",
    suffix: "",
    explanation:
      "Неполный объект, часть чего-то, отрицание, числа после двух. Форму нужно запоминать вместе со словом.",
    example: { et: "Ma joon vett.", ru: "Я пью воду." },
  },
  {
    key: "ill",
    et: "sisseütlev",
    ru: "входный (иллатив)",
    questionEt: "kuhu? kellesse? millesse?",
    questionRu: "куда? во что?",
    ending: "-sse или краткая форма",
    suffix: "sse",
    explanation:
      "Движение внутрь. У многих слов есть краткая форма (majja, kätte) — обе формы правильные.",
    example: { et: "Ma lähen majja.", ru: "Я иду в дом." },
  },
  {
    key: "ines",
    et: "seesütlev",
    ru: "внутриместный (инессив)",
    questionEt: "kus? kelles? milles?",
    questionRu: "где? в чём?",
    ending: "-s",
    suffix: "s",
    explanation: "Нахождение внутри чего-то.",
    example: { et: "Ma olen majas.", ru: "Я в доме." },
  },
  {
    key: "ela",
    et: "seestütlev",
    ru: "исходный (элатив)",
    questionEt: "kust? kellest? millest?",
    questionRu: "откуда? из чего?",
    ending: "-st",
    suffix: "st",
    explanation: "Движение изнутри наружу, а также тема разговора: räägime filmist.",
    example: { et: "Ma tulen majast.", ru: "Я выхожу из дома." },
  },
  {
    key: "all",
    et: "alaleütlev",
    ru: "направительный (аллатив)",
    questionEt: "kuhu? kellele? millele?",
    questionRu: "куда? кому? на что?",
    ending: "-le",
    suffix: "le",
    explanation: "Движение на поверхность, а также адресат: кому дать.",
    example: { et: "Ma annan raamatu sõbrale.", ru: "Я даю книгу другу." },
  },
  {
    key: "ade",
    et: "alalütlev",
    ru: "наружноместный (адессив)",
    questionEt: "kus? kellel? millel?",
    questionRu: "где? у кого? на чём?",
    ending: "-l",
    suffix: "l",
    explanation: "Нахождение на поверхности, а также обладание: у меня есть.",
    example: { et: "Raamat on laual.", ru: "Книга на столе." },
  },
  {
    key: "abl",
    et: "alaltütlev",
    ru: "отложительный (аблатив)",
    questionEt: "kust? kellelt? millelt?",
    questionRu: "откуда? от кого? с чего?",
    ending: "-lt",
    suffix: "lt",
    explanation: "Движение с поверхности, а также источник: от кого получил.",
    example: { et: "Ma võtan raamatu laualt.", ru: "Я беру книгу со стола." },
  },
  {
    key: "transl",
    et: "saav",
    ru: "превратительный (транслатив)",
    questionEt: "kelleks? milleks?",
    questionRu: "кем? чем? (стать)",
    ending: "-ks",
    suffix: "ks",
    explanation: "Во что превращается или кем становится.",
    example: { et: "Ta tahab saada arstiks.", ru: "Он хочет стать врачом." },
  },
  {
    key: "term",
    et: "rajav",
    ru: "предельный (терминатив)",
    questionEt: "kelleni? milleni?",
    questionRu: "до кого? до чего?",
    ending: "-ni",
    suffix: "ni",
    explanation: "Предел в пространстве или времени.",
    example: { et: "Ma kõnnin jõeni.", ru: "Я дойду до реки." },
  },
  {
    key: "ess",
    et: "olev",
    ru: "эссив",
    questionEt: "kellena? millena?",
    questionRu: "кем? чем? (быть)",
    ending: "-na",
    suffix: "na",
    explanation: "В качестве кого или чего.",
    example: { et: "Ta töötab arstina.", ru: "Он работает врачом." },
  },
  {
    key: "abess",
    et: "ilmaütlev",
    ru: "лишительный (абессив)",
    questionEt: "kelleta? milleta?",
    questionRu: "без кого? без чего?",
    ending: "-ta",
    suffix: "ta",
    explanation: "Отсутствие чего-то.",
    example: { et: "Ma joon kohvi piimata.", ru: "Я пью кофе без молока." },
  },
  {
    key: "com",
    et: "kaasaütlev",
    ru: "совместный (комитатив)",
    questionEt: "kellega? millega?",
    questionRu: "с кем? с чем?",
    ending: "-ga",
    suffix: "ga",
    explanation: "Вместе с кем-то или с помощью чего-то.",
    example: { et: "Ma lähen kinno sõbraga.", ru: "Я иду в кино с другом." },
  },
];

export const CASE_BY_KEY = Object.fromEntries(CASES.map((c) => [c.key, c])) as Record<
  CaseKey,
  CaseInfo
>;

export const NUMBER_LABEL: Record<GrammaticalNumber, string> = {
  sg: "ед. ч.",
  pl: "мн. ч.",
};
