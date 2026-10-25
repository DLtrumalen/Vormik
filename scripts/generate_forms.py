"""Генерирует src/data/words.json из data/words.tsv с помощью Vabamorf.

Запуск (нужен EstNLTK 1.7, в нём есть Vabamorf):
    pip install estnltk
    python scripts/generate_forms.py
"""

import csv
import json
import sys
from pathlib import Path

from estnltk.vabamorf.morf import synthesize

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "data" / "words.tsv"
TARGET = ROOT / "src" / "data" / "words.json"

# Наши ключи падежей -> коды форм Vabamorf.
CASES = {
    "nom": "n",
    "gen": "g",
    "part": "p",
    "ill": "ill",
    "ines": "in",
    "ela": "el",
    "all": "all",
    "ade": "ad",
    "abl": "abl",
    "transl": "tr",
    "term": "ter",
    "ess": "es",
    "abess": "ab",
    "com": "kom",
}
NUMBERS = {"sg": "sg", "pl": "pl"}
POS = {"S": "noun", "A": "adj"}


def unique(items):
    seen = []
    for item in items:
        if item not in seen:
            seen.append(item)
    return seen


def build_forms(lemma, pos):
    forms = {}
    for number, number_code in NUMBERS.items():
        for case, case_code in CASES.items():
            variants = synthesize(lemma, f"{number_code} {case_code}", pos)
            # Краткий иллатив (majja) стоит первым: он употребительнее длинного (majasse).
            if number == "sg" and case == "ill":
                variants = synthesize(lemma, "adt", pos) + variants
            forms[f"{number}.{case}"] = unique(variants)
    return forms


def main():
    words = []
    problems = []
    with SOURCE.open(encoding="utf-8") as f:
        for row in csv.DictReader(f, delimiter="\t"):
            lemma, pos = row["lemma"], row["pos"]
            forms = build_forms(lemma, pos)
            empty = [key for key, variants in forms.items() if not variants]
            if empty:
                problems.append(f"{lemma}: нет форм {', '.join(empty)}")
            if forms["sg.nom"] != [lemma]:
                problems.append(f"{lemma}: sg.nom = {forms['sg.nom']}")
            translations = {lang: row[lang] for lang in ("ru", "en", "fi")}
            words.append(
                {"id": lemma, "lemma": lemma, "pos": POS[pos], "tr": translations, "forms": forms}
            )

    if problems:
        print("\n".join(problems), file=sys.stderr)
        sys.exit(1)

    TARGET.parent.mkdir(parents=True, exist_ok=True)
    TARGET.write_text(json.dumps(words, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(words)} слов -> {TARGET.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
