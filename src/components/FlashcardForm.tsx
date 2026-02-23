import { useState, useRef } from 'react';
import { FormulaType, CardType, Group } from '@/types/flashcard';
import { FormulaCard } from './FormulaCard';
import { CardTypeSelector } from './CardTypeSelector';
import { GroupSelector } from './GroupSelector';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Plus, ArrowLeft, Upload, X, Image as ImageIcon, Volume2, Type } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { saveImage, generateImageId, createIndexedDBRef } from '@/lib/imageStorage';
import { MathGraph } from './MathGraph';
import { MathKeyboard } from './MathKeyboard';

interface FlashcardFormProps {
  onSubmit: (question: string, answer: string, formula: FormulaType, cardType: CardType, mediaUrl?: string, groupIds?: string[]) => void;
  onBack: () => void;
  groups: Group[];
  onCreateGroup: (name: string, color: string) => void;
}

export const FlashcardForm = ({ onSubmit, onBack, groups, onCreateGroup }: FlashcardFormProps) => {
  const { t } = useLanguage();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [formula, setFormula] = useState<FormulaType>('medium');
  const [cardType, setCardType] = useState<CardType>('flashcard');
  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [mediaData, setMediaData] = useState<string | undefined>(); // base64 data for storage
  const [mediaPreview, setMediaPreview] = useState<string | undefined>(); // for display
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // For graph type
  const [mathFormula, setMathFormula] = useState('');
  
  // For memo type
  const [memoContent, setMemoContent] = useState('');
  const [memoMediaType, setMemoMediaType] = useState<'text' | 'image' | 'audio'>('text');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation based on card type
    if (cardType === 'memo') {
      if (memoMediaType === 'text' && !memoContent.trim()) return;
      if ((memoMediaType === 'image' || memoMediaType === 'audio') && !mediaData) return;
      if (isSubmitting) return;
    } else if (cardType === 'graph') {
      if (!mathFormula.trim() || isSubmitting) return;
    } else {
      if (!question.trim() || !answer.trim() || isSubmitting) return;
    }
    
    setIsSubmitting(true);
    
    try {
      let finalMediaUrl: string | undefined;
      let finalQuestion = question;
      let finalAnswer = answer;
      
      // If we have media data, save to IndexedDB
      if (mediaData && (cardType === 'image' || cardType === 'audio' || cardType === 'memo')) {
        const tempCardId = Math.random().toString(36).substring(2, 9);
        const imageId = generateImageId(tempCardId);
        await saveImage(imageId, mediaData);
        finalMediaUrl = createIndexedDBRef(imageId);
      }
      
      // Handle graph type - always graph as question, formula as answer
      if (cardType === 'graph') {
        finalQuestion = `[GRAPH]${mathFormula}`;
        finalAnswer = mathFormula;
      }
      
      // Handle memo type
      if (cardType === 'memo') {
        finalQuestion = memoContent;
        finalAnswer = '[MEMO]';
      }
      
      onSubmit(finalQuestion, finalAnswer, formula, cardType, finalMediaUrl, groupIds.length > 0 ? groupIds : undefined);
      setQuestion('');
      setAnswer('');
      setGroupIds([]);
      setMediaData(undefined);
      setMediaPreview(undefined);
      setMathFormula('');
      setMemoContent('');
    } catch (error) {
      console.error('Failed to save flashcard with media:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setMediaData(result);
        setMediaPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearMedia = () => {
    setMediaData(undefined);
    setMediaPreview(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const showMediaUpload = cardType === 'image' || cardType === 'audio';
  const acceptType = (cardType === 'memo' && memoMediaType === 'audio') || cardType === 'audio' ? 'audio/*' : 'image/*';
  const isGraphType = cardType === 'graph';
  const isMemoType = cardType === 'memo';
  const showStandardFields = !isGraphType && !isMemoType;

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('form.back')}
      </button>

      <h2 className="text-3xl font-bold text-foreground mb-2">
        {t('form.title')}
      </h2>
      <p className="text-muted-foreground mb-8">
        {t('form.subtitle')}
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Group Selection */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-foreground">
            {t('form.groups')}
          </label>
          <GroupSelector
            groups={groups}
            selectedGroupIds={groupIds}
            onToggle={(id) => setGroupIds(prev => 
              prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
            )}
            onCreateGroup={onCreateGroup}
          />
        </div>

        {/* Card Type Selection */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-foreground">
            {t('form.card.type')}
          </label>
          <CardTypeSelector selected={cardType} onSelect={setCardType} />
        </div>

        {/* Media Upload for Image/Audio types */}
        {showMediaUpload && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-foreground">
              {cardType === 'image' ? t('form.image') : t('form.audio')}
            </label>
            
            {mediaPreview ? (
              <div className="relative">
                {cardType === 'image' ? (
                  <div className="relative rounded-xl overflow-hidden bg-secondary">
                    <img
                      src={mediaPreview}
                      alt="Preview"
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
                  {cardType === 'image' ? t('form.click.add.image') : t('form.click.add.audio')}
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

        {/* Graph type specific fields */}
        {isGraphType && (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-foreground">
                {t('form.math.formula')}
              </label>
              <div className="bg-card border border-border rounded-xl p-4 font-mono text-lg min-h-[50px] flex items-center">
                {mathFormula || <span className="text-muted-foreground">{t('form.math.placeholder')}</span>}
              </div>
              
              <MathKeyboard
                onInsert={(value) => setMathFormula(prev => prev + value)}
                onBackspace={() => setMathFormula(prev => prev.slice(0, -1))}
                onClear={() => setMathFormula('')}
              />
            </div>
            
            {mathFormula && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-foreground">
                  {t('form.graph.preview')}
                </label>
                <MathGraph formula={mathFormula} />
              </div>
            )}
          </div>
        )}

        {/* Memo type specific fields */}
        {isMemoType && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-foreground">
              {t('form.memo.type') || 'Type de contenu'}
            </label>
            <div className="flex gap-4 justify-center">
              <button
                type="button"
                onClick={() => { setMemoMediaType('text'); clearMedia(); }}
                className={`flex flex-col items-center justify-center gap-2 w-24 h-24 rounded-2xl border-2 transition-all ${
                  memoMediaType === 'text'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                }`}
              >
                <Type className="w-10 h-10" />
                <span className="text-xs font-medium">Texte</span>
              </button>
              <button
                type="button"
                onClick={() => { setMemoMediaType('image'); setMemoContent(''); clearMedia(); }}
                className={`flex flex-col items-center justify-center gap-2 w-24 h-24 rounded-2xl border-2 transition-all ${
                  memoMediaType === 'image'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                }`}
              >
                <ImageIcon className="w-10 h-10" />
                <span className="text-xs font-medium">Image</span>
              </button>
              <button
                type="button"
                onClick={() => { setMemoMediaType('audio'); setMemoContent(''); clearMedia(); }}
                className={`flex flex-col items-center justify-center gap-2 w-24 h-24 rounded-2xl border-2 transition-all ${
                  memoMediaType === 'audio'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                }`}
              >
                <Volume2 className="w-10 h-10" />
                <span className="text-xs font-medium">Audio</span>
              </button>
            </div>

            {memoMediaType === 'text' && (
              <Textarea
                value={memoContent}
                onChange={(e) => setMemoContent(e.target.value)}
                placeholder={t('form.memo.placeholder')}
                className="min-h-[150px] resize-none bg-card border-border focus:ring-primary"
              />
            )}

            {/* Media upload for memo image/audio - placed AFTER the type selector */}
            {memoMediaType !== 'text' && showMediaUpload && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-foreground">
                  {memoMediaType === 'image' ? t('form.image') : t('form.audio')}
                </label>
                
                {mediaPreview ? (
                  <div className="relative">
                    {memoMediaType === 'image' ? (
                      <div className="relative rounded-xl overflow-hidden bg-secondary">
                        <img
                          src={mediaPreview}
                          alt="Preview"
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
                      {memoMediaType === 'image' ? (
                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                      ) : (
                        <Volume2 className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-muted-foreground">
                      {memoMediaType === 'image' ? t('form.click.add.image') : t('form.click.add.audio')}
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

            <p className="text-xs text-muted-foreground">
              {t('form.memo.hint')}
            </p>
          </div>
        )}

        {showStandardFields && (
          <>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-foreground">
                {t('form.question')}
              </label>
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={t('form.question.placeholder')}
                className="min-h-[100px] resize-none bg-card border-border focus:ring-primary"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-foreground">
                {t('form.answer')} {cardType === 'written' && t('form.answer.written')}
              </label>
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={t('form.answer.placeholder')}
                className="min-h-[100px] resize-none bg-card border-border focus:ring-primary"
              />
            </div>
          </>
        )}

        <div className="space-y-4">
          <label className="block text-sm font-medium text-foreground">
            {t('form.formula')}
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
          disabled={
            (showStandardFields && (!question.trim() || !answer.trim())) ||
            (isGraphType && !mathFormula.trim()) ||
            (isMemoType && memoMediaType === 'text' && !memoContent.trim()) ||
            (isMemoType && memoMediaType !== 'text' && !mediaData) ||
            isSubmitting
          }
        >
          <Plus className="w-5 h-5" />
          {isSubmitting ? t('form.saving') || 'Enregistrement...' : t('form.create')}
        </Button>
      </form>
    </div>
  );
};
