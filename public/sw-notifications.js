// Service Worker for push notifications
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Métis Memo - Révision';
  const options = {
    body: data.body || 'Vous avez des cartes à réviser !',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: 'memo-due-cards',
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: {
      url: self.registration.scope
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // If a window is already open, focus it
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.registration.scope) && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data?.url || '/');
        }
      })
  );
});

// Handle messages from the main thread
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body } = event.data;
    self.registration.showNotification(title, {
      body: body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: 'memo-due-cards',
      renotify: true,
      requireInteraction: true,
      vibrate: [200, 100, 200],
      data: {
        url: self.registration.scope
      }
    });
  }
});

