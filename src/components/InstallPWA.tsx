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
import { useLanguage } from '@/contexts/LanguageContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallPWAProps {
  variant?: 'default' | 'hero';
}

export const InstallPWA = ({ variant = 'default' }: InstallPWAProps) => {
  const { t } = useLanguage();
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
  const heroButtonClass = isHero ? 'gap-2 !bg-[#780000] !text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-100' : 'gap-2';

  if (isInstalled) {
    return null;
  }

  // Android/Chrome with install prompt - direct installation
  if (deferredPrompt) {
    return (
      <Button 
        variant={isHero ? 'default' : 'outline'} 
        size={buttonSize} 
        onClick={handleInstall} 
        className={heroButtonClass}
      >
        <Download className={iconSize} />
        {t('install.button')}
      </Button>
    );
  }

  // iOS - must show instructions (Apple doesn't allow programmatic install)
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
            {t('install.button')}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('install.title')}</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-4 pt-4">
                <p className="text-foreground">{t('install.ios.intro')}</p>
                <ol className="list-decimal list-inside space-y-3 text-sm">
                  <li>{t('install.ios.step1')} <Share className="inline h-4 w-4 mx-1" /> <strong>{t('install.ios.share')}</strong> {t('install.ios.step1b')}</li>
                  <li>{t('install.ios.step2')} <strong>{t('install.ios.step2b')}</strong></li>
                  <li>{t('install.ios.step3')} <strong>{t('install.ios.step3b')}</strong></li>
                </ol>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  // Fallback for desktop or browsers without install support
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
            {t('install.button')}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('install.title')}</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-4 pt-4">
                <p className="text-foreground"><strong>{t('install.android.title')}</strong></p>
                <ol className="list-decimal list-inside space-y-2 text-sm ml-2">
                  <li>{t('install.android.step1')} <strong>⋮</strong> {t('install.android.step1b')}</li>
                  <li>{t('install.android.step2')} <strong>{t('install.android.step2b')}</strong></li>
                </ol>
                <p className="mt-4 text-foreground"><strong>{t('install.ios.title')}</strong></p>
                <ol className="list-decimal list-inside space-y-2 text-sm ml-2">
                  <li>{t('install.ios.step1')} <Share className="inline h-4 w-4 mx-1" /> <strong>{t('install.ios.share')}</strong></li>
                  <li>{t('install.ios.step2')} <strong>{t('install.ios.step2b')}</strong></li>
                </ol>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
};
