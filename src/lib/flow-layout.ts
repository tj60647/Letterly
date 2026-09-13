/**
 * @file src/lib/flow-layout.ts
 * @description Works out where each node, port, and wire of a flow is drawn. Two layouts: computed columns, and ELK.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 *
 * @see Key Concepts: Graph Layout, Ports, Wire Routing
 *
 * Both layouts return the same shape (FlowLayout), so the System Diagram can draw either without knowing which ran.
 * - `layoutColumns` needs no library. A node's column is how many agent steps it is from the author's input.
 * - `layoutElk` asks the Eclipse Layout Kernel (the `elkjs` package) to place nodes and ports and route wires at right angles.
 *   The library is loaded only when this function is first called.
 */

import type { ElkNode } from 'elkjs/lib/elk-api';
import type { Flow, FlowNode, Kind } from '@/lib/agent-flow';

export interface PortPoint {
  id: string;
  /** What the port is called on the diagram. */
  label: string;
  kind: Kind;
  x: number;
  y: number;
}

export interface NodeBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  inputs: PortPoint[];
  outputs: PortPoint[];
  /** Where the hollow instruction port sits, for agents that have one. */
  instruction: { x: number; y: number } | null;
  /** Baselines for the text rows inside the node. */
  titleY: number;
  subtitleY: number;
  /** The row that shows the model, for agents. */
  faceY: number | null;
}

export interface WireRoute {
  id: string;
  /** SVG path data, from the output port to the input port. */
  path: string;
  label: string;
  labelX: number;
  labelY: number;
  /** True for a wire that runs back towards the left, such as an agent writing to the notes. */
  backward: boolean;
}

export interface Heading {
  x: number;
  label: string;
}

/** A label inside a column that heads a group of nodes. */
export interface Subheading {
  x: number;
  y: number;
  label: string;
}

export interface FlowLayout {
  width: number;
  height: number;
  nodes: NodeBox[];
  wires: WireRoute[];
  headings: Heading[];
  /** Group labels within a column: in the columns layout, when the author's input fields become available. */
  subheadings: Subheading[];
}

// ── Node geometry, shared by both layouts ────────────────────────────────────

export const NODE_WIDTH = 210;
const HEADER = 40;
const FACE_ROW = 16;
const PORT_ROW = 16;
const BOTTOM_PAD = 8;

interface NodeShape {
  width: number;
  height: number;
  inputs: Array<{ id: string; label?: string; kind: Kind; dy: number }>;
  outputs: Array<{ id: string; label?: string; kind: Kind; dy: number }>;
  instructionDy: number | null;
  faceDy: number | null;
}

/** The size of a node and where its rows sit, relative to its top-left corner. */
function shapeOf(node: FlowNode): NodeShape {
  const top = HEADER + (node.role === 'agent' ? FACE_ROW : 0);
  let row = 0;
  const rowCentre = () => top + PORT_ROW * row++ + PORT_ROW / 2;
  const inputs = node.inputs.map(p => ({ ...p, dy: rowCentre() }));
  const instructionDy = node.instructionPort ? rowCentre() : null;
  const outputs = node.outputs.map(p => ({ ...p, dy: rowCentre() }));
  return {
    width: NODE_WIDTH,
    height: top + PORT_ROW * row + BOTTOM_PAD,
    inputs,
    outputs,
    instructionDy,
    faceDy: node.role === 'agent' ? HEADER + FACE_ROW / 2 + 4 : null,
  };
}

function placeNode(node: FlowNode, x: number, y: number): NodeBox {
  const s = shapeOf(node);
  return {
    id: node.id,
    x,
    y,
    width: s.width,
    height: s.height,
    inputs: s.inputs.map(p => ({ id: p.id, label: p.label ?? p.id, kind: p.kind, x, y: y + p.dy })),
    outputs: s.outputs.map(p => ({ id: p.id, label: p.label ?? p.id, kind: p.kind, x: x + s.width, y: y + p.dy })),
    instruction: s.instructionDy === null ? null : { x, y: y + s.instructionDy },
    titleY: y + 17,
    subtitleY: y + 31,
    faceY: s.faceDy === null ? null : y + s.faceDy,
  };
}

/**
 * A wire's label. A wire landing on the interface is labelled with the data it carries, because the port it lands on
 * already names the interface element. Otherwise it names both ports, or one where they match.
 */
const labelFor = (flow: Flow, fromPort: string, toNode: string, toPort: string) =>
  flow.nodes.find(n => n.id === toNode)?.role === 'output' || fromPort === toPort ? fromPort : `${fromPort} → ${toPort}`;

/** Wire labels are 9px monospace: about 5.4px per character, plus padding. */
export const LABEL_HEIGHT = 13;
export const labelWidth = (label: string) => label.length * 5.4 + 8;

