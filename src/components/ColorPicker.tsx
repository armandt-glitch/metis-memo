import { useState } from 'react';
import { GROUP_COLORS } from '@/types/flashcard';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Pipette } from 'lucide-react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  const [hexInput, setHexInput] = useState(value);

  const handleHexChange = (hex: string) => {
    setHexInput(hex);
    // Validate hex color
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      onChange(hex);
    }
  };

  const handleColorPickerChange = (color: string) => {
    setHexInput(color);
    onChange(color);
  };

  const handlePresetClick = (color: string) => {
    setHexInput(color);
    onChange(color);
  };

  return (
    <div className="space-y-3">
      {/* Preset colors */}
      <div className="flex flex-wrap gap-2">
        {GROUP_COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => handlePresetClick(color.value)}
            className={cn(
              'w-8 h-8 rounded-full transition-all',
              value === color.value
                ? 'ring-2 ring-offset-2 ring-foreground'
                : 'hover:scale-110'
            )}
            style={{ backgroundColor: color.value }}
            title={color.name}
          />
        ))}
      </div>

      {/* Custom color section */}
      <div className="flex items-center gap-3 pt-2 border-t border-border">
        {/* Native color picker */}
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => handleColorPickerChange(e.target.value)}
            className="w-10 h-10 rounded-lg cursor-pointer border-2 border-border bg-transparent"
            title="Choisir une couleur"
          />
        </div>

        {/* HEX input */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md border border-border shrink-0"
              style={{ backgroundColor: value }}
            />
            <Input
              value={hexInput}
              onChange={(e) => handleHexChange(e.target.value)}
              placeholder="#780000"
              className="font-mono text-sm"
              maxLength={7}
            />
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Sélectionnez une couleur prédéfinie, utilisez le nuancier ou entrez un code HEX
      </p>
    </div>
  );
};
