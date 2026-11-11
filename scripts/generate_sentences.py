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
    "building": [
        "maja", "kool", "ülikool", "kirik", "pood", "tuba", "köök",
        "korter", "haigla", "apteek", "pank", "kino", "teater", "muuseum", "restoran", "kohvik", "hotell",
        "raamatukogu", "kontor",
    ],
    "open": [
        "linn", "tänav", "tee", "mets", "meri", "järv", "jõgi", "saar", "mägi",
        "park", "väljak", "aed", "põld", "rand", "küla", "turg", "sild",
    ],
    "vehicle": ["auto", "rong", "laev", "lennuk", "buss", "tramm", "jalgratas", "paat", "takso"],
    "thing": [
        "laud", "tool", "aken", "uks", "raamat", "pilt", "lill", "puu",
        "voodi", "kapp", "lamp", "tass", "taldrik", "klaas", "nuga", "pudel", "kott", "võti", "telefon",
        "arvuti", "kell", "pall",
    ],
    "clothing": ["särk", "kleit", "jope", "müts", "sall", "king", "sokk", "mantel"],
    "person": [
        "sõber", "ema", "isa", "laps", "mees", "naine", "poiss", "tüdruk", "inimene", "arst", "õpetaja", "pere",
        "vend", "õde", "vanaema", "vanaisa", "poeg", "tütar", "naaber", "õpilane", "müüja", "kokk",
    ],
    "animal": ["koer", "kass", "kala", "hobune", "lehm", "lind", "hiir", "karu", "hunt", "kana"],
    "food": ["leib", "vesi", "õun", "piim", "kohv", "juust", "liha", "supp", "kook", "muna", "kartul", "tomat", "mahl"],
    "body": ["käsi", "jalg", "pea", "silm", "sõrm", "süda"],
    "abstract": ["töö", "keel", "sõna", "nimi", "küsimus", "lugu", "uni", "riik"],
    "weather": ["lumi", "vihm"],
    "nature": ["päike", "tuul", "kivi"],
    "time": ["päev", "öö", "nädal", "aasta", "tund", "talv", "suvi", "hommik", "õhtu"],
}
GROUP = {lemma: group for group, lemmas in GROUPS.items() for lemma in lemmas}

# ---------------------------------------------------------------------------------------------
# Шаблоны: (эстонский, русский, английский, числа).
#
# Эстонский: {} — форма слова (или прилагательное + существительное).
# Русский: {N:падеж} — слово без предлога; {IN:падеж} — «в» или «на» (на улице, на кухне);
#   {OUT:падеж} — «из» или «с»; {ON:падеж} — «на»; {OFF:падеж} — «с»; {P:предлог:падеж} — свой предлог.
# Английский: {n} — слово (во мн. ч. — во множественном), {a} — «a car» / «cars», {has} — has/have,
#   {poss} — «the boy's» / «the boys'», {sg} — слово в ед. ч. («by train»), {the} / {The} — «my» для
#   родных и друзей («my mother»), иначе «the».
# Если текст отличается для ед. и мн. ч., варианты разделены «||».
# ---------------------------------------------------------------------------------------------

BOTH = ("sg", "pl")
SG = ("sg",)


def F(et, ru, en, numbers=BOTH):
    return (et, ru, en, numbers)


NOM = F("See on {}.||Need on {}.", "Это {N:nomn}.", "This is {a}.||These are {n}.")
AT = F("Ma ootan {} juures.", "Я жду {P:у:gent}.", "I'm waiting by the {n}.")
# «Смотреть на» требует частичного падежа, а «видеть» допускает и полный объект (näen maja/majad),
# поэтому для частичного падежа — vaatama.
LOOK = F("Ma vaatan {}.", "Я смотрю {P:на:accs}.", "I look at the {n}.")
LIVE_WITHOUT = F("Ma ei saa elada {}.", "Я не могу жить {P:без:gent}.", "I can't live without {the} {n}.", SG)
WALK_TO = F("Ma kõnnin kuni {}.", "Я дохожу {P:до:gent}.", "I walk as far as the {n}.", SG)
BIRD_ONTO = F(
    "Lind lendab {}.||Linnud lendavad {}.",
    "Птица летит {ON:accs}.||Птицы летят {ON:accs}.",
    "A bird flies onto the {n}.||Birds fly onto the {n}.",
)
BIRD_ON = F(
    "Lind istub {}.||Linnud istuvad {}.",
    "Птица сидит {ON:loct}.||Птицы сидят {ON:loct}.",
    "A bird sits on the {n}.||Birds sit on the {n}.",
)
BIRD_OFF = F(
    "Lind lendab {} ära.||Linnud lendavad {} ära.",
    "Птица улетает {OFF:gent}.||Птицы улетают {OFF:gent}.",
    "A bird flies off the {n}.||Birds fly off the {n}.",
)
WRITE_ON = F(
    "Ma kirjutan nime {}.||Me kirjutame nimed {}.",
    "Я пишу имя {ON:loct}.||Мы пишем имена {ON:loct}.",
    "I write a name on the {n}.||We write names on the {n}.",
)
MISTAKE_IN = F(
    "{} on viga.||{} on vigu.",
    "{IN:loct} ошибка.||{IN:loct} есть ошибки.",
    "There is a mistake in the {n}.||There are mistakes in the {n}.",
)
TALK_ABOUT = F("Me räägime {}.", "Мы говорим {P:о:loct}.", "We talk about the {n}.")
MEANING = F(
    "{} on tähendus.||{} on tähendused.",
    "{P:у:gent} есть значение.||{P:у:gent} есть значения.",
    "The {n} {has} a meaning.||The {n} have meanings.",
)
VILLAGE_LOST = F("Küla jäi {}.", "Деревня осталась {P:без:gent}.", "The village was left without {a}.", SG)

FRAMES = {
    "building": {
        "nom": NOM,
        "gen": F("Ma ootan {} juures.||See on {} nimekiri.", "Я жду {P:у:gent}.||Это список {N:gent}.", "I'm waiting by the {n}.||This is a list of {n}."),
        "part": LOOK,
        "ill": F(
            "Ma lähen {}.||Inimesed lähevad {}.",
            "Я иду {IN:accs}.||Люди идут {IN:accs}.",
            "I go into the {n}.||People go into the {n}.",
        ),
        "ines": F(
            "Ma olen {}.||Inimesed on {}.",
            "Я {IN:loct}.||Люди {IN:loct}.",
            "I am in the {n}.||People are in the {n}.",
        ),
        "ela": F(
            "Ma tulen {}.||Inimesed tulevad {}.",
            "Я выхожу {OUT:gent}.||Люди выходят {OUT:gent}.",
            "I come out of the {n}.||People come out of the {n}.",
        ),
        "term": WALK_TO,
    },
    "open": {
        "nom": NOM,
        "gen": F("See on {} kaart.", "Это карта {N:gent}.", "This is a map of the {n}."),
        "part": LOOK,
        "term": WALK_TO,
    },
    "vehicle": {
        "nom": NOM, "gen": AT,
        "part": F("Ma ootan {}.||Ma vaatan {}.", "Я жду {N:accs}.||Я смотрю {P:на:accs}.", "I'm waiting for the {n}.||I look at the {n}."),
        "term": WALK_TO,
        "com": F(
            "Ma sõidan {}.||Mu isa töötab {}.",
            "Я еду {P:на:loct}.||Мой папа работает {P:с:ablt}.",
            "I travel by {sg}.||My dad works with {n}.",
        ),
    },
    "thing": {
        "nom": NOM,
        "gen": F(
            "See on {} hind.||Need on {} hinnad.",
            "Это цена {N:gent}.||Это цены {P:на:accs}.",
            "This is the price of the {n}.||These are the prices of the {n}.",
        ),
        "part": LOOK,
    },
    "clothing": {
        "nom": NOM,
        "gen": F("See on {} hind.", "Это цена {N:gent}.", "This is the price of the {n}."),
        "part": F("Ma pesen {}.", "Я стираю {N:accs}.", "I'm washing the {n}."),
        "com": F("Ma lähen välja {}.", "Я выхожу на улицу {P:в:loct}.", "I go out in {a}.", SG),
        "abess": F("Ma ei lähe välja {}.", "Я не выхожу на улицу {P:без:gent}.", "I don't go out without {a}.", SG),
    },
    "nature": {},
    "person": {
        "nom": NOM,
        "gen": F(
            "See on {} raamat.||Ma kuulan {} juttu.",
            "Это книга {N:gent}.||Я слушаю, о чём говорят {N:nomn}.",
            "This is {the} {poss} book.||I'm listening to what the {n} are saying.",
        ),
        "part": F("Ma ootan {}.", "Я жду {N:accs}.", "I'm waiting for {the} {n}."),
        "all": F("Ma helistan {}.", "Я звоню {N:datv}.", "I call {the} {n}."),
        "ade": F(
            "{} on koer.||{} on koerad.",
            "{P:у:gent} есть собака.||{P:у:gent} есть собаки.",
            "{The} {n} {has} a dog.||{The} {n} have dogs.",
        ),
        "abl": F("Ma saan kirja {}.", "Я получаю письмо {P:от:gent}.", "I get a letter from {the} {n}."),
        "com": F("Ma lähen {} kinno.", "Я иду в кино {P:с:ablt}.", "I go to the cinema with {the} {n}."),
    },
    "animal": {
        "nom": NOM,
        "gen": F("See on {} toit.", "Это корм {P:для:gent}.", "This is food for the {n}."),
        "part": F("Ma silitan {}.", "Я глажу {N:accs}.", "I stroke the {n}."),
        "all": F("Ma annan {} süüa.", "Я кормлю {N:accs}.", "I feed the {n}."),
        "ade": F(
            "{} on nimi.||{} on nimed.",
            "{P:у:gent} есть кличка.||{P:у:gent} есть клички.",
            "The {n} {has} a name.||The {n} have names.",
        ),
    },
    "food": {
        "nom": NOM,
        "gen": F("See on {} hind.", "Это цена {N:gent}.", "This is the price of the {n}."),
    },
    "body": {
        "nom": NOM,
        "part": F("Ma pesen {}.", "Я мою {N:accs}.", "I wash my {n}."),
    },
    "abstract": {"nom": NOM},
    "weather": {
        "nom": F("See on {}.", "Это {N:nomn}.", "This is {n}.", SG),
        "part": F("Ma näen {}.", "Я вижу {N:accs}.", "I see the {n}.", SG),
    },
    "time": {
        "part": F("||Ma mäletan neid {}.", "||Я помню те {N:accs}.", "||I remember those {n}.", ("pl",)),
        "transl": F("Ma tulen {}.", "Я приезжаю {P:на:accs}.", "I'm coming for {a}.", SG),
    },
}

