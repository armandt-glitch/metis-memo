import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Dashboard } from '@/components/Dashboard';
import { FlashcardForm } from '@/components/FlashcardForm';
import { FlashcardReview } from '@/components/FlashcardReview';
import { PackReview } from '@/components/PackReview';
import { PacksPage } from '@/components/packs/PacksPage';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useGroups } from '@/hooks/useGroups';
import { usePacks } from '@/hooks/usePacks';
import { PackSettings, InstalledPack } from '@/types/pack';
import { useToast } from '@/hooks/use-toast';
import { useDueCardNotifications } from '@/hooks/useDueCardNotifications';
import { Flashcard } from '@/types/flashcard';
import { EditCardDialog } from '@/components/EditCardDialog';
import { PackConfigDialog } from '@/components/PackConfigDialog';
import { NotificationPermissionPrompt } from '@/components/NotificationPermissionPrompt';
import { OnboardingTutorial } from '@/components/OnboardingTutorial';
import { getPackCardsForReview } from '@/lib/packUtils';

type View = 'hero' | 'dashboard' | 'create' | 'review' | 'thematic-quiz' | 'packs' | 'pack-review';

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Check if user has visited before to skip hero page
  const getInitialView = (): View => {
    const hasVisited = localStorage.getItem('interval-memo-first-visit-done');
    return hasVisited ? 'dashboard' : 'hero';
  };
  
  const [view, setView] = useState<View>(getInitialView);
  const [reviewCardId, setReviewCardId] = useState<string | null>(null);
  const [thematicQuizGroupId, setThematicQuizGroupId] = useState<string | null>(null);
  const [reviewingPackId, setReviewingPackId] = useState<string | null>(null);
  const [configuringPack, setConfiguringPack] = useState<InstalledPack | null>(null);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const {
    flashcards,
    addFlashcard,
    updateCard,
    reviewCard,
    deleteCard,
    reopenCard,
    getDueCards,
    getStats,
    getCardCountsByGroup,
    removeGroupFromCards,
    getThematicQuizCards,
    toggleCardGroup,
    clearCardGroups,
    reloadFromStorage,
  } = useFlashcards();
  const { groups, addGroup, deleteGroup, getGroup } = useGroups();
  const { installedPacks, deletePack, updatePackSettings } = usePacks();
  const { toast } = useToast();
  
  const stats = getStats();
  const dueCards = getDueCards();
  const cardCountsByGroup = getCardCountsByGroup();
  
  // Notify user when cards are due
  useDueCardNotifications(dueCards.length, { flashcards });

  // Handle notification click - open review when openReview param is present
  useEffect(() => {
    if (searchParams.get('openReview') === 'true') {
      // Always go to review view when clicking notification
      // If no due cards, it will show empty state in FlashcardReview
      setView('review');
      // Clear the param from URL
      searchParams.delete('openReview');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Listen for service worker messages to navigate to review
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NAVIGATE_TO_REVIEW') {
        // Always navigate to review when clicking notification
        setView('review');
        window.focus();
      }
    };
    
    navigator.serviceWorker?.addEventListener('message', handleMessage);
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, []);

  // Listen for "show-hero" event to display the intro page again
  useEffect(() => {
    const handler = () => {
      localStorage.removeItem('interval-memo-first-visit-done');
      setView('hero');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('show-hero', handler);
    return () => window.removeEventListener('show-hero', handler);
  }, []);

  const handleCreateFlashcard = (
    question: string,
    answer: string,
    formula: any,
    cardType: any,
    mediaUrl?: string,
    groupIds?: string[]
  ) => {
    addFlashcard(question, answer, formula, cardType, mediaUrl, groupIds);
    toast({
      title: 'Fiche créée !',
      description: 'Votre fiche a été ajoutée avec succès.',
    });
    setView('dashboard');
  };


  const handleCreateGroup = (name: string, color: string) => {
    addGroup(name, color);
    toast({
      title: 'Groupe créé !',
      description: `Le groupe "${name}" a été créé.`,
    });
  };

  const handleDeleteGroup = (id: string) => {
    const group = getGroup(id);
    removeGroupFromCards(id);
    deleteGroup(id);
    toast({
      title: 'Groupe supprimé',
      description: group ? `Le groupe "${group.name}" a été supprimé.` : 'Le groupe a été supprimé.',
    });
  };

  const handleGetStarted = () => {
    if (flashcards.length > 0) {
      setView('dashboard');
    } else {
      setView('create');
    }
  };

  const handleReviewCard = (id: string) => {
    setReviewCardId(id);
    setView('review');
  };

  const handleStartReview = () => {
    setReviewCardId(null);
    setView('review');
  };

  const handleReopenCard = (id: string) => {
    reopenCard(id);
    toast({
      title: 'Fiche réouverte !',
      description: 'La fiche est de nouveau disponible pour révision.',
    });
  };

  const handleStartThematicQuiz = (groupId: string) => {
    setThematicQuizGroupId(groupId);
    setView('thematic-quiz');
  };

  const handleEditCard = (card: Flashcard) => {
    setEditingCard(card);
  };

  const handleSaveCard = (id: string, updates: Partial<Flashcard>) => {
    updateCard(id, updates);
    setEditingCard(null);
    toast({
      title: 'Fiche modifiée !',
      description: 'Les modifications ont été enregistrées.',
    });
  };

  const handleStartPackReview = (packId: string) => {
    setReviewingPackId(packId);
    setView('pack-review');
  };

  const handleDeletePack = async (packId: string) => {
    await deletePack(packId);
    reloadFromStorage();
    toast({
      title: 'Pack supprimé',
      description: 'Le pack et ses fiches ont été supprimés.',
    });
  };

  const handleReopenPack = (packId: string) => {
    const pack = installedPacks.find(p => p.packId === packId);
    if (pack) {
      pack.cardIds.forEach(cardId => reopenCard(cardId));
      toast({
        title: 'Pack réouvert',
        description: 'Toutes les fiches du pack sont à nouveau disponibles.',
      });
    }
  };

  const handleConfigurePack = (packId: string) => {
    const pack = installedPacks.find(p => p.packId === packId);
    if (pack) {
      setConfiguringPack(pack);
    }
  };

  const handleSavePackSettings = async (packId: string, settings: PackSettings) => {
    const success = await updatePackSettings(packId, settings);
    if (success) {
      reloadFromStorage();
      toast({
        title: 'Configuration enregistrée',
        description: 'Les paramètres du pack ont été mis à jour.',
      });
    }
  };

  const cardsToReview = reviewCardId
    ? flashcards.filter((c) => c.id === reviewCardId)
    : dueCards;

  const thematicQuizCards = thematicQuizGroupId
    ? getThematicQuizCards(thematicQuizGroupId)
    : [];

  const packReviewCards = reviewingPackId
    ? getPackCardsForReview(installedPacks.find(p => p.packId === reviewingPackId)!, flashcards)
    : [];

  return (
    <div className="min-h-screen bg-background border-solid border-0">
      <Header dueCount={dueCards.length} />

      {view === 'hero' && <Hero onGetStarted={handleGetStarted} />}

      {view !== 'hero' && (
        <main className="container mx-auto px-4 py-8">
          {view === 'dashboard' && (
            <Dashboard
              flashcards={flashcards}
              stats={stats}
              groups={groups}
              cardCountsByGroup={cardCountsByGroup}
              installedPacks={installedPacks}
              onCreateNew={() => setView('create')}
              onStartReview={handleStartReview}
              onReviewCard={handleReviewCard}
              onDeleteCard={deleteCard}
              onDeleteGroup={handleDeleteGroup}
              onReopenCard={handleReopenCard}
              onStartThematicQuiz={handleStartThematicQuiz}
              onToggleCardGroup={toggleCardGroup}
              onClearCardGroups={clearCardGroups}
              onCreateGroup={handleCreateGroup}
              onEditCard={handleEditCard}
              getGroup={getGroup}
              onOpenPacks={() => setView('packs')}
              onStartPackReview={handleStartPackReview}
              onDeletePack={handleDeletePack}
              onReopenPack={handleReopenPack}
              onConfigurePack={handleConfigurePack}
            />
          )}

          {view === 'packs' && (
            <PacksPage 
              onBack={() => {
                reloadFromStorage();
                setView('dashboard');
              }}
              existingFlashcards={flashcards}
            />
          )}

          {view === 'create' && (
            <FlashcardForm
              onSubmit={handleCreateFlashcard}
              onBack={() => setView(flashcards.length > 0 ? 'dashboard' : 'hero')}
              groups={groups}
              onCreateGroup={handleCreateGroup}
            />
          )}

          {view === 'review' && (
            <FlashcardReview
              cards={cardsToReview}
              onReview={reviewCard}
              onBack={() => {
                setReviewCardId(null);
                setView('dashboard');
              }}
            />
          )}

          {view === 'thematic-quiz' && (
            <FlashcardReview
              cards={thematicQuizCards}
              onReview={reviewCard}
              onBack={() => {
                setThematicQuizGroupId(null);
                setView('dashboard');
              }}
              isThematicQuiz
              quizGroupName={thematicQuizGroupId ? getGroup(thematicQuizGroupId)?.name : undefined}
            />
          )}

          {view === 'pack-review' && reviewingPackId && (
            <PackReview
              cards={packReviewCards}
              packName={installedPacks.find(p => p.packId === reviewingPackId)?.manifest.title || 'Pack'}
              onReview={reviewCard}
              onBack={() => {
                setReviewingPackId(null);
                setView('dashboard');
              }}
            />
          )}
        </main>
      )}

      <EditCardDialog
        card={editingCard}
        groups={groups}
        onClose={() => setEditingCard(null)}
        onSave={handleSaveCard}
        onCreateGroup={handleCreateGroup}
      />

      <PackConfigDialog
        pack={configuringPack}
        isOpen={!!configuringPack}
        onClose={() => setConfiguringPack(null)}
        onSave={handleSavePackSettings}
      />
      
      <NotificationPermissionPrompt />
      <OnboardingTutorial />
    </div>
  );
};

export default Index;