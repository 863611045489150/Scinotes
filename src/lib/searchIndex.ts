import type { ChapterPackage } from './types.ts';

export interface SearchMatch {
  chapterId: string;
  chapterTitle: string;
  subject: string;
  chapterNumber: number;
  sectionId?: string;
  sectionTitle?: string;
  matchType: 'title' | 'definition' | 'paragraph' | 'equation' | 'examTip';
  matchSnippet: string;
  term?: string;
}

export function searchChapters(
  chapters: ChapterPackage[],
  query: string,
  subjectFilter?: string
): SearchMatch[] {
  const cleanQuery = (query || '').trim().toLowerCase();
  if (!cleanQuery) return [];

  const results: SearchMatch[] = [];

  for (const ch of chapters) {
    if (subjectFilter && subjectFilter !== 'All' && ch.subject !== subjectFilter) {
      continue;
    }

    // Match in chapter title or summary
    if (ch.title.toLowerCase().includes(cleanQuery) || ch.summary.toLowerCase().includes(cleanQuery)) {
      results.push({
        chapterId: ch.id,
        chapterTitle: ch.title,
        subject: ch.subject,
        chapterNumber: ch.chapterNumber,
        matchType: 'title',
        matchSnippet: ch.summary.slice(0, 140) + '...',
      });
    }

    // Match in sections
    for (const sec of ch.sections) {
      // Paragraph matches
      for (const p of sec.paragraphs) {
        const lowerP = p.toLowerCase();
        const idx = lowerP.indexOf(cleanQuery);
        if (idx !== -1) {
          const start = Math.max(0, idx - 40);
          const end = Math.min(p.length, idx + cleanQuery.length + 60);
          results.push({
            chapterId: ch.id,
            chapterTitle: ch.title,
            subject: ch.subject,
            chapterNumber: ch.chapterNumber,
            sectionId: sec.id,
            sectionTitle: `${sec.sectionNumber} ${sec.title}`,
            matchType: 'paragraph',
            matchSnippet: (start > 0 ? '...' : '') + p.slice(start, end) + (end < p.length ? '...' : ''),
          });
          break; // One paragraph match per section is sufficient to prevent flooding
        }
      }

      // Definition matches
      if (sec.definitions) {
        for (const def of sec.definitions) {
          if (def.term.toLowerCase().includes(cleanQuery) || def.definition.toLowerCase().includes(cleanQuery)) {
            results.push({
              chapterId: ch.id,
              chapterTitle: ch.title,
              subject: ch.subject,
              chapterNumber: ch.chapterNumber,
              sectionId: sec.id,
              sectionTitle: `${sec.sectionNumber} ${sec.title}`,
              matchType: 'definition',
              matchSnippet: `${def.term}: ${def.definition}`,
              term: def.term,
            });
          }
        }
      }

      // Equations
      if (sec.equations) {
        for (const eq of sec.equations) {
          if (
            eq.reactants.toLowerCase().includes(cleanQuery) ||
            eq.products.toLowerCase().includes(cleanQuery) ||
            (eq.reactionType && eq.reactionType.toLowerCase().includes(cleanQuery))
          ) {
            results.push({
              chapterId: ch.id,
              chapterTitle: ch.title,
              subject: ch.subject,
              chapterNumber: ch.chapterNumber,
              sectionId: sec.id,
              sectionTitle: `${sec.sectionNumber} ${sec.title}`,
              matchType: 'equation',
              matchSnippet: `${eq.reactants} ⟶ ${eq.products} (${eq.reactionType || 'Reaction'})`,
            });
          }
        }
      }

      // Exam tips
      if (sec.examTips) {
        for (const tip of sec.examTips) {
          if (tip.question.toLowerCase().includes(cleanQuery) || tip.answerOutline.toLowerCase().includes(cleanQuery)) {
            results.push({
              chapterId: ch.id,
              chapterTitle: ch.title,
              subject: ch.subject,
              chapterNumber: ch.chapterNumber,
              sectionId: sec.id,
              sectionTitle: `${sec.sectionNumber} ${sec.title}`,
              matchType: 'examTip',
              matchSnippet: `Exam Focus: ${tip.question}`,
            });
          }
        }
      }
    }
  }

  return results.slice(0, 30);
}
