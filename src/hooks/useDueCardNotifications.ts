import { useEffect, useRef, useCallback } from 'react';
import { useOneSignal } from './useOneSignal';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Flashcard } from '@/types/flashcard';

interface UseDueCardNotificationsOptions {
  flashcards?: Flashcard[];
}

export const useDueCardNotifications = (
  dueCount: number,
  options?: UseDueCardNotificationsOptions
) => {
  const { permission } = useOneSignal();
  const { user } = useAuth();
  const lastScheduledHash = useRef<string>('');

  // Schedule notifications for upcoming cards via backend
  const scheduleUpcomingNotifications = useCallback(async (flashcards: Flashcard[]) => {
    if (permission !== 'granted' || !user) return;
    
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

    // Schedule notifications via backend (for OneSignal scheduled notifications)
    const notifications = Array.from(scheduledHours.values()).map(({ date, count }) => ({
      scheduled_at: date.toISOString(),
      card_count: count,
    }));
    
    // Create a hash to avoid redundant API calls
    const hash = JSON.stringify(notifications.map(n => n.scheduled_at).sort());
    if (hash !== lastScheduledHash.current && notifications.length > 0) {
      lastScheduledHash.current = hash;
      
      try {
        const { error } = await supabase.functions.invoke('schedule-notifications', {
          body: { notifications },
        });
        
        if (error) {
          console.error('Failed to schedule notifications:', error);
        } else {
          console.log(`Scheduled ${notifications.length} notifications via backend`);
        }
      } catch (error) {
        console.error('Error scheduling notifications:', error);
      }
    }
  }, [permission, user]);

  // Schedule notifications when flashcards change
  useEffect(() => {
    if (options?.flashcards) {
      scheduleUpcomingNotifications(options.flashcards);
    }
  }, [options?.flashcards, scheduleUpcomingNotifications]);

  return {
    scheduleUpcomingNotifications,
  };
};
