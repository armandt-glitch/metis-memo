import { useEffect, useRef, useCallback } from 'react';
import { useNotifications } from './useNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { Flashcard } from '@/types/flashcard';

const NOTIFICATION_COOLDOWN = 30 * 60 * 1000; // 30 minutes minimum between notifications

interface UseDueCardNotificationsOptions {
  flashcards?: Flashcard[];
}

export const useDueCardNotifications = (
  dueCount: number,
  options?: UseDueCardNotificationsOptions
) => {
  const { 
    permission, 
    notifyDueCards, 
    scheduleNotification, 
    scheduleNotificationsBackend,
    registerServiceWorker 
  } = useNotifications();
  const { user } = useAuth();
  const lastNotifiedTime = useRef<number>(0);
  const scheduledTimeouts = useRef<NodeJS.Timeout[]>([]);
  const lastScheduledHash = useRef<string>('');

  // Register service worker on mount if permission is granted
  useEffect(() => {
    if (permission === 'granted') {
      registerServiceWorker();
    }
  }, [permission, registerServiceWorker]);

  // Notify when due count changes (local notification)
  useEffect(() => {
    if (permission !== 'granted') return;
    if (dueCount === 0) return;

    const now = Date.now();
    const timeSinceLastNotification = now - lastNotifiedTime.current;
    
    // Only notify if enough time has passed since last notification
    if (timeSinceLastNotification > NOTIFICATION_COOLDOWN) {
      notifyDueCards(dueCount);
      lastNotifiedTime.current = now;
    }
  }, [dueCount, permission, notifyDueCards]);

  // Schedule notifications for upcoming cards
  const scheduleUpcomingNotifications = useCallback((flashcards: Flashcard[]) => {
    if (permission !== 'granted') return;
    
    // Clear existing scheduled notifications (local)
    scheduledTimeouts.current.forEach(clearTimeout);
    scheduledTimeouts.current = [];
    
    const now = new Date();
    const maxScheduleTime = 24 * 60 * 60 * 1000; // 24 hours ahead max
    
    // Get cards that will be due soon
    const upcomingCards = flashcards.filter(card => {
      if (card.completed) return false;
      const reviewTime = new Date(card.nextReviewAt).getTime();
      const timeDiff = reviewTime - now.getTime();
      return timeDiff > 0 && timeDiff <= maxScheduleTime;
    });
    
    // Group by hour to avoid too many notifications
    const scheduledHours = new Map<string, { date: Date; count: number }>();
    
    upcomingCards.forEach(card => {
      const reviewDate = new Date(card.nextReviewAt);
      const hourKey = `${reviewDate.getFullYear()}-${reviewDate.getMonth()}-${reviewDate.getDate()}-${reviewDate.getHours()}`;
      
      const existing = scheduledHours.get(hourKey);
      if (existing) {
        existing.count++;
      } else {
        scheduledHours.set(hourKey, { date: reviewDate, count: 1 });
      }
    });

    // If user is authenticated, send to backend
    if (user) {
      const notifications = Array.from(scheduledHours.values()).map(({ date, count }) => ({
        scheduled_at: date.toISOString(),
        card_count: count,
      }));
      
      // Create a hash to avoid redundant API calls
      const hash = JSON.stringify(notifications.map(n => n.scheduled_at).sort());
      if (hash !== lastScheduledHash.current) {
        lastScheduledHash.current = hash;
        scheduleNotificationsBackend(notifications);
      }
    } else {
      // Fallback to local scheduling for non-authenticated users (shouldn't happen with mandatory auth)
      scheduledHours.forEach(({ date }) => {
        const timeoutId = scheduleNotification(
          'Métis Memo - Révision',
          'Une carte est prête à être révisée !',
          date
        );
        
        if (timeoutId) {
          scheduledTimeouts.current.push(timeoutId);
        }
      });
    }
  }, [permission, user, scheduleNotification, scheduleNotificationsBackend]);

  // Schedule notifications when flashcards change
  useEffect(() => {
    if (options?.flashcards) {
      scheduleUpcomingNotifications(options.flashcards);
    }
    
    return () => {
      // Clean up scheduled timeouts
      scheduledTimeouts.current.forEach(clearTimeout);
    };
  }, [options?.flashcards, scheduleUpcomingNotifications]);

  // Also check periodically when app is in background
  useEffect(() => {
    if (permission !== 'granted') return;

    const checkInterval = setInterval(() => {
      if (dueCount > 0 && document.hidden) {
        const now = Date.now();
        const timeSinceLastNotification = now - lastNotifiedTime.current;
        
        if (timeSinceLastNotification > NOTIFICATION_COOLDOWN) {
          notifyDueCards(dueCount);
          lastNotifiedTime.current = now;
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(checkInterval);
  }, [dueCount, permission, notifyDueCards]);

  return {
    scheduleUpcomingNotifications,
  };
};
