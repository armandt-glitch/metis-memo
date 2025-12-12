import { useLanguage, Language } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

const FrenchFlag = () => (
  <svg width="20" height="15" viewBox="0 0 20 15" className="rounded-sm">
    <rect width="7" height="15" fill="#002395" />
    <rect x="7" width="6" height="15" fill="#FFFFFF" />
    <rect x="13" width="7" height="15" fill="#ED2939" />
  </svg>
);

const UKFlag = () => (
  <svg width="20" height="15" viewBox="0 0 60 30" className="rounded-sm">
    <clipPath id="t">
      <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/>
    </clipPath>
    <path d="M0,0 v30 h60 v-30 z" fill="#00247d"/>
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
    <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#cf142b" strokeWidth="4"/>
    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
    <path d="M30,0 v30 M0,15 h60" stroke="#cf142b" strokeWidth="6"/>
  </svg>
);

const languages: { code: Language; label: string; flag: React.ReactNode }[] = [
  { code: 'fr', label: 'FR', flag: <FrenchFlag /> },
  { code: 'en', label: 'EN', flag: <UKFlag /> },
];

export const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  const currentLang = languages.find((l) => l.code === language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 px-2">
          {currentLang.flag}
          <span className="text-sm font-medium">{currentLang.label}</span>
          <ChevronDown className="w-3 h-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover border border-border shadow-lg z-50">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className="gap-2 cursor-pointer"
          >
            {lang.flag}
            <span>{lang.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
