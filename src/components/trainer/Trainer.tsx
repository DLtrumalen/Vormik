"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { LangSwitcher } from "@/components/LangSwitcher";
import { getDictionary, localeHref, type Dictionary } from "@/i18n";
import { useLocale } from "@/i18n/client";
import { isStandalone } from "@/lib/install";
import {
  addNewCards,
  countDue,
  countLearned,
  nextTask,
  review,
  type NextTask,
  type Progress,
} from "@/lib/srs";
import { loadProgress, resetProgress, saveProgress } from "@/lib/storage";
import { CasePickerFields, settingsSummary } from "./CasePicker";
import { DoneCard } from "./DoneCard";
import { SettingsView } from "./SettingsView";
import { StatsView } from "./StatsView";
import { TaskCard } from "./TaskCard";

type View = "train" | "stats" | "settings";

/** turn растёт при каждой смене задания, чтобы карточка задания начиналась с чистого листа. */
type Session = { progress: Progress; task: NextTask; turn: number; answered: number };

function startSession(): Session {
  const now = new Date();
  const progress = loadProgress(now);
  return { progress, task: nextTask(progress, now), turn: 0, answered: 0 };
}

const TABS: { key: View; tab: keyof Dictionary["app"]["tabs"]; icon: ReactNode }[] = [
  { key: "train", tab: "learn", icon: <CardsIcon /> },
  { key: "stats", tab: "progress", icon: <ChartIcon /> },
  { key: "settings", tab: "settings", icon: <SlidersIcon /> },
];

export default function Trainer() {
  const [session, setSession] = useState(startSession);
  const [view, setView] = useState<View>("train");
  const [pickerOpen, setPickerOpen] = useState(false);
  // Тренажёр рендерится только на клиенте, поэтому режим запуска можно узнать сразу.
  const [standalone] = useState(isStandalone);
  const locale = useLocale();
  const t = getDictionary(locale);
  const { progress, task } = session;

  function update(next: Progress, { advance }: { advance: boolean }) {
    saveProgress(next);
    setSession((s) =>
      advance
        ? { ...s, progress: next, task: nextTask(next, new Date()), turn: s.turn + 1 }
        : { ...s, progress: next },
    );
  }

  function goNext() {
    setSession((s) => ({ ...s, task: nextTask(s.progress, new Date()), turn: s.turn + 1 }));
  }

  const due = countDue(progress, new Date());
  const learned = countLearned(progress);
  const { newCount, newLimit } = progress.daily;

  return (
    <div className="app-theme fixed inset-0 flex flex-col">
      <header className="shrink-0 px-4 pt-[max(env(safe-area-inset-top),0.75rem)] pb-3">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          {/* В браузере логотип ведёт на главную страницу сайта, в установленном приложении — нет. */}
          {standalone ? (
            <div className="flex items-center gap-2.5">
              <Brand learned={`${t.app.learned}: ${learned}`} />
            </div>
          ) : (
            <Link
              href={localeHref(locale)}
              title={t.app.home}
              className="flex items-center gap-2.5 rounded-xl transition-opacity hover:opacity-80"
            >
              <Brand learned={`${t.app.learned}: ${learned}`} />
            </Link>
          )}
          <LangSwitcher locale={locale} mode="app" />
        </div>
        <div className="mx-auto mt-3 flex max-w-md items-center gap-3 text-xs text-muted">
          <span className="whitespace-nowrap">
            <b className="text-foreground tabular-nums">{due}</b> {t.app.due}
          </span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-500"
              style={{ width: `${Math.min(100, (newCount / newLimit) * 100)}%` }}
            />
          </div>
          <span className="whitespace-nowrap">
            <b className="text-foreground tabular-nums">
              {newCount}/{newLimit}
            </b>{" "}
            {t.app.fresh}
          </span>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6">
        <div className="mx-auto flex max-w-md flex-col gap-4 pt-2">
          {view === "train" && (
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="flex items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3 text-left text-sm transition-colors hover:bg-surface-raised"
            >
              <span>
                <span className="block text-xs text-muted">{t.app.learningNow}</span>
                <b>{settingsSummary(progress.settings, t)}</b>
              </span>
              <span className="shrink-0 font-medium text-brand">{t.app.chooseCases}</span>
            </button>
          )}

          {view === "train" &&
            (task.kind === "task" ? (
              <TaskCard
                key={session.turn}
                t={t}
                id={task.id}
                isNew={task.isNew}
                onAnswer={(correct) => {
                  update(review(progress, task.id, correct, new Date()), { advance: false });
                  setSession((s) => ({ ...s, answered: s.answered + 1 }));
                }}
                onNext={goNext}
              />
            ) : (
              <DoneCard
                t={t}
                answered={session.answered}
                nextDue={task.nextDue}
                canAddNew={task.canAddNew}
                onAddNew={() => update(addNewCards(progress, new Date()), { advance: true })}
                onRefresh={goNext}
              />
            ))}

          {view === "stats" && (
            <StatsView
              t={t}
              progress={progress}
              onReset={() => {
                resetProgress();
                setSession(startSession());
              }}
            />
          )}

          {view === "settings" && (
            <SettingsView
              t={t}
              settings={progress.settings}
              onChange={(settings) => update({ ...progress, settings }, { advance: true })}
            />
          )}
        </div>
      </main>

      {pickerOpen && (
        <div
          className="fixed inset-0 z-20 flex items-end bg-black/60 backdrop-blur-sm"
          onClick={() => setPickerOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="picker-title"
            onClick={(e) => e.stopPropagation()}
            className="mx-auto max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-t-[1.75rem] bg-surface px-5 pt-3 pb-[max(env(safe-area-inset-bottom),1.25rem)] shadow-2xl"
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line" aria-hidden="true" />
            <div className="mb-4 flex items-center justify-between">
              <h2 id="picker-title" className="text-lg font-semibold">
                {t.app.pickerTitle}
              </h2>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white"
              >
                {t.app.done}
              </button>
            </div>
            <CasePickerFields
              t={t}
              settings={progress.settings}
              onChange={(settings) => update({ ...progress, settings }, { advance: true })}
            />
          </div>
        </div>
      )}

      <nav
        aria-label={t.app.sections}
        className="shrink-0 border-t border-line bg-surface/90 px-2 pt-1.5 pb-[max(env(safe-area-inset-bottom),0.5rem)] backdrop-blur"
      >
        <div className="mx-auto grid max-w-md grid-cols-3">
          {TABS.map((tab) => {
            const active = view === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setView(tab.key)}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-medium transition-colors ${
                  active ? "text-brand" : "text-muted hover:text-foreground"
                }`}
              >
                <span
                  className={`grid h-7 w-14 place-items-center rounded-full transition-colors ${
                    active ? "bg-brand-soft" : ""
                  }`}
                >
                  {tab.icon}
                </span>
                {t.app.tabs[tab.tab]}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function Brand({ learned }: { learned: string }) {
  return (
    <>
      <span
        aria-hidden="true"
        className="grid size-9 place-items-center rounded-xl bg-brand text-xl leading-none text-white shadow-lg shadow-brand/30"
      >
        õ
      </span>
      <span className="leading-tight">
        <span className="block font-semibold">Vormik</span>
        <span className="block text-xs whitespace-nowrap text-muted">{learned}</span>
      </span>
    </>
  );
}

function CardsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="6" width="13" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M8 3h9.5A2.5 2.5 0 0 1 20 5.5V17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 20V11M12 20V4M19 20v-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SlidersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7h10M18 7h2M4 17h4M12 17h8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="16" cy="7" r="2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="10" cy="17" r="2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
