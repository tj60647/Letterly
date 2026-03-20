'use client';

/**
 * @file src/components/eval/SystemDiagram.tsx
 * @description SVG-based system diagram showing the roles and relationships
 * of all AI agents in Letterly, including user input entry points and UI outputs.
 */

import React, { useState } from 'react';
import { AGENTS, MODELS } from '@/lib/agent-constants';
import styles from './SystemDiagram.module.css';

// ── Types ─────────────────────────────────────────────────────────────────────

type NodeType = 'user-input' | 'core-agent' | 'detect-agent' | 'embed-agent' | 'image-agent' | 'match-agent' | 'output';

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
  'output':       { fill: '#f0fdf4', stroke: '#16a34a', text: '#15803d', legendLabel: 'UI Output' },
};

// ── Agent ID mapping (diagram node id → AGENTS key) ──────────────────────────

const NODE_TO_AGENT_ID: Record<string, keyof typeof AGENTS> = {
  recommendLength: 'RECOMMEND_LENGTH',
  refine:          'REFINE',
  detectTone:      'DETECT_TONE_REQUEST',
  detectImage:     'DETECT_IMAGE_REQUEST',
  syncNotes:       'SYNC_NOTES',
  generate:        'GENERATE',
  suggest:         'SUGGEST',
  scored:          'SCORED',
  matchSuggestions:'MATCH_SUGGESTIONS',
  matchScorer:     'MATCH_SUGGESTIONS_SCORER',
  image:           'IMAGE',
};

const MODEL_NAMES = Object.fromEntries(MODELS.map(m => [m.id, m.name]));

// ── Node data ─────────────────────────────────────────────────────────────────

