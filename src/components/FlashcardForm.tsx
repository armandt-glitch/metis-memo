import { useState, useRef } from 'react';
import { FormulaType, CardType } from '@/types/flashcard';
import { FormulaCard } from './FormulaCard';
import { CardTypeSelector } from './CardTypeSelector';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Plus, ArrowLeft, Upload, X, Image as ImageIcon, Volume2 } from 'lucide-react';

interface FlashcardFormProps {
  onSubmit: (question: string, answer: string, formula: FormulaType, cardType: CardType, mediaUrl?: string) => void;
  onBack: () => void;
}

export const FlashcardForm = ({ onSubmit, onBack }: FlashcardFormProps) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [formula, setFormula] = useState<FormulaType>('medium');
  const [cardType, setCardType] = useState<CardType>('flashcard');
  const [mediaUrl, setMediaUrl] = useState<string | undefined>();
  const [mediaPreview, setMediaPreview] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && answer.trim()) {
      onSubmit(question, answer, formula, cardType, mediaUrl);
      setQuestion('');
      setAnswer('');
      setMediaUrl(undefined);
      setMediaPreview(undefined);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setMediaUrl(result);
        setMediaPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearMedia = () => {
    setMediaUrl(undefined);
    setMediaPreview(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const showMediaUpload = cardType === 'image' || cardType === 'audio';
  const acceptType = cardType === 'image' ? 'image/*' : 'audio/*';

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
        {/* Card Type Selection */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-foreground">
            Type de fiche
          </label>
          <CardTypeSelector selected={cardType} onSelect={setCardType} />
        </div>

        {/* Media Upload for Image/Audio types */}
        {showMediaUpload && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-foreground">
              {cardType === 'image' ? 'Image' : 'Fichier audio'}
            </label>
            
            {mediaPreview ? (
              <div className="relative">
                {cardType === 'image' ? (
                  <div className="relative rounded-xl overflow-hidden bg-secondary">
                    <img
                      src={mediaPreview}
                      alt="Aperçu"
                      className="w-full h-48 object-contain"
                    />
                  </div>
                ) : (
                  <div className="bg-secondary rounded-xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Volume2 className="w-6 h-6 text-primary" />
                    </div>
                    <audio controls src={mediaPreview} className="flex-1" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={clearMedia}
                  className="absolute top-2 right-2 w-8 h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mx-auto mb-4">
                  {cardType === 'image' ? (
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                  ) : (
                    <Volume2 className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <p className="text-muted-foreground">
                  Cliquez pour ajouter {cardType === 'image' ? 'une image' : 'un fichier audio'}
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptType}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

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
            Réponse {cardType === 'written' && '(l\'utilisateur devra taper cette réponse)'}
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
            {(['test', 'short', 'medium', 'long'] as FormulaType[]).map((type) => (
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
          disabled={!question.trim() || !answer.trim() || (showMediaUpload && !mediaUrl)}
        >
          <Plus className="w-5 h-5" />
          Créer la fiche
        </Button>
      </form>
    </div>
  );
};
