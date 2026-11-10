import type { Dictionary } from "@/i18n";
import { CASE_BY_KEY } from "@/lib/cases";
import { explain, taskSentence } from "@/lib/explain";
import { WORD_BY_ID } from "@/lib/words";

const WORD = WORD_BY_ID.maja!;
const KEY = "sg.ill";

/** Статичная картинка тренажёра для первого экрана: настоящее задание с предложением и разбором. */
export function TrainerPreview({ t }: { t: Dictionary }) {
  const info = CASE_BY_KEY.ill;
  const sentence = taskSentence(WORD, KEY, t.locale);
  const e = explain(WORD, KEY, "majja", "correct", t.locale);
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto w-full max-w-sm rotate-1 rounded-3xl border border-line bg-surface p-6 shadow-xl shadow-brand/10"
    >
      <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-muted">
        <span>{t.pos.noun}</span>
        <span className="rounded-full bg-brand-soft px-2 py-0.5 text-brand">{t.task.isNew}</span>
      </div>
      <p className="mt-3 text-4xl font-semibold tracking-tight">{WORD.lemma}</p>
      <p className="text-muted">{WORD.tr[t.locale]}</p>
      <div className="mt-4 rounded-2xl bg-brand-soft p-3">
        <p className="font-semibold text-brand">
          {info.et} · {t.number.sg}
        </p>
        <p className="mt-0.5 text-xs">
          {t.cases.ill.name} · {info.questionEt}
        </p>
      </div>
      {sentence && (
        <div className="mt-4 text-center">
          <p className="text-lg font-medium">{sentence.et}</p>
          {sentence.translation && <p className="text-xs text-muted">{sentence.translation}</p>}
        </div>
      )}
      <div className="mt-4 flex h-12 items-center rounded-2xl border-2 border-success bg-background px-4 text-lg">
        {e.answer}
      </div>
      <div className="mt-3 rounded-2xl bg-success-soft p-3 text-sm text-success">
        <p className="font-semibold">{t.site.preview.correct}</p>
        <p>
          {t.site.preview.alsoCorrect}: {e.alternatives.join(" / ")}
        </p>
      </div>
      <p className="mt-3 text-xs text-muted">
        {t.site.preview.howBuilt}: <b className="font-mono text-foreground">maja + sse</b>
      </p>
    </div>
  );
}
