import { useState } from 'react';
import { Group, GROUP_COLORS } from '@/types/flashcard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ColorPicker } from './ColorPicker';

interface GroupSelectorProps {
  groups: Group[];
  selectedGroupId?: string;
  onSelect: (groupId?: string) => void;
  onCreateGroup: (name: string, color: string) => void;
}

export const GroupSelector = ({
  groups,
  selectedGroupId,
  onSelect,
  onCreateGroup,
}: GroupSelectorProps) => {
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
        <button
          type="button"
          onClick={() => onSelect(undefined)}
          className={cn(
            'px-3 py-2 rounded-lg text-sm font-medium transition-all border',
            !selectedGroupId
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-secondary text-muted-foreground border-border hover:bg-secondary/80'
          )}
        >
          Sans groupe
        </button>
        
        {groups.map((group) => (
          <button
            key={group.id}
            type="button"
            onClick={() => onSelect(group.id)}
            className={cn(
              'px-3 py-2 rounded-lg text-sm font-medium transition-all border flex items-center gap-2',
              selectedGroupId === group.id
                ? 'text-white border-transparent'
                : 'bg-secondary text-foreground border-border hover:bg-secondary/80'
            )}
            style={{
              backgroundColor: selectedGroupId === group.id ? group.color : undefined,
            }}
          >
            <FolderOpen className="w-4 h-4" />
            {group.name}
          </button>
        ))}

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="px-3 py-2 rounded-lg text-sm font-medium bg-secondary text-muted-foreground border border-dashed border-border hover:bg-secondary/80 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouveau groupe
            </button>
          </DialogTrigger>
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
                <ColorPicker value={selectedColor} onChange={setSelectedColor} />
              </div>
              <Button
                onClick={handleCreate}
                disabled={!newGroupName.trim()}
                className="w-full"
              >
                Créer le groupe
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};