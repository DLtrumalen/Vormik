"use client";

import { useRef, useState, type FormEvent } from "react";
import { checkAnswer, normalize, type CheckResult } from "@/lib/check";
import { CASE_BY_KEY, NUMBER_LABEL } from "@/lib/cases";
import { parseTaskId, type TaskId } from "@/lib/srs";
import { WORD_BY_ID, formationHint } from "@/lib/words";

const LETTERS = ["õ", "ä", "ö", "ü", "š", "ž"];

type Props = {
  id: TaskId;
  isNew: boolean;
  onAnswer: (correct: boolean) => void;
  onNext: () => void;
};

export function TaskCard({ id, isNew, onAnswer, onNext }: Props) {
  const { wordId, formKey, number, caseKey } = parseTaskId(id);
  const word = WORD_BY_ID[wordId]!;
  const info = CASE_BY_KEY[caseKey];
  const variants = word.forms[formKey];

  const [input, setInput] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const answered = result !== null && result !== "empty";

  function submit(event: FormEvent) {
    event.preventDefault();
    if (answered) {
      onNext();
      return;
    }
    const checked = checkAnswer(input, variants);
    setResult(checked);
    if (checked !== "empty") onAnswer(checked === "correct");
  }

  function insertLetter(letter: string) {
    const el = inputRef.current;
    if (!el || answered) return;
    const start = el.selectionStart ?? input.length;
    const end = el.selectionEnd ?? input.length;
    setInput(input.slice(0, start) + letter + input.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + 1, start + 1);
    });
  }

  const hint = formationHint(word, number, info.suffix, caseKey);
  const keyForms = [word.forms["sg.nom"][0], word.forms["sg.gen"][0], word.forms["sg.part"][0]];

  const inputBorder =
    result === "correct"
      ? "border-success"
      : result === "wrong"
        ? "border-danger"
        : result === "diacritics"
          ? "border-warning"
          : "border-transparent focus:border-brand";

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" aria-live="polite">
      <section className="rounded-[1.75rem] bg-surface px-5 pt-5 pb-6 text-center shadow-xl shadow-black/20">
        <div className="flex items-center justify-between text-[11px] font-medium tracking-wide text-muted uppercase">
          <span>{word.pos === "noun" ? "существительное" : "прилагательное"}</span>
          {isNew ? (
            <span className="rounded-full bg-brand-soft px-2.5 py-1 text-brand">новое</span>
          ) : (
            <span className="rounded-full bg-surface-raised px-2.5 py-1">повтор</span>
          )}
        </div>

        <h1 className="mt-6 text-5xl font-semibold tracking-tight">{word.lemma}</h1>
        <p className="mt-1 text-lg text-muted">{word.ru}</p>

        <div className="mt-6 inline-flex flex-col items-center rounded-2xl bg-brand-soft px-5 py-3">
          <p className="text-lg font-semibold text-brand">
            {info.et} · {NUMBER_LABEL[number]}
          </p>
          <p className="mt-0.5 text-sm text-foreground/80">
            {info.ru} · {info.questionEt}
          </p>
        </div>
      </section>

      <label htmlFor="answer" className="sr-only">
        Форма слова
      </label>
      <input
        id="answer"
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        readOnly={answered}
        autoFocus
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint={answered ? "next" : "done"}
        placeholder="Ваш ответ"
        className={`h-16 w-full rounded-2xl border-2 bg-surface px-5 text-center text-2xl font-medium outline-none transition-colors placeholder:text-muted/60 ${inputBorder}`}
      />

      {!answered && (
        <div className="grid grid-cols-6 gap-2" aria-label="Эстонские буквы">
          {LETTERS.map((letter) => (
            <button
              key={letter}
              type="button"
              onClick={() => insertLetter(letter)}
              className="h-12 rounded-xl bg-surface-raised text-xl font-medium shadow-[inset_0_-2px_0_rgba(0,0,0,0.35)] transition-transform active:translate-y-px active:shadow-none"
            >
              {letter}
            </button>
          ))}
        </div>
      )}

      {result === "empty" && (
        <p className="text-center text-sm text-muted">Сначала напишите ответ.</p>
      )}

      {answered && (
        <>
          <Feedback result={result} variants={variants} input={input} />

          <section className="space-y-2.5 rounded-2xl bg-surface p-4 text-sm leading-relaxed">
            {hint && (
              <p>
                <span className="text-muted">Как образуется:</span>{" "}
                <b className="font-mono text-brand">{hint}</b>
              </p>
            )}
            <p>
              <span className="text-muted">Ключевые формы:</span> {keyForms.join(" — ")}
              <span className="text-muted"> · мн. ч. {word.forms["pl.part"].join(" / ")}</span>
            </p>
            <p className="text-muted">{info.explanation}</p>
            <p className="rounded-xl bg-surface-raised px-3 py-2">
              <i>{info.example.et}</i> <span className="text-muted">— {info.example.ru}</span>
            </p>
          </section>
        </>
      )}

      <button
        type="submit"
        className="h-14 w-full rounded-2xl bg-brand text-lg font-semibold text-white shadow-lg shadow-brand/25 transition-colors hover:bg-brand-strong active:scale-[0.99]"
      >
        {answered ? "Дальше" : "Проверить"}
      </button>
    </form>
  );
}

function Feedback({
  result,
  variants,
  input,
}: {
  result: CheckResult;
  variants: string[];
  input: string;
}) {
  const all = variants.join(" / ");
  if (result === "correct") {
    const others = variants.filter((v) => normalize(v) !== normalize(input));
    return (
      <div className="rounded-2xl bg-success-soft p-4 text-center text-success">
        <p className="text-lg font-semibold">Верно!</p>
        {others.length > 0 && <p className="mt-1 text-sm">Тоже правильно: {others.join(" / ")}</p>}
      </div>
    );
  }
  if (result === "diacritics") {
    return (
      <div className="rounded-2xl bg-warning-soft p-4 text-center text-warning">
        <p className="text-lg font-semibold">Почти! Проверьте эстонские буквы</p>
        <p className="mt-1 text-sm">
          Правильно: <b>{all}</b>
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl bg-danger-soft p-4 text-center text-danger">
      <p className="text-lg font-semibold">Пока нет</p>
      <p className="mt-1 text-sm">
        Правильно: <b>{all}</b> · вернётся через минуту
      </p>
    </div>
  );
}
