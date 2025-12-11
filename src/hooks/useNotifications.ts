import { useState, useEffect, useCallback } from 'react';

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [supported, setSupported] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check if notifications are supported
    const isSupported = 'Notification' in window;
    setSupported(isSupported);
    
    if (isSupported) {
      setPermission(Notification.permission);
    }

    // Try to get the PWA service worker registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        setSwRegistration(registration);
        console.log('Service worker ready for notifications');
      }).catch((err) => {
        console.log('Service worker not ready:', err);
      });
    }
  }, []);

  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      console.log('Service workers not supported');
      return null;
    }
    
    try {
      // First check if there's already an active service worker
      const existingReg = await navigator.serviceWorker.getRegistration('/');
      if (existingReg) {
        console.log('Using existing service worker registration');
        setSwRegistration(existingReg);
        return existingReg;
      }
      
      // Register the notification service worker
      const registration = await navigator.serviceWorker.register('/sw-notifications.js', {
        scope: '/'
      });
      
      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready;
      setSwRegistration(registration);
      console.log('Notification service worker registered successfully');
      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return null;
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!supported) {
      console.log('Notifications not supported on this device');
      return false;
    }
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      console.log('Notification permission result:', result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [supported]);

  const sendNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    if (!supported) {
      console.log('Notifications not supported');
      return null;
    }
    
    if (permission !== 'granted') {
      console.log('Notification permission not granted:', permission);
      return null;
    }
    
    const notificationOptions = {
      icon: '/pwa-192x192.png',
      badge: '/badge-notification.png',
      tag: options?.tag || 'metis-memo-notification',
      requireInteraction: true,
      vibrate: [200, 100, 200],
      body: options?.body || '',
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

    try {
      // Method 1: Try to get service worker registration and show notification
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          await registration.showNotification(title, notificationOptions);
          console.log('Notification sent via service worker ready');
          return null;
        } catch (swError) {
          console.log('SW ready notification failed:', swError);
        }
      }

      // Method 2: Try existing registration
      if (swRegistration?.active) {
        try {
          await swRegistration.showNotification(title, notificationOptions);
          console.log('Notification sent via stored registration');
          return null;
        } catch (regError) {
          console.log('Stored registration notification failed:', regError);
        }
      }

      // Method 3: Try sending message to service worker controller
      if (navigator.serviceWorker?.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title,
          body: options?.body || ''
        });
        console.log('Notification sent via SW message');
        return null;
      }

      // Method 4: Fallback to regular Notification API (desktop only)
      const notification = new Notification(title, notificationOptions);
      notification.onclick = () => {
        window.focus();
        window.location.href = '/?openReview=true';
        notification.close();
      };
      console.log('Notification sent via Notification API');
      return notification;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return null;
    }
  }, [supported, permission, swRegistration]);

  const notifyDueCards = useCallback((dueCount: number) => {
    if (dueCount === 0) return;
    
    const message = dueCount === 1 
      ? '1 carte à réviser !' 
      : `${dueCount} cartes à réviser !`;
    
    sendNotification('Métis Memo - Révision', {
      body: message,
      tag: 'due-cards',
    });
  }, [sendNotification]);

  const scheduleNotification = useCallback((title: string, body: string, scheduledTime: Date) => {
    const now = Date.now();
    const delay = scheduledTime.getTime() - now;
    
    if (delay <= 0) {
      sendNotification(title, { body });
      return null;
    }
    
    const timeoutId = setTimeout(() => {
      sendNotification(title, { body });
    }, delay);
    
    return timeoutId;
  }, [sendNotification]);

  return {
    supported,
    permission,
    swRegistration,
    requestPermission,
    registerServiceWorker,
    sendNotification,
    notifyDueCards,
    scheduleNotification,
  };
};
