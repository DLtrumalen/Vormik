"""Генерирует src/data/sentences.json: короткое предложение для каждого задания «слово + падеж».

Для каждой формы — эстонский шаблон («Ma sõidan {}.», вместо {} подставляется форма слова)
и готовый перевод на русский и английский («Я еду на машине.» / "I travel by car.").
Если для сочетания слова и падежа естественного предложения нет, задания не будет вовсе:
так в тренажёр не попадают мёртвые формы вроде leivani («до хлеба»).

Русские формы строит pymorphy3, английские — простые правила.

Запуск:
    pip install pymorphy3 pymorphy3-dicts-ru
    python scripts/generate_sentences.py
"""

import json
from pathlib import Path

import pymorphy3

ROOT = Path(__file__).resolve().parent.parent
WORDS = ROOT / "src" / "data" / "words.json"
ADJECTIVE_NOUNS = ROOT / "src" / "data" / "adjective-nouns.json"
TARGET = ROOT / "src" / "data" / "sentences.json"

CASES = ["nom", "gen", "part", "ill", "ines", "ela", "all", "ade", "abl", "transl", "term", "ess", "abess", "com"]

# ---------------------------------------------------------------------------------------------
# Группы слов
# ---------------------------------------------------------------------------------------------

GROUPS = {
    "building": ["maja", "kool", "ülikool", "kirik", "pood", "tuba", "köök"],
    "open": ["linn", "tänav", "tee", "mets", "meri", "järv", "jõgi", "saar", "mägi"],
    "vehicle": ["auto", "rong", "laev", "lennuk"],
    "thing": ["laud", "tool", "aken", "uks", "raamat", "pilt", "lill", "puu"],
    "person": [
        "sõber", "ema", "isa", "laps", "mees", "naine", "poiss", "tüdruk", "inimene", "arst", "õpetaja", "pere",
    ],
    "animal": ["koer", "kass", "kala"],
    "food": ["leib", "vesi", "õun"],
    "body": ["käsi", "jalg", "pea", "silm", "sõrm", "süda"],
    "abstract": ["töö", "keel", "sõna", "nimi", "küsimus", "lugu", "uni", "riik"],
    "weather": ["lumi", "vihm"],
    "time": ["päev", "öö", "nädal", "aasta", "tund"],
}
GROUP = {lemma: group for group, lemmas in GROUPS.items() for lemma in lemmas}

# ---------------------------------------------------------------------------------------------
# Шаблоны: (эстонский, русский, английский, числа).
#
# Эстонский: {} — форма слова (или прилагательное + существительное).
# Русский: {N:падеж} — слово без предлога; {IN:падеж} — «в» или «на» (на улице, на кухне);
#   {OUT:падеж} — «из» или «с»; {ON:падеж} — «на»; {OFF:падеж} — «с»; {P:предлог:падеж} — свой предлог.
# Английский: {n} — слово (во мн. ч. — во множественном), {a} — «a car» / «cars», {has} — has/have,
#   {poss} — «the boy's» / «the boys'».
# Если текст отличается для ед. и мн. ч., варианты разделены «||».
# ---------------------------------------------------------------------------------------------

BOTH = ("sg", "pl")
SG = ("sg",)


def F(et, ru, en, numbers=BOTH):
    return (et, ru, en, numbers)


NOM = F("See on {}.||Need on {}.", "Это {N:nomn}.", "This is {a}.||These are {n}.")
AT = F("Ma ootan {} juures.", "Я жду {P:у:gent}.", "I'm waiting by the {n}.")
SEE = F("Ma näen {}.", "Я вижу {N:accs}.", "I see the {n}.")
LIVE_WITHOUT = F("Ma ei saa elada {}.", "Я не могу жить {P:без:gent}.", "I can't live without the {n}.")
WALK_TO = F("Ma kõnnin {}.", "Я дохожу {P:до:gent}.", "I walk up to the {n}.")
GO_INTO = F("Ma lähen {}.", "Я иду {IN:accs}.", "I go into the {n}.")
BE_IN = F("Ma olen {}.", "Я {IN:loct}.", "I am in the {n}.")
COME_OUT = F("Ma tulen {}.", "Я выхожу {OUT:gent}.", "I come out of the {n}.")
BIRD_ONTO = F("Lind lendab {}.", "Птица летит {ON:accs}.", "A bird flies onto the {n}.")
BIRD_ON = F("Lind istub {}.", "Птица сидит {ON:loct}.", "A bird sits on the {n}.")
BIRD_OFF = F("Lind lendab {} ära.", "Птица улетает {OFF:gent}.", "A bird flies off the {n}.")
VILLAGE_WITHOUT = F("Küla on {}.", "Деревня {P:без:gent}.", "The village is without a {n}.||The village is without {n}.")
VILLAGE_WITH = F("See on küla {}.", "Это деревня {P:с:ablt}.", "This is a village with a {n}.||This is a village with {n}.")
FLAT_WITHOUT = F("Korter on {}.", "Квартира {P:без:gent}.", "The flat is without a {n}.||The flat is without {n}.")
FLAT_WITH = F("See on korter {}.", "Это квартира {P:с:ablt}.", "This is a flat with a {n}.||This is a flat with {n}.")
ROOM_WITHOUT = F("Tuba on {}.", "Комната {P:без:gent}.", "The room is without a {n}.||The room is without {n}.")
ROOM_WITH = F("See on tuba {}.", "Это комната {P:с:ablt}.", "This is a room with a {n}.||This is a room with {n}.")
COUNTRY_WITH = F("See on riik {}.", "Это страна {P:с:ablt}.", "This is a country with a {n}.||This is a country with {n}.")
WRITE_ON = F("Ma kirjutan nime {}.", "Я пишу имя {ON:loct}.", "I write a name on the {n}.")
MISTAKE_IN = F("{} on viga.", "{IN:loct} ошибка.", "There is a mistake in the {n}.")
TALK_ABOUT = F("Me räägime {}.", "Мы говорим {P:о:loct}.", "We talk about the {n}.")
MEANING = F("{} on tähendus.", "{P:у:gent} есть значение.", "The {n} {has} a meaning.")
SWIM_IN = F("Ma ujun {}.", "Я плаваю {P:в:loct}.", "I swim in the {n}.")

