import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  const [pushSubscription, setPushSubscription] = useState<PushSubscription | null>(null);
  const { user, session } = useAuth();

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

  // Subscribe to push notifications and register with backend
  const subscribeToPush = useCallback(async () => {
    if (!user || !session) {
      console.log('User not authenticated, cannot subscribe to push');
      return null;
    }

    if (!swRegistration) {
      console.log('No service worker registration');
      return null;
    }

    try {
      // Get existing subscription or create new one
      let subscription = await swRegistration.pushManager.getSubscription();
      
      if (!subscription) {
        // For now, we'll use a placeholder VAPID key
        // In production, this should come from environment/backend
        const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
        
        subscription = await swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidPublicKey,
        });
      }

      setPushSubscription(subscription);

      // Send subscription to backend
      const subscriptionJson = subscription.toJSON();
      
      const { data, error } = await supabase.functions.invoke('register-push', {
        body: {
          endpoint: subscriptionJson.endpoint,
          p256dh: subscriptionJson.keys?.p256dh,
          auth: subscriptionJson.keys?.auth,
        },
      });

      if (error) {
        console.error('Error registering push subscription:', error);
        return null;
      }

      console.log('Push subscription registered with backend');
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      return null;
    }
  }, [user, session, swRegistration]);

  const requestPermission = useCallback(async () => {
    if (!supported) {
      console.log('Notifications not supported on this device');
      return false;
    }
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      console.log('Notification permission result:', result);
      
      // If granted and user is logged in, subscribe to push
      if (result === 'granted' && user) {
        await subscribeToPush();
      }
      
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [supported, user, subscribeToPush]);

  // Auto-subscribe when permission is granted and user logs in
  useEffect(() => {
    if (permission === 'granted' && user && swRegistration && !pushSubscription) {
      subscribeToPush();
    }
  }, [permission, user, swRegistration, pushSubscription, subscribeToPush]);

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
    
    const motivationalMessage = getRandomMotivationalMessage();
    
    sendNotification('Métis Memo', {
      body: motivationalMessage,
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

  // Schedule notifications on backend
  const scheduleNotificationsBackend = useCallback(async (notifications: { scheduled_at: string; card_count: number }[]) => {
    if (!user || !session) {
      console.log('User not authenticated, cannot schedule notifications on backend');
      return false;
    }

    try {
      const { error } = await supabase.functions.invoke('schedule-notifications', {
        body: { notifications },
      });

      if (error) {
        console.error('Error scheduling notifications:', error);
        return false;
      }

      console.log(`Scheduled ${notifications.length} notifications on backend`);
      return true;
    } catch (error) {
      console.error('Error scheduling notifications:', error);
      return false;
    }
  }, [user, session]);

  return {
    supported,
    permission,
    swRegistration,
    pushSubscription,
    requestPermission,
    registerServiceWorker,
    subscribeToPush,
    sendNotification,
    notifyDueCards,
    scheduleNotification,
    scheduleNotificationsBackend,
  };
};
