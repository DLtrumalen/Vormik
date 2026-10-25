/** Статичная картинка тренажёра для первого экрана. */
export function TrainerPreview() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto w-full max-w-sm rotate-1 rounded-3xl border border-line bg-surface p-6 shadow-xl shadow-brand/10"
    >
      <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-muted">
        <span>существительное</span>
        <span className="rounded-full bg-brand-soft px-2 py-0.5 text-brand">новое</span>
      </div>
      <p className="mt-3 text-4xl font-semibold tracking-tight">jalg</p>
      <p className="text-muted">нога</p>
      <div className="mt-4 rounded-2xl bg-brand-soft p-3">
        <p className="font-semibold text-brand">
          sisseütlev <span className="font-normal">· входный</span>
        </p>
        <p className="mt-0.5 text-xs">
          <b>мн. ч.</b> · kuhu? — куда?
        </p>
      </div>
      <div className="mt-4 flex h-12 items-center rounded-2xl border-2 border-success bg-background px-4 text-lg">
        jalgadesse
      </div>
      <div className="mt-3 rounded-2xl bg-success-soft p-3 text-sm text-success">
        <p className="font-semibold">Верно!</p>
        <p>Тоже правильно: jalusse / jalgesse</p>
      </div>
      <p className="mt-3 text-xs text-muted">
        Как образуется: <b className="font-mono text-foreground">jalgade + sse</b>
      </p>
    </div>
  );
}
