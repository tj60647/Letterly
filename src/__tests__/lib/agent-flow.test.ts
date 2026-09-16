/**
 * @file src/__tests__/lib/agent-flow.test.ts
 * @description Checks that the flow description the System Diagram is drawn from still matches the code.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 */

import fs from 'node:fs';
import path from 'node:path';
import { AGENTS, SUGGESTION_MATCH_THRESHOLD, GOOD_MATCH_SCORE } from '@/lib/agent-constants';
import { LETTERLY_FLOW, AGENT_ROUTES, STORIES, type FlowNode, type StoryId } from '@/lib/agent-flow';

const nodeById = new Map<string, FlowNode>(LETTERLY_FLOW.nodes.map(n => [n.id, n]));

describe('LETTERLY_FLOW', () => {
  it('has a node for every agent in AGENTS', () => {
    for (const id of Object.keys(AGENTS)) {
      expect(nodeById.get(id)?.role).toBe('agent');
    }
  });

  it("gives each agent one input port per field of its inputSchema, in order", () => {
    for (const [id, agent] of Object.entries(AGENTS)) {
      const ports = nodeById.get(id)!.inputs.map(p => p.id);
      expect(ports).toEqual(Object.keys(agent.inputSchema));
    }
  });

  it('uses unique node ids and unique wire ids', () => {
    const nodeIds = LETTERLY_FLOW.nodes.map(n => n.id);
    const wireIds = LETTERLY_FLOW.wires.map(w => w.id);
    expect(new Set(nodeIds).size).toBe(nodeIds.length);
    expect(new Set(wireIds).size).toBe(wireIds.length);
  });

  it('joins an existing output port to an existing input port on every wire', () => {
    for (const wire of LETTERLY_FLOW.wires) {
      const from = nodeById.get(wire.from.node);
      const to = nodeById.get(wire.to.node);
      expect({ wire: wire.id, from: from?.outputs.some(p => p.id === wire.from.port) }).toEqual({ wire: wire.id, from: true });
      expect({ wire: wire.id, to: to?.inputs.some(p => p.id === wire.to.port) }).toEqual({ wire: wire.id, to: true });
    }
  });

  it('says when every wire fires', () => {
    for (const wire of LETTERLY_FLOW.wires) {
      expect({ wire: wire.id, when: wire.when.trim().length > 0 }).toEqual({ wire: wire.id, when: true });
    }
  });

  it('wires every port of every node', () => {
    const wiredIn = new Set(LETTERLY_FLOW.wires.map(w => `${w.to.node}:${w.to.port}`));
    const wiredOut = new Set(LETTERLY_FLOW.wires.map(w => `${w.from.node}:${w.from.port}`));
    for (const node of LETTERLY_FLOW.nodes) {
      for (const port of node.inputs) expect(wiredIn).toContain(`${node.id}:${port.id}`);
      for (const port of node.outputs) expect(wiredOut).toContain(`${node.id}:${port.id}`);
    }
  });

  it('draws the interface twice: nothing flows into what the author gives, and nothing flows out of what agents change', () => {
    for (const wire of LETTERLY_FLOW.wires) {
      expect({ wire: wire.id, toRole: nodeById.get(wire.to.node)!.role }).not.toEqual({ wire: wire.id, toRole: 'input' });
      expect({ wire: wire.id, fromRole: nodeById.get(wire.from.node)!.role }).not.toEqual({ wire: wire.id, fromRole: 'output' });
    }
  });

  it('draws each interface field once per side, and titles both copies of a field alike', () => {
    const interfaceNodes = LETTERLY_FLOW.nodes.filter(n => n.role !== 'agent');
    for (const node of interfaceNodes) expect({ node: node.id, field: typeof node.field }).toEqual({ node: node.id, field: 'string' });
    for (const role of ['input', 'output'] as const) {
      const fields = interfaceNodes.filter(n => n.role === role).map(n => n.field);
      expect({ role, unique: new Set(fields).size === fields.length }).toEqual({ role, unique: true });
    }
    for (const a of interfaceNodes) {
      for (const b of interfaceNodes) {
        if (a.field === b.field) expect({ field: a.field, title: a.title }).toEqual({ field: a.field, title: b.title });
      }
    }
  });

  it('gives each interface field no more than the two values a single control carries', () => {
    for (const node of LETTERLY_FLOW.nodes.filter(n => n.role !== 'agent')) {
      const values = node.role === 'input' ? node.outputs.length : node.inputs.length;
      expect({ node: node.id, oneField: values >= 1 && values <= 2 }).toEqual({ node: node.id, oneField: true });
    }
  });

  it('says which input fields exist only after the first draft, matching how the app gates them', () => {
    const letterApp = fs.readFileSync(path.join(process.cwd(), 'src', 'components', 'LetterApp.tsx'), 'utf8');
    const chatInputNeedsLetter = /disabled=\{isChatLoading \|\| isLoading \|\| !generatedLetter\}/.test(letterApp);
    // Evidence in LetterApp.tsx that each field waits for a draft.
    const gatedOnDraft: Record<string, boolean> = {
      'chat-message-in': chatInputNeedsLetter,
      // History only grows when a chat message is sent, and the chat input is disabled until there is a letter.
      'chat-history-in': chatInputNeedsLetter && /const handleChatSubmit[\s\S]*setChatHistory\(updatedChatHistory\)/.test(letterApp),
      'letter-in': /\{generatedLetter && \(\s*isEditing \?/.test(letterApp),
      'chips-in': /\{generatedLetter && \(\s*<div className=\{styles\.reviewPanel\}>/.test(letterApp),
    };
    for (const [id, gated] of Object.entries(gatedOnDraft)) expect({ id, gated }).toEqual({ id, gated: true });

    for (const node of LETTERLY_FLOW.nodes.filter(n => n.role === 'input')) {
      const expected = node.id in gatedOnDraft ? 'after-draft' : 'start';
      expect({ node: node.id, available: node.available }).toEqual({ node: node.id, available: expected });
    }
  });

  it('gives every agent exactly one of: an instruction port, a reason its instruction cannot be edited, or what it computes', () => {
    for (const node of LETTERLY_FLOW.nodes.filter(n => n.role === 'agent')) {
      const ways = [node.instructionPort === true, !!node.instructionNote, !!node.computes].filter(Boolean).length;
      expect({ agent: node.id, ways }).toEqual({ agent: node.id, ways: 1 });
    }
  });

  it('names each labelled field exactly as the app labels it on screen', () => {
    const letterApp = fs.readFileSync(path.join(process.cwd(), 'src', 'components', 'LetterApp.tsx'), 'utf8');
    const labelled = LETTERLY_FLOW.nodes.filter(n => n.uiLabel);
    expect(labelled.length).toBeGreaterThan(0);
    for (const node of labelled) {
      expect({ node: node.id, onScreen: letterApp.includes(node.uiLabel!) }).toEqual({ node: node.id, onScreen: true });
    }
  });

  it('names every element of the interface agents change in plain words', () => {
    for (const node of LETTERLY_FLOW.nodes.filter(n => n.role === 'output')) {
      for (const port of node.inputs) {
        expect({ port: `${node.id}:${port.id}`, label: port.label }).toEqual({ port: `${node.id}:${port.id}`, label: expect.stringMatching(/^[a-z%][a-z %]*$/) });
      }
    }
  });

  it('names a model source that exists for every agent that borrows its caller\'s model', () => {
    for (const node of LETTERLY_FLOW.nodes) {
      if (node.modelFrom) expect(nodeById.get(node.modelFrom)?.role).toBe('agent');
    }
  });
});

describe('instruction setting ports', () => {
  const routeSource = (id: string) =>
    fs.readFileSync(path.join(process.cwd(), 'src', 'app', 'api', AGENT_ROUTES[id as keyof typeof AGENT_ROUTES], 'route.ts'), 'utf8');

  it('maps every agent to an API route that exists', () => {
    for (const id of Object.keys(AGENTS)) {
      expect(() => routeSource(id)).not.toThrow();
    }
  });

  it("shows an instruction port exactly where the author's edited instruction can reach the model", () => {
    const letterApp = fs.readFileSync(path.join(process.cwd(), 'src', 'components', 'LetterApp.tsx'), 'utf8');
    for (const node of LETTERLY_FLOW.nodes.filter(n => n.role === 'agent')) {
      const source = routeSource(node.id);
      // 1. The app sends the author's edit for this agent,
      const appSendsEdit = letterApp.includes(`customInstructions[AGENTS.${node.id}.id]`);
      // 2. the route copies this agent's config so the edit can replace its instruction,
      const routeCopiesAgent = new RegExp(`\\{\\s*\\.\\.\\.AGENTS\\.${node.id}\\s*\\}`).test(source);
      // 3. and the route sends that copy's instruction to the model.
      const routeSendsCopy = /content:\s*agent\.systemInstruction/.test(source);
      const reaches = appSendsEdit && routeCopiesAgent && routeSendsCopy;
      expect({ agent: node.id, instructionPort: node.instructionPort === true }).toEqual({ agent: node.id, instructionPort: reaches });
    }
  });
});

describe('agent input ports', () => {
  /** Request fields a route reads that are settings or unused, not data an agent works on. */
  const NOT_INPUTS: Record<string, string[]> = {
    '*': ['model', 'systemInstruction'],
    refine: ['currentTone'], // read from the body but never used by the route
    suggest: ['context'], // a fixed label ("Letter") sent by the app, not author data
  };

  it("match the fields each agent's own route reads from the request", () => {
    for (const [id, agent] of Object.entries(AGENTS)) {
      const route = AGENT_ROUTES[id as keyof typeof AGENT_ROUTES];
      if (id === 'IMAGE') continue; // called inside the generate route, not through its own request
      const source = fs.readFileSync(path.join(process.cwd(), 'src', 'app', 'api', route, 'route.ts'), 'utf8');
      const destructured = source.match(/const \{([^}]+)\} = (?:body|await req\.json\(\))/);
      expect({ route, found: destructured !== null }).toEqual({ route, found: true });
      const ignored = new Set([...NOT_INPUTS['*'], ...(NOT_INPUTS[route] ?? [])]);
      const fields = destructured![1].split(',').map(f => f.trim()).filter(f => f && !ignored.has(f)).sort();
      expect({ agent: id, fields }).toEqual({ agent: id, fields: Object.keys(agent.inputSchema).sort() });
    }
  });
});

describe('similarity measures', () => {
  const measures = Object.entries(AGENTS).filter(([, a]) => a.type === 'embedding').map(([id]) => id).sort();

  it('draws the two embedding units as similarity measures, not agents', () => {
    expect(measures).toEqual(['MATCH_SUGGESTIONS_SCORER', 'SCORED']);
    for (const id of measures) expect({ id, group: nodeById.get(id)!.group }).toEqual({ id, group: 'embed-measure' });
  });

  it('gives a similarity measure no instruction at all, and says what it computes instead', () => {
    for (const [id, agent] of Object.entries(AGENTS)) {
      const isMeasure = agent.type === 'embedding';
      expect({ agent: id, hasInstruction: 'systemInstruction' in agent }).toEqual({ agent: id, hasInstruction: !isMeasure });
      expect({ agent: id, computes: typeof nodeById.get(id)!.computes }).toEqual({ agent: id, computes: isMeasure ? 'string' : 'undefined' });
    }
  });

  it('states the thresholds the code actually uses', () => {
    const route = fs.readFileSync(path.join(process.cwd(), 'src', 'app', 'api', 'match-suggestions', 'route.ts'), 'utf8');
    const letterApp = fs.readFileSync(path.join(process.cwd(), 'src', 'components', 'LetterApp.tsx'), 'utf8');
    expect(route).toContain('SUGGESTION_MATCH_THRESHOLD');
    expect(nodeById.get('MATCH_SUGGESTIONS_SCORER')!.computes).toContain(String(SUGGESTION_MATCH_THRESHOLD));
    expect(letterApp).toContain('GOOD_MATCH_SCORE');
    expect(nodeById.get('SCORED')!.computes).toContain(`${Math.round(GOOD_MATCH_SCORE * 100)}%`);
  });
});

describe('fallbacks', () => {
  it('names the agent a fallback stands in for, and that agent exists', () => {
    for (const node of LETTERLY_FLOW.nodes) {
      if (node.fallbackFor) expect(nodeById.get(node.fallbackFor)?.role).toBe('agent');
    }
    expect(nodeById.get('MATCH_SUGGESTIONS_SCORER')!.fallbackFor).toBe('MATCH_SUGGESTIONS');
  });

  it('matches the app, which tries the Suggestion Matcher first and its Scorer only when the response has no match list', () => {
    const letterApp = fs.readFileSync(path.join(process.cwd(), 'src', 'components', 'LetterApp.tsx'), 'utf8');
    const triesAgentThenEmbeddings =
      /\/api\/match-suggestions-agent[\s\S]*?if \(data\.matchedSuggestions && Array\.isArray\(data\.matchedSuggestions\)\)[\s\S]*?\} else \{[\s\S]*?\/api\/match-suggestions"/;
    expect(triesAgentThenEmbeddings.test(letterApp)).toBe(true);
  });

  it('says the fallback runs when the response has no match list, not on any failure: a request that throws is not retried', () => {
    const typing = STORIES.find(s => s.id === 'chat-typing')!;
    expect(typing.description).toMatch(/no match list/i);
    expect(typing.description).not.toMatch(/fails/i);
    expect(nodeById.get('MATCH_SUGGESTIONS_SCORER')!.triggers.join(' ')).toMatch(/no match list/i);
  });
});

describe('stories', () => {
  const ids = STORIES.map(s => s.id);
  const wiresIn = (story: StoryId) => LETTERLY_FLOW.wires.filter(w => w.stories.includes(story)).map(w => w.id).sort();

  it('labels and describes every story, each once', () => {
    expect(STORIES.length).toBeGreaterThan(0);
    for (const s of STORIES) {
      expect({ story: s.id, labelled: s.label.length > 0 && s.description.length > 0 }).toEqual({ story: s.id, labelled: true });
    }
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('puts every wire in at least one story the diagram offers', () => {
    for (const wire of LETTERLY_FLOW.wires) {
      const ok = wire.stories.length > 0 && wire.stories.every(s => ids.includes(s));
      expect({ wire: wire.id, ok }).toEqual({ wire: wire.id, ok: true });
    }
  });

  it('has at least one wire in every story', () => {
    for (const s of STORIES) expect({ story: s.id, wired: wiresIn(s.id).length > 0 }).toEqual({ story: s.id, wired: true });
  });

  it('fires the same draft-time wires for Generate Draft and a setting change, and all of them again after a chat message', () => {
    expect(wiresIn('setting')).toEqual(wiresIn('generate'));
    const chat = new Set(wiresIn('chat-send'));
    for (const id of wiresIn('generate')) expect({ wire: id, inChat: chat.has(id) }).toEqual({ wire: id, inChat: true });
    expect(chat.size).toBeGreaterThan(wiresIn('generate').length);
  });

  it('re-reads the notes for a length recommendation whenever they change, including when an agent changes them', () => {
    const lengthWires = LETTERLY_FLOW.wires.filter(w => w.to.node === 'RECOMMEND_LENGTH' || w.from.node === 'RECOMMEND_LENGTH');
    expect(lengthWires.length).toBeGreaterThan(0);
    for (const w of lengthWires) {
      expect({ wire: w.id, stories: [...w.stories].sort() }).toEqual({ wire: w.id, stories: ['chat-send', 'chip-click', 'letter-edit', 'notes-edit'] });
    }
  });
});

describe('wiring details', () => {
  const letterApp = fs.readFileSync(path.join(process.cwd(), 'src', 'components', 'LetterApp.tsx'), 'utf8');
  const generateRoute = fs.readFileSync(path.join(process.cwd(), 'src', 'app', 'api', 'generate', 'route.ts'), 'utf8');

  it('wires recipient and sender into the notes the Similarity Scorer reads, as the app joins them', () => {
    expect(/const inputs = `\$\{recipient\}\\n\$\{roughNotes\}\\n\$\{sender\}`/.test(letterApp)).toBe(true);
    expect(LETTERLY_FLOW.wires.some(w => w.from.node === 'to-in' && w.to.node === 'SCORED' && w.to.port === 'roughNotes')).toBe(true);
    expect(LETTERLY_FLOW.wires.some(w => w.from.node === 'from-in' && w.to.node === 'SCORED' && w.to.port === 'roughNotes')).toBe(true);
  });

  it('says that image-request lines are removed from the notes before the Letter Generator reads them', () => {
    expect(/filter\(line => !imageRequestPattern\.test\(line\)\)/.test(generateRoute)).toBe(true);
    const wire = LETTERLY_FLOW.wires.find(w => w.id === 'rough-notes-in.roughNotes->GENERATE.roughNotes')!;
    expect(wire.when).toMatch(/image/i);
  });

  it('says that a fixed pattern, not the model, picks the notes line the Image Request Detector reads', () => {
    expect(generateRoute).toContain('imageRequestPattern');
    const wire = LETTERLY_FLOW.wires.find(w => w.id === 'rough-notes-in.roughNotes->DETECT_IMAGE_REQUEST.message')!;
    expect(wire.when).toMatch(/pattern/i);
    expect(AGENTS.DETECT_IMAGE_REQUEST.inputSchema.message).toMatch(/notes/i);
  });
});
