import logo from '@/assets/logo.png';
export const Header = () => {
  return <header className="py-6 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Métis Memo" className="w-12 h-12 rounded-lg" />
          <div>
            <h1 className="text-xl font-bold text-foreground">Métis Memos</h1>
            <p className="text-xs text-muted-foreground">Mémorisation intelligente</p>
          </div>
        </div>
      </div>
    </header>;
};