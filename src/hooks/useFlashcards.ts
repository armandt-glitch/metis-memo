import { useState, useEffect } from 'react';
import { Flashcard, FormulaType, CardType, FORMULAS } from '@/types/flashcard';

const STORAGE_KEY = 'memo-flashcards';

const generateId = () => Math.random().toString(36).substring(2, 9);

const calculateNextReview = (formula: FormulaType, step: number): Date => {
  const schedule = FORMULAS[formula].schedule;
  if (step >= schedule.length) {
    return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year later
  }
  const intervalMinutes = schedule[step].interval;
  return new Date(Date.now() + intervalMinutes * 60 * 1000);
};

export const useFlashcards = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored).map((card: any) => ({
        ...card,
        cardType: card.cardType || 'flashcard', // Migration for old cards
        // Migration: convert old groupId to groupIds array
        groupIds: card.groupIds || (card.groupId ? [card.groupId] : undefined),
        createdAt: new Date(card.createdAt),
        nextReviewAt: new Date(card.nextReviewAt),
      }));
      setFlashcards(parsed);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(flashcards));
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded. Consider removing some cards with media.');
      }
    }
  }, [flashcards]);

  const clearAllCards = () => {
    setFlashcards([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const addFlashcard = (question: string, answer: string, formula: FormulaType, cardType: CardType = 'flashcard', mediaUrl?: string, groupIds?: string[]) => {
    const newCard: Flashcard = {
      id: generateId(),
      question,
      answer,
      formula,
      cardType,
      groupIds: groupIds && groupIds.length > 0 ? groupIds : undefined,
      mediaUrl,
      currentStep: 0,
      createdAt: new Date(),
      nextReviewAt: calculateNextReview(formula, 0),
      completed: false,
    };
    setFlashcards((prev) => [...prev, newCard]);
    return newCard;
  };

  const getCardsByGroup = (groupId?: string | null) => {
    if (groupId === null) return flashcards;
    if (groupId === 'ungrouped') return flashcards.filter((c) => !c.groupIds || c.groupIds.length === 0);
    return flashcards.filter((c) => c.groupIds?.includes(groupId as string));
  };

  const getCardCountsByGroup = () => {
    const counts: Record<string, number> = {};
    // Only count non-completed cards to match what's displayed in "Prochaines révisions"
    flashcards.filter(c => !c.completed).forEach((card) => {
      if (!card.groupIds || card.groupIds.length === 0) {
        counts['ungrouped'] = (counts['ungrouped'] || 0) + 1;
      } else {
        card.groupIds.forEach((gId) => {
          counts[gId] = (counts[gId] || 0) + 1;
        });
      }
    });
    return counts;
  };

  const removeGroupFromCards = (groupId: string) => {
    setFlashcards((prev) =>
      prev.map((card) => {
        if (!card.groupIds?.includes(groupId)) return card;
        const newGroupIds = card.groupIds.filter((id) => id !== groupId);
        return { ...card, groupIds: newGroupIds.length > 0 ? newGroupIds : undefined };
      })
    );
  };

  const reviewCard = (id: string, remembered: boolean) => {
    setFlashcards((prev) =>
      prev.map((card) => {
        if (card.id !== id) return card;
        
        if (!remembered) {
          // Reset to step 0
          return {
            ...card,
            currentStep: 0,
            nextReviewAt: calculateNextReview(card.formula, 0),
          };
        }

        const nextStep = card.currentStep + 1;
        const schedule = FORMULAS[card.formula].schedule;
        const isCompleted = nextStep >= schedule.length;

        return {
          ...card,
          currentStep: nextStep,
          nextReviewAt: calculateNextReview(card.formula, nextStep),
          completed: isCompleted,
        };
      })
    );
  };

  const deleteCard = (id: string) => {
    setFlashcards((prev) => prev.filter((card) => card.id !== id));
  };

  const reopenCard = (id: string) => {
    setFlashcards((prev) =>
      prev.map((card) => {
        if (card.id !== id) return card;
        return {
          ...card,
          currentStep: 0,
          nextReviewAt: calculateNextReview(card.formula, 0),
          completed: false,
        };
      })
    );
  };

  const getThematicQuizCards = (groupId: string, count: number = 10) => {
    const groupCards = groupId === 'ungrouped'
      ? flashcards.filter((c) => !c.groupIds || c.groupIds.length === 0)
      : flashcards.filter((c) => c.groupIds?.includes(groupId));
    
    // Shuffle and take up to count cards
    const shuffled = [...groupCards].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  const toggleCardGroup = (cardId: string, groupId: string) => {
    setFlashcards((prev) =>
      prev.map((card) => {
        if (card.id !== cardId) return card;
        const currentGroups = card.groupIds || [];
        const newGroups = currentGroups.includes(groupId)
          ? currentGroups.filter((id) => id !== groupId)
          : [...currentGroups, groupId];
        return { ...card, groupIds: newGroups.length > 0 ? newGroups : undefined };
      })
    );
  };

  const clearCardGroups = (cardId: string) => {
    setFlashcards((prev) =>
      prev.map((card) =>
        card.id === cardId ? { ...card, groupIds: undefined } : card
      )
    );
  };

  const getDueCards = () => {
    const now = new Date();
    return flashcards.filter(
      (card) => !card.completed && new Date(card.nextReviewAt) <= now
    );
  };

  const getUpcomingReviews = () => {
    return flashcards
      .filter((card) => !card.completed)
      .sort((a, b) => new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime());
  };

  const getStats = () => {
    const total = flashcards.length;
    const completed = flashcards.filter((c) => c.completed).length;
    const dueNow = getDueCards().length;
    return { total, completed, dueNow };
  };

  return {
    flashcards,
    addFlashcard,
    reviewCard,
    deleteCard,
    reopenCard,
    clearAllCards,
    getDueCards,
    getUpcomingReviews,
    getStats,
    getCardsByGroup,
    getCardCountsByGroup,
    removeGroupFromCards,
    getThematicQuizCards,
    toggleCardGroup,
    clearCardGroups,
  };
};
