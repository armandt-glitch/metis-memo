import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Plus, 
  Bell, 
  Calendar, 
  CheckCircle, 
  ArrowRight, 
  X,
  Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface TutorialStep {
  icon: React.ReactNode;
  titleKey: string;
  descriptionKey: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    icon: <Brain className="w-12 h-12 text-primary" />,
    titleKey: 'onboarding.welcome',
    descriptionKey: 'onboarding.welcome.desc',
  },
  {
    icon: <Plus className="w-12 h-12 text-primary" />,
    titleKey: 'onboarding.create',
    descriptionKey: 'onboarding.create.desc',
  },
  {
    icon: <Calendar className="w-12 h-12 text-primary" />,
    titleKey: 'onboarding.spaced',
    descriptionKey: 'onboarding.spaced.desc',
  },
  {
    icon: <Bell className="w-12 h-12 text-primary" />,
    titleKey: 'onboarding.notifications',
    descriptionKey: 'onboarding.notifications.desc',
  },
  {
    icon: <CheckCircle className="w-12 h-12 text-primary" />,
    titleKey: 'onboarding.ready',
    descriptionKey: 'onboarding.ready.desc',
  }
];

const STORAGE_KEY = 'interval-memo-tutorial-completed';

export const OnboardingTutorial = () => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasCompletedTutorial = localStorage.getItem(STORAGE_KEY);
    if (!hasCompletedTutorial) {
      setIsVisible(true);
    }
    const restart = () => {
      setCurrentStep(0);
      setIsVisible(true);
    };
    window.addEventListener('restart-tutorial', restart);
    return () => window.removeEventListener('restart-tutorial', restart);
  }, []);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTutorial();
    }
  };

  const handleSkip = () => {
    completeTutorial();
  };

  const completeTutorial = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-card rounded-3xl shadow-card overflow-hidden">
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={t('onboarding.skip')}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 pt-6">
          {TUTORIAL_STEPS.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentStep 
                  ? "w-6 bg-primary" 
                  : index < currentStep 
                    ? "bg-primary/50" 
                    : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          <div 
            key={currentStep}
            className="animate-scale-in"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
              {step.icon}
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {t(step.titleKey)}
            </h2>
            
            <p className="text-muted-foreground mb-8 leading-relaxed">
              {t(step.descriptionKey)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {!isLastStep && (
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="flex-1"
              >
                {t('onboarding.skip')}
              </Button>
            )}
            <Button
              onClick={handleNext}
              className={cn("flex-1 gap-2", isLastStep && "w-full")}
            >
              {isLastStep ? (
                <>
                  <BookOpen className="w-4 h-4" />
                  {t('onboarding.start')}
                </>
              ) : (
                <>
                  {t('onboarding.next')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
