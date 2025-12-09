import { FormulaType, FORMULAS } from '@/types/flashcard';
import { Clock, Zap, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormulaCardProps {
  type: FormulaType;
  selected: boolean;
  onSelect: () => void;
}

const icons = {
  short: Zap,
  medium: Clock,
  long: Target,
};

const colors = {
  short: 'border-formula-short hover:bg-formula-short/5',
  medium: 'border-formula-medium hover:bg-formula-medium/5',
  long: 'border-formula-long hover:bg-formula-long/5',
};

const selectedColors = {
  short: 'border-formula-short bg-formula-short/10',
  medium: 'border-formula-medium bg-formula-medium/10',
  long: 'border-formula-long bg-formula-long/10',
};

const iconColors = {
  short: 'text-formula-short',
  medium: 'text-formula-medium',
  long: 'text-formula-long',
};

export const FormulaCard = ({ type, selected, onSelect }: FormulaCardProps) => {
  const formula = FORMULAS[type];
  const Icon = icons[type];

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full p-6 rounded-2xl border-2 text-left transition-all duration-300 shadow-soft hover:shadow-card',
        'bg-card',
        selected ? selectedColors[type] : colors[type]
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn('p-3 rounded-xl bg-background', iconColors[type])}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {formula.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {formula.description}
          </p>
          <div className="space-y-2">
            {formula.schedule.map((step, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <span className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium',
                  'bg-secondary text-secondary-foreground'
                )}>
                  {index + 1}
                </span>
                <span>{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
};
