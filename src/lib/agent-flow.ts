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
 * Every wire also lists the **stories** it belongs to: the things an author does (Generate Draft, send a chat message,
 * and so on), so the diagram can light one story at a time. Two entries in AGENTS are similarity measures rather than
 * prompted agents: they compare embeddings, take no instruction, and say what they compute instead.
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
 * - `agent`: one entry of AGENTS: an AI agent, or a similarity measure.
 * - `output`: one field of the interface, as agents change it on screen.
 */
export type NodeRole = 'input' | 'agent' | 'output';

/** Visual family, used for the node's colour, and its shape for a similarity measure. Matches the legend of the System Diagram. */
export type NodeGroup = 'user-input' | 'core-agent' | 'detect-agent' | 'embed-measure' | 'image-agent' | 'match-agent' | 'output';

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
  /** True for nodes that run in the background, without the author asking: agents and measures alike. Drawn with a dashed border. */
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
  /** For agents without an instruction port: why an edited instruction would not reach the model. */
  instructionNote?: string;
  /** For agents that run on another agent's model rather than their own. */
  modelFrom?: string;
  /** For similarity measures: what they compute, in place of an instruction. Copied from AGENTS. */
  computes?: string;
  /** For a node that runs only when another one's response has no result: the id of the agent it stands in for. */
  fallbackFor?: string;
}

/**
 * One thing the author does, and everything that fires because of it. Each wire lists the stories it belongs to, so the
 * diagram can light one story at a time instead of every wire at once.
 */
export type StoryId = 'generate' | 'setting' | 'chat-send' | 'chat-typing' | 'notes-edit' | 'letter-edit' | 'chip-click';

export interface Story {
  id: StoryId;
  /** The button label. */
  label: string;
  /** What happens, in a sentence or two. */
  description: string;
}

