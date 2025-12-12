import { useState, useMemo } from 'react';
import { Flashcard, FORMULAS } from '@/types/flashcard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X, RotateCcw, ArrowLeft, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { checkAnswer } from '@/lib/fuzzyMatch';

// Helper to get responsive text size based on content length
const getTextSize = (text: string, isAnswer = false) => {
  const len = text.length;
  if (len > 500) return isAnswer ? 'text-xs md:text-base' : 'text-xs md:text-base';
  if (len > 300) return isAnswer ? 'text-sm md:text-lg' : 'text-sm md:text-lg';
  if (len > 150) return isAnswer ? 'text-base md:text-xl' : 'text-base md:text-xl';
  return isAnswer ? 'text-lg md:text-2xl' : 'text-lg md:text-xl';
};

interface FlashcardReviewProps {
  cards: Flashcard[];
  onReview: (id: string, remembered: boolean) => void;
  onBack: () => void;
  isThematicQuiz?: boolean;
  quizGroupName?: string;
}

export const FlashcardReview = ({ cards, onReview, onBack, isThematicQuiz, quizGroupName }: FlashcardReviewProps) => {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [writtenAnswer, setWrittenAnswer] = useState('');
  const [showWrittenResult, setShowWrittenResult] = useState(false);

  // Ensure currentIndex is within bounds
  const safeIndex = Math.min(currentIndex, Math.max(0, cards.length - 1));
  const currentCard = cards[safeIndex];

  const getFormulaName = (type: string) => {
    return t(`formula.${type}`);
  };

  if (cards.length === 0 || !currentCard) {
    return (
      <div className="max-w-lg mx-auto text-center animate-slide-up">
        <div className="bg-card rounded-3xl p-12 shadow-card">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {t('review.all.done')}
          </h2>
          <p className="text-muted-foreground mb-8">
            {t('review.no.cards')}
          </p>
          <Button variant="hero-outline" size="lg" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
            {t('review.back.dashboard')}
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
  
  // Use fuzzy matching for answer validation
  const answerResult = useMemo(() => {
    return checkAnswer(writtenAnswer, currentCard.answer);
  }, [writtenAnswer, currentCard.answer]);
  
  const isWrittenCorrectCheck = answerResult.isCorrect;

  const renderCardContent = () => {
    // For written, image, audio types - all need written answer
    if (needsWrittenAnswer) {
      return (
        <div
          key={currentCard.id}
          className="perspective-1000 h-full"
        >
          <div
            className={cn(
              'relative w-full h-full transition-transform duration-500 preserve-3d',
              showWrittenResult && 'rotate-y-180'
            )}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front - Question */}
            <div
              className="h-full bg-card rounded-3xl shadow-card p-6 md:p-8 flex flex-col items-center justify-center"
              style={{ backfaceVisibility: 'hidden' }}
            >
              {currentCard.mediaUrl && currentCard.cardType === 'image' && (
                <img 
                  src={currentCard.mediaUrl} 
                  alt="Question" 
                  className="max-w-[90%] max-h-[25vh] md:max-h-[35vh] w-auto h-auto object-contain rounded-xl mb-3 md:mb-4 flex-shrink" 
                />
              )}
              {currentCard.mediaUrl && currentCard.cardType === 'audio' && (
                <div className="mb-3 md:mb-4 w-full max-w-xs flex-shrink-0">
                  <div className="flex items-center gap-3 bg-secondary rounded-xl p-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Volume2 className="w-5 h-5 text-primary" />
                    </div>
                    <audio controls src={currentCard.mediaUrl} className="flex-1 h-8" />
                  </div>
                </div>
              )}
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex-shrink-0">
                {t('review.question')}
              </p>
              <p className={cn(
                "font-medium text-foreground text-center mb-4 px-2",
                getTextSize(currentCard.question)
              )}>
                {currentCard.question}
              </p>
              <Input
                value={writtenAnswer}
                onChange={(e) => setWrittenAnswer(e.target.value)}
                placeholder={t('review.type.answer')}
                className="mb-3 max-w-xs flex-shrink-0"
                onKeyDown={(e) => e.key === 'Enter' && handleWrittenSubmit()}
              />
              <Button onClick={handleWrittenSubmit} className="w-full max-w-xs flex-shrink-0">
                {t('review.validate')}
              </Button>
            </div>

            {/* Back - Answer */}
            <div
              className="absolute inset-0 bg-card-answer rounded-3xl shadow-card p-6 md:p-8 flex flex-col items-center justify-center"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <p className="text-xs uppercase tracking-wider text-white/70 mb-2 md:mb-4 flex-shrink-0">
                {t('review.answer')}
              </p>
              <p className={cn(
                "font-bold text-white text-center mb-4 md:mb-6 px-2",
                getTextSize(currentCard.answer, true)
              )}>
                {currentCard.answer}
              </p>
              
              {/* User answer feedback */}
              <div className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl flex-shrink-0 max-w-full',
                isWrittenCorrectCheck ? 'bg-green-500/20' : 'bg-white/20'
              )}>
                {isWrittenCorrectCheck ? (
                  <Check className="w-5 h-5 text-white flex-shrink-0" />
                ) : (
                  <X className="w-5 h-5 text-red-300 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-xs text-white/70">
                    {t('review.your.answer')}
                    {isWrittenCorrectCheck && !answerResult.isPerfect && (
                      <span className="ml-2 text-yellow-300">
                        ({t('review.accepted.with.errors')})
                      </span>
                    )}
                  </p>
                  <p className={cn(
                    'font-medium truncate',
                    isWrittenCorrectCheck ? 'text-white' : 'text-red-200'
                  )}>
                    {writtenAnswer || t('review.empty')}
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
        className="perspective-1000 cursor-pointer h-full"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={cn(
            'relative w-full h-full min-h-[250px] transition-transform duration-500 preserve-3d',
            isFlipped && 'rotate-y-180'
          )}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-card rounded-3xl shadow-card p-6 md:p-8 flex flex-col items-center justify-center"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 md:mb-4 flex-shrink-0">
              {t('review.question')}
            </p>
            <p className={cn(
              "font-medium text-foreground text-center px-2",
              getTextSize(currentCard.question)
            )}>
              {currentCard.question}
            </p>
            <p className="text-sm text-muted-foreground mt-4 md:mt-6 flex-shrink-0">
              {t('review.click.reveal')}
            </p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 bg-card-answer rounded-3xl shadow-card p-6 md:p-8 flex flex-col items-center justify-center"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <p className="text-xs uppercase tracking-wider text-white/70 mb-2 md:mb-4 flex-shrink-0">
              {t('review.answer')}
            </p>
            <p className={cn(
              "font-medium text-white text-center px-2",
              getTextSize(currentCard.answer, true)
            )}>
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
              {t('review.to.review')}
            </Button>
            <Button
              variant="default"
              size="lg"
              className="flex-1"
              onClick={() => handleAnswer(true)}
            >
              <Check className="w-5 h-5" />
              {isWrittenCorrectCheck ? t('review.correct') : t('review.i.knew')}
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
            {t('review.to.review')}
          </Button>
          <Button
            variant="default"
            size="lg"
            className="flex-1"
            onClick={() => handleAnswer(true)}
          >
            <Check className="w-5 h-5" />
            {t('review.i.know')}
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
        {t('review.flip')}
      </Button>
    );
  };

  return (
    <div className="max-w-lg mx-auto animate-slide-up h-[100dvh] flex flex-col py-4 md:py-0 md:h-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 flex-shrink-0"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('review.back')}
      </button>

      {/* Progress bar */}
      <div className="mb-4 flex-shrink-0">
        {isThematicQuiz && quizGroupName && (
          <p className="text-accent font-semibold mb-2 text-center">
            {t('review.thematic')} : {quizGroupName}
          </p>
        )}
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>{t('review.card')} {safeIndex + 1} {t('review.of')} {cards.length}</span>
          <span>{isThematicQuiz ? t('review.quiz') : getFormulaName(currentCard.formula)}</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card content - fixed height on mobile, auto on desktop */}
      <div className="flex-1 min-h-0 overflow-hidden md:flex-none md:min-h-[300px]">
        {renderCardContent()}
      </div>
      
      {/* Actions - fixed at bottom */}
      <div className="flex-shrink-0 mt-4">
        {renderActions()}
      </div>
    </div>
  );
};
