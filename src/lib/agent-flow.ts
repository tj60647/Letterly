/**
 * @file src/lib/agent-flow.ts
 * @description Describes how Letterly's agents and interface are wired together, as a flow the System Diagram is drawn from.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 *
 * @see Key Concepts: Flow, Node, Port, Wire, Kind
 *
 * The words follow Agent Design Studio's Agentic Studio, so a student meets one vocabulary in both:
 * - A **flow** is made of **nodes** joined by **wires**.
 * - A wire runs from an output **port** on one node to an input port on another: `{ node, port }` to `{ node, port }`.
 * - Every port carries a **kind** of value (text, json, number, image), and is drawn in that kind's colour.
 *
 * An agent's input ports are read from its `inputSchema` in agent-constants.ts, so they are never typed twice.
 * Everything else here describes what the application code does today (LetterApp.tsx and the API routes).
 * If you change how agents are called, change the wires here too; the tests in
 * src/__tests__/lib/agent-flow.test.ts check that every port and wire still lines up.
 */

import { AGENTS } from '@/lib/agent-constants';

/** The kinds of value a port carries. Names match Agent Design Studio where it has the same kind. */
export type Kind = 'text' | 'json' | 'number' | 'image';

export interface Port {
  id: string;
  kind: Kind;
}

/**
 * Where a node sits in the story of the diagram.
 * - `input`: a part of the interface the author types into or chooses from.
 * - `agent`: one AI agent from AGENTS.
 * - `output`: a part of the interface agents change.
 */
export type NodeRole = 'input' | 'agent' | 'output';

/** Visual family, used for the node's colour. Matches the legend of the System Diagram. */
export type NodeGroup = 'user-input' | 'core-agent' | 'detect-agent' | 'embed-agent' | 'image-agent' | 'match-agent' | 'output';

export interface FlowNode {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  role: NodeRole;
  group: NodeGroup;
  /** True for agents that run in the background, without the author asking. Drawn with a dashed border. */
  background?: boolean;
  /** What makes this node act. */
  triggers: string[];
  inputs: Port[];
  outputs: Port[];
  /** For agents: true where the route sends the instruction the author can edit in the Writers' Room. Drawn as a hollow port. */
  instructionPort?: boolean;
  /** For agents that run on another agent's model rather than their own. */
  modelFrom?: string;
}

export interface WireEnd {
  node: string;
  port: string;
}

export interface Wire {
  id: string;
  from: WireEnd;
  to: WireEnd;
  /** When a value travels along this wire. */
  when: string;
}

export interface Flow {
  nodes: FlowNode[];
  wires: Wire[];
}

type AgentId = keyof typeof AGENTS;

/** The API route (folder under src/app/api) that runs each agent. */
export const AGENT_ROUTES: Record<AgentId, string> = {
  GENERATE: 'generate',
  REFINE: 'refine',
  SUGGEST: 'suggest',
  RECOMMEND_LENGTH: 'recommend-length',
  SYNC_NOTES: 'sync-notes',
  SCORED: 'score',
  MATCH_SUGGESTIONS_SCORER: 'match-suggestions',
  MATCH_SUGGESTIONS: 'match-suggestions-agent',
  DETECT_TONE_REQUEST: 'detect-tone',
  DETECT_IMAGE_REQUEST: 'detect-image',
  // The Line Art Generator is called from inside the generate route.
  IMAGE: 'generate',
};

/** The kind of each port that is not plain text. */
const PORT_KINDS: Record<string, Kind> = {
  suggestions: 'json',
  matches: 'json',
  conversationHistory: 'json',
  history: 'json',
  existingTones: 'json',
  toneOptions: 'json',
  newPoints: 'json',
  score: 'number',
  image: 'image',
  backgroundImage: 'image',
};

const port = (id: string): Port => ({ id, kind: PORT_KINDS[id] ?? 'text' });
const ports = (...ids: string[]): Port[] => ids.map(port);

/** What each agent produces. Inputs come from `inputSchema`; outputs are declared here. */
const AGENT_OUTPUTS: Record<AgentId, string[]> = {
  GENERATE: ['letter'],
  REFINE: ['roughNotes'],
  SUGGEST: ['suggestions'],
  RECOMMEND_LENGTH: ['recommendation'],
  SYNC_NOTES: ['newPoints'],
  SCORED: ['score'],
  MATCH_SUGGESTIONS_SCORER: ['matches'],
  MATCH_SUGGESTIONS: ['matches'],
  DETECT_TONE_REQUEST: ['tone'],
  DETECT_IMAGE_REQUEST: ['subject'],
  IMAGE: ['image'],
};

interface AgentDiagramFacts {
  group: NodeGroup;
  background?: boolean;
  triggers: string[];
  instructionPort?: boolean;
  modelFrom?: AgentId;
}

