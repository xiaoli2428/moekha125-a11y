// Service Worker for Onchainweb
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
});

self.addEventListener('fetch', (event) => {
  // Pass through all requests for now
  event.respondWith(fetch(event.request));
});