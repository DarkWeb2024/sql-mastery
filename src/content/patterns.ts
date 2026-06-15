import type { ThinkingTagId } from './thinking';

// Analytical patterns are the units professionals actually think in ("I need a
// period-over-period breakdown here"). They are first-class nodes that sit
// between concepts and missions: each pattern names the concepts it requires and
// the thinking moves it exercises. This is backward design in the graph itself,
// teaching concepts through outcomes rather than outcomes through concepts.

export interface AnalyticalPattern {
  id: string;
  title: string;
  blurb: string;
  /** Concept/topic ids this pattern is built from. */
  requiredConcepts: string[];
  thinkingTags: ThinkingTagId[];
}

export const patterns: AnalyticalPattern[] = [
  {
    id: 'period-over-period',
    title: 'Period-over-period change',
    blurb: 'Compare a metric between two time periods to quantify a rise or fall.',
    requiredConcepts: ['aggregation', 'window'],
    thinkingTags: ['comparative-analysis', 'evidence-gathering'],
  },
  {
    id: 'segment-contribution',
    title: 'Segment contribution',
    blurb: 'Break a total down by a dimension to see which segment drives a change.',
    requiredConcepts: ['aggregation'],
    thinkingTags: ['decomposition', 'comparative-analysis', 'prioritization'],
  },
  {
    id: 'root-cause-drilldown',
    title: 'Root-cause drill-down',
    blurb: 'Repeatedly narrow by dimension until the source of a change is isolated.',
    requiredConcepts: ['aggregation', 'filtering'],
    thinkingTags: ['decomposition', 'elimination', 'hypothesis-formation'],
  },
  {
    id: 'top-n-per-group',
    title: 'Top-N per group',
    blurb: 'Rank items within each group and keep the leaders of each.',
    requiredConcepts: ['window', 'joins'],
    thinkingTags: ['comparative-analysis', 'prioritization'],
  },
];

const byId = new Map(patterns.map((p) => [p.id, p]));
export function getPattern(id: string): AnalyticalPattern | undefined {
  return byId.get(id);
}
