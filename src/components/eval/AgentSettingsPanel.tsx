'use client';

/**
 * @file src/components/eval/AgentSettingsPanel.tsx
 * @description A side panel, opened from an agent's gear in the System Diagram, showing and editing that agent's settings.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 *
 * @see Key Concepts: Dialogs, Browser Storage, System Instructions
 *
 * The instruction is saved to the same browser storage the Writers' Room uses (src/lib/custom-instructions.ts).
 * It can be edited only where an edit actually reaches the model; otherwise the panel shows it read-only and says why.
 */

import React, { useEffect, useRef, useState } from 'react';
import { AGENTS, MODELS } from '@/lib/agent-constants';
import { LETTERLY_FLOW } from '@/lib/agent-flow';
import { loadCustomInstructions, saveCustomInstruction } from '@/lib/custom-instructions';
import styles from './SystemDiagram.module.css';

type AgentId = keyof typeof AGENTS;

const MODEL_NAMES = Object.fromEntries(MODELS.map(m => [m.id, m.name]));

interface AgentSettingsPanelProps {
  agentId: string;
  /** Model assignments from the Writers' Room, where they are available. */
  assignments: Record<string, string>;
  onClose: () => void;
}

export function AgentSettingsPanel({ agentId, assignments, onClose }: AgentSettingsPanelProps) {
  const agent = AGENTS[agentId as AgentId];
  const node = LETTERLY_FLOW.nodes.find(n => n.id === agentId)!;
  const [custom, setCustom] = useState<string | undefined>(() => loadCustomInstructions()[agentId]);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  const defaultInstruction = agent.systemInstruction;
  const isCustom = custom !== undefined && custom !== defaultInstruction;
  const shown = editing ? draft : custom ?? defaultInstruction;

  const model = node.modelFrom
    ? `model of ${AGENTS[node.modelFrom as AgentId].name}`
    : MODEL_NAMES[assignments[agentId] || agent.primary] || assignments[agentId] || agent.primary;

  const startEditing = () => {
    setDraft(custom ?? defaultInstruction);
    setEditing(true);
  };

  const save = () => {
    const next = draft === defaultInstruction ? null : draft;
    saveCustomInstruction(agentId, next);
    setCustom(next ?? undefined);
    setEditing(false);
  };

  const reset = () => {
    saveCustomInstruction(agentId, null);
    setCustom(undefined);
    setEditing(false);
  };

  return (
    <div
      className={styles.settingsPanel}
      role="dialog"
      aria-label={`${agent.name} settings`}
      onKeyDown={e => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div className={styles.settingsHeader}>
        <div>
          <h3 className={styles.settingsTitle}>{agent.name}</h3>
          <span className={styles.settingsId}>{agentId}</span>
        </div>
        <button ref={closeRef} type="button" className={styles.settingsClose} aria-label="Close settings" onClick={onClose}>
          ×
        </button>
      </div>

      <p className={styles.settingsDescription}>{agent.description}</p>

      <dl className={styles.settingsList}>
        <dt>Model</dt>
        <dd>
          <span>{model}</span>
          {!node.modelFrom && !assignments[agentId] && (
            <span className={styles.settingsMuted}>Default. Model choices made in the Writers&rsquo; Room aren&rsquo;t saved across pages yet.</span>
          )}
        </dd>
        <dt>Fires on</dt>
        <dd>
          <ul className={styles.settingsBullets}>
            {node.triggers.map(t => <li key={t}>{t}</li>)}
          </ul>
        </dd>
        <dt>Inputs</dt>
        <dd>
          <ul className={styles.settingsBullets}>
            {Object.entries(agent.inputSchema).map(([field, about]) => (
              <li key={field}><code>{field}</code>: {String(about)}</li>
            ))}
          </ul>
        </dd>
        <dt>Output</dt>
        <dd>{agent.outputDescription}</dd>
      </dl>

      <div className={styles.settingsInstructionHeader}>
        <h4>System instruction</h4>
        <span className={isCustom ? styles.settingsBadgeCustom : styles.settingsBadgeDefault}>{isCustom ? 'Custom' : 'Default'}</span>
      </div>
      <textarea
        className={styles.settingsTextarea}
        aria-label="System instruction"
        value={shown}
        readOnly={!editing}
        onChange={e => setDraft(e.target.value)}
        rows={12}
      />

      {node.instructionPort ? (
        <div className={styles.settingsActions}>
          {editing ? (
            <>
              <button type="button" className={styles.settingsPrimary} onClick={save}>Save</button>
              <button type="button" className={styles.settingsSecondary} onClick={() => setEditing(false)}>Cancel</button>
            </>
          ) : (
            <button type="button" className={styles.settingsPrimary} onClick={startEditing}>Edit</button>
          )}
          {isCustom && (
            <button type="button" className={styles.settingsSecondary} onClick={reset}>Reset to default</button>
          )}
        </div>
      ) : (
        <p className={styles.settingsNote}>{node.instructionNote}</p>
      )}
    </div>
  );
}
