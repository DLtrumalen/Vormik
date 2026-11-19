"use client";

import { useState, useSyncExternalStore } from "react";
import type { Dictionary } from "@/i18n";
import { CASES } from "@/lib/cases";
import { isStandalone } from "@/lib/install";
import type { CaseStats, Progress } from "@/lib/srs";
import { exportProgress, importProgress } from "@/lib/storage";

type Props = {
  t: Dictionary;
  progress: Progress;
  onReset: () => void;
  onRestore: (progress: Progress) => void;
};

function accuracy(stats?: CaseStats) {
  if (!stats) return null;
  const total = stats.right + stats.wrong;
  return total === 0 ? null : { percent: Math.round((stats.right / total) * 100), total };
}

export function StatsView({ t, progress, onReset, onRestore }: Props) {
  const s = t.stats;
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
    if (window.confirm(s.confirmReset)) onReset();
  }

  return (
    <section className="space-y-4">
      <div className="rounded-[1.75rem] bg-surface p-5 shadow-xl shadow-black/20 sm:p-6">
        <h1 className="text-xl font-semibold">{s.title}</h1>
        {total === 0 ? (
          <p className="mt-2 text-muted">{s.empty}</p>
        ) : weakest.length > 0 ? (
          <p className="mt-2 text-muted">
            {s.weakest}{" "}
            <b className="text-foreground">{weakest.map((r) => r.info.et).join(", ")}</b>.{" "}
            {s.weakestNote}
          </p>
        ) : (
          <p className="mt-2 text-muted">{s.notEnough(total)}</p>
        )}

        <ul className="mt-5 divide-y divide-line">
          {rows.map(({ info, sg, pl, all }) => (
            <li
              key={info.key}
              className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 py-3"
            >
              <div>
                <p className="font-medium">{info.et}</p>
                <p className="text-xs text-muted">{t.cases[info.key].name}</p>
              </div>
              <p className="text-right text-sm tabular-nums">
                {all ? (
                  <>
                    <b>{all.percent}%</b> <span className="text-muted">{s.outOf(all.total)}</span>
                  </>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </p>
              <div className="col-span-2 grid grid-cols-2 gap-3">
                <Bar label={t.number.sg} value={sg} />
                <Bar label={t.number.pl} value={pl} />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Backup t={t} progress={progress} onRestore={onRestore} />

      <button
        type="button"
        onClick={reset}
        className="text-sm text-muted underline-offset-2 hover:text-danger hover:underline"
      >
        {s.reset}
      </button>
    </section>
  );
}

const noSubscribe = () => () => {};

/** iPhone или iPad, открыто в Safari как сайт (не установлено на экран «Домой»). */
function isIosBrowser() {
  const ios =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1);
  return ios && !isStandalone();
}

/**
 * Резервная копия прогресса кодом: прогресс хранится только на устройстве, и без копии он пропадает
 * при очистке браузера, смене телефона или переходе между сайтом и приложением.
 */
function Backup({
  t,
  progress,
  onRestore,
}: {
  t: Dictionary;
  progress: Progress;
  onRestore: (progress: Progress) => void;
}) {
  const b = t.stats.backup;
  const ios = useSyncExternalStore(noSubscribe, isIosBrowser, () => false);
  const [code, setCode] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [input, setInput] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function copy() {
    const text = exportProgress(progress);
    setCode(text);
    try {
      await navigator.clipboard.writeText(text);
      setMessage({ ok: true, text: b.copied });
    } catch {
      // Буфер обмена недоступен — код виден в поле ниже, его можно скопировать вручную.
      setMessage(null);
    }
  }

  function restore() {
    const restored = importProgress(input, new Date());
    if (!restored) {
      setMessage({ ok: false, text: b.badCode });
      return;
    }
    if (!window.confirm(b.confirmRestore)) return;
    onRestore(restored);
    setInput("");
    setRestoring(false);
    setMessage({ ok: true, text: b.restored });
  }

  return (
    <div className="rounded-[1.75rem] bg-surface p-5 shadow-xl shadow-black/20 sm:p-6">
      <h2 className="text-lg font-semibold">{b.title}</h2>
      {ios && (
        <p className="mt-2 rounded-xl bg-warning-soft px-3 py-2 text-sm text-warning">
          {t.stats.iosWarning}
        </p>
      )}
      <p className="mt-2 text-sm text-muted">{b.text}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copy}
          className="h-11 rounded-xl bg-brand px-4 text-sm font-semibold text-white"
        >
          {b.copy}
        </button>
        <button
          type="button"
          onClick={() => {
            setRestoring((v) => !v);
            setMessage(null);
          }}
          className="h-11 rounded-xl border border-line px-4 text-sm font-medium hover:border-brand hover:text-brand"
        >
          {b.restore}
        </button>
      </div>
      {code && (
        <textarea
          readOnly
          value={code}
          onFocus={(e) => e.target.select()}
          aria-label={b.copy}
          className="mt-3 h-20 w-full resize-none rounded-xl border border-line bg-background p-2 font-mono text-xs"
        />
      )}
      {restoring && (
        <div className="mt-3 space-y-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={b.placeholder}
            aria-label={b.restore}
            className="h-20 w-full resize-none rounded-xl border border-line bg-background p-2 font-mono text-xs"
          />
          <button
            type="button"
            onClick={restore}
            disabled={!input.trim()}
            className="h-11 rounded-xl bg-brand px-4 text-sm font-semibold text-white disabled:opacity-50"
          >
            {b.apply}
          </button>
        </div>
      )}
      {message && (
        <p role="status" className={`mt-3 text-sm ${message.ok ? "text-success" : "text-danger"}`}>
          {message.text}
        </p>
      )}
    </div>
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
      <span className="w-16 shrink-0 truncate">{label}</span>
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
