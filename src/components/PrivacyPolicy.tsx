import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { localeHref, LOCALES, type Locale } from "@/i18n";

const ISSUES_URL = "https://github.com/DLtrumalen/Vormik/issues";
const VERCEL_PRIVACY_URL = "https://vercel.com/legal/privacy-policy";
const GITHUB_PRIVACY_URL =
  "https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement";

/** Адрес политики конфиденциальности на нужном языке: /privacy, /en/privacy, /fi/privacy. */
export function privacyHref(locale: Locale) {
  return locale === "ru" ? "/privacy" : `/${locale}/privacy`;
}

type Section = { title: string; text: React.ReactNode };
type Policy = {
  title: string;
  description: string;
  updated: string;
  summary: string;
  sections: Section[];
  home: string;
  languages: Record<Locale, string>;
};

const link = (href: string, label: string) => (
  <a href={href} className="text-brand underline underline-offset-2">
    {label}
  </a>
);

const POLICY: Record<Locale, Policy> = {
  ru: {
    title: "Политика конфиденциальности",
    description:
      "Какие данные хранит Vormik: прогресс только на вашем устройстве, без регистрации и слежки.",
    updated: "Обновлено 10 ноября 2026 г.",
    summary:
      "Коротко: Vormik не собирает ваши личные данные и никому их не передаёт. Нет регистрации, рекламы, аналитики, cookie и сторонних трекеров.",
    sections: [
      {
        title: "Что хранится на вашем устройстве",
        text: "Прогресс обучения (какие формы и когда повторять), выбранные падежи, язык интерфейса и тема. Эти данные хранятся только в памяти браузера или приложения на вашем устройстве и никуда не отправляются. Удалить их можно кнопкой «Сбросить прогресс» во вкладке «Прогресс», очисткой данных сайта или приложения либо удалением приложения. Если на Android включено резервное копирование, система может сохранить эти данные в вашей резервной копии Google — у Vormik к ней доступа нет.",
      },
      {
        title: "Сайт и хостинг",
        text: (
          <>
            Сайт и приложение для Windows загружаются с Vercel. Как любой веб-сервер, Vercel может
            на время записывать технические данные запросов (IP-адрес, тип браузера, время), чтобы
            сайт работал и был защищён от атак. Мы не используем эти записи, чтобы следить за
            посетителями. Подробнее — в{" "}
            {link(VERCEL_PRIVACY_URL, "политике конфиденциальности Vercel")}.
          </>
        ),
      },
      {
        title: "Приложения",
        text: (
          <>
            Приложение для Android содержит все файлы внутри и работает без интернета: оно не
            отправляет данные на серверы. Установщик для Windows скачивается с GitHub —{" "}
            {link(GITHUB_PRIVACY_URL, "политика конфиденциальности GitHub")}.
          </>
        ),
      },
      {
        title: "Дети",
        text: "Vormik подходит для любого возраста. Мы не собираем данные ни взрослых, ни детей.",
      },
      {
        title: "Ваши права",
        text: "Так как мы не храним ваших данных у себя, нам нечего выдавать, исправлять или удалять: все данные находятся на вашем устройстве, и вы управляете ими сами.",
      },
      {
        title: "Изменения",
        text: "Если политика изменится, мы обновим эту страницу и дату вверху.",
      },
      {
        title: "Связь",
        text: (
          <>
            Вопросы можно задать на GitHub:{" "}
            {link(ISSUES_URL, "github.com/DLtrumalen/Vormik/issues")}.
          </>
        ),
      },
    ],
    home: "На главную",
    languages: { ru: "Русский", en: "English", fi: "Suomi" },
  },
  en: {
    title: "Privacy policy",
    description:
      "What data Vormik keeps: your progress stays on your device, with no sign-up and no tracking.",
    updated: "Updated 10 November 2026",
    summary:
      "In short: Vormik does not collect your personal data and does not share it with anyone. No sign-up, ads, analytics, cookies or third-party trackers.",
    sections: [
      {
        title: "What is stored on your device",
        text: "Your learning progress (which forms to review and when), the cases you chose, the interface language and the theme. This data is stored only in your browser or app storage on your device and is never sent anywhere. You can delete it with “Reset progress” on the Progress tab, by clearing the site or app data, or by uninstalling the app. If Android backup is turned on, the system may keep this data in your Google backup — Vormik has no access to it.",
      },
      {
        title: "Website and hosting",
        text: (
          <>
            The website and the Windows app are served by Vercel. Like any web server, Vercel may
            temporarily log technical request data (IP address, browser type, time) to run and
            protect the site. We do not use these logs to track visitors. See the{" "}
            {link(VERCEL_PRIVACY_URL, "Vercel privacy policy")}.
          </>
        ),
      },
      {
        title: "Apps",
        text: (
          <>
            The Android app contains all its files and works offline: it does not send data to any
            server. The Windows installer is downloaded from GitHub — see the{" "}
            {link(GITHUB_PRIVACY_URL, "GitHub privacy statement")}.
          </>
        ),
      },
      {
        title: "Children",
        text: "Vormik is suitable for all ages. We do not collect data from anyone, including children.",
      },
      {
        title: "Your rights",
        text: "Because we do not keep your data, there is nothing for us to export, correct or delete: all data is on your device and under your control.",
      },
      {
        title: "Changes",
        text: "If this policy changes, we will update this page and the date at the top.",
      },
      {
        title: "Contact",
        text: (
          <>
            Questions are welcome on GitHub:{" "}
            {link(ISSUES_URL, "github.com/DLtrumalen/Vormik/issues")}.
          </>
        ),
      },
    ],
    home: "Home",
    languages: { ru: "Русский", en: "English", fi: "Suomi" },
  },
  fi: {
    title: "Tietosuojakäytäntö",
    description:
      "Mitä tietoja Vormik säilyttää: edistyminen pysyy laitteellasi, ilman rekisteröitymistä ja seurantaa.",
    updated: "Päivitetty 10.11.2026",
    summary:
      "Lyhyesti: Vormik ei kerää henkilötietojasi eikä jaa niitä kenellekään. Ei rekisteröitymistä, mainoksia, analytiikkaa, evästeitä eikä kolmannen osapuolen seurantaa.",
    sections: [
      {
        title: "Mitä laitteellesi tallennetaan",
        text: "Oppimisen edistyminen (mitä muotoja kerrataan ja milloin), valitut sijat, käyttöliittymän kieli ja teema. Tiedot tallennetaan vain selaimen tai sovelluksen muistiin laitteellasi, eikä niitä lähetetä minnekään. Voit poistaa ne Edistyminen-välilehden nollauspainikkeella, tyhjentämällä sivuston tai sovelluksen tiedot tai poistamalla sovelluksen. Jos Androidin varmuuskopiointi on päällä, järjestelmä voi tallentaa nämä tiedot Google-varmuuskopioosi — Vormikilla ei ole siihen pääsyä.",
      },
      {
        title: "Verkkosivusto ja palvelin",
        text: (
          <>
            Sivusto ja Windows-sovellus ladataan Vercelistä. Kuten mikä tahansa palvelin, Vercel voi
            tallentaa tilapäisesti pyyntöjen teknisiä tietoja (IP-osoite, selain, aika) sivuston
            toimintaa ja suojausta varten. Emme käytä näitä tietoja kävijöiden seurantaan. Lisää:{" "}
            {link(VERCEL_PRIVACY_URL, "Vercelin tietosuojakäytäntö")}.
          </>
        ),
      },
      {
        title: "Sovellukset",
        text: (
          <>
            Android-sovelluksessa ovat kaikki tiedostot mukana, ja se toimii ilman nettiä: se ei
            lähetä tietoja palvelimille. Windows-asennusohjelma ladataan GitHubista —{" "}
            {link(GITHUB_PRIVACY_URL, "GitHubin tietosuojaseloste")}.
          </>
        ),
      },
      {
        title: "Lapset",
        text: "Vormik sopii kaikenikäisille. Emme kerää tietoja keneltäkään, emme myöskään lapsilta.",
      },
      {
        title: "Oikeutesi",
        text: "Koska emme säilytä tietojasi, meillä ei ole mitään luovutettavaa, korjattavaa tai poistettavaa: kaikki tiedot ovat laitteellasi ja hallinnassasi.",
      },
      {
        title: "Muutokset",
        text: "Jos käytäntö muuttuu, päivitämme tämän sivun ja päivämäärän ylhäällä.",
      },
      {
        title: "Yhteystiedot",
        text: (
          <>
            Kysymyksiä voi esittää GitHubissa:{" "}
            {link(ISSUES_URL, "github.com/DLtrumalen/Vormik/issues")}.
          </>
        ),
      },
    ],
    home: "Etusivulle",
    languages: { ru: "Русский", en: "English", fi: "Suomi" },
  },
};

