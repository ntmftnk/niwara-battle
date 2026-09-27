/* ニワラバトル v9.1.5 PWA Service Worker
 * アプリシェルをバージョン単位で固定し、更新はユーザー操作で一括切替する。
 */
const APP_VERSION = "9.1.5";
const CACHE_PREFIX = "niwara-battle-shell-";
const CACHE_NAME = `${CACHE_PREFIX}${APP_VERSION}`;
const APP_SHELL = [
  "./index.html",
  "./style.css",
  "./data.js",
  "./expansion.js",
  "./v6_data.js",
  "./v7_data.js",
  "./script.js",
  "./v6_patch.js",
  "./v6_3_patch.js",
  "./v7_patch.js",
  "./v7_1_patch.js",
  "./v7_2_patch.js",
  "./v8_patch.js",
  "./v9_tools.js",
  "./pwa.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png"
];

const SHELL_PATHS = new Set(APP_SHELL.map(path => new URL(path, self.registration.scope).pathname));

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // HTTPキャッシュを経由せず、このリリースの全ファイルを同じキャッシュへ格納する。
    await cache.addAll(APP_SHELL.map(url => new Request(new URL(url, self.registration.scope).href, { cache: "reload" })));
  })());
  // skipWaitingはしない。旧版を使用中なら、ユーザーが更新を許可するまで旧版を維持する。
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
        .map(key => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

async function shellResponse(request) {
  const cache = await caches.open(CACHE_NAME);
  const url = new URL(request.url);
  const key = request.mode === "navigate" ? new URL("./index.html", self.registration.scope).href : request;
  const cached = await cache.match(key, { ignoreSearch: request.mode === "navigate" });
  if (cached) return cached;

  // 初回キャッシュの一部が失われた場合だけネットワークへ退避。
  try {
    const fresh = await fetch(request, { cache: "no-store" });
    if (fresh && fresh.ok) await cache.put(request, fresh.clone());
    return fresh;
  } catch (_) {
    if (request.mode === "navigate") {
      return (await cache.match(new URL("./index.html", self.registration.scope).href)) || new Response("ニワラバトルをオフラインで起動できませんでした。", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }
    return Response.error();
  }
}

async function runtimeResponse(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) await cache.put(request, fresh.clone());
    return fresh;
  } catch (_) {
    return (await cache.match(request)) || Response.error();
  }
}

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate" || SHELL_PATHS.has(url.pathname)) {
    event.respondWith(shellResponse(request));
    return;
  }
  event.respondWith(runtimeResponse(request));
});

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
  if (event.data?.type === "GET_VERSION") {
    event.source?.postMessage?.({ type: "SW_VERSION", version: APP_VERSION });
  }
});
