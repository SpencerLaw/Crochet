const CACHE_NAME = 'crochet-cache-v3';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/index.css',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // 1. Network First for API/Supabase calls
    if (url.hostname.includes('supabase.co')) {
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
        return;
    }

    // 2. Network First for navigation (index.html, root)
    // Ensures user gets the latest bundle hashes.
    if (event.request.mode === 'navigate' || url.pathname === '/' || url.pathname === '/index.html') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (response.status === 200) {
                        const copy = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
                    }
                    return response;
                })
                .catch(() => caches.match(event.request) || caches.match('/index.html') || caches.match('/'))
        );
        return;
    }

    // 3. Stale-While-Revalidate for CSS, JS and local Assets
    // Best for performance while keeping things relatively fresh.
    if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js') || url.pathname.endsWith('.tsx') || url.pathname.includes('/assets/')) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    if (networkResponse.status === 200) {
                        const copy = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
                    }
                    return networkResponse;
                });
                return cachedResponse || fetchPromise;
            })
        );
        return;
    }

    // 4. Cache First for images and fonts (static content)
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).then((fetchResponse) => {
                if (fetchResponse.status === 200) {
                    const copy = fetchResponse.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
                }
                return fetchResponse;
            });
        })
    );
});
