import { allTopics } from '../../content/topics';
import { reference } from '../../content/reference';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  source: string;
}

// Builds the review deck from existing content: interview questions on each
// built topic, plus the command reference. No separate card content to maintain.
export function buildDeck(): Flashcard[] {
  const cards: Flashcard[] = [];

  for (const topic of allTopics) {
    if (topic.comingSoon) continue;
    topic.interviewQuestions.forEach((qa, i) => {
      cards.push({
        id: `iq-${topic.id}-${i}`,
        front: qa.q,
        back: qa.a,
        source: topic.title,
      });
    });
  }

  for (const entry of reference) {
    cards.push({
      id: `ref-${entry.command}`,
      front: `What does ${entry.command} do?`,
      back: `${entry.explanation}\nExample: ${entry.example}`,
      source: 'Command reference',
    });
  }

  return cards;
}
