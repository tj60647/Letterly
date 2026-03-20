'use client';

/**
 * @file src/components/eval/SystemDiagram.tsx
 * @description SVG-based system diagram showing the roles and relationships
 * of all AI agents in Letterly, including user input entry points.
 */

import React, { useState } from 'react';
import styles from './SystemDiagram.module.css';

// ── Types ─────────────────────────────────────────────────────────────────────

type NodeType = 'user-input' | 'core-agent' | 'detect-agent' | 'embed-agent' | 'image-agent' | 'match-agent';

interface DiagramNode {
  id: string;
  label: string;
  sublabel: string;
  description: string;
  type: NodeType;
  cx: number;
  cy: number;
  w: number;
  h: number;
  background?: boolean;
}

interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
  path: string;
}

// ── Color scheme ──────────────────────────────────────────────────────────────

const NODE_STYLE: Record<NodeType, { fill: string; stroke: string; text: string; legendLabel: string }> = {
  'user-input':   { fill: '#1d4ed8', stroke: '#1e40af', text: '#ffffff', legendLabel: 'User Input' },
  'core-agent':   { fill: '#7c3aed', stroke: '#6d28d9', text: '#ffffff', legendLabel: 'Core Writing Agent' },
  'detect-agent': { fill: '#b45309', stroke: '#92400e', text: '#ffffff', legendLabel: 'Detection Agent' },
  'embed-agent':  { fill: '#0f766e', stroke: '#115e59', text: '#ffffff', legendLabel: 'Embedding Agent' },
  'image-agent':  { fill: '#be185d', stroke: '#9d174d', text: '#ffffff', legendLabel: 'Image Agent' },
  'match-agent':  { fill: '#0369a1', stroke: '#075985', text: '#ffffff', legendLabel: 'Matching Agent' },
};

// ── Node data ─────────────────────────────────────────────────────────────────

