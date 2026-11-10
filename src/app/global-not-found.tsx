import type { Metadata } from "next";
import Link from "next/link";
import { RootDocument } from "@/components/RootDocument";

export const metadata: Metadata = {
  title: "404 — Vormik",
  robots: { index: false },
};

/** Страница для несуществующих адресов: одна на все языки, поэтому текст на трёх языках. */
export default function GlobalNotFound() {
  return (
    <RootDocument lang="ru">
      <main className="app-theme flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
        <span
          aria-hidden="true"
          className="grid size-16 place-items-center rounded-2xl bg-brand text-3xl text-white"
        >
          õ
        </span>
        <h1 className="text-4xl font-semibold">404</h1>
        <div className="space-y-1 text-muted">
          <p lang="ru">Такой страницы нет.</p>
          <p lang="en">This page does not exist.</p>
          <p lang="fi">Tätä sivua ei ole.</p>
        </div>
        <nav className="flex flex-wrap justify-center gap-2 text-sm font-medium">
          <Link href="/" className="rounded-xl bg-brand px-4 py-2 text-white">
            На главную
          </Link>
          <Link href="/en" lang="en" className="rounded-xl border border-line px-4 py-2">
            Home
          </Link>
          <Link href="/fi" lang="fi" className="rounded-xl border border-line px-4 py-2">
            Etusivu
          </Link>
        </nav>
      </main>
    </RootDocument>
  );
}
