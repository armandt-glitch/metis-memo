import { useState, useEffect, useCallback } from 'react';

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const isSupported = 'Notification' in window;
    setSupported(isSupported);
    if (isSupported) {
      setPermission(Notification.permission);
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

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!supported || permission !== 'granted') return null;
    
    try {
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
  }, [supported, permission]);

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

  return {
    supported,
    permission,
    requestPermission,
    sendNotification,
    notifyDueCards,
  };
};
