import { Flashcard, FORMULAS } from '@/types/flashcard';
import { Button } from '@/components/ui/button';
import { Plus, Play, Brain, Clock, CheckCircle2, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DashboardProps {
  flashcards: Flashcard[];
  stats: { total: number; completed: number; dueNow: number };
  onCreateNew: () => void;
  onStartReview: () => void;
  onDeleteCard: (id: string) => void;
}

const formulaColors = {
  short: 'bg-formula-short/10 text-formula-short border-formula-short/20',
  medium: 'bg-formula-medium/10 text-formula-medium border-formula-medium/20',
  long: 'bg-formula-long/10 text-formula-long border-formula-long/20',
};

export const Dashboard = ({
  flashcards,
  stats,
  onCreateNew,
  onStartReview,
  onDeleteCard,
}: DashboardProps) => {
  const upcomingCards = flashcards
    .filter((c) => !c.completed)
    .sort((a, b) => new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime())
    .slice(0, 5);

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
              <p className="text-sm text-muted-foreground">Fiches créées</p>
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
              <p className="text-sm text-muted-foreground">À réviser maintenant</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-soft">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-500/10">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
              <p className="text-sm text-muted-foreground">Mémorisées</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Button variant="hero" size="xl" onClick={onCreateNew} className="flex-1">
          <Plus className="w-5 h-5" />
          Nouvelle fiche
        </Button>
        {stats.dueNow > 0 && (
          <Button variant="hero-outline" size="xl" onClick={onStartReview} className="flex-1">
            <Play className="w-5 h-5" />
            Réviser ({stats.dueNow})
          </Button>
        )}
      </div>

      {/* Upcoming reviews */}
      {upcomingCards.length > 0 && (
        <div className="bg-card rounded-2xl p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Prochaines révisions
          </h3>
          <div className="space-y-3">
            {upcomingCards.map((card) => {
              const isDue = new Date(card.nextReviewAt) <= new Date();
              return (
                <div
                  key={card.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {card.question}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full border',
                          formulaColors[card.formula]
                        )}
                      >
                        {FORMULAS[card.formula].name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Étape {card.currentStep + 1}/{FORMULAS[card.formula].schedule.length}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        'text-sm font-medium',
                        isDue ? 'text-accent' : 'text-muted-foreground'
                      )}
                    >
                      {isDue
                        ? 'Maintenant'
                        : formatDistanceToNow(new Date(card.nextReviewAt), {
                            addSuffix: true,
                            locale: fr,
                          })}
                    </p>
                  </div>
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

      {flashcards.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Aucune fiche pour le moment
          </h3>
          <p className="text-muted-foreground mb-6">
            Créez votre première fiche pour commencer à mémoriser !
          </p>
        </div>
      )}
    </div>
  );
};
