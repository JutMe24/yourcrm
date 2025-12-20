// Service Worker pour les notifications push
self.addEventListener('push', function(event) {
    console.log('[Service Worker] Push reçu');
    
    let notificationData = {};
    try {
        notificationData = event.data ? event.data.json() : {};
    } catch (e) {
        notificationData = { title: 'Rappel GPA', body: event.data?.text() || 'Nouveau rappel' };
    }

    const options = {
        body: notificationData.body || 'Nouveau rappel',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        vibrate: [200, 100, 200, 100, 200, 100, 200],
        data: notificationData.data || {},
        requireInteraction: true,
        tag: notificationData.tag || 'rappel-notification',
        renotify: true
    };

    console.log('[Service Worker] Affichage de la notification', options);

    event.waitUntil(
        self.registration.showNotification(
            notificationData.title || 'Rappel GPA Assurance',
            options
        )
    );
});

// Gestion de l'installation du Service Worker
self.addEventListener('install', function(event) {
    console.log('[Service Worker] Installation en cours');
    self.skipWaiting(); // Force le nouveau service worker à s'activer immédiatement
});

// Gestion de l'activation du Service Worker
self.addEventListener('activate', function(event) {
    console.log('[Service Worker] Activation');
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    return caches.delete(cacheName);
                })
            );
        }).then(function() {
            return self.clients.claim();
        })
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({type: 'window'}).then(function(clientList) {
            for (const client of clientList) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});
