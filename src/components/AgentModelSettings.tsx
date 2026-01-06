import React from 'react';
import { AGENTS, MODELS } from '@/lib/agent-constants';
import styles from './AgentModelSettings.module.css';

interface AgentModelSettingsProps {
    isOpen: boolean;
    onClose: () => void;
    assignments: Record<string, string>;
    onAssignmentChange: (agentId: string, modelId: string) => void;
}

export function AgentModelSettings({ isOpen, onClose, assignments, onAssignmentChange }: AgentModelSettingsProps) {
    if (!isOpen) return null;

    // Filter out SCORED from the UI if we don't want users changing the embedding model (usually risky)
    // But user asked for it ("Scored"), so we keep it.
    const agentsToList = Object.values(AGENTS);

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
    );
};
