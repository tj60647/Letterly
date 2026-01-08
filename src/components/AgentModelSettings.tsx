/**
 * @file src/components/AgentModelSettings.tsx
 * @description A modal UI component that allows users to assign specific AI models to individual agents in the system (e.g., Tone Detector, Critic).
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 *
 * @see Key Concepts: State Management, Modal Dialogs, Configuration UI
 */

import React, { useState } from 'react';
import { AGENTS, MODELS } from '@/lib/agent-constants';
import { SettingsIcon } from './ui/icons';
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
    /** Current mapping of agent IDs to custom instructions. */
    customInstructions: Record<string, string>;
    /** Callback function when a custom instruction is changed. */
    onInstructionChange: (agentId: string, instruction: string) => void;
}

/**
 * A modal dialog that allows sophisticated users to configure which AI model powers each specific agent.
 * 
 * @param {AgentModelSettingsProps} props - The component props.
 * @returns {JSX.Element | null} The rendered modal or null if not open.
 */
export function AgentModelSettings({ 
    isOpen, 
    onClose, 
    assignments, 
    onAssignmentChange,
    customInstructions,
    onInstructionChange 
}: AgentModelSettingsProps) {
    const [editingAgent, setEditingAgent] = useState<string | null>(null);
    const [editedInstruction, setEditedInstruction] = useState<string>('');

    if (!isOpen) return null;

    // Filter out hidden agents from the UI
    const agentsToList = Object.values(AGENTS).filter(agent => !('hidden' in agent) || !agent.hidden);

    const handleEditClick = (agentId: string) => {
        const agent = AGENTS[agentId as keyof typeof AGENTS];
        const currentInstruction = customInstructions[agentId] || agent.systemInstruction;
        setEditedInstruction(currentInstruction);
        setEditingAgent(agentId);
    };

    const handleSave = (agentId: string) => {
        onInstructionChange(agentId, editedInstruction);
        setEditingAgent(null);
        setEditedInstruction('');
    };

    const handleCancel = () => {
        setEditingAgent(null);
        setEditedInstruction('');
    };

    const handleReset = (agentId: string) => {
        const agent = AGENTS[agentId as keyof typeof AGENTS];
        // Delete the custom instruction by setting it to undefined (we'll filter this out)
        // Actually, we need to communicate removal to parent. Let's use empty string as a signal.
        // Better: pass the default back or have a separate reset handler
        // For simplicity, we'll just set it back to the default
        onInstructionChange(agentId, agent.systemInstruction);
        setEditingAgent(null);
        setEditedInstruction('');
    };

    const isModified = (agentId: string) => {
        return customInstructions[agentId] !== undefined && 
               customInstructions[agentId] !== AGENTS[agentId as keyof typeof AGENTS].systemInstruction;
    };

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
                            const isEditing = editingAgent === agent.id;
                            const modified = isModified(agent.id);
                            const displayInstruction = customInstructions[agent.id] || agent.systemInstruction;

                            return (
                                <div key={agent.id} className={`${styles.row} ${modified ? styles.modified : ''}`}>
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
                                        <div className={styles.instructionHeader}>
                                            {modified ? (
                                                <div className={styles.modifiedLabel}>
                                                    ✓ Custom Instructions
                                                </div>
                                            ) : (
                                                <div className={styles.defaultLabel}>
                                                    Default Instructions
                                                </div>
                                            )}
                                            {isEditing && (
                                                <div className={styles.buttonGroup}>
                                                    <button 
                                                        className={styles.saveButton}
                                                        onClick={() => handleSave(agent.id)}
                                                    >
                                                        Save
                                                    </button>
                                                    <button 
                                                        className={styles.cancelButton}
                                                        onClick={handleCancel}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button 
                                                        className={styles.resetButton}
                                                        onClick={() => handleReset(agent.id)}
                                                    >
                                                        ↺ Reset
                                                    </button>
                                                </div>
                                            )}
                                            {!isEditing && modified && (
                                                <button 
                                                    className={styles.resetBadgeButton}
                                                    onClick={() => handleReset(agent.id)}
                                                    title="Reset to default"
                                                >
                                                    ↺ Reset
                                                </button>
                                            )}
                                            <button 
                                                className={`${styles.gearButton} ${modified ? styles.gearActive : ''}`}
                                                onClick={() => isEditing ? handleCancel() : handleEditClick(agent.id)}
                                                title={isEditing ? "Close editor" : "Edit instruction"}
                                            >
                                                <SettingsIcon />
                                            </button>
                                        </div>
                                        {!isEditing ? (
                                            <div className={styles.systemInstructions}>
                                                {displayInstruction}
                                            </div>
                                        ) : (
                                            <div className={styles.editMode}>
                                                <textarea
                                                    className={styles.textarea}
                                                    value={editedInstruction}
                                                    onChange={(e) => setEditedInstruction(e.target.value)}
                                                    rows={8}
                                                />
                                            </div>
                                        )}
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