interface Point { x: number; y: number }

/** Points along a cubic curve from a to b whose control points pull horizontally, as the columns layout draws it. */
function curveSamples(a: Point, b: Point, dx: number): Point[] {
  const c1 = { x: a.x + dx, y: a.y };
  const c2 = { x: b.x - dx, y: b.y };
  return Array.from({ length: 41 }, (_, i) => {
    const s = i / 40;
    const u = 1 - s;
    return {
      x: u * u * u * a.x + 3 * u * u * s * c1.x + 3 * u * s * s * c2.x + s * s * s * b.x,
      y: u * u * u * a.y + 3 * u * u * s * c1.y + 3 * u * s * s * c2.y + s * s * s * b.y,
    };
  });
}

/** Points every few pixels along a polyline. */
function polylineSamples(points: Point[]): Point[] {
  const out: Point[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const steps = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 8));
    for (let k = 0; k < steps; k++) out.push({ x: a.x + ((b.x - a.x) * k) / steps, y: a.y + ((b.y - a.y) * k) / steps });
  }
  out.push(points[points.length - 1]);
  return out;
}

interface Rect { x: number; y: number; width: number; height: number }
const rectsOverlap = (a: Rect, b: Rect) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
const grow = (r: Rect, by: number): Rect => ({ x: r.x - by, y: r.y - by, width: r.width + by * 2, height: r.height + by * 2 });

type UnplacedRoute = Omit<WireRoute, 'labelX' | 'labelY'> & { samples: Point[] };

/**
 * Puts each label on its own wire, as near the middle as it can, where it covers no node.
 * Where it can, it also avoids labels already placed. A label that cannot sit on the wire itself moves just above or below it.
 */
function placeLabels(routes: UnplacedRoute[], boxes: NodeBox[]): WireRoute[] {
  const placed: Rect[] = [];
  return routes.map(({ samples, ...route }) => {
    const width = labelWidth(route.label);
    const middle = (samples.length - 1) / 2;
    const order = samples.map((p, i) => ({ p, d: Math.abs(i - middle) })).sort((a, b) => a.d - b.d).map(s => s.p);
    const rectAt = (p: Point, dy: number): Rect => ({ x: p.x - width / 2, y: p.y + dy - LABEL_HEIGHT / 2, width, height: LABEL_HEIGHT });
    const clearOfNodes = (r: Rect) => !boxes.some(b => rectsOverlap(grow(r, 2), b));
    const clearOfLabels = (r: Rect) => !placed.some(l => rectsOverlap(r, l));
    let chosen: Rect | null = null;
    for (const needLabelsClear of [true, false]) {
      for (const dy of [0, -10, 10, -20, 20, -32, 32]) {
        chosen = order.map(p => rectAt(p, dy)).find(r => clearOfNodes(r) && (!needLabelsClear || clearOfLabels(r))) ?? null;
        if (chosen) break;
      }
      if (chosen) break;
    }
    const rect = chosen ?? rectAt(order[0], 0);
    placed.push(rect);
    return { ...route, labelX: round(rect.x + width / 2), labelY: round(rect.y + LABEL_HEIGHT / 2) };
  });
}

const round = (n: number) => Math.round(n * 10) / 10;

// ── Computed columns ─────────────────────────────────────────────────────────

const MARGIN = 24;
const HEADING_SPACE = 36;
const COLUMN_GAP = 190;
const ROW_GAP = 24;
const LANE_GAP = 12;
const SUBHEADING_SPACE = 22;

