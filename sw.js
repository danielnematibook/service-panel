// Cache version - increment this to bust old caches
const CACHE_VERSION = "v3";
const CACHE_NAME = `service-panel-${CACHE_VERSION}`;

const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./logo/logo.png",
  "./styles.css",
  "./app.js",
  "./auth.js",
  "./db.js",
  "./sync.js",
];

// Install event - cache files and skip waiting
self.addEventListener("install", (event) => {
  console.log(`📦 SW Install: ${CACHE_NAME}`);

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log(`✅ Caching ${urlsToCache.length} files`);
        return cache.addAll(urlsToCache);
      })
      .catch((err) => console.error("❌ Cache install error:", err))
  );

  // Skip waiting - activate immediately without waiting for tabs to close
  self.skipWaiting();
});

// Activate event - delete old caches
self.addEventListener("activate", (event) => {
  console.log(`🔄 SW Activate: Cleaning old caches`);

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete all service-panel caches except current version
            if (
              cacheName.startsWith("service-panel-") &&
              cacheName !== CACHE_NAME
            ) {
              console.log(`🗑️ Deleting old cache: ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .catch((err) => console.error("❌ Cache activate error:", err))
  );

  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - network first, then cache
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    // Try network first
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response && response.status === 200) {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request).then((response) => {
          return response || caches.match("./index.html");
        });
      })
  );
});
