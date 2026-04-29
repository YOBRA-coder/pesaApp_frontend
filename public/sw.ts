/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

const CACHE_VERSION = 'pesaapp-v6';
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const API_CACHE     = `${CACHE_VERSION}-api`;

// ── Assets to pre-cache ───────────────────────────────────────
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,600&display=swap',
];

// ── Install ───────────────────────────────────────────────────
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate ──────────────────────────────────────────────────
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== STATIC_CACHE && k !== DYNAMIC_CACHE && k !== API_CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── Fetch strategy ────────────────────────────────────────────
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, WebSocket, chrome-extension
  if (request.method !== 'GET') return;
  if (url.protocol === 'ws:' || url.protocol === 'wss:') return;
  if (url.protocol === 'chrome-extension:') return;

  // API requests — Network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithCache(request, API_CACHE, 30));
    return;
  }

  // Static assets — Cache first
  if (url.pathname.match(/\.(js|css|png|jpg|svg|woff2?)$/)) {
    event.respondWith(cacheFirstWithNetwork(request, STATIC_CACHE));
    return;
  }

  // Navigation — Network first, SPA fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/index.html').then(r => r || fetch('/index.html'))
      )
    );
    return;
  }

  // Default — stale while revalidate
  event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
});

async function networkFirstWithCache(req: Request, cacheName: string, ttlSeconds: number): Promise<Response> {
  try {
    const res = await fetch(req);
    if (res.ok) {
      const cache = await caches.open(cacheName);
      cache.put(req, res.clone());
    }
    return res;
  } catch {
    const cached = await caches.match(req);
    return cached || new Response(JSON.stringify({ error: 'Offline', offline: true }), {
      status: 503, headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function cacheFirstWithNetwork(req: Request, cacheName: string): Promise<Response> {
  const cached = await caches.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  if (res.ok) {
    const cache = await caches.open(cacheName);
    cache.put(req, res.clone());
  }
  return res;
}

async function staleWhileRevalidate(req: Request, cacheName: string): Promise<Response> {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const fetchPromise = fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; });
  return cached || fetchPromise;
}

// ── Push Notifications ────────────────────────────────────────
self.addEventListener('push', (event: PushEvent) => {
  const data = event.data?.json() || { title: 'PesaApp', body: 'New notification' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-96.png',
      tag: data.tag || 'pesaapp',
      data: data.url ? { url: data.url } : undefined,
      actions: data.actions || [],
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      const existing = clients.find(c => c.url === url);
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    })
  );
});

// ── Background Sync ───────────────────────────────────────────
self.addEventListener('sync', (event: SyncEvent) => {
  if (event.tag === 'sync-bets') {
    event.waitUntil(syncPendingBets());
  }
});

async function syncPendingBets() {
  // Retry any queued bets that failed while offline
  const db = await openDB();
  const pending = await db.getAll('pending-bets');
  for (const bet of pending) {
    try {
      await fetch('/api/v1/games/crash/bet', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(bet) });
      await db.delete('pending-bets', bet.id);
    } catch {}
  }
}

// Simple IndexedDB wrapper
function openDB(): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('pesaapp-offline', 1);
    req.onupgradeneeded = () => { req.result.createObjectStore('pending-bets', { keyPath: 'id' }); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
