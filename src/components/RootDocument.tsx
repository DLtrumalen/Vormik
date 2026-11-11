import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { ServiceWorker } from "@/components/ServiceWorker";
import { ru } from "@/i18n/ru";
import { INSTALL_CAPTURE_SCRIPT } from "@/lib/install-capture";
import { SITE_URL } from "@/lib/site";
import "@/app/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext", "cyrillic"],
});

// Моноширинный шрифт нужен только для окончаний ниже на странице — заранее его не грузим.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext", "cyrillic"],
  preload: false,
});

/** Общие метаданные всех страниц; заголовок и описание страница задаёт сама. */
export const rootMetadata: Metadata = {
  // Полные адреса для canonical, hreflang и картинки Open Graph.
  metadataBase: new URL(SITE_URL),
  title: ru.meta.title,
  description: ru.meta.description,
  applicationName: "Vormik",
  appleWebApp: { capable: true, title: "Vormik", statusBarStyle: "black-translucent" },
  // Next выводит только новый тег mobile-web-app-capable; старые iOS понимают лишь этот.
  other: { "apple-mobile-web-app-capable": "yes" },
};

export const rootViewport: Viewport = {
  themeColor: "#0072ce",
};

/**
 * Каркас страницы: <html> с языком, шрифты, перехват установки и service worker.
 * У каждого языка свой корневой layout, чтобы lang был верным уже в HTML с сервера.
 */
export function RootDocument({ lang, children }: { lang: string; children: ReactNode }) {
  return (
    <html lang={lang} className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      {/* Это корневой layout App Router (вынесен в компонент), а не страница pages/ — <head> здесь уместен. */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: INSTALL_CAPTURE_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
