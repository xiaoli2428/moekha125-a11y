/// <reference lib="webworker" />

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare let self: ServiceWorkerGlobalScope;

// Precache all build assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache API price/market data with stale-while-revalidate
registerRoute(
    ({ url }) => url.pathname.startsWith('/api/market') || url.pathname.startsWith('/api/price'),
    new StaleWhileRevalidate({
        cacheName: 'api-market-cache',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 60 // 1 minute
            })
        ]
    })
);

// Cache profile/auth with shorter TTL
registerRoute(
    ({ url }) => url.pathname.startsWith('/api/auth') || url.pathname.startsWith('/api/profile'),
    new StaleWhileRevalidate({
        cacheName: 'api-auth-cache',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 20,
                maxAgeSeconds: 300 // 5 minutes
            })
        ]
    })
);

// Cache images with CacheFirst strategy
registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
        cacheName: 'images-cache',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
            })
        ]
    })
);

// Cache static assets
registerRoute(
    ({ request }) => request.destination === 'style' || request.destination === 'script' || request.destination === 'font',
    new CacheFirst({
        cacheName: 'static-cache',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 60,
                maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
            })
        ]
    })
);

console.log('Service Worker loaded with Workbox strategies');
