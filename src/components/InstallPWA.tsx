import { useState, useEffect } from 'react';
import { Download, Smartphone, Check, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallPWAProps {
  variant?: 'default' | 'hero';
}

export const InstallPWA = ({ variant = 'default' }: InstallPWAProps) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const isHero = variant === 'hero';
  const buttonSize = isHero ? 'xl' : 'sm';
  const iconSize = isHero ? 'h-5 w-5' : 'h-4 w-4';
  const heroButtonClass = isHero ? 'gap-2 !bg-[#780000] hover:!bg-[#5a0000] !text-white shadow-lg' : 'gap-2';

  if (isInstalled) {
    return (
      <div className={`flex items-center gap-2 text-green-500 ${isHero ? 'text-base' : 'text-sm'}`}>
        <Check className={iconSize} />
        <span>App installée</span>
      </div>
    );
  }

  // iOS instructions dialog
  if (isIOS) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            variant={isHero ? 'default' : 'outline'} 
            size={buttonSize} 
            className={heroButtonClass}
          >
            <Smartphone className={iconSize} />
            Installer l'app
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Installer Métis Memo sur iOS</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-4 pt-4">
                <p>Pour installer l'application sur votre iPhone ou iPad :</p>
                <ol className="list-decimal list-inside space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="font-medium">1.</span>
                    <span>Appuyez sur le bouton <strong>Partager</strong> <Share className="inline h-4 w-4" /> en bas de Safari</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-medium">2.</span>
                    <span>Faites défiler et appuyez sur <strong>"Sur l'écran d'accueil"</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-medium">3.</span>
                    <span>Appuyez sur <strong>Ajouter</strong> en haut à droite</span>
                  </li>
                </ol>
                <p className="text-xs text-muted-foreground mt-4">
                  L'app fonctionnera hors ligne et apparaîtra comme une vraie application sur votre écran d'accueil.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  // Android/Chrome with install prompt
  if (deferredPrompt) {
    return (
      <Button 
        variant={isHero ? 'default' : 'outline'} 
        size={buttonSize} 
        onClick={handleInstall} 
        className={heroButtonClass}
      >
        <Download className={iconSize} />
        Installer l'app
      </Button>
    );
  }

  // Show instructions for other browsers (desktop Chrome, Firefox, etc.)
  if (isHero) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            variant="default" 
            size={buttonSize} 
            className={heroButtonClass}
          >
            <Download className={iconSize} />
            Installer l'app
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Installer Métis Memo</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-4 pt-4">
                <p><strong>Sur Android (Chrome) :</strong></p>
                <ol className="list-decimal list-inside space-y-2 text-sm ml-2">
                  <li>Appuyez sur le menu <strong>⋮</strong> en haut à droite</li>
                  <li>Appuyez sur <strong>"Installer l'application"</strong> ou <strong>"Ajouter à l'écran d'accueil"</strong></li>
                </ol>
                <p className="mt-4"><strong>Sur iPhone/iPad (Safari) :</strong></p>
                <ol className="list-decimal list-inside space-y-2 text-sm ml-2">
                  <li>Appuyez sur le bouton <strong>Partager</strong> <Share className="inline h-4 w-4" /></li>
                  <li>Appuyez sur <strong>"Sur l'écran d'accueil"</strong></li>
                  <li>Appuyez sur <strong>Ajouter</strong></li>
                </ol>
                <p className="text-xs text-muted-foreground mt-4">
                  L'app fonctionnera hors ligne comme une vraie application.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
};
