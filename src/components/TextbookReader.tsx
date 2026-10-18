import React, { useState } from 'react';
import type { ChapterPackage } from '../lib/types.ts';
import { EquationCard } from './EquationCard.tsx';
import { DiagramViewer } from './DiagramViewer.tsx';
import { UncertaintyInspector } from './UncertaintyInspector.tsx';
import {
  BookOpen,
  Printer,
  Share2,
  FileText,
  Clock,
  Sparkles,
  Award,
  AlertTriangle,
  ChevronRight,
  Bookmark,
  CheckCircle2,
  CheckSquare,
  Type,
  Eye,
  Download,
} from 'lucide-react';

interface TextbookReaderProps {
  chapter: ChapterPackage;
  onResolveUncertainty?: (flagId: string, resolvedText: string) => void;
  onSearchDiagram?: (query: string) => void;
  onNavigatePublisher?: () => void;
}

export const TextbookReader: React.FC<TextbookReaderProps> = ({
  chapter,
  onResolveUncertainty,
  onSearchDiagram,
  onNavigatePublisher,
}) => {
  const [activeSectionId, setActiveSectionId] = useState<string>(
    chapter.sections[0]?.id || ''
  );
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');
  const [showAuditorMode, setShowAuditorMode] = useState(false);
  const [checkedChecklist, setCheckedChecklist] = useState<Record<number, boolean>>({});

  const toggleChecklist = (idx: number) => {
    setCheckedChecklist((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(chapter, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${chapter.id}-export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const allUncertainties = chapter.sections.flatMap((s) => s.uncertainties || []);
  const pendingCount = allUncertainties.filter((u) => !u.resolved).length;

  const fontClasses =
    fontSize === 'normal'
      ? 'text-base leading-relaxed'
      : fontSize === 'large'
      ? 'text-lg leading-loose'
      : 'text-xl leading-loose';

  const familyClass = fontFamily === 'serif' ? 'font-serif' : 'font-sans';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top Reading Toolbar */}
      <div className="mb-6 pb-4 border-b border-stone-200 flex flex-wrap items-center justify-between gap-4 text-xs print:hidden">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-stone-600 font-sans">
          <span className="font-semibold text-stone-900">{chapter.classGrade}</span>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span
            className={`px-2 py-0.5 rounded font-medium ${
              chapter.subject === 'Biology'
                ? 'bg-emerald-100 text-emerald-800'
                : chapter.subject === 'Chemistry'
                ? 'bg-amber-100 text-amber-900'
                : 'bg-sky-100 text-sky-900'
            }`}
          >
            {chapter.subject}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-700 font-medium truncate max-w-xs">Chapter {chapter.chapterNumber}: {chapter.title}</span>
        </div>

        {/* Reader controls */}
        <div className="flex items-center gap-3">
          {/* Typography toggles */}
          <div className="flex items-center gap-1 border border-stone-200 rounded p-0.5 bg-stone-50">
            <button
              onClick={() => setFontFamily('serif')}
              className={`px-2 py-1 rounded font-serif ${
                fontFamily === 'serif' ? 'bg-white shadow-2xs font-bold text-stone-900' : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Serif Textbook Font"
            >
              Serif
            </button>
            <button
              onClick={() => setFontFamily('sans')}
              className={`px-2 py-1 rounded font-sans ${
                fontFamily === 'sans' ? 'bg-white shadow-2xs font-bold text-stone-900' : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Clean Sans Font"
            >
              Sans
            </button>
          </div>

          <div className="flex items-center gap-1 border border-stone-200 rounded p-0.5 bg-stone-50">
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2 py-1 rounded ${fontSize === 'normal' ? 'bg-white shadow-2xs font-bold text-stone-900' : 'text-stone-500'}`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-1 rounded text-sm ${fontSize === 'large' ? 'bg-white shadow-2xs font-bold text-stone-900' : 'text-stone-500'}`}
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('xlarge')}
              className={`px-2 py-1 rounded text-base ${fontSize === 'xlarge' ? 'bg-white shadow-2xs font-bold text-stone-900' : 'text-stone-500'}`}
            >
              A++
            </button>
          </div>

          {/* Uncertainty Auditor Mode Toggle */}
          <button
            onClick={() => setShowAuditorMode(!showAuditorMode)}
            className={`px-2.5 py-1.5 rounded flex items-center gap-1.5 transition-colors border ${
              showAuditorMode
                ? 'bg-amber-800 text-white border-amber-900'
                : pendingCount > 0
                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
            }`}
            title="Inspect handwriting source pages and transcription audit notes"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Auditor View</span>
            {pendingCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                {pendingCount}
              </span>
            )}
          </button>

          {/* Export JSON / Print */}
          <button
            onClick={handleExportJSON}
            className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded border border-stone-300 flex items-center gap-1"
            title="Export validated chapter package JSON"
          >
            <Download className="w-3.5 h-3.5" /> JSON
          </button>
          <button
            onClick={handlePrint}
            className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded flex items-center gap-1.5 font-medium shadow-2xs"
            title="Print or export as PDF"
          >
            <Printer className="w-3.5 h-3.5" /> Print / PDF
          </button>
        </div>
      </div>

      {/* Main Layout: Sidebar TOC + Textbook Reader Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sticky Table of Contents */}
        <aside className="lg:col-span-3 sticky top-20 bg-stone-50 border border-stone-200 rounded-lg p-4 print:hidden">
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-stone-200">
            <BookOpen className="w-4 h-4 text-amber-700" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-stone-800 font-sans">
              Chapter Index
            </h3>
          </div>

          <nav className="space-y-1">
            {chapter.tableOfContents.map((item) => (
              <a
                key={item.sectionId}
                href={`#${item.sectionId}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSectionId(item.sectionId);
                  const el = document.getElementById(item.sectionId);
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`block text-xs py-2 px-2.5 rounded transition-colors ${
                  activeSectionId === item.sectionId
                    ? 'bg-amber-100/90 text-amber-950 font-semibold border-l-3 border-amber-700'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <div className="flex items-start gap-1.5">
                  <span className="font-mono text-stone-500 shrink-0">{item.sectionNumber}</span>
                  <span className="line-clamp-2">{item.title}</span>
                </div>
              </a>
            ))}

            {chapter.revisionChecklist && chapter.revisionChecklist.length > 0 && (
              <a
                href="#revision-checklist"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById('revision-checklist');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="block text-xs py-2 px-2.5 rounded text-stone-600 hover:bg-stone-100 hover:text-stone-900 border-t border-stone-200 mt-2 pt-2"
              >
                <div className="flex items-center gap-1.5 font-medium text-amber-900">
                  <CheckSquare className="w-3.5 h-3.5 text-amber-700" />
                  <span>Revision Checklist</span>
                </div>
              </a>
            )}
          </nav>

          {/* Source Notebook Provenance Box */}
          <div className="mt-6 pt-4 border-t border-stone-200 text-[11px] text-stone-500 font-sans space-y-1.5">
            <div className="font-bold text-stone-700 uppercase tracking-wider text-[10px]">
              Transcribed Provenance
            </div>
            <div>
              <span className="text-stone-400">Notebook: </span>
              <span className="text-stone-700 font-medium">{chapter.sourceInfo.notebookTitle}</span>
            </div>
            <div>
              <span className="text-stone-400">Pages: </span>
              <span className="text-stone-700 font-mono font-medium">
                {chapter.sourceInfo.notebookPages.join(', ')}
              </span>
            </div>
            <div>
              <span className="text-stone-400">Model: </span>
              <span className="text-stone-700">{chapter.sourceInfo.transcriptionModel}</span>
            </div>
            <div>
              <span className="text-stone-400">Confidence: </span>
              <span className="text-emerald-700 font-semibold">{chapter.sourceInfo.confidenceScore}%</span>
            </div>
          </div>
        </aside>

        {/* Right Textbook Paper Document */}
        <article className="lg:col-span-9 bg-white border border-stone-300 rounded-xl shadow-xs p-6 sm:p-10 text-stone-900 print:border-none print:shadow-none print:p-0">
          {/* Chapter Header */}
          <header className="border-b-2 border-stone-900 pb-8 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs mb-3 text-stone-500 font-sans">
              <span className="font-mono uppercase tracking-widest text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {chapter.classGrade} • {chapter.subject}
              </span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-stone-400" /> {chapter.estimatedReadTime}
                </span>
                <span>•</span>
                <span>Version {chapter.version}.0</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold font-serif text-stone-950 tracking-tight mb-2">
              Chapter {chapter.chapterNumber}: {chapter.title}
            </h1>
            <p className="text-lg text-stone-600 font-serif italic mb-4">
              {chapter.subtitle}
            </p>

            {/* Synopsis Callout */}
            <div className="bg-stone-50 border-l-4 border-amber-700 p-4 rounded-r text-xs text-stone-700 font-sans leading-relaxed">
              <strong className="text-stone-900 font-semibold">Chapter Abstract: </strong>
              {chapter.summary}
            </div>

            {/* Awaiting Notes Queue Banner for Placeholder Chapters */}
            {chapter.status !== 'published' && (
              <div className="mt-4 p-4 bg-amber-50/80 border border-amber-300 rounded-lg text-xs font-sans text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                    <span>NCERT Syllabus Placeholder — Awaiting Handwritten Notes</span>
                  </div>
                  <p className="text-stone-600 text-[11px] leading-relaxed">
                    This chapter's core syllabus topics are queued in the repository. Attach your handwritten notebook photos in the Google AI Studio conversation or upload them via Publisher Studio to generate the complete typeset notes directly into the repo.
                  </p>
                </div>
                {onNavigatePublisher && (
                  <button
                    onClick={onNavigatePublisher}
                    className="px-3.5 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded text-xs font-semibold whitespace-nowrap shadow-2xs self-start sm:self-center"
                  >
                    Attach Notes for Chapter {chapter.chapterNumber}
                  </button>
                )}
              </div>
            )}
          </header>

          {/* Sections Body */}
          <div className="space-y-12">
            {chapter.sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-24 pb-8 border-b border-stone-200 last:border-b-0"
              >
                {/* Section Header */}
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="font-mono text-lg font-bold text-amber-800">
                    {section.sectionNumber}
                  </span>
                  <h2 className="text-2xl font-bold font-serif text-stone-900">
                    {section.title}
                  </h2>
                </div>

                {/* Section Summary Subtitle */}
                {section.summary && (
                  <p className="text-sm text-stone-500 italic mb-4 font-serif">
                    {section.summary}
                  </p>
                )}

                {/* Notebook Page Badge */}
                {section.sourceNotebookPages && section.sourceNotebookPages.length > 0 && (
                  <div className="mb-4 inline-flex items-center gap-1.5 text-[11px] font-mono text-stone-500 bg-stone-100 px-2.5 py-1 rounded border border-stone-200">
                    <FileText className="w-3 h-3 text-stone-400" />
                    <span>Transcribed from handwritten notebook p.{section.sourceNotebookPages.join(', ')}</span>
                  </div>
                )}

                {/* Paragraphs with high fidelity typography */}
                <div className={`space-y-4 text-stone-800 ${familyClass} ${fontClasses}`}>
                  {section.paragraphs.map((p, pIdx) => (
                    <p key={pIdx} className="text-justify leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>

                {/* Definitions with CBSE Frequency Flags */}
                {section.definitions && section.definitions.length > 0 && (
                  <div className="my-6 space-y-3 font-sans">
                    {section.definitions.map((def) => (
                      <div
                        key={def.id}
                        className="border-l-3 border-amber-600 bg-amber-50/50 p-4 rounded-r border-t border-r border-b border-amber-200/60"
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <div className="flex items-center gap-1.5">
                            <Bookmark className="w-3.5 h-3.5 text-amber-700 fill-amber-700" />
                            <span className="font-bold text-amber-950 uppercase tracking-wide text-[11px]">
                              Key Scientific Definition
                            </span>
                          </div>
                          {def.cbseFrequency && (
                            <span className="font-mono text-[10px] bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded font-semibold">
                              CBSE: {def.cbseFrequency}
                            </span>
                          )}
                        </div>
                        <p className="text-stone-950 font-bold text-base mt-1">
                          {def.term}
                        </p>
                        <p className="text-stone-700 text-sm mt-1 leading-relaxed">
                          {def.definition}
                        </p>
                        {def.keyPoints && def.keyPoints.length > 0 && (
                          <ul className="mt-2 space-y-1 list-disc list-inside text-xs text-stone-600">
                            {def.keyPoints.map((pt, ptIdx) => (
                              <li key={ptIdx}>{pt}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Chemical Equations */}
                {section.equations && section.equations.length > 0 && (
                  <div className="my-6 space-y-4">
                    {section.equations.map((eq) => (
                      <EquationCard key={eq.id} equation={eq} />
                    ))}
                  </div>
                )}

                {/* Comparison Tables */}
                {section.tables && section.tables.length > 0 && (
                  <div className="my-6 space-y-4">
                    {section.tables.map((table) => (
                      <div key={table.id} className="border border-stone-300 rounded-lg overflow-hidden bg-white shadow-2xs font-sans">
                        <div className="bg-stone-100 px-4 py-2.5 border-b border-stone-200 font-bold text-xs text-stone-800">
                          {table.title}
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-semibold uppercase text-[11px]">
                              <tr>
                                {table.columns.map((col, cIdx) => (
                                  <th key={cIdx} className="px-4 py-2.5 border-r border-stone-200 last:border-r-0">
                                    {col}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-200">
                              {table.rows.map((row, rIdx) => (
                                <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'}>
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="px-4 py-2.5 border-r border-stone-200 last:border-r-0 text-stone-800">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Scientific Diagrams */}
                {section.diagrams && section.diagrams.length > 0 && (
                  <div className="my-6 space-y-6">
                    {section.diagrams.map((diag) => (
                      <DiagramViewer
                        key={diag.id}
                        diagram={diag}
                        onSearchMore={onSearchDiagram}
                      />
                    ))}
                  </div>
                )}

                {/* Exam Tips / CBSE Board Focus */}
                {section.examTips && section.examTips.length > 0 && (
                  <div className="my-6 space-y-3 font-sans">
                    {section.examTips.map((tip) => (
                      <div
                        key={tip.id}
                        className="bg-stone-50 border border-stone-300 rounded-lg p-4 text-xs"
                      >
                        <div className="flex items-center justify-between text-stone-700 pb-1.5 mb-2 border-b border-stone-200">
                          <div className="flex items-center gap-1.5 font-bold text-amber-800">
                            <Award className="w-4 h-4" />
                            <span>CBSE Board Focus & Model Answer Outline</span>
                          </div>
                          {tip.yearAsked && (
                            <span className="font-mono text-[10px] bg-stone-200 text-stone-800 px-2 py-0.5 rounded">
                              {tip.yearAsked}
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-stone-900 text-sm mb-1.5">
                          Q: {tip.question}
                        </p>
                        <p className="text-stone-700 leading-relaxed">
                          <strong>Key Marking Criteria: </strong>
                          {tip.answerOutline}
                        </p>
                        {tip.commonPitfall && (
                          <div className="mt-2 pt-2 border-t border-stone-200 text-amber-900 flex items-start gap-1.5 bg-amber-50/60 p-2 rounded">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span>
                              <strong>Common Examination Pitfall: </strong>
                              {tip.commonPitfall}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Uncertainty Inspector (Always shown if in Auditor mode or unresolved) */}
                {(showAuditorMode || (section.uncertainties && section.uncertainties.some((u) => !u.resolved))) && (
                  <UncertaintyInspector
                    uncertainties={section.uncertainties || []}
                    onResolve={onResolveUncertainty}
                  />
                )}

                {/* Key Takeaways */}
                {section.keyTakeaways && section.keyTakeaways.length > 0 && (
                  <div className="mt-5 p-3.5 bg-stone-50 rounded border border-stone-200 font-sans text-xs">
                    <div className="font-bold text-stone-700 uppercase tracking-wide text-[11px] mb-1.5">
                      Section High-Yield Points:
                    </div>
                    <ul className="space-y-1 list-disc list-inside text-stone-600">
                      {section.keyTakeaways.map((takeaway, tIdx) => (
                        <li key={tIdx}>{takeaway}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Chapter End Revision Checklist */}
          {chapter.revisionChecklist && chapter.revisionChecklist.length > 0 && (
            <footer id="revision-checklist" className="mt-12 pt-8 border-t-2 border-stone-800 font-sans">
              <div className="flex items-center gap-2 mb-3">
                <CheckSquare className="w-5 h-5 text-amber-700" />
                <h3 className="font-bold text-lg text-stone-900">
                  CBSE Mastery & Recall Checklist
                </h3>
              </div>
              <p className="text-xs text-stone-500 mb-4">
                Self-test before examinations. Tick each concept once you can recall the definition, diagram, or formula from memory.
              </p>
              <div className="space-y-2">
                {chapter.revisionChecklist.map((item, idx) => (
                  <label
                    key={idx}
                    onClick={() => toggleChecklist(idx)}
                    className={`flex items-start gap-3 p-3 rounded border text-xs cursor-pointer transition-all ${
                      checkedChecklist[idx]
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 line-through opacity-80'
                        : 'bg-stone-50 border-stone-200 text-stone-800 hover:bg-stone-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!checkedChecklist[idx]}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-amber-700 focus:ring-amber-500"
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </footer>
          )}
        </article>
      </div>
    </div>
  );
};
