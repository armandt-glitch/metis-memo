import { useState } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Dashboard } from '@/components/Dashboard';
import { FlashcardForm } from '@/components/FlashcardForm';
import { FlashcardReview } from '@/components/FlashcardReview';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useGroups } from '@/hooks/useGroups';
import { useToast } from '@/hooks/use-toast';
import { useDueCardNotifications } from '@/hooks/useDueCardNotifications';
import { Flashcard } from '@/types/flashcard';
import { EditCardDialog } from '@/components/EditCardDialog';

type View = 'hero' | 'dashboard' | 'create' | 'review' | 'thematic-quiz';

const Index = () => {
  const [view, setView] = useState<View>('hero');
  const [reviewCardId, setReviewCardId] = useState<string | null>(null);
  const [thematicQuizGroupId, setThematicQuizGroupId] = useState<string | null>(null);
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
  } = useFlashcards();
  const { groups, addGroup, deleteGroup, getGroup } = useGroups();
  const { toast } = useToast();
  
  const stats = getStats();
  const dueCards = getDueCards();
  const cardCountsByGroup = getCardCountsByGroup();
  
  // Notify user when cards are due
  useDueCardNotifications(dueCards.length);
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

  const cardsToReview = reviewCardId
    ? flashcards.filter((c) => c.id === reviewCardId)
    : dueCards;

  const thematicQuizCards = thematicQuizGroupId
    ? getThematicQuizCards(thematicQuizGroupId, 10)
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
        </main>
      )}

      <EditCardDialog
        card={editingCard}
        groups={groups}
        onClose={() => setEditingCard(null)}
        onSave={handleSaveCard}
        onCreateGroup={handleCreateGroup}
      />
    </div>
  );
};

export default Index;