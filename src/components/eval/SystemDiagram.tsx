'use client';

/**
 * @file src/components/eval/SystemDiagram.tsx
 * @description Draws Letterly's agents and interface as a flow of nodes, ports, and labelled wires.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 *
 * @see Key Concepts: Flow Diagrams, Ports, SVG
 *
 * Nothing about the system is written in this file. What is drawn comes from src/lib/agent-flow.ts
 * (which reads each agent's inputs from agent-constants.ts), and where it is drawn comes from src/lib/flow-layout.ts.
 * This file only decides how things look.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { AGENTS, MODELS } from '@/lib/agent-constants';
import { LETTERLY_FLOW, type FlowNode, type Kind, type NodeGroup, type Wire } from '@/lib/agent-flow';
import { layoutColumns, layoutElk, labelWidth, LABEL_HEIGHT, type FlowLayout } from '@/lib/flow-layout';
import { AgentSettingsPanel } from './AgentSettingsPanel';
import styles from './SystemDiagram.module.css';

// ── Colour scheme ─────────────────────────────────────────────────────────────

const NODE_STYLE: Record<NodeGroup, { fill: string; stroke: string; text: string; legendLabel: string }> = {
  'user-input':   { fill: '#1d4ed8', stroke: '#1e40af', text: '#ffffff', legendLabel: 'Interface: what you give' },
  'core-agent':   { fill: '#7c3aed', stroke: '#6d28d9', text: '#ffffff', legendLabel: 'Core Writing Agent' },
  'detect-agent': { fill: '#b45309', stroke: '#92400e', text: '#ffffff', legendLabel: 'Detection Agent' },
  'embed-agent':  { fill: '#0f766e', stroke: '#115e59', text: '#ffffff', legendLabel: 'Embedding Agent' },
  'image-agent':  { fill: '#be185d', stroke: '#9d174d', text: '#ffffff', legendLabel: 'Image Agent' },
  'match-agent':  { fill: '#0369a1', stroke: '#075985', text: '#ffffff', legendLabel: 'Matching Agent' },
  'output':       { fill: '#eff6ff', stroke: '#1d4ed8', text: '#1e3a8a', legendLabel: 'Interface: what agents change' },
};

/** Port colours by kind. Text, JSON, and number use Agent Design Studio's colours, so the two canvases read alike. */
const KIND_COLOURS: Record<Kind, string> = {
  text: '#64748b',
  json: '#dc2626',
  number: '#d97706',
  image: '#db2777',
};

const MODEL_NAMES = Object.fromEntries(MODELS.map(m => [m.id, m.name]));
const NODES = new Map(LETTERLY_FLOW.nodes.map(n => [n.id, n]));
const WIRES = new Map(LETTERLY_FLOW.wires.map(w => [w.id, w]));

type LayoutMode = 'columns' | 'elk';
type Focus = { type: 'node' | 'wire'; id: string } | null;

interface SystemDiagramProps {
  /** Current model assignments from the Writers' Room, keyed by agent id. */
  assignments?: Record<string, string>;
}

/** What the face of an agent node says about its model. */
function modelText(node: FlowNode, assignments: Record<string, string>): string {
  if (node.modelFrom) return `model of ${AGENTS[node.modelFrom as keyof typeof AGENTS].name}`;
  const modelId = assignments[node.id] || AGENTS[node.id as keyof typeof AGENTS].primary;
  return MODEL_NAMES[modelId] || modelId;
}

/** A 24×24 gear icon, drawn at half size on agent nodes. */
const GEAR_PATH =
  'M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7.03 7.03 0 0 0-1.62-.94l-.36-2.54A.48.48 0 0 0 13.92 2h-3.84a.48.48 0 0 0-.48.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.72 8.47a.48.48 0 0 0 .12.61l2.03 1.58c-.05.3-.07.63-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.48.48 0 0 0-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z';

/** Enter and Space act like a click on an SVG element given a button role. */
const onActivateKey = (activate: () => void) => (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    activate();
  }
};

