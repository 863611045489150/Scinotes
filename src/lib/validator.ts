import type { ChapterPackage, ImportValidationResult, SubjectType } from './types.ts';

const VALID_SUBJECTS: SubjectType[] = ['Biology', 'Chemistry', 'Physics'];

export function validateChapterPackage(data: unknown): ImportValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      errors: ['Input data must be a valid JSON object.'],
      warnings: [],
    };
  }

  const obj = data as Record<string, unknown>;

  // Required field checks
  if (!obj.id || typeof obj.id !== 'string' || obj.id.trim() === '') {
    errors.push('Field "id" is required and must be a non-empty string (e.g. "ch06-life-processes").');
  } else if (!/^[a-z0-9-_]+$/i.test(obj.id)) {
    warnings.push('Chapter "id" should ideally be alphanumeric with hyphens (e.g. "ch06-life-processes").');
  }

  if (!obj.title || typeof obj.title !== 'string' || obj.title.trim() === '') {
    errors.push('Field "title" is required and must be a non-empty string.');
  }

  if (!obj.subject || typeof obj.subject !== 'string' || !VALID_SUBJECTS.includes(obj.subject as SubjectType)) {
    errors.push(`Field "subject" must be one of: ${VALID_SUBJECTS.join(', ')}.`);
  }

  if (typeof obj.chapterNumber !== 'number' || isNaN(obj.chapterNumber) || obj.chapterNumber < 1) {
    errors.push('Field "chapterNumber" must be a positive integer.');
  }

  if (!Array.isArray(obj.sections)) {
    errors.push('Field "sections" must be an array of chapter sections.');
  } else if (obj.sections.length === 0) {
    warnings.push('Chapter has no sections defined. At least one section is recommended.');
  } else {
    obj.sections.forEach((sec, idx) => {
      if (!sec || typeof sec !== 'object') {
        errors.push(`Section at index ${idx} must be an object.`);
        return;
      }
      const s = sec as Record<string, unknown>;
      if (!s.title || typeof s.title !== 'string') {
        errors.push(`Section ${idx + 1} is missing a valid "title".`);
      }
      if (!s.id || typeof s.id !== 'string') {
        errors.push(`Section "${s.title || idx + 1}" is missing a valid "id".`);
      }
      if (!Array.isArray(s.paragraphs)) {
        errors.push(`Section "${s.title || idx + 1}" must have an array of "paragraphs".`);
      }
    });
  }

  const valid = errors.length === 0;

  let normalizedChapter: ChapterPackage | undefined;
  if (valid) {
    normalizedChapter = normalizeChapter(obj as Partial<ChapterPackage>);
  }

  return {
    valid,
    errors,
    warnings,
    chapter: normalizedChapter,
  };
}