const NODES: DiagramNode[] = [
  // User inputs
  {
    id: 'roughNotes', label: 'Rough Notes', sublabel: 'User Input',
    description: 'The user\'s bullet-point notes — the primary content source for every letter draft.',
    type: 'user-input', cx: 90, cy: 100, w: 140, h: 44,
  },
  {
    id: 'userChat', label: 'Chat Feedback', sublabel: 'User Input',
    description: 'Free-text messages the user sends in the chat panel to refine or extend the draft.',
    type: 'user-input', cx: 90, cy: 390, w: 140, h: 44,
  },
  {
    id: 'letterEdit', label: 'Letter Edit', sublabel: 'User Input',
    description: 'Direct in-place edits the user makes to the generated letter text.',
    type: 'user-input', cx: 90, cy: 680, w: 140, h: 44,
  },

  // Processing column
  {
    id: 'recommendLength', label: 'Length Analyst', sublabel: 'RECOMMEND_LENGTH',
    description: 'Analyzes the complexity of rough notes and recommends Short, Medium, or Long as the ideal letter length.',
    type: 'core-agent', cx: 320, cy: 100, w: 155, h: 44, background: true,
  },
  {
    id: 'refine', label: 'Refinement Editor', sublabel: 'REFINE',
    description: 'Updates the rough notes based on chat feedback — adds, removes, or tweaks bullet points without touching tone.',
    type: 'core-agent', cx: 320, cy: 390, w: 155, h: 44,
  },
  {
    id: 'detectTone', label: 'Tone Detector', sublabel: 'DETECT_TONE_REQUEST',
    description: 'Scans each chat message to detect tone-change requests (e.g. "make it more formal") and resolves them to a tone name.',
    type: 'detect-agent', cx: 320, cy: 500, w: 155, h: 44, background: true,
  },
  {
    id: 'detectImage', label: 'Image Detector', sublabel: 'DETECT_IMAGE_REQUEST',
    description: 'Identifies requests for background illustrations in chat messages and extracts a subject description.',
    type: 'detect-agent', cx: 320, cy: 600, w: 155, h: 44, background: true,
  },
  {
    id: 'syncNotes', label: 'Notes Sync', sublabel: 'SYNC_NOTES',
    description: 'Compares a manually-edited letter to the current rough notes and extracts any new points to keep them in sync.',
    type: 'core-agent', cx: 320, cy: 690, w: 155, h: 44,
  },

  // Generate — central hub
  {
    id: 'generate', label: 'Draft Generator', sublabel: 'GENERATE',
    description: 'The primary writer. Consumes rough notes, tone, length, language, and style settings to produce the full polished letter.',
    type: 'core-agent', cx: 555, cy: 230, w: 155, h: 44,
  },

  // Analysis column
  {
    id: 'suggest', label: 'Suggestions', sublabel: 'SUGGEST',
    description: 'Reviews the draft against the original notes to surface up to three actionable improvements.',
    type: 'core-agent', cx: 760, cy: 160, w: 145, h: 44, background: true,
  },
  {
    id: 'scored', label: 'Similarity Scorer', sublabel: 'SCORED',
    description: 'Calculates a cosine-similarity score between the rough notes and the generated letter to measure content alignment.',
    type: 'embed-agent', cx: 760, cy: 300, w: 145, h: 44, background: true,
  },

  // Matching column
  {
    id: 'matchSuggestions', label: 'Suggestion Matcher', sublabel: 'MATCH_SUGGESTIONS',
    description: 'Uses LLM reasoning to detect which editor suggestions a chat message is addressing.',
    type: 'match-agent', cx: 950, cy: 130, w: 160, h: 44, background: true,
  },
  {
    id: 'matchScorer', label: 'Suggestion Scorer', sublabel: 'MATCH_SUGGESTIONS_SCORER',
    description: 'Alternative embedding-based matcher; ranks suggestions by semantic similarity to the chat message.',
    type: 'embed-agent', cx: 950, cy: 250, w: 160, h: 44, background: true,
  },

  // Image output
  {
    id: 'image', label: 'Line Art Generator', sublabel: 'IMAGE',
    description: 'Generates an intricate black-and-white line-art illustration used as a watermark behind the letter.',
    type: 'image-agent', cx: 760, cy: 600, w: 155, h: 44,
  },
];

// ── Edge data ─────────────────────────────────────────────────────────────────
// Paths are SVG path-data strings. Arrows are drawn at the endpoint (see marker-end below).

