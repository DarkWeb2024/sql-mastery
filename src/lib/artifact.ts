import type { Mission } from '../content/missions/types';
import type { MissionRecord } from '../features/progress/store';

// Builds the portfolio artifact: a self-contained Markdown writeup of the
// analyst's investigation, decision, confidence, and reflection. This is the
// "evidence of thinking, not evidence of completion" the learner keeps and can
// show. Markdown is deliberate: it is portable, readable anywhere, and pasteable
// into a portfolio or a CV repo.
export function buildMissionArtifact(mission: Mission, record: MissionRecord): string {
  const date = new Date(record.completedAt ?? Date.now()).toLocaleDateString();
  const lines: string[] = [];

  lines.push(`# ${mission.title}`);
  lines.push('');
  lines.push(`Role: ${mission.role} at ${mission.company}`);
  lines.push(`Completed: ${date}`);
  lines.push('');
  lines.push('## Business problem');
  lines.push(mission.context);
  lines.push('');

  lines.push('## Investigation');
  for (const step of mission.steps) {
    lines.push(`### ${step.prompt}`);
    lines.push('');
    lines.push('```sql');
    lines.push(step.solution);
    lines.push('```');
    lines.push(`Finding: ${step.insight}`);
    lines.push('');
  }

  lines.push('## Recommendation');
  lines.push(record.recommendation || '(not provided)');
  lines.push('');

  lines.push('## Confidence');
  lines.push(`Stated confidence: ${record.confidence.level}%`);
  lines.push(`Supporting evidence: ${record.confidence.supporting || '(not provided)'}`);
  lines.push(`What would change my mind: ${record.confidence.wouldChange || '(not provided)'}`);
  lines.push(`Most fragile assumption: ${record.confidence.fragileAssumption || '(not provided)'}`);
  lines.push('');

  lines.push('## Reflection');
  lines.push(`Why this approach: ${record.reflection.whyApproach || '(not provided)'}`);
  lines.push(`Alternatives considered: ${record.reflection.alternatives || '(not provided)'}`);
  lines.push(`Assumptions made: ${record.reflection.assumptions || '(not provided)'}`);
  lines.push(`If the data changed: ${record.reflection.ifDataChanged || '(not provided)'}`);
  lines.push('');
  lines.push('---');
  lines.push('Produced on Mizan as a record of analytical reasoning.');

  return lines.join('\n');
}

// Triggers a client-side download of the artifact as a Markdown file.
export function downloadArtifact(filename: string, markdown: string): void {
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