FRAMES = {
    "building": {
        "nom": NOM, "gen": AT, "part": SEE, "ill": GO_INTO, "ines": BE_IN, "ela": COME_OUT,
        "term": WALK_TO, "abess": VILLAGE_WITHOUT, "com": VILLAGE_WITH,
    },
    "open": {
        "nom": NOM,
        "gen": F("See on {} kaart.", "Это карта {N:gent}.", "This is a map of the {n}."),
        "part": SEE,
        "ill": F("Ma lähen {}.", "Я еду {IN:accs}.", "I go to the {n}."),
        "ines": F("Ma olen {}.", "Я {IN:loct}.", "I am in the {n}."),
        "ela": F("Ma tulen {}.", "Я возвращаюсь {OUT:gent}.", "I come back from the {n}."),
        "all": F("Ma lähen {}.", "Я иду {ON:accs}.", "I go to the {n}."),
        "ade": F("Ma olen {}.", "Я {ON:loct}.", "I am on the {n}."),
        "abl": F("Ma tulen {}.", "Я возвращаюсь {OFF:gent}.", "I come back from the {n}."),
        "term": WALK_TO, "com": COUNTRY_WITH,
    },
    "vehicle": {
        "nom": NOM, "gen": AT, "part": SEE,
        "ill": F("Ma istun {}.", "Я сажусь {IN:accs}.", "I get into the {n}."),
        "ines": F("Ma olen {}.", "Я {IN:loct}.", "I am in the {n}."),
        "ela": F("Ma tulen {} välja.", "Я выхожу {OUT:gent}.", "I get out of the {n}."),
        "all": BIRD_ONTO, "ade": BIRD_ON, "abl": BIRD_OFF, "term": WALK_TO,
        "com": F("Ma sõidan {}.", "Я еду {P:на:loct}.", "I travel by {n}.||I travel in {n}."),
    },
    "thing": {
        "nom": NOM, "gen": AT, "part": SEE, "term": WALK_TO, "abess": ROOM_WITHOUT, "com": ROOM_WITH,
    },
    "person": {
        "nom": NOM,
        "gen": F("See on {} raamat.", "Это книга {N:gent}.", "This is the {poss} book."),
        "part": F("Ma ootan {}.", "Я жду {N:accs}.", "I'm waiting for the {n}."),
        "all": F("Ma helistan {}.", "Я звоню {N:datv}.", "I call the {n}."),
        "ade": F("{} on auto.", "{P:у:gent} есть машина.", "The {n} {has} a car."),
        "abl": F("Ma saan kirja {}.", "Я получаю письмо {P:от:gent}.", "I get a letter from the {n}."),
        "com": F("Ma lähen kinno {}.", "Я иду в кино {P:с:ablt}.", "I go to the cinema with the {n}."),
    },
    "animal": {
        "nom": NOM,
        "gen": F("See on {} toit.", "Это корм {P:для:gent}.", "This is food for the {n}."),
        "part": SEE,
        "all": F("Ma annan {} süüa.", "Я даю еду {N:datv}.", "I give food to the {n}."),
        "ade": F("{} on nimi.", "{P:у:gent} есть имя.", "The {n} {has} a name."),
        "abl": F("Ma võtan palli {}.", "Я забираю мяч {P:у:gent}.", "I take the ball from the {n}."),
        "abess": LIVE_WITHOUT,
        "com": F("Ma jalutan {}.", "Я гуляю {P:с:ablt}.", "I walk with the {n}."),
    },
    "food": {
        "nom": NOM,
        "gen": F("See on {} hind.", "Это цена {N:gent}.", "This is the price of the {n}."),
    },
    "body": {
        "nom": NOM,
        "part": F("Ma pesen {}.", "Я мою {N:accs}.", "I wash the {n}."),
    },
    "abstract": {"nom": NOM},
    "weather": {
        "nom": F("See on {}.", "Это {N:nomn}.", "This is {n}.", SG),
        "part": F("Ma näen {}.", "Я вижу {N:accs}.", "I see the {n}.", SG),
    },
    "time": {
        "nom": NOM,
        "part": F(
            "Ma ootan veel {}.||Ma mäletan neid {}.",
            "Я жду ещё {N:accs}.||Я помню те {N:accs}.",
            "I wait one more {n}.||I remember those {n}.",
        ),
        "ines": F("Ma töötan kaks korda {}.", "Я работаю два раза {P:в:accs}.", "I work twice a {n}.", SG),
        "transl": F("Ma tulen {}.", "Я приезжаю {P:на:accs}.", "I come for a {n}.", SG),
    },
}

