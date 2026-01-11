import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => void>;
    OneSignal?: any;
  }
}

const ONESIGNAL_APP_ID = '862cf3b1-bbc7-4a41-a3ce-df4114ec20c6';

export const useOneSignal = () => {
  const [initialized, setInitialized] = useState(false);
  const [permission, setPermission] = useState<'default' | 'granted' | 'denied'>('default');
  const { user } = useAuth();

  // Initialize OneSignal
  useEffect(() => {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal: any) => {
      try {
        await OneSignal.init({
          appId: ONESIGNAL_APP_ID,
          notifyButton: { enable: false },
          allowLocalhostAsSecureOrigin: true,
          serviceWorkerParam: { scope: '/' },
          welcomeNotification: {
            title: 'Métis Memo',
            message: 'Les notifications sont maintenant actives !',
          },
        });
        
        setInitialized(true);
        
        // Check current permission status
        const status = await OneSignal.Notifications.permission;
        setPermission(status ? 'granted' : 'default');
        
        // Listen for permission changes
        OneSignal.Notifications.addEventListener('permissionChange', (granted: boolean) => {
          setPermission(granted ? 'granted' : 'denied');
        });
        
        console.log('OneSignal initialized successfully');
      } catch (error) {
        console.error('OneSignal initialization error:', error);
      }
    });
  }, []);

  // Associate logged-in user with OneSignal
  useEffect(() => {
    if (!initialized) return;
    
    window.OneSignalDeferred?.push(async (OneSignal: any) => {
      try {
        if (user) {
          await OneSignal.login(user.id);
          console.log('OneSignal: User logged in', user.id);
        } else {
          await OneSignal.logout();
          console.log('OneSignal: User logged out');
        }
      } catch (error) {
        console.error('OneSignal user association error:', error);
      }
    });
  }, [initialized, user]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    return new Promise((resolve) => {
      window.OneSignalDeferred?.push(async (OneSignal: any) => {
        try {
          await OneSignal.Notifications.requestPermission();
          const status = await OneSignal.Notifications.permission;
          setPermission(status ? 'granted' : 'denied');
          resolve(status);
        } catch (error) {
          console.error('OneSignal permission error:', error);
          setPermission('denied');
          resolve(false);
        }
      });
    });
  }, []);

  // Check if browser supports notifications
  const supported = typeof window !== 'undefined' && 'Notification' in window;

  return { 
    initialized, 
    permission, 
    requestPermission, 
    supported 
  };
};
