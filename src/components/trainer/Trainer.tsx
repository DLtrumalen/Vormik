"use client";

import { useState, type ReactNode } from "react";
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

const TABS: { key: View; label: string; icon: ReactNode }[] = [
  { key: "train", label: "Учить", icon: <CardsIcon /> },
  { key: "stats", label: "Прогресс", icon: <ChartIcon /> },
  { key: "settings", label: "Настройки", icon: <SlidersIcon /> },
];

export default function Trainer() {
  const [session, setSession] = useState(startSession);
  const [view, setView] = useState<View>("train");
  const [pickerOpen, setPickerOpen] = useState(false);
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
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="grid size-9 place-items-center rounded-xl bg-brand text-xl leading-none text-white shadow-lg shadow-brand/30"
            >
              õ
            </span>
            <div className="leading-tight">
              <p className="font-semibold">Vormik</p>
              <p className="text-xs whitespace-nowrap text-muted">выучено: {learned}</p>
            </div>
          </div>
          <div className="flex gap-2 text-xs font-medium">
            <Chip label="повторить" value={due} />
            <Chip label="новых" value={`${newCount}/${newLimit}`} />
          </div>
        </div>
        <div className="mx-auto mt-3 h-1.5 max-w-md overflow-hidden rounded-full bg-surface">
          <div
            className="h-full rounded-full bg-brand transition-[width] duration-500"
            style={{ width: `${Math.min(100, (newCount / newLimit) * 100)}%` }}
          />
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
                <span className="block text-xs text-muted">Учу сейчас</span>
                <b>{settingsSummary(progress.settings)}</b>
              </span>
              <span className="shrink-0 font-medium text-brand">Выбрать падежи</span>
            </button>
          )}

          {view === "train" &&
            (task.kind === "task" ? (
              <TaskCard
                key={session.turn}
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
                answered={session.answered}
                nextDue={task.nextDue}
                canAddNew={task.canAddNew}
                onAddNew={() => update(addNewCards(progress, new Date()), { advance: true })}
                onRefresh={goNext}
              />
            ))}

          {view === "stats" && (
            <StatsView
              progress={progress}
              onReset={() => {
                resetProgress();
                setSession(startSession());
              }}
            />
          )}

          {view === "settings" && (
            <SettingsView
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
                Какие падежи учить
              </h2>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white"
              >
                Готово
              </button>
            </div>
            <CasePickerFields
              settings={progress.settings}
              onChange={(settings) => update({ ...progress, settings }, { advance: true })}
            />
          </div>
        </div>
      )}

      <nav
        aria-label="Разделы"
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
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function Chip({ label, value }: { label: string; value: ReactNode }) {
  return (
    <span className="flex flex-col items-center rounded-xl bg-surface px-2.5 py-1 leading-tight whitespace-nowrap">
      <b className="text-sm text-foreground tabular-nums">{value}</b>
      <span className="text-[10px] text-muted">{label}</span>
    </span>
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