const EDGES: DiagramEdge[] = [
  // roughNotes → recommendLength (horizontal)
  {
    from: 'roughNotes', to: 'recommendLength',
    label: 'notes',
    path: 'M 160,100 H 242',
  },
  // roughNotes → generate via top arc (bypasses recommendLength row)
  {
    from: 'roughNotes', to: 'generate',
    label: 'content',
    path: 'M 90,78 C 90,28 477,28 477,208',
    dashed: false,
  },
  // recommendLength → generate
  {
    from: 'recommendLength', to: 'generate',
    label: 'length',
    path: 'M 397,100 C 440,100 440,214 477,214',
    dashed: true,
  },
  // generate → suggest (right+up)
  {
    from: 'generate', to: 'suggest',
    label: 'draft',
    path: 'M 632,218 C 660,218 660,160 682,160',
    dashed: true,
  },
  // generate → scored (right+down)
  {
    from: 'generate', to: 'scored',
    label: 'draft',
    path: 'M 632,242 C 660,242 660,300 682,300',
    dashed: true,
  },
  // suggest → matchSuggestions
  {
    from: 'suggest', to: 'matchSuggestions',
    label: 'suggestions',
    path: 'M 832,148 C 862,148 862,130 869,130',
    dashed: true,
  },
  // suggest → matchScorer
  {
    from: 'suggest', to: 'matchScorer',
    label: 'suggestions',
    path: 'M 832,172 C 862,172 862,250 869,250',
    dashed: true,
  },
  // userChat → matchSuggestions (also receives chat input, routed via top)
  {
    from: 'userChat', to: 'matchSuggestions',
    label: 'chat msg',
    path: 'M 160,368 C 160,50 869,50 869,108',
    dashed: true,
  },
  // userChat → refine (horizontal)
  {
    from: 'userChat', to: 'refine',
    label: 'feedback',
    path: 'M 160,390 H 242',
  },
  // userChat → detectTone
  {
    from: 'userChat', to: 'detectTone',
    label: 'message',
    path: 'M 160,412 C 200,412 200,500 242,500',
    dashed: true,
  },
  // userChat → detectImage
  {
    from: 'userChat', to: 'detectImage',
    label: 'message',
    path: 'M 140,412 C 180,412 180,600 242,600',
    dashed: true,
  },
  // refine → generate (right+up)
  {
    from: 'refine', to: 'generate',
    label: 'updated notes',
    path: 'M 397,378 C 440,378 440,225 477,225',
  },
  // detectTone → generate (right+up, dashed)
  {
    from: 'detectTone', to: 'generate',
    label: 'tone',
    path: 'M 397,492 C 460,492 460,235 477,235',
    dashed: true,
  },
  // detectImage → image (horizontal)
  {
    from: 'detectImage', to: 'image',
    label: 'subject',
    path: 'M 397,600 H 682',
    dashed: true,
  },
  // letterEdit → syncNotes (horizontal)
  {
    from: 'letterEdit', to: 'syncNotes',
    label: 'edits',
    path: 'M 160,690 H 242',
  },
  // syncNotes → generate (routes right+up along x≈480)
  {
    from: 'syncNotes', to: 'generate',
    label: 'synced notes',
    path: 'M 397,680 C 490,680 555,500 555,252',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function SystemDiagram() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const nodeById = Object.fromEntries(NODES.map(n => [n.id, n]));
  const hoveredInfo = hoveredNode ? nodeById[hoveredNode] : null;

  return (
    <div className={styles.diagramWrapper}>
      <div className={styles.diagramIntro}>
        <p>
          This diagram shows every agent in the Letterly &ldquo;Writers&rsquo; Room&rdquo;, their roles, and how they connect.
          <strong> Solid borders</strong> indicate agents that run as part of the main request flow;
          <strong> dashed borders</strong> indicate agents that run in the background or on-demand.
          Hover a node to see its description.
        </p>
      </div>

      <div className={styles.diagramScroll}>
        <svg
          viewBox="0 0 1060 740"
          width="1060"
          height="740"
          className={styles.svg}
          aria-label="Letterly agent system diagram"
          role="img"
        >
          <defs>
            {/* Solid arrowhead */}
            <marker id="arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <path d="M 0,0 L 8,3 L 0,6 Z" fill="#64748b" />
            </marker>
            {/* Dashed arrowhead (lighter) */}
            <marker id="arrow-dashed" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <path d="M 0,0 L 8,3 L 0,6 Z" fill="#94a3b8" />
            </marker>
          </defs>

          {/* ── Edges ──────────────────────────────────────────────── */}
          {EDGES.map((edge, i) => (
            <g key={i}>
              <path
                d={edge.path}
                fill="none"
                stroke={edge.dashed ? '#94a3b8' : '#64748b'}
                strokeWidth={edge.dashed ? 1.5 : 2}
                strokeDasharray={edge.dashed ? '5 4' : undefined}
                markerEnd={edge.dashed ? 'url(#arrow-dashed)' : 'url(#arrow)'}
              />
            </g>
          ))}

          {/* ── Nodes ──────────────────────────────────────────────── */}
          {NODES.map(node => {
            const style = NODE_STYLE[node.type];
            const isHovered = hoveredNode === node.id;
            const x = node.cx - node.w / 2;
            const y = node.cy - node.h / 2;
            const opacity = node.background ? 0.85 : 1;

            return (
              <g
                key={node.id}
                style={{ cursor: 'pointer', opacity }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                role="button"
                aria-label={`${node.label}: ${node.description}`}
              >
                {/* Shadow/glow on hover */}
                {isHovered && (
                  <rect
                    x={x - 3}
                    y={y - 3}
                    width={node.w + 6}
                    height={node.h + 6}
                    rx={9}
                    ry={9}
                    fill="none"
                    stroke={style.fill}
                    strokeWidth={2}
                    opacity={0.4}
                  />
                )}

                {/* Node box */}
                <rect
                  x={x}
                  y={y}
                  width={node.w}
                  height={node.h}
                  rx={6}
                  ry={6}
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth={1.5}
                  strokeDasharray={node.background ? '5 3' : undefined}
                />

                {/* Label */}
                <text
                  x={node.cx}
                  y={node.cy - 5}
                  textAnchor="middle"
                  fill={style.text}
                  fontSize={11}
                  fontWeight="600"
                  fontFamily="system-ui, sans-serif"
                >
                  {node.label}
                </text>

                {/* Sublabel */}
                <text
                  x={node.cx}
                  y={node.cy + 9}
                  textAnchor="middle"
                  fill={style.text}
                  fontSize={8.5}
                  opacity={0.8}
                  fontFamily="monospace"
                >
                  {node.sublabel}
                </text>
              </g>
            );
          })}

          {/* ── Section labels ─────────────────────────────────────── */}
          <text x="90" y="18" textAnchor="middle" fill="#94a3b8" fontSize={10} fontWeight="600" fontFamily="system-ui, sans-serif" letterSpacing="0.08em">
            USER
          </text>
          <text x="320" y="18" textAnchor="middle" fill="#94a3b8" fontSize={10} fontWeight="600" fontFamily="system-ui, sans-serif" letterSpacing="0.08em">
            PROCESSING
          </text>
          <text x="555" y="18" textAnchor="middle" fill="#94a3b8" fontSize={10} fontWeight="600" fontFamily="system-ui, sans-serif" letterSpacing="0.08em">
            GENERATION
          </text>
          <text x="760" y="18" textAnchor="middle" fill="#94a3b8" fontSize={10} fontWeight="600" fontFamily="system-ui, sans-serif" letterSpacing="0.08em">
            ANALYSIS
          </text>
          <text x="950" y="18" textAnchor="middle" fill="#94a3b8" fontSize={10} fontWeight="600" fontFamily="system-ui, sans-serif" letterSpacing="0.08em">
            MATCHING
          </text>

          {/* ── Column dividers ────────────────────────────────────── */}
          {[200, 430, 650, 850].map(divX => (
            <line key={divX} x1={divX} y1={25} x2={divX} y2={715} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4 4" />
          ))}
        </svg>
      </div>

      {/* ── Hover info panel ────────────────────────────────────────── */}
      <div className={styles.infoPanel} aria-live="polite">
        {hoveredInfo ? (
          <>
            <span className={styles.infoBadge} style={{ background: NODE_STYLE[hoveredInfo.type].fill }}>
              {hoveredInfo.sublabel}
            </span>
            <span className={styles.infoText}>{hoveredInfo.description}</span>
          </>
        ) : (
          <span className={styles.infoPlaceholder}>Hover a node to see its description</span>
        )}
      </div>

      {/* ── Legend ──────────────────────────────────────────────────── */}
      <div className={styles.legend}>
        {(Object.entries(NODE_STYLE) as [NodeType, typeof NODE_STYLE[NodeType]][]).map(([type, style]) => (
          <div key={type} className={styles.legendItem}>
            <span className={styles.legendSwatch} style={{ background: style.fill, borderColor: style.stroke }} />
            <span className={styles.legendLabel}>{style.legendLabel}</span>
          </div>
        ))}
        <div className={styles.legendItem}>
          <span className={styles.legendSwatchDashed} />
          <span className={styles.legendLabel}>Background / on-demand</span>
        </div>
      </div>
    </div>
  );
}
