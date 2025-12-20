// public/sw.js - Service Worker désactivé pour éviter les erreurs
self.addEventListener('install', event => {
    console.log('Service Worker installé');
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('Service Worker activé');
    event.waitUntil(clients.claim());
});

// Ne plus intercepter les requêtes pour éviter les erreurs
self.addEventListener('fetch', event => {
    // Laisser toutes les requêtes passer normalement sans interception
    return;
});
