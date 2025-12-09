import { useState } from 'react';
import { Flashcard, FORMULAS } from '@/types/flashcard';
import { Button } from '@/components/ui/button';
import { Check, X, RotateCcw, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlashcardReviewProps {
  cards: Flashcard[];
  onReview: (id: string, remembered: boolean) => void;
  onBack: () => void;
}

export const FlashcardReview = ({ cards, onReview, onBack }: FlashcardReviewProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (cards.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center animate-slide-up">
        <div className="bg-card rounded-3xl p-12 shadow-card">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Tout est à jour !
          </h2>
          <p className="text-muted-foreground mb-8">
            Vous n'avez aucune fiche à réviser pour le moment.
          </p>
          <Button variant="hero-outline" size="lg" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const formula = FORMULAS[currentCard.formula];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  const handleAnswer = (remembered: boolean) => {
    onReview(currentCard.id, remembered);
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onBack();
    }
  };

  return (
    <div className="max-w-lg mx-auto animate-slide-up">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Fiche {currentIndex + 1} sur {cards.length}</span>
          <span>{formula.name}</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div
        className="perspective-1000 cursor-pointer mb-8"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={cn(
            'relative w-full aspect-[4/3] transition-transform duration-500 preserve-3d',
            isFlipped && 'rotate-y-180'
          )}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front */}
          <div
            className={cn(
              'absolute inset-0 bg-card rounded-3xl shadow-card p-8 flex flex-col items-center justify-center backface-hidden'
            )}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
              Question
            </p>
            <p className="text-xl font-medium text-foreground text-center">
              {currentCard.question}
            </p>
            <p className="text-sm text-muted-foreground mt-6">
              Cliquez pour voir la réponse
            </p>
          </div>

          {/* Back */}
          <div
            className={cn(
              'absolute inset-0 bg-primary rounded-3xl shadow-card p-8 flex flex-col items-center justify-center'
            )}
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <p className="text-xs uppercase tracking-wider text-primary-foreground/70 mb-4">
              Réponse
            </p>
            <p className="text-xl font-medium text-primary-foreground text-center">
              {currentCard.answer}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      {isFlipped && (
        <div className="flex gap-4 animate-slide-up">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => handleAnswer(false)}
          >
            <X className="w-5 h-5" />
            À revoir
          </Button>
          <Button
            variant="default"
            size="lg"
            className="flex-1"
            onClick={() => handleAnswer(true)}
          >
            <Check className="w-5 h-5" />
            Je sais
          </Button>
        </div>
      )}

      {!isFlipped && (
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={() => setIsFlipped(true)}
        >
          <RotateCcw className="w-5 h-5" />
          Retourner la carte
        </Button>
      )}
    </div>
  );
};
