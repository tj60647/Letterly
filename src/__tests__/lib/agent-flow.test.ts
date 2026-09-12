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

  it("shows an instruction port exactly where the route sends the agent's instruction to the model", () => {
    for (const node of LETTERLY_FLOW.nodes.filter(n => n.role === 'agent')) {
      const source = routeSource(node.id);
      // The route copies this agent's config (so an override can replace its instruction) AND sends that copy's instruction.
      const copiesThisAgent = new RegExp(`\\{\\s*\\.\\.\\.AGENTS\\.${node.id}\\s*\\}`).test(source);
      const sendsInstruction = copiesThisAgent && /content:\s*agent\.systemInstruction/.test(source);
      expect({ agent: node.id, instructionPort: node.instructionPort === true }).toEqual({ agent: node.id, instructionPort: sendsInstruction });
    }
  });
});
