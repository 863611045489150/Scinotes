import React, { useState } from 'react';
import type { UncertaintyFlag } from '../lib/types.ts';
import { AlertCircle, CheckCircle, Edit3, FileQuestion, Sparkles } from 'lucide-react';

interface UncertaintyInspectorProps {
  uncertainties: UncertaintyFlag[];
  onResolve?: (flagId: string, resolvedText: string) => void;
  readOnly?: boolean;
}

export const UncertaintyInspector: React.FC<UncertaintyInspectorProps> = ({
  uncertainties,
  onResolve,
  readOnly = false,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [customText, setCustomText] = useState('');

  if (!uncertainties || uncertainties.length === 0) {
    return null;
  }

  const unresolvedCount = uncertainties.filter((u) => !u.resolved).length;

  return (
    <div className="my-5 border border-amber-300 rounded-lg bg-amber-50/60 p-4 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-amber-200">
        <div className="flex items-center gap-2">
          <FileQuestion className="w-4 h-4 text-amber-700" />
          <span className="font-semibold text-xs text-amber-950 uppercase tracking-wider font-mono">
            Handwriting Uncertainty Audit ({unresolvedCount} Pending Review)
          </span>
        </div>
        <span className="text-[11px] text-amber-800">
          Source notes preserved faithfully • No silent guessing
        </span>
      </div>

      <div className="mt-3 space-y-3">
        {uncertainties.map((flag) => {
          const isEditing = editingId === flag.id;

          return (
            <div
              key={flag.id}
              className={`p-3 rounded border text-xs transition-all ${
                flag.resolved
                  ? 'bg-stone-50 border-stone-200 text-stone-600'
                  : 'bg-white border-amber-300 text-stone-800 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded text-[11px] border border-stone-200">
                      Notebook Page {flag.sourcePage}
                    </span>
                    {flag.resolved ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle className="w-3 h-3" /> Resolved as "{flag.resolvedText || flag.suspectedText}"
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                        <AlertCircle className="w-3 h-3 text-amber-600" /> Ambiguous In Notes
                      </span>
                    )}
                  </div>

                  <div className="pt-1">
                    <span className="text-stone-500">Original handwritten trace: </span>
                    <span className="font-mono bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200 text-stone-900 font-medium">
                      "{flag.originalText}"
                    </span>
                    <span className="mx-2 text-stone-400">⟶</span>
                    <span className="text-stone-500">Transcription candidate: </span>
                    <span className="font-medium text-amber-900 font-sans">
                      "{flag.suspectedText}"
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-500 italic mt-0.5">
                    <strong>Auditor Note: </strong>
                    {flag.reason}
                  </p>

                  {flag.contextSnippet && (
                    <p className="text-[11px] text-stone-600 bg-stone-50 p-1.5 rounded font-mono border border-stone-200/60 mt-1">
                      Context: {flag.contextSnippet}
                    </p>
                  )}
                </div>

                {!readOnly && onResolve && !flag.resolved && !isEditing && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onResolve(flag.id, flag.suspectedText)}
                      className="px-2.5 py-1 bg-amber-800 hover:bg-amber-900 text-white rounded text-[11px] font-medium flex items-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" /> Accept Candidate
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(flag.id);
                        setCustomText(flag.suspectedText);
                      }}
                      className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-[11px] border border-stone-300"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                )}
              </div>

              {/* Editing Box */}
              {isEditing && (
                <div className="mt-3 pt-3 border-t border-amber-200 flex items-center gap-2">
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Enter verified correct text..."
                    className="flex-1 px-2.5 py-1 text-xs border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                  />
                  <button
                    onClick={() => {
                      if (onResolve && customText.trim()) {
                        onResolve(flag.id, customText.trim());
                      }
                      setEditingId(null);
                    }}
                    className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-medium"
                  >
                    Confirm Correction
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-2.5 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded text-xs"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
