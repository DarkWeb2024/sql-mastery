import type { Track } from '../types';

// Career tracks reuse the same topic nodes in a recommended order. New tracks
// (or whole new subjects such as Python) are added here without touching the
// roadmap or topic components.
export const tracks: Track[] = [
  {
    id: 'foundations',
    title: 'SQL Foundations',
    description: 'The core query skills every track builds on.',
    topicIds: ['basics', 'filtering', 'aggregation', 'joins'],
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    description: 'Querying, grouping, and joining business data to answer questions.',
    topicIds: ['basics', 'filtering', 'aggregation', 'joins', 'subqueries', 'cte', 'window', 'analytics'],
  },
  {
    id: 'data-engineer',
    title: 'Data Engineer',
    description: 'Modelling, performance, and the machinery behind data pipelines.',
    topicIds: ['basics', 'filtering', 'aggregation', 'joins', 'cte', 'views', 'indexes', 'optimization', 'procedures', 'triggers'],
  },
];

export function getTrack(id: string): Track | undefined {
  return tracks.find((t) => t.id === id);
}