export function privacyTitle(locale: Locale) {
  return POLICY[locale].title;
}

export function privacyMetadata(locale: Locale): Metadata {
  const p = POLICY[locale];
  return {
    title: `${p.title} — Vormik`,
    description: p.description,
    alternates: {
      canonical: privacyHref(locale),
      languages: Object.fromEntries(LOCALES.map((l) => [l, privacyHref(l)])),
    },
  };
}

/** Политика конфиденциальности сайта и приложений (нужна и для Google Play / App Store). */
export function PrivacyPolicy({ locale }: { locale: Locale }) {
  const p = POLICY[locale];
  return (
    <>
      <header className="border-b border-line/70">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Logo href={localeHref(locale)} />
          <nav className="flex gap-3 text-sm">
            {LOCALES.filter((l) => l !== locale).map((l) => (
              <Link
                key={l}
                href={privacyHref(l)}
                lang={l}
                className="text-muted hover:text-foreground"
              >
                {p.languages[l]}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{p.title}</h1>
        <p className="mt-2 text-sm text-muted">{p.updated}</p>
        <p className="mt-6 rounded-2xl bg-brand-soft p-4 text-base">{p.summary}</p>
        {p.sections.map((section) => (
          <section key={section.title} className="mt-8">
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <p className="mt-2 leading-relaxed text-muted">{section.text}</p>
          </section>
        ))}
        <Link
          href={localeHref(locale)}
          className="mt-10 inline-flex rounded-xl border border-line px-4 py-2 text-sm font-medium hover:border-brand hover:text-brand"
        >
          {p.home}
        </Link>
      </main>
    </>
  );
}
