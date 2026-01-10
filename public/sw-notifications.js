// Service Worker for push notifications
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Métis Memo - Révision';
  const options = {
    body: data.body || 'Vous avez des cartes à réviser !',
    icon: '/pwa-192x192.png',
    badge: '/badge-notification.png',
    tag: 'memo-due-cards',
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'review',
        title: '📚 Réviser'
      },
      {
        action: 'dismiss',
        title: 'Plus tard'
      }
    ],
    data: {
      url: '/?openReview=true'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const action = event.action;
  
  // If user clicked "Plus tard", just close
  if (action === 'dismiss') {
    return;
  }
  
  // For "review" action or clicking the notification body, open review
  const urlToOpen = new URL('/?openReview=true', self.location.origin);
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(windowClients) {
        // Look for an existing app window
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin)) {
            // Found existing window - send message to navigate and focus
            client.postMessage({ type: 'NAVIGATE_TO_REVIEW' });
            return client.focus();
          }
        }
        // No existing window - open a new one
        return clients.openWindow(urlToOpen.href);
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
      badge: '/badge-notification.png',
      tag: 'memo-due-cards',
      renotify: true,
      requireInteraction: true,
      vibrate: [200, 100, 200],
      actions: [
        {
          action: 'review',
          title: '📚 Réviser'
        },
        {
          action: 'dismiss',
          title: 'Plus tard'
        }
      ],
      data: {
        url: '/?openReview=true'
      }
    });
  }
});
