import test from 'node:test';
import assert from 'node:assert/strict';
import { validateChapterPackage, normalizeChapter } from './validator.ts';
import { searchChapters } from './searchIndex.ts';
import type { ChapterPackage } from './types.ts';

test('validateChapterPackage flags missing required fields', () => {
  const invalidEmpty = {};
  const result = validateChapterPackage(invalidEmpty);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('id')));
  assert.ok(result.errors.some((e) => e.includes('title')));
  assert.ok(result.errors.some((e) => e.includes('subject')));
});

test('validateChapterPackage validates valid chapter package', () => {
  const validData = {
    id: 'ch06-life-processes',
    title: 'Life Processes',
    subject: 'Biology',
    chapterNumber: 6,
    sections: [
      {
        id: 'sec-6-1',
        title: 'What are Life Processes?',
        paragraphs: ['Living organisms perform essential maintenance functions even when at rest.'],
      },
    ],
  };

  const result = validateChapterPackage(validData);
  assert.equal(result.valid, true);
  assert.equal(result.errors.length, 0);
  assert.ok(result.chapter);
  assert.equal(result.chapter.id, 'ch06-life-processes');
  assert.equal(result.chapter.subject, 'Biology');
  assert.equal(result.chapter.sections.length, 1);
});

test('normalizeChapter fills defaults and computes uncertainty counts', () => {
  const partial = {
    id: 'test-ch',
    title: 'Test',
    subject: 'Chemistry' as const,
    sections: [
      {
        id: 's1',
        sectionNumber: '1.1',
        title: 'Intro',
        paragraphs: ['Sample text'],
        uncertainties: [
          {
            id: 'u1',
            originalText: 'efferent',
            suspectedText: 'afferent',
            sourcePage: 3,
            reason: 'Handwriting smudge',
            resolved: false,
          },
          {
            id: 'u2',
            originalText: 'glom',
            suspectedText: 'glomerulus',
            sourcePage: 4,
            reason: 'Clipped handwriting',
            resolved: true,
          },
        ],
      },
    ],
  };

  const normalized = normalizeChapter(partial);
  assert.equal(normalized.classGrade, 'CBSE Class 10');
  // Flagged unresolved uncertainties count should be 1
  assert.equal(normalized.sourceInfo.flaggedUncertaintiesCount, 1);
  assert.equal(normalized.tableOfContents.length, 1);
  assert.equal(normalized.tableOfContents[0].title, 'Intro');
});

test('searchChapters finds definitions, equations, and paragraphs', () => {
  const mockChapters: ChapterPackage[] = [
    {
      id: 'ch06',
      subject: 'Biology',
      classGrade: 'CBSE Class 10',
      chapterNumber: 6,
      title: 'Life Processes',
      subtitle: 'Notes',
      status: 'published',
      version: 1,
      lastUpdated: new Date().toISOString(),
      estimatedReadTime: '15 min',
      sourceInfo: {
        notebookTitle: 'Bio Notes',
        notebookPages: [1, 2],
        author: 'Student',
        transcribedAt: new Date().toISOString(),
        transcriptionModel: 'Gemini',
        confidenceScore: 98,
        flaggedUncertaintiesCount: 0,
      },
      summary: 'Comprehensive notes covering nutrition, respiration, circulation, and excretion.',
      tableOfContents: [],
      revisionChecklist: [],
      sections: [
        {
          id: 's1',
          sectionNumber: '6.4',
          title: 'Excretion in Humans',
          paragraphs: ['Each kidney contains approximately one million filtration units called nephrons.'],
          definitions: [
            {
              id: 'd1',
              term: 'Nephron',
              definition: 'The structural and functional unit of the kidney responsible for filtering blood.',
              cbseFrequency: 'Very High',
            },
          ],
          equations: [],
        },
        {
          id: 's2',
          sectionNumber: '6.2',
          title: 'Respiration',
          paragraphs: ['Glucose is broken down to produce pyruvate in cytoplasm.'],
          equations: [
            {
              id: 'eq1',
              reactants: 'C6H12O6 + 6O2',
              products: '6CO2 + 6H2O + 38 ATP',
              reactionType: 'Aerobic Respiration',
              balanced: true,
            },
          ],
        },
      ],
    },
  ];

  const searchResults1 = searchChapters(mockChapters, 'nephron');
  assert.ok(searchResults1.length >= 1);
  assert.ok(searchResults1.some((r) => r.term === 'Nephron'));

  const searchResults2 = searchChapters(mockChapters, 'pyruvate');
  assert.ok(searchResults2.length >= 1);
  assert.equal(searchResults2[0].matchType, 'paragraph');

  const searchResults3 = searchChapters(mockChapters, 'ATP');
  assert.ok(searchResults3.some((r) => r.matchType === 'equation'));

  const filterMismatch = searchChapters(mockChapters, 'nephron', 'Physics');
  assert.equal(filterMismatch.length, 0);
});