# Шаблоны для отдельных слов: дополняют или заменяют шаблоны группы. None — такого задания нет.
WORD_FRAMES = {
    # Здания.
    "maja": {
        "gen": F("Ma ootan {} juures.||Ma ootan {} vahel.", "Я жду {P:у:gent}.||Я жду {P:между:ablt}.", "I'm waiting by the {n}.||I'm waiting between the {n}."),
        "ade": F(
            "{} on punane katus.||{} on punased katused.",
            "{P:у:gent} красная крыша.||{P:у:gent} красные крыши.",
            "The {n} {has} a red roof.||The {n} have red roofs.",
        ),
        "all": F(
            "Me paneme {} uue katuse.||Me paneme {} uued katused.",
            "Мы ставим новую крышу {ON:accs}.||Мы ставим новые крыши {ON:accs}.",
            "We put a new roof on the {n}.||We put new roofs on the {n}.",
        ),
        "abl": F(
            "Me võtame {} vana katuse maha.||Me võtame {} vanad katused maha.",
            "Мы снимаем старую крышу {OFF:gent}.||Мы снимаем старые крыши {OFF:gent}.",
            "We take the old roof off the {n}.||We take the old roofs off the {n}.",
        ),
    },
    "kirik": {
        "ill": F("Ma lähen {}.||Inimesed lähevad {}.", "Я иду {IN:accs}.||Люди идут {IN:accs}.", "I go into the {n}.||People go into the {n}."),
        "ines": F("Ma olen {}.||Inimesed on {}.", "Я {IN:loct}.||Люди {IN:loct}.", "I am in the {n}.||People are in the {n}."),
        "ela": F("Ma tulen {}.||Inimesed tulevad {}.", "Я выхожу {OUT:gent}.||Люди выходят {OUT:gent}.", "I come out of the {n}.||People come out of the {n}."),
        "ade": F(
            "{} on kõrge torn.||{} on kõrged tornid.",
            "{P:у:gent} высокая башня.||{P:у:gent} высокие башни.",
            "The {n} {has} a tall tower.||The {n} have tall towers.",
        ),
        "abess": VILLAGE_LOST,
    },
    "kool": {
        "ill": F("Ma lähen {}.||Lapsed lähevad {}.", "Я иду {IN:accs}.||Дети идут {IN:accs}.", "I go to {sg}.||The children go to {sg}."),
        "ines": F("Ma olen {}.||Lapsed on {}.", "Я {IN:loct}.||Дети {IN:loct}.", "I am at {sg}.||The children are at {sg}."),
        "all": F("Ma kirjutan {}.", "Я пишу {P:в:accs}.", "I write to the {n}."),
        "ade": F("{} on uus direktor.", "{P:у:gent} новый директор.", "The {n} {has} a new head.", SG),
        "abl": F("Ma saan kirja {}.", "Я получаю письмо {P:из:gent}.", "I get a letter from the {n}."),
        "abess": VILLAGE_LOST,
    },
    "ülikool": {
        "ela": F(
            "Ma tulen {}.||Noored tulevad {} otse tööle.",
            "Я выхожу {OUT:gent}.||Молодые люди приходят на работу прямо {P:из:gent}.",
            "I come out of the {n}.||Young people go straight from {sg} to work.",
        ),
        "ill": F("Ma lähen {}.||Noored lähevad {}.", "Я иду {IN:accs}.||Молодые люди идут {IN:accs}.", "I go to {sg}.||Young people go to {sg}."),
        "ines": F("Ma õpin {}.||Noored õpivad {}.", "Я учусь {IN:loct}.||Молодые люди учатся {IN:loct}.", "I study at {sg}.||Young people study at {sg}."),
        "all": F("Ma kirjutan {}.", "Я пишу {P:в:accs}.", "I write to the {n}."),
        "ade": F("{} on uus rektor.", "{P:у:gent} новый ректор.", "The {n} {has} a new rector.", SG),
        "abl": F("Ma saan kirja {}.", "Я получаю письмо {P:из:gent}.", "I get a letter from the {n}."),
        "abess": F("Linn jäi {}.", "Город остался {P:без:gent}.", "The city was left without {a}.", SG),
    },
    "haigla": {
        "ines": F("Ma olen {}.||Inimesed on {}.", "Я {IN:loct}.||Люди {IN:loct}.", "I'm at the {n}.||People are at the {n}."),
    },
    "kino": {"part": F("Ma otsin {}.", "Я ищу {N:accs}.", "I'm looking for the {n}.")},
    "pood": {
        "ill": F("Ma lähen {}.||Inimesed lähevad {}.", "Я иду {IN:accs}.||Люди идут {IN:accs}.", "I go into the {n}.||People go into the {n}."),
        "ines": F("Ma olen {}.||Inimesed on {}.", "Я {IN:loct}.||Люди {IN:loct}.", "I am in the {n}.||People are in the {n}."),
        "ela": F("Ma tulen {}.||Inimesed tulevad {}.", "Я выхожу {OUT:gent}.||Люди выходят {OUT:gent}.", "I come out of the {n}.||People come out of the {n}."),
        "abess": VILLAGE_LOST,
    },
    "tuba": {
        "gen": F("See on {} uks.", "Это дверь {P:в:accs}.", "This is the door to the {n}.", SG),
        "term": None,
    },
    "köök": {
        "gen": F("See on {} uks.", "Это дверь {P:на:accs}.", "This is the {n} door.", SG),
        "ill": F("Ma lähen {}.", "Я иду {IN:accs}.", "I go into the {n}.", SG),
        "ines": F("Ma olen {}.", "Я {IN:loct}.", "I am in the {n}.", SG),
        "ela": F("Ma tulen {}.", "Я выхожу {OUT:gent}.", "I come out of the {n}.", SG),
        "term": None,
        "com": F("See on korter {}.", "Это квартира {P:с:ablt}.", "This is a flat with {a}.", SG),
    },
    # Открытые места.
    "linn": {
        "ill": F("Ma sõidan {}.||Turistid sõidavad {}.", "Я еду {IN:accs}.||Туристы едут {IN:accs}.", "I travel to the {n}.||Tourists travel to the {n}."),
        "ines": F("Ma elan {}.||Inimesed elavad {}.", "Я живу {IN:loct}.||Люди живут {IN:loct}.", "I live in the {n}.||People live in the {n}."),
        "ela": F("Ma tulen {}.||Turistid tulevad {}.", "Я возвращаюсь {OUT:gent}.||Туристы приезжают {OUT:gent}.", "I come back from the {n}.||Tourists come from the {n}."),
        "abess": F("Ma ei saa elada {}.", "Я не могу жить {P:без:gent}.", "I can't live without the {n}.||I can't live without {n}."),
    },
    "mets": {
        "ill": F("Ma lähen {}.||Linnud lendavad {}.", "Я иду {IN:accs}.||Птицы летят {IN:accs}.", "I go into the {n}.||Birds fly into the {n}."),
        "ines": F("Ma jalutan {}.||Loomad elavad {}.", "Я гуляю {IN:loct}.||Звери живут {IN:loct}.", "I walk in the {n}.||Animals live in the {n}."),
        "ela": F("Ma tulen {}.||Loomad tulevad {}.", "Я выхожу {OUT:gent}.||Звери выходят {OUT:gent}.", "I come out of the {n}.||Animals come out of the {n}."),
        "abess": F("Ma ei saa elada {}.", "Я не могу жить {P:без:gent}.", "I can't live without the {n}.||I can't live without {n}."),
    },
    "tänav": {
        "gen": F("See on {} nimi.||Need on {} nimed.", "Это название {N:gent}.||Это названия {N:gent}.", "This is the name of the {n}.||These are the names of the {n}."),
        "all": F("Ma lähen {}.||Inimesed tulevad {}.", "Я выхожу {ON:accs}.||Люди выходят {ON:accs}.", "I go out into the {n}.||People come out into the {n}."),
        "ade": F("Ma olen {}.||Inimesed on {}.", "Я {ON:loct}.||Люди {ON:loct}.", "I am in the {n}.||People are in the {n}."),
        "abl": F("Ma tulen {} tuppa.", "Я захожу в дом {OFF:gent}.", "I come in from the {n}.", SG),
    },
    "tee": {
        "gen": F("Ma seisan {} ääres.", "Я стою {P:у:gent}.", "I'm standing by the {n}.", SG),
        "all": F("Auto sõidab {}.||Autod sõidavad {}.", "Машина выезжает {ON:accs}.||Машины выезжают {ON:accs}.", "A car drives onto the {n}.||Cars drive onto the {n}."),
        "ade": F("Auto on {}.||Autod on {}.", "Машина {ON:loct}.||Машины {ON:loct}.", "The car is on the {n}.||Cars are on the {n}."),
        "abl": F("Auto sõidab {} välja.||Lumi sulab {}.", "Машина съезжает {OFF:gent}.||Снег сходит {OFF:gent}.", "A car goes off the {n}.||The snow melts off the {n}."),
    },
    "meri": {
        "ill": F("Ma hüppan {}.", "Я прыгаю {P:в:accs}.", "I jump into the {n}.", SG),
        "ines": F("Ma ujun {}.||Kalad elavad {}.", "Я плаваю {P:в:loct}.||Рыбы живут {P:в:loct}.", "I swim in the {n}.||Fish live in the {n}."),
        "ela": F("Ma tulen {} välja.", "Я выхожу {P:из:gent}.", "I come out of the {n}.", SG),
        "all": F("Me sõidame paadiga {}.", "Мы выходим на лодке {ON:accs}.", "We take a boat out onto the {n}.", SG),
        "ade": F("Paat on {}.", "Лодка {ON:loct}.", "The boat is on the {n}.", SG),
        "abl": F("Paat tuleb {} tagasi.", "Лодка возвращается {OFF:gent}.", "The boat comes back from the {n}.", SG),
        "abess": F("Ma ei saa elada {}.", "Я не могу жить {P:без:gent}.", "I can't live without the {n}.", SG),
    },
    "järv": {
        "ill": F("Ma hüppan {}.", "Я прыгаю {P:в:accs}.", "I jump into the {n}.", SG),
        "ines": F("Ma ujun {}.||Kalad elavad {}.", "Я плаваю {P:в:loct}.||Рыбы живут {P:в:loct}.", "I swim in the {n}.||Fish live in the {n}."),
        "ela": F("Ma tulen {} välja.", "Я выхожу {P:из:gent}.", "I come out of the {n}.", SG),
        "all": F("Me sõidame paadiga {}.", "Мы выходим на лодке {ON:accs}.", "We take a boat out onto the {n}.", SG),
        "ade": F("Paat on {}.||Paadid on {}.", "Лодка {ON:loct}.||Лодки {ON:loct}.", "The boat is on the {n}.||The boats are on the {n}."),
        "abl": F("Paat tuleb {} tagasi.||Paadid tulevad {} tagasi.", "Лодка возвращается {OFF:gent}.||Лодки возвращаются {OFF:gent}.", "The boat comes back from the {n}.||The boats come back from the {n}."),
    },
    "jõgi": {
        "ill": F("Ma hüppan {}.", "Я прыгаю {P:в:accs}.", "I jump into the {n}.", SG),
        "ines": F("Ma ujun {}.||Kalad elavad {}.", "Я плаваю {P:в:loct}.||Рыбы живут {P:в:loct}.", "I swim in the {n}.||Fish live in the {n}."),
        "ela": F("Ma tulen {} välja.", "Я выхожу {P:из:gent}.", "I come out of the {n}.", SG),
        "all": F("Me sõidame paadiga {}.", "Мы выходим на лодке {ON:accs}.", "We take a boat out onto the {n}.", SG),
        "ade": F("Paat on {}.||Paadid on {}.", "Лодка {ON:loct}.||Лодки {ON:loct}.", "The boat is on the {n}.||The boats are on the {n}."),
        "abl": F("Paat tuleb {} tagasi.", "Лодка возвращается {OFF:gent}.", "The boat comes back from the {n}.", SG),
    },
    "saar": {
        "all": F("Me sõidame laevaga {}.||Turistid sõidavad {}.", "Мы плывём на корабле {ON:accs}.||Туристы едут {ON:accs}.", "We sail to the {n}.||Tourists travel to the {n}."),
        "ade": F("Ma elan {}.||Inimesed elavad {}.", "Я живу {ON:loct}.||Люди живут {ON:loct}.", "I live on the {n}.||People live on the {n}."),
        "abl": F("Ma tulen {}.||Turistid tulevad {}.", "Я возвращаюсь {OFF:gent}.||Туристы возвращаются {OFF:gent}.", "I come back from the {n}.||Tourists come back from the {n}."),
        "term": F("Paat sõidab {}.", "Лодка плывёт {P:до:gent}.", "The boat sails to the {n}.", SG),
    },
    "mägi": {
        "gen": F("See on {} tipp.||Need on {} tipud.", "Это вершина {N:gent}.||Это вершины {N:gent}.", "This is the top of the {n}.||These are the tops of the {n}."),
        "all": F("Ma ronin {}.||Päike paistab {}.", "Я поднимаюсь {ON:accs}.||Солнце светит {ON:accs}.", "I climb up the {n}.||The sun shines on the {n}."),
        "ade": F("Ma olen {}.||{} on lumi.", "Я {ON:loct}.||{ON:loct} лежит снег.", "I am on the {n}.||There is snow on the {n}."),
        "abl": F("Ma tulen {} alla.||Tuul puhub {}.", "Я спускаюсь {OFF:gent}.||Ветер дует {OFF:gent}.", "I come down the {n}.||The wind blows from the {n}."),
    },
    # Транспорт.
    "auto": {
        "ill": F("Ma istun {}.||Inimesed istuvad {}.", "Я сажусь {IN:accs}.||Люди садятся {IN:accs}.", "I get into the {n}.||People get into the {n}."),
        "ines": F("Ma olen {}.||Inimesed on {}.", "Я {IN:loct}.||Люди {IN:loct}.", "I am in the {n}.||People are in the {n}."),
        "ela": F("Ma tulen {} välja.||Inimesed tulevad {} välja.", "Я выхожу {OUT:gent}.||Люди выходят {OUT:gent}.", "I get out of the {n}.||People get out of the {n}."),
        "ade": F("{} on uued rehvid.", "{P:у:gent} новые шины.", "The {n} {has} new tyres."),
        "all": F("Ma panen {} uued rehvid.||Me paneme {} uued rehvid.", "Я ставлю новые шины {ON:accs}.||Мы ставим новые шины {ON:accs}.", "I put new tyres on the {n}.||We put new tyres on the {n}."),
        "abl": F("Ma pesen {} pori maha.||Me peseme {} pori maha.", "Я смываю грязь {OFF:gent}.||Мы смываем грязь {OFF:gent}.", "I wash the mud off the {n}.||We wash the mud off the {n}."),
        "abess": F("Ma olen {}.", "Я {P:без:gent}.", "I don't have a car.", SG),
    },
    "rong": {
        "ill": F("Ma istun {}.", "Я сажусь {IN:accs}.", "I get on the {n}.", SG),
        "ines": F("Ma olen {}.||Inimesed on {}.", "Я {IN:loct}.||Люди {IN:loct}.", "I am on the {n}.||People are on the {n}."),
        "ela": F("Ma vaatan {} välja.", "Я смотрю {OUT:gent}.", "I look out of the {n}.", SG),
        "all": F("Ma jõuan {}.", "Я успеваю {P:на:accs}.", "I catch the {n}.", SG),
        "ade": F("{} on kümme vagunit.||{} on palju vaguneid.", "{P:у:gent} десять вагонов.||{P:у:gent} много вагонов.", "The {n} {has} ten carriages.||The {n} have many carriages."),
        "abl": F("Ma tulen {}.||Reisijad tulevad {}.", "Я схожу {OFF:gent}.||Пассажиры сходят {OFF:gent}.", "I get off the {n}.||The passengers get off the {n}."),
    },
    "lennuk": {
        "ill": F("Ma istun {}.", "Я сажусь {IN:accs}.", "I board the {n}.", SG),
        "ines": F("Ma olen {}.||Inimesed on {}.", "Я {IN:loct}.||Люди {IN:loct}.", "I am on the {n}.||People are on the {n}."),
        "ela": F("Ma vaatan {} välja.", "Я смотрю {OUT:gent}.", "I look out of the {n}.", SG),
        "all": F("Ma jõuan {}.", "Я успеваю {P:на:accs}.", "I catch the {n}.", SG),
        "ade": F("{} on kaks mootorit.||{} on tiivad.", "{P:у:gent} два двигателя.||{P:у:gent} есть крылья.", "The {n} {has} two engines.||The {n} have wings."),
        "abl": F("Ma tulen {}.||Reisijad tulevad {}.", "Я схожу {OFF:gent}.||Пассажиры сходят {OFF:gent}.", "I get off the {n}.||The passengers get off the {n}."),
    },
    "laev": {
        "ill": F("Vesi tungib {}.", "Вода проникает {P:в:accs}.", "Water gets into the {n}.", SG),
        "ines": F("{} on auk.", "{P:в:loct} пробоина.", "There is a hole in the {n}.", SG),
        "all": F("Ma lähen {}.", "Я поднимаюсь {ON:accs}.", "I board the {n}.", SG),
        "ade": F("Ma olen {}.||Meremehed on {}.", "Я {ON:loct}.||Моряки {ON:loct}.", "I am on the {n}.||The sailors are on the {n}."),
        "abl": F("Ma tulen {}.||Reisijad tulevad {}.", "Я схожу {OFF:gent}.||Пассажиры сходят {OFF:gent}.", "I get off the {n}.||The passengers get off the {n}."),
    },
    # Предметы.
    "laud": {
        "gen": AT,
        "all": F("Ma panen raamatu {}.||Me paneme raamatud {}.", "Я кладу книгу {ON:accs}.||Мы кладём книги {ON:accs}.", "I put the book on the {n}.||We put the books on the {n}."),
        "ade": F("Raamat on {}.||Raamatud on {}.", "Книга {ON:loct}.||Книги {ON:loct}.", "The book is on the {n}.||The books are on the {n}."),
        "abl": F("Ma võtan raamatu {}.||Me võtame raamatud {}.", "Я беру книгу {OFF:gent}.||Мы берём книги {OFF:gent}.", "I take the book off the {n}.||We take the books off the {n}."),
        "term": WALK_TO,
    },
    "tool": {
        "gen": AT,
        "all": F("Ma panen koti {}.||Me paneme kotid {}.", "Я ставлю сумку {ON:accs}.||Мы ставим сумки {ON:accs}.", "I put the bag on the {n}.||We put the bags on the {n}."),
        "ade": F("Kass istub {}.||Kassid istuvad {}.", "Кошка сидит {ON:loct}.||Кошки сидят {ON:loct}.", "The cat sits on the {n}.||The cats sit on the {n}."),
        "abl": F("Kass hüppab {}.||Kassid hüppavad {}.", "Кошка спрыгивает {OFF:gent}.||Кошки спрыгивают {OFF:gent}.", "The cat jumps off the {n}.||The cats jump off the {n}."),
    },
    "aken": {
        "gen": AT,
        "ela": F("Ma vaatan {} välja.||Inimesed vaatavad {} välja.", "Я смотрю {OUT:gent}.||Люди смотрят {OUT:gent}.", "I look out of the {n}.||People look out of the {n}."),
        "all": BIRD_ONTO, "ade": BIRD_ON, "abl": BIRD_OFF,
        "term": WALK_TO,
        "abess": F("{} tuba on pime.", "Комната {P:без:gent} тёмная.", "A room without a window is dark.", SG),
    },
    "uks": {
        "gen": AT,
        "ela": F("Ma tulen {} sisse.", "Я вхожу {P:через:accs}.", "I come in through the {n}.", SG),
        "all": WRITE_ON,
        "ade": F("{} on number.||{} on numbrid.", "{ON:loct} есть номер.||{ON:loct} есть номера.", "There is a number on the {n}.||There are numbers on the {n}."),
        "term": WALK_TO,
    },
    "raamat": {
        "gen": F("Mul on küsimus {} kohta.", "У меня вопрос {P:о:loct}.", "I have a question about the {n}."),
        "part": F("Ma loen {}.", "Я читаю {N:accs}.", "I'm reading the {n}."),
        "ill": F("Ma kirjutan {}.", "Я пишу {IN:accs}.", "I write in the {n}.", SG),
        "ines": F("Vastus on {}.||Vastused on {}.", "Ответ {IN:loct}.||Ответы {IN:loct}.", "The answer is in the {n}.||The answers are in the {n}."),
        "ela": F("Ma loen {} ette.", "Я читаю вслух {OUT:gent}.", "I read aloud from the {n}.", SG),
        "all": WRITE_ON,
        "ade": F("{} on pealkiri.||{} on pealkirjad.", "{P:у:gent} есть название.||{P:у:gent} есть названия.", "The {n} {has} a title.||The {n} have titles."),
        "abess": F("Ta tuli kooli {}.", "Он пришёл в школу {P:без:gent}.", "He came to school without {a}.||He came to school without {n}."),
        "com": F("Ma tulen koju {}.", "Я прихожу домой {P:с:ablt}.", "I come home with {a}.||I come home with {n}."),
    },
    "pilt": {
        "gen": F("Mul on küsimus {} kohta.", "У меня вопрос {P:о:loct}.", "I have a question about the {n}."),
        "all": F("Ma kirjutan nime {}.", "Я пишу имя {ON:loct}.", "I write a name on the {n}.", SG),
        "ade": F("{} on mees.||{} on inimesed.", "{ON:loct} мужчина.||{ON:loct} люди.", "There is a man in the {n}.||There are people in the {n}."),
        "com": F("||See on raamat {}.", "||Это книга {P:с:ablt}.", "||This is a book with {n}.", ("pl",)),
    },
    "lill": {
        "gen": F("Ma tean {} nime.||Ma tean {} nimesid.", "Я знаю название {N:gent}.||Я знаю названия {N:gent}.", "I know the name of the {n}.||I know the names of the {n}."),
        "all": F("Mesilane lendab {}.||Mesilased lendavad {}.", "Пчела летит {ON:accs}.||Пчёлы летят {ON:accs}.", "A bee flies onto the {n}.||Bees fly onto the {n}."),
        "ade": F("Mesilane istub {}.||Mesilased istuvad {}.", "Пчела сидит {ON:loct}.||Пчёлы сидят {ON:loct}.", "A bee sits on the {n}.||Bees sit on the {n}."),
        "abl": F("Mesilane lendab {} ära.||Mesilased lendavad {} ära.", "Пчела улетает {OFF:gent}.||Пчёлы улетают {OFF:gent}.", "A bee flies off the {n}.||Bees fly off the {n}."),
        "com": F("Ma tulen külla {}.", "Я прихожу в гости {P:с:ablt}.", "I come to visit with {a}.||I come to visit with {n}."),
    },
    "puu": {
        "gen": F("Ma istun {} all.||Me istume {} all.", "Я сижу {P:под:ablt}.||Мы сидим {P:под:ablt}.", "I sit under the {n}.||We sit under the {n}."),
        "all": BIRD_ONTO, "ade": BIRD_ON, "abl": BIRD_OFF,
        "term": WALK_TO,
    },
    # Люди.
    "sõber": {
        "gen": F("Ma olen {} juures.", "Я {P:у:gent}.", "I'm at my {poss} place.", SG),
        "transl": F("Ta sai mulle {}.||Me saime {}.", "Он стал мне {N:ablt}.||Мы стали {N:ablt}.", "He became my {n}.||We became {n}."),
        "ess": F(
            "Ma ütlen seda sulle {}.||Me lahkusime {}.",
            "Я говорю тебе это {P:как:nomn}.||Мы расстались {N:ablt}.",
            "I'm telling you this as {a}.||We parted as {n}.",
        ),
        "abess": LIVE_WITHOUT,
    },
    "ema": {
        "gen": F("Ma olen {} juures.", "Я {P:у:gent}.", "I'm at my {poss} place."),
        "transl": F("Ta sai {}.", "Она стала {N:ablt}.", "She became {a}.", SG),
        "ess": F("{} muretsen ma oma laste pärast.", "{P:как:nomn} я волнуюсь за своих детей.", "As {a}, I worry about my children.", SG),
        "abess": LIVE_WITHOUT,
    },
    "isa": {
        "gen": F("Ma olen {} juures.", "Я {P:у:gent}.", "I'm at my {poss} place."),
        "transl": F("Ta sai {}.", "Он стал {N:ablt}.", "He became {a}.", SG),
        "ess": F("{} muretsen ma oma laste pärast.", "{P:как:nomn} я волнуюсь за своих детей.", "As {a}, I worry about my children.", SG),
        "abess": LIVE_WITHOUT,
    },
    "pere": {
        "gen": F("Ma olen {} juures.", "Я у родных.", "I'm with my family."),
        "ess": F("{} oleme tugevad.", "{P:как:nomn} мы сильны.", "As a family, we are strong.", SG),
        "transl": F("Me saime {}.", "Мы стали {N:ablt}.", "We became a family.", SG),
        "abess": LIVE_WITHOUT,
    },
    "laps": {
        "gen": F("See on {} raamat.", "Это книга {N:gent}.||Это детская книга.", "This is the child's book.||This is a children's book."),
        "ade": F("{} on pall.||{} on mänguasjad.", "{P:у:gent} есть мяч.||{P:у:gent} есть игрушки.", "The child has a ball.||The children have toys."),
        "ess": F(
            "{} olin ma õnnelik.||{} olime me õnnelikud.",
            "В детстве я был счастлив.||В детстве мы были счастливы.",
            "As a child, I was happy.||As children, we were happy.",
        ),
        "abess": F("Me reisime {}.", "Мы путешествуем {P:без:gent}.", "We travel without the child.||We travel without the children."),
    },
    "mees": {
        "com": F(
            "Ma räägin võõra {}.||Ma räägin võõraste {}.",
            "Я разговариваю с незнакомым мужчиной.||Я разговариваю с незнакомыми мужчинами.",
            "I'm talking to a stranger.||I'm talking to strangers.",
        ),
    },
    "naine": {
        "com": F(
            "Ma räägin võõra {}.||Ma räägin võõraste {}.",
            "Я разговариваю с незнакомой женщиной.||Я разговариваю с незнакомыми женщинами.",
            "I'm talking to a stranger.||I'm talking to strangers.",
        ),
    },
    "poiss": {"ess": F("{} olin ma õnnelik.", "Когда я был мальчиком, я был счастлив.", "As a boy, I was happy.", SG)},
    "tüdruk": {"ess": F("{} olin ma õnnelik.", "Когда я была девочкой, я была счастлива.", "As a girl, I was happy.", SG)},
    "arst": {
        "gen": F("Ma olen {} juures.", "Я {P:у:gent}.", "I am at the {poss}.", SG),
        "transl": F("Ma tahan saada {}.||Nad tahavad saada {}.", "Я хочу стать {N:ablt}.||Они хотят стать {N:ablt}.", "I want to become {a}.||They want to become {n}."),
        "ess": F("Ta töötab {}.||Nad töötavad {}.", "Он работает {N:ablt}.||Они работают {N:ablt}.", "He works as {a}.||They work as {n}."),
    },
    "õpetaja": {
        "transl": F("Ma tahan saada {}.||Nad tahavad saada {}.", "Я хочу стать {N:ablt}.||Они хотят стать {N:ablt}.", "I want to become {a}.||They want to become {n}."),
        "ess": F("Ta töötab {}.||Nad töötavad {}.", "Он работает {N:ablt}.||Они работают {N:ablt}.", "He works as {a}.||They work as {n}."),
    },
    # Животные.
    "koer": {
        "abl": F("Ma võtan palli {}.", "Я забираю мяч {P:у:gent}.", "I take the ball from the {n}."),
        "abess": F("Ma ei saa elada {}.", "Я не могу жить {P:без:gent}.", "I can't live without my {n}."),
        "com": F("Ma jalutan {}.", "Я гуляю {P:с:ablt}.", "I walk the {n}."),
    },
    "kass": {
        "ade": F("{} on rohelised silmad.", "{P:у:gent} зелёные глаза.", "The {n} {has} green eyes.||The {n} have green eyes."),
        "abl": F("Ma võtan palli {}.", "Я забираю мяч {P:у:gent}.", "I take the ball from the {n}."),
        "abess": F("Ma ei saa elada {}.", "Я не могу жить {P:без:gent}.", "I can't live without my {n}."),
        "com": F("Ma mängin {}.", "Я играю {P:с:ablt}.", "I play with the {n}."),
    },
    "kala": {
        "gen": F("See on {} hind.", "Это цена {N:gent}.", "This is the price of the {n}."),
        "part": F(
            "Ma püüan {}.||Ma vaatan akvaariumis {}.",
            "Я ловлю {N:accs}.||Я смотрю на рыбок в аквариуме.",
            "I'm catching fish.||I'm watching the fish in the aquarium.",
        ),
        "ines": F("{} on luud.", "{IN:loct} есть кости.", "There are bones in the {n}."),
        "ela": F("Ma teen {} suppi.", "Я варю суп {OUT:gent}.", "I make soup from the {n}."),
        "ade": F("{} on soomused.", "{P:у:gent} есть чешуя.", "The {n} {has} scales."),
        "com": F("Ma söön riisi {}.", "Я ем рис {P:с:ablt}.", "I eat rice with fish."),
        "all": None, "abl": None, "abess": None,
    },
    # Еда.
    "leib": {
        "nom": F("See on {}.||Need on {}.", "Это {N:nomn}.||Это буханки хлеба.", "This is bread.||These are loaves of bread."),
        "part": F("Ma söön {}.", "Я ем {N:accs}.", "I eat bread."),
        "ela": F("Ma teen {} krutoone.", "Я делаю гренки {OUT:gent}.", "I make croutons from the bread."),
        "all": F("Ma panen võid {}.", "Я намазываю масло {ON:accs}.", "I put butter on the bread."),
        "ade": F("{} on või.", "{ON:loct} масло.", "There is butter on the bread."),
        "abl": F("Ma võtan juustu {}.", "Я снимаю сыр {OFF:gent}.", "I take the cheese off the bread."),
        "abess": F("Ma ei saa elada {}.", "Я не могу жить {P:без:gent}.", "I can't live without bread."),
        "com": F("Ma söön suppi {}.", "Я ем суп {P:с:ablt}.", "I eat soup with bread."),
    },
    "vesi": {
        "nom": F("See on {}.", "Это {N:nomn}.", "This is water.", SG),
        "gen": F("See on {} hind.", "Это цена {N:gent}.", "This is the price of water.", SG),
        "part": F("Ma joon {}.", "Я пью {N:accs}.", "I drink water.", SG),
        "ill": F("Ma hüppan {}.", "Я прыгаю {IN:accs}.", "I jump into the {n}.", SG),
        "ines": F("Kala ujub {}.", "Рыба плавает {IN:loct}.", "A fish swims in the {n}.", SG),
        "ela": F("Kala hüppab {} välja.", "Рыба выпрыгивает {OUT:gent}.", "A fish jumps out of the {n}.", SG),
        "all": F("Leht kukub {}.", "Лист падает {ON:accs}.", "A leaf falls onto the {n}.", SG),
        "abess": F("Ma ei saa elada {}.", "Я не могу жить {P:без:gent}.", "I can't live without water.", SG),
        "com": F("Ma pesen käsi {}.", "Я мою руки {N:ablt}.", "I wash my hands with water.", SG),
    },
    "õun": {
        "part": F("Ma söön {}.", "Я ем {N:accs}.", "I'm eating {a}.||I'm eating {n}."),
        "ines": F("{} on uss.||{} on ussid.", "{IN:loct} червяк.||{IN:loct} червяки.", "There is a worm in the {n}.||There are worms in the {n}."),
        "ela": F("Ma teen {} mahla.", "Я делаю сок {OUT:gent}.", "I make juice from the {n}."),
        "all": F("Ma panen kleebise {}.", "Я клею наклейку {ON:accs}.", "I put a sticker on the {n}.", SG),
        "ade": F("{} on punane koor.", "{P:у:gent} красная кожура.", "The {n} {has} red skin.", SG),
        "com": F("Ma söön pannkooki {}.||Ma söön kooki {}.", "Я ем блин {P:с:ablt}.||Я ем пирог {P:с:ablt}.", "I eat a pancake with apple.||I eat apple cake."),
    },
    # Части тела: «местные» падежи только в ед. ч. — каждая фраза своя.
    "käsi": {
        "gen": F("Mul on {} peal haav.||See kreem on {} jaoks.", "У меня рана {P:на:loct}.||Этот крем {P:для:gent}.", "I have a cut on my hand.||This cream is for hands."),
        "ill": F("Võta raamat {}.", "Возьми книгу {IN:accs}.", "Take the book in your hand.", SG),
        "ines": F("Mul on raamat {}.", "У меня книга {IN:loct}.", "I have a book in my hand.", SG),
        "ela": F("Raamat kukub {}.", "Книга падает {OUT:gent}.", "The book falls out of my hand.", SG),
        "all": F("Ma panen kreemi {}.", "Я наношу крем {ON:accs}.", "I put cream on my hand.", SG),
        "ade": F("{} on haav.", "{ON:loct} рана.", "There is a cut on my hand.", SG),
        "abl": F("Ma pesen värvi {}.", "Я смываю краску {OFF:gent}.", "I wash the paint off my hand.", SG),
        "com": F("Ma kirjutan vasaku {}.||Ma söön {}.", "Я пишу левой {N:ablt}.||Я ем {N:ablt}.", "I write with my left hand.||I eat with my hands."),
    },
    "jalg": {
        "gen": F("Mul on {} peal sinikas.||See kreem on {} jaoks.", "У меня синяк {P:на:loct}.||Этот крем {P:для:gent}.", "I have a bruise on my leg.||This cream is for feet."),
        "part": F("Ma pesen {}.", "Я мою {N:accs}.", "I wash my foot.||I wash my feet."),
        "ill": F("Pane king {}.", "Надень ботинок {ON:accs}.", "Put the shoe on your foot.", SG),
        "ines": F("Mul on king {}.", "У меня ботинок {ON:loct}.", "I have a shoe on my foot.", SG),
        "ela": F("Ma võtan kinga {}.", "Я снимаю ботинок {OFF:gent}.", "I take the shoe off my foot.", SG),
        "all": F("Ma panen kreemi {}.", "Я наношу крем {ON:accs}.", "I put cream on my leg.", SG),
        "ade": F("{} on haav.", "{ON:loct} рана.", "There is a cut on my leg.", SG),
        "abl": F("Ma pesen värvi {}.", "Я смываю краску {OFF:gent}.", "I wash the paint off my leg.", SG),
        "com": F("Ma löön palli {}.", "Я бью по мячу {N:ablt}.", "I kick the ball with my foot.", SG),
    },
    "pea": {
        "part": F("Ma pesen {}.||Inimesed pööravad {}.", "Я мою {N:accs}.||Люди поворачивают {N:accs}.", "I wash my hair.||People turn their heads."),
        "ill": F("Pane müts {}.", "Надень шапку {ON:accs}.", "Put the hat on your head.", SG),
        "ines": F("Mul on müts {}.", "У меня шапка {ON:loct}.", "I have a hat on my head.", SG),
        "ela": F("Ma võtan mütsi {}.", "Я снимаю шапку {OFF:gent}.", "I take the hat off my head.", SG),
        "com": F("Mõtle oma {}!", "Думай своей головой!", "Use your own head!", SG),
    },
    "silm": {
        "gen": F(
            "Mul on {} all sinikas.||Need tilgad on {} jaoks.",
            "У меня синяк под глазом.||Эти капли {P:для:gent}.",
            "I have a bruise under my eye.||These drops are for the eyes.",
        ),
        "part": F("Ma hõõrun {}.", "Я тру {N:accs}.", "I rub my eye.||I rub my eyes."),
        "ill": F("Tolm läks {}.", "Пыль попала {IN:accs}.", "Dust got into my eye.", SG),
        "ines": F("Mul on pisar {}.", "У меня слеза {IN:loct}.", "I have a tear in my eye.", SG),
        "ela": F("Pisar tuleb {}.", "Слеза течёт {OUT:gent}.", "A tear falls from my eye.", SG),
        "com": F("Ma vaatan ühe {}.", "Я смотрю одним {N:ablt}.", "I look with one eye.", SG),
    },
    "sõrm": {
        "ill": F("Pane sõrmus {}.", "Надень кольцо {ON:accs}.", "Put the ring on your finger.", SG),
        "ines": F("Mul on sõrmus {}.", "У меня кольцо {ON:loct}.", "I have a ring on my finger.", SG),
        "ela": F("Ma võtan sõrmuse {}.", "Я снимаю кольцо {OFF:gent}.", "I take the ring off my finger.", SG),
        "all": F("Ma panen plaastri {}.", "Я клею пластырь {ON:accs}.", "I put a plaster on my finger.", SG),
        "ade": F("{} on haav.", "{ON:loct} рана.", "There is a cut on my finger.", SG),
        "abl": F("Ma pesen värvi {}.", "Я смываю краску {OFF:gent}.", "I wash the paint off my finger.", SG),
        "com": F("Ma näitan {}.", "Я показываю {N:ablt}.", "I point with my finger.", SG),
    },
    "süda": {
        "part": F("Arst kuulab {}.", "Врач слушает {N:accs}.", "The doctor listens to my heart.", SG),
        "ill": F("See läks mulle {}.", "Это запало мне {IN:accs}.", "It touched my heart.", SG),
        "ines": F("Mul on rõõm {}.", "У меня радость {IN:loct}.", "I have joy in my heart.", SG),
        "ela": F("Ma räägin {}.", "Я говорю от всего сердца.", "I speak from the heart.", SG),
    },
    # Абстрактное.
    "töö": {
        "nom": F("||Need on {}.", "||Это работы.", "||These are jobs.", ("pl",)),
        "gen": F("See on {} plaan.", "Это план {N:gent}.", "This is the work plan.", SG),
        "part": F("Ma teen {}.", "Я работаю.", "I'm working.", SG),
        "all": F("Ma lähen {}.", "Я иду {ON:accs}.", "I go to work.", SG),
        "ade": F("Ma olen {}.", "Я {ON:loct}.", "I am at work.", SG),
        "abl": F("Ma tulen {}.", "Я прихожу {OFF:gent}.", "I come home from work.", SG),
        "abess": F("Ma olen {}.", "Я {P:без:gent}.", "I'm out of work.", SG),
    },
    "keel": {
        "gen": F(
            "See on {} õpik.||Mul on {} vastu huvi.",
            "Это учебник {P:по:datv}.||Меня интересуют языки.",
            "This is a language textbook.||I'm interested in languages.",
        ),
        "part": F("Ma õpin {}.", "Я учу {N:accs}.", "I'm learning the {n}.||I'm learning {n}."),
        "ines": F("{} on palju sõnu.", "{IN:loct} много слов.", "There are many words in the {n}.||There are many words in {n}."),
        "ade": F("{} on reeglid.", "{P:у:gent} есть правила.", "The {n} {has} rules."),
        "com": F("Ma tegelen {}.", "Я занимаюсь {N:ablt}.", "I work on the {n}.||I work on {n}."),
    },
    "sõna": {
        "gen": F("Ma ei tea {} tähendust.||Ma ei tea {} tähendusi.", "Я не знаю значения {N:gent}.||Я не знаю значений {N:gent}.", "I don't know the meaning of the {n}.||I don't know the meanings of the {n}."),
        "part": F("Ma ei tea {}.", "Я не знаю {N:accs}.", "I don't know the {n}."),
        "ill": F("Ma panen tähe {}.", "Я вставляю букву {IN:accs}.", "I put a letter into the {n}.", SG),
        "ines": MISTAKE_IN,
        "ela": F("Ma kustutan tähe {}.", "Я стираю букву {OUT:gent}.", "I delete a letter from the {n}.", SG),
        "all": F("Ma panen rõhu {}.", "Я ставлю ударение {ON:accs}.", "I put the stress on the {n}.", SG),
        "ade": MEANING,
        "abess": F(
            "Ta lahkus {}.||Me saame teineteisest aru {}.",
            "Он ушёл, не сказав ни слова.||Мы понимаем друг друга без слов.",
            "He left without a word.||We understand each other without words.",
        ),
        "com": F(
            "Moodusta lause selle {}.||Moodusta lause nende {}.",
            "Составь предложение с этим словом.||Составь предложение с этими словами.",
            "Make a sentence with this word.||Make a sentence with these words.",
        ),
    },
    "nimi": {
        "gen": F("Ma tean {} tähendust.||Ma tean {} tähendusi.", "Я знаю значение {N:gent}.||Я знаю значения {N:gent}.", "I know the meaning of the {n}.||I know the meanings of the {n}."),
        "part": F("Ma ei tea {}.", "Я не знаю {N:accs}.", "I don't know the {n}."),
        "ines": MISTAKE_IN,
        "ela": F("Ma ei tea {} midagi.", "Я ничего не знаю {P:о:loct}.", "I know nothing about the {n}."),
        "ade": MEANING,
        "abess": F("Kassipoeg on veel {}.", "У котёнка ещё нет имени.", "The kitten doesn't have a name yet.", SG),
    },
    "küsimus": {
        "gen": F("Ma ei mõista {} mõtet.||See on {} nimekiri.", "Я не понимаю смысла {N:gent}.||Это список {N:gent}.", "I don't understand the point of the {n}.||This is the list of {n}."),
        "part": F("Ma ei mõista {}.", "Я не понимаю {N:accs}.", "I don't understand the {n}."),
        "ines": MISTAKE_IN,
        "ela": TALK_ABOUT,
        "all": F("Ma vastan {}.", "Я отвечаю {P:на:accs}.", "I answer the {n}."),
        "ade": F("{} on vastus.||{} on vastused.", "{P:у:gent} есть ответ.||{P:у:gent} есть ответы.", "The {n} {has} an answer.||The {n} have answers."),
        "abess": F("Ta nõustus kohe, {}.", "Он сразу согласился, {P:без:gent}.", "He agreed at once, without question.", ("pl",)),
        "com": F("Ma tulen {}.", "Я прихожу {P:с:ablt}.", "I come with {a}.||I come with {n}."),
    },
    "lugu": {
        "gen": F(
            "See on {} lõpp.||See on {} kogumik.",
            "Это конец {N:gent}.||Это сборник рассказов.",
            "This is the end of the {n}.||This is a collection of stories.",
        ),
        "part": F("Ma kuulan {}.", "Я слушаю {N:accs}.", "I listen to the {n}."),
        "ines": MISTAKE_IN,
        "ela": TALK_ABOUT,
        "ade": F("{} on hea lõpp.||{} on head lõpud.", "{P:у:gent} хороший конец.||{P:у:gent} хорошие концовки.", "The {n} {has} a good ending.||The {n} have good endings."),
    },
    "uni": {
        "nom": None,
        "part": F("Ma näen {}.", "Я вижу сон.", "I'm having a dream.", SG),
        "ines": F("Ma räägin {}.", "Я разговариваю {P:во:loct}.", "I talk in my sleep.", SG),
        "ela": F("Ma ärkan {}.", "Я просыпаюсь {P:ото:gent}.", "I wake up from my sleep.", SG),
    },
    "riik": {
        "gen": F("See on {} lipp.||Need on {} lipud.", "Это флаг {N:gent}.||Это флаги {N:gent}.", "This is the flag of the {n}.||These are the flags of the {n}."),
        "part": F("Ma armastan oma {}.||Ma külastan {}.", "Я люблю свою {N:accs}.||Я посещаю {N:accs}.", "I love my {n}.||I visit {n}."),
        "ill": F("Ma sõidan teise {}.||Ma reisin paljudesse {}.", "Я еду в другую {N:accs}.||Я езжу во многие {N:accs}.", "I travel to another {n}.||I travel to many {n}."),
        "ines": F("Ma elan väikeses {}.||Inimesed elavad eri {}.", "Я живу в маленькой {N:loct}.||Люди живут в разных {N:loct}.", "I live in a small {n}.||People live in different {n}."),
        "ela": F("Ma tulen teisest {}.||Õpilased tulevad eri {}.", "Я приезжаю из другой {N:gent}.||Ученики приезжают из разных {N:gent}.", "I come from another {n}.||The students come from different {n}."),
        "ade": F("{} on president.||{} on presidendid.", "{P:у:gent} есть президент.||{P:у:gent} есть президенты.", "The {n} {has} a president.||The {n} have presidents."),
        "abl": F("Ma saan abi {}.", "Я получаю помощь от государства.", "I get help from the state.", SG),
    },
    # Погода (только ед. ч.).
    "lumi": {
        "gen": F("Ma armastan {} lõhna.", "Я люблю запах {N:gent}.", "I love the smell of snow.", SG),
        "ill": F("Ma kukun {}.", "Я падаю {IN:accs}.", "I fall into the snow.", SG),
        "ines": F("Lapsed mängivad {}.", "Дети играют {IN:loct}.", "The children play in the snow.", SG),
        "ela": F("Lapsed teevad {} lumememme.", "Дети лепят снеговика {OUT:gent}.", "The children make a snowman out of snow.", SG),
        "ade": F("Värskel {} on hea suusatada.", "По свежему снегу хорошо кататься на лыжах.", "Fresh snow is great for skiing.", SG),
        "abess": F("Talv möödus {}.", "Зима прошла без снега.", "The winter passed without snow.", SG),
        "com": F("Lapsed loobivad üksteist {}.", "Дети бросаются {N:ablt}.", "The children throw snow at each other.", SG),
    },
    "vihm": {
        "gen": F("Ma kuulan {} häält.", "Я слушаю шум {N:gent}.", "I listen to the sound of the rain.", SG),
        "ines": F("Ma kõnnin {}.", "Я гуляю {P:под:ablt}.", "I walk in the rain.", SG),
        "ela": F("Ma tulen {} tuppa.", "Я захожу в дом {P:из-под:gent}.", "I come in out of the rain.", SG),
        "abess": F("Suvi möödus {}.", "Лето прошло без дождя.", "The summer passed without rain.", SG),
        "com": F("Päev algas {}.", "День начался {P:с:gent}.", "The day began with rain.", SG),
    },
    # Время.
    "päev": {
        "nom": F("||{} on pikad.", "||{N:nomn} длинные.", "||The {n} are long.", ("pl",)),
        "gen": F("See on {} plaan.", "Это план {P:на:accs}.", "This is the plan for the day.", SG),
        "part": F("Ma ootan juba kaks {}.", "Я жду уже два дня.", "I've been waiting for two days.", SG),
        "ines": F("Ma söön kolm korda {}.", "Я ем три раза в день.", "I eat three times a day.", SG),
    },
    "öö": {
        "nom": F("||{} on külmad.", "||{N:nomn} холодные.", "||The {n} are cold.", ("pl",)),
        "part": F("Ma magasin seal ainult kaks {}.", "Я спал там всего две ночи.", "I slept there only two nights.", SG),
        "term": F("Ma töötan {}.", "Я работаю {P:до:gent}.", "I work until night.", SG),
    },
    "nädal": {
        "nom": F("||{} lähevad kiiresti.", "||{N:nomn} летят быстро.", "||The {n} fly by.", ("pl",)),
        "gen": F("See on {} plaan.", "Это план {P:на:accs}.", "This is the plan for the week.", SG),
        "part": F("Ma elan siin juba kolm {}.", "Я живу здесь уже три недели.", "I've lived here for three weeks.", SG),
        "ines": F("Ma käin trennis kaks korda {}.", "Я хожу на тренировку два раза в неделю.", "I train twice a week.", SG),
    },
    "aasta": {
        "nom": F("||{} lähevad kiiresti.", "||{N:nomn} летят быстро.", "||The {n} fly by.", ("pl",)),
        "gen": F("See on {} plaan.", "Это план {P:на:accs}.", "This is the plan for the year.", SG),
        "part": F("Ma elan siin juba kaks {}.", "Я живу здесь уже два года.", "I've lived here for two years.", SG),
        "ines": F("Ma käin arsti juures kaks korda {}.", "Я хожу к врачу два раза в год.", "I see the doctor twice a year.", SG),
    },
    "tund": {
        "part": F("Ma ootan juba kaks {}.", "Я жду уже два часа.", "I've been waiting for two hours.", SG),
        "ines": F("Buss käib kaks korda {}.", "Автобус ходит два раза в час.", "The bus runs twice an hour.", SG),
    },
    # ---------------------------------------------------------------------------------------
    # Новые слова (100 слов, ноябрь 2026).
    # ---------------------------------------------------------------------------------------
    # Открытые места.
    "park": {
        "ill": F("Ma lähen {}.||Lapsed lähevad {}.", "Я иду {IN:accs}.||Дети идут {IN:accs}.", "I go to the {n}.||The children go to the {n}."),
        "ines": F("Ma jalutan {}.||Inimesed jalutavad {}.", "Я гуляю {IN:loct}.||Люди гуляют {IN:loct}.", "I walk in the {n}.||People walk in the {n}."),
        "ela": F("Ma tulen {}.||Lapsed tulevad {}.", "Я возвращаюсь {OUT:gent}.||Дети возвращаются {OUT:gent}.", "I come back from the {n}.||The children come back from the {n}."),
    },
    "väljak": {
        "all": F("Ma lähen {}.||Inimesed kogunevad {}.", "Я иду {ON:accs}.||Люди собираются {ON:loct}.", "I go to the {n}.||People gather in the {n}."),
        "ade": F("Ma seisan {}.||Inimesed on {}.", "Я стою {ON:loct}.||Люди {ON:loct}.", "I'm standing in the {n}.||People are in the {n}."),
        "abl": F("Ma tulen {}.", "Я иду {OFF:gent}.", "I'm coming from the {n}.", SG),
    },
    "aed": {
        "ill": F("Ma lähen {}.", "Я иду {IN:accs}.", "I go into the {n}.", SG),
        "ines": F("Ma töötan {}.||Lapsed mängivad {}.", "Я работаю {IN:loct}.||Дети играют {IN:loct}.", "I work in the {n}.||Children play in the {n}."),
        "ela": F("Ma toon {} õunu.", "Я приношу яблоки {OUT:gent}.", "I bring apples from the {n}.", SG),
    },
    "põld": {
        "all": F("Traktor sõidab {}.", "Трактор едет {ON:accs}.", "The tractor drives onto the {n}.", SG),
        "ade": F("Talunik töötab {}.||Lehmad on {}.", "Фермер работает {P:в:loct}.||Коровы {P:в:loct}.", "The farmer works in the {n}.||The cows are in the {n}."),
        "abl": F("Talunik tuleb {} koju.", "Фермер возвращается домой {OFF:gent}.", "The farmer comes home from the {n}.", SG),
    },
    "rand": {
        "ill": F("Ma lähen {}.||Turistid lähevad {}.", "Я иду {ON:accs}.||Туристы идут {ON:accs}.", "I go to the {n}.||Tourists go to the {n}."),
        "ines": F("Lapsed mängivad {}.||Inimesed on {}.", "Дети играют {ON:loct}.||Люди {ON:loct}.", "The children play on the {n}.||People are on the {n}."),
        "ela": F("Ma tulen {} koju.", "Я возвращаюсь домой {OFF:gent}.", "I come home from the {n}.", SG),
    },
    "küla": {
        "ill": F("Ma kolin {}.", "Я переезжаю {IN:accs}.", "I'm moving to a {n}.", SG),
        "ines": F("Ma elan {}.||Inimesed elavad {}.", "Я живу {IN:loct}.||Люди живут {IN:loct}.", "I live in a {n}.||People live in {n}."),
        "ela": F("Ma tulen {}.||Lapsed tulevad {} linna kooli.", "Я приезжаю {OUT:gent}.||Дети приезжают в городскую школу {OUT:gent}.", "I come from a {n}.||Children come from the {n} to school in town."),
    },
    "turg": {
        "all": F("Ma lähen {}.", "Я иду {ON:accs}.", "I go to the {n}.", SG),
        "ade": F("Ma ostan {} köögivilja.", "Я покупаю овощи {ON:loct}.", "I buy vegetables at the {n}.", SG),
        "abl": F("Ma tulen {} koju.", "Я возвращаюсь домой {OFF:gent}.", "I come home from the {n}.", SG),
    },
    "sild": {
        "all": F("Auto sõidab {}.", "Машина въезжает {ON:accs}.", "A car drives onto the {n}.", SG),
        "ade": F("Ma seisan {}.||Inimesed seisavad {}.", "Я стою {ON:loct}.||Люди стоят {ON:loct}.", "I'm standing on the {n}.||People are standing on the {n}."),
        "abl": F("Ma vaatan {} jõge.", "Я смотрю на реку {OFF:gent}.", "I look at the river from the {n}.", SG),
    },
    # Транспорт.
    "buss": {
        "gen": F("Ma seisan {} juures.||See on {} sõiduplaan.", "Я стою {P:у:gent}.||Это расписание {N:gent}.", "I'm standing by the {n}.||This is the timetable for the {n}."),
        "ill": F("Ma astun {}.||Inimesed astuvad {}.", "Я сажусь {IN:accs}.||Люди садятся {IN:accs}.", "I get on the {n}.||People get on the {n}."),
        "com": F("Ma sõidan tööle {}.||Lapsed sõidavad kooli {}.", "Я езжу на работу {P:на:loct}.||Дети ездят в школу {P:на:loct}.", "I go to work by {sg}.||The children go to school by {sg}."),
        "ines": F("Ma olen {}.||Inimesed on {}.", "Я {IN:loct}.||Люди {IN:loct}.", "I am on the {n}.||People are on the {n}."),
        "ela": F("Ma tulen {} välja.||Inimesed tulevad {} välja.", "Я выхожу {OUT:gent}.||Люди выходят {OUT:gent}.", "I get off the {n}.||People get off the {n}."),
    },
    "tramm": {
        "gen": F("Ma seisan {} juures.||See on {} sõiduplaan.", "Я стою {P:у:gent}.||Это расписание {N:gent}.", "I'm standing by the {n}.||This is the timetable for the {n}."),
        "ill": F("Ma astun {}.||Inimesed astuvad {}.", "Я сажусь {IN:accs}.||Люди садятся {IN:accs}.", "I get on the {n}.||People get on the {n}."),
        "com": F("Ma sõidan tööle {}.||Lapsed sõidavad kooli {}.", "Я езжу на работу {P:на:loct}.||Дети ездят в школу {P:на:loct}.", "I go to work by {sg}.||The children go to school by {sg}."),
        "ines": F("Ma olen {}.||Inimesed on {}.", "Я {IN:loct}.||Люди {IN:loct}.", "I am on the {n}.||People are on the {n}."),
        "ela": F("Ma tulen {} välja.||Inimesed tulevad {} välja.", "Я выхожу {OUT:gent}.||Люди выходят {OUT:gent}.", "I get off the {n}.||People get off the {n}."),
    },
    "takso": {
        "ill": F("Ma astun {}.", "Я сажусь {IN:accs}.", "I get into the {n}.", SG),
        "ines": F("Ma olen {}.", "Я {IN:loct}.", "I am in the {n}.", SG),
        "ela": F("Ma tulen {} välja.", "Я выхожу {OUT:gent}.", "I get out of the {n}.", SG),
        "com": F("Ma sõidan koju {}.", "Я еду домой {P:на:loct}.", "I go home by {sg}.", SG),
    },
    "paat": {
        "ill": F("Ma astun {}.", "Я сажусь {IN:accs}.", "I get into the {n}.", SG),
        "ines": F("Ma olen {}.||Kalurid on {}.", "Я {IN:loct}.||Рыбаки {IN:loct}.", "I am in the {n}.||The fishermen are in the {n}."),
        "ela": F("Ma tulen {} välja.", "Я выхожу {OUT:gent}.", "I get out of the {n}.", SG),
        "com": F("Ma sõidan {} saarele.", "Я плыву на остров {P:на:loct}.", "I go to the island by {sg}.", SG),
    },
    "jalgratas": {
        "part": F("Ma parandan {}.", "Я чиню {N:accs}.", "I'm fixing the {n}."),
        "all": F("Ma hüppan {}.", "Я запрыгиваю {ON:accs}.", "I jump on the {n}.", SG),
        "ade": F("{} on kaks ratast.", "{P:у:gent} два колеса.", "A {n} has two wheels.", SG),
        "abl": F("Ma kukkusin {}.", "Я упал {OFF:gent}.", "I fell off the {n}.", SG),
        "com": F("Ma sõidan tööle {}.", "Я езжу на работу {P:на:loct}.", "I go to work by {sg}.", SG),
    },
    # Предметы.
    "voodi": {
        "ill": F("Ma lähen {}.", "Я ложусь {P:в:accs}.", "I go to bed.", SG),
        "ines": F("Ma loen {}.", "Я читаю {P:в:loct}.", "I read in bed.", SG),
        "ela": F("Ma tõusen {}.", "Я встаю {P:с:gent}.", "I get out of bed.", SG),
    },
    "kapp": {
        "ill": F("Ma panen riided {}.", "Я кладу одежду {P:в:accs}.", "I put the clothes in the wardrobe.", SG),
        "ines": F("Riided on {}.", "Одежда {P:в:loct}.", "The clothes are in the wardrobe.||The clothes are in the wardrobes."),
        "ela": F("Ma võtan riided {}.", "Я достаю одежду {P:из:gent}.", "I take the clothes out of the wardrobe.", SG),
    },
    "tass": {
        "ill": F("Ma valan kohvi {}.", "Я наливаю кофе {P:в:accs}.", "I pour coffee into the {n}.", SG),
        "ines": F("{} on kohv.", "{P:в:loct} кофе.", "There is coffee in the {n}.", SG),
        "ela": F("Ma joon {}.", "Я пью {P:из:gent}.", "I drink from the {n}.", SG),
    },
    "klaas": {
        "ill": F("Ma valan vett {}.", "Я наливаю воду {P:в:accs}.", "I pour water into the {n}.", SG),
        "ines": F("{} on vesi.", "{P:в:loct} вода.", "There is water in the {n}.", SG),
        "ela": F("Ma joon {}.", "Я пью {P:из:gent}.", "I drink from the {n}.", SG),
    },
    "pudel": {
        "ill": F("Ma valan vett {}.", "Я наливаю воду {P:в:accs}.", "I pour water into the {n}.", SG),
        "ines": F("{} on piim.||{} on mahl.", "{P:в:loct} молоко.||{P:в:loct} сок.", "There is milk in the {n}.||There is juice in the {n}."),
        "ela": F("Ma joon {}.", "Я пью {P:из:gent}.", "I drink from the {n}.", SG),
    },
    "taldrik": {
        "all": F("Ma panen toidu {}.", "Я кладу еду {ON:accs}.", "I put the food on the {n}.", SG),
        "ade": F("Toit on {}.||Toit on {}.", "Еда {ON:loct}.||Еда {ON:loct}.", "The food is on the {n}.||The food is on the {n}."),
        "abl": F("Ma söön {}.", "Я ем {P:с:gent}.", "I eat off the {n}.", SG),
    },
    "nuga": {
        "com": F("Ma lõikan leiba {}.", "Я режу хлеб {N:ablt}.", "I cut the bread with a knife.", SG),
    },
    "kott": {
        "ill": F("Ma panen raamatu {}.", "Я кладу книгу {P:в:accs}.", "I put the book in the {n}.", SG),
        "ines": F("Mul on raamat {}.", "У меня книга {P:в:loct}.", "I have a book in my {n}.", SG),
        "ela": F("Ma võtan raamatu {}.", "Я достаю книгу {P:из:gent}.", "I take the book out of my {n}.", SG),
        "com": F("Ma lähen poodi {}.", "Я иду в магазин {P:с:ablt}.", "I go to the shop with {a}.||I go to the shop with {n}."),
    },
    "võti": {
        "com": F("Ma avan ukse {}.", "Я открываю дверь {N:ablt}.", "I open the door with the {n}.", SG),
        "abess": F("Ma ei saa sisse {}.", "Я не могу войти {P:без:gent}.", "I can't get in without the {n}.", SG),
    },
    "telefon": {
        "ines": F("{} on palju pilte.", "{P:в:loct} много фотографий.", "There are many photos on the {n}.", SG),
        "com": F("Ma teen {} pilti.", "Я фотографирую {N:ablt}.", "I take a photo with my {n}.", SG),
        "abess": F("Ma ei saa elada {}.", "Я не могу жить {P:без:gent}.", "I can't live without my {n}.", SG),
    },
    "arvuti": {
        "ines": F("{} on palju faile.", "{P:в:loct} много файлов.", "There are many files on the {n}.", SG),
        "com": F("Ma töötan {}.", "Я работаю {P:за:ablt}.", "I work at the {n}.", SG),
        "abess": F("Ma ei saa töötada {}.", "Я не могу работать {P:без:gent}.", "I can't work without a {n}.", SG),
    },
    "kell": {
        "nom": F("See on {}.||Need on {}.", "Это часы.", "This is a clock.||These are clocks."),
        "gen": F("See on {} hind.||Need on {} hinnad.", "Это цена часов.||Это цены часов.", "This is the price of the {n}.||These are the prices of the {n}."),
        "part": F("Ma vaatan {}.", "Я смотрю на часы.", "I look at the {n}."),
    },
    "pall": {
        "com": F("Lapsed mängivad {}.", "Дети играют в мяч.||Дети играют с мячами.", "The children play with a ball.||The children play with balls."),
    },
    # Одежда.
    "king": {
        "part": F("Ma puhastan {}.", "Я чищу {N:accs}.", "I'm cleaning the {n}."),
        "com": F("Ma lähen välja {}.", "Я выхожу на улицу в туфлях.", "I go out in my shoes.", ("pl",)),
        "abess": F("Ma ei lähe välja {}.", "Я не выхожу на улицу без обуви.", "I don't go out without shoes.", ("pl",)),
    },
    "sokk": {
        "com": None,
        "abess": F("Ma kõnnin {}.", "Я хожу {P:без:gent}.", "I walk around without socks.", ("pl",)),
    },
    "särk": {
        "ines": F("Mul on {} palav.", "Мне жарко {P:в:loct}.", "I'm too hot in this {n}.", SG),
        "com": None,
        "abess": F("Poiss jookseb rannas {}.", "Мальчик бегает по пляжу {P:без:gent}.", "The boy runs on the beach without a shirt.", SG),
    },
    "kleit": {
        "ines": F("Ta on {}.||Tüdrukud on {}.", "Она {P:в:loct}.||Девочки {P:в:loct}.", "She is in {a}.||The girls are in {n}."),
        "com": None, "abess": None,
    },
    "jope": {"ines": F("Mul on {} palav.", "Мне жарко {P:в:loct}.", "I'm too hot in this {n}.", SG)},
    "mantel": {
        "part": F("Ma vaatan {}.", "Я смотрю {P:на:accs}.", "I look at the {n}."),
        "ines": F("Mul on {} soe.", "Мне тепло {P:в:loct}.", "I'm warm in this {n}.", SG),
    },
    # Люди.
    "kokk": {
        "transl": F("Ma tahan saada {}.||Nad tahavad saada {}.", "Я хочу стать {N:ablt}.||Они хотят стать {N:ablt}.", "I want to become {a}.||They want to become {n}."),
        "ess": F("Ta töötab {}.||Nad töötavad {}.", "Он работает {N:ablt}.||Они работают {N:ablt}.", "He works as {a}.||They work as {n}."),
    },
    "müüja": {
        "transl": F("Ta tahab saada {}.", "Она хочет стать {N:ablt}.", "She wants to become a shop assistant.", SG),
        "ess": F("Ta töötab {}.||Nad töötavad {}.", "Она работает {N:ablt}.||Они работают {N:ablt}.", "She works as a shop assistant.||They work as shop assistants."),
    },
    "õpilane": {
        "ess": F("{} õppisin ma palju.", "Когда я был учеником, я много учился.", "As a pupil, I studied a lot.", SG),
    },
    # Животные.
    "hobune": {
        "ade": F("{} on pikk saba.||{} on pikad sabad.", "{P:у:gent} длинный хвост.||{P:у:gent} длинные хвосты.", "The {n} {has} a long tail.||The {n} have long tails."),
        "com": F("Talunik sõidab {} linna.", "Фермер едет в город {P:на:loct}.", "The farmer goes to town by horse.", SG),
    },
    "lehm": {
        "gen": F("See on {} piim.", "Это коровье молоко.", "This is cow's milk.", SG),
        "part": F("Ma lüpsan {}.", "Я дою {N:accs}.", "I milk the {n}."),
        "ade": F("{} on vasikas.||{} on vasikad.", "{P:у:gent} телёнок.||{P:у:gent} телята.", "The {n} {has} a calf.||The {n} have calves."),
    },
    "lind": {
        "gen": F("Ma kuulan {} laulu.", "Я слушаю пение {N:gent}.", "I'm listening to the {n} singing."),
        "part": LOOK,
        "ade": F("{} on pesa.||{} on pesad.", "{P:у:gent} гнездо.||{P:у:gent} гнёзда.", "The {n} {has} a nest.||The {n} have nests."),
    },
    "hiir": {
        "gen": F("See on {} pesa.", "Это гнездо {N:gent}.", "This is a mouse's nest.", SG),
        "part": F("Kass püüab {}.", "Кошка ловит {N:accs}.", "The cat is catching a mouse.||The cat is catching mice."),
        "all": None, "ade": None,
    },
    "karu": {
        "gen": F("See on {} jälg.||Need on {} jäljed.", "Это след {N:gent}.||Это следы {N:gent}.", "This is the bear's footprint.||These are the bears' footprints."),
        "part": LOOK,
        "all": None,
        "ade": F("{} on suured käpad.", "{P:у:gent} большие лапы.", "The {n} {has} big paws.||The {n} have big paws."),
    },
    "hunt": {
        "gen": F("See on {} jälg.||Need on {} jäljed.", "Это след {N:gent}.||Это следы {N:gent}.", "This is the wolf's footprint.||These are the wolves' footprints."),
        "part": LOOK,
        "all": None,
        "ade": F("{} on teravad hambad.", "{P:у:gent} острые зубы.", "The {n} {has} sharp teeth.||The {n} have sharp teeth."),
    },
    "kana": {
        "gen": F("See on {} pesa.", "Это гнездо {N:gent}.", "This is the hen's nest.", SG),
        "part": F("Ma toidan {}.", "Я кормлю {N:accs}.", "I feed the {n}."),
        "all": None,
        "ade": F("{} on munad.", "{P:у:gent} есть яйца.", "The {n} {has} eggs.||The {n} have eggs."),
    },
    # Еда.
    "piim": {
        "part": F("Ma joon {}.", "Я пью {N:accs}.", "I drink milk.", SG),
        "com": F("Ma joon kohvi {}.", "Я пью кофе {P:с:ablt}.", "I drink coffee with milk.", SG),
        "abess": F("Ma joon kohvi {}.", "Я пью кофе {P:без:gent}.", "I drink coffee without milk.", SG),
    },
    "kohv": {
        "part": F("Ma joon {}.", "Я пью кофе.", "I drink coffee.", SG),
        "gen": F("See on {} hind.", "Это цена кофе.", "This is the price of the coffee.", SG),
        "ines": F("{} on suhkrut.", "В кофе есть сахар.", "There is sugar in the coffee.", SG),
    },
    "juust": {
        "part": F("Ma söön {}.", "Я ем {N:accs}.", "I eat cheese.", SG),
        "com": F("Ma söön leiba {}.", "Я ем хлеб {P:с:ablt}.", "I eat bread with cheese.", SG),
    },
    "liha": {
        "part": F("Ma söön {}.", "Я ем {N:accs}.", "I eat meat.", SG),
        "com": F("Ma söön kartulit {}.", "Я ем картошку {P:с:ablt}.", "I eat potatoes with meat.", SG),
        "abess": F("Ma söön suppi {}.", "Я ем суп {P:без:gent}.", "I eat soup without meat.", SG),
    },
    "supp": {
        "part": F("Ma söön {}.", "Я ем {N:accs}.", "I'm eating {n}.", SG),
        "ill": F("Ma panen soola {}.", "Я кладу соль {P:в:accs}.", "I put salt in the {n}.", SG),
        "ines": F("{} on liha.", "{P:в:loct} мясо.", "There is meat in the {n}.", SG),
    },
    "kook": {
        "part": F("Ma söön {}.", "Я ем {N:accs}.", "I'm eating cake.||I'm eating cakes."),
        "com": F("Ma joon kohvi {}.", "Я пью кофе {P:с:ablt}.", "I drink coffee with a piece of cake.||I drink coffee with cakes."),
    },
    "muna": {
        "part": F("Ma söön {}.", "Я ем {N:accs}.", "I'm eating {a}.||I'm eating {n}."),
    },
    "kartul": {
        "nom": F("See on {}.||Need on {}.", "Это картофелина.||Это картофелины.", "This is a potato.||These are potatoes."),
        "gen": F("See on {} hind.", "Это цена картошки.||Это цена картофеля.", "This is the price of potatoes."),
        "part": F("Ma koorin {}.", "Я чищу картофелину.||Я чищу картошку.", "I'm peeling a potato.||I'm peeling potatoes."),
        "com": F("Ma söön liha {}.", "Я ем мясо с картошкой.", "I eat meat with potatoes."),
    },
    "tomat": {
        "part": F("Ma lõikan {}.", "Я режу {N:accs}.", "I'm cutting {a}.||I'm cutting {n}."),
        "com": F("Ma söön leiba {}.", "Я ем хлеб {P:с:ablt}.", "I eat bread with {a}.||I eat bread with {n}."),
    },
    "mahl": {
        "part": F("Ma joon {}.", "Я пью {N:accs}.", "I drink juice.", SG),
        "gen": F("See on {} hind.", "Это цена {N:gent}.", "This is the price of the juice.", SG),
    },
    # Природа.
    "päike": {
        "gen": F("Ma istun {} käes.", "Я сижу на солнце.", "I'm sitting in the sun.", SG),
        "part": F("Ma ootan {}.", "Я жду солнца.", "I'm waiting for the sun.", SG),
        "abess": F("Päev möödus {}.", "День прошёл без солнца.", "The day passed without sun.", SG),
    },
    "tuul": {
        "gen": F("Ma kuulan {} kohinat.", "Я слушаю шум ветра.", "I listen to the sound of the wind.", SG),
        "part": F("Ma tunnen {}.", "Я чувствую ветер.", "I feel the wind.", SG),
        "ines": F("Puud kõiguvad {}.", "Деревья качаются на ветру.", "The trees sway in the wind.", SG),
    },
    "kivi": {
        "nom": NOM,
        "gen": F("Ma istun {} peal.||Me istume {} peal.", "Я сижу {P:на:loct}.||Мы сидим {P:на:loct}.", "I sit on the {n}.||We sit on the {n}."),
        "part": F("Ma ei näe {}.||Ma korjan {}.", "Я не вижу {N:gent}.||Я собираю {N:accs}.", "I don't see the {n}.||I collect {n}."),
        "ade": BIRD_ON, "abl": BIRD_OFF,
    },
    # Время года и время суток.
    "talv": {
        "nom": F("||{} on külmad.", "||Зимы холодные.", "||The winters are cold.", ("pl",)),
        "ade": F("{} on külm.", "Зимой холодно.", "It's cold in winter.", SG),
        "term": F("Ma jään siia {}.", "Я остаюсь здесь до зимы.", "I'm staying here until winter.", SG),
        "transl": F("Ma tulen {}.", "Я приезжаю на зиму.", "I'm coming for the winter.", SG),
    },
    "suvi": {
        "part": None,  # «я помню те лета» по-русски не говорят
        "ade": F("{} on soe.", "Летом тепло.", "It's warm in summer.", SG),
        "term": F("Ma jään siia {}.", "Я остаюсь здесь до лета.", "I'm staying here until summer.", SG),
        "transl": F("Ma tulen {}.", "Я приезжаю на лето.", "I'm coming for the summer.", SG),
    },
    "hommik": {
        "ade": F("{} joon ma kohvi.", "Утром я пью кофе.", "In the morning I drink coffee.", SG),
        "term": F("Ma töötan {}.", "Я работаю до утра.", "I work until morning.", SG),
        "transl": F("Ma olen {} kodus.", "Я буду дома к утру.", "I'll be home by morning.", SG),
    },
    "õhtu": {
        "ade": F("{} vaatan ma filmi.", "Вечером я смотрю фильм.", "In the evening I watch a film.", SG),
        "term": F("Ma töötan {}.", "Я работаю до вечера.", "I work until the evening.", SG),
        "transl": F("Ma olen {} kodus.", "Я буду дома к вечеру.", "I'll be home by the evening.", SG),
    },
}

