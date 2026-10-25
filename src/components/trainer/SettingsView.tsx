"use client";

import Link from "next/link";
import { CASES, NUMBER_LABEL, type CaseKey, type GrammaticalNumber } from "@/lib/cases";
import { DEFAULT_SETTINGS, type Settings } from "@/lib/srs";

type Props = { settings: Settings; onChange: (settings: Settings) => void };

const GROUPS: { title: string; keys: CaseKey[] }[] = [
  { title: "Основные", keys: ["nom", "gen", "part"] },
  { title: "Внутренние местные", keys: ["ill", "ines", "ela"] },
  { title: "Внешние местные", keys: ["all", "ade", "abl"] },
  { title: "Остальные", keys: ["transl", "term", "ess", "abess", "com"] },
];

function toggle<T>(list: T[], item: T) {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export function SettingsView({ settings, onChange }: Props) {
  function setCases(cases: CaseKey[]) {
    if (cases.length > 0) onChange({ ...settings, cases });
  }
  function setNumbers(numbers: GrammaticalNumber[]) {
    if (numbers.length > 0) onChange({ ...settings, numbers });
  }

  return (
    <section className="space-y-4 rounded-3xl border border-line bg-surface p-5 shadow-sm sm:p-6">
      <div>
        <h1 className="text-xl font-semibold">Что тренировать</h1>
        <p className="mt-1 text-sm text-muted">
          Хотя бы один падеж и одно число должны быть выбраны.
        </p>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Число</legend>
        <div className="flex gap-2">
          {(["sg", "pl"] as const).map((n) => (
            <Chip
              key={n}
              active={settings.numbers.includes(n)}
              onClick={() => setNumbers(toggle(settings.numbers, n))}
            >
              {NUMBER_LABEL[n]}
            </Chip>
          ))}
        </div>
      </fieldset>

      {GROUPS.map((group) => (
        <fieldset key={group.title}>
          <legend className="mb-2 text-sm font-medium">{group.title}</legend>
          <div className="flex flex-wrap gap-2">
            {group.keys.map((key) => {
              const info = CASES.find((c) => c.key === key)!;
              return (
                <Chip
                  key={key}
                  active={settings.cases.includes(key)}
                  onClick={() => setCases(toggle(settings.cases, key))}
                >
                  {info.et}
                </Chip>
              );
            })}
          </div>
        </fieldset>
      ))}

      <button
        type="button"
        onClick={() => onChange(DEFAULT_SETTINGS)}
        className="text-sm font-medium text-brand underline-offset-2 hover:underline"
      >
        Выбрать всё
      </button>

      <p className="border-t border-line pt-4 text-sm text-muted">
        Vormik — тренажёр эстонских падежей.{" "}
        <Link href="/" className="font-medium text-brand underline-offset-2 hover:underline">
          О приложении
        </Link>
      </p>
    </section>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`h-9 rounded-full border px-4 text-sm font-medium transition-colors ${
        active
          ? "border-brand bg-brand text-white"
          : "border-line text-muted hover:border-brand hover:text-brand"
      }`}
    >
      {children}
    </button>
  );
}
