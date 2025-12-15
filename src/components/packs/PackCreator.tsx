import { useState, useEffect, useRef } from 'react';
import { Flashcard, FormulaType, CardType } from '@/types/flashcard';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Package, 
  Save,
  GripVertical,
  CheckCircle,
  X,
  RotateCcw,
  PenLine,
  Image,
  Volume2,
  Upload
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PackCard {
  id: string;
  question: string;
  answer: string;
  cardType: CardType;
  mediaUrl?: string;
  isNew: boolean;
}

interface PackCreatorProps {
  existingFlashcards: Flashcard[];
  onBack: () => void;
  onPublish: () => void;
}

const THEMES = ['Langues', 'Sciences', 'Histoire', 'Géographie', 'Mathématiques', 'Culture générale', 'Informatique', 'Autre'];
const LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

export const PackCreator = ({ existingFlashcards, onBack, onPublish }: PackCreatorProps) => {
  const { t } = useLanguage();
  
  // Pack metadata
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [theme, setTheme] = useState('');
  const [level, setLevel] = useState<typeof LEVELS[number]>('beginner');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Cards
  const [packCards, setPackCards] = useState<PackCard[]>([]);
  const [selectedExisting, setSelectedExisting] = useState<Set<string>>(new Set());
  
  // UI state
  const [isPublishing, setIsPublishing] = useState(false);
  const [showExistingPicker, setShowExistingPicker] = useState(false);
  
  // File input refs
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const addNewCard = () => {
    setPackCards(prev => [...prev, {
      id: generateId(),
      question: '',
      answer: '',
      cardType: 'flashcard',
      isNew: true
    }]);
  };

  const updateCard = (id: string, field: 'question' | 'answer' | 'cardType' | 'mediaUrl', value: string) => {
    setPackCards(prev => prev.map(card => 
      card.id === id ? { ...card, [field]: value } : card
    ));
  };

  const removeCard = (id: string) => {
    setPackCards(prev => prev.filter(card => card.id !== id));
  };

  const handleCardTypeClick = (cardId: string, type: CardType) => {
    updateCard(cardId, 'cardType', type);
    
    // Trigger file picker for image/audio types
    if (type === 'image' || type === 'audio') {
      setTimeout(() => {
        const input = fileInputRefs.current[`${cardId}-${type}`];
        if (input) input.click();
      }, 100);
    }
  };

  const handleFileChange = (cardId: string, type: 'image' | 'audio', file: File | null) => {
    if (!file) return;
    
    // Validate file type
    if (type === 'image' && !file.type.startsWith('image/')) {
      toast({ title: t('pack.creator.error.invalidImage'), variant: 'destructive' });
      return;
    }
    if (type === 'audio' && !file.type.startsWith('audio/')) {
      toast({ title: t('pack.creator.error.invalidAudio'), variant: 'destructive' });
      return;
    }
    
    // Create object URL for preview
    const url = URL.createObjectURL(file);
    updateCard(cardId, 'mediaUrl', url);
  };

  const removeMedia = (cardId: string) => {
    const card = packCards.find(c => c.id === cardId);
    if (card?.mediaUrl) {
      URL.revokeObjectURL(card.mediaUrl);
    }
    updateCard(cardId, 'mediaUrl', '');
  };

  const toggleExistingCard = (cardId: string) => {
    setSelectedExisting(prev => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  const addSelectedExisting = () => {
    const cardsToAdd: PackCard[] = existingFlashcards
      .filter(fc => selectedExisting.has(fc.id))
      .map(fc => ({
        id: generateId(),
        question: fc.question,
        answer: fc.answer,
        cardType: fc.cardType || 'flashcard',
        mediaUrl: fc.mediaUrl,
        isNew: false
      }));
    
    setPackCards(prev => [...prev, ...cardsToAdd]);
    setSelectedExisting(new Set());
    setShowExistingPicker(false);
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const handlePublish = async () => {
    // Validation
    if (!title.trim()) {
      toast({ title: t('pack.creator.error.title'), variant: 'destructive' });
      return;
    }
    if (!description.trim()) {
      toast({ title: t('pack.creator.error.description'), variant: 'destructive' });
      return;
    }
    if (packCards.length < 3) {
      toast({ title: t('pack.creator.error.minCards'), variant: 'destructive' });
      return;
    }
    
    const validCards = packCards.filter(c => c.question.trim() && c.answer.trim());
    if (validCards.length < 3) {
      toast({ title: t('pack.creator.error.invalidCards'), variant: 'destructive' });
      return;
    }

    setIsPublishing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: t('pack.creator.error.notLoggedIn'), variant: 'destructive' });
        setIsPublishing(false);
        return;
      }

      const packId = `user-${user.id}-${Date.now()}`;
      const cards = validCards.map((card, index) => ({
        id: `${packId}-card-${index}`,
        question: card.question,
        answer: card.answer,
        cardType: card.cardType
      }));

      const { error } = await supabase.from('published_packs').insert({
        user_id: user.id,
        pack_id: packId,
        title: title.trim(),
        description: description.trim(),
        theme: theme || null,
        level,
        tags,
        card_count: cards.length,
        cards,
        has_media: false,
        is_approved: false
      });

      if (error) throw error;

      toast({ title: t('pack.creator.success') });
      onPublish();
    } catch (error) {
      console.error('Error publishing pack:', error);
      toast({ title: t('pack.creator.error.publish'), variant: 'destructive' });
    } finally {
      setIsPublishing(false);
    }
  };

  const getLevelLabel = (lvl: string) => {
    switch (lvl) {
      case 'beginner': return t('packs.level.beginner');
      case 'intermediate': return t('packs.level.intermediate');
      case 'advanced': return t('packs.level.advanced');
      default: return lvl;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            {t('pack.creator.title')}
          </h1>
          <p className="text-muted-foreground">{t('pack.creator.subtitle')}</p>
        </div>
      </div>

      {/* Pack Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('pack.creator.info')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t('pack.creator.packTitle')} *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('pack.creator.titlePlaceholder')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="theme">{t('pack.creator.theme')}</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger>
                  <SelectValue placeholder={t('pack.creator.selectTheme')} />
                </SelectTrigger>
                <SelectContent>
                  {THEMES.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('pack.creator.description')} *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('pack.creator.descriptionPlaceholder')}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('pack.creator.level')}</Label>
              <Select value={level} onValueChange={(v) => setLevel(v as typeof LEVELS[number])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map(l => (
                    <SelectItem key={l} value={l}>{getLevelLabel(l)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('pack.creator.tags')}</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder={t('pack.creator.tagPlaceholder')}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {t('pack.creator.cards')} ({packCards.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowExistingPicker(true)}>
                <CheckCircle className="h-4 w-4 mr-1" />
                {t('pack.creator.addExisting')}
              </Button>
              <Button size="sm" onClick={addNewCard}>
                <Plus className="h-4 w-4 mr-1" />
                {t('pack.creator.addNew')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {packCards.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('pack.creator.noCards')}</p>
            </div>
          ) : (
            packCards.map((card, index) => (
              <div key={card.id} className="flex gap-3 items-start p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 text-muted-foreground pt-2">
                  <GripVertical className="h-4 w-4" />
                  <span className="text-sm font-medium w-6">{index + 1}</span>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">{t('pack.creator.question')}</Label>
                      <Textarea
                        value={card.question}
                        onChange={(e) => updateCard(card.id, 'question', e.target.value)}
                        placeholder={t('pack.creator.questionPlaceholder')}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">{t('pack.creator.answer')}</Label>
                      <Textarea
                        value={card.answer}
                        onChange={(e) => updateCard(card.id, 'answer', e.target.value)}
                        placeholder={t('pack.creator.answerPlaceholder')}
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">{t('pack.creator.cardType')}</Label>
                    <div className="flex gap-1">
                      {(['flashcard', 'written', 'image', 'audio'] as CardType[]).map((type) => {
                        const IconMap = {
                          flashcard: RotateCcw,
                          written: PenLine,
                          image: Image,
                          audio: Volume2
                        };
                        const Icon = IconMap[type];
                        const isSelected = card.cardType === type;
                        return (
                          <Button
                            key={type}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => handleCardTypeClick(card.id, type)}
                            title={t(`cardtype.${type}`)}
                          >
                            <Icon className="h-4 w-4" />
                          </Button>
                        );
                      })}
                    </div>
                    
                    {/* Hidden file inputs */}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={(el) => { fileInputRefs.current[`${card.id}-image`] = el; }}
                      onChange={(e) => handleFileChange(card.id, 'image', e.target.files?.[0] || null)}
                    />
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      ref={(el) => { fileInputRefs.current[`${card.id}-audio`] = el; }}
                      onChange={(e) => handleFileChange(card.id, 'audio', e.target.files?.[0] || null)}
                    />
                  </div>
                  
                  {/* Media preview */}
                  {card.mediaUrl && (card.cardType === 'image' || card.cardType === 'audio') && (
                    <div className="flex items-center gap-2 p-2 bg-background rounded-lg border">
                      {card.cardType === 'image' ? (
                        <img 
                          src={card.mediaUrl} 
                          alt="Preview" 
                          className="h-16 w-16 object-cover rounded"
                        />
                      ) : (
                        <audio 
                          src={card.mediaUrl} 
                          controls 
                          className="h-10 max-w-[200px]"
                        />
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeMedia(card.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        {t('common.remove')}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRefs.current[`${card.id}-${card.cardType}`]?.click()}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        {t('common.change')}
                      </Button>
                    </div>
                  )}
                  
                  {/* Upload prompt for image/audio without media */}
                  {!card.mediaUrl && (card.cardType === 'image' || card.cardType === 'audio') && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full border-dashed"
                      onClick={() => fileInputRefs.current[`${card.id}-${card.cardType}`]?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {card.cardType === 'image' ? t('pack.creator.uploadImage') : t('pack.creator.uploadAudio')}
                    </Button>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#780000] hover:text-[#780000] hover:bg-[#780000]/10"
                  onClick={() => removeCard(card.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Existing Cards Picker Modal */}
      {showExistingPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle>{t('pack.creator.selectExisting')}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowExistingPicker(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-2">
              {existingFlashcards.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">{t('pack.creator.noExisting')}</p>
              ) : (
                existingFlashcards.map(fc => (
                  <div
                    key={fc.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleExistingCard(fc.id)}
                  >
                    <Checkbox checked={selectedExisting.has(fc.id)} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{fc.question}</p>
                      <p className="text-sm text-muted-foreground truncate">{fc.answer}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
            <div className="flex-shrink-0 p-4 border-t flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowExistingPicker(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={addSelectedExisting} disabled={selectedExisting.size === 0}>
                {t('pack.creator.addSelected')} ({selectedExisting.size})
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Publish Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onBack}>
          {t('common.cancel')}
        </Button>
        <Button onClick={handlePublish} disabled={isPublishing}>
          <Save className="h-4 w-4 mr-2" />
          {isPublishing ? t('pack.creator.publishing') : t('pack.creator.publish')}
        </Button>
      </div>
    </div>
  );
};
