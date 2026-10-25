import { INTL_LOCALE, type Dictionary } from "@/i18n";

type Props = {
  t: Dictionary;
  answered: number;
  nextDue: Date | null;
  canAddNew: boolean;
  onAddNew: () => void;
  onRefresh: () => void;
};

function formatWait(date: Date, t: Dictionary) {
  const intl = INTL_LOCALE[t.locale];
  const minutes = Math.max(1, Math.round((date.getTime() - Date.now()) / 60_000));
  const relative = new Intl.RelativeTimeFormat(intl, { numeric: "auto" });
  if (minutes < 60) return relative.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (hours < 24) return relative.format(hours, "hour");
  return date.toLocaleDateString(intl, { day: "numeric", month: "long" });
}

export function DoneCard({ t, answered, nextDue, canAddNew, onAddNew, onRefresh }: Props) {
  const d = t.done;
  return (
    <section className="flex flex-col items-center rounded-[1.75rem] bg-surface px-6 py-10 text-center shadow-xl shadow-black/20">
      <span
        aria-hidden="true"
        className="grid size-16 place-items-center rounded-full bg-success-soft text-3xl text-success"
      >
        ✓
      </span>
      <h1 className="mt-5 text-2xl font-semibold">{d.title}</h1>
      {answered > 0 && <p className="mt-1 text-muted">{d.answered(answered)}</p>}
      <p className="mt-2 text-muted">
        {nextDue ? d.nextReview(formatWait(nextDue, t)) : d.allDone}
      </p>
      <div className="mt-8 flex w-full flex-col gap-3">
        {canAddNew && (
          <button
            type="button"
            onClick={onAddNew}
            className="h-14 rounded-2xl bg-brand text-lg font-semibold text-white shadow-lg shadow-brand/25 hover:bg-brand-strong"
          >
            {d.addNew}
          </button>
        )}
        <button
          type="button"
          onClick={onRefresh}
          className="h-12 rounded-2xl bg-surface-raised font-medium hover:text-brand"
        >
          {d.refresh}
        </button>
      </div>
    </section>
  );
}