const AGENT_FACTS: Record<AgentId, AgentDiagramFacts> = {
  GENERATE: {
    group: 'core-agent',
    triggers: [
      'Generate Draft button',
      'After the Refinement Editor updates the notes',
      'Changing tone, length, language, or a model, once a letter exists',
    ],
    instructionPort: true,
  },
  REFINE: { group: 'core-agent', triggers: ['Sending a chat message'], instructionPort: true },
  SUGGEST: { group: 'core-agent', background: true, triggers: ['After every new draft'], instructionPort: true },
  RECOMMEND_LENGTH: {
    group: 'core-agent',
    background: true,
    triggers: ['Editing the rough notes (1 second after you stop, once they are longer than 10 characters)'],
    instructionPort: true,
  },
  SYNC_NOTES: {
    group: 'core-agent',
    triggers: ['Clicking out of the letter after editing it'],
    instructionPort: true,
  },
  SCORED: { group: 'embed-agent', background: true, triggers: ['After every new draft'] },
  MATCH_SUGGESTIONS_SCORER: {
    group: 'embed-agent',
    background: true,
    triggers: ['Fallback only: when the Suggestion Matcher returns no list of matches'],
  },
  MATCH_SUGGESTIONS: {
    group: 'match-agent',
    background: true,
    triggers: ['Typing a chat message (800 ms after the last keystroke, once there are suggestions)'],
  },
  DETECT_TONE_REQUEST: {
    group: 'detect-agent',
    background: true,
    triggers: ['Sending a chat message (inside the refine route, before the Refinement Editor runs)'],
    instructionPort: true,
    modelFrom: 'REFINE',
  },
  DETECT_IMAGE_REQUEST: {
    group: 'detect-agent',
    background: true,
    triggers: ['Every draft, for a rough-notes line that asks to add or create an image (inside the generate route)'],
    instructionPort: true,
    modelFrom: 'GENERATE',
  },
  IMAGE: {
    group: 'image-agent',
    triggers: ['When the Image Request Detector returns a subject (needs GOOGLE_API_KEY)'],
  },
};

const agentNodes: FlowNode[] = (Object.keys(AGENTS) as AgentId[]).map(id => {
  const agent = AGENTS[id];
  const facts = AGENT_FACTS[id];
  return {
    id,
    title: agent.name,
    subtitle: id,
    description: agent.description,
    role: 'agent',
    group: facts.group,
    background: facts.background,
    triggers: facts.triggers,
    inputs: ports(...Object.keys(agent.inputSchema)),
    outputs: ports(...AGENT_OUTPUTS[id]),
    instructionPort: facts.instructionPort,
    modelFrom: facts.modelFrom,
  };
});

const surfaceNodes: FlowNode[] = [
  {
    id: 'notes',
    title: 'Rough Notes',
    subtitle: 'Left panel',
    description: 'The shared bullet-point notes. The author edits them, and agents read them and write back to them.',
    role: 'input',
    group: 'user-input',
    triggers: ['Typing in the notes'],
    inputs: ports('roughNotes', 'newPoints', 'suggestion'),
    outputs: ports('roughNotes'),
  },
  {
    id: 'settings',
    title: 'Letter Settings',
    subtitle: 'Left panel',
    description: 'From, To, Tone, Length, Output Language, and Style Match. Agents can add a tone and mark a recommended length.',
    role: 'input',
    group: 'user-input',
    triggers: ['Choosing a setting'],
    inputs: ports('tone', 'recommendedLength'),
    outputs: ports('recipient', 'sender', 'tone', 'length', 'language', 'styleExample', 'toneOptions'),
  },
  {
    id: 'chat',
    title: 'Chat',
    subtitle: 'Refine & Iterate panel',
    description: 'Messages the author sends to change the notes and regenerate the letter.',
    role: 'input',
    group: 'user-input',
    triggers: ['Typing a message', 'Sending a message'],
    inputs: [],
    outputs: ports('message', 'draft', 'history'),
  },
  {
    id: 'letter',
    title: 'Letter',
    subtitle: 'Center panel',
    description: 'The draft letter, with any line-art watermark behind it. The author can edit it directly.',
    role: 'output',
    group: 'output',
    triggers: ['Clicking out of the letter after editing it'],
    inputs: ports('letter', 'backgroundImage'),
    outputs: ports('editedLetter'),
  },
  {
    id: 'chips',
    title: 'Suggestion Chips',
    subtitle: 'Right panel',
    description: 'Suggested review prompts. Chips a chat message addresses are shaded; clicking a chip adds it to the notes.',
    role: 'output',
    group: 'output',
    triggers: ['Clicking a suggestion'],
    inputs: ports('suggestions', 'matches'),
    outputs: ports('suggestion'),
  },
  {
    id: 'matchPercent',
    title: 'Match %',
    subtitle: 'Stats bar',
    description: 'Similarity between the notes (with recipient and sender) and the letter.',
    role: 'output',
    group: 'output',
    triggers: [],
    inputs: ports('score'),
    outputs: [],
  },
];

const wire = (from: string, to: string, when: string): Wire => {
  const [fromNode, fromPort] = from.split('.');
  const [toNode, toPort] = to.split('.');
  return { id: `${from}->${to}`, from: { node: fromNode, port: fromPort }, to: { node: toNode, port: toPort }, when };
};

