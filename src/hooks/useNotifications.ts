import { useState, useEffect, useCallback } from 'react';

const MOTIVATIONAL_MESSAGES = [
  "Rome ne s'est pas faite en un jour, ta mémoire non plus. Viens réviser.",
  "Un petit rappel aujourd'hui, un grand souvenir demain.",
  "Deux minutes de révision valent mieux qu'un oubli total.",
  "Ta mémoire t'attend, elle n'aime pas être mise en pause.",
  "Réviser maintenant, remercier ton futur toi plus tard.",
  "Juste une carte. Promis, après tu peux retourner procrastiner.",
  "Si tu lis ça, tu peux réviser une carte.",
  "Ding ! Ce souvenir aimerait rester vivant.",
];

const getRandomMotivationalMessage = () => {
  const index = Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length);
  return MOTIVATIONAL_MESSAGES[index];
};

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [supported, setSupported] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    const isSupported = 'Notification' in window;
    setSupported(isSupported);
    
    if (isSupported) {
      setPermission(Notification.permission);
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        setSwRegistration(registration);
      }).catch((err) => {
        console.log('Service worker not ready:', err);
      });
    }
  }, []);

  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return null;
    
    try {
      const existingReg = await navigator.serviceWorker.getRegistration('/');
      if (existingReg) {
        setSwRegistration(existingReg);
        return existingReg;
      }
      
      const registration = await navigator.serviceWorker.register('/sw-notifications.js', { scope: '/' });
      await navigator.serviceWorker.ready;
      setSwRegistration(registration);
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
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [supported]);

  const sendNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    if (!supported || permission !== 'granted') return null;
    
    const notificationOptions = {
      icon: '/pwa-192x192.png',
      badge: '/badge-notification.png',
      tag: options?.tag || 'metis-memo-notification',
      requireInteraction: true,
      vibrate: [200, 100, 200],
      body: options?.body || '',
      actions: [
        { action: 'review', title: '📚 Réviser' },
        { action: 'dismiss', title: 'Plus tard' }
      ],
      data: { url: '/?openReview=true' }
    };

    try {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          await registration.showNotification(title, notificationOptions);
          return null;
        } catch (swError) {
          console.log('SW notification failed:', swError);
        }
      }

      if (swRegistration?.active) {
        try {
          await swRegistration.showNotification(title, notificationOptions);
          return null;
        } catch (regError) {
          console.log('Stored registration notification failed:', regError);
        }
      }

      if (navigator.serviceWorker?.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title,
          body: options?.body || ''
        });
        return null;
      }

      const notification = new Notification(title, notificationOptions);
      notification.onclick = () => {
        window.focus();
        window.location.href = '/?openReview=true';
        notification.close();
      };
      return notification;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return null;
    }
  }, [supported, permission, swRegistration]);

  const notifyDueCards = useCallback((dueCount: number) => {
    if (dueCount === 0) return;
    sendNotification('Métis Memo', {
      body: getRandomMotivationalMessage(),
      tag: 'due-cards',
    });
  }, [sendNotification]);

  const scheduleNotification = useCallback((title: string, body: string, scheduledTime: Date) => {
    const delay = scheduledTime.getTime() - Date.now();
    if (delay <= 0) {
      sendNotification(title, { body });
      return null;
    }
    return setTimeout(() => { sendNotification(title, { body }); }, delay);
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
