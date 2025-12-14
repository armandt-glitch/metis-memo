import { PackManifest, PackDownloadProgress } from '@/types/pack';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Download,
  CheckCircle,
  Loader2,
  Star,
  BookOpen,
  User,
  Calendar,
  Tag,
  HardDrive,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PackDetailDialogProps {
  pack: PackManifest | null;
  isOpen: boolean;
  onClose: () => void;
  isInstalled: boolean;
  progress?: PackDownloadProgress;
  onDownload: () => void;
  formatFileSize: (bytes: number) => string;
}

export const PackDetailDialog = ({
  pack,
  isOpen,
  onClose,
  isInstalled,
  progress,
  onDownload,
  formatFileSize,
}: PackDetailDialogProps) => {
  const { t } = useLanguage();
  
  if (!pack) return null;

  const isDownloading = progress && ['downloading', 'extracting', 'importing'].includes(progress.status);

  const getLevelLabel = (level?: string) => {
    switch (level) {
      case 'beginner': return t('packs.level.beginner');
      case 'intermediate': return t('packs.level.intermediate');
      case 'advanced': return t('packs.level.advanced');
      default: return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <DialogTitle className="text-xl">{pack.title}</DialogTitle>
              <DialogDescription className="mt-1">
                {pack.description}
              </DialogDescription>
            </div>
            {isInstalled && (
              <Badge variant="secondary" className="bg-green-500/20 text-green-700 dark:text-green-400">
                <CheckCircle className="h-3 w-3 mr-1" />
                {t('packs.installed')}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6 p-1">
            {/* Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span>{pack.cardCount} {t('packs.cards')}</span>
              </div>
              
              {pack.size && (
                <div className="flex items-center gap-2 text-sm">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span>{formatFileSize(pack.size)}</span>
                </div>
              )}
              
              {pack.rating && (
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span>{pack.rating}/5</span>
                </div>
              )}
              
              {pack.author && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{pack.author}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {pack.tags.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Tag className="h-4 w-4" />
                  {t('packs.tags')}
                </div>
                <div className="flex flex-wrap gap-2">
                  {pack.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                  {pack.level && (
                    <Badge variant="secondary">
                      {getLevelLabel(pack.level)}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <Separator />

            {/* Preview Cards */}
            {pack.previewCards && pack.previewCards.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium">{t('packs.preview_cards')}</h3>
                <div className="space-y-2">
                  {pack.previewCards.map((card, index) => (
                    <div
                      key={card.id}
                      className="p-3 bg-muted/50 rounded-lg border border-border/50"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-muted-foreground font-mono">
                          {index + 1}.
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{card.frontText}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            → {card.backText}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {t('packs.preview_note')} ({pack.cardCount} {t('packs.cards')})
                </p>
              </div>
            )}

            {/* Dates */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {t('packs.created')}: {new Date(pack.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {t('packs.updated')}: {new Date(pack.updatedAt).toLocaleDateString()}
              </div>
            </div>

            {/* Download Progress */}
            {isDownloading && progress && (
              <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span>
                    {progress.status === 'downloading' && t('packs.status.downloading')}
                    {progress.status === 'extracting' && t('packs.status.extracting')}
                    {progress.status === 'importing' && t('packs.status.importing')}
                  </span>
                  <span className="font-medium">{progress.progress}%</span>
                </div>
                <Progress value={progress.progress} />
              </div>
            )}

            {progress?.status === 'error' && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                {progress.error}
              </div>
            )}

            {progress?.status === 'completed' && (
              <div className="p-3 bg-green-500/10 text-green-700 dark:text-green-400 rounded-lg text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                {t('packs.download_complete')}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            {t('packs.close')}
          </Button>
          
          {!isInstalled && (
            <Button onClick={onDownload} disabled={isDownloading}>
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('packs.downloading')}
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  {t('packs.download')}
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
