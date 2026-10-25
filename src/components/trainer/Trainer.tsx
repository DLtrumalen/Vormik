"use client";

import { useState } from "react";
import { Logo } from "@/components/Logo";
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
import { DoneCard } from "./DoneCard";
import { SettingsView } from "./SettingsView";
import { StatsView } from "./StatsView";
import { TaskCard } from "./TaskCard";

type View = "train" | "stats" | "settings";

/** turn растёт при каждой смене задания, чтобы карточка задания начиналась с чистого листа. */
type Session = { progress: Progress; task: NextTask; turn: number };

function startSession(): Session {
  const now = new Date();
  const progress = loadProgress(now);
  return { progress, task: nextTask(progress, now), turn: 0 };
}

export default function Trainer() {
  const [session, setSession] = useState(startSession);
  const [view, setView] = useState<View>("train");
  const { progress, task } = session;

  function update(next: Progress, { advance }: { advance: boolean }) {
    saveProgress(next);
    setSession((s) =>
      advance
        ? { progress: next, task: nextTask(next, new Date()), turn: s.turn + 1 }
        : { ...s, progress: next },
    );
  }

  function goNext() {
    setSession((s) => ({ ...s, task: nextTask(s.progress, new Date()), turn: s.turn + 1 }));
  }

  const now = new Date();
  const due = countDue(progress, now);
  const learned = countLearned(progress);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Logo />
          <nav className="flex gap-1 rounded-xl bg-background p-1 text-sm" aria-label="Разделы">
            {(
              [
                ["train", "Тренировка"],
                ["stats", "Статистика"],
                ["settings", "Настройки"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setView(key)}
                aria-current={view === key ? "page" : undefined}
                className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                  view === key
                    ? "bg-surface text-foreground shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-6">
        <div className="flex gap-4 text-sm text-muted">
          <span>
            К повторению: <b className="text-foreground">{due}</b>
          </span>
          <span>
            Выучено форм: <b className="text-foreground">{learned}</b>
          </span>
          <span>
            Новых сегодня:{" "}
            <b className="text-foreground">
              {progress.daily.newCount}/{progress.daily.newLimit}
            </b>
          </span>
        </div>

        {view === "train" &&
          (task.kind === "task" ? (
            <TaskCard
              key={session.turn}
              id={task.id}
              isNew={task.isNew}
              onAnswer={(correct) =>
                update(review(progress, task.id, correct, new Date()), { advance: false })
              }
              onNext={goNext}
            />
          ) : (
            <DoneCard
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
      </main>
    </div>
  );
}
