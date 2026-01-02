import { useState, useMemo, useCallback } from 'react';
import { Flashcard, FORMULAS } from '@/types/flashcard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X, RotateCcw, ArrowLeft, Volume2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { checkAnswer } from '@/lib/fuzzyMatch';
import { ImageLightbox } from './ImageLightbox';

const getTextSize = (text: string, isAnswer = false) => {
  const len = text.length;
  if (len > 500) return isAnswer ? 'text-xs md:text-base' : 'text-xs md:text-base';
  if (len > 300) return isAnswer ? 'text-sm md:text-lg' : 'text-sm md:text-lg';
  if (len > 150) return isAnswer ? 'text-base md:text-xl' : 'text-base md:text-xl';
  return isAnswer ? 'text-lg md:text-2xl' : 'text-lg md:text-xl';
};

interface PackReviewProps {
  cards: Flashcard[];
  packName: string;
  onReview: (id: string, remembered: boolean) => void;
  onBack: () => void;
}

export const PackReview = ({ cards, packName, onReview, onBack }: PackReviewProps) => {
  const { t } = useLanguage();
  
  // Cards to review in current round
  const [currentRoundCards, setCurrentRoundCards] = useState<Flashcard[]>(cards);
  // Cards that were marked as "don't know" - need to be reviewed again
  const [failedCards, setFailedCards] = useState<Flashcard[]>([]);
  // Track which cards have been validated in this session
  const [validatedCardIds, setValidatedCardIds] = useState<Set<string>>(new Set());
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [writtenAnswer, setWrittenAnswer] = useState('');
  const [showWrittenResult, setShowWrittenResult] = useState(false);
  const [isReviewingFailed, setIsReviewingFailed] = useState(false);

  const activeCards = isReviewingFailed ? failedCards : currentRoundCards;
  const safeIndex = Math.min(currentIndex, Math.max(0, activeCards.length - 1));
  const currentCard = activeCards[safeIndex];

  const getFormulaName = (type: string) => {
    return t(`formula.${type}`);
  };

  const startFailedCardsReview = useCallback(() => {
    setCurrentRoundCards([]);
    setIsReviewingFailed(true);
    setCurrentIndex(0);
    setIsFlipped(false);
    setWrittenAnswer('');
    setShowWrittenResult(false);
  }, []);

  const handleAnswer = useCallback((remembered: boolean) => {
    if (!currentCard) return;

    if (remembered) {
      // Card validated - mark it and call onReview
      setValidatedCardIds(prev => new Set(prev).add(currentCard.id));
      onReview(currentCard.id, true);
      
      // Remove from failed cards if we're reviewing them
      if (isReviewingFailed) {
        setFailedCards(prev => prev.filter(c => c.id !== currentCard.id));
      }
    } else {
      // Card not remembered - add to failed cards for re-review
      if (!isReviewingFailed) {
        setFailedCards(prev => {
          // Avoid duplicates
          if (prev.find(c => c.id === currentCard.id)) return prev;
          return [...prev, currentCard];
        });
      }
      // Don't call onReview yet - we'll review it again
    }

    setIsFlipped(false);
    setWrittenAnswer('');
    setShowWrittenResult(false);

    if (safeIndex < activeCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // End of current round
      if (isReviewingFailed) {
        // Check if there are still failed cards
        const remainingFailed = failedCards.filter(c => c.id !== currentCard.id || !remembered);
        if (remainingFailed.length > 0 && remembered) {
          // Continue with remaining failed cards
          setCurrentIndex(0);
        } else if (remainingFailed.length === 0 || (remainingFailed.length === 0 && remembered)) {
          // All failed cards validated - session complete
          onBack();
        }
      } else {
        // End of main round
        if (failedCards.length > 0 || !remembered) {
          // There are failed cards to review
          const updatedFailedCards = !remembered && !failedCards.find(c => c.id === currentCard.id)
            ? [...failedCards, currentCard]
            : failedCards;
          
          if (updatedFailedCards.length > 0) {
            setFailedCards(updatedFailedCards);
            startFailedCardsReview();
          } else {
            onBack();
          }
        } else {
          // All cards validated on first try
          onBack();
        }
      }
    }
  }, [currentCard, safeIndex, activeCards.length, isReviewingFailed, failedCards, onReview, onBack, startFailedCardsReview]);

  const handleWrittenSubmit = () => {
    setShowWrittenResult(true);
  };

  if (activeCards.length === 0 || !currentCard) {
    // Check if we need to start reviewing failed cards
    if (failedCards.length > 0 && !isReviewingFailed) {
      startFailedCardsReview();
      return null;
    }
    
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

  const totalCards = cards.length;
  const validatedCount = validatedCardIds.size;
  const progress = (validatedCount / totalCards) * 100;

  const needsWrittenAnswer = currentCard.cardType === 'written' || currentCard.cardType === 'image' || currentCard.cardType === 'audio';
  
  const answerResult = useMemo(() => {
    return checkAnswer(writtenAnswer, currentCard.answer);
  }, [writtenAnswer, currentCard.answer]);
  
  const isWrittenCorrectCheck = answerResult.isCorrect;

  const renderCardContent = () => {
    if (needsWrittenAnswer) {
      return (
        <div key={currentCard.id}>
          {!showWrittenResult ? (
            <div className="bg-card rounded-3xl shadow-card p-6 md:p-8 flex flex-col items-center justify-center animate-fade-in">
              {currentCard.mediaUrl && currentCard.cardType === 'image' && (
                <ImageLightbox 
                  src={currentCard.mediaUrl} 
                  alt="Question" 
                  className="max-w-[90%] max-h-[25vh] md:max-h-[35vh] w-auto h-auto object-contain rounded-xl mb-3 md:mb-4" 
                />
              )}
              {currentCard.mediaUrl && currentCard.cardType === 'audio' && (
                <div className="mb-3 md:mb-4 w-full max-w-xs">
                  <div className="flex items-center gap-3 bg-secondary rounded-xl p-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Volume2 className="w-5 h-5 text-primary" />
                    </div>
                    <audio controls src={currentCard.mediaUrl} className="flex-1 h-8" />
                  </div>
                </div>
              )}
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                {t('review.question')}
              </p>
              <p className={cn(
                "font-medium text-foreground text-center mb-4 px-2 whitespace-normal break-words",
                getTextSize(currentCard.question)
              )}>
                {currentCard.question}
              </p>
              <Input
                value={writtenAnswer}
                onChange={(e) => setWrittenAnswer(e.target.value)}
                placeholder={t('review.type.answer')}
                className="mb-3 max-w-xs"
                onKeyDown={(e) => e.key === 'Enter' && handleWrittenSubmit()}
              />
              <Button onClick={handleWrittenSubmit} className="w-full max-w-xs">
                {t('review.validate')}
              </Button>
            </div>
          ) : (
            <div className={cn(
              "rounded-3xl shadow-card p-6 md:p-8 flex flex-col items-center animate-fade-in",
              isWrittenCorrectCheck ? "bg-answer-correct" : "bg-answer-wrong"
            )}>
              <p className="text-xs uppercase tracking-wider text-white/70 mb-2 md:mb-4">
                {t('review.answer')}
              </p>
              <p 
                className={cn(
                  "font-bold text-white text-center mb-4 md:mb-6 px-2",
                  getTextSize(currentCard.answer, true)
                )}
                style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
              >
                {currentCard.answer}
              </p>
              
              <div className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl max-w-full',
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
                  <p 
                    className={cn(
                      'font-medium',
                      isWrittenCorrectCheck ? 'text-white' : 'text-red-200'
                    )}
                    style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                  >
                    {writtenAnswer || t('review.empty')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        key={currentCard.id}
        className="cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {!isFlipped ? (
          <div className="bg-card rounded-3xl shadow-card p-6 md:p-8 flex flex-col items-center justify-center animate-fade-in">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 md:mb-4">
              {t('review.question')}
            </p>
            <p className={cn(
              "font-medium text-foreground text-center px-2 whitespace-normal break-words",
              getTextSize(currentCard.question)
            )}>
              {currentCard.question}
            </p>
            <p className="text-sm text-muted-foreground mt-4 md:mt-6">
              {t('review.click.reveal')}
            </p>
          </div>
        ) : (
          <div className="bg-card-answer rounded-3xl shadow-card p-6 md:p-8 flex flex-col items-center animate-fade-in min-h-[200px] max-h-[60vh]">
            <p className="text-xs uppercase tracking-wider text-white/70 mb-2 md:mb-4 flex-shrink-0">
              {t('review.answer')}
            </p>
            <div className="flex-1 overflow-y-auto w-full flex items-center justify-center">
              <p 
                className={cn(
                  "font-medium text-white text-center w-full px-2",
                  getTextSize(currentCard.answer, true)
                )}
                style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
              >
                {currentCard.answer}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderActions = () => {
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
    <div className="max-w-lg mx-auto animate-slide-up py-4 md:py-0">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('review.back')}
      </button>

      <div className="mb-4">
        <p className="text-accent font-semibold mb-2 text-center">
          {packName}
        </p>
        
        {isReviewingFailed && (
          <div className="flex items-center justify-center gap-2 text-amber-500 mb-2">
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm font-medium">
              {t('review.retry.failed') || `Révision des fiches à revoir (${failedCards.length})`}
            </span>
          </div>
        )}
        
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>{t('review.card')} {safeIndex + 1} {t('review.of')} {activeCards.length}</span>
          <span>{validatedCount}/{totalCards} {t('review.validated') || 'validées'}</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div>
        {renderCardContent()}
      </div>
      
      <div className="flex-shrink-0 mt-4">
        {renderActions()}
      </div>
    </div>
  );
};
