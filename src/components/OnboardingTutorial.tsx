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

interface TutorialStep {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    icon: <Brain className="w-12 h-12 text-primary" />,
    title: "Bienvenue sur Métis Memo !",
    description: "Une application de révision par répétition espacée pour mémoriser efficacement vos connaissances."
  },
  {
    icon: <Plus className="w-12 h-12 text-primary" />,
    title: "Créez vos fiches",
    description: "Ajoutez des fiches avec questions et réponses. Vous pouvez aussi ajouter des images ou de l'audio !"
  },
  {
    icon: <Calendar className="w-12 h-12 text-primary" />,
    title: "Répétition espacée",
    description: "L'application planifie automatiquement vos révisions selon des intervalles optimisés pour la mémorisation."
  },
  {
    icon: <Bell className="w-12 h-12 text-primary" />,
    title: "Notifications",
    description: "Activez les notifications pour ne jamais manquer une session de révision !"
  },
  {
    icon: <CheckCircle className="w-12 h-12 text-primary" />,
    title: "Prêt à commencer !",
    description: "Créez votre première fiche et commencez à mémoriser efficacement."
  }
];

const STORAGE_KEY = 'interval-memo-tutorial-completed';

export const OnboardingTutorial = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasCompletedTutorial = localStorage.getItem(STORAGE_KEY);
    if (!hasCompletedTutorial) {
      setIsVisible(true);
    }
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
          aria-label="Passer le tutoriel"
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
              {step.title}
            </h2>
            
            <p className="text-muted-foreground mb-8 leading-relaxed">
              {step.description}
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
                Passer
              </Button>
            )}
            <Button
              onClick={handleNext}
              className={cn("flex-1 gap-2", isLastStep && "w-full")}
            >
              {isLastStep ? (
                <>
                  <BookOpen className="w-4 h-4" />
                  Commencer
                </>
              ) : (
                <>
                  Suivant
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
