import React, { useState } from 'react';
import type { DiagramReference } from '../lib/types.ts';
import { ExternalLink, Info, CheckCircle2, Search, Sparkles } from 'lucide-react';

interface DiagramViewerProps {
  diagram: DiagramReference;
  onSearchMore?: (query: string) => void;
}

export const DiagramViewer: React.FC<DiagramViewerProps> = ({ diagram, onSearchMore }) => {
  const [activeLabelIndex, setActiveLabelIndex] = useState<number | null>(null);
  const [showAttribution, setShowAttribution] = useState(false);

  const renderPresetSvg = (key?: string) => {
    switch (key) {
      case 'nephron':
        return (
          <svg viewBox="0 0 600 400" className="w-full h-auto bg-stone-50 rounded border border-stone-200">
            {/* Background grid subtle */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f1f1" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="600" height="400" fill="url(#grid)" />

            {/* Cortex & Medulla boundary */}
            <line x1="40" y1="180" x2="560" y2="180" stroke="#d4d4d8" strokeDasharray="4 4" strokeWidth="1" />
            <text x="50" y="172" fill="#71717a" fontSize="11" fontFamily="sans-serif">Renal Cortex (Filtration Zone)</text>
            <text x="50" y="196" fill="#71717a" fontSize="11" fontFamily="sans-serif">Renal Medulla (Concentration Zone)</text>

            {/* Bowman's Capsule Cup */}
            <path
              d="M 120 120 C 120 70, 200 70, 200 120 C 200 145, 175 160, 160 160 C 145 160, 120 145, 120 120 Z"
              fill="#fed7aa"
              stroke="#ea580c"
              strokeWidth="2.5"
            />
            {/* Glomerulus capillary tuft inside cup */}
            <circle cx="160" cy="115" r="24" fill="#fca5a5" stroke="#dc2626" strokeWidth="2" strokeDasharray="2 1" />
            <path d="M 148 105 Q 160 125 172 108 Q 165 125 152 122" fill="none" stroke="#991b1b" strokeWidth="2.5" />

            {/* Afferent and Efferent Arterioles */}
            <path d="M 80 85 Q 130 95 145 105" fill="none" stroke="#dc2626" strokeWidth="4" />
            <text x="65" y="78" fill="#991b1b" fontSize="10" fontWeight="600">Afferent arteriole (wider)</text>

            <path d="M 175 105 Q 210 90 240 85" fill="none" stroke="#dc2626" strokeWidth="2" />
            <text x="215" y="78" fill="#991b1b" fontSize="10" fontWeight="600">Efferent (narrower)</text>

            {/* Proximal Convoluted Tubule (PCT) */}
            <path
              d="M 160 160 Q 180 200 210 160 T 260 170"
              fill="none"
              stroke="#d97706"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d="M 160 160 Q 180 200 210 160 T 260 170"
              fill="none"
              stroke="#fef3c7"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Loop of Henle (Descending & Ascending hairpin limb) */}
            <path
              d="M 260 170 L 260 320 Q 285 345 310 320 L 310 150"
              fill="none"
              stroke="#d97706"
              strokeWidth="5.5"
            />
            <path
              d="M 260 170 L 260 320 Q 285 345 310 320 L 310 150"
              fill="none"
              stroke="#fef3c7"
              strokeWidth="2.5"
            />

            {/* Distal Convoluted Tubule (DCT) */}
            <path
              d="M 310 150 Q 340 120 370 145 T 430 140"
              fill="none"
              stroke="#d97706"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d="M 310 150 Q 340 120 370 145 T 430 140"
              fill="none"
              stroke="#fef3c7"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Collecting Duct */}
            <path
              d="M 430 80 L 430 360"
              fill="none"
              stroke="#0284c7"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <path
              d="M 430 80 L 430 360"
              fill="none"
              stroke="#e0f2fe"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Tributaries to collecting duct */}
            <line x1="400" y1="100" x2="430" y2="105" stroke="#0284c7" strokeWidth="4" />
            <line x1="400" y1="230" x2="430" y2="235" stroke="#0284c7" strokeWidth="4" />

            {/* Ultrafiltration droplets / Reabsorption arrows */}
            <path d="M 160 135 L 160 150" stroke="#ea580c" strokeWidth="2" markerEnd="url(#arrow)" />
            <text x="210" y="240" fill="#047857" fontSize="10" fontWeight="600">H₂O, Glucose, NaCl</text>
            <text x="210" y="252" fill="#047857" fontSize="9">Selective Reabsorption ➔</text>

            <text x="445" y="355" fill="#0369a1" fontSize="11" fontWeight="700">Urine to Pelvis ➔</text>
          </svg>
        );

      case 'human_heart':
        return (
          <svg viewBox="0 0 600 420" className="w-full h-auto bg-stone-50 rounded border border-stone-200">
            {/* Outer cardiac muscle silhouette */}
            <path
              d="M 200 130 C 150 130, 140 240, 200 320 C 250 380, 300 400, 300 400 C 300 400, 350 380, 400 320 C 460 240, 450 130, 400 130 C 350 130, 310 160, 300 170 C 290 160, 250 130, 200 130 Z"
              fill="#fee2e2"
              stroke="#991b1b"
              strokeWidth="3"
            />

            {/* Central muscular septum */}
            <path d="M 300 170 L 300 395" stroke="#7f1d1d" strokeWidth="12" strokeLinecap="round" />
            <text x="306" y="300" fill="#ffffff" fontSize="9" fontWeight="700">SEPTUM</text>

            {/* Left side (Anatomical Right): Deoxygenated (Blue) */}
            <rect x="180" y="160" width="105" height="75" rx="8" fill="#dbeafe" stroke="#2563eb" strokeWidth="1.5" />
            <text x="195" y="195" fill="#1e3a8a" fontSize="12" fontWeight="700">Right Atrium</text>
            <text x="195" y="210" fill="#1d4ed8" fontSize="10">Deoxygenated</text>

            <rect x="175" y="255" width="110" height="95" rx="8" fill="#bfdbfe" stroke="#1d4ed8" strokeWidth="1.5" />
            <text x="190" y="295" fill="#1e3a8a" fontSize="12" fontWeight="700">Right Ventricle</text>
            <text x="190" y="310" fill="#1d4ed8" fontSize="10">Pumps to lungs</text>

            {/* Right side (Anatomical Left): Oxygenated (Red) */}
            <rect x="315" y="160" width="105" height="75" rx="8" fill="#fee2e2" stroke="#dc2626" strokeWidth="1.5" />
            <text x="330" y="195" fill="#991b1b" fontSize="12" fontWeight="700">Left Atrium</text>
            <text x="330" y="210" fill="#b91c1c" fontSize="10">Oxygenated</text>

            <rect x="315" y="255" width="115" height="105" rx="8" fill="#fecaca" stroke="#b91c1c" strokeWidth="2.5" />
            <text x="330" y="295" fill="#991b1b" fontSize="12" fontWeight="700">Left Ventricle</text>
            <text x="330" y="310" fill="#b91c1c" fontSize="10">Thick muscular wall</text>
            <text x="330" y="325" fill="#7f1d1d" fontSize="9">Pumps to body</text>

            {/* Major Blood Vessels */}
            {/* Superior Vena Cava */}
            <path d="M 170 50 L 170 160" stroke="#2563eb" strokeWidth="14" strokeLinecap="round" />
            <text x="100" y="70" fill="#1e40af" fontSize="11" fontWeight="600">Vena Cava ➔</text>

            {/* Aorta Arch */}
            <path
              d="M 330 160 C 330 60, 240 40, 240 40"
              fill="none"
              stroke="#dc2626"
              strokeWidth="16"
              strokeLinecap="round"
            />
            {/* Aorta branches */}
            <line x1="260" y1="45" x2="260" y2="25" stroke="#dc2626" strokeWidth="7" />
            <line x1="280" y1="50" x2="280" y2="25" stroke="#dc2626" strokeWidth="7" />
            <line x1="300" y1="58" x2="305" y2="25" stroke="#dc2626" strokeWidth="7" />
            <text x="325" y="45" fill="#991b1b" fontSize="12" fontWeight="700">Aorta (to Body)</text>

            {/* Pulmonary Artery */}
            <path d="M 230 255 Q 230 120 130 100" fill="none" stroke="#3b82f6" strokeWidth="10" />
            <text x="50" y="115" fill="#1d4ed8" fontSize="11" fontWeight="600">To Lungs ➔</text>

            {/* Pulmonary Veins */}
            <path d="M 460 165 L 420 180" stroke="#ef4444" strokeWidth="10" />
            <text x="440" y="155" fill="#b91c1c" fontSize="11" fontWeight="600">From Lungs ➔</text>
          </svg>
        );

      case 'electrolysis':
        return (
          <svg viewBox="0 0 540 380" className="w-full h-auto bg-stone-50 rounded border border-stone-200">
            {/* Plastic Beaker */}
            <rect x="150" y="120" width="240" height="190" rx="8" fill="#f0fdf4" stroke="#475569" strokeWidth="3" />
            {/* Acidified Water fill */}
            <rect x="155" y="150" width="230" height="155" fill="#dbeafe" opacity="0.6" />
            <text x="165" y="170" fill="#0284c7" fontSize="11" fontStyle="italic">Acidified water (H₂O + H₂SO₄)</text>

            {/* Cathode Test Tube (Hydrogen) */}
            <rect x="190" y="60" width="50" height="180" rx="6" fill="#e0f2fe" stroke="#334155" strokeWidth="2" opacity="0.85" />
            {/* Hydrogen Gas Space (Double Volume) */}
            <rect x="190" y="60" width="50" height="75" fill="#ffffff" opacity="0.95" />
            <text x="195" y="85" fill="#1e3a8a" fontSize="11" fontWeight="700">H₂ Gas</text>
            <text x="195" y="100" fill="#2563eb" fontSize="9" fontWeight="600">(2 Volumes)</text>

            {/* Anode Test Tube (Oxygen) */}
            <rect x="300" y="60" width="50" height="180" rx="6" fill="#fee2e2" stroke="#334155" strokeWidth="2" opacity="0.85" />
            {/* Oxygen Gas Space (Single Volume) */}
            <rect x="300" y="60" width="50" height="40" fill="#ffffff" opacity="0.95" />
            <text x="305" y="80" fill="#991b1b" fontSize="11" fontWeight="700">O₂ Gas</text>
            <text x="305" y="93" fill="#dc2626" fontSize="9" fontWeight="600">(1 Volume)</text>

            {/* Carbon / Graphite Electrodes */}
            <rect x="208" y="130" width="14" height="160" fill="#334155" rx="2" />
            <rect x="318" y="130" width="14" height="160" fill="#334155" rx="2" />

            {/* Rubber Stoppers */}
            <rect x="200" y="285" width="30" height="25" fill="#78716c" rx="3" />
            <rect x="310" y="285" width="30" height="25" fill="#78716c" rx="3" />

            {/* Wiring and 6V Battery */}
            <path d="M 215 310 L 215 350 L 250 350" fill="none" stroke="#000000" strokeWidth="2.5" />
            <path d="M 325 310 L 325 350 L 290 350" fill="none" stroke="#000000" strokeWidth="2.5" />

            {/* Battery Symbol */}
            <line x1="250" y1="335" x2="250" y2="365" stroke="#000" strokeWidth="4" />
            <line x1="260" y1="342" x2="260" y2="358" stroke="#000" strokeWidth="2" />
            <line x1="270" y1="335" x2="270" y2="365" stroke="#000" strokeWidth="4" />
            <line x1="280" y1="342" x2="280" y2="358" stroke="#000" strokeWidth="2" />
            <line x1="290" y1="335" x2="290" y2="365" stroke="#000" strokeWidth="4" />
            <text x="250" y="330" fill="#000" fontSize="10" fontWeight="700">- Cathode</text>
            <text x="290" y="330" fill="#000" fontSize="10" fontWeight="700">+ Anode</text>
            <text x="245" y="378" fill="#475569" fontSize="10" fontWeight="600">6V Battery Source</text>
          </svg>
        );

      case 'stomata':
        return (
          <svg viewBox="0 0 540 280" className="w-full h-auto bg-stone-50 rounded border border-stone-200">
            {/* Left: Open Pore */}
            <g transform="translate(40, 20)">
              <text x="60" y="25" fill="#15803d" fontSize="14" fontWeight="700">Open Stomatal Pore</text>
              <text x="35" y="42" fill="#4b5563" fontSize="11">Guard cells turgid & swollen</text>
              {/* Outer guard cells */}
              <path
                d="M 90 70 C 40 100, 40 180, 90 210 C 110 180, 110 100, 90 70 Z"
                fill="#86efac"
                stroke="#15803d"
                strokeWidth="2.5"
              />
              <path
                d="M 130 70 C 180 100, 180 180, 130 210 C 110 180, 110 100, 130 70 Z"
                fill="#86efac"
                stroke="#15803d"
                strokeWidth="2.5"
              />
              {/* Central open aperture */}
              <ellipse cx="110" cy="140" rx="14" ry="40" fill="#1f2937" />
              {/* Chloroplast dots */}
              <circle cx="75" cy="110" r="3" fill="#14532d" />
              <circle cx="70" cy="140" r="3" fill="#14532d" />
              <circle cx="80" cy="170" r="3" fill="#14532d" />
              <circle cx="145" cy="110" r="3" fill="#14532d" />
              <circle cx="150" cy="140" r="3" fill="#14532d" />
              <circle cx="140" cy="170" r="3" fill="#14532d" />
            </g>

            {/* Right: Closed Pore */}
            <g transform="translate(300, 20)">
              <text x="60" y="25" fill="#b45309" fontSize="14" fontWeight="700">Closed Stomatal Pore</text>
              <text x="40" y="42" fill="#4b5563" fontSize="11">Guard cells flaccid & shrunken</text>
              {/* Guard cells touching closely */}
              <path
                d="M 100 70 C 65 100, 65 180, 100 210 C 108 180, 108 100, 100 70 Z"
                fill="#fed7aa"
                stroke="#c2410c"
                strokeWidth="2.5"
              />
              <path
                d="M 120 70 C 155 100, 155 180, 120 210 C 112 180, 112 100, 120 70 Z"
                fill="#fed7aa"
                stroke="#c2410c"
                strokeWidth="2.5"
              />
              {/* Slit line */}
              <line x1="110" y1="75" x2="110" y2="205" stroke="#7c2d12" strokeWidth="2" />
            </g>
          </svg>
        );

      default:
        // Generic fallback schematic
        return (
          <div className="w-full h-64 bg-stone-100 rounded border border-stone-200 flex flex-col items-center justify-center p-6 text-center">
            <Sparkles className="w-8 h-8 text-amber-600 mb-2" />
            <p className="font-semibold text-stone-800">{diagram.title}</p>
            <p className="text-xs text-stone-500 max-w-md mt-1">{diagram.caption}</p>
          </div>
        );
    }
  };

  return (
    <div className="my-6 border border-stone-300 rounded-lg bg-stone-50 overflow-hidden shadow-xs">
      {/* Header Bar */}
      <div className="px-4 py-2.5 bg-stone-100 border-b border-stone-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[11px] uppercase tracking-wide">
            {diagram.diagramType.replace('_', ' ')}
          </span>
          <span className="font-medium text-stone-700">{diagram.title}</span>
          {diagram.sourcePageRef && (
            <span className="text-stone-500 font-mono text-[11px] border border-stone-200 bg-white px-1.5 py-0.2 rounded">
              Notebook p.{diagram.sourcePageRef}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {diagram.searchQuery && onSearchMore && (
            <button
              onClick={() => onSearchMore(diagram.searchQuery || diagram.title)}
              className="text-stone-600 hover:text-stone-900 flex items-center gap-1 hover:underline text-[11px]"
              title="Search related scientific diagrams"
            >
              <Search className="w-3.5 h-3.5" /> Explore Diagrams
            </button>
          )}
          <button
            onClick={() => setShowAttribution(!showAttribution)}
            className="text-stone-500 hover:text-stone-800"
            title="View source & attribution"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Diagram Area */}
      <div className="p-4 bg-white flex flex-col items-center">
        {diagram.sourceUrl ? (
          <div className="relative max-w-full">
            <img
              src={diagram.sourceUrl}
              alt={diagram.title}
              className="max-h-96 object-contain rounded border border-stone-200"
              loading="lazy"
            />
          </div>
        ) : (
          renderPresetSvg(diagram.svgPresetKey)
        )}

        {/* Interactive Anatomical / Diagram Labels */}
        {diagram.labels && diagram.labels.length > 0 && (
          <div className="w-full mt-4 border-t border-stone-200 pt-3">
            <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
              Key Components & Callouts (Click to Inspect):
            </p>
            <div className="flex flex-wrap gap-1.5">
              {diagram.labels.map((lbl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveLabelIndex(activeLabelIndex === idx ? null : idx)}
                  className={`text-xs px-2.5 py-1 rounded border transition-colors text-left flex items-center gap-1.5 ${
                    activeLabelIndex === idx
                      ? 'bg-amber-800 text-white border-amber-900 shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-stone-300 text-stone-800 text-[10px] flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <span>{lbl.name}</span>
                </button>
              ))}
            </div>

            {/* Selected Label Details */}
            {activeLabelIndex !== null && diagram.labels[activeLabelIndex] && (
              <div className="mt-2.5 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-950 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">{diagram.labels[activeLabelIndex].name}: </span>
                  <span>{diagram.labels[activeLabelIndex].description || 'Identified anatomical/schematic element.'}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Caption & Attribution Footer */}
      <div className="px-4 py-2.5 bg-stone-50 border-t border-stone-200 text-xs text-stone-600">
        <p className="leading-relaxed">
          <strong className="text-stone-800">Figure: </strong>
          {diagram.caption}
        </p>

        {showAttribution && (
          <div className="mt-2 pt-2 border-t border-stone-200 text-[11px] text-stone-500 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span>Source & Attribution: </span>
              <span className="font-medium text-stone-700">{diagram.attribution || 'CBSE Educational Textbook Schema'}</span>
              <span className="mx-1.5">•</span>
              <span>License: {diagram.license || 'Open Educational License'}</span>
            </div>
            {diagram.searchQuery && (
              <a
                href={`https://commons.wikimedia.org/w/index.php?search=${encodeURIComponent(diagram.searchQuery)}`}
                target="_blank"
                rel="noreferrer"
                className="text-amber-800 hover:underline flex items-center gap-1 font-medium"
              >
                Wikimedia Commons <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