const NODES: DiagramNode[] = [
  // User inputs
  {
    id: 'roughNotes', label: 'Rough Notes', sublabel: 'User Input',
    description: 'Your primary source of content — the bullet-point notes you type in the left panel. Sent verbatim to the Draft Generator each time a letter is produced, and used by the Length Analyst and Suggestions agents.',
    type: 'user-input', cx: 90, cy: 100, w: 140, h: 44,
  },
  {
    id: 'userChat', label: 'Chat Feedback', sublabel: 'User Input',
    description: 'The free-text messages you send in the chat panel. Each submission triggers the Refinement Editor and, running in parallel in the background, the Tone Detector, Image Detector, and Suggestion Matcher agents.',
    type: 'user-input', cx: 90, cy: 390, w: 140, h: 44,
  },
  {
    id: 'letterEdit', label: 'Letter Edit', sublabel: 'User Input',
    description: 'Direct edits you make to the generated letter in the center panel. When you save changes, the Notes Sync agent compares the updated letter to your existing rough notes and extracts any new points.',
    type: 'user-input', cx: 90, cy: 680, w: 140, h: 44,
  },

  // Processing column
  {
    id: 'recommendLength', label: 'Length Analyst', sublabel: 'RECOMMEND_LENGTH',
    description: 'Fires automatically in the background each time you generate a draft. Reads your rough notes and returns "Short", "Medium", or "Long" as a suggested length — used as a hint if your length is set to Auto.',
    type: 'core-agent', cx: 320, cy: 100, w: 155, h: 44, background: true,
  },
  {
    id: 'refine', label: 'Refinement Editor', sublabel: 'REFINE',
    description: 'Fires each time you submit a chat message. Reads your message alongside your current rough notes, then updates the notes (adding, removing, or tweaking bullet points) before triggering a new draft generation.',
    type: 'core-agent', cx: 320, cy: 390, w: 155, h: 44,
  },
  {
    id: 'detectTone', label: 'Tone Detector', sublabel: 'DETECT_TONE_REQUEST',
    description: 'Runs silently in the background on every chat submission. Scans your message for tone-change requests (e.g. "make it more formal") and resolves them to a tone name, which is then passed to the Draft Generator.',
    type: 'detect-agent', cx: 320, cy: 500, w: 155, h: 44, background: true,
  },
  {
    id: 'detectImage', label: 'Image Detector', sublabel: 'DETECT_IMAGE_REQUEST',
    description: 'Runs silently in the background on every chat submission. Identifies requests for background illustrations (e.g. "add a rose") and extracts a subject description, which is passed to the Line Art Generator.',
    type: 'detect-agent', cx: 320, cy: 600, w: 155, h: 44, background: true,
  },
  {
    id: 'syncNotes', label: 'Notes Sync', sublabel: 'SYNC_NOTES',
    description: 'Fires when you directly edit the letter text and save your changes. Compares the edited letter to your current rough notes and extracts any new details to keep notes and letter in sync.',
    type: 'core-agent', cx: 320, cy: 690, w: 155, h: 44,
  },

  // Generate — central hub
  {
    id: 'generate', label: 'Draft Generator', sublabel: 'GENERATE',
    description: 'The primary writer. Fires when you click "Generate Draft" and after every chat refinement. Receives your rough notes, tone, length, language, and style settings and produces the full polished letter.',
    type: 'core-agent', cx: 555, cy: 230, w: 155, h: 44,
  },

  // Analysis column
  {
    id: 'suggest', label: 'Suggestions', sublabel: 'SUGGEST',
    description: 'Fires in the background after every draft generation. Reviews the new draft against your original rough notes and surfaces up to three actionable improvement suggestions, shown in the right panel.',
    type: 'core-agent', cx: 760, cy: 160, w: 145, h: 44, background: true,
  },
  {
    id: 'scored', label: 'Similarity Scorer', sublabel: 'SCORED',
    description: 'Fires in the background after every draft generation. Computes a cosine similarity score between your rough notes and the draft letter — the result appears as the Match % in the stats bar below the left panel.',
    type: 'embed-agent', cx: 760, cy: 300, w: 145, h: 44, background: true,
  },

  // Matching column
  {
    id: 'matchSuggestions', label: 'Suggestion Matcher', sublabel: 'MATCH_SUGGESTIONS',
    description: 'Fires in the background on every chat submission. Uses AI reasoning to detect which editor suggestions your message is addressing, so matched suggestions are visually highlighted in the right panel.',
    type: 'match-agent', cx: 950, cy: 130, w: 160, h: 44, background: true,
  },
  {
    id: 'matchScorer', label: 'Suggestion Scorer', sublabel: 'MATCH_SUGGESTIONS_SCORER',
    description: 'Fires in the background on every chat submission. An alternative embedding-based matcher that ranks suggestions by semantic similarity to your chat message as a cross-check to the AI-reasoning matcher.',
    type: 'embed-agent', cx: 950, cy: 250, w: 160, h: 44, background: true,
  },

  // Image output (agent)
  {
    id: 'image', label: 'Line Art Generator', sublabel: 'IMAGE',
    description: 'Fires on-demand when the Image Detector identifies an illustration request in your chat. Generates an intricate black-and-white line-art illustration that appears as a watermark behind the letter.',
    type: 'image-agent', cx: 760, cy: 600, w: 155, h: 44,
  },

  // UI Output sinks
  {
    id: 'outputLetter', label: 'Letter', sublabel: 'Center panel',
    description: 'The finished draft letter rendered in the center panel. Produced by the Draft Generator and editable directly.',
    type: 'output', cx: 1155, cy: 230, w: 120, h: 40,
  },
  {
    id: 'outputSuggestions', label: 'Suggestions', sublabel: 'Right panel',
    description: 'The list of up to three actionable improvement suggestions shown in the right panel, produced by the Suggestions agent.',
    type: 'output', cx: 1155, cy: 160, w: 120, h: 40,
  },
  {
    id: 'outputScore', label: 'Match %', sublabel: 'Stats bar',
    description: 'The completeness percentage shown in the stats bar below the left panel, reflecting how well the letter covers your rough notes.',
    type: 'output', cx: 1155, cy: 300, w: 120, h: 40,
  },
  {
    id: 'outputImage', label: 'Watermark', sublabel: 'Behind letter',
    description: 'The black-and-white line-art illustration shown as a watermark behind the letter in the center panel.',
    type: 'output', cx: 1155, cy: 600, w: 120, h: 40,
  },
];

