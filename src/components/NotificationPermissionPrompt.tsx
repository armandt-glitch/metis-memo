import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from 'sonner';

interface NotificationPermissionPromptProps {
  dueCount: number;
}

export const NotificationPermissionPrompt = ({ dueCount }: NotificationPermissionPromptProps) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const { supported, permission, requestPermission, registerServiceWorker } = useNotifications();

  useEffect(() => {
    // Show prompt only if:
    // 1. Notifications are supported
    // 2. Permission hasn't been granted or denied yet
    // 3. User hasn't dismissed the prompt in this session
    const dismissed = sessionStorage.getItem('notification-prompt-dismissed');
    if (supported && permission === 'default' && !dismissed) {
      // Small delay to not show immediately on page load
      const timer = setTimeout(() => setShowPrompt(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [supported, permission]);

  const handleEnable = async () => {
    const granted = await requestPermission();
    if (granted) {
      await registerServiceWorker();
      toast.success('Notifications activées ! Vous serez prévenu quand des cartes sont à réviser.');
      setShowPrompt(false);
    } else {
      toast.error('Les notifications ont été refusées. Vous pouvez les activer dans les paramètres de votre navigateur.');
      setShowPrompt(false);
    }
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
              Recevez une alerte quand vos cartes sont prêtes à être révisées.
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
