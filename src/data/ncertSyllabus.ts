import type { ChapterPackage, SubjectType } from '../lib/types.ts';
import { EXEMPLAR_CHAPTERS } from './exemplarChapters.ts';

export interface NcertChapterOverview {
  chapterNumber: number;
  title: string;
  subtitle: string;
  subject: SubjectType;
  syllabusTheme: string;
  keyTopics: string[];
  recommendedDiagrams: string[];
}

export const ALL_NCERT_CLASS_10_CHAPTERS: NcertChapterOverview[] = [
  {
    chapterNumber: 1,
    title: 'Chemical Reactions and Equations',
    subtitle: 'Balancing, Types of Reactions, Redox & Corrosion',
    subject: 'Chemistry',
    syllabusTheme: 'Chemical Substances - Nature and Behaviour',
    keyTopics: ['Balancing chemical equations', 'Combination & Decomposition', 'Displacement & Double displacement', 'Redox, Corrosion & Rancidity'],
    recommendedDiagrams: ['Electrolysis of Water Apparatus', 'Burning of Magnesium Ribbon', 'Thermal Decomposition of Lead Nitrate'],
  },
  {
    chapterNumber: 2,
    title: 'Acids, Bases and Salts',
    subtitle: 'pH Scale, Indicators & Industrial Salts',
    subject: 'Chemistry',
    syllabusTheme: 'Chemical Substances - Nature and Behaviour',
    keyTopics: ['Chemical properties of acids and bases', 'Reaction with metals and carbonates', 'pH scale & everyday importance', 'Chlor-alkali process, Bleaching Powder, Baking Soda, Plaster of Paris'],
    recommendedDiagrams: ['Reaction of Zinc with Dilute H2SO4', 'Electrolysis of Brine (Chlor-alkali cell)', 'pH indicator color chart'],
  },
  {
    chapterNumber: 3,
    title: 'Metals and Non-metals',
    subtitle: 'Reactivity Series, Ionic Bonds & Metallurgy',
    subject: 'Chemistry',
    syllabusTheme: 'Chemical Substances - Nature and Behaviour',
    keyTopics: ['Physical & chemical properties', 'Reactivity series of metals', 'Ionic bond formation (NaCl, MgCl2)', 'Extraction of metals (Roasting, Calcination, Electrolytic refining)'],
    recommendedDiagrams: ['Electrolytic Refining of Copper', 'Action of Steam on Metal', 'Rusting of Iron test-tube experiment'],
  },
  {
    chapterNumber: 4,
    title: 'Carbon and its Compounds',
    subtitle: 'Covalent Bonding, Versatile Carbon & Hydrocarbons',
    subject: 'Chemistry',
    syllabusTheme: 'Chemical Substances - Nature and Behaviour',
    keyTopics: ['Covalent bonding & allotropes of carbon', 'Homologous series & functional groups', 'Combustion, Oxidation, Addition, Substitution', 'Ethanol and Ethanoic Acid properties, Soaps and Detergents micelle action'],
    recommendedDiagrams: ['Formation of Soap Micelle', 'Electron Dot Structures (CH4, C2H4, CO2)', 'Esterification Reaction Apparatus'],
  },
  {
    chapterNumber: 5,
    title: 'Life Processes',
    subtitle: 'Nutrition, Respiration, Transportation & Excretion',
    subject: 'Biology',
    syllabusTheme: 'World of Living',
    keyTopics: ['Autotrophic & Heterotrophic nutrition', 'Aerobic & Anaerobic respiration', 'Human Circulatory System (Double circulation)', 'Human Excretory System & Nephron filtration'],
    recommendedDiagrams: ['Nephron Structure', 'Human Heart Schematic Section', 'Stomatal Apparatus (Open/Closed)', 'Human Alimentary Canal'],
  },
  {
    chapterNumber: 6,
    title: 'Control and Coordination',
    subtitle: 'Nervous System, Reflex Arcs & Phytohormones',
    subject: 'Biology',
    syllabusTheme: 'World of Living',
    keyTopics: ['Structure of a Neuron & Synapse', 'Reflex Arc pathway', 'Human Brain (Forebrain, Midbrain, Hindbrain)', 'Plant hormones (Auxin, Gibberellin, Cytokinin, ABA) and Tropic movements', 'Endocrine Glands (Thyroid, Pituitary, Adrenal, Pancreas)'],
    recommendedDiagrams: ['Structure of Neuron', 'Reflex Arc Diagram', 'Human Brain Sagittal Section', 'Endocrine Glands in Human'],
  },
  {
    chapterNumber: 7,
    title: 'How do Organisms Reproduce?',
    subtitle: 'Asexual & Sexual Modes, Floral Anatomy & Human Reproduction',
    subject: 'Biology',
    syllabusTheme: 'World of Living',
    keyTopics: ['Asexual reproduction (Fission, Budding, Regeneration, Spores, Vegetative propagation)', 'Sexual reproduction in flowering plants (Pollination & Fertilisation)', 'Male & Female reproductive systems', 'Contraceptive methods and Reproductive Health'],
    recommendedDiagrams: ['Longitudinal Section of a Flower', 'Germination of Pollen on Stigma', 'Male Reproductive System', 'Female Reproductive System'],
  },
  {
    chapterNumber: 8,
    title: 'Heredity and Evolution',
    subtitle: 'Mendelian Genetics, Monohybrid Cross & Sex Determination',
    subject: 'Biology',
    syllabusTheme: 'World of Living',
    keyTopics: ['Inheritance of traits & Mendel experiments', 'Monohybrid and Dihybrid crosses (3:1 and 9:3:3:1 ratios)', 'Sex determination in human beings (XX and XY chromosomes)'],
    recommendedDiagrams: ['Mendel Monohybrid Cross Punnett Square', 'Sex Determination in Human Beings Flowchart'],
  },
  {
    chapterNumber: 9,
    title: 'Light – Reflection and Refraction',
    subtitle: 'Spherical Mirrors, Lenses, Ray Diagrams & Snell Law',
    subject: 'Physics',
    syllabusTheme: 'Natural Phenomena',
    keyTopics: ['Laws of reflection & spherical mirrors (Concave/Convex)', 'Mirror formula & linear magnification', 'Laws of refraction & Snell law', 'Lens formula, power of a lens (Dioptres)'],
    recommendedDiagrams: ['Ray Diagrams for Concave Mirror (6 Cases)', 'Refraction through a Rectangular Glass Slab', 'Convex Lens Image Formations'],
  },
  {
    chapterNumber: 10,
    title: 'The Human Eye and the Colourful World',
    subtitle: 'Eye Defects, Atmospheric Refraction & Dispersion',
    subject: 'Physics',
    syllabusTheme: 'Natural Phenomena',
    keyTopics: ['Structure of Human Eye & Accommodation', 'Defects of vision: Myopia, Hypermetropia, Presbyopia and their corrections', 'Dispersion of white light through a glass prism & Rainbow formation', 'Atmospheric refraction (Twinkling of stars, Advanced sunrise/delayed sunset)', 'Tyndall effect & Scattering of light (Blue sky, Red sunrise)'],
    recommendedDiagrams: ['Structure of Human Eye', 'Correction of Myopia and Hypermetropia with Lenses', 'Dispersion of Light by Glass Prism', 'Recombination of Spectrum (Newton Double Prism)'],
  },
  {
    chapterNumber: 11,
    title: 'Electricity',
    subtitle: 'Ohm’s Law, Resistance, Resistors in Series/Parallel & Joule Heating',
    subject: 'Physics',
    syllabusTheme: 'Effects of Current',
    keyTopics: ['Electric current, potential difference & Voltmeter/Ammeter connections', 'Ohm’s Law (V = IR) and Factors affecting resistance (Resistivity ρ)', 'Resistors in Series (R = R1+R2+R3) and Parallel (1/R = 1/R1+1/R2)', 'Joule’s Law of Heating (H = I²Rt) and Electric Power (P = VI = I²R)'],
    recommendedDiagrams: ['Ohm’s Law Experimental Verification Circuit', 'Resistors Connected in Series Circuit', 'Resistors Connected in Parallel Circuit'],
  },
  {
    chapterNumber: 12,
    title: 'Magnetic Effects of Electric Current',
    subtitle: 'Magnetic Fields, Fleming Rules & Domestic Circuits',
    subject: 'Physics',
    syllabusTheme: 'Effects of Current',
    keyTopics: ['Magnetic field lines and their properties', 'Field due to a current-carrying straight conductor (Right-Hand Thumb Rule)', 'Field due to a circular loop and Solenoid (Electromagnet)', 'Force on a current-carrying conductor in a magnetic field & Fleming’s Left-Hand Rule', 'Domestic electric circuits (Live, Neutral, Earth wire, Fuse and Earthing)'],
    recommendedDiagrams: ['Magnetic Field Lines around a Bar Magnet', 'Magnetic Field of a Solenoid', 'Domestic Electric Circuit Schematic'],
  },
  {
    chapterNumber: 13,
    title: 'Our Environment',
    subtitle: 'Ecosystems, Trophic Levels & Ozone Depletion',
    subject: 'Biology',
    syllabusTheme: 'Natural Resources',
    keyTopics: ['Ecosystem components: Biotic and Abiotic', 'Food chains, food webs & 10% Energy Transfer Law', 'Biological Magnification of non-biodegradable pesticides', 'Ozone layer depletion (CFCs) and Waste Management methods'],
    recommendedDiagrams: ['Trophic Levels Ecological Pyramid', 'Biomagnification Flowchart in Aquatic Ecosystem', 'Food Web in Terrestrial Ecosystem'],
  },
];

