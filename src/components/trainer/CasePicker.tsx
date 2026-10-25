"use client";

import type { Dictionary } from "@/i18n";
import { CASE_BY_KEY, type CaseKey, type GrammaticalNumber } from "@/lib/cases";
import type { Settings } from "@/lib/srs";

const GROUPS: CaseKey[][] = [
  ["nom", "gen", "part"],
  ["ill", "ines", "ela"],
  ["all", "ade", "abl"],
  ["transl", "term", "ess", "abess", "com"],
];

const ALL: CaseKey[] = GROUPS.flat();

const PRESETS: CaseKey[][] = [
  ALL,
  ["gen", "part"],
  ["ill", "ines", "ela", "all", "ade", "abl"],
  ["transl", "term", "ess", "abess", "com"],
];

function toggle<T>(list: T[], item: T) {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

function sameSet<T>(a: T[], b: T[]) {
  return a.length === b.length && a.every((x) => b.includes(x));
}

/** Короткое описание выбора для кнопки: «Все падежи · ед. и мн. ч.». */
export function settingsSummary(settings: Settings, t: Dictionary) {
  const cases =
    settings.cases.length === ALL.length
      ? t.picker.all
      : settings.cases.length <= 2
        ? settings.cases.map((c) => CASE_BY_KEY[c].et).join(", ")
        : t.picker.count(settings.cases.length);
  const numbers =
    settings.numbers.length === 2 ? t.picker.bothNumbers : t.number[settings.numbers[0]!];
  return `${cases} · ${numbers}`;
}

type Props = { t: Dictionary; settings: Settings; onChange: (settings: Settings) => void };

export function CasePickerFields({ t, settings, onChange }: Props) {
  function setCases(cases: CaseKey[]) {
    if (cases.length > 0) onChange({ ...settings, cases });
  }
  function setNumbers(numbers: GrammaticalNumber[]) {
    if (numbers.length > 0) onChange({ ...settings, numbers });
  }

  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="mb-2 text-sm font-medium">{t.picker.quick}</legend>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((cases, i) => (
            <Chip key={i} active={sameSet(settings.cases, cases)} onClick={() => setCases(cases)}>
              {t.picker.presets[i]}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">{t.picker.number}</legend>
        <div className="flex gap-2">
          {(["sg", "pl"] as const).map((n) => (
            <Chip
              key={n}
              active={settings.numbers.includes(n)}
              onClick={() => setNumbers(toggle(settings.numbers, n))}
            >
              {t.numberFull[n]}
            </Chip>
          ))}
        </div>
      </fieldset>

      {GROUPS.map((keys, i) => (
        <fieldset key={i}>
          <legend className="mb-2 text-sm font-medium">{t.picker.groups[i]}</legend>
          <div className="grid grid-cols-2 gap-2">
            {keys.map((key) => {
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
                    {t.cases[key].name.split(" (")[0]} · {info.questionEt.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      <p className="text-xs text-muted">{t.picker.minHint}</p>
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
