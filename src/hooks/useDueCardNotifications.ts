import { useEffect, useRef, useCallback } from 'react';
import { useNotifications } from './useNotifications';
import { Flashcard } from '@/types/flashcard';

const NOTIFICATION_COOLDOWN = 30 * 60 * 1000; // 30 minutes minimum between notifications

interface UseDueCardNotificationsOptions {
  flashcards?: Flashcard[];
}

export const useDueCardNotifications = (
  dueCount: number,
  options?: UseDueCardNotificationsOptions
) => {
  const { permission, notifyDueCards, scheduleNotification, registerServiceWorker } = useNotifications();
  const lastNotifiedTime = useRef<number>(0);
  const scheduledTimeouts = useRef<NodeJS.Timeout[]>([]);

  // Register service worker on mount if permission is granted
  useEffect(() => {
    if (permission === 'granted') {
      registerServiceWorker();
    }
  }, [permission, registerServiceWorker]);

  // Notify when due count changes
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
    
    // Clear existing scheduled notifications
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
    
    // Schedule notifications for each unique time (grouped by hour to avoid too many)
    const scheduledHours = new Set<string>();
    
    upcomingCards.forEach(card => {
      const reviewDate = new Date(card.nextReviewAt);
      const hourKey = `${reviewDate.getFullYear()}-${reviewDate.getMonth()}-${reviewDate.getDate()}-${reviewDate.getHours()}`;
      
      if (!scheduledHours.has(hourKey)) {
        scheduledHours.add(hourKey);
        
        const timeoutId = scheduleNotification(
          'Métis Memo - Révision',
          'Une carte est prête à être révisée !',
          reviewDate
        );
        
        if (timeoutId) {
          scheduledTimeouts.current.push(timeoutId);
        }
      }
    });
  }, [permission, scheduleNotification]);

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
