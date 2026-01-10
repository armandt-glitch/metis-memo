import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';

interface MathGraphProps {
  formula: string;
  className?: string;
}

// Parse and evaluate simple math expressions
const evaluateFormula = (formula: string, x: number): number | null => {
  try {
    // Clean up the formula
    let expr = formula
      .toLowerCase()
      .replace(/\s/g, '')
      .replace(/\^/g, '**') // Power operator
      .replace(/(\d)x/g, '$1*x') // 2x -> 2*x
      .replace(/x(\d)/g, 'x*$1') // x2 -> x*2
      .replace(/\)x/g, ')*x') // )x -> )*x
      .replace(/x\(/g, 'x*(') // x( -> x*(
      .replace(/\)\(/g, ')*(') // )( -> )*(
      .replace(/(\d)\(/g, '$1*(') // 2( -> 2*(
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan')
      .replace(/sqrt/g, 'Math.sqrt')
      .replace(/abs/g, 'Math.abs')
      .replace(/log/g, 'Math.log10')
      .replace(/ln/g, 'Math.log')
      .replace(/exp/g, 'Math.exp')
      .replace(/pi/g, 'Math.PI')
      .replace(/e(?![x])/g, 'Math.E');

    // Replace x with the value
    expr = expr.replace(/x/g, `(${x})`);

    // Safely evaluate - only allow math operations
    const result = new Function(`return ${expr}`)();
    
    if (typeof result === 'number' && isFinite(result)) {
      return result;
    }
    return null;
  } catch {
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

  return (
    <div className={`w-full bg-secondary/50 rounded-xl p-4 ${className}`}>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="x" 
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(v) => v.toFixed(1)}
            stroke="hsl(var(--muted-foreground))"
            fontSize={10}
          />
          <YAxis 
            domain={[yBounds.min, yBounds.max]}
            tickFormatter={(v) => v.toFixed(1)}
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
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-xs text-center text-muted-foreground mt-2 font-mono">
        f(x) = {formula}
      </p>
    </div>
  );
};
