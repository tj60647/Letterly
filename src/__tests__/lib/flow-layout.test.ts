/**
 * @file src/__tests__/lib/flow-layout.test.ts
 * @description Checks the two System Diagram layouts produce drawable, consistent geometry.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 */

import { LETTERLY_FLOW } from '@/lib/agent-flow';
import { layoutColumns, layoutElk, labelWidth, LABEL_HEIGHT, type FlowLayout, type NodeBox } from '@/lib/flow-layout';

const overlaps = (a: NodeBox, b: NodeBox) =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

/** The first and last coordinate pair of an SVG path. */
const pathEnds = (d: string) => {
  const nums = (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
  return { start: { x: nums[0], y: nums[1] }, end: { x: nums[nums.length - 2], y: nums[nums.length - 1] } };
};

/** Geometry every layout must satisfy, whichever engine produced it. */
function expectDrawable(getLayout: () => FlowLayout) {
  it('places every node of the flow exactly once', () => {
    expect(getLayout().nodes.map(n => n.id).sort()).toEqual(LETTERLY_FLOW.nodes.map(n => n.id).sort());
  });

  it('keeps nodes from overlapping', () => {
    const { nodes } = getLayout();
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const pair = [nodes[i].id, nodes[j].id];
        expect({ pair, overlap: overlaps(nodes[i], nodes[j]) }).toEqual({ pair, overlap: false });
      }
    }
  });

  it('fits every node inside the drawing', () => {
    const layout = getLayout();
    for (const n of layout.nodes) {
      expect(n.x).toBeGreaterThanOrEqual(0);
      expect(n.y).toBeGreaterThanOrEqual(0);
      expect(n.x + n.width).toBeLessThanOrEqual(layout.width);
      expect(n.y + n.height).toBeLessThanOrEqual(layout.height);
    }
  });

  it('puts one input port per declared input on the left edge, and outputs on the right edge', () => {
    const boxes = new Map(getLayout().nodes.map(n => [n.id, n]));
    for (const flowNode of LETTERLY_FLOW.nodes) {
      const box = boxes.get(flowNode.id)!;
      expect(box.inputs.map(p => p.id)).toEqual(flowNode.inputs.map(p => p.id));
      expect(box.inputs.map(p => p.label)).toEqual(flowNode.inputs.map(p => p.label ?? p.id));
      expect(box.outputs.map(p => p.id)).toEqual(flowNode.outputs.map(p => p.id));
      for (const p of box.inputs) {
        expect(p.x).toBeCloseTo(box.x);
        expect(p.y).toBeGreaterThan(box.y);
        expect(p.y).toBeLessThan(box.y + box.height);
      }
      for (const p of box.outputs) {
        expect(p.x).toBeCloseTo(box.x + box.width);
        expect(p.y).toBeGreaterThan(box.y);
        expect(p.y).toBeLessThan(box.y + box.height);
      }
    }
  });

  it('keeps each node to a title row, a model row for agents, and its port rows', () => {
    for (const box of getLayout().nodes) {
      const node = LETTERLY_FLOW.nodes.find(n => n.id === box.id)!;
      const rows = node.inputs.length + node.outputs.length + (node.instructionPort ? 1 : 0);
      const expected = 26 + (node.role === 'agent' ? 16 : 0) + rows * 16 + 8;
      expect({ node: box.id, height: box.height }).toEqual({ node: box.id, height: expected });
      const firstPortY = Math.min(...[...box.inputs, ...box.outputs].map(p => p.y));
      expect(box.titleY).toBeLessThan(firstPortY);
      if (box.faceY !== null) expect(box.faceY).toBeLessThan(firstPortY);
    }
  });

  it('routes every wire from its output port to its input port, labelled with the ports it joins', () => {
    const layout = getLayout();
    const boxes = new Map(layout.nodes.map(n => [n.id, n]));
    expect(layout.wires.map(w => w.id).sort()).toEqual(LETTERLY_FLOW.wires.map(w => w.id).sort());
    for (const flowWire of LETTERLY_FLOW.wires) {
      const route = layout.wires.find(w => w.id === flowWire.id)!;
      const from = boxes.get(flowWire.from.node)!.outputs.find(p => p.id === flowWire.from.port)!;
      const to = boxes.get(flowWire.to.node)!.inputs.find(p => p.id === flowWire.to.port)!;
      const { start, end } = pathEnds(route.path);
      expect({ wire: flowWire.id, start, end }).toEqual({
        wire: flowWire.id,
        start: { x: expect.closeTo(from.x, 0), y: expect.closeTo(from.y, 0) },
        end: { x: expect.closeTo(to.x, 0), y: expect.closeTo(to.y, 0) },
      });
      // A wire landing on the interface is labelled with the data it carries; the port names the interface element.
      const landsOnInterface = LETTERLY_FLOW.nodes.find(n => n.id === flowWire.to.node)!.role === 'output';
      const label = landsOnInterface || flowWire.from.port === flowWire.to.port ? flowWire.from.port : `${flowWire.from.port} → ${flowWire.to.port}`;
      expect(route.label).toBe(label);
    }
  });

  it('places every wire label clear of every node', () => {
    const layout = getLayout();
    for (const route of layout.wires) {
      const labelBox = { id: route.id, x: route.labelX - labelWidth(route.label) / 2, y: route.labelY - LABEL_HEIGHT / 2, width: labelWidth(route.label), height: LABEL_HEIGHT, inputs: [], outputs: [], instruction: null, titleY: 0, faceY: null };
      const covered = layout.nodes.filter(n => overlaps(labelBox, n)).map(n => n.id);
      expect({ wire: route.id, covered }).toEqual({ wire: route.id, covered: [] });
    }
  });
}

