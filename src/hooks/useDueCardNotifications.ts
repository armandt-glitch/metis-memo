import { useEffect, useRef } from 'react';
import { useNotifications } from './useNotifications';

const CHECK_INTERVAL = 60 * 60 * 1000; // Check every hour

export const useDueCardNotifications = (dueCount: number) => {
  const { permission, notifyDueCards } = useNotifications();
  const lastNotifiedCount = useRef<number>(0);
  const lastNotifiedTime = useRef<number>(0);

  useEffect(() => {
    if (permission !== 'granted') return;
    if (dueCount === 0) return;

    const now = Date.now();
    const timeSinceLastNotification = now - lastNotifiedTime.current;
    
    // Notify if:
    // 1. Due count increased since last notification
    // 2. OR enough time has passed since last notification
    if (
      dueCount > lastNotifiedCount.current ||
      timeSinceLastNotification > CHECK_INTERVAL
    ) {
      notifyDueCards(dueCount);
      lastNotifiedCount.current = dueCount;
      lastNotifiedTime.current = now;
    }
  }, [dueCount, permission, notifyDueCards]);

  // Also set up periodic check when app is in background
  useEffect(() => {
    if (permission !== 'granted') return;

    const interval = setInterval(() => {
      if (dueCount > 0 && document.hidden) {
        notifyDueCards(dueCount);
      }
    }, CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [dueCount, permission, notifyDueCards]);
};
