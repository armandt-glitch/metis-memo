import { useState, useEffect } from 'react';
import { InstalledPack, PackSettings } from '@/types/pack';
import { FormulaType, CardType } from '@/types/flashcard';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Zap, Clock, Calendar, Target, CreditCard, PenLine, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PackConfigDialogProps {
  pack: InstalledPack | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (packId: string, settings: PackSettings) => void;
}

const formulaOptions: { value: FormulaType; icon: typeof Zap; labelKey: string; descKey: string }[] = [
  { value: 'test', icon: Zap, labelKey: 'formula.test', descKey: 'formula.test.desc' },
  { value: 'short', icon: Clock, labelKey: 'formula.short', descKey: 'formula.short.desc' },
  { value: 'medium', icon: Calendar, labelKey: 'formula.medium', descKey: 'formula.medium.desc' },
  { value: 'long', icon: Target, labelKey: 'formula.long', descKey: 'formula.long.desc' },
];

const cardTypeOptions: { value: 'flashcard' | 'written'; icon: typeof CreditCard; labelKey: string; descKey: string }[] = [
  { value: 'flashcard', icon: CreditCard, labelKey: 'cardType.flashcard', descKey: 'cardType.flashcard.desc' },
  { value: 'written', icon: PenLine, labelKey: 'cardType.written', descKey: 'cardType.written.desc' },
];

const formulaColors: Record<FormulaType, string> = {
  test: 'border-formula-test bg-formula-test/10 text-formula-test',
  short: 'border-formula-short bg-formula-short/10 text-formula-short',
  medium: 'border-formula-medium bg-formula-medium/10 text-formula-medium',
  long: 'border-formula-long bg-formula-long/10 text-formula-long',
};

export const PackConfigDialog = ({
  pack,
  isOpen,
  onClose,
  onSave,
}: PackConfigDialogProps) => {
  const { t } = useLanguage();
  const [cardType, setCardType] = useState<'flashcard' | 'written'>('flashcard');
  const [formula, setFormula] = useState<FormulaType>('medium');

  // Reset form when pack changes
  useEffect(() => {
    if (pack) {
      setCardType(pack.settings?.cardType || 'flashcard');
      setFormula(pack.settings?.formula || 'medium');
    }
  }, [pack]);

  const handleSave = () => {
    if (pack) {
      onSave(pack.packId, { cardType, formula });
      onClose();
    }
  };

  const hasMedia = pack?.hasMedia || false;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('pack.config.title')}</DialogTitle>
          <DialogDescription>
            {pack?.manifest.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Card Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{t('pack.config.cardType')}</Label>
            
            {hasMedia && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{t('pack.config.mediaWarning')}</span>
              </div>
            )}

            <RadioGroup
              value={cardType}
              onValueChange={(value) => setCardType(value as 'flashcard' | 'written')}
              className="grid grid-cols-2 gap-3"
              disabled={hasMedia}
            >
              {cardTypeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = cardType === option.value;
                return (
                  <Label
                    key={option.value}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50",
                      hasMedia && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <RadioGroupItem value={option.value} className="sr-only" />
                    <Icon className={cn("w-6 h-6", isSelected ? "text-primary" : "text-muted-foreground")} />
                    <span className={cn("font-medium text-sm", isSelected ? "text-primary" : "text-foreground")}>
                      {t(option.labelKey)}
                    </span>
                  </Label>
                );
              })}
            </RadioGroup>
          </div>

          {/* Formula Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{t('pack.config.formula')}</Label>
            <RadioGroup
              value={formula}
              onValueChange={(value) => setFormula(value as FormulaType)}
              className="grid grid-cols-2 gap-3"
            >
              {formulaOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = formula === option.value;
                return (
                  <Label
                    key={option.value}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all",
                      isSelected
                        ? formulaColors[option.value]
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <RadioGroupItem value={option.value} className="sr-only" />
                    <Icon className={cn("w-6 h-6", isSelected ? "" : "text-muted-foreground")} />
                    <span className={cn("font-medium text-sm", isSelected ? "" : "text-foreground")}>
                      {t(option.labelKey)}
                    </span>
                  </Label>
                );
              })}
            </RadioGroup>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} className="flex-1">
            {t('common.save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
