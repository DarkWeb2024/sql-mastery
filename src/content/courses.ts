export interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  status: 'available' | 'coming-soon';
  accent: string;
  /** Short label for the discipline, shown on the catalog tile. */
  tag: string;
  /** Route to open when the course is available. */
  href?: string;
}

// Khwarizmi is a multi-subject platform. SQL is the first complete course; the
// rest are placeholders that establish the direction without pretending to be
// ready. New courses slot in here without touching the catalog UI.
export const courses: Course[] = [
  {
    id: 'sql',
    title: 'SQL',
    subtitle: 'Query, analyse, and reason about data',
    description:
      'From SELECT to joins, aggregation, and beyond, with an in-browser engine and graded practice.',
    status: 'available',
    accent: '#3478f6',
    tag: 'Databases',
    href: '#/roadmap',
  },
  {
    id: 'python',
    title: 'Python',
    subtitle: 'Programming foundations for data and beyond',
    description: 'Syntax, data structures, and the libraries that power analysis and automation.',
    status: 'coming-soon',
    accent: '#f6a534',
    tag: 'Programming',
  },
  {
    id: 'java',
    title: 'Java',
    subtitle: 'Typed, object-oriented engineering',
    description: 'Classes, collections, and the patterns behind large, maintainable systems.',
    status: 'coming-soon',
    accent: '#e0533a',
    tag: 'Programming',
  },
  {
    id: 'ai',
    title: 'Working with AI',
    subtitle: 'Prompting and building with modern assistants',
    description: 'How to think with AI tools: prompting, review, and shipping real work responsibly.',
    status: 'coming-soon',
    accent: '#7c5cf6',
    tag: 'AI',
  },
];

export function availableCourses(): Course[] {
  return courses.filter((c) => c.status === 'available');
}
