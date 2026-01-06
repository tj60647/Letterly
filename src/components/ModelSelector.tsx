import React from 'react';
import styles from './ModelSelector.module.css';
import { MODELS } from '@/lib/models';

interface ModelSelectorProps {
    value: string;
    onChange: (value: string) => void;
}

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
