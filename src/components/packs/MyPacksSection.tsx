import { InstalledPack } from '@/types/pack';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, BookOpen, Calendar, Package, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface MyPacksSectionProps {
  installedPacks: InstalledPack[];
  onDelete: (packId: string) => Promise<boolean>;
  onBack: () => void;
}

export const MyPacksSection = ({ installedPacks, onDelete, onBack }: MyPacksSectionProps) => {
  const { t } = useLanguage();

  if (installedPacks.length === 0) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t('packs.back_to_store')}
        </Button>
        
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium text-lg mb-2">{t('packs.no_installed')}</h3>
          <p className="text-muted-foreground">{t('packs.no_installed_desc')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        {t('packs.back_to_store')}
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {installedPacks.map((pack) => (
          <Card key={pack.packId}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{pack.manifest.title}</CardTitle>
                {pack.manifest.theme && (
                  <Badge variant="outline" className="text-xs">
                    {pack.manifest.theme}
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {pack.manifest.description}
              </p>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{pack.cardIds.length} {t('packs.cards')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date(pack.installedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="w-full gap-2">
                    <Trash2 className="h-4 w-4" />
                    {t('packs.delete')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('packs.delete_confirm_title')}</AlertDialogTitle>
                  <AlertDialogDescription>
                      {t('packs.delete_confirm_desc')} "{pack.manifest.title}" ({pack.cardIds.length} {t('packs.cards')})
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('packs.cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(pack.packId)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {t('packs.delete')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