// ── Edge data ─────────────────────────────────────────────────────────────────

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
  // Agent outputs → UI output sinks
  {
    from: 'generate', to: 'outputLetter',
    label: 'letter',
    path: 'M 633,230 H 1094',
    dashed: true,
  },
  {
    from: 'suggest', to: 'outputSuggestions',
    label: '',
    path: 'M 833,160 H 1094',
    dashed: true,
  },
  {
    from: 'scored', to: 'outputScore',
    label: '',
    path: 'M 833,300 H 1094',
    dashed: true,
  },
  {
    from: 'image', to: 'outputImage',
    label: '',
    path: 'M 838,600 H 1094',
    dashed: true,
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

interface SystemDiagramProps {
  /** Current model assignments from the parent Writers' Room modal. */
  assignments?: Record<string, string>;
}

export function SystemDiagram({ assignments = {} }: SystemDiagramProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [pinnedNode, setPinnedNode] = useState<string | null>(null);

  const nodeById = Object.fromEntries(NODES.map(n => [n.id, n]));

  // Hover takes priority over pin; both fall back to null
  const displayNodeId = hoveredNode ?? pinnedNode;
  const displayInfo = displayNodeId ? nodeById[displayNodeId] : null;

  // Resolve assigned model name for an agent node
  const getModelLabel = (nodeId: string): string | null => {
    const agentKey = NODE_TO_AGENT_ID[nodeId];
    if (!agentKey) return null;
    const agent = AGENTS[agentKey];
    const modelId = assignments[agentKey] || agent.primary;
    return MODEL_NAMES[modelId] || modelId;
  };

  const handleNodeClick = (nodeId: string) => {
    setPinnedNode(prev => (prev === nodeId ? null : nodeId));
  };

  return (
    <div className={styles.diagramWrapper}>
      <div className={styles.diagramIntro}>
        <p>
          Letterly uses multiple AI models working together as a &ldquo;Writers&rsquo; Room.&rdquo; This diagram shows exactly which agents handle your data, when they fire, and what they produce.
          {' '}<strong>Solid borders</strong> run during the main Generate or Chat flow.
          {' '}<strong>Dashed borders</strong> run silently in the background or only when a specific trigger is detected.
          {' '}Green nodes on the right show where each agent&rsquo;s output appears in the UI.
          {' '}<strong>Hover</strong> any node to preview its description, or <strong>click</strong> to pin it.
          Your settings are saved locally in your browser — no data is stored on Letterly&rsquo;s servers beyond the duration of each API call.
        </p>
      </div>

      <div className={styles.diagramScroll}>
        <svg
          viewBox="0 0 1260 740"
          width="1260"
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
            {/* Output arrowhead (green) */}
            <marker id="arrow-output" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <path d="M 0,0 L 8,3 L 0,6 Z" fill="#16a34a" />
            </marker>
          </defs>

          {/* ── Edges ──────────────────────────────────────────────── */}
          {EDGES.map((edge, i) => {
            const toNode = nodeById[edge.to];
            const isOutputEdge = toNode?.type === 'output';
            const stroke = isOutputEdge ? '#16a34a' : (edge.dashed ? '#94a3b8' : '#64748b');
            const markerEnd = isOutputEdge ? 'url(#arrow-output)' : (edge.dashed ? 'url(#arrow-dashed)' : 'url(#arrow)');
            return (
              <g key={i}>
                <path
                  d={edge.path}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={edge.dashed || isOutputEdge ? 1.5 : 2}
                  strokeDasharray={edge.dashed || isOutputEdge ? '5 4' : undefined}
                  markerEnd={markerEnd}
                />
              </g>
            );
          })}

          {/* ── Nodes ──────────────────────────────────────────────── */}
          {NODES.map(node => {
            const style = NODE_STYLE[node.type];
            const isPinned = pinnedNode === node.id;
            const isHovered = hoveredNode === node.id;
            const isHighlighted = isHovered || isPinned;
            const x = node.cx - node.w / 2;
            const y = node.cy - node.h / 2;
            const opacity = node.background ? 0.85 : 1;
            const isOutput = node.type === 'output';

            return (
              <g
                key={node.id}
                style={{ cursor: 'pointer', opacity }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => handleNodeClick(node.id)}
                role="button"
                aria-label={`${node.label}: ${node.description}`}
                aria-pressed={isPinned}
              >
                {/* Shadow/glow on hover or pin */}
                {isHighlighted && (
                  <rect
                    x={x - 3}
                    y={y - 3}
                    width={node.w + 6}
                    height={node.h + 6}
                    rx={9}
                    ry={9}
                    fill="none"
                    stroke={style.stroke}
                    strokeWidth={isPinned ? 2.5 : 2}
                    opacity={isPinned ? 0.6 : 0.4}
                  />
                )}

                {/* Node box */}
                <rect
                  x={x}
                  y={y}
                  width={node.w}
                  height={node.h}
                  rx={isOutput ? 20 : 6}
                  ry={isOutput ? 20 : 6}
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth={isOutput ? 1.5 : (isPinned ? 2 : 1.5)}
                  strokeDasharray={node.background ? '5 3' : undefined}
                />

                {/* Label */}
                <text
                  x={node.cx}
                  y={node.cy - 5}
                  textAnchor="middle"
                  fill={style.text}
                  fontSize={isOutput ? 10 : 11}
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
                  fontFamily={isOutput ? 'system-ui, sans-serif' : 'monospace'}
                >
                  {node.sublabel}
                </text>
              </g>
            );
          })}

          {/* ── Section labels ─────────────────────────────────────── */}
          {[
            { x: 90,   label: 'USER' },
            { x: 320,  label: 'PROCESSING' },
            { x: 555,  label: 'GENERATION' },
            { x: 760,  label: 'ANALYSIS' },
            { x: 950,  label: 'MATCHING' },
            { x: 1155, label: 'OUTPUT' },
          ].map(({ x, label }) => (
            <text key={label} x={x} y={18} textAnchor="middle" fill="#94a3b8" fontSize={10} fontWeight="600" fontFamily="system-ui, sans-serif" letterSpacing="0.08em">
              {label}
            </text>
          ))}

          {/* ── Column dividers ────────────────────────────────────── */}
          {[200, 430, 650, 850, 1060].map(divX => (
            <line key={divX} x1={divX} y1={25} x2={divX} y2={715} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4 4" />
          ))}
        </svg>
      </div>

      {/* ── Hover/pin info panel ─────────────────────────────────────── */}
      <div className={styles.infoPanel} aria-live="polite">
        {displayInfo ? (
          <>
            <span className={styles.infoBadge} style={{ background: NODE_STYLE[displayInfo.type].fill, color: NODE_STYLE[displayInfo.type].text, border: `1px solid ${NODE_STYLE[displayInfo.type].stroke}` }}>
              {displayInfo.sublabel}
            </span>
            <div className={styles.infoBody}>
              <span className={styles.infoText}>{displayInfo.description}</span>
              {getModelLabel(displayInfo.id) && (
                <span className={styles.infoModel}>Model: {getModelLabel(displayInfo.id)}</span>
              )}
            </div>
            {pinnedNode === displayInfo.id && !hoveredNode && (
              <span className={styles.infoPinned}>pinned</span>
            )}
          </>
        ) : (
          <span className={styles.infoPlaceholder}>Hover to preview · click to pin</span>
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
