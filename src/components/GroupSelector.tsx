import { useState } from 'react';
import { Group, GROUP_COLORS } from '@/types/flashcard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, FolderOpen, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ColorPicker } from './ColorPicker';
import { useLanguage } from '@/contexts/LanguageContext';

interface GroupSelectorProps {
  groups: Group[];
  selectedGroupIds: string[];
  onToggle: (groupId: string) => void;
  onCreateGroup: (name: string, color: string) => void;
}

export const GroupSelector = ({
  groups,
  selectedGroupIds,
  onToggle,
  onCreateGroup,
}: GroupSelectorProps) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedColor, setSelectedColor] = useState(GROUP_COLORS[0].value);

  const handleCreate = () => {
    if (newGroupName.trim()) {
      onCreateGroup(newGroupName.trim(), selectedColor);
      setNewGroupName('');
      setSelectedColor(GROUP_COLORS[0].value);
      setIsOpen(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {selectedGroupIds.length === 0 && (
          <span className="px-3 py-2 rounded-lg text-sm font-medium bg-secondary text-muted-foreground border border-border">
            {t('form.no.group')}
          </span>
        )}
        
        {groups.map((group) => {
          const isSelected = selectedGroupIds.includes(group.id);
          return (
            <button
              key={group.id}
              type="button"
              onClick={() => onToggle(group.id)}
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

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="px-3 py-2 rounded-lg text-sm font-medium bg-secondary text-muted-foreground border border-dashed border-border hover:bg-secondary/80 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('form.new.group')}
            </button>
          </DialogTrigger>
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
                <ColorPicker value={selectedColor} onChange={setSelectedColor} />
              </div>
              <Button
                onClick={handleCreate}
                disabled={!newGroupName.trim()}
                className="w-full"
              >
                {t('dashboard.create.group.btn')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
