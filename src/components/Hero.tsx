import { Button } from '@/components/ui/button';
import { Brain, Sparkles, Clock, CheckCircle } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

export const Hero = ({ onGetStarted }: HeroProps) => {
  return (
    <div className="relative overflow-hidden bg-gradient-hero py-20 md:py-32">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-float">
            <Sparkles className="w-4 h-4" />
            Mémorisation scientifique
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Mémorisez{' '}
            <span className="text-gradient-primary">efficacement</span>
            <br />
            avec la répétition espacée
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Créez des fiches intelligentes qui reviennent automatiquement au bon moment
            pour une mémorisation optimale et durable.
          </p>

          {/* CTA */}
          <Button variant="hero" size="xl" onClick={onGetStarted}>
            Commencer maintenant
          </Button>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {[
              {
                icon: Brain,
                title: '3 formules',
                description: 'Court, moyen ou long terme',
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
