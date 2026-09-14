'use client';

/**
 * @file src/components/eval/EvalSuite.tsx
 * @description Main container for the Agent Eval Suite. Provides header navigation,
 * tabbed interface for Comparison, Playground, Batch, and System Diagram.
 */

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BeakerIcon, ArrowLeftIcon, DownloadIcon, InfoIcon, TeamIcon, DiagramIcon } from '@/components/ui/icons';
import { ComparisonMode } from './ComparisonMode';
import { PlaygroundMode } from './PlaygroundMode';
import { BatchMode } from './BatchMode';
import { SystemDiagram } from './SystemDiagram';
import { usableEditCount } from '@/lib/eval-instructions';
import styles from './EvalSuite.module.css';

type Tab = 'comparison' | 'playground' | 'batch' | 'diagram';

const TABS: { id: Tab; label: string; headline: string; summary: string; helpTitle: string; helpBody: string[] }[] = [
  {
    id: 'comparison',
    label: 'Comparison',
    headline: 'Single-Test Validation',
    summary: 'Run one test at a time, compare output quality, and validate assertions with immediate pass/fail feedback.',
    helpTitle: 'How To Use Comparison Mode',
    helpBody: [
      'Use this tab when you want to quickly validate one behavior in isolation, such as tone adherence, required details, or output format.',
      'Start by selecting a predefined test or choosing an agent manually. Then provide either plain-text prompt input or structured JSON in Advanced JSON Mode.',
      'Add assertions that define what success means. Assertions can check that text contains or excludes required language, that length falls in a range, that output matches a regex pattern, that the output is valid JSON, or that it is a JSON list with a count in range.',
      'Run the test and review both the output and assertion results. Use this mode as your fastest loop for prompt tuning and targeted debugging.'
    ],
  },
  {
    id: 'playground',
    label: 'Playground',
    headline: 'Multi-Step Workflow Exploration',
    summary: 'Build and run chained agent flows, inspect each step, and collect timeline observations for iterative experimentation.',
    helpTitle: 'How To Use Playground Mode',
    helpBody: [
      'Use this tab when you want to evaluate handoffs between agents instead of isolated calls. It is ideal for full workflow checks and exploratory testing.',
      'Load a scenario to start quickly, or add custom steps by choosing an agent and supplying prompt input for that step. Steps run in sequence and render as a visual timeline. Write {{step-N}} inside a quoted value to pass step N’s output to a later step.',
      'Watch each step for status, latency, output, and errors. If one step fails, your timeline still captures where and why, making chain-level diagnosis straightforward.',
      'Use the observations panel to capture findings while testing. This creates a lightweight research log you can revisit while refining prompts and test definitions.'
    ],
  },
  {
    id: 'batch',
    label: 'Batch',
    headline: 'Suite-Level Regression Runs',
    summary: 'Execute complete suites, monitor progress across agents, and review grouped pass/fail results with exportable summaries.',
    helpTitle: 'How To Use Batch Mode',
    helpBody: [
      'Use this tab when you need broad confidence before shipping prompt or model changes. Batch mode runs many tests and highlights regressions quickly.',
      'Select a suite, run all tests, and follow progress while results stream in. Outcomes are grouped by agent so you can identify concentrated failure areas.',
      'Expand a failed test row to inspect assertion-level diagnostics and actual output excerpts. This helps you understand whether failures are format, content, or model-quality issues.',
      'Export run data to JSON for archival, handoff, or later analysis. Use recent run history to compare stability and pass-rate trends over time.'
    ],
  },
  {
    id: 'diagram',
    label: 'System Diagram',
    headline: 'Agent Architecture Overview',
    summary: 'See every AI agent in the Writers\u2019 Room, when each one fires, what data it receives, and where its output appears in the UI.',
    helpTitle: '',
    helpBody: [],
  },
];

/** Re-reads saved edits when another browser tab changes them. */
function subscribeToStorage(onChange: () => void) {
  window.addEventListener('storage', onChange);
  return () => window.removeEventListener('storage', onChange);
}

