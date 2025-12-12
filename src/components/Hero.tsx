import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Sparkles, Clock, CheckCircle, Layers, LayoutDashboard } from 'lucide-react';
import logo from '@/assets/logo.png';
import { InstallPWA } from '@/components/InstallPWA';

const FIRST_VISIT_KEY = 'interval-memo-first-visit-done';

interface HeroProps {
  onGetStarted: () => void;
}

export const Hero = ({ onGetStarted }: HeroProps) => {
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  useEffect(() => {
    const hasVisited = localStorage.getItem(FIRST_VISIT_KEY);
    if (hasVisited) {
      setIsFirstVisit(false);
    }
  }, []);

  const handleGetStarted = () => {
    localStorage.setItem(FIRST_VISIT_KEY, 'true');
    onGetStarted();
  };
  return (
    <div className="relative overflow-hidden bg-gradient-hero py-20 md:py-32">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          {/* Logo */}
          <img src={logo} alt="Métis Memo" className="w-20 h-20 mx-auto mb-6 rounded-2xl shadow-soft" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-float">
            <Sparkles className="w-4 h-4" />
            Mémorisation scientifique
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Apprenez <span className="text-gradient-primary">mieux</span>,{' '}
            retenez plus <span className="text-gradient-primary">longtemps</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Créez des fiches intelligentes qui reviennent automatiquement au bon moment
            pour une mémorisation optimale et durable.
          </p>

          {/* CTA */}
          <div className="flex flex-col items-center justify-center gap-4">
            <Button variant="hero" size="xl" onClick={handleGetStarted}>
              {isFirstVisit ? (
                'Commencer maintenant'
              ) : (
                <>
                  <LayoutDashboard className="w-5 h-5 mr-2" />
                  Tableau de bord
                </>
              )}
            </Button>
            <InstallPWA variant="hero" />
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {[
              {
                icon: Brain,
                title: '3 formules',
                description: 'Court, moyen ou long terme',
              },
              {
                icon: Layers,
                title: '4 types de fiches',
                description: 'Flashcard, image, son, question',
              },
              {
                icon: Clock,
                title: 'Rappels automatiques',
                description: 'Ne manquez jamais une révision',
              },
              {
                icon: CheckCircle,
                title: 'Suivi de progression',
                description: 'Visualisez vos progrès',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-6 rounded-2xl bg-card shadow-soft"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-3 rounded-xl bg-primary/10 mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
