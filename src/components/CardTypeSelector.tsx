import { CardType, CARD_TYPES } from '@/types/flashcard';
import { RotateCcw, PenLine, Image, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CardTypeSelectorProps {
  selected: CardType;
  onSelect: (type: CardType) => void;
}

const iconMap = {
  RotateCcw,
  PenLine,
  Image,
  Volume2,
};

export const CardTypeSelector = ({ selected, onSelect }: CardTypeSelectorProps) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {(Object.keys(CARD_TYPES) as CardType[]).map((type) => {
        const cardType = CARD_TYPES[type];
        const Icon = iconMap[cardType.icon as keyof typeof iconMap];
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
                  {cardType.name}
                </p>
                <p className="text-xs text-muted-foreground">{cardType.description}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
