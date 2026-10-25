export type CheckResult = "empty" | "correct" | "diacritics" | "wrong";

const DIACRITICS: Record<string, string> = { õ: "o", ä: "a", ö: "o", ü: "u", š: "s", ž: "z" };

export function normalize(text: string) {
  return text.normalize("NFC").trim().toLowerCase().replace(/\s+/g, " ");
}

function stripDiacritics(text: string) {
  return text.replace(/[õäöüšž]/g, (ch) => DIACRITICS[ch] ?? ch);
}

/** Сравнивает ответ со всеми допустимыми вариантами формы. */
export function checkAnswer(input: string, variants: string[]): CheckResult {
  const answer = normalize(input);
  if (!answer) return "empty";
  const normalized = variants.map(normalize);
  if (normalized.includes(answer)) return "correct";
  if (normalized.some((v) => stripDiacritics(v) === stripDiacritics(answer))) return "diacritics";
  return "wrong";
}