# Шаблоны для отдельных слов: дополняют или заменяют шаблоны группы. None — такого задания нет.
WORD_FRAMES = {
    # Здания.
    "maja": {
        "all": BIRD_ONTO, "ade": BIRD_ON, "abl": BIRD_OFF,
        "abess": None,
        "com": F("See on tänav {}.", "Это улица {P:с:ablt}.", "This is a street with a {n}.||This is a street with {n}."),
    },
    "kirik": {"all": BIRD_ONTO, "ade": BIRD_ON, "abl": BIRD_OFF},
    "kool": {
        "all": F("Ma kirjutan {}.", "Я пишу {P:в:accs}.", "I write to the {n}."),
        "ade": F("{} on uus direktor.", "{P:у:gent} новый директор.", "The {n} {has} a new head."),
        "abl": F("Ma saan kirja {}.", "Я получаю письмо {P:из:gent}.", "I get a letter from the {n}."),
    },
    "ülikool": {
        "all": F("Ma kirjutan {}.", "Я пишу {P:в:accs}.", "I write to the {n}."),
        "ade": F("{} on uus rektor.", "{P:у:gent} новый ректор.", "The {n} {has} a new rector."),
        "abl": F("Ma saan kirja {}.", "Я получаю письмо {P:из:gent}.", "I get a letter from the {n}."),
        "abess": F("Linn on {}.", "Город {P:без:gent}.", "The city is without a {n}.||The city is without {n}."),
        "com": F("See on linn {}.", "Это город {P:с:ablt}.", "This is a city with a {n}.||This is a city with {n}."),
    },
    "tuba": {
        "gen": F("See on {} uks.", "Это дверь {N:gent}.", "This is the door of the {n}."),
        "term": None, "abess": None, "com": FLAT_WITH,
    },
    "köök": {
        "gen": F("See on {} uks.", "Это дверь {N:gent}.", "This is the door of the {n}."),
        "term": None, "abess": FLAT_WITHOUT, "com": FLAT_WITH,
    },
    # Открытые места: у улицы, дороги, острова, горы нет «внутренних» падежей, у города и леса — «внешних».
    "linn": {"all": None, "ade": None, "abl": None, "abess": LIVE_WITHOUT, "com": None},
    "mets": {"all": None, "ade": None, "abl": None, "abess": LIVE_WITHOUT},
    "tänav": {
        "ill": None, "ines": None, "ela": None,
        "com": F("See on linn {}.", "Это город {P:с:ablt}.", "This is a city with a {n}.||This is a city with {n}."),
    },
    "tee": {"ill": None, "ines": None, "ela": None, "com": VILLAGE_WITH},
    "saar": {"ill": None, "ines": None, "ela": None},
    "mägi": {"ill": None, "ines": None, "ela": None},
    "meri": {"ines": SWIM_IN, "abess": LIVE_WITHOUT},
    "järv": {"ines": SWIM_IN},
    "jõgi": {"ines": SWIM_IN},
    # Транспорт.
    "auto": {"abess": F("Ma olen {}.", "Я {P:без:gent}.", "I am without a {n}.||I am without {n}.")},
    "laev": {
        "ill": F("Ma lähen {}.", "Я сажусь {ON:accs}.", "I board the {n}."),
        "ines": F("Ma olen {}.", "Я {ON:loct}.", "I am on the {n}."),
    },
    # Предметы.
    "laud": {
        "all": F("Ma panen raamatu {}.", "Я кладу книгу {ON:accs}.", "I put the book on the {n}."),
        "ade": F("Raamat on {}.", "Книга {ON:loct}.", "The book is on the {n}."),
        "abl": F("Ma võtan raamatu {}.", "Я беру книгу {OFF:gent}.", "I take the book off the {n}."),
    },
    "tool": {
        "all": F("Ma panen koti {}.", "Я ставлю сумку {ON:accs}.", "I put the bag on the {n}."),
        "ade": F("Kass istub {}.", "Кошка сидит {ON:loct}.", "The cat sits on the {n}."),
        "abl": F("Kass hüppab {}.", "Кошка спрыгивает {OFF:gent}.", "The cat jumps off the {n}."),
    },
    "aken": {
        "ela": F("Ma vaatan {} välja.", "Я смотрю {OUT:gent}.", "I look out of the {n}."),
        "all": BIRD_ONTO, "ade": BIRD_ON, "abl": BIRD_OFF,
    },
    "uks": {
        "ela": F("Ma tulen {} sisse.", "Я вхожу {P:через:accs}.", "I come in through the {n}."),
        "all": WRITE_ON,
        "ade": F("{} on number.", "{ON:loct} есть номер.", "There is a number on the {n}."),
    },
    "raamat": {
        "gen": F("Mul on küsimus {} kohta.", "У меня вопрос {P:о:loct}.", "I have a question about the {n}."),
        "part": F("Ma loen {}.", "Я читаю {N:accs}.", "I'm reading the {n}."),
        "ill": F("Ma kirjutan {}.", "Я пишу {IN:accs}.", "I write in the {n}."),
        "ines": F("Vastus on {}.", "Ответ {IN:loct}.", "The answer is in the {n}."),
        "ela": F("Ma loen {}.", "Я читаю {OUT:gent}.", "I read from the {n}."),
        "all": WRITE_ON,
        "ade": F("{} on pealkiri.", "{P:у:gent} есть название.", "The {n} {has} a title."),
        "term": None,
        "abess": F("Ma lähen kooli {}.", "Я иду в школу {P:без:gent}.", "I go to school without a {n}.||I go to school without {n}."),
        "com": F("Ma istun diivanil {}.", "Я сижу на диване {P:с:ablt}.", "I sit on the sofa with a {n}.||I sit on the sofa with {n}."),
    },
    "pilt": {
        "gen": F("Mul on küsimus {} kohta.", "У меня вопрос {P:о:loct}.", "I have a question about the {n}."),
        "part": F("Ma vaatan {}.", "Я смотрю {P:на:accs}.", "I look at the {n}."),
        "all": WRITE_ON,
        "ade": F("{} on mees.", "{ON:loct} мужчина.", "There is a man in the {n}."),
        "term": None, "abess": None,
        "com": F("See on raamat {}.", "Это книга {P:с:ablt}.", "This is a book with a {n}.||This is a book with {n}."),
    },
    "lill": {
        "gen": F("Ma tean {} nime.", "Я знаю название {N:gent}.", "I know the name of the {n}."),
        "all": F("Mesilane lendab {}.", "Пчела летит {ON:accs}.", "A bee flies onto the {n}."),
        "ade": F("Mesilane istub {}.", "Пчела сидит {ON:loct}.", "A bee sits on the {n}."),
        "abl": F("Mesilane lendab {} ära.", "Пчела улетает {OFF:gent}.", "A bee flies off the {n}."),
        "term": None, "abess": None,
        "com": F("Ma tulen külla {}.", "Я прихожу в гости {P:с:ablt}.", "I come to visit with a {n}.||I come to visit with {n}."),
    },
    "puu": {
        "gen": F("Ma istun {} all.", "Я сижу {P:под:ablt}.", "I sit under the {n}."),
        "all": BIRD_ONTO, "ade": BIRD_ON, "abl": BIRD_OFF,
        "abess": F("Aed on {}.", "Сад {P:без:gent}.", "The garden is without a {n}.||The garden is without {n}."),
        "com": F("See on aed {}.", "Это сад {P:с:ablt}.", "This is a garden with a {n}.||This is a garden with {n}."),
    },
    # Люди.
    "sõber": {
        "gen": F("Ma olen {} juures.", "Я {P:у:gent}.", "I am at the {poss} place."),
        "transl": F("Ta sai mulle {}.||Me saime {}.", "Он стал мне {N:ablt}.||Мы стали {N:ablt}.", "He became my {n}.||We became {n}."),
        "ess": F("Ma räägin {}.||Me räägime {}.", "Я говорю {P:как:nomn}.||Мы говорим {P:как:nomn}.", "I speak as a {n}.||We speak as {n}."),
        "abess": LIVE_WITHOUT,
    },
    "ema": {
        "gen": F("Ma olen {} juures.", "Я {P:у:gent}.", "I am at the {poss} place."),
        "transl": F("Ta sai {}.", "Она стала {N:ablt}.", "She became a {n}.", SG),
        "ess": F("{} ma muretsen.", "{P:как:nomn} я волнуюсь.", "As a {n}, I worry.", SG),
        "abess": LIVE_WITHOUT,
    },
    "isa": {
        "gen": F("Ma olen {} juures.", "Я {P:у:gent}.", "I am at the {poss} place."),
        "transl": F("Ta sai {}.", "Он стал {N:ablt}.", "He became a {n}.", SG),
        "ess": F("{} ma muretsen.", "{P:как:nomn} я волнуюсь.", "As a {n}, I worry.", SG),
        "abess": LIVE_WITHOUT,
    },
    "laps": {
        "ess": F(
            "{} olin ma õnnelik.||{} olime me õnnelikud.",
            "{N:ablt} я был счастлив.||{N:ablt} мы были счастливы.",
            "As a {n}, I was happy.||As {n}, we were happy.",
        ),
        "abess": F("Me reisime {}.", "Мы путешествуем {P:без:gent}.", "We travel without a {n}.||We travel without {n}."),
    },
    "poiss": {"ess": F("{} olin ma õnnelik.", "{N:ablt} я был счастлив.", "As a {n}, I was happy.", SG)},
    "tüdruk": {"ess": F("{} olin ma õnnelik.", "{N:ablt} я была счастлива.", "As a {n}, I was happy.", SG)},
    "arst": {
        "gen": F("Ma olen {} juures.", "Я {P:у:gent}.", "I am at the {poss}."),
        "transl": F("Ma tahan saada {}.||Nad tahavad saada {}.", "Я хочу стать {N:ablt}.||Они хотят стать {N:ablt}.", "I want to become a {n}.||They want to become {n}."),
        "ess": F("Ta töötab {}.||Nad töötavad {}.", "Он работает {N:ablt}.||Они работают {N:ablt}.", "He works as a {n}.||They work as {n}."),
    },
    "õpetaja": {
        "gen": F("Ma olen {} juures.", "Я {P:у:gent}.", "I am at the {poss} office."),
        "transl": F("Ma tahan saada {}.||Nad tahavad saada {}.", "Я хочу стать {N:ablt}.||Они хотят стать {N:ablt}.", "I want to become a {n}.||They want to become {n}."),
        "ess": F("Ta töötab {}.||Nad töötavad {}.", "Он работает {N:ablt}.||Они работают {N:ablt}.", "He works as a {n}.||They work as {n}."),
    },
    "pere": {
        "gen": F("Ma olen {} juures.", "Я {P:у:gent}.", "I am with the {n}."),
        "ess": F("{} olime me õnnelikud.", "{N:ablt} мы были счастливы.", "As a {n}, we were happy.", SG),
        "transl": F("Me saime {}.", "Мы стали {N:ablt}.", "We became a {n}.", SG),
        "abess": LIVE_WITHOUT,
    },
    # Животные.
    "kass": {"com": F("Ma mängin {}.", "Я играю {P:с:ablt}.", "I play with the {n}.")},
    "kala": {
        "gen": F("See on {} hind.", "Это цена {N:gent}.", "This is the price of the {n}."),
        "part": F("Ma püüan {}.", "Я ловлю {N:accs}.", "I catch the {n}."),
        "ines": F("{} on luud.", "{IN:loct} есть кости.", "There are bones in the {n}."),
        "ela": F("Ma teen supi {}.", "Я варю суп {OUT:gent}.", "I make soup from the {n}."),
        "ade": F("{} on soomused.", "{P:у:gent} есть чешуя.", "The {n} {has} scales."),
        "com": F("Ma söön riisi {}.", "Я ем рис {P:с:ablt}.", "I eat rice with the {n}."),
        "all": None, "abl": None, "abess": None,
    },
    # Еда.
    "leib": {
        "part": F("Ma söön {}.", "Я ем {N:accs}.", "I eat the {n}."),
        "ela": F("Ma teen võileiva {}.", "Я делаю бутерброд {OUT:gent}.", "I make a sandwich from the {n}."),
        "all": F("Ma panen võid {}.", "Я мажу масло {ON:accs}.", "I put butter on the {n}."),
        "ade": F("{} on või.", "{ON:loct} масло.", "There is butter on the {n}."),
        "abl": F("Ma võtan juustu {}.", "Я снимаю сыр {OFF:gent}.", "I take the cheese off the {n}."),
        "abess": LIVE_WITHOUT,
        "com": F("Ma söön suppi {}.", "Я ем суп {P:с:ablt}.", "I eat soup with the {n}."),
    },
    "vesi": {
        "nom": F("See on {}.", "Это {N:nomn}.", "This is {n}.", SG),
        "gen": F("See on {} hind.", "Это цена {N:gent}.", "This is the price of the {n}.", SG),
        "part": F("Ma joon {}.", "Я пью {N:accs}.", "I drink the {n}.", SG),
        "ill": F("Ma hüppan {}.", "Я прыгаю {IN:accs}.", "I jump into the {n}.", SG),
        "ines": F("Kala ujub {}.", "Рыба плавает {IN:loct}.", "A fish swims in the {n}.", SG),
        "ela": F("Kala hüppab {} välja.", "Рыба выпрыгивает {OUT:gent}.", "A fish jumps out of the {n}.", SG),
        "all": F("Leht kukub {}.", "Лист падает {ON:accs}.", "A leaf falls onto the {n}.", SG),
        "abess": F("Ma ei saa elada {}.", "Я не могу жить {P:без:gent}.", "I can't live without {n}.", SG),
        "com": F("Ma pesen käsi {}.", "Я мою руки {N:ablt}.", "I wash my hands with {n}.", SG),
    },
    "õun": {
        "part": F("Ma söön {}.", "Я ем {N:accs}.", "I eat the {n}."),
        "ines": F("{} on uss.", "{IN:loct} червяк.", "There is a worm in the {n}."),
        "ela": F("Ma teen mahla {}.", "Я делаю сок {OUT:gent}.", "I make juice from the {n}."),
        "all": F("Mesilane lendab {}.", "Пчела летит {ON:accs}.", "A bee flies onto the {n}."),
        "ade": F("Mesilane istub {}.", "Пчела сидит {ON:loct}.", "A bee sits on the {n}."),
        "com": F("Ma söön kooki {}.", "Я ем пирог {P:с:ablt}.", "I eat cake with the {n}."),
    },
    # Части тела: «местные» падежи только в ед. ч. — каждая фраза своя.
    "käsi": {
        "gen": F("See kreem on {} jaoks.", "Этот крем {P:для:gent}.", "This cream is for the {n}.||This cream is for the {n}."),
        "ill": F("Võta raamat {}.", "Возьми книгу {IN:accs}.", "Take the book in your {n}.", SG),
        "ines": F("Mul on raamat {}.", "У меня книга {IN:loct}.", "I have a book in my {n}.", SG),
        "ela": F("Raamat kukub {}.", "Книга падает {OUT:gent}.", "The book falls from my {n}.", SG),
        "all": F("Ma panen kreemi {}.", "Я наношу крем {ON:accs}.", "I put cream on my {n}.", SG),
        "ade": F("{} on sõrmus.", "{ON:loct} кольцо.", "There is a ring on the {n}.", SG),
        "abl": F("Ma pesen värvi {}.", "Я смываю краску {OFF:gent}.", "I wash the paint off my {n}.", SG),
        "com": F("Ma kirjutan {}.", "Я пишу {N:ablt}.", "I write with my {n}."),
    },
    "jalg": {
        "gen": F("See kreem on {} jaoks.", "Этот крем {P:для:gent}.", "This cream is for the {n}."),
        "ill": F("Pane king {}.", "Надень ботинок {ON:accs}.", "Put the shoe on your {n}.", SG),
        "ines": F("Mul on king {}.", "У меня ботинок {ON:loct}.", "I have a shoe on my {n}.", SG),
        "ela": F("Ma võtan kinga {}.", "Я снимаю ботинок {OFF:gent}.", "I take the shoe off my {n}.", SG),
        "all": F("Ma panen kreemi {}.", "Я наношу крем {ON:accs}.", "I put cream on my {n}.", SG),
        "ade": F("{} on king.", "{ON:loct} ботинок.", "There is a shoe on the {n}.", SG),
        "abl": F("Ma pesen värvi {}.", "Я смываю краску {OFF:gent}.", "I wash the paint off my {n}.", SG),
        "com": F("Ma löön palli {}.", "Я бью по мячу {N:ablt}.", "I kick the ball with my {n}."),
    },
    "pea": {
        "ill": F("Pane müts {}.", "Надень шапку {ON:accs}.", "Put the hat on your {n}.", SG),
        "ines": F("Mul on müts {}.", "У меня шапка {ON:loct}.", "I have a hat on my {n}.", SG),
        "ela": F("Ma võtan mütsi {}.", "Я снимаю шапку {OFF:gent}.", "I take the hat off my {n}.", SG),
        "all": F("Ma panen kreemi {}.", "Я наношу крем {ON:accs}.", "I put cream on my {n}.", SG),
        "com": F("Ma noogutan {}.", "Я киваю {N:ablt}.", "I nod my {n}.", SG),
    },
    "silm": {
        "gen": F("Need tilgad on {} jaoks.", "Эти капли {P:для:gent}.", "These drops are for the {n}."),
        "ill": F("Tolm läks {}.", "Пыль попала {IN:accs}.", "Dust got into my {n}.", SG),
        "ines": F("Mul on pisar {}.", "У меня слеза {IN:loct}.", "I have a tear in my {n}.", SG),
        "ela": F("Pisar tuleb {}.", "Слеза течёт {OUT:gent}.", "A tear comes from my {n}.", SG),
        "com": F("Ma pilgutan {}.", "Я подмигиваю {N:ablt}.", "I wink with my {n}.", SG),
    },
    "sõrm": {
        "ill": F("Pane sõrmus {}.", "Надень кольцо {ON:accs}.", "Put the ring on your {n}.", SG),
        "ines": F("Mul on sõrmus {}.", "У меня кольцо {ON:loct}.", "I have a ring on my {n}.", SG),
        "ela": F("Ma võtan sõrmuse {}.", "Я снимаю кольцо {OFF:gent}.", "I take the ring off my {n}.", SG),
        "all": F("Ma panen plaastri {}.", "Я клею пластырь {ON:accs}.", "I put a plaster on my {n}.", SG),
        "ade": F("{} on sõrmus.", "{ON:loct} кольцо.", "There is a ring on the {n}.", SG),
        "abl": F("Ma pesen värvi {}.", "Я смываю краску {OFF:gent}.", "I wash the paint off my {n}.", SG),
        "com": F("Ma näitan {}.", "Я показываю {N:ablt}.", "I point with my {n}.", SG),
    },
    "süda": {
        "part": F("Arst kuulab {}.", "Врач слушает {N:accs}.", "The doctor listens to the {n}.", SG),
        "ill": F("See läks mulle {}.", "Это запало мне {IN:accs}.", "It went to my {n}.", SG),
        "ines": F("Mul on rõõm {}.", "У меня радость {IN:loct}.", "I have joy in my {n}.", SG),
        "ela": F("Ma räägin {}.", "Я говорю {P:от:gent}.", "I speak from the {n}.", SG),
    },
    # Абстрактное.
    "töö": {
        "gen": F("See on {} plaan.", "Это план {N:gent}.", "This is the plan of the {n}.", SG),
        "part": F("Ma teen {}.", "Я делаю {N:accs}.", "I do the {n}.", SG),
        "all": F("Ma lähen {}.", "Я иду {ON:accs}.", "I go to {n}.", SG),
        "ade": F("Ma olen {}.", "Я {ON:loct}.", "I am at {n}.", SG),
        "abl": F("Ma tulen {}.", "Я прихожу {OFF:gent}.", "I come from {n}.", SG),
        "abess": F("Ma olen {}.", "Я {P:без:gent}.", "I am without {n}.", SG),
    },
    "keel": {
        "gen": F("See on {} õpik.", "Это учебник {N:gent}.", "This is a textbook of the {n}."),
        "part": F("Ma õpin {}.", "Я учу {N:accs}.", "I learn the {n}."),
        "ines": F("{} on palju sõnu.", "{IN:loct} много слов.", "There are many words in the {n}."),
        "ade": F("{} on reeglid.", "{P:у:gent} есть правила.", "The {n} {has} rules."),
        "com": F("Ma tegelen {}.", "Я занимаюсь {N:ablt}.", "I work on the {n}."),
    },
    "sõna": {
        "gen": F("Ma ei tea {} tähendust.", "Я не знаю значения {N:gent}.", "I don't know the meaning of the {n}."),
        "part": F("Ma ei tea {}.", "Я не знаю {N:accs}.", "I don't know the {n}."),
        "ill": F("Ma panen tähe {}.", "Я вставляю букву {IN:accs}.", "I put a letter into the {n}.", SG),
        "ines": MISTAKE_IN,
        "ela": F("Ma kustutan tähe {}.", "Я стираю букву {OUT:gent}.", "I delete a letter from the {n}.", SG),
        "all": F("Ma panen rõhu {}.", "Я ставлю ударение {ON:accs}.", "I put the stress on the {n}.", SG),
        "ade": MEANING,
        "abess": F("Ta lahkus {}.", "Он ушёл {P:без:gent}.", "He left without a {n}.||He left without {n}."),
        "com": F("See on lause {}.", "Это предложение {P:с:ablt}.", "This is a sentence with the {n}."),
    },
    "nimi": {
        "gen": F("Ma tean {} tähendust.", "Я знаю значение {N:gent}.", "I know the meaning of the {n}."),
        "part": F("Ma ei tea {}.", "Я не знаю {N:accs}.", "I don't know the {n}."),
        "ines": MISTAKE_IN,
        "ade": MEANING,
        "abess": F("See on kiri {}.", "Это письмо {P:без:gent}.", "This is a letter without a {n}.||This is a letter without {n}."),
    },
    "küsimus": {
        "gen": F("See on {} vastus.", "Это ответ {P:на:accs}.", "This is the answer to the {n}."),
        "part": F("Ma ei mõista {}.", "Я не понимаю {N:accs}.", "I don't understand the {n}."),
        "ines": MISTAKE_IN,
        "ela": TALK_ABOUT,
        "all": F("Ma vastan {}.", "Я отвечаю {P:на:accs}.", "I answer the {n}."),
        "ade": F("{} on vastus.", "{P:у:gent} есть ответ.", "The {n} {has} an answer."),
        "abess": F("Ta nõustus {}.", "Он согласился {P:без:gent}.", "He agreed without {n}.", ("pl",)),
        "com": F("Ma tulen {}.", "Я прихожу {P:с:ablt}.", "I come with a {n}.||I come with {n}."),
    },
    "lugu": {
        "gen": F("See on {} lõpp.", "Это конец {N:gent}.", "This is the end of the {n}."),
        "part": F("Ma kuulan {}.", "Я слушаю {N:accs}.", "I listen to the {n}."),
        "ines": MISTAKE_IN,
        "ela": TALK_ABOUT,
        "ade": F("{} on hea lõpp.", "{P:у:gent} хороший конец.", "The {n} {has} a good ending."),
    },
    "uni": {
        "part": F("Ma näen {}.", "Я вижу {N:accs}.", "I have a {n}.||I have {n}."),
        "ines": F("Ma räägin {}.", "Я разговариваю {P:во:loct}.", "I talk in my {n}.", SG),
        "ela": F("Ma ärkan {}.", "Я просыпаюсь {P:ото:gent}.", "I wake up from my {n}.", SG),
    },
    "riik": {
        "gen": F("See on {} lipp.", "Это флаг {N:gent}.", "This is the flag of the {n}."),
        "part": F("Ma armastan {}.", "Я люблю {N:accs}.", "I love the {n}."),
        "ill": F("Ma sõidan {}.", "Я еду {IN:accs}.", "I travel to the {n}."),
        "ines": F("Ma elan {}.", "Я живу {IN:loct}.", "I live in the {n}."),
        "ela": F("Ma tulen {}.", "Я приезжаю {OUT:gent}.", "I come from the {n}."),
        "ade": F("{} on president.", "{P:у:gent} есть президент.", "The {n} {has} a president."),
    },
    # Погода (только ед. ч.).
    "lumi": {
        "gen": F("Ma armastan {} lõhna.", "Я люблю запах {N:gent}.", "I love the smell of {n}.", SG),
        "ill": F("Ma kukun {}.", "Я падаю {IN:accs}.", "I fall into the {n}.", SG),
        "ines": F("Lapsed mängivad {}.", "Дети играют {IN:loct}.", "The children play in the {n}.", SG),
        "ela": F("Ma võtan palli {}.", "Я достаю мяч {OUT:gent}.", "I take the ball out of the {n}.", SG),
        "ade": F("Ma kõnnin {}.", "Я иду {P:по:datv}.", "I walk on the {n}.", SG),
        "abess": F("Talv on {}.", "Зима {P:без:gent}.", "The winter is without {n}.", SG),
        "com": F("Lapsed mängivad {}.", "Дети играют {P:со:ablt}.", "The children play with the {n}.", SG),
    },
    "vihm": {
        "gen": F("Ma kuulan {} häält.", "Я слушаю шум {N:gent}.", "I listen to the sound of the {n}.", SG),
        "ines": F("Ma kõnnin {}.", "Я гуляю {P:под:ablt}.", "I walk in the {n}.", SG),
        "ela": F("Ma tulen {} tuppa.", "Я захожу в дом {P:из-под:gent}.", "I come in from the {n}.", SG),
        "abess": F("Suvi on {}.", "Лето {P:без:gent}.", "The summer is without {n}.", SG),
        "com": F("Päev algas {}.", "День начался {P:с:gent}.", "The day began with {n}.", SG),
    },
    # Время.
    "päev": {"gen": F("See on {} plaan.", "Это план {P:на:accs}.", "This is the plan for the {n}.", SG)},
    "nädal": {"gen": F("See on {} plaan.", "Это план {P:на:accs}.", "This is the plan for the {n}.", SG)},
    "aasta": {"gen": F("See on {} plaan.", "Это план {P:на:accs}.", "This is the plan for the {n}.", SG)},
    "öö": {
        "ines": None,
        "term": F("Ma töötan {}.", "Я работаю {P:до:gent}.", "I work until {n}.", SG),
    },
}

