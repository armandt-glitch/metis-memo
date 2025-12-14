import { useState } from 'react';
import { PackManifest } from '@/types/pack';
import { usePacks } from '@/hooks/usePacks';
import { PackCard } from '@/components/packs/PackCard';
import { PackDetailDialog } from '@/components/packs/PackDetailDialog';
import { MyPacksSection } from '@/components/packs/MyPacksSection';
import { PackFilters } from '@/components/packs/PackFilters';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';

interface PacksPageProps {
  onBack: () => void;
}

export const PacksPage = ({ onBack }: PacksPageProps) => {
  const { t } = useLanguage();
  const { 
    installedPacks, 
    getAvailablePacks, 
    downloadPack, 
    deletePack, 
    getProgress, 
    isInstalled,
    formatFileSize 
  } = usePacks();

  const [selectedPack, setSelectedPack] = useState<PackManifest | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [showMyPacks, setShowMyPacks] = useState(false);

  const availablePacks = getAvailablePacks();

  // Filter packs
  const filteredPacks = availablePacks.filter(pack => {
    const matchesSearch = !searchQuery || 
      pack.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pack.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pack.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTheme = !selectedTheme || pack.theme === selectedTheme;
    const matchesLevel = !selectedLevel || pack.level === selectedLevel;
    
    return matchesSearch && matchesTheme && matchesLevel;
  });

  // Get unique themes and levels
  const themes = [...new Set(availablePacks.map(p => p.theme).filter(Boolean))];
  const levels = [...new Set(availablePacks.map(p => p.level).filter(Boolean))];

  const handleDownload = async (packId: string) => {
    await downloadPack(packId);
  };

  const handleDelete = async (packId: string): Promise<boolean> => {
    return await deletePack(packId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              {t('packs.title')}
            </h1>
            <p className="text-muted-foreground">{t('packs.subtitle')}</p>
          </div>
        </div>
        <Button
          variant={showMyPacks ? 'default' : 'outline'}
          onClick={() => setShowMyPacks(!showMyPacks)}
        >
          {t('packs.my_packs')} ({installedPacks.length})
        </Button>
      </div>

      {showMyPacks ? (
        <MyPacksSection 
          installedPacks={installedPacks}
          onDelete={handleDelete}
          onBack={() => setShowMyPacks(false)}
        />
      ) : (
        <>
          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('packs.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <PackFilters
              themes={themes as string[]}
              levels={levels as string[]}
              selectedTheme={selectedTheme}
              selectedLevel={selectedLevel}
              onThemeChange={setSelectedTheme}
              onLevelChange={setSelectedLevel}
            />
          </div>

          {/* Packs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPacks.map((pack) => (
              <PackCard
                key={pack.packId}
                pack={pack}
                isInstalled={isInstalled(pack.packId)}
                progress={getProgress(pack.packId)}
                onViewDetails={() => setSelectedPack(pack)}
                onDownload={() => handleDownload(pack.packId)}
                formatFileSize={formatFileSize}
              />
            ))}
          </div>

          {filteredPacks.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('packs.no_results')}</p>
            </div>
          )}
        </>
      )}

      {/* Pack Detail Dialog */}
      <PackDetailDialog
        pack={selectedPack}
        isOpen={!!selectedPack}
        onClose={() => setSelectedPack(null)}
        isInstalled={selectedPack ? isInstalled(selectedPack.packId) : false}
        progress={selectedPack ? getProgress(selectedPack.packId) : undefined}
        onDownload={() => selectedPack && handleDownload(selectedPack.packId)}
        formatFileSize={formatFileSize}
      />
    </div>
  );
};
