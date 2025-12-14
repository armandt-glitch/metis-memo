import { useState, useEffect, useCallback } from 'react';
import { 
  PackManifest, 
  InstalledPack, 
  PackDownloadProgress,
  PackDownloadStatus,
  DEMO_PACKS
} from '@/types/pack';
import { 
  getAllInstalledPacks, 
  saveInstalledPack, 
  deleteInstalledPack as deletePackFromDb,
  isPackInstalled 
} from '@/lib/packDb';
import { generateDemoPackCards, formatFileSize } from '@/lib/packUtils';
import { Flashcard, FormulaType, CardType } from '@/types/flashcard';

const STORAGE_KEY = 'memo-flashcards';

const generateId = () => Math.random().toString(36).substring(2, 9);

export const usePacks = () => {
  const [installedPacks, setInstalledPacks] = useState<InstalledPack[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<Map<string, PackDownloadProgress>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  // Load installed packs on mount
  useEffect(() => {
    loadInstalledPacks();
  }, []);

  const loadInstalledPacks = async () => {
    try {
      const packs = await getAllInstalledPacks();
      setInstalledPacks(packs);
    } catch (error) {
      console.error('Error loading installed packs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailablePacks = useCallback((): PackManifest[] => {
    return DEMO_PACKS;
  }, []);

  const checkIfInstalled = useCallback(async (packId: string): Promise<boolean> => {
    return isPackInstalled(packId);
  }, []);

  const updateProgress = (packId: string, status: PackDownloadStatus, progress: number, error?: string) => {
    setDownloadProgress(prev => {
      const newMap = new Map(prev);
      newMap.set(packId, { packId, status, progress, error });
      return newMap;
    });
  };

  const downloadPack = async (packId: string): Promise<boolean> => {
    const pack = DEMO_PACKS.find(p => p.packId === packId);
    if (!pack) {
      updateProgress(packId, 'error', 0, 'Pack non trouvé');
      return false;
    }

    try {
      // Check if already installed
      const alreadyInstalled = await isPackInstalled(packId);
      if (alreadyInstalled) {
        updateProgress(packId, 'error', 0, 'Ce pack est déjà installé');
        return false;
      }

      // Simulate download progress
      updateProgress(packId, 'downloading', 0);
      
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 200));
        updateProgress(packId, 'downloading', i);
      }

      // Extract cards (simulated)
      updateProgress(packId, 'extracting', 0);
      await new Promise(resolve => setTimeout(resolve, 300));
      updateProgress(packId, 'extracting', 50);
      
      const cards = generateDemoPackCards(packId);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      updateProgress(packId, 'extracting', 100);

      // Import cards into flashcards
      updateProgress(packId, 'importing', 0);
      
      const cardIds: string[] = [];
      const existingCards = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      
      const newFlashcards: Flashcard[] = cards.map((card, index) => {
        const id = generateId();
        cardIds.push(id);
        
        updateProgress(packId, 'importing', Math.round((index / cards.length) * 100));
        
        return {
          id,
          question: card.frontText,
          answer: card.backText,
          formula: 'medium' as FormulaType,
          cardType: 'flashcard' as CardType,
          groupIds: undefined,
          mediaUrl: undefined,
          currentStep: 0,
          createdAt: new Date(),
          nextReviewAt: new Date(),
          completed: false,
        };
      });

      // Save to localStorage
      const allCards = [...existingCards, ...newFlashcards];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allCards));

      // Save pack metadata to IndexedDB
      const installedPack: InstalledPack = {
        packId,
        manifest: pack,
        installedAt: new Date(),
        cardIds,
      };

      await saveInstalledPack(installedPack);
      
      // Update state
      setInstalledPacks(prev => [...prev, installedPack]);
      updateProgress(packId, 'completed', 100);

      return true;
    } catch (error) {
      console.error('Error downloading pack:', error);
      updateProgress(packId, 'error', 0, error instanceof Error ? error.message : 'Erreur inconnue');
      return false;
    }
  };

  const deletePack = async (packId: string): Promise<boolean> => {
    try {
      const pack = installedPacks.find(p => p.packId === packId);
      if (!pack) return false;

      // Remove flashcards from localStorage
      const existingCards = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const filteredCards = existingCards.filter(
        (card: Flashcard) => !pack.cardIds.includes(card.id)
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredCards));

      // Remove from IndexedDB
      await deletePackFromDb(packId);

      // Update state
      setInstalledPacks(prev => prev.filter(p => p.packId !== packId));

      return true;
    } catch (error) {
      console.error('Error deleting pack:', error);
      return false;
    }
  };

  const cancelDownload = (packId: string) => {
    setDownloadProgress(prev => {
      const newMap = new Map(prev);
      newMap.delete(packId);
      return newMap;
    });
  };

  const getProgress = (packId: string): PackDownloadProgress | undefined => {
    return downloadProgress.get(packId);
  };

  const isInstalled = (packId: string): boolean => {
    return installedPacks.some(p => p.packId === packId);
  };

  return {
    installedPacks,
    isLoading,
    getAvailablePacks,
    downloadPack,
    deletePack,
    cancelDownload,
    getProgress,
    isInstalled,
    checkIfInstalled,
    formatFileSize,
  };
};