# Сочетания, которые во мн. ч. звучат неестественно («без мам», «цена рыб», «у стран есть президент»):
# для них задание только в ед. ч.
SINGULAR_ONLY = {
    "leib": set(CASES) - {"nom"},
    "kala": {"gen", "ines", "ela", "com"},
    "ema": {"abess"},
    "isa": {"abess"},
    "pere": {"abess"},
    "tuba": {"gen"},
    "köök": {"gen"},
    "kool": {"ade"},
    "ülikool": {"ade"},
    "riik": {"ade"},
}

# Прилагательные: «стать каким» (saav) и «будучи каким» (olev) — без существительного, только ед. ч.
# {A:падеж:род} — прилагательное по-русски, согласованное с подлежащим.
ADJ_TRANSL = {
    "soe": F("Ilm läheb {}.", "Погода становится {A:ablt:femn}.", "The weather gets {adj}.", SG),
    "külm": F("Ilm läheb {}.", "Погода становится {A:ablt:femn}.", "The weather gets {adj}.", SG),
    "halb": F("Ilm läheb {}.", "Погода становится {A:ablt:femn}.", "The weather gets {adj}.", SG),
    "kallis": F("Elu läheb {}.", "Жизнь становится {A:ablt:femn}.", "Life gets {adj}.", SG),
    "odav": F("Elu läheb {}.", "Жизнь становится {A:ablt:femn}.", "Life gets {adj}.", SG),
    "pikk": F("Päev läheb {}.", "День становится {A:ablt:masc}.", "The day gets {adj}.", SG),
    "lühike": F("Päev läheb {}.", "День становится {A:ablt:masc}.", "The day gets {adj}.", SG),
    "uus": F("Kõik saab {}.", "Всё становится {A:ablt:neut}.", "Everything becomes {adj}.", SG),
    "vana": F("Ma jään {}.", "Я становлюсь {A:ablt:masc}.", "I get {adj}.", SG),
    "väike": F("Riided jäävad {}.", "Одежда становится {A:ablt:femn}.", "The clothes get {adj}.", SG),
    "suur": F("Ma tahan saada {}.", "Я хочу стать {A:ablt:masc}.", "I want to become {adj}.", SG),
    "hea": F("Ma tahan saada {}.", "Я хочу стать {A:ablt:masc}.", "I want to become {adj}.", SG),
    "noor": F("Ma tahan saada {}.", "Я хочу стать {A:ablt:masc}.", "I want to become {adj}.", SG),
    "kiire": F("Ma tahan saada {}.", "Я хочу стать {A:ablt:masc}.", "I want to become {adj}.", SG),
    "tark": F("Ma tahan saada {}.", "Я хочу стать {A:ablt:masc}.", "I want to become {adj}.", SG),
    "ilus": F("Ma tahan saada {}.", "Я хочу стать {A:ablt:masc}.", "I want to become {adj}.", SG),
}
ADJ_ESS = {
    "noor": F("{} olin ma õnnelik.", "{A:ablt:masc} я был счастлив.", "When I was {adj}, I was happy.", SG),
    "vana": F("{} olin ma õnnelik.", "{A:ablt:masc} я был счастлив.", "When I was {adj}, I was happy.", SG),
    "väike": F("{} olin ma õnnelik.", "{A:ablt:masc} я был счастлив.", "When I was {adj}, I was happy.", SG),
    "soe": F("Ma joon kohvi {}.", "Я пью кофе {A:ablt:masc}.", "I drink coffee {adj}.", SG),
    "külm": F("Ma joon kohvi {}.", "Я пью кофе {A:ablt:masc}.", "I drink coffee {adj}.", SG),
}

