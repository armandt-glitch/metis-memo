export type FormulaType = 'test' | 'short' | 'medium' | 'long';
export type CardType = 'flashcard' | 'written' | 'image' | 'audio' | 'graph' | 'memo';

export interface ReviewSchedule {
  interval: number; // in minutes
  label: string;
}

export const FORMULAS: Record<FormulaType, { name: string; description: string; schedule: ReviewSchedule[] }> = {
  test: {
    name: 'Test',
    description: 'Rappel immédiat pour tester rapidement',
    schedule: [
      { interval: 0, label: 'Immédiat' },
    ],
  },
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

export const CARD_TYPES: Record<CardType, { name: string; description: string; icon: string }> = {
  flashcard: {
    name: 'Flashcard',
    description: 'Carte classique à retourner',
    icon: 'RotateCcw',
  },
  written: {
    name: 'Réponse écrite',
    description: 'Tapez la réponse pour valider',
    icon: 'PenLine',
  },
  image: {
    name: 'Image',
    description: 'Question basée sur une image',
    icon: 'Image',
  },
  audio: {
    name: 'Audio',
    description: 'Question basée sur un fichier audio',
    icon: 'Volume2',
  },
  graph: {
    name: 'Graphique',
    description: 'Représentation graphique d\'une fonction',
    icon: 'LineChart',
  },
  memo: {
    name: 'Fiche de révision',
    description: 'Fiche avec texte, image ou son',
    icon: 'StickyNote',
  },
};

export interface Group {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export const GROUP_COLORS = [
  { name: 'Rouge', value: '#780000' },
  { name: 'Bleu', value: '#1e40af' },
  { name: 'Vert', value: '#166534' },
  { name: 'Violet', value: '#6b21a8' },
  { name: 'Orange', value: '#c2410c' },
  { name: 'Rose', value: '#be185d' },
  { name: 'Cyan', value: '#0891b2' },
  { name: 'Gris', value: '#4b5563' },
];

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  formula: FormulaType;
  cardType: CardType;
  groupIds?: string[];
  mediaUrl?: string; // URL for image or audio
  currentStep: number;
  createdAt: Date;
  nextReviewAt: Date;
  completed: boolean;
}
