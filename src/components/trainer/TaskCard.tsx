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

  return (
    <form
      onSubmit={submit}
      className="rounded-3xl border border-line bg-surface p-5 shadow-sm sm:p-8"
      aria-live="polite"
    >
      <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-muted">
        <span>{word.pos === "noun" ? "существительное" : "прилагательное"}</span>
        {isNew && <span className="rounded-full bg-brand-soft px-2.5 py-1 text-brand">новое</span>}
      </div>

      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{word.lemma}</h1>
      <p className="mt-1 text-lg text-muted">{word.ru}</p>

      <div className="mt-6 rounded-2xl bg-brand-soft p-4">
        <p className="text-lg font-semibold text-brand">
          {info.et} <span className="font-normal">· {info.ru}</span>
        </p>
        <p className="mt-1 text-sm text-foreground">
          <b>{NUMBER_LABEL[number]}</b> · {info.questionEt} — {info.questionRu}
        </p>
      </div>

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
        placeholder="Напишите форму слова"
        className={`mt-6 h-14 w-full rounded-2xl border-2 bg-background px-4 text-xl outline-none transition-colors focus:border-brand ${
          result === "correct"
            ? "border-success"
            : result === "wrong"
              ? "border-danger"
              : result === "diacritics"
                ? "border-warning"
                : "border-line"
        }`}
      />

      {!answered && (
        <div className="mt-3 flex flex-wrap gap-2" aria-label="Эстонские буквы">
          {LETTERS.map((letter) => (
            <button
              key={letter}
              type="button"
              onClick={() => insertLetter(letter)}
              className="size-10 rounded-xl border border-line bg-background text-lg font-medium hover:border-brand hover:text-brand"
            >
              {letter}
            </button>
          ))}
        </div>
      )}

      {result === "empty" && <p className="mt-3 text-sm text-muted">Сначала напишите ответ.</p>}

      {answered && (
        <div className="mt-5 space-y-4">
          <Feedback result={result} variants={variants} input={input} />

          <div className="space-y-2 rounded-2xl border border-line p-4 text-sm leading-relaxed">
            {hint && (
              <p>
                <span className="text-muted">Как образуется:</span>{" "}
                <b className="font-mono">{hint}</b>
              </p>
            )}
            <p>
              <span className="text-muted">Ключевые формы:</span> {keyForms.join(" — ")}
              <span className="text-muted"> (мн. ч. {word.forms["pl.part"].join(" / ")})</span>
            </p>
            <p className="text-muted">{info.explanation}</p>
            <p>
              <i>{info.example.et}</i> <span className="text-muted">— {info.example.ru}</span>
            </p>
          </div>
        </div>
      )}

      <button
        type="submit"
        className="mt-6 h-12 w-full rounded-2xl bg-brand font-semibold text-white transition-colors hover:bg-brand-strong"
      >
        {answered ? "Дальше" : "Проверить"}
        <span className="ml-2 text-sm font-normal opacity-70">Enter</span>
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
      <div className="rounded-2xl bg-success-soft p-4 text-success">
        <p className="font-semibold">Верно!</p>
        {others.length > 0 && <p className="mt-1 text-sm">Тоже правильно: {others.join(" / ")}</p>}
      </div>
    );
  }
  if (result === "diacritics") {
    return (
      <div className="rounded-2xl bg-warning-soft p-4 text-warning">
        <p className="font-semibold">Почти! Проверьте эстонские буквы.</p>
        <p className="mt-1 text-sm">
          Правильно: <b>{all}</b>
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl bg-danger-soft p-4 text-danger">
      <p className="font-semibold">Пока нет</p>
      <p className="mt-1 text-sm">
        Правильно: <b>{all}</b>. Эта форма вернётся скоро.
      </p>
    </div>
  );
}
