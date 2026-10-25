type Props = {
  nextDue: Date | null;
  canAddNew: boolean;
  onAddNew: () => void;
  onRefresh: () => void;
};

function formatWait(date: Date) {
  const minutes = Math.max(1, Math.round((date.getTime() - Date.now()) / 60_000));
  if (minutes < 60) return `через ${minutes} мин`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `через ${hours} ч`;
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

export function DoneCard({ nextDue, canAddNew, onAddNew, onRefresh }: Props) {
  return (
    <div className="rounded-3xl border border-line bg-surface p-8 text-center shadow-sm">
      <p className="text-4xl" aria-hidden="true">
        ✓
      </p>
      <h1 className="mt-3 text-2xl font-semibold">На сейчас всё</h1>
      <p className="mt-2 text-muted">
        {nextDue
          ? `Следующее повторение ${formatWait(nextDue)}.`
          : "Все формы при текущих настройках пройдены."}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {canAddNew && (
          <button
            type="button"
            onClick={onAddNew}
            className="h-11 rounded-xl bg-brand px-5 font-semibold text-white hover:bg-brand-strong"
          >
            Ещё 10 новых форм
          </button>
        )}
        <button
          type="button"
          onClick={onRefresh}
          className="h-11 rounded-xl border border-line px-5 font-medium hover:border-brand hover:text-brand"
        >
          Проверить снова
        </button>
      </div>
    </div>
  );
}
