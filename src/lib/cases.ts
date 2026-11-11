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

/** Данные падежа, не зависящие от языка интерфейса. Переводы — в src/i18n. */
export type CaseInfo = {
  key: CaseKey;
  /** Эстонское название падежа. */
  et: string;
  /** Вопросы по-эстонски. */
  questionEt: string;
  /** Окончание, которое добавляется к форме родительного падежа (пусто — форма не строится от неё). */
  suffix: string;
  /** Пример предложения по-эстонски. */
  exampleEt: string;
};

export const CASES: CaseInfo[] = [
  { key: "nom", et: "nimetav", questionEt: "kes? mis?", suffix: "", exampleEt: "Maja on suur." },
  {
    key: "gen",
    et: "omastav",
    questionEt: "kelle? mille?",
    suffix: "",
    exampleEt: "Maja uks on lahti.",
  },
  { key: "part", et: "osastav", questionEt: "keda? mida?", suffix: "", exampleEt: "Ma joon vett." },
  {
    key: "ill",
    et: "sisseütlev",
    questionEt: "kuhu? kellesse? millesse?",
    suffix: "sse",
    exampleEt: "Ma lähen majja.",
  },
  {
    key: "ines",
    et: "seesütlev",
    questionEt: "kus? kelles? milles?",
    suffix: "s",
    exampleEt: "Ma olen majas.",
  },
  {
    key: "ela",
    et: "seestütlev",
    questionEt: "kust? kellest? millest?",
    suffix: "st",
    exampleEt: "Ma tulen majast.",
  },
  {
    key: "all",
    et: "alaleütlev",
    questionEt: "kuhu? kellele? millele?",
    suffix: "le",
    exampleEt: "Ma annan raamatu sõbrale.",
  },
  {
    key: "ade",
    et: "alalütlev",
    questionEt: "kus? kellel? millel?",
    suffix: "l",
    exampleEt: "Raamat on laual.",
  },
  {
    key: "abl",
    et: "alaltütlev",
    questionEt: "kust? kellelt? millelt?",
    suffix: "lt",
    exampleEt: "Ma võtan raamatu laualt.",
  },
  {
    key: "transl",
    et: "saav",
    questionEt: "kelleks? milleks?",
    suffix: "ks",
    exampleEt: "Ta tahab saada arstiks.",
  },
  {
    key: "term",
    et: "rajav",
    questionEt: "kelleni? milleni?",
    suffix: "ni",
    exampleEt: "Ma kõnnin jõeni.",
  },
  {
    key: "ess",
    et: "olev",
    questionEt: "kellena? millena?",
    suffix: "na",
    exampleEt: "Ta töötab arstina.",
  },
  {
    key: "abess",
    et: "ilmaütlev",
    questionEt: "kelleta? milleta?",
    suffix: "ta",
    exampleEt: "Ma joon kohvi piimata.",
  },
  {
    key: "com",
    et: "kaasaütlev",
    questionEt: "kellega? millega?",
    suffix: "ga",
    exampleEt: "Ma lähen kinno sõbraga.",
  },
];

export const CASE_BY_KEY = Object.fromEntries(CASES.map((c) => [c.key, c])) as Record<
  CaseKey,
  CaseInfo
>;
