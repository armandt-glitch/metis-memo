import { Group } from '@/types/flashcard';
import { FolderOpen, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GroupFilterProps {
  groups: Group[];
  selectedGroupId?: string | null;
  onSelect: (groupId?: string | null) => void;
  onDeleteGroup?: (groupId: string) => void;
  cardCounts?: Record<string, number>;
}

export const GroupFilter = ({
  groups,
  selectedGroupId,
  onSelect,
  onDeleteGroup,
  cardCounts = {},
}: GroupFilterProps) => {
  const totalCards = Object.values(cardCounts).reduce((a, b) => a + b, 0);
  const ungroupedCount = cardCounts['ungrouped'] || 0;

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          'px-4 py-2 rounded-xl text-sm font-medium transition-all border',
          selectedGroupId === null
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-card text-foreground border-border hover:bg-secondary'
        )}
      >
        Tous ({totalCards})
      </button>

      {ungroupedCount > 0 && (
        <button
          onClick={() => onSelect('ungrouped')}
          className={cn(
            'px-4 py-2 rounded-xl text-sm font-medium transition-all border',
            selectedGroupId === 'ungrouped'
              ? 'bg-muted text-foreground border-muted'
              : 'bg-card text-foreground border-border hover:bg-secondary'
          )}
        >
          Sans groupe ({ungroupedCount})
        </button>
      )}

      {groups.map((group) => {
        const count = cardCounts[group.id] || 0;
        return (
          <div key={group.id} className="relative group/item">
            <button
              onClick={() => onSelect(group.id)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-all border flex items-center gap-2',
                selectedGroupId === group.id
                  ? 'text-white border-transparent'
                  : 'bg-card text-foreground border-border hover:bg-secondary'
              )}
              style={{
                backgroundColor: selectedGroupId === group.id ? group.color : undefined,
              }}
            >
              <FolderOpen className="w-4 h-4" />
              {group.name} ({count})
            </button>
            {onDeleteGroup && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteGroup(group.id);
                }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
