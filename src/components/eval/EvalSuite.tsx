'use client';

/**
 * @file src/components/eval/EvalSuite.tsx
 * @description Main container for the Agent Eval Suite. Provides header navigation,
 * tabbed interface for Comparison, Playground, and Batch modes.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BeakerIcon, ArrowLeftIcon, DownloadIcon } from '@/components/ui/icons';
import { ComparisonMode } from './ComparisonMode';
import { PlaygroundMode } from './PlaygroundMode';
import { BatchMode } from './BatchMode';
import styles from './EvalSuite.module.css';

type Tab = 'comparison' | 'playground' | 'batch';

const TABS: { id: Tab; label: string }[] = [
  { id: 'comparison', label: 'Comparison' },
  { id: 'playground', label: 'Playground' },
  { id: 'batch', label: 'Batch' },
];

export function EvalSuite() {
  const [activeTab, setActiveTab] = useState<Tab>('comparison');

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Signal child components to close any open modals (noop here, passed via context if needed)
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleExport = () => {
    const info = {
      exportedAt: new Date().toISOString(),
      note: 'Export individual run results from Batch mode.',
    };
    const blob = new Blob([JSON.stringify(info, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eval-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.evalSuite}>
      {/* Header */}
      <header className={styles.evalHeader}>
        <div className={styles.evalHeaderLeft}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeftIcon />
            Back to Letterly
          </Link>
          <span className={styles.headerDivider}>/</span>
          <h1 className={styles.evalTitle}>
            <BeakerIcon />
            Agent Eval Suite
          </h1>
        </div>
        <div className={styles.evalHeaderActions}>
          <button className={styles.secondaryButton} onClick={handleExport}>
            <DownloadIcon />
            Export
          </button>
        </div>
      </header>

      {/* Tab Bar */}
      <nav className={styles.tabBar}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'comparison' && <ComparisonMode />}
        {activeTab === 'playground' && <PlaygroundMode />}
        {activeTab === 'batch' && <BatchMode />}
      </div>
    </div>
  );
}
