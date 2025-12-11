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
  const urlToOpen = self.location.origin + '/?openReview=true';
  
  // Always try to open a new window on mobile - most reliable method
  event.waitUntil(
    clients.openWindow(urlToOpen)
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
