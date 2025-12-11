import { useState, useEffect } from 'react';
import { Download, Smartphone, Monitor, Share, Plus, Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Detect device
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => setIsInstalled(true));

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

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Application installée !</CardTitle>
            <CardDescription>
              Memo est maintenant disponible sur votre appareil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Ouvrir l'application
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <div className="text-center mb-8">
          <img src="/pwa-192x192.png" alt="Memo" className="w-24 h-24 mx-auto rounded-2xl shadow-lg mb-4" />
          <h1 className="text-3xl font-bold mb-2">Installer Memo</h1>
          <p className="text-muted-foreground">
            Installez l'application pour un accès rapide et des notifications de révision
          </p>
        </div>

        {/* Direct install button for supported browsers */}
        {deferredPrompt && (
          <Card className="mb-6 border-primary">
            <CardContent className="pt-6">
              <Button onClick={handleInstall} size="lg" className="w-full gap-2">
                <Download className="w-5 h-5" />
                Installer maintenant
              </Button>
            </CardContent>
          </Card>
        )}

        {/* iOS Instructions */}
        {isIOS && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Installation sur iPhone/iPad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium">Appuyez sur le bouton Partager</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Share className="w-4 h-4" /> en bas de l'écran Safari
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium">Faites défiler et appuyez sur</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Plus className="w-4 h-4" /> "Sur l'écran d'accueil"
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium">Appuyez sur "Ajouter"</p>
                  <p className="text-sm text-muted-foreground">L'app apparaîtra sur votre écran d'accueil</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Android Instructions */}
        {isAndroid && !deferredPrompt && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Installation sur Android
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium">Ouvrez le menu du navigateur</p>
                  <p className="text-sm text-muted-foreground">Les 3 points en haut à droite</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium">Appuyez sur "Installer l'application"</p>
                  <p className="text-sm text-muted-foreground">Ou "Ajouter à l'écran d'accueil"</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Desktop Instructions */}
        {!isIOS && !isAndroid && !deferredPrompt && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Installation sur ordinateur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium">Cherchez l'icône d'installation</p>
                  <p className="text-sm text-muted-foreground">Dans la barre d'adresse (Chrome, Edge) ou le menu</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium">Cliquez sur "Installer"</p>
                  <p className="text-sm text-muted-foreground">L'app s'ouvrira dans sa propre fenêtre</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Avantages de l'installation</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Accès rapide depuis l'écran d'accueil
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Fonctionne hors ligne
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Notifications de révision
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Expérience plein écran
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Install;
