import { CardType } from '@/types/flashcard';
import { RotateCcw, PenLine, Image, Volume2, LineChart, StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface CardTypeSelectorProps {
  selected: CardType;
  onSelect: (type: CardType) => void;
}

const iconMap = {
  flashcard: RotateCcw,
  written: PenLine,
  image: Image,
  audio: Volume2,
  graph: LineChart,
  memo: StickyNote,
};

const cardTypeKeys: CardType[] = ['memo', 'flashcard', 'written', 'image', 'audio', 'graph'];

export const CardTypeSelector = ({ selected, onSelect }: CardTypeSelectorProps) => {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-2 gap-3">
      {cardTypeKeys.map((type) => {
        const Icon = iconMap[type];
        const isSelected = selected === type;

        return (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            className={cn(
              'p-4 rounded-xl border-2 transition-all text-left',
              isSelected
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card hover:border-primary/50'
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className={cn('font-medium', isSelected ? 'text-foreground' : 'text-muted-foreground')}>
                  {t(`cardtype.${type}`)}
                </p>
                <p className="text-xs text-muted-foreground">{t(`cardtype.${type}.desc`)}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
