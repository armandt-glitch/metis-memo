import { Bell, BellOff, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from 'sonner';

interface NotificationSettingsProps {
  dueCount: number;
}

export const NotificationSettings = ({ dueCount }: NotificationSettingsProps) => {
  const { supported, permission, requestPermission, notifyDueCards } = useNotifications();

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast.success('Notifications activées !');
      if (dueCount > 0) {
        notifyDueCards(dueCount);
      }
    } else {
      toast.error('Permission refusée pour les notifications');
    }
  };

  const handleTestNotification = () => {
    if (dueCount > 0) {
      notifyDueCards(dueCount);
    } else {
      toast.info('Aucune carte à réviser pour le moment');
    }
  };

  if (!supported) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <BellOff className="h-4 w-4" />
        <span>Notifications non supportées</span>
      </div>
    );
  }

  if (permission === 'granted') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleTestNotification}
        className="gap-2"
      >
        <BellRing className="h-4 w-4" />
        Tester notification
      </Button>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <BellOff className="h-4 w-4" />
        <span>Notifications bloquées</span>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleEnableNotifications}
      className="gap-2"
    >
      <Bell className="h-4 w-4" />
      Activer les notifications
    </Button>
  );
};
