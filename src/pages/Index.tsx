import { useState } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Dashboard } from '@/components/Dashboard';
import { FlashcardForm } from '@/components/FlashcardForm';
import { FlashcardReview } from '@/components/FlashcardReview';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useToast } from '@/hooks/use-toast';
type View = 'hero' | 'dashboard' | 'create' | 'review';
const Index = () => {
  const [view, setView] = useState<View>('hero');
  const {
    flashcards,
    addFlashcard,
    reviewCard,
    deleteCard,
    getDueCards,
    getStats
  } = useFlashcards();
  const {
    toast
  } = useToast();
  const stats = getStats();
  const dueCards = getDueCards();
  const handleCreateFlashcard = (question: string, answer: string, formula: any) => {
    addFlashcard(question, answer, formula);
    toast({
      title: 'Fiche créée !',
      description: 'Votre fiche a été ajoutée avec succès.'
    });
    setView('dashboard');
  };
  const handleGetStarted = () => {
    if (flashcards.length > 0) {
      setView('dashboard');
    } else {
      setView('create');
    }
  };
  return <div className="min-h-screen bg-background border-solid border-0">
      <Header />

      {view === 'hero' && <Hero onGetStarted={handleGetStarted} />}

      {view !== 'hero' && <main className="container mx-auto px-4 py-8">
          {view === 'dashboard' && <Dashboard flashcards={flashcards} stats={stats} onCreateNew={() => setView('create')} onStartReview={() => setView('review')} onDeleteCard={deleteCard} />}

          {view === 'create' && <FlashcardForm onSubmit={handleCreateFlashcard} onBack={() => setView(flashcards.length > 0 ? 'dashboard' : 'hero')} />}

          {view === 'review' && <FlashcardReview cards={dueCards} onReview={reviewCard} onBack={() => setView('dashboard')} />}
        </main>}
    </div>;
};
export default Index;