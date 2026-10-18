import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { validateChapterPackage, normalizeChapter } from './src/lib/validator.ts';
import { EXEMPLAR_CHAPTERS } from './src/data/exemplarChapters.ts';
import { getFullNCERTChapterList } from './src/data/ncertSyllabus.ts';
import type { ChapterPackage } from './src/lib/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Generous body limit for image uploads and base64 notebook photos
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Repository File Storage (No External Database)
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'chapters.json');
const UNTRANSCRIBED_DIR = path.join(DATA_DIR, 'untranscribed');
const UNTRANSCRIBED_INDEX_FILE = path.join(DATA_DIR, 'untranscribed.json');

// Ensure repository data folders exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UNTRANSCRIBED_DIR)) {
  fs.mkdirSync(UNTRANSCRIBED_DIR, { recursive: true });
}

export interface UntranscribedNoteRecord {
  id: string;
  fileName: string;
  fileRelPath: string;
  chapterNumber?: number;
  subject: string;
  uploadedAt: string;
  notesText?: string;
  status: 'raw_untranscribed' | 'transcribed';
  transcribedChapterId?: string;
}

function loadUntranscribedNotes(): UntranscribedNoteRecord[] {
  try {
    if (fs.existsSync(UNTRANSCRIBED_INDEX_FILE)) {
      const content = fs.readFileSync(UNTRANSCRIBED_INDEX_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading untranscribed.json:', err);
  }
  return [];
}

function saveUntranscribedNotes(notes: UntranscribedNoteRecord[]) {
  try {
    fs.writeFileSync(UNTRANSCRIBED_INDEX_FILE, JSON.stringify(notes, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving untranscribed.json:', err);
  }
}

function loadChapters(): ChapterPackage[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading chapters.json, falling back to NCERT curriculum', err);
  }
  // Initialize with full NCERT Class 10 Science syllabus (transcribed + placeholders) directly in repo file
  const initialChapters = getFullNCERTChapterList(EXEMPLAR_CHAPTERS);
  saveChapters(initialChapters);
  return initialChapters;
}

function saveChapters(chapters: ChapterPackage[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(chapters, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving chapters.json', err);
  }
}

// 1. API: List chapters
app.get('/api/chapters', (req: Request, res: Response) => {
  const chapters = loadChapters();
  const { subject, status } = req.query;

  let filtered = chapters;
  if (subject && subject !== 'All') {
    filtered = filtered.filter((c) => c.subject === subject);
  }
  if (status) {
    filtered = filtered.filter((c) => c.status === status);
  }

  res.json({ success: true, chapters: filtered });
});

// 2. API: Get single chapter
app.get('/api/chapters/:id', (req: Request, res: Response) => {
  const chapters = loadChapters();
  const chapter = chapters.find((c) => c.id === req.params.id);
  if (!chapter) {
    return res.status(404).json({ success: false, error: 'Chapter not found' });
  }
  res.json({ success: true, chapter });
});

// 3. API: Save / Import chapter
app.post('/api/chapters', (req: Request, res: Response) => {
  const validation = validateChapterPackage(req.body);
  if (!validation.valid || !validation.chapter) {
    return res.status(400).json({
      success: false,
      errors: validation.errors,
      warnings: validation.warnings,
    });
  }

  const incoming = validation.chapter;
  const chapters = loadChapters();
  const existingIndex = chapters.findIndex((c) => c.id === incoming.id);

  if (existingIndex >= 0) {
    // Update existing chapter
    chapters[existingIndex] = {
      ...incoming,
      version: (chapters[existingIndex].version || 1) + 1,
      lastUpdated: new Date().toISOString(),
    };
  } else {
    // Add new chapter
    chapters.push(incoming);
  }

  saveChapters(chapters);
  res.json({
    success: true,
    message: `Chapter "${incoming.title}" saved successfully.`,
    chapter: incoming,
    warnings: validation.warnings,
  });
});

// 4. API: Update chapter
app.put('/api/chapters/:id', (req: Request, res: Response) => {
  const chapters = loadChapters();
  const existingIndex = chapters.findIndex((c) => c.id === req.params.id);
  if (existingIndex === -1) {
    return res.status(404).json({ success: false, error: 'Chapter not found' });
  }

  const merged = {
    ...chapters[existingIndex],
    ...req.body,
    lastUpdated: new Date().toISOString(),
  };

  const validation = validateChapterPackage(merged);
  if (!validation.valid || !validation.chapter) {
    return res.status(400).json({
      success: false,
      errors: validation.errors,
      warnings: validation.warnings,
    });
  }

  chapters[existingIndex] = validation.chapter;
  saveChapters(chapters);
  res.json({ success: true, chapter: validation.chapter });
});

// 5. API: Delete chapter
app.delete('/api/chapters/:id', (req: Request, res: Response) => {
  const chapters = loadChapters();
  const filtered = chapters.filter((c) => c.id !== req.params.id);
  if (filtered.length === chapters.length) {
    return res.status(404).json({ success: false, error: 'Chapter not found' });
  }
  saveChapters(filtered);
  res.json({ success: true, message: 'Chapter deleted successfully' });
});

// 6. API: Gemini Multimodal Handwriting Transcription
app.post('/api/transcribe', async (req: Request, res: Response) => {
  const { imageBase64, mimeType, subject, notesText, fileName } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(400).json({
      success: false,
      error: 'GEMINI_API_KEY is not configured in the environment. Please configure it in AI Studio Secrets or .env.',
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
You are a senior CBSE Class 10 Science academic transcriber and educational publisher.
Your task is to transcribe handwritten Science notes faithfully and reconstruct them into a structured digital textbook chapter JSON.

CRITICAL RULES:
1. Faithfully preserve equations, chemical formulae (reactants, products, conditions, state symbols (s), (l), (g), (aq)), definitions, units, diagrams, labels, and student marginalia.
2. DO NOT silently guess ambiguous handwriting or replace smudged words with guessed vocabulary.
3. For any ambiguous pen strokes, create an uncertainty flag in "uncertainties" with originalText, suspectedText, sourcePage, and reason.
4. Extract headings, subheadings, paragraphs, comparison tables, and CBSE exam tips.
5. Identify any key diagrams needed (e.g., nephron, human heart, stomata, electrolysis apparatus, reflex arc) and specify diagramType, title, caption, and labels.

OUTPUT JSON FORMAT ONLY (No markdown formatting or backticks around it):
{
  "id": "ch-identifier",
  "subject": "${subject || 'Biology'}",
  "classGrade": "CBSE Class 10",
  "chapterNumber": 1,
  "title": "Chapter Title",
  "subtitle": "Chapter Subtitle",
  "status": "draft",
  "version": 1,
  "lastUpdated": "${new Date().toISOString()}",
  "estimatedReadTime": "15 min read",
  "sourceInfo": {
    "notebookTitle": "${fileName || 'Handwritten Notes'}",
    "notebookPages": [1],
    "author": "Student",
    "transcribedAt": "${new Date().toISOString()}",
    "transcriptionModel": "Gemini 2.5 Flash Vision",
    "confidenceScore": 96,
    "flaggedUncertaintiesCount": 0
  },
  "summary": "Brief 2-3 sentence overview of this chapter.",
  "tableOfContents": [
    { "sectionId": "sec-1", "sectionNumber": "1.1", "title": "Section Title" }
  ],
  "sections": [
    {
      "id": "sec-1",
      "sectionNumber": "1.1",
      "title": "Section Title",
      "summary": "Section summary",
      "sourceNotebookPages": [1],
      "paragraphs": ["Paragraph 1..."],
      "definitions": [
        {
          "id": "def-1",
          "term": "Term",
          "definition": "Definition",
          "keyPoints": ["Point 1"],
          "cbseFrequency": "High",
          "sourcePageRef": 1
        }
      ],
      "equations": [
        {
          "id": "eq-1",
          "reactants": "Reactants with state symbols",
          "products": "Products with state symbols",
          "arrowText": "Catalyst / condition",
          "reactionType": "Reaction Type",
          "balanced": true,
          "notes": "Mechanistic note"
        }
      ],
      "tables": [],
      "diagrams": [],
      "examTips": [],
      "uncertainties": [],
      "keyTakeaways": []
    }
  ],
  "revisionChecklist": ["Mastery checkpoint 1"]
}
`;

    const contents: Array<string | { inlineData: { mimeType: string; data: string } }> = [];

    if (imageBase64) {
      contents.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: imageBase64,
        },
      });
      contents.push('Please transcribe these handwritten CBSE Class 10 Science notes according to the structured format.');
    } else if (notesText) {
      contents.push(`Transcribe and reconstruct these notes into the chapter schema:\n${notesText}`);
    } else {
      return res.status(400).json({ success: false, error: 'Provide either imageBase64 or notesText.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents as unknown as string[],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{}';
    const parsed = JSON.parse(rawText);
    const normalized = normalizeChapter(parsed);

    res.json({
      success: true,
      chapterPackage: normalized,
    });
  } catch (err) {
    console.error('Transcription error:', err);
    res.status(500).json({
      success: false,
      error: `Transcription failed: ${(err as Error).message}`,
    });
  }
});

// 7. API: Educational Diagram Search (Wikimedia Commons)
app.get('/api/search-diagrams', async (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  if (!query) {
    return res.json({ success: true, results: [] });
  }

  try {
    const wikiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      query + ' diagram schema svg'
    )}&gsrnamespace=6&prop=imageinfo&iiprop=url|size|mime|extmetadata&format=json&origin=*`;

    const fetchRes = await fetch(wikiUrl);
    const data = await fetchRes.json();

    const results: Array<{
      title: string;
      url: string;
      description: string;
      attribution: string;
      license: string;
    }> = [];

    if (data.query && data.query.pages) {
      const pages = Object.values(data.query.pages) as Array<Record<string, unknown>>;
      for (const page of pages.slice(0, 9)) {
        const title = ((page.title as string) || '').replace(/^File:/, '');
        const imageInfo = (page.imageinfo as Array<Record<string, unknown>>)?.[0];
        if (imageInfo && imageInfo.url) {
          const extmeta = (imageInfo.extmetadata as Record<string, { value: string }>) || {};
          const description = (extmeta.ImageDescription?.value || title)
            .replace(/<[^>]*>?/gm, '')
            .slice(0, 150);
          const artist = (extmeta.Artist?.value || 'Wikimedia Commons Contributor').replace(/<[^>]*>?/gm, '');
          const license = extmeta.LicenseShortName?.value || 'Creative Commons';

          results.push({
            title,
            url: imageInfo.url as string,
            description,
            attribution: artist,
            license,
          });
        }
      }
    }

    res.json({ success: true, results });
  } catch (err) {
    console.error('Error fetching diagrams:', err);
    res.json({
      success: true,
      results: [
        {
          title: 'Nephron Structural Schematic',
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Kidney_Nephron.png/640px-Kidney_Nephron.png',
          description: 'Structural diagram of a single nephron with Bowman capsule and tubule.',
          attribution: 'Wikimedia Commons / CC-BY-SA',
          license: 'CC BY-SA 3.0',
        },
      ],
    });
  }
});

// 8. API: Untranscribed Notes Vault (Stored directly in repo files)
app.get('/api/raw-notes', (req: Request, res: Response) => {
  const notes = loadUntranscribedNotes();
  res.json({ success: true, notes });
});

app.post('/api/raw-notes', (req: Request, res: Response) => {
  const { fileName, fileBase64, notesText, subject, chapterNumber } = req.body;
  if (!fileName && !notesText) {
    return res.status(400).json({ success: false, error: 'Either fileBase64 or notesText is required.' });
  }

  const id = `raw-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  let fileRelPath = '';

  if (fileBase64 && fileName) {
    // Sanitize filename and save to data/untranscribed/ in repo
    const safeName = `${id}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const targetPath = path.join(UNTRANSCRIBED_DIR, safeName);
    const buffer = Buffer.from(fileBase64, 'base64');
    fs.writeFileSync(targetPath, buffer);
    fileRelPath = path.relative(__dirname, targetPath);
  }

  const newRecord: UntranscribedNoteRecord = {
    id,
    fileName: fileName || 'Raw Handwritten Note',
    fileRelPath,
    chapterNumber: chapterNumber ? Number(chapterNumber) : undefined,
    subject: subject || 'General Science',
    uploadedAt: new Date().toISOString(),
    notesText: notesText || undefined,
    status: 'raw_untranscribed',
  };

  const currentNotes = loadUntranscribedNotes();
  currentNotes.unshift(newRecord);
  saveUntranscribedNotes(currentNotes);

  res.json({
    success: true,
    message: 'Raw note saved directly into repository.',
    note: newRecord,
  });
});

app.get('/api/raw-notes/file/:id', (req: Request, res: Response) => {
  const notes = loadUntranscribedNotes();
  const note = notes.find((n) => n.id === req.params.id);
  if (!note || !note.fileRelPath) {
    return res.status(404).send('Raw file not found');
  }
  const fullPath = path.resolve(__dirname, note.fileRelPath);
  if (!fs.existsSync(fullPath)) {
    return res.status(404).send('File missing on disk');
  }
  res.sendFile(fullPath);
});

app.delete('/api/raw-notes/:id', (req: Request, res: Response) => {
  const notes = loadUntranscribedNotes();
  const note = notes.find((n) => n.id === req.params.id);
  if (note && note.fileRelPath) {
    const fullPath = path.resolve(__dirname, note.fileRelPath);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (e) {
        console.error('Failed to unlink file:', e);
      }
    }
  }
  const filtered = notes.filter((n) => n.id !== req.params.id);
  saveUntranscribedNotes(filtered);
  res.json({ success: true, message: 'Raw note removed from repository.' });
});

// 9. API: Export sample chapter
app.get('/api/export-sample', (req: Request, res: Response) => {
  res.json({ success: true, sample: EXEMPLAR_CHAPTERS[0] });
});

// Vite middleware or Static files serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
