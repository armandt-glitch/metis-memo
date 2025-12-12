import logo from '@/assets/logo.png';
import { InstallPWA } from '@/components/InstallPWA';
import { NotificationSettings } from '@/components/NotificationSettings';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';

interface HeaderProps {
  dueCount?: number;
}

export const Header = ({ dueCount = 0 }: HeaderProps) => {
  const { t } = useLanguage();

  return (
    <header className="py-4 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Métis Memo" className="w-12 h-12 rounded-lg" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Métis Memo</h1>
              <p className="text-xs text-muted-foreground">{t('header.subtitle')}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <NotificationSettings dueCount={dueCount} />
            <InstallPWA />
          </div>
        </div>
      </div>
    </header>
  );
};
