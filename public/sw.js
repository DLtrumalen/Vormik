// Service worker Vormik: страницы — сначала из сети, статика — из кэша.
const CACHE = "vormik-v6";
const PAGES = ["/", "/en", "/fi", "/train"];

/** Файлы сборки (/_next/static/…), на которые ссылается страница. */
function staticAssets(html) {
  return [...new Set(html.match(/\/_next\/static\/[^"'\s)\\]+/g) || [])];
}

/** Кладёт в кэш те файлы из списка, которых там ещё нет. Ошибки не мешают остальным. */
function cacheAll(urls) {
  return caches
    .open(CACHE)
    .then((cache) =>
      Promise.all(
        urls.map((url) => cache.match(url).then((hit) => hit || cache.add(url).catch(() => {}))),
      ),
    );
}

self.addEventListener("install", (event) => {
  // Страницы и все файлы сборки, на которые они ссылаются: без JS и CSS страница из кэша
  // открылась бы без интернета пустой. Если что-то не скачалось, service worker всё равно ставится:
  // недостающее попадёт в кэш при открытии (см. обработчики fetch и message).
  event.waitUntil(
    Promise.all(
      PAGES.map((page) =>
        fetch(page)
          .then((response) =>
            caches
              .open(CACHE)
              .then((cache) => cache.put(page, response.clone()))
              .then(() => response.text()),
          )
          .then((html) => cacheAll(staticAssets(html)))
          .catch(() => {}),
      ),
    ),
  );
  self.skipWaiting();
});

// Страница присылает файлы, которые она уже загрузила до того, как service worker взял управление
// (например, код тренажёра, который подгружается отдельно). Без этого их не было бы в кэше.
self.addEventListener("message", (event) => {
  const urls = event.data && event.data.type === "cache" ? event.data.urls : null;
  if (!Array.isArray(urls)) return;
  const own = urls.filter(
    (url) =>
      typeof url === "string" && new URL(url, self.location.origin).origin === self.location.origin,
  );
  event.waitUntil(cacheAll(own));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/train"))),
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icon")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
            return response;
          }),
      ),
    );
  }
});