# Сочетания, которые во мн. ч. звучат неестественно («без мам», «цена рыб»): только ед. ч.
SINGULAR_ONLY = {
    "leib": set(CASES) - {"nom"},
    "kala": {"gen", "ines", "ela", "com"},
    "ema": set(CASES) - {"nom"},
    "piim": set(CASES),
    "kohv": set(CASES),
    "juust": set(CASES),
    "liha": set(CASES),
    "supp": set(CASES),
    "mahl": set(CASES),
    "päike": set(CASES),
    "tuul": set(CASES),
    "isa": set(CASES) - {"nom"},
    "pere": set(CASES) - {"nom"},
}

# Русское существительное к прилагательному, если перевод пары звучит лучше иначе:
# noor mees — «молодой человек», а не «молодой мужчина».
ADJ_RU_NOUN = {"noor": "человек"}

# Прилагательные: «стать каким» (saav) и «будучи каким» (olev) — без существительного, только ед. ч.
# {A:падеж:род} — прилагательное по-русски, согласованное с подлежащим.
ADJ_TRANSL = {
    "soe": F("Ilm läheb {}.", "Теплеет.", "It's getting warm.", SG),
    "külm": F("Ilm läheb {}.", "Холодает.", "It's getting cold.", SG),
    "halb": F("Ilm läheb {}.", "Погода портится.", "The weather is getting worse.", SG),
    "kallis": F("Elu läheb {}.", "Жизнь дорожает.", "Life is getting more expensive.", SG),
    "odav": F("Elu läheb {}.", "Жизнь дешевеет.", "Life is getting cheaper.", SG),
    "pikk": F("Koosolek läks {}.", "Собрание затянулось.", "The meeting ran long.", SG),
    "lühike": F("Suvi jäi {}.", "Лето выдалось коротким.", "The summer turned out short.", SG),
    "uus": F("Kõik saab {}.", "Всё становится {A:ablt:neut}.", "Everything becomes new.", SG),
    "vana": F("Ma jään {}.", "Я старею.", "I'm getting old.", SG),
    "väike": F("Riided jäävad {}.", "Одежда становится мала.", "The clothes are getting too small.", SG),
    "suur": F("Laps kasvab {}.", "Ребёнок подрастает.", "The child is growing up.", SG),
    "hea": F("Kõik saab jälle {}.", "Всё снова будет хорошо.", "Everything will be fine again.", SG),
    "noor": F("Ma tahan jääda {}.", "Я хочу остаться {A:ablt:masc}.", "I want to stay young.", SG),
    "kiire": F("Elu on läinud {}.", "Жизнь стала суматошной.", "Life has become hectic.", SG),
    "tark": F("Ma tahan saada {}.", "Я хочу стать {A:ablt:masc}.", "I want to become clever.", SG),
    "ilus": F("Ta teeb toa {}.", "Она делает комнату {A:ablt:femn}.", "She makes the room beautiful.", SG),
    "punane": F("Foor läks {}.", "Светофор загорелся красным.", "The light turned red.", SG),
    "roheline": F("Foor läks {}.", "Светофор загорелся зелёным.", "The light turned green.", SG),
    "kollane": F("Lehed lähevad {}.", "Листья желтеют.", "The leaves are turning yellow.", SG),
    "valge": F("Juuksed läksid {}.", "Волосы поседели.", "The hair turned white.", SG),
    "must": F("Taevas läks {}.", "Небо почернело.", "The sky turned black.", SG),
    "puhas": F("Tuba sai {}.", "Комната стала чистой.", "The room is clean now.", SG),
    "raske": F("Elu muutus {}.", "Жизнь стала тяжёлой.", "Life became hard.", SG),
    "tühi": F("Tänav jäi {}.", "Улица опустела.", "The street became empty.", SG),
    "rõõmus": F("Laps muutus {}.", "Ребёнок повеселел.", "The child cheered up.", SG),
    "kurb": F("Ta muutus {}.", "Она загрустила.", "She became sad.", SG),
    "tugev": F("Ma tahan saada {}.", "Я хочу стать сильным.", "I want to become strong.", SG),
    "pime": F("Väljas läheb {}.", "На улице темнеет.", "It's getting dark outside.", SG),
    "kõrge": F("Puu kasvas {}.", "Дерево выросло высоким.", "The tree grew tall.", SG),
    "huvitav": F("Film muutus lõpus {}.", "К концу фильм стал интересным.", "The film got interesting at the end.", SG),
    "kuum": F("Ilm läks {}.", "Стало жарко.", "It got hot.", SG),
}
ADJ_ESS = {
    "noor": F("{} olin ma õnnelik.", "В молодости я был счастлив.", "When I was young, I was happy.", SG),
    "vana": F("{} tahan ma elada maal.", "В старости я хочу жить в деревне.", "When I'm old, I want to live in the country.", SG),
    "väike": F("{} olin ma õnnelik.", "В детстве я был счастлив.", "When I was little, I was happy.", SG),
    "soe": F("Ma söön suppi {}.", "Я ем суп {A:ablt:masc}.", "I eat the soup warm.", SG),
    "külm": F("Ma söön suppi {}.", "Я ем суп {A:ablt:masc}.", "I eat the soup cold.", SG),
    "kuum": F("Ma söön suppi alati {}.", "Я всегда ем суп горячим.", "I always eat soup hot.", SG),
}


