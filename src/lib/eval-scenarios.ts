/**
 * @file src/lib/eval-scenarios.ts
 * @description Built-in Playground scenarios. Each later step uses an earlier step's output through {{step-N}}.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 */

export interface ScenarioStep {
  id: string;
  agentId: string;
  prompt: string;
}

export interface Scenario {
  name: string;
  description: string;
  steps: ScenarioStep[];
}

const PROJECT_NOTES = '- Request project status update\n- Ask about budget\n- Mention upcoming deadline';

export const SCENARIOS: Record<string, Scenario> = {
  letter_flow: {
    name: 'Full Letter Flow',
    description: 'Recommend length → Generate a letter at that length → Suggest improvements to that letter',
    steps: [
      {
        id: 'step-1',
        agentId: 'RECOMMEND_LENGTH',
        prompt: JSON.stringify({ roughNotes: PROJECT_NOTES }),
      },
      {
        id: 'step-2',
        agentId: 'GENERATE',
        prompt: JSON.stringify({
          recipient: 'Project Manager',
          sender: 'Stakeholder',
          tone: 'Professional',
          length: '{{step-1}}',
          language: 'English',
          roughNotes: PROJECT_NOTES,
        }),
      },
      {
        id: 'step-3',
        agentId: 'SUGGEST',
        prompt: JSON.stringify({
          roughNotes: PROJECT_NOTES,
          generatedLetter: '{{step-2}}',
          recipient: 'Project Manager',
          tone: 'Professional',
        }),
      },
    ],
  },
  refine_loop: {
    name: 'Refine & Sync Loop',
    description: 'Refine notes → Generate from the refined notes → Sync that letter back into the original notes',
    steps: [
      {
        id: 'step-1',
        agentId: 'REFINE',
        prompt: JSON.stringify({
          roughNotes: '- Complaint about late delivery',
          instructions: 'Add: order number #45678, expected date was last Friday',
          conversationHistory: [],
        }),
      },
      {
        id: 'step-2',
        agentId: 'GENERATE',
        prompt: JSON.stringify({
          recipient: 'Customer Service',
          sender: 'Customer',
          tone: 'Assertive',
          length: 'Short',
          language: 'English',
          roughNotes: '{{step-1}}',
        }),
      },
      {
        id: 'step-3',
        agentId: 'SYNC_NOTES',
        prompt: JSON.stringify({
          roughNotes: '- Complaint about late delivery',
          editedLetter: '{{step-2}}',
        }),
      },
    ],
  },
};
