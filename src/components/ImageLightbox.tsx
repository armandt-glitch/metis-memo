import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageLightboxProps {
  src: string;
  alt: string;
  className?: string;
}

export const ImageLightbox = ({ src, alt, className }: ImageLightboxProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  return (
    <>
      <div className="relative inline-block group">
        <img 
          src={src} 
          alt={alt} 
          className={cn("cursor-zoom-in", className)}
          onClick={handleOpen}
          onTouchEnd={handleOpen}
        />
        {/* Bouton d'agrandissement visible sur mobile */}
        <button
          type="button"
          onClick={handleOpen}
          onTouchEnd={handleOpen}
          className="absolute bottom-2 right-2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors shadow-lg md:opacity-0 md:group-hover:opacity-100"
          aria-label="Agrandir l'image"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
      </div>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-0 bg-transparent shadow-none [&>button]:hidden">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 z-50 p-3 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={src} 
            alt={alt} 
            className="w-auto h-auto max-w-full max-h-[90vh] object-contain mx-auto rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
