type Props = {
  answered: number;
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

export function DoneCard({ answered, nextDue, canAddNew, onAddNew, onRefresh }: Props) {
  return (
    <section className="flex flex-col items-center rounded-[1.75rem] bg-surface px-6 py-10 text-center shadow-xl shadow-black/20">
      <span
        aria-hidden="true"
        className="grid size-16 place-items-center rounded-full bg-success-soft text-3xl text-success"
      >
        ✓
      </span>
      <h1 className="mt-5 text-2xl font-semibold">На сейчас всё</h1>
      {answered > 0 && <p className="mt-1 text-muted">Ответов за эту сессию: {answered}</p>}
      <p className="mt-2 text-muted">
        {nextDue
          ? `Следующее повторение ${formatWait(nextDue)}.`
          : "Все формы при текущих настройках пройдены."}
      </p>
      <div className="mt-8 flex w-full flex-col gap-3">
        {canAddNew && (
          <button
            type="button"
            onClick={onAddNew}
            className="h-14 rounded-2xl bg-brand text-lg font-semibold text-white shadow-lg shadow-brand/25 hover:bg-brand-strong"
          >
            Ещё 10 новых форм
          </button>
        )}
        <button
          type="button"
          onClick={onRefresh}
          className="h-12 rounded-2xl bg-surface-raised font-medium hover:text-brand"
        >
          Проверить снова
        </button>
      </div>
    </section>
  );
}
