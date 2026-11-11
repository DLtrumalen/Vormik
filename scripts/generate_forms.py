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


# Формы, которые Vabamorf строит, но принимать их не стоит: совпадают с другими словами
# (teile — «вам», vanus — «возраст») или практически не употребляются (aknaini, puini).
DROP = {
    "tee": {"teile", "teil", "teilt", "teini", "teesid"},
    "aken": {"aknaini"},
    "tänav": {"tänavaini"},
    "lennuk": {"lennukeini"},
    "kirik": {"kirikuini"},
    "puu": {"puini"},
    "vana": {"vanus", "vanusse", "vanust"},
    "sõna": {"sõnus"},
    # ÕS: muuseumi, muuseume / muuseumisid, muuseumides — остальное ненормативно.
    "muuseum": {
        "muuseumit", "muuseumite", "muuseumeid", "muuseumeisse", "muuseumeis", "muuseumeist",
        "muuseumitesse", "muuseumites", "muuseumitest", "muuseumitele", "muuseumitel", "muuseumitelt",
        "muuseumiteks", "muuseumiteni", "muuseumitena", "muuseumiteta", "muuseumitega",
        "muuseumeile", "muuseumeil", "muuseumeilt", "muuseumeiks", "muuseumeini", "muuseumeina",
        "muuseumeita", "muuseumeiga",
    },
}

# Какую форму показывать первой, если употребительная форма у Vabamorf не первая
# (linnu — редкая и совпадает с формой слова lind «птица»).
PREFER = {
    ("linn", "pl.part"): "linnasid",
    ("tuba", "pl.part"): "tubasid",
    ("tee", "pl.part"): "teid",
    # külla — «в гости»; переезжают в деревню — külasse.
    ("küla", "sg.ill"): "külasse",
}


def build_forms(lemma, pos, hint=""):
    # hint — правильный родительный ед. ч. для омонимов (kool → kooli, а не koola):
    # без него Vabamorf смешивает формы разных слов.
    forms = {}
    for number, number_code in NUMBERS.items():
        for case, case_code in CASES.items():
            variants = synthesize(lemma, f"{number_code} {case_code}", pos, hint)
            # Краткий иллатив (majja) стоит первым: он употребительнее длинного (majasse).
            if number == "sg" and case == "ill":
                variants = synthesize(lemma, "adt", pos, hint) + variants
            key = f"{number}.{case}"
            variants = [v for v in unique(variants) if v not in DROP.get(lemma, ())]
            preferred = PREFER.get((lemma, key))
            if preferred in variants:
                variants = [preferred] + [v for v in variants if v != preferred]
            forms[key] = variants
    return forms


def main():
    words = []
    problems = []
    with SOURCE.open(encoding="utf-8") as f:
        for row in csv.DictReader(f, delimiter="\t"):
            lemma, pos = row["lemma"], row["pos"]
            forms = build_forms(lemma, pos, row.get("hint") or "")
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
