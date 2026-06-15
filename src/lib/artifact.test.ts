import { describe, expect, it } from 'vitest';
import { buildMissionArtifact } from './artifact';
import { ecommerceRevenue } from '../content/missions/ecommerceRevenue';
import { emptyMissionRecord } from '../features/progress/store';

describe('buildMissionArtifact', () => {
  it('includes the problem, every step, and the analyst inputs', () => {
    const record = emptyMissionRecord();
    record.recommendation = 'The drop is Electronics returning-customer retention; relaunch winback.';
    record.confidence.level = 75;
    record.confidence.supporting = 'The decline isolates cleanly to one segment.';
    record.reflection.whyApproach = 'Drilled down by category then customer type.';

    const md = buildMissionArtifact(ecommerceRevenue, record);

    expect(md).toContain(`# ${ecommerceRevenue.title}`);
    expect(md).toContain('## Business problem');
    expect(md).toContain('## Recommendation');
    expect(md).toContain('relaunch winback');
    expect(md).toContain('Stated confidence: 75%');
    expect(md).toContain('## Reflection');
    // Every investigation step's SQL should be embedded as evidence.
    for (const step of ecommerceRevenue.steps) {
      expect(md).toContain(step.solution);
    }
  });

  it('marks missing inputs rather than omitting sections', () => {
    const md = buildMissionArtifact(ecommerceRevenue, emptyMissionRecord());
    expect(md).toContain('(not provided)');
  });
});
