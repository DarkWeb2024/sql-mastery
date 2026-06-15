import type { ThinkingTagId } from '../thinking';

// A mission is Content-Layer data interpreted by the Product-Layer mission
// runtime. Each step is a validated analytical task; the runtime adds the
// decision, confidence-calibration, reflection, and artifact phases generically,
// so the same shapes will describe a Python or data-engineering mission later.

export interface MissionStep {
  id: string;
  kind: 'investigation' | 'analysis';
  /** What the analyst needs to find at this step. */
  prompt: string;
  datasetId: string;
  solution: string;
  orderMatters?: boolean;
  hint?: string;
  /** Shown once the step is solved, to build the narrative of the investigation. */
  insight: string;
}

export interface Mission {
  id: string;
  role: string;
  company: string;
  title: string;
  /** The business problem, framed as a stakeholder would pose it. */
  context: string;
  technicalConcepts: string[];
  patternIds: string[];
  thinkingTags: ThinkingTagId[];
  steps: MissionStep[];
  /** The decision the analyst must make and defend after the investigation. */
  decisionPrompt: string;
}
