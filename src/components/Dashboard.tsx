import { useState } from 'react';
import { Flashcard, FORMULAS, Group, GROUP_COLORS } from '@/types/flashcard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Play, Brain, Clock, CheckCircle2, Trash2, FolderOpen, ArrowLeft, RotateCcw, Sparkles, FolderPlus, X, Check, Pencil } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { GroupFilter } from './GroupFilter';
import { ColorPicker } from './ColorPicker';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type ViewMode = 'dashboard' | 'memorized';

interface DashboardProps {
  flashcards: Flashcard[];
  stats: { total: number; completed: number; dueNow: number };
  groups: Group[];
  cardCountsByGroup: Record<string, number>;
  onCreateNew: () => void;
  onStartReview: () => void;
  onReviewCard: (id: string) => void;
  onDeleteCard: (id: string) => void;
  onDeleteGroup: (id: string) => void;
  onReopenCard: (id: string) => void;
  onStartThematicQuiz: (groupId: string) => void;
  onToggleCardGroup: (cardId: string, groupId: string) => void;
  onClearCardGroups: (cardId: string) => void;
  onCreateGroup: (name: string, color: string) => void;
  onEditCard: (card: Flashcard) => void;
  getGroup: (id: string) => Group | undefined;
}

const formulaColors = {
  short: 'bg-formula-short/10 text-formula-short border-formula-short/20',
  medium: 'bg-formula-medium/10 text-formula-medium border-formula-medium/20',
  long: 'bg-formula-long/10 text-formula-long border-formula-long/20',
};

