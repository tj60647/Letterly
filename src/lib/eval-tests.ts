/**
 * @file src/lib/eval-tests.ts
 * @description Predefined test cases for the Agent Eval Suite.
 */

import { TestCase } from './eval-types';

export const PREDEFINED_TESTS: TestCase[] = [
  // GENERATE agent tests
  {
    id: 'gen-short-letter',
    name: 'Short letter generation',
    description: 'Tests basic letter generation from simple rough notes',
    agentId: 'GENERATE',
    prompt: JSON.stringify({
      recipient: 'Manager',
      sender: 'Employee',
      tone: 'Professional',
      length: 'Short',
      language: 'English',
      roughNotes: '- Request vacation next week\n- July 15-19\n- Work covered by colleague',
    }),
    assertions: [
      { id: 'a1', type: 'contains', value: 'vacation', label: 'Mentions vacation' },
      { id: 'a2', type: 'contains', value: 'July', label: 'Mentions July dates' },
      { id: 'a3', type: 'length_between', value: '50', extraValue: '500', label: 'Reasonable length' },
    ],
    tags: ['generate', 'short'],
  },
  {
    id: 'gen-formal-letter',
    name: 'Formal business letter',
    description: 'Tests formal tone in letter generation',
    agentId: 'GENERATE',
    prompt: JSON.stringify({
      recipient: 'Board of Directors',
      sender: 'CEO',
      tone: 'Formal',
      length: 'Medium',
      language: 'English',
      roughNotes: '- Q3 results exceeded expectations\n- Revenue up 15%\n- Expansion plans for Q4',
    }),
    assertions: [
      { id: 'a1', type: 'contains', value: 'revenue', label: 'Mentions revenue' },
      { id: 'a2', type: 'excludes', value: 'hey', label: 'No informal greetings' },
      { id: 'a3', type: 'length_between', value: '100', extraValue: '1000', label: 'Medium length' },
    ],
    tags: ['generate', 'formal'],
  },
  // REFINE agent tests
  {
    id: 'refine-add-details',
    name: 'Add details to notes',
    description: 'Tests adding new information to existing notes',
    agentId: 'REFINE',
    prompt: JSON.stringify({
      roughNotes: '- Request project update\n- Ask about timeline',
      instructions: 'Also mention the budget is $50,000',
      conversationHistory: [],
    }),
    assertions: [
      { id: 'a1', type: 'contains', value: '50,000', label: 'Budget added' },
      { id: 'a2', type: 'contains', value: 'timeline', label: 'Preserves existing notes' },
    ],
    tags: ['refine', 'add-details'],
  },
  {
    id: 'refine-preserve-notes',
    name: 'Preserve existing notes',
    description: 'Tests that existing notes are preserved when adding new info',
    agentId: 'REFINE',
    prompt: JSON.stringify({
      roughNotes: '- Meeting on Monday\n- Discuss Q3 goals\n- Review team performance',
      instructions: 'Add: bring the financial report',
      conversationHistory: [],
    }),
    assertions: [
      { id: 'a1', type: 'contains', value: 'Monday', label: 'Meeting day preserved' },
      { id: 'a2', type: 'contains', value: 'financial', label: 'New info added' },
    ],
    tags: ['refine', 'preservation'],
  },
  // SUGGEST agent tests
  {
    id: 'suggest-improvements',
    name: 'Suggest improvements',
    description: 'Tests that suggestions are actionable and JSON-formatted',
    agentId: 'SUGGEST',
    prompt: JSON.stringify({
      roughNotes: '- Ask for raise\n- Been here 2 years',
      generatedLetter: 'Dear Manager,\n\nI would like to discuss my compensation.\n\nBest,\nEmployee',
      recipient: 'Manager',
      tone: 'Professional',
    }),
    assertions: [
      { id: 'a1', type: 'json_valid', value: '', label: 'Returns valid JSON' },
      { id: 'a2', type: 'contains', value: '[', label: 'Returns JSON array' },
    ],
    tags: ['suggest', 'json'],
  },
  // RECOMMEND_LENGTH agent tests
  {
    id: 'recommend-short',
    name: 'Recommend Short length',
    description: 'Simple notes should recommend Short length',
    agentId: 'RECOMMEND_LENGTH',
    prompt: JSON.stringify({
      roughNotes: '- Quick thanks for the meeting',
    }),
    assertions: [
      { id: 'a1', type: 'contains', value: 'Short', label: 'Recommends Short' },
    ],
    tags: ['recommend-length'],
  },
  {
    id: 'recommend-long',
    name: 'Recommend Long length',
    description: 'Complex notes should recommend Long length',
    agentId: 'RECOMMEND_LENGTH',
    prompt: JSON.stringify({
      roughNotes: '- Detailed project proposal\n- Budget breakdown required\n- Timeline with milestones\n- Team structure\n- Risk assessment\n- Success metrics\n- Technical specifications\n- Stakeholder analysis',
    }),
    assertions: [
      { id: 'a1', type: 'contains', value: 'Long', label: 'Recommends Long' },
    ],
    tags: ['recommend-length'],
  },
  // SYNC_NOTES agent tests
  {
    id: 'sync-extract-new',
    name: 'Extract new info from edits',
    description: 'Tests extraction of new information from an edited letter',
    agentId: 'SYNC_NOTES',
    prompt: JSON.stringify({
      roughNotes: '- Request project update',
      editedLetter: 'Dear Team,\n\nI wanted to request a project update. The deadline is March 30th and our budget is $10,000.\n\nBest,\nManager',
    }),
    assertions: [
      { id: 'a1', type: 'contains', value: 'March', label: 'Extracts deadline' },
    ],
    tags: ['sync-notes'],
  },
];

export const TEST_SUITES: Record<string, { name: string; testIds: string[] }> = {
  all: { name: 'All Tests', testIds: PREDEFINED_TESTS.map(t => t.id) },
  generate: { name: 'GENERATE Agent', testIds: PREDEFINED_TESTS.filter(t => t.agentId === 'GENERATE').map(t => t.id) },
  refine: { name: 'REFINE Agent', testIds: PREDEFINED_TESTS.filter(t => t.agentId === 'REFINE').map(t => t.id) },
  suggest: { name: 'SUGGEST Agent', testIds: PREDEFINED_TESTS.filter(t => t.agentId === 'SUGGEST').map(t => t.id) },
  recommend_length: { name: 'RECOMMEND_LENGTH Agent', testIds: PREDEFINED_TESTS.filter(t => t.agentId === 'RECOMMEND_LENGTH').map(t => t.id) },
  sync_notes: { name: 'SYNC_NOTES Agent', testIds: PREDEFINED_TESTS.filter(t => t.agentId === 'SYNC_NOTES').map(t => t.id) },
};
