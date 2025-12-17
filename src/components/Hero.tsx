import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Sparkles, Clock, CheckCircle, Layers, LayoutDashboard } from 'lucide-react';
import logo from '@/assets/logo.svg';
import { InstallPWA } from '@/components/InstallPWA';
import { useLanguage } from '@/contexts/LanguageContext';
const FIRST_VISIT_KEY = 'interval-memo-first-visit-done';
interface HeroProps {
  onGetStarted: () => void;
}
export const Hero = ({
  onGetStarted
}: HeroProps) => {
  const {
    t
  } = useLanguage();
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
  const features = [{
    icon: Brain,
    title: t('hero.feature.formulas'),
    description: t('hero.feature.formulas.desc')
  }, {
    icon: Layers,
    title: t('hero.feature.types'),
    description: t('hero.feature.types.desc')
  }, {
    icon: Clock,
    title: t('hero.feature.reminders'),
    description: t('hero.feature.reminders.desc')
  }, {
    icon: CheckCircle,
    title: t('hero.feature.progress'),
    description: t('hero.feature.progress.desc')
  }];
  return <div className="relative overflow-hidden bg-gradient-hero py-20 md:py-32">
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
          

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            {t('hero.title.learn')} <span className="text-gradient-primary">{t('hero.title.better')}</span>,{' '}
            {t('hero.title.retain')} <span className="text-gradient-primary">{t('hero.title.longer')}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>

          {/* CTA */}
          <div className="flex flex-col items-center justify-center gap-4">
            <Button variant="hero" size="xl" onClick={handleGetStarted}>
              {isFirstVisit ? t('hero.cta.start') : <>
                  <LayoutDashboard className="w-5 h-5 mr-2" />
                  {t('hero.cta.dashboard')}
                </>}
            </Button>
            <InstallPWA variant="hero" />
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {features.map((feature, index) => <div key={index} className="flex flex-col items-center p-6 rounded-2xl bg-card shadow-soft" style={{
            animationDelay: `${index * 100}ms`
          }}>
                <div className="p-3 rounded-xl bg-primary/10 mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>)}
          </div>
        </div>
      </div>
    </div>;
};