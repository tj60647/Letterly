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
 * The interface appears twice. On the left are the panels as the author gives to them (input nodes);
 * on the right are the same panels as agents change them (output nodes). Both copies of a panel share a
 * `panel` id and a title. Drawing it this way means every wire reads left to right, as one round of work.
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
  /** How the port is named on the diagram, where that differs from its id. Interface elements are named in plain words. */
  label?: string;
}

/**
 * Where a node sits in the story of the diagram.
 * - `input`: a panel of the interface, as what the author types, chooses, or clicks.
 * - `agent`: one AI agent from AGENTS.
 * - `output`: a panel of the interface, as what agents change on screen.
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
  /** For interface nodes: which panel this is. The panel's two copies share it. */
  panel?: string;
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
};

const port = (id: string): Port => ({ id, kind: PORT_KINDS[id] ?? 'text' });
const ports = (...ids: string[]): Port[] => ids.map(port);

/** A port on an interface panel, named in plain words for what it is on screen. */
const element = (id: string, label: string, kind: Kind): Port => ({ id, label, kind });

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

const interfaceNodes: FlowNode[] = [
  // ── What the author gives ──
  {
    id: 'left-panel-in',
    title: 'Left panel',
    subtitle: 'What you give',
    description: 'Rough Notes, From, To, Tone, Length, Output Language, and Style Match: what the author types and chooses.',
    role: 'input',
    group: 'user-input',
    panel: 'left-panel',
    triggers: ['Typing in the notes', 'Choosing a setting', 'Generate Draft button'],
    inputs: [],
    outputs: ports('roughNotes', 'recipient', 'sender', 'tone', 'length', 'language', 'styleExample', 'toneOptions'),
  },
  {
    id: 'chat-in',
    title: 'Chat',
    subtitle: 'What you give',
    description: 'Messages the author types and sends to change the notes and regenerate the letter.',
    role: 'input',
    group: 'user-input',
    panel: 'chat',
    triggers: ['Typing a message', 'Sending a message'],
    inputs: [],
    outputs: ports('message', 'draft', 'history'),
  },
  {
    id: 'center-panel-in',
    title: 'Center panel',
    subtitle: 'What you give',
    description: 'The letter, which the author can click into and edit directly.',
    role: 'input',
    group: 'user-input',
    panel: 'center-panel',
    triggers: ['Clicking out of the letter after editing it'],
    inputs: [],
    outputs: ports('editedLetter'),
  },
  {
    id: 'right-panel-in',
    title: 'Right panel',
    subtitle: 'What you give',
    description: 'Suggestion chips the author can click to add to the notes.',
    role: 'input',
    group: 'user-input',
    panel: 'right-panel',
    triggers: ['Clicking a suggestion'],
    inputs: [],
    outputs: ports('suggestion'),
  },

  // ── What agents change ──
  {
    id: 'left-panel-out',
    title: 'Left panel',
    subtitle: 'What agents change',
    description: 'Agents rewrite or add to the rough notes, add and select a tone, and mark a recommended length.',
    role: 'output',
    group: 'output',
    panel: 'left-panel',
    triggers: [],
    inputs: [
      element('roughNotes', 'rough notes', 'text'),
      element('toneDropdown', 'tone dropdown', 'text'),
      element('lengthButtons', 'length buttons', 'text'),
    ],
    outputs: [],
  },
  {
    id: 'center-panel-out',
    title: 'Center panel',
    subtitle: 'What agents change',
    description: 'The draft letter, with any line-art watermark behind it.',
    role: 'output',
    group: 'output',
    panel: 'center-panel',
    triggers: [],
    inputs: [element('letter', 'letter', 'text'), element('watermark', 'watermark', 'image')],
    outputs: [],
  },
  {
    id: 'right-panel-out',
    title: 'Right panel',
    subtitle: 'What agents change',
    description: 'Suggestion chips, shaded when the chat message being typed addresses them.',
    role: 'output',
    group: 'output',
    panel: 'right-panel',
    triggers: [],
    inputs: [element('suggestionChips', 'suggestion chips', 'json'), element('chipShading', 'chip shading', 'json')],
    outputs: [],
  },
  {
    id: 'stats-bar-out',
    title: 'Stats bar',
    subtitle: 'What agents change',
    description: 'The Match % between the notes (with recipient and sender) and the letter.',
    role: 'output',
    group: 'output',
    panel: 'stats-bar',
    triggers: [],
    inputs: [element('matchPercent', 'match %', 'number')],
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
const CHAT_SENT = 'Sending a chat message';
const TYPING = 'Typing: 800 ms after the last keystroke';
const FALLBACK = 'Fallback: when the Suggestion Matcher returns no list';
const LETTER_EDITED = 'Clicking out of the letter after editing it';

const wires: Wire[] = [
  // Draft Generator
  wire('left-panel-in.roughNotes', 'GENERATE.roughNotes', GENERATES),
  wire('left-panel-in.recipient', 'GENERATE.recipient', GENERATES),
  wire('left-panel-in.sender', 'GENERATE.sender', GENERATES),
  wire('left-panel-in.tone', 'GENERATE.tone', GENERATES),
  wire('left-panel-in.length', 'GENERATE.length', GENERATES),
  wire('left-panel-in.language', 'GENERATE.language', GENERATES),
  wire('left-panel-in.styleExample', 'GENERATE.styleExample', GENERATES),
  wire('GENERATE.letter', 'center-panel-out.letter', GENERATES),

  // Line art, inside the generate route
  wire('left-panel-in.roughNotes', 'DETECT_IMAGE_REQUEST.message', 'Every draft, for the first notes line that asks to add or create an image'),
  wire('DETECT_IMAGE_REQUEST.subject', 'IMAGE.subject', 'When a subject is found and GOOGLE_API_KEY is set'),
  wire('IMAGE.image', 'center-panel-out.watermark', 'When an image is generated'),

  // Chat: tone detection, then refinement
  wire('chat-in.message', 'DETECT_TONE_REQUEST.message', CHAT_SENT),
  wire('left-panel-in.toneOptions', 'DETECT_TONE_REQUEST.existingTones', CHAT_SENT),
  wire('DETECT_TONE_REQUEST.tone', 'left-panel-out.toneDropdown', 'When a tone change is detected: added to the dropdown if new, then selected'),
  wire('left-panel-in.roughNotes', 'REFINE.roughNotes', CHAT_SENT),
  wire('chat-in.message', 'REFINE.instructions', CHAT_SENT),
  wire('chat-in.history', 'REFINE.conversationHistory', CHAT_SENT),
  wire('left-panel-in.toneOptions', 'REFINE.existingTones', CHAT_SENT),
  wire('REFINE.roughNotes', 'left-panel-out.roughNotes', 'Replaces the notes, then a new draft is generated'),

  // Review after each draft
  wire('left-panel-in.roughNotes', 'SUGGEST.roughNotes', AFTER_DRAFT),
  wire('GENERATE.letter', 'SUGGEST.generatedLetter', AFTER_DRAFT),
  wire('left-panel-in.recipient', 'SUGGEST.recipient', AFTER_DRAFT),
  wire('left-panel-in.tone', 'SUGGEST.tone', AFTER_DRAFT),
  wire('left-panel-in.length', 'SUGGEST.length', AFTER_DRAFT),
  wire('SUGGEST.suggestions', 'right-panel-out.suggestionChips', AFTER_DRAFT),
  wire('right-panel-in.suggestion', 'left-panel-out.roughNotes', 'Clicking a chip appends it to the notes; no agent is involved'),

  wire('left-panel-in.roughNotes', 'SCORED.roughNotes', `${AFTER_DRAFT} (joined with recipient and sender)`),
  wire('GENERATE.letter', 'SCORED.letter', AFTER_DRAFT),
  wire('SCORED.score', 'stats-bar-out.matchPercent', AFTER_DRAFT),

  // Matching a chat message to suggestions while typing
  wire('chat-in.draft', 'MATCH_SUGGESTIONS.chatInput', TYPING),
  wire('SUGGEST.suggestions', 'MATCH_SUGGESTIONS.suggestions', TYPING),
  wire('MATCH_SUGGESTIONS.matches', 'right-panel-out.chipShading', 'Shades the chips the message addresses'),
  wire('chat-in.draft', 'MATCH_SUGGESTIONS_SCORER.chatInput', FALLBACK),
  wire('SUGGEST.suggestions', 'MATCH_SUGGESTIONS_SCORER.suggestions', FALLBACK),
  wire('MATCH_SUGGESTIONS_SCORER.matches', 'right-panel-out.chipShading', 'Fallback: marks matched chips'),

  // Length recommendation
  wire('left-panel-in.roughNotes', 'RECOMMEND_LENGTH.roughNotes', 'Editing the notes: 1 second after you stop'),
  wire('RECOMMEND_LENGTH.recommendation', 'left-panel-out.lengthButtons', 'Marks the recommended length button'),

  // Editing the letter directly
  wire('left-panel-in.roughNotes', 'SYNC_NOTES.roughNotes', LETTER_EDITED),
  wire('center-panel-in.editedLetter', 'SYNC_NOTES.editedLetter', LETTER_EDITED),
  wire('SYNC_NOTES.newPoints', 'left-panel-out.roughNotes', 'Appends new points to the notes; no new draft'),
];

/** Letterly as a flow: the interface as the author gives to it, the agents, and the interface as agents change it. */
export const LETTERLY_FLOW: Flow = {
  nodes: [...interfaceNodes.filter(n => n.role === 'input'), ...agentNodes, ...interfaceNodes.filter(n => n.role === 'output')],
  wires,
};
