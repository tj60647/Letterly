/**
 * @file src/components/AgentModelSettings.tsx
 * @description A modal UI component that allows users to assign specific AI models to individual agents in the system (e.g., Tone Detector, Critic).
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 *
 * @see Key Concepts: State Management, Modal Dialogs, Configuration UI
 */

import React from 'react';
import { AGENTS, MODELS } from '@/lib/agent-constants';
import styles from './AgentModelSettings.module.css';

interface AgentModelSettingsProps {
    /** Whether the modal is currently visible. */
    isOpen: boolean;
    /** Callback function to close the modal. */
    onClose: () => void;
    /** Current mapping of agent IDs to model IDs. */
    assignments: Record<string, string>;
    /** Callback function when a model assignment is changed. */
    onAssignmentChange: (agentId: string, modelId: string) => void;
}

/**
 * A modal dialog that allows sophisticated users to configure which AI model powers each specific agent.
 * 
 * @param {AgentModelSettingsProps} props - The component props.
 * @returns {JSX.Element | null} The rendered modal or null if not open.
 */
export function AgentModelSettings({ isOpen, onClose, assignments, onAssignmentChange }: AgentModelSettingsProps) {
    if (!isOpen) return null;

    // Filter out hidden agents from the UI
    const agentsToList = Object.values(AGENTS).filter(agent => !('hidden' in agent) || !agent.hidden);

    return (
        <div className={styles.overlay} onClick={(e) => {
            // Close on overlay click
            if (e.target === e.currentTarget) onClose();
        }}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2>Writers&apos; Room Agents</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>
                <div className={styles.content}>
                    <div className={styles.headerRow}>
                        <div className={styles.leftHeader}>Agent</div>
                        <div className={styles.rightHeader}>System Instructions</div>
                    </div>
                    <div className={styles.agentList}>
                        {agentsToList.map((agent) => {
                            // Filter models based on agent type (chat vs embedding)
                            // If agent has no type defined (legacy), assume chat ? Or check defaults.
                            // But we just added types to all agents.
                            const compatibleModels = MODELS.filter(m => m.type === agent.type);

                            return (
                                <div key={agent.id} className={styles.row}>
                                    <div className={styles.leftColumn}>
                                        <label className={styles.label}>{agent.name}</label>
                                        <select
                                            className={styles.select}
                                            value={assignments[agent.id] || agent.primary}
                                            onChange={(e) => onAssignmentChange(agent.id, e.target.value)}
                                        >
                                            {compatibleModels.map(m => (
                                                <option key={m.id} value={m.id}>{m.name}</option>
                                            ))}
                                        </select>
                                        <span className={styles.subtext}>
                                            {agent.description}
                                        </span>
                                    </div>
                                    <div className={styles.rightColumn}>
                                        <div className={styles.systemInstructions}>
                                            {agent.systemInstruction}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
