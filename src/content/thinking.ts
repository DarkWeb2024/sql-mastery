// Thinking tags are a Product-Layer vocabulary: they describe the professional
// reasoning moves a task exercises, independent of SQL or any domain. They are
// descriptive metadata, not a curriculum and not auto-graded. The same tags will
// later apply to Python, data engineering, and any other domain, which is what
// makes them reusable above the content.

export type ThinkingTagId =
  | 'problem-framing'
  | 'decomposition'
  | 'hypothesis-formation'
  | 'comparative-analysis'
  | 'evidence-gathering'
  | 'elimination'
  | 'prioritization'
  | 'conclusion'
  | 'communication'
  | 'assumption-testing'
  | 'uncertainty-management'
  | 'confidence-calibration';

export interface ThinkingTag {
  id: ThinkingTagId;
  label: string;
  description: string;
}

export const thinkingTags: Record<ThinkingTagId, ThinkingTag> = {
  'problem-framing': {
    id: 'problem-framing',
    label: 'Problem framing',
    description: 'Turning a vague situation into a precise, answerable question.',
  },
  decomposition: {
    id: 'decomposition',
    label: 'Decomposition',
    description: 'Breaking a problem into parts that can be investigated separately.',
  },
  'hypothesis-formation': {
    id: 'hypothesis-formation',
    label: 'Hypothesis formation',
    description: 'Proposing a testable explanation before chasing the data.',
  },
  'comparative-analysis': {
    id: 'comparative-analysis',
    label: 'Comparative analysis',
    description: 'Comparing groups or periods to locate where a change comes from.',
  },
  'evidence-gathering': {
    id: 'evidence-gathering',
    label: 'Evidence gathering',
    description: 'Querying for the facts that confirm or refute a hypothesis.',
  },
  elimination: {
    id: 'elimination',
    label: 'Elimination',
    description: 'Ruling out explanations the evidence does not support.',
  },
  prioritization: {
    id: 'prioritization',
    label: 'Prioritization',
    description: 'Deciding which finding or action matters most.',
  },
  conclusion: {
    id: 'conclusion',
    label: 'Conclusion',
    description: 'Committing to an answer the evidence supports.',
  },
  communication: {
    id: 'communication',
    label: 'Communication',
    description: 'Explaining the finding and recommendation clearly to a decision maker.',
  },
  'assumption-testing': {
    id: 'assumption-testing',
    label: 'Assumption testing',
    description: 'Checking the assumptions a conclusion rests on rather than trusting them.',
  },
  'uncertainty-management': {
    id: 'uncertainty-management',
    label: 'Uncertainty management',
    description: 'Acting sensibly when the data is incomplete or ambiguous.',
  },
  'confidence-calibration': {
    id: 'confidence-calibration',
    label: 'Confidence calibration',
    description: 'Matching stated confidence to the strength of the evidence.',
  },
};

export function thinkingLabels(ids: ThinkingTagId[]): string[] {
  return ids.map((id) => thinkingTags[id].label);
}
