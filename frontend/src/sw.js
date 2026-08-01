import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, NetworkOnly, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

const APP_SHELL_CACHE = 'app-shell-v1';
const EXAM_API_CACHE = 'exam-api-v1';
const IMAGE_CACHE = 'image-cache-v1';
const FONT_CACHE = 'font-cache-v1';
const BACKGROUND_SYNC_QUEUE = 'submission-queue-v1';

clientsClaim();
self.skipWaiting();

precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

const apiCacheableResponse = new CacheableResponsePlugin({ statuses: [0, 200] });

const submissionSyncPlugin = new BackgroundSyncPlugin(BACKGROUND_SYNC_QUEUE, {
  maxRetentionTime: 24 * 60, // Retry for up to 24 hours
  onSync: async ({ queue }) => {
    const entry = await queue.shiftRequest();
    if (!entry) return;
    try {
      await fetch(entry.request.clone());
    } catch (error) {
      console.error('Background sync request failed:', error);
      await queue.unshiftRequest(entry);
      throw error;
    }
  },
});

function getExamIdFromUrl(url) {
  const match = url.pathname.match(/^\/api\/v1\/exams\/(\d+)(?:\/|$)/);
  return match ? match[1] : null;
}

async function broadcastExamAccess(examId, url) {
  if (!examId) return;

  const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  const message = {
    type: 'EXAM_ACCESSED',
    examId,
    url,
    timestamp: Date.now(),
  };

  await Promise.all(allClients.map((client) => client.postMessage(message)));
}

async function prefetchExamResources(examId) {
  if (!examId) return;

  const cache = await caches.open(EXAM_API_CACHE);
  const urls = [`/api/v1/exams/${examId}`, `/api/v1/exams/${examId}/questions`];

  await Promise.all(
    urls.map(async (path) => {
      try {
        const response = await fetch(path, { credentials: 'same-origin' });
        if (response && response.ok) {
          await cache.put(path, response.clone());
        }
      } catch (error) {
        console.warn(`Prefetch failed for ${path}:`, error);
      }
    })
  );
}

self.addEventListener('message', (event) => {
  const message = event.data;
  if (!message || typeof message !== 'object') return;

  switch (message.type) {
    case 'PREFETCH_EXAM':
      event.waitUntil(prefetchExamResources(message.examId));
      break;
    default:
      break;
  }
});

registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: APP_SHELL_CACHE,
    networkTimeoutSeconds: 3,
    plugins: [
      apiCacheableResponse,
      new ExpirationPlugin({ maxEntries: 50 }),
    ],
  })
);

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: IMAGE_CACHE,
    plugins: [
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }),
      apiCacheableResponse,
    ],
  })
);

registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: FONT_CACHE,
    plugins: [
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 }),
    ],
  })
);

const examStrategy = new NetworkFirst({
  cacheName: EXAM_API_CACHE,
  networkTimeoutSeconds: 10,
  plugins: [
    apiCacheableResponse,
    new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 }),
  ],
});

registerRoute(
  ({ url, request }) =>
    request.method === 'GET' && /^\/api\/v1\/exams(?:\/|$)/.test(url.pathname),
  async ({ event, request, url }) => {
    const response = await examStrategy.handle({ event, request });
    const examId = getExamIdFromUrl(url);
    if (response && response.ok && examId) {
      event.waitUntil(broadcastExamAccess(examId, url.href));
    }
    return response;
  }
);

registerRoute(
  ({ url, request }) =>
    request.method === 'POST' && /^\/api\/v1\/attempts\/(submit-answer|finish)$/.test(url.pathname),
  new NetworkOnly({
    plugins: [submissionSyncPlugin],
  }),
  'POST'
);

registerRoute(
  ({ url, request }) =>
    request.method === 'GET' && /^\/api\/v1\/(questions|results|attempts)(?:\/|$)/.test(url.pathname),
  new NetworkFirst({
    cacheName: 'other-api-cache-v1',
    networkTimeoutSeconds: 10,
    plugins: [
      apiCacheableResponse,
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 }),
    ],
  })
);

self.addEventListener('activate', (event) => {
  event.waitUntil(clientsClaim());
});