const touches = (wire: Wire, nodeId: string) => wire.from.node === nodeId || wire.to.node === nodeId;

/** True for the node itself, or the other copy of the same interface field. */
const isSelfOrTwin = (a: string, b: string) => a === b || (!!NODES.get(a)?.field && NODES.get(a)?.field === NODES.get(b)?.field);

export function SystemDiagram({ assignments = {} }: SystemDiagramProps) {
  const [mode, setMode] = useState<LayoutMode>('columns');
  const [elkLayout, setElkLayout] = useState<FlowLayout | null>(null);
  const [elkError, setElkError] = useState<string | null>(null);
  const [hovered, setHovered] = useState<Focus>(null);
  const [pinned, setPinned] = useState<Focus>(null);
  const [settingsFor, setSettingsFor] = useState<string | null>(null);

  const columnsLayout = useMemo(() => layoutColumns(LETTERLY_FLOW), []);

  // ELK is loaded and run only the first time someone asks for it.
  useEffect(() => {
    if (mode !== 'elk' || elkLayout || elkError) return;
    let cancelled = false;
    layoutElk(LETTERLY_FLOW)
      .then(result => { if (!cancelled) setElkLayout(result); })
      .catch(err => { if (!cancelled) setElkError(err instanceof Error ? err.message : String(err)); });
    return () => { cancelled = true; };
  }, [mode, elkLayout, elkError]);

  const showingElk = mode === 'elk' && elkLayout !== null;
  const layout = showingElk ? elkLayout! : columnsLayout;
  const focus = hovered ?? pinned;
  const togglePin = (next: Focus) =>
    setPinned(prev => (prev && next && prev.type === next.type && prev.id === next.id ? null : next));

  const wireIsLit = (wire: Wire) => {
    if (!focus) return true;
    return focus.type === 'wire' ? focus.id === wire.id : touches(wire, focus.id);
  };

  const dividers = layout.headings.slice(1).map((h, i) => (h.x + layout.headings[i].x) / 2);

  return (
    <div className={styles.diagramWrapper}>
      <div className={styles.diagramIntro}>
        <p>
          Letterly&rsquo;s agents collaborate with you through the interface: they read what you type and choose, and they change
          what you see. So each field of the interface appears twice: on the left, <strong>what you give</strong>; on the right, <strong>what agents change</strong>. This diagram is drawn from the code&rsquo;s own description of that wiring
          (<code>src/lib/agent-flow.ts</code>), so it changes when the wiring does.
          {' '}Each <strong>node</strong> has <strong>ports</strong>: inputs on the left, outputs on the right, coloured by the kind of value they carry.
          A <strong>hollow</strong> port is the instruction you can edit in the Writers&rsquo; Room.
          {' '}Each <strong>wire</strong> is labelled with the ports it joins. <strong>Dashed borders</strong> are agents that run in the background.
          {' '}<strong>Hover</strong> a node or wire to see what it does and when it fires, or <strong>click</strong> to pin it.
        </p>
        <div className={styles.layoutToggle} role="group" aria-label="Layout">
          <span className={styles.layoutToggleLabel}>Layout</span>
          {(['columns', 'elk'] as LayoutMode[]).map(m => (
            <button
              key={m}
              type="button"
              className={`${styles.toggleButton} ${mode === m ? styles.toggleButtonActive : ''}`}
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
            >
              {m === 'columns' ? 'Columns' : 'ELK'}
            </button>
          ))}
          {mode === 'elk' && !elkLayout && !elkError && <span className={styles.layoutNote}>Laying out with ELK…</span>}
          {mode === 'elk' && elkError && <span className={styles.layoutNote}>ELK layout failed: {elkError}</span>}
        </div>
      </div>

      <div className={styles.diagramScroll}>
        <svg
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          width={layout.width}
          height={layout.height}
          className={styles.svg}
          aria-label="Letterly agent system diagram"
          role="img"
          data-testid={showingElk ? 'layout-elk' : 'layout-columns'}
        >
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <path d="M 0,0 L 8,3 L 0,6 Z" fill="#64748b" />
            </marker>
            <marker id="arrow-dashed" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <path d="M 0,0 L 8,3 L 0,6 Z" fill="#94a3b8" />
            </marker>
            <marker id="arrow-output" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <path d="M 0,0 L 8,3 L 0,6 Z" fill="#2563eb" />
            </marker>
          </defs>

          {/* ── Column headings and dividers ─────────────────────────── */}
          {layout.headings.map(h => (
            <text key={h.label} x={h.x} y={22} textAnchor="middle" fill="#94a3b8" fontSize={10} fontWeight="600" fontFamily="system-ui, sans-serif" letterSpacing="0.08em">
              {h.label}
            </text>
          ))}
          {layout.subheadings.map(s => (
            <text key={s.label} x={s.x} y={s.y} fill="#64748b" fontSize={9} fontWeight="600" fontFamily="system-ui, sans-serif" letterSpacing="0.06em">
              {s.label}
            </text>
          ))}
          {dividers.map(x => (
            <line key={x} x1={x} y1={32} x2={x} y2={layout.height - 12} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4 4" />
          ))}

          {/* ── Wires ─────────────────────────────────────────────────── */}
          {layout.wires.map(route => {
            const wire = WIRES.get(route.id)!;
            const toOutput = NODES.get(wire.to.node)!.role === 'output';
            const background = NODES.get(wire.from.node)!.background || NODES.get(wire.to.node)!.background;
            const stroke = toOutput ? '#2563eb' : background ? '#94a3b8' : '#64748b';
            const marker = toOutput ? 'url(#arrow-output)' : background ? 'url(#arrow-dashed)' : 'url(#arrow)';
            const lit = wireIsLit(wire);
            const selected = focus?.type === 'wire' && focus.id === wire.id;
            const focusMe: Focus = { type: 'wire', id: wire.id };
            return (
              <g
                key={route.id}
                data-wire={route.id}
                style={{ cursor: 'pointer', opacity: lit ? 1 : 0.15 }}
                onMouseEnter={() => setHovered(focusMe)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(focusMe)}
                onBlur={() => setHovered(null)}
                onClick={() => togglePin(focusMe)}
                onKeyDown={onActivateKey(() => togglePin(focusMe))}
                role="button"
                tabIndex={0}
                aria-label={`Wire from ${wire.from.node}.${wire.from.port} to ${wire.to.node}.${wire.to.port}: ${wire.when}`}
                aria-pressed={pinned?.type === 'wire' && pinned.id === wire.id}
              >
                <path d={route.path} fill="none" stroke="transparent" strokeWidth={10} />
                <path
                  d={route.path}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={selected ? 2.5 : 1.5}
                  strokeDasharray={toOutput || background ? '5 4' : undefined}
                  markerEnd={marker}
                />
              </g>
            );
          })}

          {/* ── Nodes ─────────────────────────────────────────────────── */}
          {layout.nodes.map(box => {
            const node = NODES.get(box.id)!;
            const style = NODE_STYLE[node.group];
            const isOutput = node.role === 'output';
            const focused = focus?.type === 'node' && isSelfOrTwin(focus.id, node.id);
            const lit = !focus || (focus.type === 'node' ? focused || LETTERLY_FLOW.wires.some(w => touches(w, focus.id) && touches(w, node.id)) : touches(WIRES.get(focus.id)!, node.id));
            const focusMe: Focus = { type: 'node', id: node.id };
            const labelFill = style.text;
            return (
              <g
                key={box.id}
                data-node={box.id}
                data-highlighted={focused ? 'true' : 'false'}
                data-available={node.available}
                style={{ cursor: 'pointer', opacity: lit ? (node.background ? 0.9 : 1) : 0.35 }}
                onMouseEnter={() => setHovered(focusMe)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(focusMe)}
                onBlur={() => setHovered(null)}
                onClick={() => togglePin(focusMe)}
                onKeyDown={onActivateKey(() => togglePin(focusMe))}
                role="button"
                tabIndex={0}
                aria-label={`${node.title}: ${node.description}`}
                aria-pressed={pinned?.type === 'node' && pinned.id === node.id}
              >
                {focused && (
                  <rect x={box.x - 3} y={box.y - 3} width={box.width + 6} height={box.height + 6} rx={9} fill="none" stroke={style.stroke} strokeWidth={2} opacity={0.5} />
                )}
                <rect
                  x={box.x}
                  y={box.y}
                  width={box.width}
                  height={box.height}
                  rx={isOutput ? 14 : 6}
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth={1.5}
                  strokeDasharray={node.background ? '5 3' : undefined}
                />
                {node.available === 'after-draft' && (
                  <g>
                    <rect x={box.x + box.width - 92} y={box.y - 7} width={86} height={14} rx={7} fill="#ffffff" stroke={style.stroke} strokeWidth={1} />
                    <text x={box.x + box.width - 49} y={box.y + 3} textAnchor="middle" fill={style.stroke} fontSize={8.5} fontWeight="600" fontFamily="system-ui, sans-serif">
                      after first draft
                    </text>
                  </g>
                )}
                <text x={box.x + box.width / 2} y={box.titleY} textAnchor="middle" fill={style.text} fontSize={11.5} fontWeight="600" fontFamily="system-ui, sans-serif">
                  {node.title}
                </text>
                {node.role === 'agent' && (
                  <g
                    data-gear
                    role="button"
                    tabIndex={0}
                    aria-label={`Settings for ${node.title}`}
                    style={{ cursor: 'pointer' }}
                    onClick={e => {
                      e.stopPropagation();
                      setSettingsFor(node.id);
                    }}
                    onKeyDown={e => {
                      e.stopPropagation();
                      onActivateKey(() => setSettingsFor(node.id))(e);
                    }}
                  >
                    <circle cx={box.x + box.width - 14} cy={box.y + 13} r={9} fill="#ffffff" fillOpacity={0.18} />
                    <path d={GEAR_PATH} transform={`translate(${box.x + box.width - 20}, ${box.y + 7}) scale(0.5)`} fill={style.text} />
                  </g>
                )}
                {box.faceY !== null && (
                  <text data-face x={box.x + box.width / 2} y={box.faceY} textAnchor="middle" fill={style.text} fontSize={9} opacity={0.9} fontFamily="monospace">
                    {modelText(node, assignments)}
                  </text>
                )}

                {box.inputs.map(p => (
                  <g key={`in-${p.id}`} data-port={`${node.id}:in:${p.id}`}>
                    <circle cx={p.x} cy={p.y} r={4} fill={KIND_COLOURS[p.kind]} stroke="#ffffff" strokeWidth={1.5} />
                    <text x={p.x + 10} y={p.y + 3} fill={labelFill} fontSize={isOutput ? 10.5 : 9.5} fontFamily={isOutput ? 'system-ui, sans-serif' : 'monospace'}>{p.label}</text>
                  </g>
                ))}
                {box.instruction && (
                  <g>
                    <circle cx={box.instruction.x} cy={box.instruction.y} r={4} fill={style.fill} stroke="#ffffff" strokeWidth={1.5} />
                    <text x={box.instruction.x + 10} y={box.instruction.y + 3} fill={labelFill} fontSize={9.5} fontStyle="italic" opacity={0.8} fontFamily="system-ui, sans-serif">
                      instruction
                    </text>
                  </g>
                )}
                {box.outputs.map(p => (
                  <g key={`out-${p.id}`} data-port={`${node.id}:out:${p.id}`}>
                    <circle cx={p.x} cy={p.y} r={4} fill={KIND_COLOURS[p.kind]} stroke="#ffffff" strokeWidth={1.5} />
                    <text x={p.x - 10} y={p.y + 3} textAnchor="end" fill={labelFill} fontSize={9.5} fontFamily="monospace">{p.label}</text>
                  </g>
                ))}
              </g>
            );
          })}

          {/* ── Wire labels, drawn last so nodes do not cover them ───── */}
          {layout.wires.map(route => {
            const lit = wireIsLit(WIRES.get(route.id)!);
            const width = labelWidth(route.label);
            return (
              <g key={`label-${route.id}`} data-wire-label={route.id} style={{ opacity: lit ? 1 : 0.1, pointerEvents: 'none' }}>
                <rect x={route.labelX - width / 2} y={route.labelY - LABEL_HEIGHT / 2} width={width} height={LABEL_HEIGHT} rx={3} fill="#ffffff" opacity={0.9} />
                <text x={route.labelX} y={route.labelY + 3} textAnchor="middle" fill="#475569" fontSize={9} fontFamily="monospace">
                  {route.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* ── Hover/pin info panel ─────────────────────────────────────── */}
      <div className={styles.infoPanel} aria-live="polite">
        {focus?.type === 'node' && (() => {
          const node = NODES.get(focus.id)!;
          const style = NODE_STYLE[node.group];
          return (
            <>
              <span className={styles.infoBadge} style={{ background: style.fill, color: style.text, border: `1px solid ${style.stroke}` }}>
                {node.role === 'agent' ? node.subtitle : `${node.title} · ${node.role === 'input' ? 'what you give' : 'what agents change'}`}
              </span>
              <div className={styles.infoBody}>
                <span className={styles.infoText}>{node.description}</span>
                {node.role !== 'agent' && <span className={styles.infoModel}>{node.subtitle}</span>}
                {node.available && (
                  <span className={styles.infoModel}>{node.available === 'after-draft' ? 'Available after the first draft' : 'Available from the start'}</span>
                )}
                {node.triggers.length > 0 && <span className={styles.infoModel}>Fires on: {node.triggers.join(' · ')}</span>}
                {node.role === 'agent' && <span className={styles.infoModel}>Model: {modelText(node, assignments)}</span>}
              </div>
            </>
          );
        })()}
        {focus?.type === 'wire' && (() => {
          const wire = WIRES.get(focus.id)!;
          return (
            <>
              <span className={styles.infoBadge} style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' }}>
                {wire.from.node}.{wire.from.port} → {wire.to.node}.{wire.to.port}
              </span>
              <div className={styles.infoBody}>
                <span className={styles.infoText}>{wire.when}</span>
              </div>
            </>
          );
        })()}
        {!focus && <span className={styles.infoPlaceholder}>Hover a node or wire to preview · click to pin</span>}
        {pinned && !hovered && <span className={styles.infoPinned}>pinned</span>}
      </div>

      {settingsFor && (
        <AgentSettingsPanel key={settingsFor} agentId={settingsFor} assignments={assignments} onClose={() => setSettingsFor(null)} />
      )}

      {/* ── Legend ──────────────────────────────────────────────────── */}
      <div className={styles.legend}>
        {(Object.entries(NODE_STYLE) as [NodeGroup, typeof NODE_STYLE[NodeGroup]][]).map(([group, style]) => (
          <div key={group} className={styles.legendItem}>
            <span className={styles.legendSwatch} style={{ background: style.fill, borderColor: style.stroke }} />
            <span className={styles.legendLabel}>{style.legendLabel}</span>
          </div>
        ))}
        <div className={styles.legendItem}>
          <span className={styles.legendSwatchDashed} />
          <span className={styles.legendLabel}>Background agent</span>
        </div>
        {(Object.entries(KIND_COLOURS) as [Kind, string][]).map(([kind, colour]) => (
          <div key={kind} className={styles.legendItem}>
            <span className={styles.legendPort} style={{ background: colour }} />
            <span className={styles.legendLabel}>{kind} port</span>
          </div>
        ))}
        <div className={styles.legendItem}>
          <span className={styles.legendPortHollow} />
          <span className={styles.legendLabel}>Instruction set in the Writers&rsquo; Room</span>
        </div>
      </div>
    </div>
  );
}
