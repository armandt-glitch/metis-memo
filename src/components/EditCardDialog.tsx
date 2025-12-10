import { useState, useEffect, useRef } from 'react';
import { Flashcard, FormulaType, CardType, Group, GROUP_COLORS } from '@/types/flashcard';
import { FormulaCard } from './FormulaCard';
import { CardTypeSelector } from './CardTypeSelector';
import { ColorPicker } from './ColorPicker';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Plus, Upload, X, Image as ImageIcon, Volume2, FolderOpen, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface EditCardDialogProps {
  card: Flashcard | null;
  groups: Group[];
  onClose: () => void;
  onSave: (id: string, updates: Partial<Flashcard>) => void;
  onCreateGroup: (name: string, color: string) => void;
}

export const EditCardDialog = ({ card, groups, onClose, onSave, onCreateGroup }: EditCardDialogProps) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [formula, setFormula] = useState<FormulaType>('medium');
  const [cardType, setCardType] = useState<CardType>('flashcard');
  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [mediaUrl, setMediaUrl] = useState<string | undefined>();
  const [mediaPreview, setMediaPreview] = useState<string | undefined>();
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState(GROUP_COLORS[0].value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (card) {
      setQuestion(card.question);
      setAnswer(card.answer);
      setFormula(card.formula);
      setCardType(card.cardType);
      setGroupIds(card.groupIds || []);
      setMediaUrl(card.mediaUrl);
      setMediaPreview(card.mediaUrl);
    }
  }, [card]);

  const handleSave = () => {
    if (card && question.trim() && answer.trim()) {
      onSave(card.id, {
        question,
        answer,
        formula,
        cardType,
        groupIds: groupIds.length > 0 ? groupIds : undefined,
        mediaUrl,
      });
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

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      onCreateGroup(newGroupName.trim(), newGroupColor);
      setNewGroupName('');
      setNewGroupColor(GROUP_COLORS[0].value);
      setIsCreatingGroup(false);
    }
  };

  const toggleGroup = (id: string) => {
    setGroupIds(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const showMediaUpload = cardType === 'image' || cardType === 'audio';
  const acceptType = cardType === 'image' ? 'image/*' : 'audio/*';

  return (
    <>
      <Dialog open={!!card} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier la fiche</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Group Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground">
                Groupes
              </label>
              <div className="flex flex-wrap gap-2">
                {groupIds.length === 0 && (
                  <span className="px-3 py-2 rounded-lg text-sm font-medium bg-secondary text-muted-foreground border border-border">
                    Sans groupe
                  </span>
                )}
                
                {groups.map((group) => {
                  const isSelected = groupIds.includes(group.id);
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => toggleGroup(group.id)}
                      className={cn(
                        'px-3 py-2 rounded-lg text-sm font-medium transition-all border flex items-center gap-2',
                        isSelected
                          ? 'text-white border-transparent'
                          : 'bg-secondary text-foreground border-border hover:bg-secondary/80'
                      )}
                      style={{
                        backgroundColor: isSelected ? group.color : undefined,
                      }}
                    >
                      {isSelected && <Check className="w-4 h-4" />}
                      <FolderOpen className="w-4 h-4" />
                      {group.name}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setIsCreatingGroup(true)}
                  className="px-3 py-2 rounded-lg text-sm font-medium bg-secondary text-muted-foreground border border-dashed border-border hover:bg-secondary/80 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nouveau groupe
                </button>
              </div>
            </div>

            {/* Card Type Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground">
                Type de fiche
              </label>
              <CardTypeSelector selected={cardType} onSelect={setCardType} />
            </div>

            {/* Media Upload for Image/Audio types */}
            {showMediaUpload && (
              <div className="space-y-3">
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

            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground">
                Question
              </label>
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Entrez votre question..."
                className="min-h-[80px] resize-none bg-card border-border focus:ring-primary"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground">
                Réponse {cardType === 'written' && '(l\'utilisateur devra taper cette réponse)'}
              </label>
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Entrez la réponse..."
                className="min-h-[80px] resize-none bg-card border-border focus:ring-primary"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground">
                Formule de révision
              </label>
              <div className="grid gap-3">
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

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1"
                disabled={!question.trim() || !answer.trim() || (showMediaUpload && !mediaUrl)}
              >
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog for creating new group */}
      <Dialog open={isCreatingGroup} onOpenChange={setIsCreatingGroup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un groupe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom du groupe</label>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Ex: Histoire, Culture générale..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Couleur</label>
              <ColorPicker value={newGroupColor} onChange={setNewGroupColor} />
            </div>
            <Button
              onClick={handleCreateGroup}
              disabled={!newGroupName.trim()}
              className="w-full"
            >
              Créer le groupe
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};