export const Dashboard = ({
  flashcards,
  stats,
  groups,
  cardCountsByGroup,
  onCreateNew,
  onStartReview,
  onReviewCard,
  onDeleteCard,
  onDeleteGroup,
  onReopenCard,
  onStartThematicQuiz,
  onToggleCardGroup,
  onClearCardGroups,
  onCreateGroup,
  onEditCard,
  getGroup,
}: DashboardProps) => {
  const { t, language } = useLanguage();
  const dateLocale = language === 'fr' ? fr : enUS;
  
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState(GROUP_COLORS[0].value);

  const getFormulaName = (type: string) => {
    return t(`formula.${type}`);
  };

  const filteredFlashcards = selectedGroupId === null
    ? flashcards
    : selectedGroupId === 'ungrouped'
    ? flashcards.filter((c) => !c.groupIds || c.groupIds.length === 0)
    : flashcards.filter((c) => c.groupIds?.includes(selectedGroupId));

  const memorizedCards = flashcards.filter((c) => c.completed);

  const upcomingCards = filteredFlashcards
    .filter((c) => !c.completed)
    .sort((a, b) => new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime())
    .slice(0, 10);

  const getCardGroups = (card: Flashcard): Group[] => {
    if (!card.groupIds || card.groupIds.length === 0) return [];
    return card.groupIds.map(id => getGroup(id)).filter((g): g is Group => g !== undefined);
  };

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      onCreateGroup(newGroupName.trim(), newGroupColor);
      setNewGroupName('');
      setNewGroupColor(GROUP_COLORS[0].value);
      setIsCreatingGroup(false);
    }
  };

  if (viewMode === 'memorized') {
    return (
      <div className="animate-slide-up">
        <Button
          variant="ghost"
          onClick={() => setViewMode('dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('dashboard.back')}
        </Button>

        <h2 className="text-2xl font-bold text-foreground mb-6">
          {t('dashboard.memorized.title')} ({memorizedCards.length})
        </h2>

        {memorizedCards.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {t('dashboard.no.memorized')}
            </h3>
            <p className="text-muted-foreground">
              {t('dashboard.no.memorized.desc')}
            </p>
          </div>
        ) : (
          <div className="bg-card rounded-2xl p-6 shadow-soft">
            <div className="space-y-3">
              {memorizedCards.map((card) => {
                const cardGroups = getCardGroups(card);
                return (
                  <div
                    key={card.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 group"
                  >
                    <div className="p-2 rounded-lg bg-accent/10">
                      <CheckCircle2 className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {card.question}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {cardGroups.map((cardGroup) => (
                          <span
                            key={cardGroup.id}
                            className="text-xs px-2 py-0.5 rounded-full text-white flex items-center gap-1"
                            style={{ backgroundColor: cardGroup.color }}
                          >
                            <FolderOpen className="w-3 h-3" />
                            {cardGroup.name}
                          </span>
                        ))}
                        <span
                          className={cn(
                            'text-xs px-2 py-0.5 rounded-full border',
                            formulaColors[card.formula as keyof typeof formulaColors]
                          )}
                        >
                          {getFormulaName(card.formula)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onReopenCard(card.id)}
                      className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-all"
                      title={t('dashboard.reopen')}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteCard(card.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-card rounded-2xl p-6 shadow-soft">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">{t('dashboard.cards.created')}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-soft">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent/10">
              <Clock className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.dueNow}</p>
              <p className="text-sm text-muted-foreground">{t('dashboard.review.now')}</p>
            </div>
          </div>
        </div>

        <div 
          className="bg-card rounded-2xl p-6 shadow-soft cursor-pointer hover:shadow-card transition-shadow"
          onClick={() => setViewMode('memorized')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent/10">
              <CheckCircle2 className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
              <p className="text-sm text-muted-foreground">{t('dashboard.memorized')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Group Filter */}
      {(groups.length > 0 || flashcards.some(c => !c.groupIds || c.groupIds.length === 0)) && (
        <GroupFilter
          groups={groups}
          selectedGroupId={selectedGroupId}
          onSelect={setSelectedGroupId}
          onDeleteGroup={onDeleteGroup}
          cardCounts={cardCountsByGroup}
        />
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Button variant="hero" size="xl" onClick={onCreateNew} className="flex-1">
          <Plus className="w-5 h-5" />
          {t('dashboard.new.card')}
        </Button>
        {stats.dueNow > 0 && (
          <Button variant="hero-outline" size="xl" onClick={onStartReview} className="flex-1">
            <Play className="w-5 h-5" />
            {t('dashboard.review')} ({stats.dueNow})
          </Button>
        )}
      </div>

      {/* Quizz thématique */}
      {groups.length > 0 && (
        <div className="bg-card rounded-2xl p-6 shadow-soft mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            {t('dashboard.thematic.quiz')}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t('dashboard.thematic.quiz.desc')}
          </p>
          <div className="flex flex-wrap gap-2">
            {groups.map((group) => {
              const count = cardCountsByGroup[group.id] || 0;
              return (
                <button
                  key={group.id}
                  onClick={() => count > 0 && onStartThematicQuiz(group.id)}
                  disabled={count === 0}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                    count > 0
                      ? "text-white hover:opacity-80"
                      : "bg-secondary text-muted-foreground cursor-not-allowed"
                  )}
                  style={count > 0 ? { backgroundColor: group.color } : undefined}
                >
                  <FolderOpen className="w-4 h-4" />
                  {group.name} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming reviews */}
      {upcomingCards.length > 0 && (
        <div className="bg-card rounded-2xl p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {t('dashboard.upcoming')}
          </h3>
          <div className="space-y-3">
            {upcomingCards.map((card) => {
              const isDue = new Date(card.nextReviewAt) <= new Date();
              const cardGroups = getCardGroups(card);
              return (
                <div
                  key={card.id}
                  onClick={() => onReviewCard(card.id)}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors group cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground line-clamp-2 sm:truncate">
                      {card.question}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className={cn(
                              "text-xs px-2 py-0.5 rounded-full flex items-center gap-1 transition-all hover:opacity-80",
                              cardGroups.length > 0
                                ? "text-white"
                                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                            )}
                            style={cardGroups.length > 0 ? { backgroundColor: cardGroups[0].color } : undefined}
                          >
                            {cardGroups.length > 0 ? (
                              <>
                                <FolderOpen className="w-3 h-3" />
                                {cardGroups.length === 1 ? cardGroups[0].name : `${cardGroups.length} ${t('dashboard.groups')}`}
                              </>
                            ) : (
                              <>
                                <FolderPlus className="w-3 h-3" />
                                {t('dashboard.add.group')}
                              </>
                            )}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-2" align="start">
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground px-2 pb-1">
                              {t('dashboard.manage.groups')}
                            </p>
                            {cardGroups.length > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onClearCardGroups(card.id);
                                }}
                                className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-secondary flex items-center gap-2 text-muted-foreground"
                              >
                                <X className="w-3 h-3" />
                                {t('dashboard.remove.all.groups')}
                              </button>
                            )}
                            {groups.map((group) => {
                              const isInGroup = card.groupIds?.includes(group.id);
                              return (
                                <button
                                  key={group.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleCardGroup(card.id, group.id);
                                  }}
                                  className={cn(
                                    "w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-secondary flex items-center gap-2",
                                    isInGroup && "bg-secondary"
                                  )}
                                >
                                  <div
                                    className="w-3 h-3 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: group.color }}
                                  >
                                    {isInGroup && <Check className="w-2 h-2 text-white" />}
                                  </div>
                                  {group.name}
                                </button>
                              );
                            })}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsCreatingGroup(true);
                              }}
                              className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-secondary flex items-center gap-2 text-primary"
                            >
                              <Plus className="w-3 h-3" />
                              {t('dashboard.new.group')}
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full border',
                          formulaColors[card.formula as keyof typeof formulaColors]
                        )}
                      >
                        {getFormulaName(card.formula)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t('dashboard.step')} {card.currentStep + 1}/{FORMULAS[card.formula].schedule.length}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 mt-2 sm:mt-0">
                    <p
                      className={cn(
                        'text-sm font-medium',
                        isDue ? 'text-accent' : 'text-muted-foreground'
                      )}
                    >
                      {isDue
                        ? t('dashboard.now')
                        : formatDistanceToNow(new Date(card.nextReviewAt), {
                            addSuffix: true,
                            locale: dateLocale,
                          })}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditCard(card);
                        }}
                        className="sm:opacity-0 sm:group-hover:opacity-100 p-2 rounded-lg hover:bg-primary/10 text-primary transition-all"
                        title={t('dashboard.edit')}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCard(card.id);
                        }}
                        className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {flashcards.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {t('dashboard.no.cards')}
          </h3>
          <p className="text-muted-foreground mb-6">
            {t('dashboard.no.cards.desc')}
          </p>
        </div>
      )}

      {/* Dialog for creating new group */}
      <Dialog open={isCreatingGroup} onOpenChange={setIsCreatingGroup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dashboard.create.group')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('dashboard.group.name')}</label>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Ex: History, General knowledge..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('dashboard.color')}</label>
              <ColorPicker value={newGroupColor} onChange={setNewGroupColor} />
            </div>
            <Button
              onClick={handleCreateGroup}
              disabled={!newGroupName.trim()}
              className="w-full"
            >
              {t('dashboard.create.group.btn')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
