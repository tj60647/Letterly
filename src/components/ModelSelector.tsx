import React from 'react';
import styles from './ModelSelector.module.css';

interface ModelSelectorProps {
    value: string;
    onChange: (value: string) => void;
}

export const MODELS = [
    { id: 'google/gemini-2.0-flash-exp:free', name: 'Google Gemini 2.0 Flash (Free)' },
    { id: 'google/gemini-exp-1206:free', name: 'Google Gemini Exp 1206 (Free)' },
    { id: 'openai/gpt-4o', name: 'OpenAI GPT-4o' },
    { id: 'anthropic/claude-3.5-sonnet', name: 'Anthropic Claude 3.5 Sonnet' },
    { id: 'meta-llama/llama-3.2-90b-vision-instruct', name: 'Llama 3.2 90B' },
];

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
