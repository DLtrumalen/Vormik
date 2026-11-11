import type { NextConfig } from "next";

// Сборка для приложения в магазинах (Capacitor): только статичные файлы в out/, без сервера.
// Запускается через scripts/build-app.mjs (npm run build:app).
const appBuild = process.env.VORMIK_APP === "1";

const nextConfig: NextConfig = {
  // Статичная сборка не поддерживает частичную пререндеринг-разметку — для приложения она выключена.
  cacheComponents: !appBuild,
  ...(appBuild && { output: "export" }),
  // Код в браузере узнаёт, что он внутри приложения из магазина (см. isStoreApp).
  env: { NEXT_PUBLIC_VORMIK_APP: appBuild ? "1" : "" },
  // Заголовки задаёт сервер, а у приложения из магазина его нет.
  headers: appBuild ? undefined : headers,
  partialPrefetching: !appBuild,
  // У каждого языка свой корневой layout (верный lang в HTML), поэтому страница 404 — общая,
  // src/app/global-not-found.tsx.
  experimental: { globalNotFound: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

// Политика безопасности: страница грузит только свои файлы, не встраивается в чужие сайты и не
// обращается к посторонним адресам. 'unsafe-inline' нужен для встроенных скриптов Next.js и темы,
// 'unsafe-eval' — только серверу разработки.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "manifest-src 'self'",
  "worker-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

async function headers() {
  return [
    {
      source: "/:path*",
      headers: [
        { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    },
    {
      source: "/sw.js",
      headers: [
        { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
      ],
    },
  ];
}

export default nextConfig;
