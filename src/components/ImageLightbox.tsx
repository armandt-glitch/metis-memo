import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageLightboxProps {
  src: string;
  alt: string;
  className?: string;
}

export const ImageLightbox = ({ src, alt, className }: ImageLightboxProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <img 
        src={src} 
        alt={alt} 
        className={cn("cursor-zoom-in", className)}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
      />
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-0 bg-transparent shadow-none">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            aria-label="Close"
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
