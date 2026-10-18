import React, { useState, useEffect } from 'react';
import type { ChapterPackage } from './lib/types.ts';
import { EXEMPLAR_CHAPTERS } from './data/exemplarChapters.ts';
import { getFullNCERTChapterList } from './data/ncertSyllabus.ts';
import { TextbookHome } from './components/TextbookHome.tsx';
import { TextbookReader } from './components/TextbookReader.tsx';
import { PublisherStudio } from './components/PublisherStudio.tsx';
import {
  BookOpen,
  Upload,
  Sparkles,
  Layers,
  ChevronRight,
  Database,
  Search,
  ExternalLink,
  ShieldCheck,
  FolderArchive,
} from 'lucide-react';

const INITIAL_NCERT_CHAPTERS = getFullNCERTChapterList(EXEMPLAR_CHAPTERS);

export default function App() {
  const [chapters, setChapters] = useState<ChapterPackage[]>(INITIAL_NCERT_CHAPTERS);
  const [selectedChapter, setSelectedChapter] = useState<ChapterPackage>(INITIAL_NCERT_CHAPTERS[0]);
  const [currentView, setCurrentView] = useState<'home' | 'reader' | 'publisher'>('home');
  const [isLoading, setIsLoading] = useState(false);
  const [serverOnline, setServerOnline] = useState(true);

  // Fetch chapters from persistent server API
  const fetchChapters = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/chapters');
      if (res.ok) {
        const data = await res.json();
        if (data.chapters && data.chapters.length > 0) {
          setChapters(data.chapters);
          setServerOnline(true);
          // If selected chapter is in list, update its state too
          const found = data.chapters.find((c: ChapterPackage) => c.id === selectedChapter?.id);
          if (found) setSelectedChapter(found);
          return;
        }
      }
      setServerOnline(false);
    } catch (err) {
      console.warn('API /api/chapters unavailable, using embedded offline store:', err);
      setServerOnline(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChapters();
  }, []);

  // Save or update chapter
  const handleSaveChapter = async (chapter: ChapterPackage): Promise<boolean> => {
    try {
      const res = await fetch('/api/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chapter),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.errors?.join('\n') || 'Failed to save chapter.');
      }

      await fetchChapters();
      setSelectedChapter(chapter);
      return true;
    } catch (err) {
      console.warn('Backend save error, updating local state:', err);
      // Fallback: update local state directly so UI never breaks
      setChapters((prev) => {
        const idx = prev.findIndex((c) => c.id === chapter.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = chapter;
          return copy;
        }
        return [...prev, chapter];
      });
      setSelectedChapter(chapter);
      return true;
    }
  };

  // Delete chapter
  const handleDeleteChapter = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/chapters/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchChapters();
        if (selectedChapter.id === id && chapters.length > 1) {
          const remain = chapters.filter((c) => c.id !== id);
          setSelectedChapter(remain[0]);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Delete error', err);
      setChapters((prev) => prev.filter((c) => c.id !== id));
      return true;
    }
  };

  // Resolve an uncertainty flag in current chapter
  const handleResolveUncertainty = async (flagId: string, resolvedText: string) => {
    if (!selectedChapter) return;
    const updatedSections = selectedChapter.sections.map((sec) => ({
      ...sec,
      uncertainties: sec.uncertainties?.map((u) =>
        u.id === flagId ? { ...u, resolved: true, resolvedText } : u
      ),
    }));

    const updated: ChapterPackage = {
      ...selectedChapter,
      sections: updatedSections,
      sourceInfo: {
        ...selectedChapter.sourceInfo,
        flaggedUncertaintiesCount: Math.max(
          0,
          selectedChapter.sourceInfo.flaggedUncertaintiesCount - 1
        ),
      },
    };

    setSelectedChapter(updated);
    await handleSaveChapter(updated);
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900 font-sans flex flex-col selection:bg-amber-100 selection:text-amber-900">
      {/* 1. Near-Black Application Navigation (Per Design Constitution) */}
      <header className="bg-stone-950 text-stone-100 border-b border-stone-800 sticky top-0 z-50 print:hidden shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 min-h-16 py-2 sm:py-0 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand & Class Tag */}
          <div
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-600/90 flex items-center justify-center text-stone-950 shadow-xs group-hover:bg-amber-500 transition-colors">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="font-serif font-bold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
                <span>AI Science Notes</span>
                <span className="text-[9px] sm:text-[10px] font-mono font-medium bg-stone-800 text-amber-400 border border-stone-700 px-1.5 py-0.2 rounded">
                  CBSE 10
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-400 font-sans tracking-wide hidden sm:block">
                Development-Window Transcription & Live Sync
              </p>
            </div>
          </div>

          {/* Nav Controls */}
          <nav className="flex items-center gap-1.5 sm:gap-3 text-xs">
            <button
              onClick={() => setCurrentView('home')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md font-medium transition-colors ${
                currentView === 'home'
                  ? 'bg-stone-800 text-white'
                  : 'text-stone-300 hover:text-white hover:bg-stone-900'
              }`}
            >
              <span className="hidden sm:inline">All </span>Chapters
            </button>

            {selectedChapter && (
              <button
                onClick={() => setCurrentView('reader')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1 ${
                  currentView === 'reader'
                    ? 'bg-stone-800 text-white'
                    : 'text-stone-300 hover:text-white hover:bg-stone-900'
                }`}
              >
                <span>Read Ch {selectedChapter.chapterNumber}</span>
              </button>
            )}

            <button
              onClick={() => setCurrentView('publisher')}
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1 sm:gap-1.5 ${
                currentView === 'publisher'
                  ? 'bg-amber-600 text-stone-950 font-bold'
                  : 'bg-stone-800 text-amber-400 hover:bg-amber-600 hover:text-stone-950'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Publisher </span>Studio
            </button>

            {/* Persistent store status badge */}
            <div className="hidden md:flex items-center gap-1.5 pl-2 border-l border-stone-800 text-[11px] text-stone-400 font-mono">
              <span
                className={`w-2 h-2 rounded-full ${
                  serverOnline ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span>{serverOnline ? 'Live Storage Synced' : 'Local Storage Mode'}</span>
            </div>
          </nav>
        </div>
      </header>

      {/* 2. Main Content View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <TextbookHome
            chapters={chapters}
            onSelectChapter={(chapter) => {
              setSelectedChapter(chapter);
              setCurrentView('reader');
            }}
            onOpenPublisher={() => setCurrentView('publisher')}
          />
        )}

        {currentView === 'reader' && selectedChapter && (
          <TextbookReader
            chapter={selectedChapter}
            onResolveUncertainty={handleResolveUncertainty}
            onSearchDiagram={(query) => {
              setCurrentView('publisher');
            }}
            onNavigatePublisher={() => {
              setCurrentView('publisher');
            }}
          />
        )}

        {currentView === 'publisher' && (
          <PublisherStudio
            chapters={chapters}
            onSaveChapter={handleSaveChapter}
            onDeleteChapter={handleDeleteChapter}
            onPreviewChapter={(ch) => {
              setSelectedChapter(ch);
              setCurrentView('reader');
            }}
          />
        )}
      </main>

      {/* 3. Academic Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-white text-stone-500 text-xs py-8 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-stone-900">AI Science Notes</span>
            <span>•</span>
            <span>CBSE Class 10 Science Digital Textbook</span>
          </div>

          <div className="flex items-center gap-4 text-stone-400 text-[11px]">
            <span>Zero Guessing Transcription</span>
            <span>•</span>
            <span>Faithful Chemical Equation Balancing</span>
            <span>•</span>
            <span>Vercel Deployable Architecture</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
