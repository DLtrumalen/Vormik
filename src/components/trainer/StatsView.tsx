"use client";

import { CASES } from "@/lib/cases";
import type { CaseStats, Progress } from "@/lib/srs";

type Props = { progress: Progress; onReset: () => void };

function accuracy(stats?: CaseStats) {
  if (!stats) return null;
  const total = stats.right + stats.wrong;
  return total === 0 ? null : { percent: Math.round((stats.right / total) * 100), total };
}

export function StatsView({ progress, onReset }: Props) {
  const rows = CASES.map((c) => {
    const sg = progress.stats[`sg.${c.key}`];
    const pl = progress.stats[`pl.${c.key}`];
    const sum = {
      right: (sg?.right ?? 0) + (pl?.right ?? 0),
      wrong: (sg?.wrong ?? 0) + (pl?.wrong ?? 0),
    };
    return { info: c, sg: accuracy(sg), pl: accuracy(pl), all: accuracy(sum) };
  });

  const answered = rows.filter((r) => r.all && r.all.total >= 3);
  const weakest = [...answered].sort((a, b) => a.all!.percent - b.all!.percent).slice(0, 3);
  const total = rows.reduce((n, r) => n + (r.all?.total ?? 0), 0);

  function reset() {
    if (window.confirm("Удалить весь прогресс? Это нельзя отменить.")) onReset();
  }

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-line bg-surface p-5 shadow-sm sm:p-6">
        <h1 className="text-xl font-semibold">Как даются падежи</h1>
        {total === 0 ? (
          <p className="mt-2 text-muted">
            Ответьте на несколько заданий — здесь появится статистика.
          </p>
        ) : weakest.length > 0 ? (
          <p className="mt-2 text-muted">
            Сложнее всего:{" "}
            <b className="text-foreground">{weakest.map((r) => r.info.et).join(", ")}</b>. Эти формы
            будут повторяться чаще.
          </p>
        ) : (
          <p className="mt-2 text-muted">
            Всего ответов: {total}. Для выводов нужно хотя бы по 3 ответа на падеж.
          </p>
        )}

        <ul className="mt-5 divide-y divide-line">
          {rows.map(({ info, sg, pl, all }) => (
            <li
              key={info.key}
              className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 py-3"
            >
              <div>
                <p className="font-medium">{info.et}</p>
                <p className="text-xs text-muted">{info.ru}</p>
              </div>
              <p className="text-right text-sm tabular-nums">
                {all ? (
                  <>
                    <b>{all.percent}%</b> <span className="text-muted">из {all.total}</span>
                  </>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </p>
              <div className="col-span-2 grid grid-cols-2 gap-3">
                <Bar label="ед. ч." value={sg} />
                <Bar label="мн. ч." value={pl} />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={reset}
        className="text-sm text-muted underline-offset-2 hover:text-danger hover:underline"
      >
        Сбросить прогресс
      </button>
    </section>
  );
}

function Bar({ label, value }: { label: string; value: { percent: number } | null }) {
  const color =
    value === null
      ? ""
      : value.percent >= 80
        ? "bg-success"
        : value.percent >= 50
          ? "bg-warning"
          : "bg-danger";
  return (
    <div className="flex items-center gap-2 text-xs text-muted">
      <span className="w-10 shrink-0">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-background">
        {value && (
          <div
            className={`h-full rounded-full ${color}`}
            style={{ width: `${Math.max(value.percent, 4)}%` }}
          />
        )}
      </div>
    </div>
  );
}