export const STORIES: Story[] = [
  {
    id: 'generate',
    label: 'Generate Draft',
    description: 'The Letter Generator writes a draft from the notes and settings, with line art if a notes line asks for it. The Suggestions and the Similarity Scorer then review the draft.',
  },
  {
    id: 'setting',
    label: 'Change a setting',
    description: 'Choosing another tone, length, language, or model once a letter exists writes a new draft, exactly as Generate Draft does.',
  },
  {
    id: 'chat-send',
    label: 'Send a chat message',
    description: 'The Tone Request Detector and the Notes Editor read the message. The notes are replaced, which also makes the Length Analyst re-read them, and then a new draft is written, exactly as Generate Draft does.',
  },
  {
    id: 'chat-typing',
    label: 'Type a chat message',
    description: "800 ms after the last keystroke, the Suggestion Matcher shades the chips the message addresses. Its Scorer steps in only when the Matcher's response has no match list; if the request itself breaks, nothing is retried.",
  },
  {
    id: 'notes-edit',
    label: 'Edit the notes',
    description: 'One second after the notes stop changing, the Length Analyst marks a recommended length. Nothing else fires until Generate Draft.',
  },
  {
    id: 'letter-edit',
    label: 'Edit the letter',
    description: 'Clicking out of an edited letter: Notes Sync appends what is new in the letter to the notes, which the Length Analyst then re-reads. No new draft.',
  },
  {
    id: 'chip-click',
    label: 'Click a suggestion',
    description: 'The suggestion is appended to the notes; no agent is involved, though the Length Analyst then re-reads the notes.',
  },
];

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
  /** The stories in which it does. */
  stories: StoryId[];
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
  instructionNote?: string;
  modelFrom?: AgentId;
  fallbackFor?: AgentId;
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
    triggers: ['Whenever the notes change (1 second after the last change, once they are longer than 10 characters): typed, appended by a chip, or rewritten by an agent'],
    instructionPort: true,
  },
  SYNC_NOTES: {
    group: 'core-agent',
    triggers: ['Clicking out of the letter after editing it'],
    instructionPort: true,
  },
  SCORED: {
    group: 'embed-measure',
    background: true,
    triggers: ['After every new draft'],
  },
  MATCH_SUGGESTIONS_SCORER: {
    group: 'embed-measure',
    background: true,
    triggers: ["Fallback only: when the Suggestion Matcher's response has no match list at all, for example because it failed (an empty list does not trigger it)"],
    fallbackFor: 'MATCH_SUGGESTIONS',
  },
  MATCH_SUGGESTIONS: {
    group: 'match-agent',
    background: true,
    triggers: ['Typing a chat message (800 ms after the last keystroke, once there are suggestions)'],
    instructionNote: 'Its route always sends this default instruction and ignores any edit, so an edit would not reach the model.',
  },
  DETECT_TONE_REQUEST: {
    group: 'detect-agent',
    background: true,
    triggers: ['Sending a chat message (inside the refine route, before the Notes Editor runs)'],
    instructionNote: "The refine route calls this detector without passing an instruction, so an edit would not reach the model. It is also hidden from the Writers' Room.",
    modelFrom: 'REFINE',
  },
  DETECT_IMAGE_REQUEST: {
    group: 'detect-agent',
    background: true,
    triggers: ['Every draft, for the first notes line that matches a fixed pattern such as "add … image" (inside the generate route); that line is removed from the notes the Letter Generator reads'],
    instructionNote: "The generate route calls this detector without passing an instruction, so an edit would not reach the model. It is also hidden from the Writers' Room.",
    modelFrom: 'GENERATE',
  },
  IMAGE: {
    group: 'image-agent',
    triggers: ['When the Image Request Detector returns a subject (needs GOOGLE_API_KEY)'],
    instructionNote: 'The generate route builds the image prompt from this default instruction directly, so an edit would not reach the model.',
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
    instructionNote: facts.instructionNote,
    modelFrom: facts.modelFrom,
    computes: 'computes' in agent ? agent.computes : undefined,
    fallbackFor: facts.fallbackFor,
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
  given('rough-notes-in', 'rough-notes', 'Notes', 'Left panel', 'The bullet-point notes the author types. Agents read them and write back to them.',
    ['Typing in the notes', 'Generate Draft button'], ports('roughNotes'), 'Notes <span'),
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
  changed('rough-notes-out', 'rough-notes', 'Notes', 'Left panel', 'Agents rewrite the notes or add to them.',
    [element('roughNotes', 'notes', 'text')], 'Notes <span'),
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

const wire = (from: string, to: string, when: string, stories: StoryId[]): Wire => {
  const [fromNode, fromPort] = from.split('.');
  const [toNode, toPort] = to.split('.');
  return { id: `${from}->${to}`, from: { node: fromNode, port: fromPort }, to: { node: toNode, port: toPort }, when, stories };
};

const GENERATES = 'Every draft: Generate Draft, after a chat message, or when a setting changes';
const AFTER_DRAFT = 'After every new draft';
const CHAT_SENT = 'Sending a chat message';
const TYPING = 'Typing: 800 ms after the last keystroke';
const FALLBACK = "Fallback: only when the Suggestion Matcher's response has no match list at all (an empty list does not trigger it)";
const LETTER_EDITED = 'Clicking out of the letter after editing it';
const JOINED = `${AFTER_DRAFT}: joined onto the notes before they are embedded`;

// The stories each wire belongs to. A draft is written on Generate Draft, on a setting change, and after a chat message.
const DRAFT: StoryId[] = ['generate', 'setting', 'chat-send'];
const CHAT: StoryId[] = ['chat-send'];
const TYPING_STORY: StoryId[] = ['chat-typing'];
const LETTER_EDIT: StoryId[] = ['letter-edit'];
const CHIP: StoryId[] = ['chip-click'];
// The Length Analyst re-reads the notes whenever they change, whoever changed them: the author, the Notes Editor, Notes Sync, or a chip.
const NOTES_CHANGE: StoryId[] = ['notes-edit', 'chat-send', 'letter-edit', 'chip-click'];

const wires: Wire[] = [
  // Letter Generator
  wire('rough-notes-in.roughNotes', 'GENERATE.roughNotes', `${GENERATES}. Any line that asks for an image is removed first`, DRAFT),
  wire('to-in.recipient', 'GENERATE.recipient', GENERATES, DRAFT),
  wire('from-in.sender', 'GENERATE.sender', GENERATES, DRAFT),
  wire('tone-in.tone', 'GENERATE.tone', GENERATES, DRAFT),
  wire('length-in.length', 'GENERATE.length', GENERATES, DRAFT),
  wire('language-in.language', 'GENERATE.language', GENERATES, DRAFT),
  wire('style-in.styleExample', 'GENERATE.styleExample', GENERATES, DRAFT),
  wire('GENERATE.letter', 'letter-out.letter', GENERATES, DRAFT),

  // Line art, inside the generate route
  wire('rough-notes-in.roughNotes', 'DETECT_IMAGE_REQUEST.message',
    'Every draft, for the first notes line that matches a fixed pattern (a verb such as add or create, and a word such as image or drawing); the model never sees the other lines', DRAFT),
  wire('DETECT_IMAGE_REQUEST.subject', 'IMAGE.subject', 'When a subject is found and GOOGLE_API_KEY is set', DRAFT),
  wire('IMAGE.image', 'letter-out.watermark', 'When an image is generated', DRAFT),

  // Chat: tone detection, then refinement
  wire('chat-message-in.message', 'DETECT_TONE_REQUEST.message', CHAT_SENT, CHAT),
  wire('tone-in.toneOptions', 'DETECT_TONE_REQUEST.existingTones', CHAT_SENT, CHAT),
  wire('DETECT_TONE_REQUEST.tone', 'tone-out.toneDropdown', 'When a tone change is detected: added to the dropdown if new, then selected', CHAT),
  wire('rough-notes-in.roughNotes', 'REFINE.roughNotes', CHAT_SENT, CHAT),
  wire('chat-message-in.message', 'REFINE.instructions', CHAT_SENT, CHAT),
  wire('chat-history-in.history', 'REFINE.conversationHistory', CHAT_SENT, CHAT),
  wire('tone-in.toneOptions', 'REFINE.existingTones', CHAT_SENT, CHAT),
  wire('REFINE.roughNotes', 'rough-notes-out.roughNotes', 'Replaces the notes, then a new draft is generated', CHAT),

  // Review after each draft
  wire('rough-notes-in.roughNotes', 'SUGGEST.roughNotes', AFTER_DRAFT, DRAFT),
  wire('GENERATE.letter', 'SUGGEST.generatedLetter', AFTER_DRAFT, DRAFT),
  wire('to-in.recipient', 'SUGGEST.recipient', AFTER_DRAFT, DRAFT),
  wire('tone-in.tone', 'SUGGEST.tone', AFTER_DRAFT, DRAFT),
  wire('length-in.length', 'SUGGEST.length', AFTER_DRAFT, DRAFT),
  wire('style-in.styleExample', 'SUGGEST.styleExample', AFTER_DRAFT, DRAFT),
  wire('SUGGEST.suggestions', 'chips-out.suggestionChips', AFTER_DRAFT, DRAFT),
  wire('chips-in.suggestion', 'rough-notes-out.roughNotes', 'Clicking a chip appends it to the notes; no agent is involved', CHIP),

  // Scoring the draft: the app joins recipient and sender onto the notes before sending them
  wire('rough-notes-in.roughNotes', 'SCORED.roughNotes', `${AFTER_DRAFT}, with recipient and sender joined on`, DRAFT),
  wire('to-in.recipient', 'SCORED.roughNotes', JOINED, DRAFT),
  wire('from-in.sender', 'SCORED.roughNotes', JOINED, DRAFT),
  wire('GENERATE.letter', 'SCORED.letter', AFTER_DRAFT, DRAFT),
  wire('SCORED.score', 'match-out.matchPercent', AFTER_DRAFT, DRAFT),

  // Matching a chat message to suggestions while typing
  wire('chat-message-in.draft', 'MATCH_SUGGESTIONS.chatInput', TYPING, TYPING_STORY),
  wire('SUGGEST.suggestions', 'MATCH_SUGGESTIONS.suggestions', TYPING, TYPING_STORY),
  wire('MATCH_SUGGESTIONS.matches', 'chips-out.chipShading', 'Shades the chips the message addresses', TYPING_STORY),
  wire('chat-message-in.draft', 'MATCH_SUGGESTIONS_SCORER.chatInput', FALLBACK, TYPING_STORY),
  wire('SUGGEST.suggestions', 'MATCH_SUGGESTIONS_SCORER.suggestions', FALLBACK, TYPING_STORY),
  wire('MATCH_SUGGESTIONS_SCORER.matches', 'chips-out.chipShading', 'Fallback: marks matched chips', TYPING_STORY),

  // Length recommendation
  wire('rough-notes-in.roughNotes', 'RECOMMEND_LENGTH.roughNotes', 'Whenever the notes change, 1 second after the last change: typed, appended by a chip, or rewritten by an agent', NOTES_CHANGE),
  wire('RECOMMEND_LENGTH.recommendation', 'length-out.lengthButtons', 'Marks the recommended length button', NOTES_CHANGE),

  // Editing the letter directly
  wire('rough-notes-in.roughNotes', 'SYNC_NOTES.roughNotes', LETTER_EDITED, LETTER_EDIT),
  wire('letter-in.editedLetter', 'SYNC_NOTES.editedLetter', LETTER_EDITED, LETTER_EDIT),
  wire('SYNC_NOTES.newPoints', 'rough-notes-out.roughNotes', 'Appends new points to the notes; no new draft', LETTER_EDIT),
];

/** Letterly as a flow: each field as the author gives to it, the agents, and each field as agents change it. */
export const LETTERLY_FLOW: Flow = {
  nodes: [...interfaceNodes.filter(n => n.role === 'input'), ...agentNodes, ...interfaceNodes.filter(n => n.role === 'output')],
  wires,
};