/** A layout with the author's input on the left, agents in the middle, and the interface agents change on the right. */
export function layoutColumns(flow: Flow): FlowLayout {
  const byId = new Map(flow.nodes.map(n => [n.id, n]));

  // Column: inputs are 0; an agent is one past the furthest input or agent feeding it; outputs come last.
  const column = new Map<string, number>();
  for (const n of flow.nodes) column.set(n.id, n.role === 'input' ? 0 : 1);
  for (let pass = 0; pass < flow.nodes.length; pass++) {
    let changed = false;
    for (const w of flow.wires) {
      const from = byId.get(w.from.node)!;
      const to = byId.get(w.to.node)!;
      if (to.role !== 'agent' || from.role === 'output') continue;
      const wanted = column.get(from.id)! + 1;
      if (wanted > column.get(to.id)!) {
        column.set(to.id, wanted);
        changed = true;
      }
    }
    if (!changed) break;
  }
  const lastAgentColumn = Math.max(1, ...flow.nodes.filter(n => n.role === 'agent').map(n => column.get(n.id)!));
  for (const n of flow.nodes) if (n.role === 'output') column.set(n.id, lastAgentColumn + 1);
  const columnCount = lastAgentColumn + 2;

  // Order within each column: start from the flow's order, then sort by where each node's neighbours sit.
  const columns: FlowNode[][] = Array.from({ length: columnCount }, () => []);
  for (const n of flow.nodes) columns[column.get(n.id)!].push(n);
  const rank = new Map<string, number>();
  const refreshRank = () => columns.forEach(col => col.forEach((n, i) => rank.set(n.id, i / Math.max(1, col.length - 1))));
  refreshRank();
  for (let sweep = 0; sweep < 4; sweep++) {
    for (let c = 1; c < columnCount; c++) {
      const score = (n: FlowNode) => {
        const neighbours = flow.wires
          .filter(w => w.to.node === n.id || w.from.node === n.id)
          .map(w => (w.to.node === n.id ? w.from.node : w.to.node))
          .filter(id => column.get(id)! !== c);
        return neighbours.length ? neighbours.reduce((sum, id) => sum + rank.get(id)!, 0) / neighbours.length : rank.get(n.id)!;
      };
      const scores = new Map(columns[c].map(n => [n.id, score(n)]));
      columns[c].sort((a, b) => scores.get(a.id)! - scores.get(b.id)!);
      refreshRank();
    }
  }

  // Wires that run backwards need room outside the columns for their return segments.
  const backwardCount = flow.wires.filter(w => column.get(w.to.node)! <= column.get(w.from.node)!).length;
  const sidePad = MARGIN + (backwardCount ? 20 + 4 * backwardCount : 0);

  // The input column is grouped by when each field becomes available: from the start, then after the first draft.
  const AVAILABILITY_ORDER = ['start', 'after-draft'] as const;
  const AVAILABILITY_LABEL = { start: 'FROM THE START', 'after-draft': 'AFTER THE FIRST DRAFT' } as const;
  columns[0].sort((a, b) => AVAILABILITY_ORDER.indexOf(a.available ?? 'start') - AVAILABILITY_ORDER.indexOf(b.available ?? 'start'));
  const groupsIn = (col: FlowNode[], c: number) => (c === 0 ? new Set(col.map(n => n.available ?? 'start')).size : 0);

  // Stack each column, centred on the tallest.
  const columnHeight = (col: FlowNode[], c: number) =>
    col.reduce((sum, n) => sum + shapeOf(n).height, 0) + ROW_GAP * Math.max(0, col.length - 1) + SUBHEADING_SPACE * groupsIn(col, c);
  const tallest = Math.max(...columns.map(columnHeight));
  const boxes: NodeBox[] = [];
  const subheadings: Subheading[] = [];
  columns.forEach((col, c) => {
    const x = sidePad + c * (NODE_WIDTH + COLUMN_GAP);
    let y = MARGIN + HEADING_SPACE + (tallest - columnHeight(col, c)) / 2;
    let group: string | null = null;
    for (const n of col) {
      if (c === 0 && (n.available ?? 'start') !== group) {
        group = n.available ?? 'start';
        subheadings.push({ x, y: round(y + SUBHEADING_SPACE - 8), label: AVAILABILITY_LABEL[group as keyof typeof AVAILABILITY_LABEL] });
        y += SUBHEADING_SPACE;
      }
      boxes.push(placeNode(n, x, round(y)));
      y += shapeOf(n).height + ROW_GAP;
    }
  });
  const boxById = new Map(boxes.map(b => [b.id, b]));

  // Wires: forward wires are curves; backward wires drop below the nodes and run back along their own lane.
  const nodesBottom = MARGIN + HEADING_SPACE + tallest;
  let lane = 0;
  const unplaced: UnplacedRoute[] = flow.wires.map(w => {
    const from = boxById.get(w.from.node)!.outputs.find(p => p.id === w.from.port)!;
    const to = boxById.get(w.to.node)!.inputs.find(p => p.id === w.to.port)!;
    const label = labelFor(flow, w.from.port, w.to.node, w.to.port);
    if (to.x > from.x) {
      const dx = Math.max(40, (to.x - from.x) / 2);
      return {
        id: w.id,
        path: `M ${from.x},${from.y} C ${from.x + dx},${from.y} ${to.x - dx},${to.y} ${to.x},${to.y}`,
        label,
        samples: curveSamples(from, to, dx),
        backward: false,
      };
    }
    const laneY = nodesBottom + 20 + LANE_GAP * lane++;
    const out = from.x + 16 + 4 * lane;
    const back = to.x - 16 - 4 * lane;
    return {
      id: w.id,
      path: `M ${from.x},${from.y} L ${out},${from.y} L ${out},${laneY} L ${back},${laneY} L ${back},${to.y} L ${to.x},${to.y}`,
      label,
      // Only the lane under the nodes is a candidate for the label.
      samples: polylineSamples([{ x: out, y: laneY }, { x: back, y: laneY }]),
      backward: true,
    };
  });
  const routes = placeLabels(unplaced, boxes);

  const width = sidePad * 2 + columnCount * NODE_WIDTH + (columnCount - 1) * COLUMN_GAP;
  const height = nodesBottom + 20 + LANE_GAP * lane + MARGIN;
  const headings: Heading[] = columns.map((_, c) => ({
    x: sidePad + c * (NODE_WIDTH + COLUMN_GAP) + NODE_WIDTH / 2,
    label: c === 0 ? 'WHAT YOU GIVE' : c === columnCount - 1 ? 'WHAT AGENTS CHANGE' : lastAgentColumn === 1 ? 'AGENTS' : `AGENTS · STEP ${c}`,
  }));

  return { width, height, nodes: boxes, wires: routes, headings, subheadings };
}

