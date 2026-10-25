import type { ReactNode } from "react";

/**
 * Простая разметка для текстов из словарей:
 * **жирный**, [[клавиша]], {share} {plus} {install} — иконки, {name} — подстановка из vars.
 */
export function Rich({ text, vars = {} }: { text: string; vars?: Record<string, string> }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[\[[^\]]+\]\]|\{[a-z]+\})/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**")) {
          return (
            <b key={i} className="font-semibold text-foreground">
              <Rich text={part.slice(2, -2)} vars={vars} />
            </b>
          );
        }
        if (part.startsWith("[[")) {
          return (
            <kbd
              key={i}
              className="rounded-md border border-line bg-surface-raised px-1.5 py-0.5 font-sans text-sm font-semibold text-foreground"
            >
              {part.slice(2, -2)}
            </kbd>
          );
        }
        if (part.startsWith("{")) {
          const name = part.slice(1, -1);
          const icon = ICONS[name];
          if (icon) return <span key={i}>{icon}</span>;
          return <span key={i}>{vars[name] ?? part}</span>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg
      className="inline-block align-[-4px] text-brand"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const ICONS: Record<string, ReactNode> = {
  share: (
    <Svg>
      <path
        d="M12 15V3m0 0L8 7m4-4 4 4M7 10H5v11h14V10h-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  ),
  plus: (
    <Svg>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  ),
  install: (
    <Svg>
      <rect x="3" y="4" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 7.5v6m0 0-2.5-2.5M12 13.5l2.5-2.5M8 20h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  ),
};
