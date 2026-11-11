import { describe, expect, it } from "vitest";
import { checkAnswer } from "./check";

describe("checkAnswer", () => {
  it("принимает любой из допустимых вариантов", () => {
    expect(checkAnswer("jalgu", ["jalgu", "jalgasid"])).toBe("correct");
    expect(checkAnswer("jalgasid", ["jalgu", "jalgasid"])).toBe("correct");
  });

  it("не учитывает регистр и лишние пробелы", () => {
    expect(checkAnswer("  Majja ", ["majja", "majasse"])).toBe("correct");
  });

  it("отличает ошибку только в эстонских буквах", () => {
    expect(checkAnswer("kate", ["käte"])).toBe("diacritics");
    expect(checkAnswer("sobraga", ["sõbraga"])).toBe("diacritics");
  });

  it("считает другую форму ошибкой", () => {
    expect(checkAnswer("jalasse", ["jalga"])).toBe("wrong");
  });

  it("распознаёт пустой ответ", () => {
    expect(checkAnswer("   ", ["maja"])).toBe("empty");
  });
});
