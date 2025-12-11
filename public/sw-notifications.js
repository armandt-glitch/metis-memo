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
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // If a window is already open, focus it and navigate
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if ('focus' in client) {
            return client.focus().then(function(focusedClient) {
              // Navigate to review page
              if (focusedClient && 'navigate' in focusedClient) {
                return focusedClient.navigate(urlToOpen);
              } else {
                // Post message to navigate
                focusedClient.postMessage({ type: 'NAVIGATE_TO_REVIEW' });
              }
              return focusedClient;
            });
          }
        }
        // Otherwise open a new window
        return clients.openWindow(urlToOpen);
      })
      .catch(function(error) {
        console.error('Error handling notification click:', error);
        // Fallback: just open a new window
        return clients.openWindow(urlToOpen);
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
