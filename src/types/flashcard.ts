export type FormulaType = 'short' | 'medium' | 'long';

export interface ReviewSchedule {
  interval: number; // in minutes
  label: string;
}

export const FORMULAS: Record<FormulaType, { name: string; description: string; schedule: ReviewSchedule[] }> = {
  short: {
    name: 'Court terme',
    description: 'Idéal pour les examens proches',
    schedule: [
      { interval: 10, label: '10 minutes' },
      { interval: 24 * 60, label: '1 jour' },
      { interval: 3 * 24 * 60, label: '3 jours' },
    ],
  },
  medium: {
    name: 'Moyen terme',
    description: 'Parfait pour un apprentissage durable comme un concours',
    schedule: [
      { interval: 10, label: '10 minutes' },
      { interval: 24 * 60, label: '1 jour' },
      { interval: 7 * 24 * 60, label: '7 jours' },
      { interval: 21 * 24 * 60, label: '21 jours' },
    ],
  },
  long: {
    name: 'Long terme',
    description: 'Pour une mémorisation permanente',
    schedule: [
      { interval: 10, label: '10 minutes' },
      { interval: 24 * 60, label: '1 jour' },
      { interval: 7 * 24 * 60, label: '7 jours' },
      { interval: 30 * 24 * 60, label: '30 jours' },
      { interval: 90 * 24 * 60, label: '90 jours' },
    ],
  },
};

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  formula: FormulaType;
  currentStep: number;
  createdAt: Date;
  nextReviewAt: Date;
  completed: boolean;
}
