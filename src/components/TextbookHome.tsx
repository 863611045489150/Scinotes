import React, { useState } from 'react';
import type { ChapterPackage, SubjectType } from '../lib/types.ts';
import { searchChapters, SearchMatch } from '../lib/searchIndex.ts';
import {
  BookOpen,
  Search,
  Sparkles,
  Clock,
  ChevronRight,
  Bookmark,
  Layers,
  FileCheck,
  Flame,
  ArrowRight,
  Upload,
} from 'lucide-react';

interface TextbookHomeProps {
  chapters: ChapterPackage[];
  onSelectChapter: (chapter: ChapterPackage) => void;
  onOpenPublisher: () => void;
}

export const TextbookHome: React.FC<TextbookHomeProps> = ({
  chapters,
  onSelectChapter,
  onOpenPublisher,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults: SearchMatch[] = searchQuery.trim()
    ? searchChapters(chapters, searchQuery, selectedSubject)
    : [];

  const filteredChapters = chapters.filter((ch) => {
    if (selectedSubject !== 'All' && ch.subject !== selectedSubject) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* Hero Banner: Premium Academic Editorial */}
      <section className="bg-stone-900 text-stone-100 rounded-2xl p-6 sm:p-10 border border-stone-800 shadow-sm relative overflow-hidden">
        {/* Subtle decorative accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 bg-stone-800 text-amber-400 border border-stone-700 px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wide">
            <Sparkles className="w-3.5 h-3.5" /> CBSE Class 10 Science Digital Textbook
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight leading-tight">
            Handwritten Notes Transcribed Into Typeset Science.
          </h1>

          <p className="text-stone-300 text-sm sm:text-base font-sans leading-relaxed">
            Reconstructed faithfully from student notebook pages with chemical equations, high-yield definitions, CBSE exam tips, and interactive scientific diagrams.
          </p>

          {/* Quick Stats & CTA */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-sans">
            <button
              onClick={onOpenPublisher}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg flex items-center gap-2 transition-all shadow-md"
            >
              <Upload className="w-4 h-4 text-stone-950" />
              Publisher Studio & Sync
            </button>
            <div className="text-stone-400 flex items-center gap-3">
              <span>{chapters.length} Chapters Available</span>
              <span>•</span>
              <span>Gemini Vision OCR</span>
              <span>•</span>
              <span>Zero-Drift Sync</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Subject Filter Bar */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Subject Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-lg border border-stone-200 text-xs font-medium">
            {['All', 'Biology', 'Chemistry', 'Physics'].map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-3 py-1.5 rounded transition-colors ${
                  selectedSubject === sub
                    ? 'bg-white text-stone-950 font-bold shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* Real-time Search Input */}
          <div className="relative flex-1 sm:max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts, equations, nephron, respiration..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Search Results Display */}
        {searchQuery.trim() && (
          <div className="bg-white border border-stone-300 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-stone-200">
              <span className="font-bold text-stone-800">
                Found {searchResults.length} Match{searchResults.length === 1 ? '' : 'es'} for "{searchQuery}"
              </span>
              <span className="text-stone-500 text-[11px]">Instant text & equation search</span>
            </div>

            {searchResults.length === 0 ? (
              <p className="text-xs text-stone-500 py-3 text-center">
                No matching notes found. Try searching for terms like "photosynthesis", "nephron", "pyruvate", or "mass".
              </p>
            ) : (
              <div className="divide-y divide-stone-100 max-h-96 overflow-y-auto space-y-2">
                {searchResults.map((match, idx) => {
                  const targetChapter = chapters.find((c) => c.id === match.chapterId);
                  return (
                    <div
                      key={idx}
                      onClick={() => targetChapter && onSelectChapter(targetChapter)}
                      className="pt-2 pb-2 cursor-pointer hover:bg-stone-50 rounded p-2 transition-colors"
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-semibold text-amber-800">
                          Ch {match.chapterNumber}: {match.chapterTitle}
                        </span>
                        <span className="font-mono bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded text-[10px] uppercase">
                          {match.matchType}
                        </span>
                      </div>
                      {match.sectionTitle && (
                        <div className="text-xs font-medium text-stone-700 mb-0.5">
                          {match.sectionTitle}
                        </div>
                      )}
                      <p className="text-xs text-stone-600 font-sans line-clamp-2">
                        {match.matchSnippet}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Chapters Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-xl text-stone-900">
            {selectedSubject === 'All' ? 'NCERT Textbook Chapters' : `${selectedSubject} Notes`}
          </h2>
          <span className="text-xs text-stone-500">
            CBSE 2026 Curriculum Syllabus
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredChapters.map((chapter) => (
            <div
              key={chapter.id}
              onClick={() => onSelectChapter(chapter)}
              className="group bg-white border border-stone-300 hover:border-amber-700/60 rounded-xl p-6 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Badges */}
                <div className="flex items-center justify-between text-xs mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                        chapter.subject === 'Biology'
                          ? 'bg-emerald-100 text-emerald-800'
                          : chapter.subject === 'Chemistry'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-sky-100 text-sky-900'
                      }`}
                    >
                      {chapter.subject}
                    </span>
                    <span className="text-stone-500 font-mono text-[11px]">
                      Chapter {chapter.chapterNumber}
                    </span>
                    {chapter.status === 'published' ? (
                      <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                        Transcribed & Typeset
                      </span>
                    ) : (
                      <span className="bg-stone-100 text-stone-600 font-medium px-2 py-0.5 rounded text-[10px] border border-stone-200">
                        Placeholder (Awaiting Notes)
                      </span>
                    )}
                  </div>
                  <span className="text-stone-400 text-xs flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5" /> {chapter.estimatedReadTime}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold font-serif text-stone-950 group-hover:text-amber-800 transition-colors">
                  {chapter.title}
                </h3>
                <p className="text-xs text-stone-500 italic mt-0.5 font-serif">
                  {chapter.subtitle}
                </p>

                {/* Summary */}
                <p className="text-xs text-stone-600 mt-3 line-clamp-3 leading-relaxed">
                  {chapter.summary}
                </p>

                {/* Section pills preview */}
                <div className="mt-4 pt-3 border-t border-stone-100 space-y-1.5">
                  <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    {chapter.status === 'published' ? 'Transcribed Sections:' : 'Syllabus Core Topics:'}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {chapter.sections.slice(0, 3).map((sec) => (
                      <span
                        key={sec.id}
                        className={`text-[11px] px-2 py-0.5 rounded border ${
                          chapter.status === 'published'
                            ? 'bg-stone-100 text-stone-700 border-stone-200'
                            : 'bg-stone-50 text-stone-500 border-dashed border-stone-300'
                        }`}
                      >
                        {sec.sectionNumber} {sec.title.split('&')[0].trim()}
                      </span>
                    ))}
                    {chapter.sections.length > 3 && (
                      <span className="text-[11px] text-stone-400 py-0.5">
                        +{chapter.sections.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-6 pt-4 border-t border-stone-200 flex items-center justify-between text-xs">
                <div className="text-stone-500 flex items-center gap-3">
                  <span>{chapter.sections.reduce((acc, s) => acc + (s.diagrams?.length || 0), 0)} Diagrams</span>
                  <span>•</span>
                  <span>{chapter.sections.reduce((acc, s) => acc + (s.equations?.length || 0), 0)} Reactions</span>
                </div>
                <span className="text-amber-800 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  {chapter.status === 'published' ? 'Read Chapter' : 'Inspect Syllabus / Add Notes'} <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Educational Publishing Workflow Guide */}
      <section className="bg-stone-50 border border-stone-300 rounded-xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-amber-700" />
          <h2 className="font-serif font-bold text-base text-stone-900">
            Publishing Architecture: From Conversation Attachment to Live Textbook
          </h2>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed max-w-3xl">
          This system follows an explicit, zero-fabrication transcription pipeline designed for CBSE Class 10 Science notes:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 text-xs">
          <div className="bg-white p-4 rounded-lg border border-stone-200 space-y-1.5">
            <span className="font-mono font-bold text-amber-800 text-[11px]">STEP 1</span>
            <div className="font-bold text-stone-900">Attach Notebook Notes</div>
            <p className="text-stone-500 text-[11px] leading-relaxed">
              Attach handwritten photos or PDFs directly in the development conversation or upload via Publisher Studio.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-stone-200 space-y-1.5">
            <span className="font-mono font-bold text-amber-800 text-[11px]">STEP 2</span>
            <div className="font-bold text-stone-900">Gemini Transcription</div>
            <p className="text-stone-500 text-[11px] leading-relaxed">
              Multimodal model transcribes equations, definitions, and diagram callouts without guessing uncertain words.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-stone-200 space-y-1.5">
            <span className="font-mono font-bold text-amber-800 text-[11px]">STEP 3</span>
            <div className="font-bold text-stone-900">Uncertainty Audit</div>
            <p className="text-stone-500 text-[11px] leading-relaxed">
              Ambiguous pen strokes are flagged with source notebook page references for student/teacher verification.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-stone-200 space-y-1.5">
            <span className="font-mono font-bold text-amber-800 text-[11px]">STEP 4</span>
            <div className="font-bold text-stone-900">Instant Live Sync</div>
            <p className="text-stone-500 text-[11px] leading-relaxed">
              Import validated ChapterPackage into persistent storage. Appears on the website instantly without redeploying!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