const GENERATES = 'Every draft: Generate Draft, after a chat message, or when a setting changes';
const AFTER_DRAFT = 'After every new draft';

const wires: Wire[] = [
  // Draft Generator
  wire('notes.roughNotes', 'GENERATE.roughNotes', GENERATES),
  wire('settings.recipient', 'GENERATE.recipient', GENERATES),
  wire('settings.sender', 'GENERATE.sender', GENERATES),
  wire('settings.tone', 'GENERATE.tone', GENERATES),
  wire('settings.length', 'GENERATE.length', GENERATES),
  wire('settings.language', 'GENERATE.language', GENERATES),
  wire('settings.styleExample', 'GENERATE.styleExample', GENERATES),
  wire('GENERATE.letter', 'letter.letter', GENERATES),

  // Line art, inside the generate route
  wire('notes.roughNotes', 'DETECT_IMAGE_REQUEST.message', 'Every draft, for the first notes line that asks to add or create an image'),
  wire('DETECT_IMAGE_REQUEST.subject', 'IMAGE.subject', 'When a subject is found and GOOGLE_API_KEY is set'),
  wire('IMAGE.image', 'letter.backgroundImage', 'When an image is generated'),

  // Chat: tone detection, then refinement
  wire('chat.message', 'DETECT_TONE_REQUEST.message', 'Sending a chat message'),
  wire('settings.toneOptions', 'DETECT_TONE_REQUEST.existingTones', 'Sending a chat message'),
  wire('DETECT_TONE_REQUEST.tone', 'settings.tone', 'When a tone change is detected: added to the dropdown if new, then selected'),
  wire('notes.roughNotes', 'REFINE.roughNotes', 'Sending a chat message'),
  wire('chat.message', 'REFINE.instructions', 'Sending a chat message'),
  wire('chat.history', 'REFINE.conversationHistory', 'Sending a chat message'),
  wire('settings.toneOptions', 'REFINE.existingTones', 'Sending a chat message'),
  wire('REFINE.roughNotes', 'notes.roughNotes', 'Replaces the notes, then a new draft is generated'),

  // Review after each draft
  wire('notes.roughNotes', 'SUGGEST.roughNotes', AFTER_DRAFT),
  wire('GENERATE.letter', 'SUGGEST.generatedLetter', AFTER_DRAFT),
  wire('settings.recipient', 'SUGGEST.recipient', AFTER_DRAFT),
  wire('settings.tone', 'SUGGEST.tone', AFTER_DRAFT),
  wire('settings.length', 'SUGGEST.length', AFTER_DRAFT),
  wire('SUGGEST.suggestions', 'chips.suggestions', AFTER_DRAFT),
  wire('chips.suggestion', 'notes.suggestion', 'Clicking a chip appends it to the notes'),

  wire('notes.roughNotes', 'SCORED.roughNotes', `${AFTER_DRAFT} (joined with recipient and sender)`),
  wire('GENERATE.letter', 'SCORED.letter', AFTER_DRAFT),
  wire('SCORED.score', 'matchPercent.score', AFTER_DRAFT),

  // Matching a chat message to suggestions while typing
  wire('chat.draft', 'MATCH_SUGGESTIONS.chatInput', 'Typing: 800 ms after the last keystroke'),
  wire('SUGGEST.suggestions', 'MATCH_SUGGESTIONS.suggestions', 'Typing: 800 ms after the last keystroke'),
  wire('MATCH_SUGGESTIONS.matches', 'chips.matches', 'Shades the chips the message addresses'),
  wire('chat.draft', 'MATCH_SUGGESTIONS_SCORER.chatInput', 'Fallback: when the Suggestion Matcher returns no list'),
  wire('SUGGEST.suggestions', 'MATCH_SUGGESTIONS_SCORER.suggestions', 'Fallback: when the Suggestion Matcher returns no list'),
  wire('MATCH_SUGGESTIONS_SCORER.matches', 'chips.matches', 'Fallback: marks matched chips'),

  // Length recommendation
  wire('notes.roughNotes', 'RECOMMEND_LENGTH.roughNotes', 'Editing the notes: 1 second after you stop'),
  wire('RECOMMEND_LENGTH.recommendation', 'settings.recommendedLength', 'Marks the recommended length button'),

  // Editing the letter directly
  wire('notes.roughNotes', 'SYNC_NOTES.roughNotes', 'Clicking out of the letter after editing it'),
  wire('letter.editedLetter', 'SYNC_NOTES.editedLetter', 'Clicking out of the letter after editing it'),
  wire('SYNC_NOTES.newPoints', 'notes.newPoints', 'Appends new points to the notes; no new draft'),
];

/** Letterly as a flow: its interface and agents, and the wires between them. */
export const LETTERLY_FLOW: Flow = {
  nodes: [...surfaceNodes.filter(n => n.role === 'input'), ...agentNodes, ...surfaceNodes.filter(n => n.role === 'output')],
  wires,
};
