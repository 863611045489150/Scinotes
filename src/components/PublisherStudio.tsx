import React, { useState, useEffect } from 'react';
import type { ChapterPackage, DiagramReference } from '../lib/types.ts';
import { validateChapterPackage } from '../lib/validator.ts';
import { UncertaintyInspector } from './UncertaintyInspector.tsx';
import {
  Upload,
  CheckCircle,
  AlertCircle,
  FileText,
  Save,
  Send,
  Eye,
  RefreshCw,
  Search,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  ExternalLink,
  BookOpen,
  FolderArchive,
  Image as ImageIcon,
  Check,
} from 'lucide-react';

interface RawNoteItem {
  id: string;
  fileName: string;
  fileRelPath: string;
  chapterNumber?: number;
  subject: string;
  uploadedAt: string;
  notesText?: string;
  status: 'raw_untranscribed' | 'transcribed';
}

interface PublisherStudioProps {
  chapters: ChapterPackage[];
  onSaveChapter: (chapter: ChapterPackage) => Promise<boolean>;
  onDeleteChapter: (id: string) => Promise<boolean>;
  onPreviewChapter: (chapter: ChapterPackage) => void;
}

export const PublisherStudio: React.FC<PublisherStudioProps> = ({
  chapters,
  onSaveChapter,
  onDeleteChapter,
  onPreviewChapter,
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'untranscribed' | 'manage' | 'diagrams'>('import');
  const [jsonInput, setJsonInput] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [stagedChapter, setStagedChapter] = useState<ChapterPackage | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Untranscribed Notes Repository State
  const [rawNotes, setRawNotes] = useState<RawNoteItem[]>([]);
  const [isLoadingRawNotes, setIsLoadingRawNotes] = useState(false);
  const [rawNoteChapterNum, setRawNoteChapterNum] = useState<number>(1);
  const [rawNoteSubject, setRawNoteSubject] = useState<'Biology' | 'Chemistry' | 'Physics'>('Biology');
  const [rawNoteFile, setRawNoteFile] = useState<File | null>(null);
  const [rawNoteText, setRawNoteText] = useState('');

  const fetchRawNotes = async () => {
    setIsLoadingRawNotes(true);
    try {
      const res = await fetch('/api/raw-notes');
      if (res.ok) {
        const data = await res.json();
        if (data.notes) setRawNotes(data.notes);
      }
    } catch (err) {
      console.warn('Could not fetch raw notes:', err);
    } finally {
      setIsLoadingRawNotes(false);
    }
  };

  useEffect(() => {
    fetchRawNotes();
  }, []);

  // Save raw untranscribed note directly into repo
  const handleSaveRawNoteToRepo = async () => {
    if (!rawNoteFile && !rawNoteText.trim()) return;
    setIsSaving(true);
    try {
      let fileBase64: string | undefined;
      if (rawNoteFile) {
        fileBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(rawNoteFile);
        });
      }

      const res = await fetch('/api/raw-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: rawNoteFile?.name || `Notes-Chapter-${rawNoteChapterNum}.txt`,
          fileBase64,
          notesText: rawNoteText.trim() || undefined,
          subject: rawNoteSubject,
          chapterNumber: rawNoteChapterNum,
        }),
      });

      if (res.ok) {
        setSaveSuccessMsg('Untranscribed note saved directly into repository disk (data/untranscribed/)!');
        setRawNoteFile(null);
        setRawNoteText('');
        await fetchRawNotes();
      }
    } catch (err) {
      console.error('Failed to save raw note to repo:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // OCR Transcriber state
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notesSubject, setNotesSubject] = useState<'Biology' | 'Chemistry' | 'Physics'>('Biology');

  // Diagram search state
  const [diagramQuery, setDiagramQuery] = useState('');
  const [isSearchingDiagrams, setIsSearchingDiagrams] = useState(false);
  const [diagramResults, setDiagramResults] = useState<
    Array<{ title: string; url: string; description: string; attribution: string; license: string }>
  >([]);

  // Validate JSON string
  const handleValidateJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const res = validateChapterPackage(parsed);
      setValidationErrors(res.errors);
      setValidationWarnings(res.warnings);
      if (res.valid && res.chapter) {
        setStagedChapter(res.chapter);
        setSaveSuccessMsg('Chapter JSON successfully validated and staged for review!');
      } else {
        setStagedChapter(null);
      }
    } catch (err) {
      setValidationErrors([`JSON Syntax Error: ${(err as Error).message}`]);
      setValidationWarnings([]);
      setStagedChapter(null);
    }
  };

  // Publish or save staged chapter
  const handlePublishStaged = async (asStatus: 'published' | 'draft') => {
    if (!stagedChapter) return;
    setIsSaving(true);
    setSaveSuccessMsg('');
    try {
      const updated: ChapterPackage = {
        ...stagedChapter,
        status: asStatus,
        lastUpdated: new Date().toISOString(),
      };
      const ok = await onSaveChapter(updated);
      if (ok) {
        setStagedChapter(updated);
        setSaveSuccessMsg(
          asStatus === 'published'
            ? `Chapter "${updated.title}" successfully published to live website!`
            : `Chapter "${updated.title}" saved as draft.`
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  // In-app OCR Transcribe
  const handleTranscribeFile = async () => {
    if (!selectedFile) return;
    setIsTranscribing(true);
    setTranscriptionError('');
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const res = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: selectedFile.type || 'image/jpeg',
            subject: notesSubject,
            fileName: selectedFile.name,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to transcribe handwritten notes.');
        }

        const validRes = validateChapterPackage(data.chapterPackage);
        if (validRes.valid && validRes.chapter) {
          setStagedChapter(validRes.chapter);
          setJsonInput(JSON.stringify(validRes.chapter, null, 2));
          setActiveTab('import');
          setSaveSuccessMsg('Handwritten notes transcribed successfully into structured chapter package!');
        } else {
          setValidationErrors(validRes.errors);
          setJsonInput(JSON.stringify(data.chapterPackage, null, 2));
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (err) {
      setTranscriptionError((err as Error).message);
    } finally {
      setIsTranscribing(false);
    }
  };

  // Diagram search
  const handleSearchDiagrams = async () => {
    if (!diagramQuery.trim()) return;
    setIsSearchingDiagrams(true);
    try {
      const res = await fetch(`/api/search-diagrams?q=${encodeURIComponent(diagramQuery.trim())}`);
      const data = await res.json();
      if (data.results) {
        setDiagramResults(data.results);
      }
    } catch (err) {
      console.error('Failed to search diagrams', err);
    } finally {
      setIsSearchingDiagrams(false);
    }
  };

  // Load sample JSON into textarea
  const handleLoadSample = (sampleType: 'bio' | 'chem') => {
    const sample = sampleType === 'bio' ? chapters.find((c) => c.subject === 'Biology') : chapters.find((c) => c.subject === 'Chemistry');
    if (sample) {
      setJsonInput(JSON.stringify(sample, null, 2));
      handleValidateJson();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Studio Header */}
      <div className="mb-6 pb-4 border-b border-stone-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-pulse" />
            <h1 className="text-xl font-bold font-serif text-stone-900">
              Publisher Workspace & Transcription Sync
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Import, audit handwriting uncertainties, assign scientific diagrams, and publish Class 10 Science chapters directly to the live textbook.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-stone-100 p-1 rounded-lg border border-stone-200 text-xs">
          <button
            onClick={() => setActiveTab('import')}
            className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'import' ? 'bg-white shadow-2xs text-stone-900' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-amber-700" /> Import & Transcribe
          </button>
          <button
            onClick={() => setActiveTab('untranscribed')}
            className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'untranscribed' ? 'bg-white shadow-2xs text-stone-900' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5 text-amber-700" /> Repo Vault ({rawNotes.length})
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'manage' ? 'bg-white shadow-2xs text-stone-900' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-700" /> Chapters ({chapters.length})
          </button>
          <button
            onClick={() => setActiveTab('diagrams')}
            className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'diagrams' ? 'bg-white shadow-2xs text-stone-900' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-amber-700" /> Diagrams
          </button>
        </div>
      </div>

      {/* Global Success / Notice Alert */}
      {saveSuccessMsg && (
        <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{saveSuccessMsg}</span>
          </div>
          <button
            onClick={() => setSaveSuccessMsg('')}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* TAB 1: Import & Review */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          {/* Dual Input: Paste JSON Package or Transcribe Notebook Image */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Direct JSON Package Importer */}
            <div className="lg:col-span-7 bg-white border border-stone-300 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-700" />
                    Option A: Import Chapter JSON Package
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Paste the structured JSON reconstructed in the development conversation.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    onClick={() => handleLoadSample('bio')}
                    className="text-stone-500 hover:text-stone-800 underline"
                  >
                    Load Bio
                  </button>
                  <span className="text-stone-300">•</span>
                  <button
                    onClick={() => handleLoadSample('chem')}
                    className="text-stone-500 hover:text-stone-800 underline"
                  >
                    Load Chem
                  </button>
                </div>
              </div>

              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows={12}
                placeholder="Paste validated ChapterPackage JSON here... { &quot;id&quot;: &quot;ch06-life-processes&quot;, &quot;title&quot;: &quot;Life Processes&quot;, ... }"
                className="w-full font-mono text-xs p-3 border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />

              <div className="flex items-center justify-between">
                <button
                  onClick={handleValidateJson}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-medium flex items-center gap-2"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                  Validate & Inspect Package
                </button>

                {stagedChapter && (
                  <button
                    onClick={() => onPreviewChapter(stagedChapter)}
                    className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-xs border border-stone-300 flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-stone-600" /> Preview in Reader
                  </button>
                )}
              </div>

              {/* Validation errors/warnings */}
              {validationErrors.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-red-800">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    Validation Errors:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {validationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {validationWarnings.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 space-y-1">
                  <div className="font-bold text-amber-800">Warnings:</div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {validationWarnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Column: In-App Direct Notebook OCR Transcriber */}
            <div className="lg:col-span-5 bg-stone-50 border border-stone-300 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <h2 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  Option B: In-App Notebook Photo Transcriber
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Upload a handwritten notebook page or photo. Calls server-side Gemini 2.5 Flash Vision to extract equations, headings, and uncertainty flags.
                </p>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Subject Classification:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Biology', 'Chemistry', 'Physics'] as const).map((sub) => (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => setNotesSubject(sub)}
                          className={`py-1.5 text-xs rounded border font-medium ${
                            notesSubject === sub
                              ? 'bg-amber-800 text-white border-amber-900'
                              : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Select Notebook Photo / Scan:
                    </label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-stone-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-stone-200 file:text-stone-800 hover:file:bg-stone-300 border border-stone-300 rounded bg-white p-1"
                    />
                  </div>

                  {transcriptionError && (
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-800 flex items-start gap-1.5">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{transcriptionError}</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                disabled={!selectedFile || isTranscribing}
                onClick={handleTranscribeFile}
                className="w-full py-2.5 bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white rounded text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs"
              >
                {isTranscribing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Transcribing with Gemini Vision...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Transcribe & Extract Chapter
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Staged Chapter Inspection Card */}
          {stagedChapter && (
            <div className="bg-white border-2 border-amber-600/40 rounded-xl p-6 shadow-xs space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-200">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-800 font-bold">
                    <span>Staged Chapter Ready for Publishing</span>
                    <span className="bg-amber-100 px-2 py-0.5 rounded text-[10px]">
                      {stagedChapter.subject}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold font-serif text-stone-900 mt-1">
                    Chapter {stagedChapter.chapterNumber}: {stagedChapter.title}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">{stagedChapter.subtitle}</p>
                </div>

                {/* Publishing Actions */}
                <div className="flex items-center gap-2">
                  <button
                    disabled={isSaving}
                    onClick={() => handlePublishStaged('draft')}
                    className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-xs font-medium border border-stone-300 flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5 text-stone-600" />
                    Save as Draft
                  </button>
                  <button
                    disabled={isSaving}
                    onClick={() => handlePublishStaged('published')}
                    className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded text-xs font-semibold flex items-center gap-2 shadow-2xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Publish to Live Website
                  </button>
                </div>
              </div>

              {/* Sections & Uncertainty Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                <div className="p-3 bg-stone-50 rounded border border-stone-200">
                  <span className="text-stone-500 block">Sections Extracted:</span>
                  <span className="text-lg font-bold text-stone-900 font-mono">
                    {stagedChapter.sections.length}
                  </span>
                </div>
                <div className="p-3 bg-stone-50 rounded border border-stone-200">
                  <span className="text-stone-500 block">Formulas & Equations:</span>
                  <span className="text-lg font-bold text-stone-900 font-mono">
                    {stagedChapter.sections.reduce((acc, s) => acc + (s.equations?.length || 0), 0)}
                  </span>
                </div>
                <div className="p-3 bg-stone-50 rounded border border-stone-200">
                  <span className="text-stone-500 block">Uncertainty Flags:</span>
                  <span className="text-lg font-bold text-amber-800 font-mono">
                    {stagedChapter.sourceInfo.flaggedUncertaintiesCount}
                  </span>
                </div>
              </div>

              {/* Embedded Uncertainty Inspector for Staged Chapter */}
              {stagedChapter.sourceInfo.flaggedUncertaintiesCount > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 font-mono">
                    Pending Handwriting Ambiguities for this Chapter:
                  </h4>
                  <UncertaintyInspector
                    uncertainties={stagedChapter.sections.flatMap((s) => s.uncertainties || [])}
                    onResolve={(flagId, resolvedText) => {
                      const updatedSections = stagedChapter.sections.map((sec) => ({
                        ...sec,
                        uncertainties: sec.uncertainties?.map((u) =>
                          u.id === flagId ? { ...u, resolved: true, resolvedText } : u
                        ),
                      }));
                      const updated = {
                        ...stagedChapter,
                        sections: updatedSections,
                        sourceInfo: {
                          ...stagedChapter.sourceInfo,
                          flaggedUncertaintiesCount: Math.max(
                            0,
                            stagedChapter.sourceInfo.flaggedUncertaintiesCount - 1
                          ),
                        },
                      };
                      setStagedChapter(updated);
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Repository Notes Vault (Untranscribed Source Notes) */}
      {activeTab === 'untranscribed' && (
        <div className="space-y-6">
          {/* Top Info Banner */}
          <div className="bg-stone-900 text-stone-100 rounded-xl p-5 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wide">
                <FolderArchive className="w-4 h-4" />
                <span>Repository File Storage (Zero External Database)</span>
              </div>
              <h2 className="text-lg font-serif font-bold text-white mt-1">
                Raw Untranscribed Notes Vault
              </h2>
              <p className="text-xs text-stone-300 mt-1 max-w-2xl">
                Every uploaded notebook photo, PDF scan, and transcription draft is saved directly into local repository files on disk (<code className="text-amber-300 font-mono">data/untranscribed/</code> and <code className="text-amber-300 font-mono">data/chapters.json</code>).
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-mono text-xs bg-stone-800 text-stone-300 px-3 py-1.5 rounded border border-stone-700">
                {rawNotes.length} Raw Note{rawNotes.length === 1 ? '' : 's'} in Repo
              </span>
            </div>
          </div>

          {/* Upload New Note directly into repository */}
          <div className="bg-white border border-stone-300 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-amber-700" />
              Save New Untranscribed Note into Repository
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-stone-700 font-bold mb-1">Target NCERT Chapter:</label>
                <select
                  value={rawNoteChapterNum}
                  onChange={(e) => setRawNoteChapterNum(Number(e.target.value))}
                  className="w-full p-2 border border-stone-300 rounded bg-white text-xs"
                >
                  {chapters.map((c) => (
                    <option key={c.chapterNumber} value={c.chapterNumber}>
                      Ch {c.chapterNumber}: {c.title} ({c.subject})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Subject:</label>
                <select
                  value={rawNoteSubject}
                  onChange={(e) => setRawNoteSubject(e.target.value as any)}
                  className="w-full p-2 border border-stone-300 rounded bg-white text-xs"
                >
                  <option value="Biology">Biology</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Physics">Physics</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Attach Notebook Scan / Photo:</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setRawNoteFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-stone-600 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-stone-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Or Paste Raw Note Text / Marginalia:
              </label>
              <textarea
                value={rawNoteText}
                onChange={(e) => setRawNoteText(e.target.value)}
                rows={3}
                placeholder="Optional: Type or paste quick notes, equations, or handwritten transcripts..."
                className="w-full p-2.5 text-xs border border-stone-300 rounded bg-stone-50 font-mono"
              />
            </div>

            <button
              disabled={isSaving || (!rawNoteFile && !rawNoteText.trim())}
              onClick={handleSaveRawNoteToRepo}
              className="px-4 py-2 bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white rounded text-xs font-semibold flex items-center gap-2 shadow-2xs"
            >
              <Save className="w-3.5 h-3.5" />
              Save Note Directly into Repository
            </button>
          </div>

          {/* List of Stored Untranscribed Notes */}
          <div className="bg-white border border-stone-300 rounded-xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
              <h3 className="font-bold text-sm text-stone-900">
                Untranscribed Notes Catalog (in Repo: data/untranscribed/)
              </h3>
              <button
                onClick={fetchRawNotes}
                className="text-stone-500 hover:text-stone-800 text-xs flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>

            {rawNotes.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-500 space-y-2">
                <FolderArchive className="w-8 h-8 text-stone-300 mx-auto" />
                <p>No untranscribed notes currently stored in the repository folder.</p>
                <p className="text-[11px] text-stone-400">
                  Upload photos above or provide handwritten notes in the dev conversation to save them here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-stone-200">
                {rawNotes.map((note) => (
                  <div key={note.id} className="p-4 flex flex-wrap items-center justify-between gap-4 hover:bg-stone-50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
                          {note.subject}
                        </span>
                        {note.chapterNumber && (
                          <span className="font-mono text-[11px] text-stone-600">
                            Chapter {note.chapterNumber}
                          </span>
                        )}
                        <span className="text-[10px] text-stone-400 font-mono">
                          {new Date(note.uploadedAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="font-bold text-xs text-stone-900 flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-stone-500" />
                        <span>{note.fileName}</span>
                      </div>
                      {note.fileRelPath && (
                        <div className="text-[11px] font-mono text-stone-400">
                          Path: {note.fileRelPath}
                        </div>
                      )}
                      {note.notesText && (
                        <p className="text-xs text-stone-600 bg-stone-100/70 p-2 rounded max-w-xl font-mono text-[11px] line-clamp-2">
                          {note.notesText}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {note.fileRelPath && (
                        <a
                          href={`/api/raw-notes/file/${note.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-xs border border-stone-300 flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> View Scan
                        </a>
                      )}
                      <button
                        onClick={async () => {
                          // Trigger transcription of this raw note
                          setIsTranscribing(true);
                          try {
                            const res = await fetch('/api/transcribe', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                notesText: note.notesText,
                                subject: note.subject,
                                fileName: note.fileName,
                              }),
                            });
                            const data = await res.json();
                            if (data.success && data.chapterPackage) {
                              setStagedChapter(data.chapterPackage);
                              setJsonInput(JSON.stringify(data.chapterPackage, null, 2));
                              setActiveTab('import');
                              setSaveSuccessMsg(`Note transcribed! Inspect and publish Chapter ${data.chapterPackage.chapterNumber}.`);
                            }
                          } finally {
                            setIsTranscribing(false);
                          }
                        }}
                        className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded text-xs font-medium flex items-center gap-1.5 shadow-2xs"
                      >
                        <Sparkles className="w-3 h-3 text-amber-200" /> Transcribe
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm('Delete this raw note from repo disk?')) {
                            await fetch(`/api/raw-notes/${note.id}`, { method: 'DELETE' });
                            await fetchRawNotes();
                          }
                        }}
                        className="p-1.5 text-stone-400 hover:text-red-600"
                        title="Delete from repo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Chapter Manager */}
      {activeTab === 'manage' && (
        <div className="bg-white border border-stone-300 rounded-xl overflow-hidden shadow-xs">
          <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <h2 className="font-bold text-sm text-stone-900">
              Published & Draft Chapters
            </h2>
            <button
              onClick={() => setActiveTab('import')}
              className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded text-xs font-medium flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Import New Chapter
            </button>
          </div>

          <div className="divide-y divide-stone-200">
            {chapters.map((ch) => (
              <div
                key={ch.id}
                className="p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-stone-50/60 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        ch.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {ch.status.toUpperCase()}
                    </span>
                    <span className="font-mono text-xs text-stone-500">{ch.id}</span>
                    <span className="font-medium text-xs text-stone-600">• {ch.subject}</span>
                  </div>
                  <h3 className="text-base font-bold font-serif text-stone-900">
                    Chapter {ch.chapterNumber}: {ch.title}
                  </h3>
                  <p className="text-xs text-stone-500 max-w-xl line-clamp-1">{ch.summary}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPreviewChapter(ch)}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-xs border border-stone-300 flex items-center gap-1"
                    title="Read Chapter"
                  >
                    <Eye className="w-3.5 h-3.5 text-stone-600" /> Read
                  </button>

                  {/* Toggle publish/unpublish */}
                  <button
                    onClick={async () => {
                      const newStatus = ch.status === 'published' ? 'draft' : 'published';
                      await onSaveChapter({ ...ch, status: newStatus });
                    }}
                    className={`px-3 py-1.5 rounded text-xs font-medium border ${
                      ch.status === 'published'
                        ? 'border-stone-300 text-stone-700 hover:bg-stone-100'
                        : 'bg-amber-800 text-white hover:bg-amber-900 border-amber-900'
                    }`}
                  >
                    {ch.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>

                  <button
                    onClick={() => {
                      setStagedChapter(ch);
                      setJsonInput(JSON.stringify(ch, null, 2));
                      setActiveTab('import');
                    }}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-xs border border-stone-300 flex items-center gap-1"
                    title="Edit JSON or uncertainties"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-stone-600" /> Edit
                  </button>

                  <button
                    onClick={async () => {
                      if (window.confirm(`Delete chapter "${ch.title}"?`)) {
                        await onDeleteChapter(ch.id);
                      }
                    }}
                    className="p-1.5 text-stone-400 hover:text-red-600 rounded"
                    title="Delete Chapter"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Diagram Search Hub */}
      {activeTab === 'diagrams' && (
        <div className="bg-white border border-stone-300 rounded-xl p-6 shadow-xs space-y-6">
          <div>
            <h2 className="font-bold text-sm text-stone-900 flex items-center gap-2">
              <Search className="w-4 h-4 text-amber-700" />
              Scientific Diagram & Schematic Discovery Hub
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Search open educational scientific diagrams (Wikimedia Commons & CBSE Textbook Schematics) with full licensing attribution and accessible captions.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={diagramQuery}
              onChange={(e) => setDiagramQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchDiagrams()}
              placeholder="e.g., 'Nephron Bowman capsule', 'Electrolysis of water', 'Human heart chambers', 'Reflex arc'..."
              className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button
              onClick={handleSearchDiagrams}
              disabled={isSearchingDiagrams || !diagramQuery.trim()}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              {isSearchingDiagrams ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              Search Diagrams
            </button>
          </div>

          {/* Quick preset links */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-stone-500 font-medium">Class 10 CBSE Key Diagrams:</span>
            {['Nephron', 'Human Heart', 'Electrolysis of Water', 'Stomatal Pore', 'Reflex Arc', 'Electric Circuit'].map((q) => (
              <button
                key={q}
                onClick={() => {
                  setDiagramQuery(q);
                  fetch(`/api/search-diagrams?q=${encodeURIComponent(q)}`)
                    .then((res) => res.json())
                    .then((data) => setDiagramResults(data.results || []));
                }}
                className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded border border-stone-300 text-[11px]"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Diagram Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-stone-200">
            {diagramResults.map((diag, idx) => (
              <div key={idx} className="border border-stone-300 rounded-lg overflow-hidden bg-stone-50 text-xs flex flex-col justify-between">
                <div>
                  <div className="h-44 bg-white flex items-center justify-center p-2 border-b border-stone-200 overflow-hidden">
                    <img
                      src={diag.url}
                      alt={diag.title}
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3 space-y-1">
                    <h4 className="font-bold text-stone-900 line-clamp-1">{diag.title}</h4>
                    <p className="text-stone-600 text-[11px] line-clamp-2">{diag.description}</p>
                    <div className="text-[10px] text-stone-500 font-mono pt-1">
                      <span>License: {diag.license}</span>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-white border-t border-stone-200 flex items-center justify-between">
                  <a
                    href={diag.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-800 hover:underline flex items-center gap-1 font-medium text-[11px]"
                  >
                    View Source <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(diag.url);
                      alert('Image URL copied! You can paste it into any diagram.sourceUrl field.');
                    }}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded border border-stone-300 text-[11px]"
                  >
                    Copy URL
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
