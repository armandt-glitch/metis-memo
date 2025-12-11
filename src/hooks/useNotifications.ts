import { useState, useEffect, useCallback, useRef } from 'react';

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [supported, setSupported] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const notificationQueue = useRef<{ title: string; body: string }[]>([]);

  useEffect(() => {
    const isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    setSupported(isSupported);
    if (isSupported) {
      setPermission(Notification.permission);
      
      // Try to get existing service worker registration
      navigator.serviceWorker.ready.then((registration) => {
        setSwRegistration(registration);
      }).catch(() => {
        // Service worker not ready yet
      });
    }
  }, []);

  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return null;
    
    try {
      // Register our custom notification service worker
      const registration = await navigator.serviceWorker.register('/sw-notifications.js', {
        scope: '/'
      });
      setSwRegistration(registration);
      console.log('Notification service worker registered');
      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return null;
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!supported) return false;
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
      return false;
    }
  }, [supported]);

  const sendNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    if (!supported || permission !== 'granted') return null;
    
    try {
      // Try to use service worker notification first (works in background)
      if (swRegistration) {
        await swRegistration.showNotification(title, {
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag: 'memo-due-cards',
          ...options,
        } as NotificationOptions);
        return null;
      }
      
      // Fallback to regular notification
      const notification = new Notification(title, {
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        ...options,
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      
      return notification;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification:', error);
      return null;
    }
  }, [supported, permission, swRegistration]);

  const notifyDueCards = useCallback((dueCount: number) => {
    if (dueCount === 0) return;
    
    const message = dueCount === 1 
      ? '1 carte à réviser !' 
      : `${dueCount} cartes à réviser !`;
    
    sendNotification('Memo - Révision', {
      body: message,
      tag: 'due-cards',
    });
  }, [sendNotification]);

  // Schedule a notification for a specific time
  const scheduleNotification = useCallback((title: string, body: string, scheduledTime: Date) => {
    const now = Date.now();
    const delay = scheduledTime.getTime() - now;
    
    if (delay <= 0) {
      // Time has passed, send immediately
      sendNotification(title, { body });
      return null;
    }
    
    // Schedule the notification
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
