import { useState } from 'react';
import { Flashcard, FORMULAS } from '@/types/flashcard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X, RotateCcw, ArrowLeft, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlashcardReviewProps {
  cards: Flashcard[];
  onReview: (id: string, remembered: boolean) => void;
  onBack: () => void;
}

export const FlashcardReview = ({ cards, onReview, onBack }: FlashcardReviewProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [writtenAnswer, setWrittenAnswer] = useState('');
  const [showWrittenResult, setShowWrittenResult] = useState(false);

  // Ensure currentIndex is within bounds
  const safeIndex = Math.min(currentIndex, Math.max(0, cards.length - 1));
  const currentCard = cards[safeIndex];

  if (cards.length === 0 || !currentCard) {
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

  const formula = FORMULAS[currentCard.formula];
  const progress = ((safeIndex + 1) / cards.length) * 100;

  const handleAnswer = (remembered: boolean) => {
    onReview(currentCard.id, remembered);
    setIsFlipped(false);
    setWrittenAnswer('');
    setShowWrittenResult(false);
    if (safeIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onBack();
    }
  };

  const handleWrittenSubmit = () => {
    setShowWrittenResult(true);
  };

  

  const needsWrittenAnswer = currentCard.cardType === 'written' || currentCard.cardType === 'image' || currentCard.cardType === 'audio';
  const isWrittenCorrectCheck = writtenAnswer.trim().toLowerCase() === currentCard.answer.trim().toLowerCase();

  const renderCardContent = () => {
    // For written, image, audio types - all need written answer
    if (needsWrittenAnswer) {
      return (
        <div
          key={currentCard.id}
          className="perspective-1000 mb-8"
        >
          <div
            className={cn(
              'relative w-full min-h-[300px] transition-transform duration-500 preserve-3d',
              showWrittenResult && 'rotate-y-180'
            )}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front - Question */}
            <div
              className="absolute inset-0 bg-card rounded-3xl shadow-card p-8 flex flex-col items-center justify-center"
              style={{ backfaceVisibility: 'hidden' }}
            >
              {currentCard.mediaUrl && currentCard.cardType === 'image' && (
                <img src={currentCard.mediaUrl} alt="Question" className="w-full h-48 object-contain rounded-xl mb-4" />
              )}
              {currentCard.mediaUrl && currentCard.cardType === 'audio' && (
                <div className="mb-4 w-full">
                  <div className="flex items-center gap-4 bg-secondary rounded-xl p-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Volume2 className="w-6 h-6 text-primary" />
                    </div>
                    <audio controls src={currentCard.mediaUrl} className="flex-1" />
                  </div>
                </div>
              )}
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
                Question
              </p>
              <p className="text-xl font-medium text-foreground text-center mb-6">
                {currentCard.question}
              </p>
              <Input
                value={writtenAnswer}
                onChange={(e) => setWrittenAnswer(e.target.value)}
                placeholder="Tapez votre réponse..."
                className="mb-4 max-w-xs"
                onKeyDown={(e) => e.key === 'Enter' && handleWrittenSubmit()}
              />
              <Button onClick={handleWrittenSubmit} className="w-full max-w-xs">
                Valider
              </Button>
            </div>

            {/* Back - Answer */}
            <div
              className="absolute inset-0 bg-card-answer rounded-3xl shadow-card p-8 flex flex-col items-center justify-center"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <p className="text-xs uppercase tracking-wider text-white/70 mb-4">
                Réponse
              </p>
              <p className="text-2xl font-bold text-white text-center mb-6">
                {currentCard.answer}
              </p>
              
              {/* User answer feedback */}
              <div className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl',
                isWrittenCorrectCheck ? 'bg-green-500/20' : 'bg-white/20'
              )}>
                {isWrittenCorrectCheck ? (
                  <Check className="w-5 h-5 text-green-300" />
                ) : (
                  <X className="w-5 h-5 text-red-300" />
                )}
                <div>
                  <p className="text-xs text-white/70">Votre réponse</p>
                  <p className={cn(
                    'font-medium',
                    isWrittenCorrectCheck ? 'text-green-200' : 'text-red-200'
                  )}>
                    {writtenAnswer || '(vide)'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Standard flashcard - click to flip
    return (
      <div
        key={currentCard.id}
        className="perspective-1000 cursor-pointer mb-8"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={cn(
            'relative w-full min-h-[300px] transition-transform duration-500 preserve-3d',
            isFlipped && 'rotate-y-180'
          )}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-card rounded-3xl shadow-card p-8 flex flex-col items-center justify-center"
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
            className="absolute inset-0 bg-card-answer rounded-3xl shadow-card p-8 flex flex-col items-center justify-center"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <p className="text-xs uppercase tracking-wider text-white/70 mb-4">
              Réponse
            </p>
            <p className="text-xl font-medium text-white text-center">
              {currentCard.answer}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderActions = () => {
    // For written, image, audio types
    if (needsWrittenAnswer) {
      if (showWrittenResult) {
        return (
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
              {isWrittenCorrectCheck ? 'Correct !' : 'Je savais'}
            </Button>
          </div>
        );
      }
      return null;
    }

    // Standard flashcard
    if (isFlipped) {
      return (
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
      );
    }

    return (
      <Button
        variant="secondary"
        size="lg"
        className="w-full"
        onClick={() => setIsFlipped(true)}
      >
        <RotateCcw className="w-5 h-5" />
        Retourner la carte
      </Button>
    );
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
          <span>Fiche {safeIndex + 1} sur {cards.length}</span>
          <span>{formula.name}</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {renderCardContent()}
      {renderActions()}
    </div>
  );
};
