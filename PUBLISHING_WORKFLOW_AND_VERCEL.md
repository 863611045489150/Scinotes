# AI Science Notes: Development-Window Transcription & Live Website Sync

## 1. The Core Workflow (How We Work Together)

Whenever you attach photos or PDFs of your handwritten CBSE Class 10 Science notes to this Google AI Studio development conversation:

1. **Multimodal Inspection**: I inspect each attached page in order using Gemini vision.
2. **Faithful Transcription**:
   - Transcribe all legible content accurately.
   - Separate student notes from any supplementary context.
   - Preserve chemical equations with state symbols `(s), (l), (g), (aq)` and reaction arrows with catalysts.
   - Flag any ambiguous handwriting as an **Uncertainty Flag** citing the original notebook page (e.g., `[Notebook p. 4: Ambiguous handwriting "afferent" vs "efferent"]`).
3. **Structured Chapter Package Generation**:
   - I return a validated `ChapterPackage` JSON.
4. **Live Sync to Website (No Rebuild Required)**:
   - Go to your running app's **Publisher Studio** (top nav).
   - In **Option A**, paste the generated JSON package and click **Validate & Inspect Package**.
   - Review the staged chapter, inspect any uncertainty flags, and click **Publish to Live Website**.
   - Your chapter is instantly active and browsable on the digital textbook!

---

## 2. Vercel Deployment Guide

### A. Deploy via GitHub + Vercel
1. Push this repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. **Build Settings**:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. **Environment Variables**:
   - `GEMINI_API_KEY`: Your Gemini API key from Google AI Studio.
   - `APP_URL`: Your Vercel production URL (e.g. `https://my-science-notes.vercel.app`).
   - (Optional) `SUPABASE_URL` and `SUPABASE_ANON_KEY`: If using Supabase for distributed cloud persistence across multiple clients.

---

## 3. CBSE Class 10 Science Standard Data Schema

Each chapter follows the validated schema:
- `id`: Unique identifier (e.g., `ch06-life-processes`, `ch01-chemical-reactions`)
- `subject`: `Biology` | `Chemistry` | `Physics`
- `classGrade`: `CBSE Class 10`
- `chapterNumber`: Integer
- `title` & `subtitle`: Chapter titles
- `status`: `draft` | `published`
- `sourceInfo`: Notebook title, page array, confidence score, flagged uncertainties count
- `tableOfContents`: Outline of sections
- `sections`:
  - `sectionNumber`: e.g. `6.1`
  - `title`: e.g. `What are Life Processes & Nutrition`
  - `sourceNotebookPages`: `[1, 2]`
  - `paragraphs`: Full text
  - `definitions`: Key scientific definitions with CBSE exam frequency flags
  - `equations`: Balanced chemical equations with conditions and mechanistic notes
  - `tables`: Comparison matrices (e.g., Aerobic vs Anaerobic)
  - `diagrams`: Visual explanations with interactive labels and Wikimedia/CBSE schematics
  - `examTips`: Past CBSE board exam questions and marking criteria
  - `uncertainties`: Auditable notes on ambiguous handwriting
  - `keyTakeaways`: Quick high-yield recall points
- `revisionChecklist`: Self-test memory recall checkpoints
