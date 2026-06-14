export type Difficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';

export interface ResultSet {
  columns: string[];
  rows: unknown[][];
}

export interface PracticeQuestion {
  id: string;
  difficulty: Difficulty;
  statement: string;
  datasetId: string;
  hints: string[];
  solution: string;
  /**
   * Expected output. When omitted it is derived at load time by running the
   * canonical solution against the dataset, so questions never carry a
   * hand-typed result that could drift from the real answer.
   */
  expected?: ResultSet;
  /** When true, row order is part of the answer (the statement asks to sort). */
  orderMatters?: boolean;
  notes?: string;
}

export interface WorkedExample {
  sql: string;
  explanation: string;
}

export interface InterviewQA {
  q: string;
  a: string;
}

export interface Topic {
  id: string;
  title: string;
  category: string;
  /** Short one-line summary shown on the roadmap node and topic header. */
  summary: string;
  /** Longer explanation in light markdown (headings, lists, code fences). */
  theory: string;
  examples: WorkedExample[];
  commonMistakes: string[];
  interviewQuestions: InterviewQA[];
  practice: PracticeQuestion[];
  prerequisites: string[];
  /** Topics with no content yet still render on the roadmap as "coming soon". */
  comingSoon?: boolean;
}

export interface Dataset {
  id: string;
  title: string;
  description: string;
  /** SQL run once to create and populate the tables for this dataset. */
  seedSql: string;
  /** Tables a learner is likely to query, used for the schema preview. */
  tables: string[];
}

export interface Track {
  id: string;
  title: string;
  description: string;
  topicIds: string[];
}
