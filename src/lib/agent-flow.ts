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
 * The interface appears twice, one node per field (a single on-screen control). On the left is each field as the
 * author gives to it (input nodes); on the right, each field as agents change it (output nodes). Both copies of a field
 * share a `field` id and a title. Drawing it this way means every wire reads left to right, as one round of work.
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
 * - `input`: one field of the interface, as what the author types, chooses, or clicks.
 * - `agent`: one AI agent from AGENTS.
 * - `output`: one field of the interface, as agents change it on screen.
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
  /** For interface nodes: which field this is. The field's two copies share it. */
  field?: string;
  /** For interface nodes: the label the app shows for this field, where it has one. Tests check it appears in LetterApp.tsx. */
  uiLabel?: string;
  /** For input fields: whether the author can use it from the start, or only once a first draft exists. */
  available?: 'start' | 'after-draft';
  /** True for agents that run in the background, without the author asking. Drawn with a dashed border. */
  background?: boolean;
  /** What makes this node act. */
  triggers: string[];
  inputs: Port[];
  outputs: Port[];
  /**
   * For agents: true where an instruction the author edits in the Writers' Room actually reaches the model:
   * the app sends it, and the agent's route uses it. Drawn as a hollow port.
   */
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
      'After the Notes Editor updates the notes',
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
    triggers: ["Fallback only: when the Suggestion Matcher's response has no match list at all, for example because it failed (an empty list does not trigger it)"],
  },
  MATCH_SUGGESTIONS: {
    group: 'match-agent',
    background: true,
    triggers: ['Typing a chat message (800 ms after the last keystroke, once there are suggestions)'],
  },
  DETECT_TONE_REQUEST: {
    group: 'detect-agent',
    background: true,
    triggers: ['Sending a chat message (inside the refine route, before the Notes Editor runs)'],
    modelFrom: 'REFINE',
  },
  DETECT_IMAGE_REQUEST: {
    group: 'detect-agent',
    background: true,
    triggers: ['Every draft, for a rough-notes line that asks to add or create an image (inside the generate route)'],
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

/**
 * Input fields that only exist once there is a draft. In LetterApp.tsx the letter and the Editor Review panel render
 * only when a letter exists, and the chat input is disabled until then (so chat history cannot grow either).
 */
const AFTER_FIRST_DRAFT = new Set(['chat-message-in', 'chat-history-in', 'letter-in', 'chips-in']);

/** A field of the interface, as the author gives to it: one on-screen control and the values it carries. */
const given = (id: string, field: string, title: string, subtitle: string, description: string, triggers: string[], outputs: Port[], uiLabel?: string): FlowNode => ({
  id, field, title, subtitle, description, triggers, outputs, uiLabel, role: 'input', group: 'user-input', inputs: [],
  available: AFTER_FIRST_DRAFT.has(id) ? 'after-draft' : 'start',
});

/** The same field, as agents change it. */
const changed = (id: string, field: string, title: string, subtitle: string, description: string, inputs: Port[], uiLabel?: string): FlowNode => ({
  id, field, title, subtitle, description, inputs, uiLabel, role: 'output', group: 'output', triggers: [], outputs: [],
});

const interfaceNodes: FlowNode[] = [
  // ── What the author gives: one node per field ──
  given('rough-notes-in', 'rough-notes', 'Rough Notes', 'Left panel', 'The bullet-point notes the author types. Agents read them and write back to them.',
    ['Typing in the notes', 'Generate Draft button'], ports('roughNotes'), 'Rough Notes'),
  given('from-in', 'from', 'From', 'Left panel', 'Who is writing the letter.', ['Typing a name'], ports('sender'), 'From'),
  given('to-in', 'to', 'To', 'Left panel', 'Who the letter is for.', ['Typing a name'], ports('recipient'), 'To'),
  given('tone-in', 'tone', 'Tone', 'Left panel', 'The selected tone, and the list of tones the dropdown offers.',
    ['Choosing a tone'], ports('tone', 'toneOptions'), 'Tone'),
  given('length-in', 'length', 'Length', 'Left panel', 'Brief, Standard, or Detailed.', ['Choosing a length'], ports('length'), 'Length'),
  given('language-in', 'language', 'Output Language', 'Left panel', 'The language the letter is written in.', ['Choosing a language'], ports('language'), 'Output Language'),
  given('style-in', 'style', 'Style Match', 'Left panel', 'An optional sample of writing whose style the letter should match.',
    ['Pasting a sample'], ports('styleExample'), 'Style Match'),
  given('chat-message-in', 'chat-message', 'Chat Message', 'Refine & Iterate panel', 'The message the author is typing, and sends, to change the notes.',
    ['Typing a message', 'Sending a message'], ports('message', 'draft'), 'Refine & Iterate'),
  given('chat-history-in', 'chat-history', 'Chat History', 'Refine & Iterate panel', 'The messages the author has already sent in this conversation.',
    ['Sending a message'], ports('history')),
  given('letter-in', 'letter', 'Letter', 'Center panel', 'The letter, which the author can click into and edit directly.',
    ['Clicking out of the letter after editing it'], ports('editedLetter')),
  given('chips-in', 'chips', 'Editor Review', 'Right panel', 'Suggestion chips the author can click to add to the notes.',
    ['Clicking a suggestion'], ports('suggestion'), 'Editor Review'),

  // ── What agents change: one node per field ──
  changed('rough-notes-out', 'rough-notes', 'Rough Notes', 'Left panel', 'Agents rewrite the notes or add to them.',
    [element('roughNotes', 'notes', 'text')], 'Rough Notes'),
  changed('tone-out', 'tone', 'Tone', 'Left panel', 'The Tone Request Detector adds a tone to the dropdown if it is new, then selects it.',
    [element('toneDropdown', 'options and selection', 'text')], 'Tone'),
  changed('length-out', 'length', 'Length', 'Left panel', 'The Length Analyst marks the recommended length button.',
    [element('lengthButtons', 'recommended button', 'text')], 'Length'),
  changed('letter-out', 'letter', 'Letter', 'Center panel', 'The draft letter, with any line-art watermark behind it.',
    [element('letter', 'draft', 'text'), element('watermark', 'watermark', 'image')]),
  changed('chips-out', 'chips', 'Editor Review', 'Right panel', 'Suggestion chips, shaded when the chat message being typed addresses them.',
    [element('suggestionChips', 'suggestions', 'json'), element('chipShading', 'shading', 'json')], 'Editor Review'),
  changed('match-out', 'match', 'Match %', 'Stats bar', 'The Match % between the notes (with recipient and sender) and the letter.',
    [element('matchPercent', 'score', 'number')], '% Match'),
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
const FALLBACK = "Fallback: only when the Suggestion Matcher's response has no match list at all (an empty list does not trigger it)";
const LETTER_EDITED = 'Clicking out of the letter after editing it';

const wires: Wire[] = [
  // Draft Generator
  wire('rough-notes-in.roughNotes', 'GENERATE.roughNotes', GENERATES),
  wire('to-in.recipient', 'GENERATE.recipient', GENERATES),
  wire('from-in.sender', 'GENERATE.sender', GENERATES),
  wire('tone-in.tone', 'GENERATE.tone', GENERATES),
  wire('length-in.length', 'GENERATE.length', GENERATES),
  wire('language-in.language', 'GENERATE.language', GENERATES),
  wire('style-in.styleExample', 'GENERATE.styleExample', GENERATES),
  wire('GENERATE.letter', 'letter-out.letter', GENERATES),

  // Line art, inside the generate route
  wire('rough-notes-in.roughNotes', 'DETECT_IMAGE_REQUEST.message', 'Every draft, for the first notes line that asks to add or create an image'),
  wire('DETECT_IMAGE_REQUEST.subject', 'IMAGE.subject', 'When a subject is found and GOOGLE_API_KEY is set'),
  wire('IMAGE.image', 'letter-out.watermark', 'When an image is generated'),

  // Chat: tone detection, then refinement
  wire('chat-message-in.message', 'DETECT_TONE_REQUEST.message', CHAT_SENT),
  wire('tone-in.toneOptions', 'DETECT_TONE_REQUEST.existingTones', CHAT_SENT),
  wire('DETECT_TONE_REQUEST.tone', 'tone-out.toneDropdown', 'When a tone change is detected: added to the dropdown if new, then selected'),
  wire('rough-notes-in.roughNotes', 'REFINE.roughNotes', CHAT_SENT),
  wire('chat-message-in.message', 'REFINE.instructions', CHAT_SENT),
  wire('chat-history-in.history', 'REFINE.conversationHistory', CHAT_SENT),
  wire('tone-in.toneOptions', 'REFINE.existingTones', CHAT_SENT),
  wire('REFINE.roughNotes', 'rough-notes-out.roughNotes', 'Replaces the notes, then a new draft is generated'),

  // Review after each draft
  wire('rough-notes-in.roughNotes', 'SUGGEST.roughNotes', AFTER_DRAFT),
  wire('GENERATE.letter', 'SUGGEST.generatedLetter', AFTER_DRAFT),
  wire('to-in.recipient', 'SUGGEST.recipient', AFTER_DRAFT),
  wire('tone-in.tone', 'SUGGEST.tone', AFTER_DRAFT),
  wire('length-in.length', 'SUGGEST.length', AFTER_DRAFT),
  wire('style-in.styleExample', 'SUGGEST.styleExample', AFTER_DRAFT),
  wire('SUGGEST.suggestions', 'chips-out.suggestionChips', AFTER_DRAFT),
  wire('chips-in.suggestion', 'rough-notes-out.roughNotes', 'Clicking a chip appends it to the notes; no agent is involved'),

  wire('rough-notes-in.roughNotes', 'SCORED.roughNotes', `${AFTER_DRAFT} (joined with recipient and sender)`),
  wire('GENERATE.letter', 'SCORED.letter', AFTER_DRAFT),
  wire('SCORED.score', 'match-out.matchPercent', AFTER_DRAFT),

  // Matching a chat message to suggestions while typing
  wire('chat-message-in.draft', 'MATCH_SUGGESTIONS.chatInput', TYPING),
  wire('SUGGEST.suggestions', 'MATCH_SUGGESTIONS.suggestions', TYPING),
  wire('MATCH_SUGGESTIONS.matches', 'chips-out.chipShading', 'Shades the chips the message addresses'),
  wire('chat-message-in.draft', 'MATCH_SUGGESTIONS_SCORER.chatInput', FALLBACK),
  wire('SUGGEST.suggestions', 'MATCH_SUGGESTIONS_SCORER.suggestions', FALLBACK),
  wire('MATCH_SUGGESTIONS_SCORER.matches', 'chips-out.chipShading', 'Fallback: marks matched chips'),

  // Length recommendation
  wire('rough-notes-in.roughNotes', 'RECOMMEND_LENGTH.roughNotes', 'Editing the notes: 1 second after you stop'),
  wire('RECOMMEND_LENGTH.recommendation', 'length-out.lengthButtons', 'Marks the recommended length button'),

  // Editing the letter directly
  wire('rough-notes-in.roughNotes', 'SYNC_NOTES.roughNotes', LETTER_EDITED),
  wire('letter-in.editedLetter', 'SYNC_NOTES.editedLetter', LETTER_EDITED),
  wire('SYNC_NOTES.newPoints', 'rough-notes-out.roughNotes', 'Appends new points to the notes; no new draft'),
];

/** Letterly as a flow: each field as the author gives to it, the agents, and each field as agents change it. */
export const LETTERLY_FLOW: Flow = {
  nodes: [...interfaceNodes.filter(n => n.role === 'input'), ...agentNodes, ...interfaceNodes.filter(n => n.role === 'output')],
  wires,
};
