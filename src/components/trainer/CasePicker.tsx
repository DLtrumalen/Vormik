"use client";

import { CASE_BY_KEY, NUMBER_LABEL, type CaseKey, type GrammaticalNumber } from "@/lib/cases";
import type { Settings } from "@/lib/srs";

const GROUPS: { title: string; keys: CaseKey[] }[] = [
  { title: "Основные", keys: ["nom", "gen", "part"] },
  { title: "Внутренние местные · в / из", keys: ["ill", "ines", "ela"] },
  { title: "Внешние местные · на / с", keys: ["all", "ade", "abl"] },
  { title: "Остальные", keys: ["transl", "term", "ess", "abess", "com"] },
];

const ALL: CaseKey[] = GROUPS.flatMap((g) => g.keys);

const PRESETS: { label: string; cases: CaseKey[] }[] = [
  { label: "Все 14", cases: ALL },
  { label: "Основные", cases: ["gen", "part"] },
  { label: "Местные (6)", cases: ["ill", "ines", "ela", "all", "ade", "abl"] },
  { label: "Остальные (5)", cases: ["transl", "term", "ess", "abess", "com"] },
];

function toggle<T>(list: T[], item: T) {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

function sameSet<T>(a: T[], b: T[]) {
  return a.length === b.length && a.every((x) => b.includes(x));
}

function plural(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "падеж";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "падежа";
  return "падежей";
}

/** Короткое описание выбора для кнопки: «Все падежи · ед. и мн. ч.». */
export function settingsSummary(settings: Settings) {
  const cases =
    settings.cases.length === ALL.length
      ? "Все падежи"
      : settings.cases.length <= 2
        ? settings.cases.map((c) => CASE_BY_KEY[c].et).join(", ")
        : `${settings.cases.length} ${plural(settings.cases.length)}`;
  const numbers =
    settings.numbers.length === 2 ? "ед. и мн. ч." : NUMBER_LABEL[settings.numbers[0]!];
  return `${cases} · ${numbers}`;
}

type Props = { settings: Settings; onChange: (settings: Settings) => void };

export function CasePickerFields({ settings, onChange }: Props) {
  function setCases(cases: CaseKey[]) {
    if (cases.length > 0) onChange({ ...settings, cases });
  }
  function setNumbers(numbers: GrammaticalNumber[]) {
    if (numbers.length > 0) onChange({ ...settings, numbers });
  }

  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="mb-2 text-sm font-medium">Быстрый выбор</legend>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <Chip
              key={p.label}
              active={sameSet(settings.cases, p.cases)}
              onClick={() => setCases(p.cases)}
            >
              {p.label}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Число</legend>
        <div className="flex gap-2">
          {(["sg", "pl"] as const).map((n) => (
            <Chip
              key={n}
              active={settings.numbers.includes(n)}
              onClick={() => setNumbers(toggle(settings.numbers, n))}
            >
              {n === "sg" ? "Единственное" : "Множественное"}
            </Chip>
          ))}
        </div>
      </fieldset>

      {GROUPS.map((group) => (
        <fieldset key={group.title}>
          <legend className="mb-2 text-sm font-medium">{group.title}</legend>
          <div className="grid grid-cols-2 gap-2">
            {group.keys.map((key) => {
              const info = CASE_BY_KEY[key];
              const active = settings.cases.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCases(toggle(settings.cases, key))}
                  className={`rounded-xl border px-3 py-2 text-left transition-colors ${
                    active ? "border-brand bg-brand-soft" : "border-line hover:border-brand"
                  }`}
                >
                  <span className={`block text-sm font-semibold ${active ? "text-brand" : ""}`}>
                    {info.et}
                  </span>
                  <span className="block text-xs text-muted">
                    {info.ru.split(" (")[0]} · {info.questionEt.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      <p className="text-xs text-muted">Хотя бы один падеж и одно число должны быть выбраны.</p>
    </div>
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
