// Custom service worker extension
// This file adds custom behavior to the auto-generated service worker

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    // When user clicks "Update Now", activate the new service worker immediately
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  // Take control of all clients immediately
  event.waitUntil(self.clients.claim());
});
