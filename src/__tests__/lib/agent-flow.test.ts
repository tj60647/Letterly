/**
 * @file src/__tests__/lib/agent-flow.test.ts
 * @description Checks that the flow description the System Diagram is drawn from still matches the code.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 */

import fs from 'node:fs';
import path from 'node:path';
import { AGENTS } from '@/lib/agent-constants';
import { LETTERLY_FLOW, AGENT_ROUTES, type FlowNode } from '@/lib/agent-flow';

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
