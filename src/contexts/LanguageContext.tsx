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
    'dashboard.back': 'Retour au tableau de bord',
    'dashboard.memorized.title': 'Fiches mémorisées',
    'dashboard.no.memorized': 'Aucune fiche mémorisée',
    'dashboard.no.memorized.desc': 'Complétez tous les rappels d\'une fiche pour qu\'elle apparaisse ici !',
    'dashboard.cards.created': 'Fiches créées',
    'dashboard.review.now': 'À réviser',
    'dashboard.memorized': 'Mémorisées',
    'dashboard.new.card': 'Nouvelle fiche',
    'dashboard.review': 'Réviser',
    'dashboard.thematic.quiz': 'Quizz thématique',
    'dashboard.thematic.quiz.desc': 'Sélectionnez un groupe pour lancer un quizz de 10 fiches maximum',
    'dashboard.upcoming': 'Prochaines révisions',
    'dashboard.now': 'Maintenant',
    'dashboard.no.cards': 'Aucune fiche pour le moment',
    'dashboard.no.cards.desc': 'Créez votre première fiche pour commencer à mémoriser !',
    'dashboard.create.group': 'Créer un groupe',
    'dashboard.group.name': 'Nom du groupe',
    'dashboard.color': 'Couleur',
    'dashboard.create.group.btn': 'Créer le groupe',
    'dashboard.add.group': 'Ajouter un groupe',
    'dashboard.manage.groups': 'Gérer les groupes',
    'dashboard.remove.all.groups': 'Retirer tous les groupes',
    'dashboard.new.group': 'Nouveau groupe',
    'dashboard.groups': 'groupes',
    'dashboard.step': 'Étape',
    'dashboard.reopen': 'Réouvrir pour réviser',
    'dashboard.edit': 'Modifier la fiche',
    
    // Filter
    'filter.all': 'Tous',
    'filter.ungrouped': 'Sans groupe',
    
    // Form
    'form.back': 'Retour',
    'form.title': 'Nouvelle fiche',
    'form.subtitle': 'Créez une fiche de révision et choisissez votre formule de mémorisation',
    'form.groups': 'Groupes (optionnel)',
    'form.card.type': 'Type de fiche',
    'form.image': 'Image',
    'form.audio': 'Fichier audio',
    'form.question': 'Question',
    'form.question.placeholder': 'Entrez votre question...',
    'form.answer': 'Réponse',
    'form.answer.placeholder': 'Entrez la réponse...',
    'form.answer.written': '(l\'utilisateur devra taper cette réponse)',
    'form.formula': 'Formule de révision',
    'form.create': 'Créer la fiche',
    'form.click.add.image': 'Cliquez pour ajouter une image',
    'form.click.add.audio': 'Cliquez pour ajouter un fichier audio',
    'form.no.group': 'Sans groupe',
    'form.new.group': 'Nouveau groupe',
    
    // Review
    'review.back': 'Retour',
    'review.all.done': 'Tout est à jour !',
    'review.no.cards': 'Vous n\'avez aucune fiche à réviser pour le moment.',
    'review.back.dashboard': 'Retour au tableau de bord',
    'review.question': 'Question',
    'review.answer': 'Réponse',
    'review.type.answer': 'Tapez votre réponse...',
    'review.validate': 'Valider',
    'review.click.reveal': 'Cliquez pour voir la réponse',
    'review.your.answer': 'Votre réponse',
    'review.accepted.with.errors': 'Acceptée avec quelques différences',
    'review.empty': '(vide)',
    'review.to.review': 'À revoir',
    'review.correct': 'Correct !',
    'review.i.knew': 'Je savais',
    'review.i.know': 'Je sais',
    'review.flip': 'Retourner la carte',
    'review.card': 'Fiche',
    'review.of': 'sur',
    'review.thematic': 'Quizz thématique',
    'review.quiz': 'Quizz',
    
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
    
    // Formulas
    'formula.test': 'Test',
    'formula.test.desc': 'Rappel immédiat pour tester rapidement',
    'formula.short': 'Court terme',
    'formula.short.desc': 'Idéal pour les examens proches',
    'formula.medium': 'Moyen terme',
    'formula.medium.desc': 'Parfait pour un apprentissage durable comme un concours',
    'formula.long': 'Long terme',
    'formula.long.desc': 'Pour une mémorisation permanente',
    'formula.immediate': 'Immédiat',
    'formula.10min': '10 minutes',
    'formula.1day': '1 jour',
    'formula.3days': '3 jours',
    'formula.7days': '7 jours',
    'formula.21days': '21 jours',
    'formula.30days': '30 jours',
    'formula.90days': '90 jours',
    
    // Card types
    'cardtype.flashcard': 'Flashcard',
    'cardtype.flashcard.desc': 'Carte classique à retourner',
    'cardtype.written': 'Réponse écrite',
    'cardtype.written.desc': 'Tapez la réponse pour valider',
    'cardtype.image': 'Image',
    'cardtype.image.desc': 'Question basée sur une image',
    'cardtype.audio': 'Audio',
    'cardtype.audio.desc': 'Question basée sur un fichier audio',
    
    // Colors
    'color.red': 'Rouge',
    'color.blue': 'Bleu',
    'color.green': 'Vert',
    'color.purple': 'Violet',
    'color.orange': 'Orange',
    'color.pink': 'Rose',
    'color.cyan': 'Cyan',
    'color.gray': 'Gris',
    
    // Install PWA
    'install.button': 'Installer l\'application',
    'install.title': 'Installer Métis Memo',
    'install.ios.intro': 'Sur iPhone/iPad, l\'installation se fait via Safari :',
    'install.ios.step1': 'Appuyez sur',
    'install.ios.share': 'Partager',
    'install.ios.step1b': 'en bas de l\'écran',
    'install.ios.step2': 'Faites défiler et appuyez sur',
    'install.ios.step2b': '"Sur l\'écran d\'accueil"',
    'install.ios.step3': 'Appuyez sur',
    'install.ios.step3b': 'Ajouter',
    'install.android.title': 'Sur Android (Chrome) :',
    'install.android.step1': 'Appuyez sur le menu',
    'install.android.step1b': 'en haut à droite',
    'install.android.step2': 'Appuyez sur',
    'install.android.step2b': '"Installer l\'application"',
    'install.ios.title': 'Sur iPhone/iPad (Safari) :',
    
    // Packs
    'packs.title': 'Packs de fiches',
    'packs.subtitle': 'Téléchargez des lots complets de fiches prêtes à l\'emploi',
    'packs.my_packs': 'Mes packs',
    'packs.search_placeholder': 'Rechercher un pack...',
    'packs.cards': 'fiches',
    'packs.new': 'Nouveau',
    'packs.download': 'Télécharger',
    'packs.downloading': 'Téléchargement...',
    'packs.installed': 'Installé',
    'packs.view_details': 'Voir détails',
    'packs.no_results': 'Aucun pack trouvé',
    'packs.level.beginner': 'Débutant',
    'packs.level.intermediate': 'Intermédiaire',
    'packs.level.advanced': 'Avancé',
    'packs.status.downloading': 'Téléchargement...',
    'packs.status.extracting': 'Extraction...',
    'packs.status.importing': 'Import des fiches...',
    'packs.tags': 'Tags',
    'packs.preview_cards': 'Aperçu des fiches',
    'packs.preview_note': 'Aperçu de 5 fiches sur',
    'packs.created': 'Créé le',
    'packs.updated': 'Mis à jour le',
    'packs.download_complete': 'Pack importé avec succès !',
    'packs.close': 'Fermer',
    'packs.back_to_store': 'Retour aux packs',
    'packs.no_installed': 'Aucun pack installé',
    'packs.no_installed_desc': 'Parcourez le catalogue et téléchargez des packs !',
    'packs.delete': 'Supprimer',
    'packs.delete_confirm_title': 'Supprimer ce pack ?',
    'packs.delete_confirm_desc': 'Cette action supprimera le pack et toutes ses fiches :',
    'packs.cancel': 'Annuler',
    'packs.clear_filters': 'Effacer',
    
    // Pack configuration
    'pack.config.title': 'Configurer le pack',
    'pack.config.cardType': 'Type de révision',
    'pack.config.formula': 'Rythme de révision',
    'pack.config.mediaWarning': 'Ce pack contient des images ou sons. Le type de révision ne peut pas être modifié.',
    
    // Card types for config
    'cardType.flashcard': 'Flashcard',
    'cardType.flashcard.desc': 'Retourner la carte',
    'cardType.written': 'Réponse écrite',
    'cardType.written.desc': 'Taper la réponse',
    
    // Common
    'common.cancel': 'Annuler',
    'common.save': 'Enregistrer',
    
    // Individual cards
    'dashboard.cards.individual': 'Fiches individuelles',
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
    'dashboard.back': 'Back to dashboard',
    'dashboard.memorized.title': 'Memorized cards',
    'dashboard.no.memorized': 'No memorized cards',
    'dashboard.no.memorized.desc': 'Complete all reviews of a card for it to appear here!',
    'dashboard.cards.created': 'Cards created',
    'dashboard.review.now': 'Due for review',
    'dashboard.memorized': 'Memorized',
    'dashboard.new.card': 'New card',
    'dashboard.review': 'Review',
    'dashboard.thematic.quiz': 'Thematic quiz',
    'dashboard.thematic.quiz.desc': 'Select a group to start a quiz of up to 10 cards',
    'dashboard.upcoming': 'Upcoming reviews',
    'dashboard.now': 'Now',
    'dashboard.no.cards': 'No cards yet',
    'dashboard.no.cards.desc': 'Create your first card to start memorizing!',
    'dashboard.create.group': 'Create group',
    'dashboard.group.name': 'Group name',
    'dashboard.color': 'Color',
    'dashboard.create.group.btn': 'Create group',
    'dashboard.add.group': 'Add to group',
    'dashboard.manage.groups': 'Manage groups',
    'dashboard.remove.all.groups': 'Remove from all groups',
    'dashboard.new.group': 'New group',
    'dashboard.groups': 'groups',
    'dashboard.step': 'Step',
    'dashboard.reopen': 'Reopen for review',
    'dashboard.edit': 'Edit card',
    
    // Filter
    'filter.all': 'All',
    'filter.ungrouped': 'Ungrouped',
    
    // Form
    'form.back': 'Back',
    'form.title': 'New card',
    'form.subtitle': 'Create a flashcard and choose your memorization formula',
    'form.groups': 'Groups (optional)',
    'form.card.type': 'Card type',
    'form.image': 'Image',
    'form.audio': 'Audio file',
    'form.question': 'Question',
    'form.question.placeholder': 'Enter your question...',
    'form.answer': 'Answer',
    'form.answer.placeholder': 'Enter the answer...',
    'form.answer.written': '(user will need to type this answer)',
    'form.formula': 'Review formula',
    'form.create': 'Create card',
    'form.click.add.image': 'Click to add an image',
    'form.click.add.audio': 'Click to add an audio file',
    'form.no.group': 'No group',
    'form.new.group': 'New group',
    
    // Review
    'review.back': 'Back',
    'review.all.done': 'All caught up!',
    'review.no.cards': 'You have no cards to review at the moment.',
    'review.back.dashboard': 'Back to dashboard',
    'review.question': 'Question',
    'review.answer': 'Answer',
    'review.type.answer': 'Type your answer...',
    'review.validate': 'Submit',
    'review.click.reveal': 'Click to reveal the answer',
    'review.your.answer': 'Your answer',
    'review.accepted.with.errors': 'Accepted with minor differences',
    'review.empty': '(empty)',
    'review.to.review': 'Review again',
    'review.correct': 'Correct!',
    'review.i.knew': 'I knew it',
    'review.i.know': 'I knew',
    'review.flip': 'Flip the card',
    'review.card': 'Card',
    'review.of': 'of',
    'review.thematic': 'Thematic quiz',
    'review.quiz': 'Quiz',
    
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
    
    // Formulas
    'formula.test': 'Test',
    'formula.test.desc': 'Immediate recall for quick testing',
    'formula.short': 'Short term',
    'formula.short.desc': 'Ideal for upcoming exams',
    'formula.medium': 'Medium term',
    'formula.medium.desc': 'Perfect for lasting learning like competitions',
    'formula.long': 'Long term',
    'formula.long.desc': 'For permanent memorization',
    'formula.immediate': 'Immediate',
    'formula.10min': '10 minutes',
    'formula.1day': '1 day',
    'formula.3days': '3 days',
    'formula.7days': '7 days',
    'formula.21days': '21 days',
    'formula.30days': '30 days',
    'formula.90days': '90 days',
    
    // Card types
    'cardtype.flashcard': 'Flashcard',
    'cardtype.flashcard.desc': 'Classic flip card',
    'cardtype.written': 'Written answer',
    'cardtype.written.desc': 'Type the answer to validate',
    'cardtype.image': 'Image',
    'cardtype.image.desc': 'Question based on an image',
    'cardtype.audio': 'Audio',
    'cardtype.audio.desc': 'Question based on an audio file',
    
    // Colors
    'color.red': 'Red',
    'color.blue': 'Blue',
    'color.green': 'Green',
    'color.purple': 'Purple',
    'color.orange': 'Orange',
    'color.pink': 'Pink',
    'color.cyan': 'Cyan',
    'color.gray': 'Gray',
    
    // Install PWA
    'install.button': 'Install app',
    'install.title': 'Install Métis Memo',
    'install.ios.intro': 'On iPhone/iPad, install via Safari:',
    'install.ios.step1': 'Tap',
    'install.ios.share': 'Share',
    'install.ios.step1b': 'at the bottom of the screen',
    'install.ios.step2': 'Scroll down and tap',
    'install.ios.step2b': '"Add to Home Screen"',
    'install.ios.step3': 'Tap',
    'install.ios.step3b': 'Add',
    'install.android.title': 'On Android (Chrome):',
    'install.android.step1': 'Tap the menu',
    'install.android.step1b': 'in the top right',
    'install.android.step2': 'Tap',
    'install.android.step2b': '"Install app"',
    'install.ios.title': 'On iPhone/iPad (Safari):',
    
    // Packs
    'packs.title': 'Card Packs',
    'packs.subtitle': 'Download complete sets of ready-to-use flashcards',
    'packs.my_packs': 'My packs',
    'packs.search_placeholder': 'Search packs...',
    'packs.cards': 'cards',
    'packs.new': 'New',
    'packs.download': 'Download',
    'packs.downloading': 'Downloading...',
    'packs.installed': 'Installed',
    'packs.view_details': 'View details',
    'packs.no_results': 'No packs found',
    'packs.level.beginner': 'Beginner',
    'packs.level.intermediate': 'Intermediate',
    'packs.level.advanced': 'Advanced',
    'packs.status.downloading': 'Downloading...',
    'packs.status.extracting': 'Extracting...',
    'packs.status.importing': 'Importing cards...',
    'packs.tags': 'Tags',
    'packs.preview_cards': 'Preview cards',
    'packs.preview_note': 'Preview of 5 cards out of',
    'packs.created': 'Created',
    'packs.updated': 'Updated',
    'packs.download_complete': 'Pack imported successfully!',
    'packs.close': 'Close',
    'packs.back_to_store': 'Back to packs',
    'packs.no_installed': 'No packs installed',
    'packs.no_installed_desc': 'Browse the catalog and download packs!',
    'packs.delete': 'Delete',
    'packs.delete_confirm_title': 'Delete this pack?',
    'packs.delete_confirm_desc': 'This will remove the pack and all its cards:',
    'packs.cancel': 'Cancel',
    'packs.clear_filters': 'Clear',
    
    // Pack configuration
    'pack.config.title': 'Configure pack',
    'pack.config.cardType': 'Review type',
    'pack.config.formula': 'Review schedule',
    'pack.config.mediaWarning': 'This pack contains images or audio. The review type cannot be changed.',
    
    // Card types for config
    'cardType.flashcard': 'Flashcard',
    'cardType.flashcard.desc': 'Flip the card',
    'cardType.written': 'Written answer',
    'cardType.written.desc': 'Type the answer',
    
    // Common
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    
    // Individual cards
    'dashboard.cards.individual': 'Individual cards',
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