export function normalizeChapter(data: Partial<ChapterPackage>): ChapterPackage {
  const sections = Array.isArray(data.sections)
    ? data.sections.map((sec, sIdx) => ({
        id: sec.id || `sec-${sIdx + 1}`,
        sectionNumber: sec.sectionNumber || `${data.chapterNumber || 1}.${sIdx + 1}`,
        title: sec.title || `Section ${sIdx + 1}`,
        summary: sec.summary || '',
        sourceNotebookPages: Array.isArray(sec.sourceNotebookPages) ? sec.sourceNotebookPages : [],
        paragraphs: Array.isArray(sec.paragraphs) ? sec.paragraphs : [],
        definitions: Array.isArray(sec.definitions)
          ? sec.definitions.map((d, dIdx) => ({
              id: d.id || `def-${sIdx + 1}-${dIdx + 1}`,
              term: d.term || '',
              definition: d.definition || '',
              keyPoints: Array.isArray(d.keyPoints) ? d.keyPoints : [],
              cbseFrequency: d.cbseFrequency || 'High',
              sourcePageRef: d.sourcePageRef,
            }))
          : [],
        equations: Array.isArray(sec.equations)
          ? sec.equations.map((eq, eIdx) => ({
              id: eq.id || `eq-${sIdx + 1}-${eIdx + 1}`,
              reactants: eq.reactants || '',
              products: eq.products || '',
              arrowText: eq.arrowText || '',
              reactionType: eq.reactionType || 'Chemical Reaction',
              balanced: eq.balanced ?? true,
              notes: eq.notes || '',
            }))
          : [],
        tables: Array.isArray(sec.tables)
          ? sec.tables.map((tbl, tIdx) => ({
              id: tbl.id || `tbl-${sIdx + 1}-${tIdx + 1}`,
              title: tbl.title || 'Comparison Table',
              columns: Array.isArray(tbl.columns) ? tbl.columns : [],
              rows: Array.isArray(tbl.rows) ? tbl.rows : [],
            }))
          : [],
        diagrams: Array.isArray(sec.diagrams)
          ? sec.diagrams.map((diag, dgIdx) => ({
              id: diag.id || `diag-${sIdx + 1}-${dgIdx + 1}`,
              title: diag.title || 'Scientific Diagram',
              caption: diag.caption || '',
              diagramType: diag.diagramType || 'schematic',
              sourcePageRef: diag.sourcePageRef,
              isOriginalNoteDrawing: diag.isOriginalNoteDrawing ?? false,
              searchQuery: diag.searchQuery || diag.title,
              sourceUrl: diag.sourceUrl || '',
              attribution: diag.attribution || '',
              license: diag.license || 'Public Domain / Creative Commons',
              labels: Array.isArray(diag.labels) ? diag.labels : [],
              svgPresetKey: diag.svgPresetKey || '',
            }))
          : [],
        examTips: Array.isArray(sec.examTips)
          ? sec.examTips.map((tip, tipIdx) => ({
              id: tip.id || `tip-${sIdx + 1}-${tipIdx + 1}`,
              question: tip.question || '',
              answerOutline: tip.answerOutline || '',
              yearAsked: tip.yearAsked || 'CBSE Exam Focus',
              commonPitfall: tip.commonPitfall || '',
            }))
          : [],
        uncertainties: Array.isArray(sec.uncertainties)
          ? sec.uncertainties.map((u, uIdx) => ({
              id: u.id || `unc-${sIdx + 1}-${uIdx + 1}`,
              originalText: u.originalText || '',
              suspectedText: u.suspectedText || '',
              sourcePage: u.sourcePage || 1,
              reason: u.reason || 'Uncertain transcription',
              resolved: u.resolved ?? false,
              resolvedText: u.resolvedText || '',
              contextSnippet: u.contextSnippet || '',
            }))
          : [],
        keyTakeaways: Array.isArray(sec.keyTakeaways) ? sec.keyTakeaways : [],
      }))
    : [];

  const tableOfContents = sections.map((s) => ({
    sectionId: s.id,
    sectionNumber: s.sectionNumber,
    title: s.title,
  }));

  const allUncertaintiesCount = sections.reduce(
    (acc, sec) => acc + (sec.uncertainties ? sec.uncertainties.filter((u) => !u.resolved).length : 0),
    0
  );

  return {
    id: data.id || `ch-${Date.now()}`,
    subject: data.subject || 'Biology',
    classGrade: data.classGrade || 'CBSE Class 10',
    chapterNumber: data.chapterNumber || 1,
    title: data.title || 'Untitled Chapter',
    subtitle: data.subtitle || 'Transcribed Handwritten Notes',
    status: data.status || 'draft',
    version: data.version || 1,
    lastUpdated: data.lastUpdated || new Date().toISOString(),
    estimatedReadTime: data.estimatedReadTime || '15 min read',
    sourceInfo: {
      notebookTitle: data.sourceInfo?.notebookTitle || 'Class 10 Science Notebook',
      notebookPages: Array.isArray(data.sourceInfo?.notebookPages) ? data.sourceInfo.notebookPages : [],
      author: data.sourceInfo?.author || 'Student',
      transcribedAt: data.sourceInfo?.transcribedAt || new Date().toISOString(),
      transcriptionModel: data.sourceInfo?.transcriptionModel || 'Gemini Multimodal (gemini-2.5-flash)',
      confidenceScore: typeof data.sourceInfo?.confidenceScore === 'number' ? data.sourceInfo.confidenceScore : 95,
      flaggedUncertaintiesCount: allUncertaintiesCount,
    },
    summary: data.summary || '',
    tableOfContents: data.tableOfContents && data.tableOfContents.length > 0 ? data.tableOfContents : tableOfContents,
    sections,
    revisionChecklist: Array.isArray(data.revisionChecklist) ? data.revisionChecklist : [],
  };
}
