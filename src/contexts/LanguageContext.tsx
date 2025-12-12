import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  fr: {
    // Header
    'header.subtitle': 'Mémorisation intelligente',
    
    // Hero
    'hero.badge': 'Mémorisation scientifique',
    'hero.title.learn': 'Apprenez',
    'hero.title.better': 'mieux',
    'hero.title.retain': 'retenez plus',
    'hero.title.longer': 'longtemps',
    'hero.subtitle': 'Créez des fiches intelligentes qui reviennent automatiquement au bon moment pour une mémorisation optimale et durable.',
    'hero.cta.start': 'Commencer maintenant',
    'hero.cta.dashboard': 'Tableau de bord',
    'hero.feature.formulas': '3 formules',
    'hero.feature.formulas.desc': 'Court, moyen ou long terme',
    'hero.feature.types': '4 types de fiches',
    'hero.feature.types.desc': 'Flashcard, image, son, question',
    'hero.feature.reminders': 'Rappels automatiques',
    'hero.feature.reminders.desc': 'Ne manquez jamais une révision',
    'hero.feature.progress': 'Suivi de progression',
    'hero.feature.progress.desc': 'Visualisez vos progrès',
    
    // Dashboard
    'dashboard.title': 'Tableau de bord',
    'dashboard.total': 'Total fiches',
    'dashboard.completed': 'Terminées',
    'dashboard.due': 'À réviser',
    'dashboard.new': 'Nouvelle fiche',
    'dashboard.review': 'Réviser',
    'dashboard.thematic': 'Quizz thématique',
    'dashboard.thematic.desc': 'Révisez par groupe',
    'dashboard.upcoming': 'Prochaines révisions',
    'dashboard.no.cards': 'Aucune fiche',
    'dashboard.no.cards.desc': 'Créez votre première fiche pour commencer',
    'dashboard.memorized': 'Fiches mémorisées',
    'dashboard.all.groups': 'Tous les groupes',
    'dashboard.create.group': 'Créer un groupe',
    'dashboard.group.name': 'Nom du groupe',
    'dashboard.group.color': 'Couleur',
    'dashboard.cancel': 'Annuler',
    'dashboard.create': 'Créer',
    'dashboard.start.quiz': 'Lancer le quizz',
    'dashboard.cards': 'fiches',
    'dashboard.card': 'fiche',
    'dashboard.ready': 'Prête',
    'dashboard.in': 'Dans',
    'dashboard.days': 'jours',
    'dashboard.day': 'jour',
    'dashboard.hours': 'heures',
    'dashboard.hour': 'heure',
    'dashboard.reopen': 'Rouvrir',
    
    // Review
    'review.question': 'Question',
    'review.answer': 'Réponse',
    'review.click.to.reveal': 'Cliquez pour révéler',
    'review.i.knew': 'Je savais',
    'review.i.didnt.know': 'Je ne savais pas',
    'review.progress': 'Progression',
    'review.finish': 'Terminer',
    'review.next.review': 'Prochaine révision',
    'review.completed': 'Terminée !',
    'review.back': 'Retour',
    
    // Form
    'form.title': 'Nouvelle fiche',
    'form.edit': 'Modifier la fiche',
    'form.question': 'Question',
    'form.question.placeholder': 'Entrez votre question...',
    'form.answer': 'Réponse',
    'form.answer.placeholder': 'Entrez la réponse...',
    'form.group': 'Groupe',
    'form.formula': 'Formule',
    'form.type': 'Type de fiche',
    'form.save': 'Enregistrer',
    'form.create': 'Créer la fiche',
    'form.cancel': 'Annuler',
    
    // Onboarding
    'onboarding.welcome': 'Bienvenue sur Métis Memo !',
    'onboarding.welcome.desc': 'Une application de révision par répétition espacée pour mémoriser efficacement vos connaissances.',
    'onboarding.create': 'Créez vos fiches',
    'onboarding.create.desc': 'Ajoutez des fiches avec questions et réponses. Vous pouvez aussi ajouter des images ou de l\'audio !',
    'onboarding.spaced': 'Répétition espacée',
    'onboarding.spaced.desc': 'L\'application planifie automatiquement vos révisions selon des intervalles optimisés pour la mémorisation.',
    'onboarding.notifications': 'Notifications',
    'onboarding.notifications.desc': 'Activez les notifications pour ne jamais manquer une session de révision !',
    'onboarding.ready': 'Prêt à commencer !',
    'onboarding.ready.desc': 'Créez votre première fiche et commencez à mémoriser efficacement.',
    'onboarding.skip': 'Passer',
    'onboarding.next': 'Suivant',
    'onboarding.start': 'Commencer',
  },
  en: {
    // Header
    'header.subtitle': 'Smart memorization',
    
    // Hero
    'hero.badge': 'Scientific memorization',
    'hero.title.learn': 'Learn',
    'hero.title.better': 'better',
    'hero.title.retain': 'remember',
    'hero.title.longer': 'longer',
    'hero.subtitle': 'Create smart flashcards that automatically come back at the right time for optimal and lasting memorization.',
    'hero.cta.start': 'Get started',
    'hero.cta.dashboard': 'Dashboard',
    'hero.feature.formulas': '3 formulas',
    'hero.feature.formulas.desc': 'Short, medium or long term',
    'hero.feature.types': '4 card types',
    'hero.feature.types.desc': 'Flashcard, image, audio, question',
    'hero.feature.reminders': 'Auto reminders',
    'hero.feature.reminders.desc': 'Never miss a review',
    'hero.feature.progress': 'Progress tracking',
    'hero.feature.progress.desc': 'Visualize your progress',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.total': 'Total cards',
    'dashboard.completed': 'Completed',
    'dashboard.due': 'Due now',
    'dashboard.new': 'New card',
    'dashboard.review': 'Review',
    'dashboard.thematic': 'Thematic quiz',
    'dashboard.thematic.desc': 'Review by group',
    'dashboard.upcoming': 'Upcoming reviews',
    'dashboard.no.cards': 'No cards',
    'dashboard.no.cards.desc': 'Create your first card to get started',
    'dashboard.memorized': 'Memorized cards',
    'dashboard.all.groups': 'All groups',
    'dashboard.create.group': 'Create group',
    'dashboard.group.name': 'Group name',
    'dashboard.group.color': 'Color',
    'dashboard.cancel': 'Cancel',
    'dashboard.create': 'Create',
    'dashboard.start.quiz': 'Start quiz',
    'dashboard.cards': 'cards',
    'dashboard.card': 'card',
    'dashboard.ready': 'Ready',
    'dashboard.in': 'In',
    'dashboard.days': 'days',
    'dashboard.day': 'day',
    'dashboard.hours': 'hours',
    'dashboard.hour': 'hour',
    'dashboard.reopen': 'Reopen',
    
    // Review
    'review.question': 'Question',
    'review.answer': 'Answer',
    'review.click.to.reveal': 'Click to reveal',
    'review.i.knew': 'I knew it',
    'review.i.didnt.know': 'I didn\'t know',
    'review.progress': 'Progress',
    'review.finish': 'Finish',
    'review.next.review': 'Next review',
    'review.completed': 'Completed!',
    'review.back': 'Back',
    
    // Form
    'form.title': 'New card',
    'form.edit': 'Edit card',
    'form.question': 'Question',
    'form.question.placeholder': 'Enter your question...',
    'form.answer': 'Answer',
    'form.answer.placeholder': 'Enter the answer...',
    'form.group': 'Group',
    'form.formula': 'Formula',
    'form.type': 'Card type',
    'form.save': 'Save',
    'form.create': 'Create card',
    'form.cancel': 'Cancel',
    
    // Onboarding
    'onboarding.welcome': 'Welcome to Métis Memo!',
    'onboarding.welcome.desc': 'A spaced repetition app to effectively memorize your knowledge.',
    'onboarding.create': 'Create your cards',
    'onboarding.create.desc': 'Add cards with questions and answers. You can also add images or audio!',
    'onboarding.spaced': 'Spaced repetition',
    'onboarding.spaced.desc': 'The app automatically schedules your reviews at optimal intervals for memorization.',
    'onboarding.notifications': 'Notifications',
    'onboarding.notifications.desc': 'Enable notifications to never miss a review session!',
    'onboarding.ready': 'Ready to start!',
    'onboarding.ready.desc': 'Create your first card and start memorizing effectively.',
    'onboarding.skip': 'Skip',
    'onboarding.next': 'Next',
    'onboarding.start': 'Start',
  },
};

const LANGUAGE_KEY = 'interval-memo-language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('fr');

  useEffect(() => {
    const savedLang = localStorage.getItem(LANGUAGE_KEY) as Language;
    if (savedLang && (savedLang === 'fr' || savedLang === 'en')) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_KEY, lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
