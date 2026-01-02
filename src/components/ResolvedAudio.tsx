import { Loader2, Volume2 } from 'lucide-react';
import { useResolvedMedia } from '@/hooks/useResolvedMedia';

interface ResolvedAudioProps {
  src: string;
  className?: string;
}

export const ResolvedAudio = ({ src, className }: ResolvedAudioProps) => {
  const { resolvedUrl, isLoading } = useResolvedMedia(src);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 bg-secondary rounded-xl p-3">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>
        <span className="text-muted-foreground text-sm">Chargement...</span>
      </div>
    );
  }

  if (!resolvedUrl) {
    return (
      <div className="flex items-center gap-3 bg-secondary rounded-xl p-3">
        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
          <Volume2 className="w-5 h-5 text-muted-foreground" />
        </div>
        <span className="text-muted-foreground text-sm">Audio non disponible</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-secondary rounded-xl p-3">
      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
        <Volume2 className="w-5 h-5 text-primary" />
      </div>
      <audio controls src={resolvedUrl} className={className || "flex-1 h-8"} />
    </div>
  );
};
