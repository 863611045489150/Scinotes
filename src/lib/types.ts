export const SUBJECT_LIST = ['Biology', 'Chemistry', 'Physics'] as const;
export type SubjectType = typeof SUBJECT_LIST[number];

export const STATUS_LIST = ['draft', 'published', 'archived'] as const;
export type PublicationStatus = typeof STATUS_LIST[number];

export interface UncertaintyFlag {
  id: string;
  originalText: string;
  suspectedText: string;
  sourcePage: number;
  reason: string; // e.g., "Ambiguous handwriting: 'afferent' vs 'efferent'", "Unclear subscript in formula"
  resolved: boolean;
  resolvedText?: string;
  contextSnippet?: string;
}

export interface DiagramReference {
  id: string;
  title: string;
  caption: string;
  diagramType: 'schematic' | 'illustration' | 'apparatus' | 'flowchart' | 'anatomical' | 'ray_diagram';
  sourcePageRef?: number;
  isOriginalNoteDrawing?: boolean;
  searchQuery?: string;
  sourceUrl?: string;
  attribution?: string;
  license?: string;
  labels?: Array<{ name: string; description?: string; x?: number; y?: number }>;
  svgPresetKey?: string; // Pre-built vector SVG visualizer for key Class 10 diagrams (nephron, heart, electrolysis, reflex_arc, stomata, etc.)
}

export interface ChemicalEquation {
  id: string;
  reactants: string; // e.g. "6CO2(aq) + 6H2O(l)"
  products: string; // e.g. "C6H12O6(aq) + 6O2(g)"
  arrowText?: string; // e.g. "Sunlight / Chlorophyll" or "Δ Heat" or "Electric Current"
  reactionType?: string; // e.g. "Photosynthesis", "Redox", "Exothermic", "Double Displacement"
  balanced: boolean;
  notes?: string;
}

export interface DefinitionItem {
  id: string;
  term: string;
  definition: string;
  keyPoints?: string[];
  cbseFrequency?: 'Very High' | 'High' | 'Medium';
  sourcePageRef?: number;
}

export interface ComparisonTable {
  id: string;
  title: string;
  columns: string[];
  rows: string[][];
}

export interface ExamTip {
  id: string;
  question: string;
  answerOutline: string;
  yearAsked?: string; // e.g. "CBSE 2023, 2020", "Exemplar"
  commonPitfall?: string;
}

export interface ChapterSection {
  id: string;
  sectionNumber: string; // e.g. "6.1", "6.2.3"
  title: string;
  summary?: string;
  sourceNotebookPages?: number[];
  paragraphs: string[];
  definitions?: DefinitionItem[];
  equations?: ChemicalEquation[];
  tables?: ComparisonTable[];
  diagrams?: DiagramReference[];
  examTips?: ExamTip[];
  uncertainties?: UncertaintyFlag[];
  keyTakeaways?: string[];
}

export interface ChapterPackage {
  id: string; // e.g. "ch06-life-processes"
  subject: SubjectType;
  classGrade: string; // "CBSE Class 10"
  chapterNumber: number;
  title: string;
  subtitle: string;
  status: PublicationStatus;
  version: number;
  lastUpdated: string;
  estimatedReadTime: string; // e.g. "18 min read"
  sourceInfo: {
    notebookTitle: string;
    notebookPages: number[];
    author: string;
    transcribedAt: string;
    transcriptionModel: string;
    confidenceScore: number; // 0-100%
    flaggedUncertaintiesCount: number;
  };
  summary: string;
  tableOfContents: Array<{ sectionId: string; sectionNumber: string; title: string }>;
  sections: ChapterSection[];
  revisionChecklist: string[];
}

export interface ImportValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  chapter?: ChapterPackage;
}