# ---------------------------------------------------------------------------------------------
# Русский
# ---------------------------------------------------------------------------------------------

morph = pymorphy3.MorphAnalyzer()

RU_NA = {"улица", "остров", "гора", "кухня", "работа", "море", "озеро", "река", "корабль"}
RU_LOC2 = {"лес", "снег", "год", "глаз", "сад", "мост", "шкаф"}
RU_PLURAL = {
    "стул": {"nomn": "стулья", "gent": "стульев", "datv": "стульям", "accs": "стулья", "ablt": "стульями", "loct": "стульях"},
    "учитель": {"nomn": "учителя", "gent": "учителей", "datv": "учителям", "accs": "учителей", "ablt": "учителями", "loct": "учителях"},
    "церковь": {"nomn": "церкви", "gent": "церквей", "datv": "церквам", "accs": "церкви", "ablt": "церквами", "loct": "церквах"},
    "цветок": {"nomn": "цветы", "gent": "цветов", "datv": "цветам", "accs": "цветы", "ablt": "цветами", "loct": "цветах"},
}


def noun_parse(word):
    parses = [p for p in morph.parse(word) if "NOUN" in p.tag]
    # Предпочитаем разбор, у которого словарная форма — само слово: «носок», а не «носка».
    return next((p for p in parses if p.normal_form == word), parses[0])


