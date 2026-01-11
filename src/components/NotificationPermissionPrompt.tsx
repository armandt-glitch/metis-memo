import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOneSignal } from '@/hooks/useOneSignal';
import { toast } from 'sonner';

export const NotificationPermissionPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const { initialized, permission, requestPermission, supported } = useOneSignal();

  useEffect(() => {
    // Show prompt if:
    // 1. OneSignal is initialized
    // 2. Notifications are supported
    // 3. Permission hasn't been granted or denied yet
    // 4. User hasn't dismissed the prompt in this session
    const dismissed = sessionStorage.getItem('notification-prompt-dismissed');
    if (initialized && supported && permission === 'default' && !dismissed) {
      setShowPrompt(true);
    }
  }, [initialized, supported, permission]);

  const handleEnable = async () => {
    const granted = await requestPermission();
    
    if (granted) {
      toast.success('Notifications activées ! Vous serez prévenu quand des cartes sont à réviser.');
    } else {
      toast.error('Les notifications ont été refusées. Vous pouvez les activer dans les paramètres de votre navigateur.');
    }
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem('notification-prompt-dismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card border border-border rounded-xl p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Activer les notifications</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Les notifications sont nécessaires pour profiter pleinement de l'expérience utilisateur. Elles vous permettent d'être alerté au bon moment pour réviser vos cartes.
            </p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={handleEnable}>
                Activer
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss}>
                Plus tard
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
