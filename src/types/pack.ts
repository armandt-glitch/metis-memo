export interface PackManifest {
  packId: string;
  title: string;
  description: string;
  version: string;
  language: string;
  tags: string[];
  cardCount: number;
  theme?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  createdAt: string;
  updatedAt: string;
  checksum?: string;
  size?: number; // in bytes
  isNew?: boolean;
  rating?: number;
  author?: string;
  previewCards?: PackCard[];
}

export interface PackCard {
  id: string;
  frontText: string;
  backText: string;
  fields?: Record<string, string>;
  imagePath?: string;
  audioPath?: string;
  hints?: string[];
}

export interface PackSettings {
  cardType: 'flashcard' | 'written';
  formula: 'test' | 'short' | 'medium' | 'long';
}

export interface InstalledPack {
  packId: string;
  manifest: PackManifest;
  installedAt: Date;
  cardIds: string[]; // IDs des fiches importées dans l'app
  hasMedia?: boolean; // True if pack has images or audio
  settings?: PackSettings;
}

export type PackDownloadStatus = 
  | 'idle'
  | 'downloading'
  | 'extracting'
  | 'importing'
  | 'completed'
  | 'error';

export interface PackDownloadProgress {
  packId: string;
  status: PackDownloadStatus;
  progress: number; // 0-100
  error?: string;
}

// Demo packs data
export const DEMO_PACKS: PackManifest[] = [
  {
    packId: 'capitals-europe',
    title: 'Capitales d\'Europe',
    description: 'Apprenez les capitales de tous les pays européens avec des images et des indices.',
    version: '1.0.0',
    language: 'fr',
    tags: ['géographie', 'europe', 'capitales'],
    theme: 'Géographie',
    level: 'beginner',
    cardCount: 15,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
    size: 2500000, // ~2.5MB
    isNew: true,
    rating: 4.8,
    author: 'Métis Memo',
    previewCards: [
      { id: '1', frontText: 'Quelle est la capitale de la France ?', backText: 'Paris' },
      { id: '2', frontText: 'Quelle est la capitale de l\'Allemagne ?', backText: 'Berlin' },
      { id: '3', frontText: 'Quelle est la capitale de l\'Italie ?', backText: 'Rome' },
      { id: '4', frontText: 'Quelle est la capitale de l\'Espagne ?', backText: 'Madrid' },
      { id: '5', frontText: 'Quelle est la capitale du Portugal ?', backText: 'Lisbonne' },
    ]
  },
  {
    packId: 'english-verbs-irregular',
    title: 'Verbes irréguliers anglais',
    description: 'Les 100 verbes irréguliers les plus courants en anglais avec audio.',
    version: '1.0.0',
    language: 'fr',
    tags: ['anglais', 'grammaire', 'verbes'],
    theme: 'Langues',
    level: 'intermediate',
    cardCount: 25,
    createdAt: '2024-02-01',
    updatedAt: '2024-02-15',
    size: 5000000, // ~5MB
    isNew: false,
    rating: 4.5,
    author: 'Métis Memo',
    previewCards: [
      { id: '1', frontText: 'be (infinitif)', backText: 'was/were - been (être)' },
      { id: '2', frontText: 'begin (infinitif)', backText: 'began - begun (commencer)' },
      { id: '3', frontText: 'break (infinitif)', backText: 'broke - broken (casser)' },
      { id: '4', frontText: 'bring (infinitif)', backText: 'brought - brought (apporter)' },
      { id: '5', frontText: 'buy (infinitif)', backText: 'bought - bought (acheter)' },
    ]
  },
  {
    packId: 'anatomy-basics',
    title: 'Anatomie - Les bases',
    description: 'Découvrez les principaux organes et systèmes du corps humain.',
    version: '1.0.0',
    language: 'fr',
    tags: ['médecine', 'anatomie', 'biologie'],
    theme: 'Sciences',
    level: 'beginner',
    cardCount: 20,
    createdAt: '2024-03-01',
    updatedAt: '2024-03-10',
    size: 8000000, // ~8MB
    isNew: true,
    rating: 4.9,
    author: 'Métis Memo',
    previewCards: [
      { id: '1', frontText: 'Quel organe pompe le sang dans le corps ?', backText: 'Le cœur' },
      { id: '2', frontText: 'Quel est le plus grand organe du corps humain ?', backText: 'La peau' },
      { id: '3', frontText: 'Combien d\'os composent le squelette humain adulte ?', backText: '206 os' },
      { id: '4', frontText: 'Quel organe filtre le sang et produit l\'urine ?', backText: 'Les reins' },
      { id: '5', frontText: 'Quel est l\'organe principal de la respiration ?', backText: 'Les poumons' },
    ]
  },
];