def ru_noun(word, case, number):
    if number == "plur" and word in RU_PLURAL:
        return RU_PLURAL[word][case]
    parse = noun_parse(word)
    if case == "loct" and number == "sing" and word in RU_LOC2:
        loc2 = parse.inflect({"loc2", "sing"})
        if loc2:
            return loc2.word
    inflected = parse.inflect({case, number})
    if inflected:
        return inflected.word
    # Несклоняемые слова (кино, кафе, такси) не меняются.
    if "Fixd" in parse.tag:
        return word
    raise ValueError(f"pymorphy не склоняет «{word}» ({case}, {number})")


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
        if kind == "THIS":  # «с этой быстрой машины», «от этого весёлого ребёнка»
            phrase = f"{ru_adj('этот', case, num, noun=ru_word)} {phrase}"
            parts = parts[1:]
            kind = parts[0]
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

EN_IRREGULAR = {
    "child": "children", "man": "men", "woman": "women", "person": "people", "fish": "fish",
    "knife": "knives", "scarf": "scarves", "wolf": "wolves", "mouse": "mice", "potato": "potatoes",
    "tomato": "tomatoes", "shop assistant": "shop assistants",
}


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


# С этими словами по-английски говорят «my»: my mother, my friend.
EN_MY = {"ema", "isa", "pere", "sõber", "vend", "õde", "vanaema", "vanaisa", "poeg", "tütar"}