# ---------------------------------------------------------------------------------------------
# Русский
# ---------------------------------------------------------------------------------------------

morph = pymorphy3.MorphAnalyzer()

RU_NA = {"улица", "остров", "гора", "кухня", "работа", "море", "озеро", "река", "корабль"}
RU_LOC2 = {"лес", "снег", "год", "глаз"}
RU_PLURAL = {
    "стул": {"nomn": "стулья", "gent": "стульев", "datv": "стульям", "accs": "стулья", "ablt": "стульями", "loct": "стульях"},
    "учитель": {"nomn": "учителя", "gent": "учителей", "datv": "учителям", "accs": "учителей", "ablt": "учителями", "loct": "учителях"},
    "цветок": {"nomn": "цветы", "gent": "цветов", "datv": "цветам", "accs": "цветы", "ablt": "цветами", "loct": "цветах"},
}


def noun_parse(word):
    return next(p for p in morph.parse(word) if "NOUN" in p.tag)


def ru_noun(word, case, number):
    if number == "plur" and word in RU_PLURAL:
        return RU_PLURAL[word][case]
    parse = noun_parse(word)
    if case == "loct" and number == "sing" and word in RU_LOC2:
        loc2 = parse.inflect({"loc2", "sing"})
        if loc2:
            return loc2.word
    return parse.inflect({case, number}).word


