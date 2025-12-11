import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, BookOpen, Globe, FlaskConical, Landmark } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FormulaType, CardType } from '@/types/flashcard';

const THEMES = [
  { id: 'culture', name: 'Culture générale', icon: BookOpen, color: 'bg-purple-500' },
  { id: 'histoire', name: 'Histoire', icon: Landmark, color: 'bg-amber-500' },
  { id: 'sciences', name: 'Sciences', icon: FlaskConical, color: 'bg-emerald-500' },
  { id: 'geographie', name: 'Géographie', icon: Globe, color: 'bg-blue-500' },
];

interface CardGeneratorProps {
  onCardsGenerated: (cards: Array<{ question: string; answer: string; formula: FormulaType; cardType: CardType; groupIds?: string[] }>) => void;
}

export const CardGenerator = ({ onCardsGenerated }: CardGeneratorProps) => {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCards, setGeneratedCards] = useState<Array<{ question: string; answer: string }>>([]);

  const handleGenerate = async (themeId: string) => {
    setSelectedTheme(themeId);
    setIsGenerating(true);
    setGeneratedCards([]);

    try {
      const { data, error } = await supabase.functions.invoke('generate-flashcards', {
        body: { theme: themeId, count: 5 },
      });

      if (error) throw error;

      if (data.flashcards && data.flashcards.length > 0) {
        setGeneratedCards(data.flashcards);
        toast.success(`${data.flashcards.length} cartes générées sur ${data.theme}`);
      } else {
        throw new Error('Aucune carte générée');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Erreur lors de la génération des cartes');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddCards = () => {
    const cardsToAdd = generatedCards.map(card => ({
      question: card.question,
      answer: card.answer,
      formula: 'medium' as FormulaType,
      cardType: 'flashcard' as CardType,
    }));
    
    onCardsGenerated(cardsToAdd);
    setGeneratedCards([]);
    setSelectedTheme(null);
    toast.success(`${cardsToAdd.length} cartes ajoutées à votre collection`);
  };

  return (
    <Card className="border-dashed border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Générateur de cartes IA
        </CardTitle>
        <CardDescription>
          Générez automatiquement des flashcards sur différents thèmes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {THEMES.map((theme) => {
            const Icon = theme.icon;
            return (
              <Button
                key={theme.id}
                variant={selectedTheme === theme.id ? 'default' : 'outline'}
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => handleGenerate(theme.id)}
                disabled={isGenerating}
              >
                {isGenerating && selectedTheme === theme.id ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <div className={`p-2 rounded-full ${theme.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                )}
                <span className="text-xs font-medium">{theme.name}</span>
              </Button>
            );
          })}
        </div>

        {generatedCards.length > 0 && (
          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">{generatedCards.length} cartes générées</Badge>
              <Button onClick={handleAddCards} size="sm">
                Ajouter toutes les cartes
              </Button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {generatedCards.map((card, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-muted/50 border border-border/50"
                >
                  <p className="text-sm font-medium text-foreground">{card.question}</p>
                  <p className="text-xs text-muted-foreground mt-1">{card.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
