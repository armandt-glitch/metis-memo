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
  const urlToOpen = new URL('/', self.location.origin);
  urlToOpen.searchParams.set('openReview', 'true');
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // If a window is already open, focus it and navigate
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url && 'focus' in client) {
            return client.focus().then(function() {
              // Post message to navigate
              client.postMessage({ type: 'NAVIGATE_TO_REVIEW' });
              return client;
            });
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen.toString());
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
