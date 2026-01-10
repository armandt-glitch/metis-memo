import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';

interface MathGraphProps {
  formula: string;
  className?: string;
}

// Parse and evaluate simple math expressions
const evaluateFormula = (formula: string, x: number): number | null => {
  try {
    // Clean up the formula - remove spaces first
    let expr = formula.replace(/\s/g, '');
    
    // Handle Unicode superscript numbers - replace with ^n format first
    expr = expr
      .replace(/⁰/g, '^0')
      .replace(/¹/g, '^1')
      .replace(/²/g, '^2')
      .replace(/³/g, '^3')
      .replace(/⁴/g, '^4')
      .replace(/⁵/g, '^5')
      .replace(/⁶/g, '^6')
      .replace(/⁷/g, '^7')
      .replace(/⁸/g, '^8')
      .replace(/⁹/g, '^9');
    
    // Now convert ^ to ** for JavaScript
    expr = expr.replace(/\^/g, '**');
    
    // Handle implicit multiplication BEFORE converting to lowercase
    // But be careful not to break ** operator
    // First, temporarily replace ** with a placeholder
    expr = expr.replace(/\*\*/g, '§POW§');
    
    // Now handle implicit multiplication
    expr = expr
      .replace(/(\d)([a-zA-Z])/g, '$1*$2') // 2x -> 2*x
      .replace(/([a-zA-Z])(\d)/g, '$1*$2') // x2 -> x*2 (but not after **)
      .replace(/\)(\d)/g, ')*$1') // )2 -> )*2
      .replace(/(\d)\(/g, '$1*(') // 2( -> 2*(
      .replace(/\)\(/g, ')*(') // )( -> )*(
      .replace(/\)([a-zA-Z])/g, ')*$1') // )x -> )*x
      .replace(/([a-zA-Z])\(/g, '$1*('); // x( -> x*(
    
    // Restore ** operator
    expr = expr.replace(/§POW§/g, '**');

    // Convert to lowercase for function matching
    expr = expr.toLowerCase();
    
    // Replace math functions - order matters (longer names first)!
    expr = expr
      .replace(/sinh/g, 'Math.sinh')
      .replace(/cosh/g, 'Math.cosh')
      .replace(/tanh/g, 'Math.tanh')
      .replace(/asin/g, 'Math.asin')
      .replace(/acos/g, 'Math.acos')
      .replace(/atan/g, 'Math.atan')
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan')
      .replace(/sqrt/g, 'Math.sqrt')
      .replace(/cbrt/g, 'Math.cbrt')
      .replace(/abs/g, 'Math.abs')
      .replace(/log10/g, 'Math.log10')
      .replace(/log2/g, 'Math.log2')
      .replace(/log/g, 'Math.log10')
      .replace(/ln/g, 'Math.log')
      .replace(/exp/g, 'Math.exp')
      .replace(/pi/g, '(Math.PI)')
      .replace(/\be\b/g, '(Math.E)'); // Only standalone 'e'

    // Replace x with the value (with parentheses for safety)
    expr = expr.replace(/x/g, `(${x})`);

    // Safely evaluate
    const result = new Function(`"use strict"; return (${expr})`)();
    
    if (typeof result === 'number' && isFinite(result) && !isNaN(result)) {
      return result;
    }
    return null;
  } catch (e) {
    return null;
  }
};

// Detect if this is a polynomial-like function for domain detection
const detectDomain = (formula: string): { min: number; max: number } => {
  const cleanFormula = formula.toLowerCase();
  
  // Trigonometric functions - use pi-based range
  if (cleanFormula.includes('sin') || cleanFormula.includes('cos') || cleanFormula.includes('tan')) {
    return { min: -2 * Math.PI, max: 2 * Math.PI };
  }
  
  // Exponential - smaller range
  if (cleanFormula.includes('exp') || /e\^/.test(cleanFormula)) {
    return { min: -3, max: 3 };
  }
  
  // Log functions - positive only
  if (cleanFormula.includes('log') || cleanFormula.includes('ln')) {
    return { min: 0.1, max: 10 };
  }
  
  // Default polynomial range
  return { min: -10, max: 10 };
};

export const MathGraph = ({ formula, className = '' }: MathGraphProps) => {
  const data = useMemo(() => {
    if (!formula.trim()) return [];
    
    const { min, max } = detectDomain(formula);
    const points: { x: number; y: number | null }[] = [];
    const step = (max - min) / 200;
    
    for (let x = min; x <= max; x += step) {
      const y = evaluateFormula(formula, x);
      points.push({ x: Math.round(x * 1000) / 1000, y });
    }
    
    return points;
  }, [formula]);

  // Find y bounds for better display
  const yBounds = useMemo(() => {
    const validYs = data.map(d => d.y).filter((y): y is number => y !== null && Math.abs(y) < 1000);
    if (validYs.length === 0) return { min: -10, max: 10 };
    
    const minY = Math.min(...validYs);
    const maxY = Math.max(...validYs);
    const padding = (maxY - minY) * 0.1 || 1;
    
    return {
      min: Math.floor(minY - padding),
      max: Math.ceil(maxY + padding)
    };
  }, [data]);

  // Check if we have valid data
  const hasValidData = data.some(d => d.y !== null);

  if (!hasValidData && formula.trim()) {
    return (
      <div className={`w-full bg-secondary/50 rounded-xl p-4 ${className}`}>
        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
          <p className="text-center">
            Formule non reconnue.<br />
            <span className="text-xs">Essayez: x^2, sin(x), 2*x+1...</span>
          </p>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-2 font-mono">
          f(x) = {formula}
        </p>
      </div>
    );
  }

  return (
    <div className={`w-full bg-secondary/50 rounded-xl p-4 ${className}`}>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="x" 
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(v) => typeof v === 'number' ? v.toFixed(1) : v}
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
            />
            <YAxis 
              domain={[yBounds.min, yBounds.max]}
              tickFormatter={(v) => typeof v === 'number' ? v.toFixed(1) : v}
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
            />
            <ReferenceLine x={0} stroke="hsl(var(--muted-foreground))" strokeWidth={1} />
            <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeWidth={1} />
            <Line 
              type="monotone" 
              dataKey="y" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-center text-muted-foreground mt-2 font-mono">
        f(x) = {formula}
      </p>
    </div>
  );
};
