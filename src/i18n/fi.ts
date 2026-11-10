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
      name: "kuka? mikä?",
      question: "kuka? mikä?",
      ending: "—",
      explanation:
        "Subjekti ja sanakirjamuoto: Maja on suur. Monikossa myös kokonaisobjekti: Ma ostsin raamatud.",
      example: "Talo on suuri.",
    },
    gen: {
      name: "kenen? minkä?",
      question: "kenen? minkä?",
      ending: "vokaali",
      explanation:
        "Kenen? minkä?: maja uks — talon ovi. Myös kokonaisobjekti (Ma ostsin raamatu) ja sanat kuten juures, jaoks, kohta: maja juures.",
      example: "Talon ovi on auki.",
    },
    part: {
      name: "mitä? (osa tai kesken)",
      question: "ketä? mitä?",
      ending: "-t, -d tai vokaali",
      explanation:
        "Osaobjekti tai kesken oleva toiminta (Ma loen raamatut), osa jostakin (Ma joon vett), kiellon jälkeen (Ma ei näe maja) ja lukusanojen jälkeen kahdesta alkaen (kaks maja).",
      example: "Juon vettä.",
    },
    ill: {
      name: "mihin? (sisään)",
      question: "mihin? keneen?",
      ending: "-sse tai lyhyt muoto",
      explanation: "Liike jonkin sisään: mihin?",
      example: "Menen taloon.",
    },
    ines: {
      name: "missä? (sisällä)",
      question: "missä? kenessä?",
      ending: "-s",
      explanation: "Oleminen jonkin sisällä.",
      example: "Olen talossa.",
    },
    ela: {
      name: "mistä? (sisältä)",
      question: "mistä? kenestä?",
      ending: "-st",
      explanation: "Liike jostakin ulos sekä puheenaihe: mistä puhutaan.",
      example: "Tulen talosta.",
    },
    all: {
      name: "mille? kenelle?",
      question: "mille? kenelle?",
      ending: "-le",
      explanation: "Liike jonkin pinnalle sekä vastaanottaja: kenelle.",
      example: "Annan kirjan ystävälle.",
    },
    ade: {
      name: "millä? kenellä?",
      question: "millä? kenellä?",
      ending: "-l",
      explanation: "Oleminen jonkin pinnalla sekä omistaminen: minulla on.",
      example: "Kirja on pöydällä.",
    },
    abl: {
      name: "miltä? keneltä?",
      question: "miltä? keneltä?",
      ending: "-lt",
      explanation: "Liike jonkin pinnalta sekä lähde: keneltä.",
      example: "Otan kirjan pöydältä.",
    },
    transl: {
      name: "miksi? (tulla joksikin)",
      question: "miksi? keneksi?",
      ending: "-ks",
      explanation: "Miksi jokin muuttuu tai keneksi joku tulee.",
      example: "Hän haluaa lääkäriksi.",
    },
    term: {
      name: "mihin asti?",
      question: "mihin asti? keneen asti?",
      ending: "-ni",
      explanation: "Raja paikassa tai ajassa: johonkin asti.",
      example: "Kävelen joelle asti.",
    },
    ess: {
      name: "minä? (jonakin)",
      question: "minä? kenenä?",
      ending: "-na",
      explanation: "Jonkin roolissa oleminen: minä, kenenä.",
      example: "Hän työskentelee lääkärinä.",
    },
    abess: {
      name: "ilman mitä?",
      question: "ilman ketä? ilman mitä?",
      ending: "-ta",
      explanation: "Jonkin puuttuminen: ilman.",
      example: "Juon kahvia ilman maitoa.",
    },
    com: {
      name: "minkä kanssa? kenen kanssa?",
      question: "kenen kanssa? minkä kanssa?",
      ending: "-ga",
      explanation: "Yhdessä jonkun kanssa tai jonkin avulla.",
      example: "Menen elokuviin ystävän kanssa.",
    },
  },

  site: {
    tagline: "Viron sijamuotojen harjoittelu",
    title: "Viron sijamuodot ilman taulukoiden pänttäämistä",
    lead: "Vormik antaa sanan, sijan ja lyhyen lauseen, jossa on aukko — sinä kirjoitat oikean muodon. Virheet palaavat useammin, osatut harvemmin. Kaikki 14 sijaa, molemmat luvut, selitykset suomeksi.",
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
      {
        title: "Sana ja sija",
        text: "Esimerkiksi: jalg, sisseütlev (mihin?), monikko — ja lyhyt lause, jossa on aukko.",
      },
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
    theme: "Ulkoasu",
    themes: { dark: "Tumma", light: "Vaalea" },
    switchTo: { dark: "Vaihda tummaan teemaan", light: "Vaihda vaaleaan teemaan" },
  },

  picker: {
    quick: "Pikavalinta",
    number: "Luku",
    groups: ["Perussijat", "Sisäpaikallissijat", "Ulkopaikallissijat", "Muut"],
    presets: ["Kaikki 14", "Perussijat", "Paikallissijat (6)", "Muut (5)"],
    minHint:
      "Vähintään yksi tehtävä täytyy jäädä. Yksikön nominatiivi on sanakirjamuoto, sitä ei kysytä.",
    all: "Kaikki sijat",
    count: (n) => `${n} sijaa`,
    bothNumbers: "yks. ja mon.",
  },

  explain: {
    diacritics:
      "Muoto on oikein, mutta virolaiset kirjaimet (õ, ä, ö, ü) ovat sekaisin. Vertaa oikeaan vastaukseen.",
    cyrillic:
      "Näyttää siltä, että kyrillinen näppäimistö on päällä: vastauksessa on kyrillisiä kirjaimia. Vaihda latinalaisiin.",
    otherNumber: (input, caseEt, actual, needed) =>
      `”${input}” on ${caseEt}, ${actual}, mutta tarvitaan ${needed}.`,
    otherCase: (input, label, needed) => `”${input}” on ${label}. Tarvitaan ${needed}.`,
    stemError: (suffix, stem, expected) =>
      `Pääte -${suffix} on oikein, virhe on vartalossa: ei ”${stem}-” vaan ”${expected}-”.`,
    endingError: (suffix, stem) =>
      `Vartalo ${stem}- on oikein, virhe on päätteessä: tarvitaan -${suffix}.`,
    noSuchForm: (lemma, input) => `Sanalla ${lemma} ei ole muotoa ”${input}”.`,
    genSg: (lemma, sgGen) => [
      `Yksikön omastav (genetiivi) opetellaan sanan mukana: ${lemma} → ${sgGen}.`,
      `Siitä muodostetaan lähes kaikki muut sijat: ${sgGen}s, ${sgGen}st, ${sgGen}ga…`,
    ],
    partSg: (lemma, sgGen, sgPart) => [
      `Myös yksikön osastav (partitiivi) opetellaan sanan mukana: ${lemma} — ${sgGen} — ${sgPart}.`,
    ],
    partPl: (forms) => [`Monikon osastav pitää opetella: ${forms}.`],
    partPlRule: (sgPart, form) =>
      `Vinkki: jos yksikön osastav päättyy vokaaliin, voi lisätä -sid: ${sgPart} + sid = ${form}.`,
    takeGen: (lemma, sgGen) => `Otetaan yksikön omastav (genetiivi): ${lemma} → ${sgGen}.`,
    addD: (sgGen) => `Lisätään -d: ${sgGen} + d = ${sgGen}d.`,
    plBase: (plGen) => `Monikon sijat muodostetaan monikon omastavista: ${plGen}.`,
    plGenRule: (sgPart, ending, reason, plGen, others) =>
      `Katsotaan yksikön osastavia ${sgPart}: se päättyy ${
        { vowel: "vokaaliin", d: "‑d:hen", t: "‑t:hen" }[reason]
      }, joten lisätään ‑${ending}: ${plGen.slice(0, -2)} + ${ending} = ${plGen}.${
        others ? ` Myös oikein: ${others}.` : ""
      } ${
        ending === "de"
          ? "Jos se päättyisi ‑t:hen, pääte olisi ‑te: keelt → keelte."
          : "Jos se päättyisi vokaaliin, pääte olisi ‑de: pilti → piltide."
      }`,
    plGenException: (sgPart, plGen) =>
      `Tämä sana on poikkeus: ${sgPart} → ${plGen}. Opettele tämä muoto.`,
    addEnding: (suffix, base) =>
      `Lisätään pääte -${suffix}: ${base} + ${suffix} = ${base}${suffix}.`,
    shortIll: (short) =>
      `Sanalla on myös lyhyt muoto ${short}, joka on myös yleinen. Molemmat muodot ovat oikein.`,
    irregular: (forms) => `Tämä muoto ei noudata yleistä sääntöä — opettele se: ${forms}.`,
    shortPl: (forms, many) =>
      many
        ? `On myös lyhyitä muotoja: ${forms}. Nekin ovat oikein.`
        : `On myös lyhyt muoto: ${forms}. Sekin on oikein.`,
    altPlGen: (gen, forms) =>
      `Muodon voi rakentaa myös monikon toisesta omastavista (${gen}): ${forms}.`,
  },
};
