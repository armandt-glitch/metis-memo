import { useState } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Dashboard } from '@/components/Dashboard';
import { FlashcardForm } from '@/components/FlashcardForm';
import { FlashcardReview } from '@/components/FlashcardReview';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useGroups } from '@/hooks/useGroups';
import { useToast } from '@/hooks/use-toast';

type View = 'hero' | 'dashboard' | 'create' | 'review';

const Index = () => {
  const [view, setView] = useState<View>('hero');
  const [reviewCardId, setReviewCardId] = useState<string | null>(null);
  const {
    flashcards,
    addFlashcard,
    reviewCard,
    deleteCard,
    getDueCards,
    getStats,
    getCardCountsByGroup,
    removeGroupFromCards,
  } = useFlashcards();
  const { groups, addGroup, deleteGroup, getGroup } = useGroups();
  const { toast } = useToast();
  
  const stats = getStats();
  const dueCards = getDueCards();
  const cardCountsByGroup = getCardCountsByGroup();

  const handleCreateFlashcard = (
    question: string,
    answer: string,
    formula: any,
    cardType: any,
    mediaUrl?: string,
    groupId?: string
  ) => {
    addFlashcard(question, answer, formula, cardType, mediaUrl, groupId);
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

  const cardsToReview = reviewCardId
    ? flashcards.filter((c) => c.id === reviewCardId)
    : dueCards;

  return (
    <div className="min-h-screen bg-background border-solid border-0">
      <Header />

      {view === 'hero' && <Hero onGetStarted={handleGetStarted} />}

      {view !== 'hero' && (
        <main className="container mx-auto px-4 py-8">
          {view === 'dashboard' && (
            <Dashboard
              flashcards={flashcards}
              stats={stats}
              groups={groups}
              cardCountsByGroup={cardCountsByGroup}
              onCreateNew={() => setView('create')}
              onStartReview={handleStartReview}
              onReviewCard={handleReviewCard}
              onDeleteCard={deleteCard}
              onDeleteGroup={handleDeleteGroup}
              getGroup={getGroup}
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
        </main>
      )}
    </div>
  );
};

export default Index;
