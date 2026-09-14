// Use timestamp-based versioning for automatic cache busting
const CACHE_VERSION = "v" + Math.floor(Date.now() / 3600000); // Update every hour
const CACHE_NAME = "sst-home-solutions-" + CACHE_VERSION;
const STATIC_ASSETS = [
  "/",
  "/properties",
  "/logo.png",
  "/manifest.webmanifest",
];

// Install — cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches (keep last 3 versions)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      const cacheKeysToDelete = keys.filter(
        (k) => k.startsWith("sst-home-solutions-") && !k.includes(CACHE_VERSION)
      );
      return Promise.all(cacheKeysToDelete.map((k) => caches.delete(k)));
    })
  );
  self.clients.claim();
});

// Fetch — network first strategy with version checking
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, cross-origin, and chrome-extension requests
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.protocol === "chrome-extension:"
  ) return;

  // API routes: always network first, no caching
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request, { cache: "no-store" })
        .then((response) => {
          // Don't cache API responses
          return response;
        })
        .catch(() => new Response("Offline", { status: 503 }))
    );
    return;
  }

  // For HTML pages: network first with fallback
  if (url.pathname.endsWith(".html") || url.pathname === "/" || !url.pathname.includes(".")) {
    event.respondWith(
      fetch(request, { cache: "no-store" })
        .then((response) => {
          if (response.ok) {
            // Update cache with fresh version
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/")))
    );
    return;
  }

  // For static assets (_next/static, etc.): cache first with network fallback
  if (url.pathname.startsWith("/_next/static/") || STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request)
        .then((cached) => cached || fetch(request))
        .catch(() => caches.match("/"))
    );
    return;
  }

  // Default: network first
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// Push notifications
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || "SST Home Solutions", {
      body: data.body || "",
      icon: "/logo.png",
      badge: "/logo.png",
      data: { url: data.url || "/" },
      vibrate: [200, 100, 200],
    })
  );
});

// Notification click — open the linked URL
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      clients.openWindow(url);
    })
  );
});