def ru_adj(word, case, number, gender=None, noun=None):
    """Прилагательное в нужном падеже, согласованное с существительным (или с подлежащим по роду)."""
    parse = next(p for p in morph.parse(word) if "ADJF" in p.tag)
    tag = noun_parse(noun).tag if noun else None
    grams = {case, number}
    if number == "sing":
        grams.add(gender or tag.gender)
    if case == "accs" and tag and (number == "plur" or tag.gender == "masc"):
        grams.add("anim" if tag.animacy == "anim" else "inan")
    return parse.inflect(grams).word


def with_preposition(prep, phrase):
    """с → со, в → во, о → об перед трудными сочетаниями: «со стола», «во враче», «об имени»."""
    if not prep:
        return phrase
    first, second = phrase[0].lower(), phrase[1:2].lower()
    vowels = "аеёиоуыэюя"
    if prep == "с" and first in "сзшжщ" and second and second not in vowels:
        prep = "со"
    if prep == "в" and first in "вф" and second and second not in vowels:
        prep = "во"
    if prep == "о" and first in "аиоуэ":
        prep = "об"
    return f"{prep} {phrase}"


def render_ru(template, ru_word, number, pos, adj=None):
    """Подставляет в русский шаблон слово (или прилагательное + существительное) в нужном падеже."""
    num = "sing" if number == "sg" else "plur"
    out, i = [], 0
    while i < len(template):
        if template[i] != "{":
            out.append(template[i])
            i += 1
            continue
        end = template.index("}", i)
        parts = template[i + 1 : end].split(":")
        kind = parts[0]
        if kind == "A":  # прилагательное без существительного: «становится тёплой»
            out.append(ru_adj(adj, parts[1], "sing", gender=parts[2]))
            i = end + 1
            continue
        case = parts[-1]
        if adj:
            phrase = f"{ru_adj(adj, case, num, noun=ru_word)} {ru_noun(ru_word, case, num)}"
        else:
            phrase = ru_noun(ru_word, case, num)
        na = ru_word in RU_NA
        prep = {
            "N": "",
            "IN": "на" if na else "в",
            "OUT": "с" if na else "из",
            "ON": "на",
            "OFF": "с",
        }.get(kind, parts[1] if kind == "P" else "")
        out.append(with_preposition(prep, phrase))
        i = end + 1
    text = "".join(out)
    return text[0].upper() + text[1:]