export function EvalSuite() {
  // Open the tab named in ?tab= (for example /eval?tab=diagram), so other pages can link straight to it.
  const requestedTab = useSearchParams().get('tab');
  const [activeTab, setActiveTab] = useState<Tab>(() =>
    TABS.some(t => t.id === requestedTab) ? (requestedTab as Tab) : 'comparison'
  );
  const [showTabHelp, setShowTabHelp] = useState(false);
  // Test the author's saved instruction edits, or the defaults. The count is read from browser storage on every render
  // (the System Diagram tab can change it) and is 0 on the server. Until the author chooses, edits are tested if any exist.
  const editCount = useSyncExternalStore(subscribeToStorage, usableEditCount, () => 0);
  const [useEdits, setUseEdits] = useState<boolean | null>(null);

  const activeTabConfig = TABS.find(tab => tab.id === activeTab) || TABS[0];
  const isDiagramTab = activeTab === 'diagram';
  const testingEdits = editCount > 0 && useEdits !== false;

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
          <Link href="/?modal=writers-room" className={styles.secondaryButton}>
            <TeamIcon />
            Writers&apos; Room
          </Link>
          {!isDiagramTab && (
            <button className={styles.secondaryButton} onClick={handleExport}>
              <DownloadIcon />
              Export
            </button>
          )}
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
            {tab.id === 'diagram' && <DiagramIcon />}
            <span className={styles.tabLabel}>{tab.label}</span>
            <span className={styles.tabSummary}>{tab.headline}</span>
          </button>
        ))}
      </nav>

      <section className={styles.tabOverview}>
        <div>
          <h2 className={styles.tabOverviewHeadline}>{activeTabConfig.headline}</h2>
          <p className={styles.tabOverviewSummary}>{activeTabConfig.summary}</p>
        </div>
        {!isDiagramTab && (
          <div className={styles.tabOverviewActions}>
            <fieldset className={styles.instructionSwitch}>
              <legend className={styles.instructionSwitchLegend}>Instructions</legend>
              <label className={`${styles.toggleChip} ${!testingEdits ? styles.toggleChipActive : ''}`}>
                <input type="radio" name="instruction-source" className={styles.visuallyHidden}
                  checked={!testingEdits} onChange={() => setUseEdits(false)} />
                Defaults
              </label>
              <label
                className={`${styles.toggleChip} ${testingEdits ? styles.toggleChipActive : ''}`}
                title={editCount === 0 ? "No saved edits. Edit an instruction in the Writers' Room or the System Diagram." : undefined}
              >
                <input type="radio" name="instruction-source" className={styles.visuallyHidden}
                  checked={testingEdits} disabled={editCount === 0} onChange={() => setUseEdits(true)} />
                Your edits ({editCount})
              </label>
            </fieldset>
            <button
              className={styles.infoButton}
              onClick={() => setShowTabHelp(true)}
              aria-label={`Open ${activeTabConfig.label} instructions`}
              title={`Open ${activeTabConfig.label} instructions`}
            >
              <InfoIcon />
              How It Works
            </button>
          </div>
        )}
      </section>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'comparison' && <ComparisonMode useEdits={testingEdits} />}
        {activeTab === 'playground' && <PlaygroundMode useEdits={testingEdits} />}
        {activeTab === 'batch' && <BatchMode useEdits={testingEdits} />}
        {activeTab === 'diagram' && <SystemDiagram />}
      </div>

      {showTabHelp && (
        <div className={styles.modalOverlay} onClick={() => setShowTabHelp(false)}>
          <div className={styles.helpModal} onClick={e => e.stopPropagation()}>
            <div className={styles.helpModalHeader}>
              <h3 className={styles.helpModalTitle}>{activeTabConfig.helpTitle}</h3>
              <button className={styles.helpModalClose} onClick={() => setShowTabHelp(false)} aria-label="Close help modal">×</button>
            </div>
            <div className={styles.helpModalBody}>
              {activeTabConfig.helpBody.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
