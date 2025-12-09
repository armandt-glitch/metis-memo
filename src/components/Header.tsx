import { Brain } from 'lucide-react';
export const Header = () => {
  return <header className="py-6 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-primary bg-formula-medium text-formula-medium border-sidebar-ring border-4 rounded-none shadow-sm">
            <Brain className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Métis Memo</h1>
            <p className="text-xs text-muted-foreground">Mémorisation intelligente</p>
          </div>
        </div>
      </div>
    </header>;
};