# ---------------------------------------------------------------------------------------------
# Английский
# ---------------------------------------------------------------------------------------------

EN_IRREGULAR = {"child": "children", "man": "men", "woman": "women", "person": "people", "fish": "fish"}


def en_plural(noun):
    if noun in EN_IRREGULAR:
        return EN_IRREGULAR[noun]
    if noun.endswith("y") and noun[-2] not in "aeiou":
        return noun[:-1] + "ies"
    if noun.endswith(("s", "sh", "ch", "x")):
        return noun + "es"
    return noun + "s"


def en_article(phrase):
    if phrase.startswith("univ"):
        return "a"
    return "an" if phrase[0] in "aeiou" or phrase.startswith("hour") else "a"


def render_en(template, en_word, number, adj=None):
    plural = number == "pl"
    noun = en_plural(en_word) if plural else en_word
    phrase = f"{adj} {noun}" if adj else noun
    text = (
        template.replace("{a}", phrase if plural else f"{en_article(phrase)} {phrase}")
        .replace("{n}", phrase)
        .replace("{poss}", f"{phrase}'" if noun.endswith("s") else f"{phrase}'s")
        .replace("{has}", "have" if plural else "has")
        .replace("{adj}", adj or "")
    )
    return text[0].upper() + text[1:]


# ---------------------------------------------------------------------------------------------


