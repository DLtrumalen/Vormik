import Link from "next/link";
import { InstallButton } from "@/components/InstallButton";
import { Logo } from "@/components/Logo";
import { StandaloneRedirect } from "@/components/StandaloneRedirect";
import { TrainerPreview } from "@/components/landing/TrainerPreview";
import { CASES } from "@/lib/cases";
import { taskIds, DEFAULT_SETTINGS } from "@/lib/srs";
import { WORDS } from "@/lib/words";

const FEATURES = [
  {
    title: "Интервальное повторение",
    text: "Алгоритм FSRS, как в Anki, выбирает момент повторения: трудные формы приходят чаще, выученные — реже.",
  },
  {
    title: "Объяснения на русском",
    text: "После ответа видно, как образуется форма (jala + ga), ключевые формы слова и пример предложения.",
  },
  {
    title: "Все правильные варианты",
    text: "jalgu и jalgasid, majja и majasse: тренажёр знает параллельные формы и принимает любую правильную.",
  },
  {
    title: "Работает без интернета",
    text: "Установите приложение на телефон или компьютер. Регистрация не нужна, прогресс хранится на устройстве.",
  },
];

const STEPS = [
  { title: "Слово и падеж", text: "Например: jalg, входный падеж, множественное число." },
  {
    title: "Ваш ответ",
    text: "Пишете форму. Для õ ä ö ü есть кнопки — эстонская раскладка не нужна.",
  },
  {
    title: "Разбор и повторение",
    text: "Сразу видно, верно ли и почему. Ошибка вернётся через минуту, успех — через дни.",
  },
];

export default function Home() {
  const taskCount = taskIds(DEFAULT_SETTINGS).length;

  return (
    <>
      <StandaloneRedirect />
      <header className="sticky top-0 z-10 border-b border-line/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
            <a href="#features" className="hover:text-foreground">
              Возможности
            </a>
            <a href="#cases" className="hover:text-foreground">
              Падежи
            </a>
            <a href="#download" className="hover:text-foreground">
              Скачать
            </a>
          </nav>
          <Link
            href="/train"
            className="rounded-xl border border-line bg-surface px-4 py-2 text-sm font-medium hover:border-brand hover:text-brand"
          >
            Открыть тренажёр
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-16 pb-20 md:grid-cols-[1.1fr_1fr] md:pt-24">
          <div>
            <p className="inline-flex rounded-full bg-brand-soft px-3 py-1 text-sm font-medium text-brand">
              Тренажёр для русскоязычных
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
              Эстонские падежи без зубрёжки таблиц
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
              Vormik даёт слово и падеж — вы пишете форму. Ошибки возвращаются чаще, выученное —
              реже. Все 14 падежей, оба числа, объяснения на русском.
            </p>
            <div className="mt-8">
              <InstallButton size="lg" />
            </div>
            <p className="mt-4 text-sm text-muted">Бесплатно · без регистрации · работает офлайн</p>
          </div>
          <TrainerPreview />
        </section>

        <section className="border-y border-line bg-surface">
          <dl className="mx-auto grid max-w-6xl grid-cols-3 gap-4 px-4 py-8 text-center">
            {[
              [String(CASES.length), "падежей"],
              [String(WORDS.length), "частых слов"],
              [taskCount.toLocaleString("ru-RU"), "форм для тренировки"],
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
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Почему это работает</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-3xl border border-line bg-surface p-6">
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{f.text}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-20 text-3xl font-semibold tracking-tight sm:text-4xl">
            Как проходит тренировка
          </h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-3xl bg-brand-soft p-6">
                <span className="grid size-9 place-items-center rounded-full bg-brand font-semibold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="cases" className="scroll-mt-20 border-t border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-20">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Все 14 падежей</h2>
            <p className="mt-3 max-w-2xl text-muted">
              Шпаргалка, которая есть и внутри тренажёра: вопрос, окончание и пример для каждого
              падежа.
            </p>
            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {CASES.map((c) => (
                <article key={c.key} className="rounded-2xl border border-line bg-background p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-semibold">{c.et}</h3>
                    <span className="font-mono text-sm text-brand">{c.ending}</span>
                  </div>
                  <p className="text-sm text-muted">{c.ru}</p>
                  <p className="mt-3 text-sm">
                    <span className="text-muted">{c.questionEt}</span> — {c.questionRu}
                  </p>
                  <p className="mt-2 text-sm">
                    <i>{c.example.et}</i>
                    <br />
                    <span className="text-muted">{c.example.ru}</span>
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="download" className="scroll-mt-20 px-4 py-20">
          <div className="mx-auto flex max-w-4xl flex-col items-center rounded-[2rem] bg-brand px-6 py-14 text-center text-white sm:px-12">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Установите Vormik</h2>
            <p className="mt-4 max-w-xl text-lg text-white/85">
              Приложение открывается с главного экрана, как обычное, и работает без интернета.
              Подходит для Android, iPhone, Windows и macOS.
            </p>
            <div className="mt-8 text-left">
              <InstallButton size="lg" tone="light" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:justify-between">
          <p>Vormik — учебный проект для изучающих эстонский.</p>
          <p>
            Формы слов построены морфологическим генератором{" "}
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
