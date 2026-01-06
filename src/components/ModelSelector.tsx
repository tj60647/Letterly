/**
 * @file src/components/ModelSelector.tsx
 * @description A dropdown component for selecting the global AI model used for generation.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 *
 * @see Key Concepts: React Props, Event Handling, Form Elements
 */

import React from 'react';
import styles from './ModelSelector.module.css';
import { MODELS } from '@/lib/models';

interface ModelSelectorProps {
    /** The ID of the currently selected model. */
    value: string;
    /** Callback function triggered when a new model is selected. */
    onChange: (value: string) => void;
}

/**
 * A dropdown selector for choosing the primary AI model.
 * 
 * @param {ModelSelectorProps} props - The component props.
 * @returns {JSX.Element} The rendered dropdown component.
 */
export function ModelSelector({ value, onChange }: ModelSelectorProps) {
    return (
        <div className={styles.container}>
            <label className={styles.label}>AI Model</label>
            <div className={styles.selectWrapper}>
                <select
                    className={styles.select}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                >
                    {MODELS.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                </select>
                <div className={styles.icon}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
                </div>
            </div>
        </div>
    );
}
