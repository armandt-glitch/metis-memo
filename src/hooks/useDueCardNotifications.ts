import { useEffect, useRef, useCallback } from 'react';
import { useOneSignal } from './useOneSignal';
import { Flashcard } from '@/types/flashcard';

interface UseDueCardNotificationsOptions {
  flashcards?: Flashcard[];
}

export const useDueCardNotifications = (
  dueCount: number,
  options?: UseDueCardNotificationsOptions
) => {
  const { permission } = useOneSignal();
  const lastScheduledHash = useRef<string>('');

  const scheduleUpcomingNotifications = useCallback(async (flashcards: Flashcard[]) => {
    if (permission !== 'granted') return;
    // Local-only notification scheduling - no backend needed without auth
  }, [permission]);

  useEffect(() => {
    if (options?.flashcards) {
      scheduleUpcomingNotifications(options.flashcards);
    }
  }, [options?.flashcards, scheduleUpcomingNotifications]);

  return { scheduleUpcomingNotifications };
};
