import type { Dictionary } from "./types";

export const fi: Dictionary = {
  locale: "fi",
  name: "Suomi",
  meta: {
    title: "Vormik — viron sijamuotojen harjoittelu",
    description:
      "Harjoittele virolaisten sanojen muotoja kaikissa 14 sijassa. Jaksotettu kertaus ja selkeät selitykset.",
  },
  number: { sg: "yksikkö", pl: "monikko" },
  numberFull: { sg: "Yksikkö", pl: "Monikko" },
  pos: { noun: "substantiivi", adj: "adjektiivi" },
  language: "Kieli",
  cases: {
    nom: {
      name: "nominatiivi",
      question: "kuka? mikä?",
      ending: "—",
      explanation: "Sanakirjamuoto. Monikossa: genetiivin vartalo + -d.",
      example: "Talo on suuri.",
    },
    gen: {
      name: "genetiivi",
      question: "kenen? minkä?",
      ending: "vokaali",
      explanation:
        "Tärkein opeteltava muoto: siitä muodostetaan useimmat muut sijat. Monikossa: -de tai -te.",
      example: "Talon ovi on auki.",
    },
    part: {
      name: "partitiivi",
      question: "ketä? mitä?",
      ending: "-t, -d tai vokaali",
      explanation:
        "Osittainen objekti, osa jostakin, kielto, lukusanat kahdesta ylöspäin. Muoto opetellaan sanan mukana.",
      example: "Juon vettä.",
    },
    ill: {
      name: "illatiivi",
      question: "mihin? keneen?",
      ending: "-sse tai lyhyt muoto",
      explanation: "Liike jonkin sisään: mihin?",
      example: "Menen taloon.",
    },
    ines: {
      name: "inessiivi",
      question: "missä? kenessä?",
      ending: "-s",
      explanation: "Oleminen jonkin sisällä.",
      example: "Olen talossa.",
    },
    ela: {
      name: "elatiivi",
      question: "mistä? kenestä?",
      ending: "-st",
      explanation: "Liike jostakin ulos sekä puheenaihe: mistä puhutaan.",
      example: "Tulen talosta.",
    },
    all: {
      name: "allatiivi",
      question: "mille? kenelle?",
      ending: "-le",
      explanation: "Liike jonkin pinnalle sekä vastaanottaja: kenelle.",
      example: "Annan kirjan ystävälle.",
    },
    ade: {
      name: "adessiivi",
      question: "millä? kenellä?",
      ending: "-l",
      explanation: "Oleminen jonkin pinnalla sekä omistaminen: minulla on.",
      example: "Kirja on pöydällä.",
    },
    abl: {
      name: "ablatiivi",
      question: "miltä? keneltä?",
      ending: "-lt",
      explanation: "Liike jonkin pinnalta sekä lähde: keneltä.",
      example: "Otan kirjan pöydältä.",
    },
    transl: {
      name: "translatiivi",
      question: "miksi? keneksi?",
      ending: "-ks",
      explanation: "Miksi jokin muuttuu tai keneksi joku tulee.",
      example: "Hän haluaa lääkäriksi.",
    },
    term: {
      name: "terminatiivi",
      question: "mihin asti? keneen asti?",
      ending: "-ni",
      explanation: "Raja paikassa tai ajassa: johonkin asti.",
      example: "Kävelen joelle asti.",
    },
    ess: {
      name: "essiivi",
      question: "minä? kenenä?",
      ending: "-na",
      explanation: "Jonkin roolissa oleminen: minä, kenenä.",
      example: "Hän työskentelee lääkärinä.",
    },
    abess: {
      name: "abessiivi",
      question: "ilman ketä? ilman mitä?",
      ending: "-ta",
      explanation: "Jonkin puuttuminen: ilman.",
      example: "Juon kahvia ilman maitoa.",
    },
    com: {
      name: "komitatiivi",
      question: "kenen kanssa? minkä kanssa?",
      ending: "-ga",
      explanation: "Yhdessä jonkun kanssa tai jonkin avulla.",
      example: "Menen elokuviin ystävän kanssa.",
    },
  },

  site: {
    tagline: "Viron sijamuotojen harjoittelu",
    title: "Viron sijamuodot ilman taulukoiden pänttäämistä",
    lead: "Vormik antaa sanan ja sijan — sinä kirjoitat muodon. Virheet palaavat useammin, osatut harvemmin. Kaikki 14 sijaa, molemmat luvut, selitykset suomeksi.",
    perks: "Ilmainen · ei rekisteröitymistä · toimii ilman nettiä",
    nav: { features: "Ominaisuudet", cases: "Sijat" },
    openTrainer: "Avaa harjoittelu",
    stats: { cases: "sijaa", words: "yleistä sanaa", forms: "harjoiteltavaa muotoa" },
    featuresTitle: "Miksi se toimii",
    features: [
      {
        title: "Jaksotettu kertaus",
        text: "FSRS-algoritmi, kuten Ankissa, valitsee kertauksen hetken: vaikeat muodot palaavat useammin, opitut harvemmin.",
      },
      {
        title: "Selitykset suomeksi",
        text: "Vastauksen jälkeen näet, miten muoto muodostetaan (jala + ga), sanan avainmuodot ja esimerkin.",
      },
      {
        title: "Kaikki oikeat vaihtoehdot",
        text: "jalgu ja jalgasid, majja ja majasse: harjoitus tuntee rinnakkaismuodot ja hyväksyy minkä tahansa oikean.",
      },
      {
        title: "Toimii ilman nettiä",
        text: "Asenna sovellus puhelimeen tai tietokoneeseen. Ei rekisteröitymistä — edistyminen tallentuu laitteellesi.",
      },
    ],
    stepsTitle: "Miten harjoittelu etenee",
    steps: [
      { title: "Sana ja sija", text: "Esimerkiksi: jalg, illatiivi, monikko." },
      {
        title: "Vastauksesi",
        text: "Kirjoita muoto. Kirjaimille õ ä ö ü on napit — virolaista näppäimistöä ei tarvita.",
      },
      {
        title: "Palaute ja kertaus",
        text: "Näet heti, onko vastaus oikein ja miksi. Virhe palaa minuutissa, onnistuminen päivien päästä.",
      },
    ],
    casesTitle: "Kaikki 14 sijaa",
    casesLead:
      "Lunttilappu, joka löytyy myös sovelluksesta: kysymys, pääte ja esimerkki jokaiselle sijalle.",
    footerProject: "Vormik — opetusprojekti viron kielen opiskelijoille.",
    footerForms: "Sanamuodot on tuottanut morfologinen generaattori",
    preview: { correct: "Oikein!", alsoCorrect: "Myös oikein", howBuilt: "Muodostus" },
  },

  install: {
    download: "Lataa sovellus",
    downloadWindows: "Lataa Windowsille",
    openTrainer: "Avaa harjoittelu",
  },

  app: {
    tabs: { learn: "Opi", progress: "Edistyminen", settings: "Asetukset" },
    sections: "Osiot",
    home: "Etusivulle",
    learned: "opittu",
    due: "kerrattavaa",
    fresh: "uusia",
    learningNow: "Harjoittelen nyt",
    chooseCases: "Valitse sijat",
    pickerTitle: "Mitä sijoja harjoitellaan",
    done: "Valmis",
    loading: "Ladataan harjoittelua",
  },

  task: {
    isNew: "uusi",
    review: "kertaus",
    answerLabel: "Sanan muoto",
    placeholder: "Vastauksesi",
    letters: "Virolaiset kirjaimet",
    empty: "Kirjoita ensin vastaus.",
    check: "Tarkista",
    next: "Seuraava",
    verdict: {
      correct: "Oikein!",
      diacritics: "Melkein! Tarkista virolaiset kirjaimet",
      wrong: "Ei vielä — tämä muoto palaa minuutin päästä",
    },
    alsoCorrect: "Myös oikein",
    whatsWrong: "Mikä meni vikaan.",
    howTitle: "Miten muoto muodostetaan",
    whenTitle: "Milloin sijaa käytetään",
    exampleTitle: "Esimerkki tällä sanalla",
  },

  done: {
    title: "Tältä erää valmista",
    answered: (n) => `Vastauksia tällä kerralla: ${n}`,
    nextReview: (when) => `Seuraava kertaus ${when}.`,
    allDone: "Kaikki muodot nykyisillä asetuksilla on käyty läpi.",
    addNew: "10 uutta muotoa lisää",
    refresh: "Tarkista uudelleen",
  },

  stats: {
    title: "Miten sijat sujuvat",
    empty: "Vastaa muutamaan tehtävään, niin tilastot näkyvät tässä.",
    weakest: "Vaikeimmat:",
    weakestNote: "Näitä muotoja kerrataan useammin.",
    notEnough: (n) =>
      `Vastauksia yhteensä: ${n}. Johtopäätöksiin tarvitaan vähintään 3 vastausta sijaa kohden.`,
    outOf: (n) => `${n} vastauksesta`,
    reset: "Nollaa edistyminen",
    confirmReset: "Poistetaanko kaikki edistyminen? Tätä ei voi perua.",
  },

  settings: {
    title: "Mitä harjoitellaan",
    lead: "Valitse sijat ja luku. Tehtävät tulevat vain valinnoistasi.",
    footer: "Vormik — viron sijamuotojen harjoittelu.",
    about: "Tietoja",
  },

  picker: {
    quick: "Pikavalinta",
    number: "Luku",
    groups: ["Perussijat", "Sisäpaikallissijat", "Ulkopaikallissijat", "Muut"],
    presets: ["Kaikki 14", "Perussijat", "Paikallissijat (6)", "Muut (5)"],
    minHint: "Valitse vähintään yksi sija ja yksi luku.",
    all: "Kaikki sijat",
    count: (n) => `${n} sijaa`,
    bothNumbers: "yks. ja mon.",
  },

  explain: {
    diacritics:
      "Melkein: muoto on oikein, mutta virolaiset kirjaimet (õ, ä, ö, ü) ovat sekaisin. Vertaa oikeaan vastaukseen.",
    otherNumber: (input, caseEt, actual, needed) =>
      `”${input}” on ${caseEt}, ${actual}, mutta tarvitaan ${needed}`,
    otherCase: (input, label) => `”${input}” on eri sija: ${label}`,
    stemError: (suffix, stem, expected) =>
      `Pääte -${suffix} on oikein, virhe on vartalossa: ei ”${stem}-” vaan ”${expected}-”.`,
    noSuchForm: (lemma, input) => `Sanalla ${lemma} ei ole muotoa ”${input}”.`,
    genSg: (lemma, sgGen) => [
      `Yksikön genetiiviä ei muodosteta säännöllä — se opetellaan sanan mukana: ${lemma} → ${sgGen}.`,
      `Siitä muodostetaan useimmat muut sijat: ${sgGen}s, ${sgGen}st, ${sgGen}ga…`,
    ],
    partSg: (lemma, sgGen, sgPart) => [
      `Myös yksikön partitiivi opetellaan sanan mukana: ${lemma} — ${sgGen} — ${sgPart}.`,
      "Nämä kolme muotoa (nominatiivi, genetiivi, partitiivi) ovat sanan ”avain”.",
    ],
    partPl: (forms, sgPart) => [
      `Monikon partitiivi pitää opetella ulkoa: ${forms}.`,
      `Vertaa: yksikön partitiivi — ${sgPart}.`,
    ],
    takeGen: (lemma, sgGen) => `Otetaan yksikön genetiivi: ${lemma} → ${sgGen}.`,
    addD: (sgGen) => `Lisätään -d: ${sgGen} + d = ${sgGen}d.`,
    plIntro: (lemma, sgGen, sgPart) =>
      `Yksikön genetiivi: ${lemma} → ${sgGen}, yksikön partitiivi: ${sgPart}.`,
    plGenFrom: (sgPart, plGen) =>
      `Monikon genetiivi muodostetaan yksikön partitiivista + -de tai -te: ${sgPart} → ${plGen}.`,
    plGenIs: (plGen) => `Monikon genetiivi (yksikön partitiivi + -de/-te): ${plGen}.`,
    addEnding: (suffix, base) =>
      `Lisätään pääte -${suffix}: ${base} + ${suffix} = ${base}${suffix}.`,
    shortIll: (short) =>
      `Sanalla on myös lyhyt muoto: ${short} — puheessa se on yleisempi. Molemmat muodot ovat oikein.`,
    irregular: (forms) => `Tämä muoto ei noudata yleistä sääntöä — opettele se: ${forms}.`,
    shortPl: (plPart, others) =>
      `Monikossa on myös lyhyt muoto, joka muodostetaan monikon partitiivista (${plPart}): ${others}. Sekin on oikein.`,
    exampleNoun: (question, translation, number) => `${question} → ”${translation}”, ${number}`,
    exampleAdjGenitive: (phrase, translation) =>
      `Substantiivin kanssa: ”${phrase}” (”${translation}”). Sijoissa rajav, olev, ilmaütlev ja kaasaütlev adjektiivi on substantiivin edellä genetiivissä.`,
    exampleAdj: (phrase, translation, number) =>
      `Substantiivin kanssa: ”${phrase}” (”${translation}”, ${number}) — adjektiivi on samassa sijassa kuin substantiivi.`,
    house: "talo",
  },
};
