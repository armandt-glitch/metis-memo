import { PackManifest, PackDownloadProgress } from '@/types/pack';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  CheckCircle, 
  Loader2, 
  Star, 
  BookOpen,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PackCardProps {
  pack: PackManifest;
  isInstalled: boolean;
  progress?: PackDownloadProgress;
  onViewDetails: () => void;
  onDownload: () => void;
  formatFileSize: (bytes: number) => string;
}

export const PackCard = ({
  pack,
  isInstalled,
  progress,
  onViewDetails,
  onDownload,
  formatFileSize,
}: PackCardProps) => {
  const { t } = useLanguage();
  const isDownloading = progress && ['downloading', 'extracting', 'importing'].includes(progress.status);
  
  const getLevelColor = (level?: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500/20 text-green-700 dark:text-green-400';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
      case 'advanced': return 'bg-red-500/20 text-red-700 dark:text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getLevelLabel = (level?: string) => {
    switch (level) {
      case 'beginner': return t('packs.level.beginner');
      case 'intermediate': return t('packs.level.intermediate');
      case 'advanced': return t('packs.level.advanced');
      default: return '';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {pack.isNew && (
                <Badge variant="secondary" className="bg-primary/20 text-primary">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {t('packs.new')}
                </Badge>
              )}
              {pack.theme && (
                <Badge variant="outline" className="text-xs">
                  {pack.theme}
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg">{pack.title}</CardTitle>
          </div>
          {isInstalled && (
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {pack.description}
        </p>
        
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{pack.cardCount} {t('packs.cards')}</span>
          </div>
          
          {pack.size && (
            <span className="text-muted-foreground">
              • {formatFileSize(pack.size)}
            </span>
          )}
          
          {pack.rating && (
            <div className="flex items-center gap-0.5 text-yellow-500">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span>{pack.rating}</span>
            </div>
          )}
        </div>

        {pack.level && (
          <Badge className={getLevelColor(pack.level)}>
            {getLevelLabel(pack.level)}
          </Badge>
        )}

        {/* Progress bar when downloading */}
        {isDownloading && progress && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {progress.status === 'downloading' && t('packs.status.downloading')}
                {progress.status === 'extracting' && t('packs.status.extracting')}
                {progress.status === 'importing' && t('packs.status.importing')}
              </span>
              <span>{progress.progress}%</span>
            </div>
            <Progress value={progress.progress} className="h-1" />
          </div>
        )}

        {progress?.status === 'error' && (
          <p className="text-xs text-destructive">{progress.error}</p>
        )}
      </CardContent>

      <CardFooter className="gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onViewDetails}
        >
          {t('packs.view_details')}
        </Button>
        
        {!isInstalled && (
          <Button
            size="sm"
            className="flex-1"
            onClick={onDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Download className="h-4 w-4 mr-1" />
                {t('packs.download')}
              </>
            )}
          </Button>
        )}
        
        {isInstalled && (
          <Badge variant="secondary" className="flex-1 justify-center py-2">
            <CheckCircle className="h-4 w-4 mr-1" />
            {t('packs.installed')}
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
};