def pick(text, number):
    """Вариант шаблона для ед. или мн. ч. («A||B»)."""
    if "||" not in text:
        return text
    sg, pl = text.split("||")
    return sg if number == "sg" else pl


def frame_for(lemma, case):
    override = WORD_FRAMES.get(lemma, {})
    if case in override:
        return override[case]
    return FRAMES[GROUP[lemma]].get(case)


def main():
    words = json.loads(WORDS.read_text(encoding="utf-8"))
    by_id = {w["id"]: w for w in words}
    adjective_nouns = json.loads(ADJECTIVE_NOUNS.read_text(encoding="utf-8"))
    # Каждое существительное должно быть в одной из групп GROUPS (от группы зависят шаблоны),
    # каждое прилагательное — иметь пару в adjective-nouns.json.
    missing_nouns = [w["lemma"] for w in words if w["pos"] != "adj" and w["lemma"] not in GROUP]
    missing_adjs = [w["lemma"] for w in words if w["pos"] == "adj" and w["id"] not in adjective_nouns]
    if missing_nouns or missing_adjs:
        if missing_nouns:
            print("Добавьте эти слова в одну из групп GROUPS:", ", ".join(missing_nouns))
        if missing_adjs:
            print(f"Добавьте существительное к этим прилагательным в {ADJECTIVE_NOUNS.name}:", ", ".join(missing_adjs))
        raise SystemExit(1)
    sentences = {}
    for w in words:
        entry = {}
        for number in ("sg", "pl"):
            for case in CASES:
                if number == "sg" and case == "nom":
                    continue  # словарную форму не спрашиваем
                if w["pos"] == "adj":
                    noun = by_id[adjective_nouns[w["id"]]]
                    if case == "transl":
                        frame = ADJ_TRANSL.get(w["lemma"])
                    elif case == "ess":
                        frame = ADJ_ESS.get(w["lemma"])
                    elif case in ("term", "abess", "com"):
                        frame = None  # отдельно от существительного не употребляются
                    else:
                        frame = frame_for(noun["lemma"], case)
                    ru_word, en_word, adj_ru, adj_en = noun["tr"]["ru"], noun["tr"]["en"], w["tr"]["ru"], w["tr"]["en"]
                else:
                    frame = frame_for(w["lemma"], case)
                    ru_word, en_word, adj_ru, adj_en = w["tr"]["ru"], w["tr"]["en"], None, None
                if not frame:
                    continue
                et, ru, en, numbers = frame
                if number not in numbers:
                    continue
                if number == "pl" and case in SINGULAR_ONLY.get(w["lemma"], ()):
                    continue
                entry[f"{number}.{case}"] = {
                    "et": pick(et, number),
                    "ru": render_ru(pick(ru, number), ru_word, number, w["pos"], adj_ru),
                    "en": render_en(pick(en, number), en_word, number, adj_en),
                }
        sentences[w["id"]] = entry
    TARGET.write_text(json.dumps(sentences, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    total = sum(len(e) for e in sentences.values())
    print(f"{total} предложений для {len(sentences)} слов -> {TARGET.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
