import { Button } from '@/components/ui/button';
import { Delete } from 'lucide-react';

interface MathKeyboardProps {
  onInsert: (value: string) => void;
  onClear: () => void;
  onBackspace: () => void;
}

const keys = [
  // Row 1 - Numbers
  ['7', '8', '9', '/', '('],
  // Row 2
  ['4', '5', '6', '*', ')'],
  // Row 3
  ['1', '2', '3', '-', '^'],
  // Row 4
  ['0', '.', 'x', '+', '='],
];

const functions = [
  { label: 'f(x)=', value: 'f(x)=' },
  { label: 'x²', value: 'x^2' },
  { label: 'x³', value: 'x^3' },
  { label: '√x', value: 'sqrt(x)' },
  { label: 'sin', value: 'sin(' },
  { label: 'cos', value: 'cos(' },
  { label: 'tan', value: 'tan(' },
  { label: 'log', value: 'log(' },
  { label: 'ln', value: 'ln(' },
  { label: 'π', value: 'pi' },
  { label: 'e', value: 'e' },
  { label: '|x|', value: 'abs(' },
];

export const MathKeyboard = ({ onInsert, onClear, onBackspace }: MathKeyboardProps) => {
  return (
    <div className="bg-secondary/30 rounded-xl p-3 space-y-3">
      {/* Function buttons */}
      <div className="grid grid-cols-6 gap-1.5">
        {functions.map((fn) => (
          <Button
            key={fn.label}
            type="button"
            variant="outline"
            size="sm"
            className="h-9 text-xs font-mono"
            onClick={() => onInsert(fn.value)}
          >
            {fn.label}
          </Button>
        ))}
      </div>
      
      {/* Divider */}
      <div className="border-t border-border" />
      
      {/* Number pad */}
      <div className="grid grid-cols-5 gap-1.5">
        {keys.flat().map((key, idx) => (
          <Button
            key={idx}
            type="button"
            variant={key === 'x' ? 'default' : 'secondary'}
            size="sm"
            className="h-10 text-base font-mono"
            onClick={() => onInsert(key)}
          >
            {key}
          </Button>
        ))}
      </div>
      
      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10"
          onClick={onBackspace}
        >
          <Delete className="w-4 h-4 mr-1" />
          Effacer
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="h-10"
          onClick={onClear}
        >
          Tout effacer
        </Button>
      </div>
    </div>
  );
};