describe('layoutColumns', () => {
  const layout = layoutColumns(LETTERLY_FLOW);
  const box = (id: string) => layout.nodes.find(n => n.id === id)!;

  expectDrawable(() => layout);

  it('puts the interface the author uses in the first column and the interface agents change in the last', () => {
    const xs = layout.nodes.map(n => n.x);
    for (const n of LETTERLY_FLOW.nodes) {
      if (n.role === 'input') expect(box(n.id).x).toBe(Math.min(...xs));
      if (n.role === 'output') expect(box(n.id).x).toBe(Math.max(...xs));
    }
  });

  it('places every agent to the right of every input or agent that feeds it', () => {
    const roles = new Map(LETTERLY_FLOW.nodes.map(n => [n.id, n.role]));
    for (const w of LETTERLY_FLOW.wires) {
      if (roles.get(w.to.node) === 'agent' && roles.get(w.from.node) !== 'output') {
        expect({ wire: w.id, rightward: box(w.to.node).x > box(w.from.node).x }).toEqual({ wire: w.id, rightward: true });
      }
    }
  });

  it('heads each column, from WHAT YOU GIVE to WHAT AGENTS CHANGE', () => {
    const columns = new Set(layout.nodes.map(n => n.x)).size;
    expect(layout.headings).toHaveLength(columns);
    expect(layout.headings[0].label).toBe('WHAT YOU GIVE');
    expect(layout.headings[layout.headings.length - 1].label).toBe('WHAT AGENTS CHANGE');
  });

  it('stacks inputs available from the start above those that need a first draft, each under its sub-heading', () => {
    const inputs = LETTERLY_FLOW.nodes.filter(n => n.role === 'input');
    const start = inputs.filter(n => n.available === 'start').map(n => box(n.id));
    const afterDraft = inputs.filter(n => n.available === 'after-draft').map(n => box(n.id));
    const lastStartBottom = Math.max(...start.map(b => b.y + b.height));
    const firstAfterTop = Math.min(...afterDraft.map(b => b.y));
    expect(firstAfterTop).toBeGreaterThan(lastStartBottom);

    const sub = (label: string) => layout.subheadings.find(s => s.label === label)!;
    expect(layout.subheadings.map(s => s.label)).toEqual(['FROM THE START', 'AFTER THE FIRST DRAFT']);
    expect(sub('FROM THE START').y).toBeLessThan(Math.min(...start.map(b => b.y)));
    expect(sub('AFTER THE FIRST DRAFT').y).toBeGreaterThan(lastStartBottom);
    expect(sub('AFTER THE FIRST DRAFT').y).toBeLessThan(firstAfterTop);
  });

  it('routes every wire left to right', () => {
    expect(layout.wires.filter(w => w.backward).map(w => w.id)).toEqual([]);
  });
});

describe('layoutColumns with wires that run backwards', () => {
  // Letterly's flow has none, but the layout must still draw them inside the canvas if a flow does.
  const node = (id: string, role: 'input' | 'agent' | 'output', inputs: string[], outputs: string[]) => ({
    id, title: id, subtitle: '', description: '', role, group: 'core-agent' as const, triggers: [],
    inputs: inputs.map(p => ({ id: p, kind: 'text' as const })), outputs: outputs.map(p => ({ id: p, kind: 'text' as const })),
  });
  const flow = {
    nodes: [node('in', 'input', ['a', 'b', 'c', 'd', 'e'], ['x']), node('agent', 'agent', ['x'], ['y']), node('out', 'output', ['y'], [])],
    wires: [
      { id: 'in.x->agent.x', from: { node: 'in', port: 'x' }, to: { node: 'agent', port: 'x' }, when: 'w' },
      { id: 'agent.y->out.y', from: { node: 'agent', port: 'y' }, to: { node: 'out', port: 'y' }, when: 'w' },
      ...['a', 'b', 'c', 'd', 'e'].map(p => ({ id: `agent.y->in.${p}`, from: { node: 'agent', port: 'y' }, to: { node: 'in', port: p }, when: 'w' })),
    ],
  };

  it('keeps every backward route inside the drawing', () => {
    const layout = layoutColumns(flow);
    for (const route of layout.wires) {
      const xs = (route.path.match(/-?\d+(\.\d+)?/g) ?? []).map(Number).filter((_, i) => i % 2 === 0);
      expect({ wire: route.id, minX: Math.min(...xs) >= 0, maxX: Math.max(...xs) <= layout.width })
        .toEqual({ wire: route.id, minX: true, maxX: true });
    }
  });
});

describe('layoutElk', () => {
  let layout: FlowLayout;
  beforeAll(async () => {
    layout = await layoutElk(LETTERLY_FLOW);
  });

  expectDrawable(() => layout);

  it('keeps what you give left of every agent, and what agents change right of every agent', () => {
    const roles = new Map(LETTERLY_FLOW.nodes.map(n => [n.id, n.role]));
    const agents = layout.nodes.filter(n => roles.get(n.id) === 'agent');
    const leftmostAgent = Math.min(...agents.map(n => n.x));
    const rightmostAgentEdge = Math.max(...agents.map(n => n.x + n.width));
    for (const n of layout.nodes) {
      if (roles.get(n.id) === 'input') expect({ node: n.id, left: n.x + n.width < leftmostAgent }).toEqual({ node: n.id, left: true });
      if (roles.get(n.id) === 'output') expect({ node: n.id, right: n.x > rightmostAgentEdge }).toEqual({ node: n.id, right: true });
    }
  });

  it('draws no column headings or sub-headings, because ELK does not lay nodes out in named columns', () => {
    expect(layout.headings).toEqual([]);
    expect(layout.subheadings).toEqual([]);
  });
});
