import { useState } from 'react';
import { FormulaType } from '@/types/flashcard';
import { FormulaCard } from './FormulaCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, ArrowLeft } from 'lucide-react';

interface FlashcardFormProps {
  onSubmit: (question: string, answer: string, formula: FormulaType) => void;
  onBack: () => void;
}

export const FlashcardForm = ({ onSubmit, onBack }: FlashcardFormProps) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [formula, setFormula] = useState<FormulaType>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && answer.trim()) {
      onSubmit(question, answer, formula);
      setQuestion('');
      setAnswer('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      <h2 className="text-3xl font-bold text-foreground mb-2">
        Nouvelle fiche
      </h2>
      <p className="text-muted-foreground mb-8">
        Créez une fiche de révision et choisissez votre formule de mémorisation
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-foreground">
            Question
          </label>
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Entrez votre question..."
            className="min-h-[100px] resize-none bg-card border-border focus:ring-primary"
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-foreground">
            Réponse
          </label>
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Entrez la réponse..."
            className="min-h-[100px] resize-none bg-card border-border focus:ring-primary"
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-foreground">
            Formule de révision
          </label>
          <div className="grid gap-4">
            {(['short', 'medium', 'long'] as FormulaType[]).map((type) => (
              <FormulaCard
                key={type}
                type={type}
                selected={formula === type}
                onSelect={() => setFormula(type)}
              />
            ))}
          </div>
        </div>

        <Button
          type="submit"
          variant="hero"
          size="xl"
          className="w-full"
          disabled={!question.trim() || !answer.trim()}
        >
          <Plus className="w-5 h-5" />
          Créer la fiche
        </Button>
      </form>
    </div>
  );
};
