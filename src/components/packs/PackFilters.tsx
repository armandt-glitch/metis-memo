import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PackFiltersProps {
  themes: string[];
  levels: string[];
  selectedTheme: string | null;
  selectedLevel: string | null;
  onThemeChange: (theme: string | null) => void;
  onLevelChange: (level: string | null) => void;
}

export const PackFilters = ({
  themes,
  levels,
  selectedTheme,
  selectedLevel,
  onThemeChange,
  onLevelChange,
}: PackFiltersProps) => {
  const { t } = useLanguage();

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner': return t('packs.level.beginner');
      case 'intermediate': return t('packs.level.intermediate');
      case 'advanced': return t('packs.level.advanced');
      default: return level;
    }
  };

  const hasFilters = selectedTheme || selectedLevel;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Theme filters */}
      {themes.map((theme) => (
        <Button
          key={theme}
          variant={selectedTheme === theme ? 'default' : 'outline'}
          size="sm"
          onClick={() => onThemeChange(selectedTheme === theme ? null : theme)}
        >
          {theme}
        </Button>
      ))}

      {themes.length > 0 && levels.length > 0 && (
        <div className="w-px h-6 bg-border" />
      )}

      {/* Level filters */}
      {levels.map((level) => (
        <Button
          key={level}
          variant={selectedLevel === level ? 'default' : 'outline'}
          size="sm"
          onClick={() => onLevelChange(selectedLevel === level ? null : level)}
        >
          {getLevelLabel(level)}
        </Button>
      ))}

      {/* Clear filters */}
      {hasFilters && (
        <>
          <div className="w-px h-6 bg-border" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onThemeChange(null);
              onLevelChange(null);
            }}
            className="gap-1"
          >
            <X className="h-3 w-3" />
            {t('packs.clear_filters')}
          </Button>
        </>
      )}
    </div>
  );
};