def render_en(template, en_word, number, adj=None, lemma=None):
    plural = number == "pl"
    noun = en_plural(en_word) if plural else en_word
    phrase = f"{adj} {noun}" if adj else noun
    the = "my" if lemma in EN_MY else "the"
    text = (
        template.replace("{the}", the)
        .replace("{The}", the.capitalize())
        .replace("{sg}", en_word)
        .replace("{a}", phrase if plural else f"{en_article(phrase)} {phrase}")
        .replace("{n}", phrase)
        .replace("{poss}", f"{phrase}'" if noun.endswith("s") else f"{phrase}'s")
        .replace("{has}", "have" if plural else "has")
        .replace("{adj}", adj or "")
    )
    return text[0].upper() + text[1:]


# ---------------------------------------------------------------------------------------------


def main_word(translation):
    """Основное значение из перевода словаря: «нога, стопа» → «нога»."""
    return translation.replace(";", ",").split(",")[0].strip()


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
                    ru_word, en_word, adj_ru, adj_en = main_word(noun["tr"]["ru"]), main_word(noun["tr"]["en"]), main_word(w["tr"]["ru"]), main_word(w["tr"]["en"])
                    ru_word = ADJ_RU_NOUN.get(w["lemma"], ru_word)
                else:
                    frame = frame_for(w["lemma"], case)
                    ru_word, en_word, adj_ru, adj_en = main_word(w["tr"]["ru"]), main_word(w["tr"]["en"]), None, None
                if not frame:
                    continue
                et, ru, en, numbers = frame
                if number not in numbers:
                    continue
                # У прилагательного смотрим и на существительное рядом: «тёплых комнат дверь» — нет.
                noun_lemma = by_id[adjective_nouns[w["id"]]]["lemma"] if w["pos"] == "adj" else w["lemma"]
                if number == "pl" and case in SINGULAR_ONLY.get(noun_lemma, ()):
                    continue
                et, ru, en = pick(et, number), pick(ru, number), pick(en, number)
                if w["pos"] == "adj" and case == "abl":
                    et = et.replace("{}", "sellelt {}" if number == "sg" else "nendelt {}")
                    ru = ru.replace("{", "{THIS:")
                    this = "this {n}" if number == "sg" else "these {n}"
                    en = en.replace("{the} {n}", this).replace("{The} {n}", this.capitalize())
                    en = en.replace("the {n}", this)
                entry[f"{number}.{case}"] = {
                    "et": et,
                    "ru": render_ru(ru, ru_word, number, w["pos"], adj_ru),
                    "en": render_en(en, en_word, number, adj_en, noun_lemma),
                }
        sentences[w["id"]] = entry
    TARGET.write_text(json.dumps(sentences, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    total = sum(len(e) for e in sentences.values())
    print(f"{total} предложений для {len(sentences)} слов -> {TARGET.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
