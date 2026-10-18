import React from 'react';
import type { ChemicalEquation } from '../lib/types.ts';
import { ArrowRight, Flame } from 'lucide-react';

interface EquationCardProps {
  equation: ChemicalEquation;
}

export const EquationCard: React.FC<EquationCardProps> = ({ equation }) => {
  // Helper to format chemical formulas with subscripts
  const formatFormula = (text: string) => {
    const unicodeSubscripts: Record<string, string> = {
      '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
      '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
    };

    const parts = text.split(/(\([a-z0-9+-]+\)|\+|\s+|⟶|->)/gi);
    return parts.map((part, pIdx) => {
      if (!part) return null;
      if (part.startsWith('(') && part.endsWith(')')) {
        return (
          <span key={pIdx} className="text-stone-500 font-sans text-xs italic px-0.5">
            {part}
          </span>
        );
      }
      if (part === '+' || part === '⟶' || part === '->') {
        return (
          <span key={pIdx} className="text-amber-800 font-bold px-1.5 font-sans">
            {part === '->' ? '⟶' : part}
          </span>
        );
      }
      // Replace unicode subscripts first with HTML sub
      let formatted = part.replace(/[₀-₉]/g, (m) => `<sub>${unicodeSubscripts[m] || m}</sub>`);
      // Then replace regular digits after letters or brackets with sub
      formatted = formatted.replace(/([A-Za-z\)])(\d+)/g, '$1<sub>$2</sub>');
      return <span key={pIdx} dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  return (
    <div className="my-4 border border-stone-300 rounded-lg bg-stone-50/80 p-4 shadow-2xs font-mono">
      {/* Header with reaction type */}
      <div className="flex items-center justify-between text-xs mb-2.5 pb-2 border-b border-stone-200">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-600" />
          <span className="font-sans font-semibold text-stone-800">
            {equation.reactionType || 'Balanced Chemical Reaction'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {equation.balanced && (
            <span className="text-[11px] font-sans bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">
              Mass Balanced
            </span>
          )}
        </div>
      </div>

      {/* Main Reaction Line */}
      <div className="bg-white border border-stone-200 rounded p-3.5 flex flex-wrap items-center justify-center gap-3 text-base sm:text-lg text-stone-900 overflow-x-auto text-center">
        {/* Reactants */}
        <div className="font-semibold tracking-wide">{formatFormula(equation.reactants)}</div>

        {/* Reaction Arrow with Catalyst / Heat condition */}
        <div className="flex flex-col items-center justify-center px-2 min-w-[70px]">
          {equation.arrowText && (
            <span className="text-[11px] font-sans font-semibold text-amber-900 bg-amber-100/90 px-1.5 py-0.2 rounded mb-0.5 whitespace-nowrap flex items-center gap-1">
              {equation.arrowText.includes('Heat') || equation.arrowText.includes('Δ') ? (
                <Flame className="w-3 h-3 text-amber-700" />
              ) : null}
              {equation.arrowText}
            </span>
          )}
          <ArrowRight className="w-5 h-5 text-amber-700" />
        </div>

        {/* Products */}
        <div className="font-semibold tracking-wide">{formatFormula(equation.products)}</div>
      </div>

      {/* Footnote notes if available */}
      {equation.notes && (
        <div className="mt-2.5 text-xs text-stone-600 font-sans leading-relaxed bg-stone-100/70 p-2.5 rounded border border-stone-200/60">
          <strong className="text-stone-800">Mechanistic Note: </strong>
          {equation.notes}
        </div>
      )}
    </div>
  );
};