// ── ELK ──────────────────────────────────────────────────────────────────────

const portId = (node: string, side: 'in' | 'out', port: string) => `${node}::${side}::${port}`;

/** A layout computed by ELK's layered algorithm, with ports fixed to each node's rows and right-angle wires. */
export async function layoutElk(flow: Flow): Promise<FlowLayout> {
  const { default: ELK } = await import('elkjs/lib/elk.bundled.js');
  const elk = new ELK();

  const shapes = new Map(flow.nodes.map(n => [n.id, shapeOf(n)]));
  const graph: ElkNode = {
    id: 'letterly',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'RIGHT',
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.layered.spacing.nodeNodeBetweenLayers': '190',
      'elk.layered.spacing.edgeNodeBetweenLayers': '16',
      'elk.spacing.nodeNode': '32',
      'elk.spacing.edgeEdge': '8',
      'elk.padding': `[top=${MARGIN},left=${MARGIN},bottom=${MARGIN},right=${MARGIN}]`,
    },
    children: flow.nodes.map(n => {
      const s = shapes.get(n.id)!;
      return {
        id: n.id,
        width: s.width,
        height: s.height,
        layoutOptions: {
          'elk.portConstraints': 'FIXED_POS',
          // The interface appears twice: what you give is pinned to the first layer, what agents change to the last.
          ...(n.role === 'input' ? { 'elk.layered.layering.layerConstraint': 'FIRST' } : {}),
          ...(n.role === 'output' ? { 'elk.layered.layering.layerConstraint': 'LAST' } : {}),
        },
        ports: [
          ...s.inputs.map(p => ({ id: portId(n.id, 'in', p.id), x: 0, y: p.dy, width: 0, height: 0, layoutOptions: { 'elk.port.side': 'WEST' } })),
          ...s.outputs.map(p => ({ id: portId(n.id, 'out', p.id), x: s.width, y: p.dy, width: 0, height: 0, layoutOptions: { 'elk.port.side': 'EAST' } })),
        ],
      };
    }),
    edges: flow.wires.map(w => ({
      id: w.id,
      sources: [portId(w.from.node, 'out', w.from.port)],
      targets: [portId(w.to.node, 'in', w.to.port)],
    })),
  };

  const result = await elk.layout(graph);

  const boxes = (result.children ?? []).map(child => placeNode(flow.nodes.find(n => n.id === child.id)!, child.x ?? 0, child.y ?? 0));
  const boxById = new Map(boxes.map(b => [b.id, b]));

  const unplaced: UnplacedRoute[] = flow.wires.map(w => {
    const from = boxById.get(w.from.node)!.outputs.find(p => p.id === w.from.port)!;
    const to = boxById.get(w.to.node)!.inputs.find(p => p.id === w.to.port)!;
    const edge = (result.edges ?? []).find(e => e.id === w.id);
    const section = edge?.sections?.[0];
    // Start and end exactly on the ports; ELK's bend points shape the route between them.
    const points = [{ x: from.x, y: from.y }, ...(section?.bendPoints ?? []), { x: to.x, y: to.y }];
    return {
      id: w.id,
      path: points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${round(p.x)},${round(p.y)}`).join(' '),
      label: labelFor(flow, w.from.port, w.to.node, w.to.port),
      samples: polylineSamples(points),
      backward: to.x <= from.x,
    };
  });
  const routes = placeLabels(unplaced, boxes);

  const right = Math.max(...boxes.map(b => b.x + b.width)) + MARGIN;
  const bottom = Math.max(...boxes.map(b => b.y + b.height)) + MARGIN;
  return {
    width: Math.max(result.width ?? 0, right),
    height: Math.max(result.height ?? 0, bottom),
    nodes: boxes,
    wires: routes,
    headings: [],
    subheadings: [],
  };
}