// Generates complete initial chapter list: transcribed chapters + clean placeholder chapters for all remaining NCERT chapters!
export function getFullNCERTChapterList(existingChapters: ChapterPackage[]): ChapterPackage[] {
  return ALL_NCERT_CLASS_10_CHAPTERS.map((overview) => {
    // Check if chapter is already transcribed and saved
    const match = existingChapters.find(
      (c) =>
        c.chapterNumber === overview.chapterNumber ||
        c.title.toLowerCase().trim() === overview.title.toLowerCase().trim()
    );
    if (match) {
      return {
        ...match,
        chapterNumber: overview.chapterNumber, // align strictly with NCERT syllabus
      };
    }

    // Return clean placeholder chapter ready for direct notes transcription
    const padNum = String(overview.chapterNumber).padStart(2, '0');
    const placeholderId = `ch${padNum}-${overview.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

    return {
      id: placeholderId,
      subject: overview.subject,
      classGrade: 'CBSE Class 10',
      chapterNumber: overview.chapterNumber,
      title: overview.title,
      subtitle: overview.subtitle,
      status: 'draft',
      version: 1,
      lastUpdated: new Date().toISOString(),
      estimatedReadTime: 'Pending Notes Transcription',
      sourceInfo: {
        notebookTitle: `Pending Notebook Notes (Ch ${overview.chapterNumber})`,
        notebookPages: [],
        author: 'Pending Upload / Dev Conversation Sync',
        transcribedAt: 'Pending',
        transcriptionModel: 'Gemini Multimodal (gemini-2.5-flash)',
        confidenceScore: 0,
        flaggedUncertaintiesCount: 0,
      },
      summary: `Awaiting handwritten notes for Chapter ${overview.chapterNumber}: ${overview.title}. Covers NCERT syllabus: ${overview.syllabusTheme}. Ready to transcribe when photos/PDFs are provided.`,
      tableOfContents: overview.keyTopics.map((topic, tIdx) => ({
        sectionId: `sec-${overview.chapterNumber}-${tIdx + 1}`,
        sectionNumber: `${overview.chapterNumber}.${tIdx + 1}`,
        title: topic,
      })),
      sections: overview.keyTopics.map((topic, tIdx) => ({
        id: `sec-${overview.chapterNumber}-${tIdx + 1}`,
        sectionNumber: `${overview.chapterNumber}.${tIdx + 1}`,
        title: topic,
        summary: `Placeholder section for ${topic}.`,
        sourceNotebookPages: [],
        paragraphs: [
          `This section is currently queued for transcription. Provide your handwritten notebook photos or scan attachments in the development conversation or upload via Publisher Studio to generate the complete typeset content.`,
        ],
        definitions: [],
        equations: [],
        tables: [],
        diagrams: [
          {
            id: `diag-queue-${overview.chapterNumber}-${tIdx + 1}`,
            title: overview.recommendedDiagrams[tIdx % overview.recommendedDiagrams.length] || `${topic} Diagram`,
            caption: `Recommended NCERT scientific illustration for ${topic}.`,
            diagramType: 'schematic',
            searchQuery: `${topic} Class 10 NCERT diagram`,
            attribution: 'CBSE NCERT Standard Curriculum',
            license: 'Open Educational Curriculum',
            labels: [],
          },
        ],
        examTips: [],
        uncertainties: [],
        keyTakeaways: [
          `Key syllabus concept: ${topic}`,
          `Upload handwritten notes to replace this placeholder.`,
        ],
      })),
      revisionChecklist: overview.keyTopics.map((topic) => `Master core definitions and diagrams for ${topic}.`),
    };
  });
}
