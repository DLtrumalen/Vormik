import Link from "next/link";
import { InstallButton } from "@/components/InstallButton";
import { LangSwitcher } from "@/components/LangSwitcher";
import { Logo } from "@/components/Logo";
import { SiteRedirect } from "@/components/SiteRedirect";
import { TrainerPreview } from "@/components/landing/TrainerPreview";
import { getDictionary, INTL_LOCALE, localeHref, type Locale } from "@/i18n";
import { CASES } from "@/lib/cases";
import { DEFAULT_SETTINGS, taskIds } from "@/lib/srs";
import { WORDS } from "@/lib/words";

/** Главная страница сайта на выбранном языке. */
export function Landing({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const s = t.site;
  const taskCount = taskIds(DEFAULT_SETTINGS).length;

  return (
    <>
      <SiteRedirect locale={locale} />
      <header className="sticky top-0 z-10 border-b border-line/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Logo href={localeHref(locale)} />
          <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
            <a href="#features" className="hover:text-foreground">
              {s.nav.features}
            </a>
            <a href="#cases" className="hover:text-foreground">
              {s.nav.cases}
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/train"
              className="hidden rounded-xl border border-line bg-surface px-4 py-2 text-sm font-medium hover:border-brand hover:text-brand sm:inline-flex"
            >
              {s.openTrainer}
            </Link>
            <LangSwitcher locale={locale} mode="site" />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-16 pb-20 md:grid-cols-[1.1fr_1fr] md:pt-24">
          <div>
            <p className="inline-flex rounded-full bg-brand-soft px-3 py-1 text-sm font-medium text-brand">
              {s.tagline}
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
              {s.title}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">{s.lead}</p>
            <div className="mt-8">
              <InstallButton locale={locale} size="lg" />
            </div>
            <p className="mt-4 text-sm text-muted">{s.perks}</p>
          </div>
          <TrainerPreview t={t} />
        </section>

        <section className="border-y border-line bg-surface">
          <dl className="mx-auto grid max-w-6xl grid-cols-3 gap-4 px-4 py-8 text-center">
            {[
              [String(CASES.length), s.stats.cases],
              [String(WORDS.length), s.stats.words],
              [taskCount.toLocaleString(INTL_LOCALE[locale]), s.stats.forms],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd className="text-3xl font-semibold tracking-tight sm:text-4xl">{value}</dd>
                <dd className="mt-1 text-sm text-muted">{label}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{s.featuresTitle}</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {s.features.map((f) => (
              <div key={f.title} className="rounded-3xl border border-line bg-surface p-6">
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{f.text}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-20 text-3xl font-semibold tracking-tight sm:text-4xl">
            {s.stepsTitle}
          </h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {s.steps.map((step, i) => (
              <li key={step.title} className="rounded-3xl bg-brand-soft p-6">
                <span className="grid size-9 place-items-center rounded-full bg-brand font-semibold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="cases" className="scroll-mt-20 border-t border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-20">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{s.casesTitle}</h2>
            <p className="mt-3 max-w-2xl text-muted">{s.casesLead}</p>
            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {CASES.map((c) => {
                const ct = t.cases[c.key];
                return (
                  <article key={c.key} className="rounded-2xl border border-line bg-background p-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-semibold">{c.et}</h3>
                      <span className="font-mono text-sm text-brand">{ct.ending}</span>
                    </div>
                    <p className="text-sm text-muted">{ct.name}</p>
                    <p className="mt-3 text-sm">
                      <span className="text-muted">{c.questionEt}</span> — {ct.question}
                    </p>
                    <p className="mt-2 text-sm">
                      <i>{c.exampleEt}</i>
                      <br />
                      <span className="text-muted">{ct.example}</span>
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:justify-between">
          <p>{s.footerProject}</p>
          <p>
            {s.footerForms}{" "}
            <a
              href="https://github.com/Filosoft/vabamorf"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Vabamorf
            </a>{" "}
            (Filosoft, LGPL).
          </p>
        </div>
      </footer>
    </>
  );
}
