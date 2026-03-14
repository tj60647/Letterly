'use client';

/**
 * @file src/components/eval/BatchMode.tsx
 * @description Batch Test Runner Mode for the Agent Eval Suite. Runs multiple test cases
 * in sequence and presents results organized by agent with summary statistics.
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { TestResult, BatchRunResult } from '@/lib/eval-types';
import { PREDEFINED_TESTS, TEST_SUITES } from '@/lib/eval-tests';
import { runTest } from '@/lib/eval-runner';
import { PlayIcon, StopIcon, DownloadIcon, RefreshIcon } from '@/components/ui/icons';
import styles from './EvalSuite.module.css';

interface TestResultRowProps {
  testId: string;
  result: TestResult | undefined;
  running: boolean;
}

function TestResultRow({ testId, result, running }: TestResultRowProps) {
  const test = PREDEFINED_TESTS.find(t => t.id === testId);
  const [expanded, setExpanded] = useState(false);

  if (!test) return null;

  const isRunning = running && !result;

  return (
    <div className={`${styles.batchResultRow} ${result ? (result.passed ? styles.batchRowPassed : styles.batchRowFailed) : ''}`}>
      <div className={styles.batchRowHeader} onClick={() => result && setExpanded(v => !v)}>
        <span className={`${styles.statusDot} ${
          isRunning ? styles.statusDot_running :
          !result ? styles.statusDot_pending :
          result.passed ? styles.statusDot_complete :
          styles.statusDot_error
        }`} />
        <span className={styles.batchRowName}>{test.name}</span>
        <div className={styles.batchRowMeta}>
          {result && (
            <>
              <span className={styles.metaChip}>{result.latencyMs}ms</span>
              <span className={styles.metaChip}>{result.model}</span>
              <span className={result.passed ? styles.passBadge : styles.failBadge}>
                {result.passed ? '✓ PASS' : '✗ FAIL'}
              </span>
            </>
          )}
          {isRunning && <span className={styles.runningChip}><span className={styles.spinner} /> Running</span>}
          {!result && !isRunning && <span className={styles.pendingChip}>Pending</span>}
          {result && <span className={styles.expandChevron}>{expanded ? '▲' : '▼'}</span>}
        </div>
      </div>
      {expanded && result && (
        <div className={styles.batchRowDetails}>
          <div className={styles.assertionResults}>
            {result.assertionResults.map((ar, i) => (
              <div key={i} className={`${styles.assertionResult} ${ar.passed ? styles.assertionPassed : styles.assertionFailed}`}>
                <span className={styles.assertionResultIcon}>{ar.passed ? '✓' : '✗'}</span>
                <div>
                  <div className={styles.assertionResultLabel}>{ar.assertion.label}</div>
                  <div className={styles.assertionResultMsg}>{ar.message}</div>
                </div>
              </div>
            ))}
          </div>
          {result.error && <div className={styles.errorBox}>{result.error}</div>}
          {result.actualOutput && (
            <div className={styles.outputSection}>
              <strong>Output:</strong>
              <pre className={styles.outputPre}>{result.actualOutput.slice(0, 500)}{result.actualOutput.length > 500 ? '…' : ''}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function BatchMode() {
  const [selectedSuite, setSelectedSuite] = useState<string>('all');
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [running, setRunning] = useState(false);
  const [currentTestId, setCurrentTestId] = useState<string | null>(null);
  const [batchHistory, setBatchHistory] = useState<BatchRunResult[]>([]);
  const [collapsedAgents, setCollapsedAgents] = useState<Set<string>>(new Set());
  const abortRef = useRef(false);

  const suiteTestIds = TEST_SUITES[selectedSuite]?.testIds ?? [];
  // suiteTests is derived entirely from selectedSuite via the TEST_SUITES lookup.
  // Using selectedSuite (not suiteTestIds) as the dependency avoids a new array reference
  // on every render while still updating whenever the suite selection changes.
  const suiteTests = useMemo(
    () => PREDEFINED_TESTS.filter(t => (TEST_SUITES[selectedSuite]?.testIds ?? []).includes(t.id)),
    [selectedSuite]
  );

  const completedCount = suiteTestIds.filter(id => results[id]).length;
  const passedCount = suiteTestIds.filter(id => results[id]?.passed).length;
  const failedCount = completedCount - passedCount;
  const progress = suiteTestIds.length > 0 ? (completedCount / suiteTestIds.length) * 100 : 0;

  const agentGroups = suiteTests.reduce<Record<string, typeof suiteTests>>((acc, t) => {
    if (!acc[t.agentId]) acc[t.agentId] = [];
    acc[t.agentId].push(t);
    return acc;
  }, {});

  const toggleAgent = (agentId: string) => {
    setCollapsedAgents(prev => {
      const next = new Set(prev);
      if (next.has(agentId)) { next.delete(agentId); } else { next.add(agentId); }
      return next;
    });
  };

  const runAll = useCallback(async () => {
    abortRef.current = false;
    setRunning(true);
    setResults({});
    setCurrentTestId(null);
    const start = Date.now();
    const runResults: Record<string, TestResult> = {};

    // Sequential execution is intentional: enables live progress updates per-test
    // and avoids overwhelming the API. For large suites, consider a concurrency limit.
    for (const test of suiteTests) {
      if (abortRef.current) break;
      setCurrentTestId(test.id);
      const result = await runTest(test);
      runResults[test.id] = result;
      setResults(prev => ({ ...prev, [test.id]: result }));
    }

    const duration = Date.now() - start;
    const batchResult: BatchRunResult = {
      runId: `run-${Date.now()}`,
      timestamp: new Date().toISOString(),
      results: Object.values(runResults),
      duration,
    };
    setBatchHistory(prev => [batchResult, ...prev].slice(0, 5));
    setCurrentTestId(null);
    setRunning(false);
  }, [suiteTests]);

  const stopRun = () => { abortRef.current = true; };

  const resetResults = () => {
    setResults({});
    setCurrentTestId(null);
  };

  const exportResults = () => {
    const data = {
      suite: selectedSuite,
      timestamp: new Date().toISOString(),
      summary: { total: suiteTestIds.length, passed: passedCount, failed: failedCount },
      results: Object.values(results),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eval-results-${selectedSuite}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.batchLayout}>
      {/* Header Controls */}
      <div className={styles.batchHeader}>
        <div className={styles.fieldGroup} style={{ flex: 1, maxWidth: 300 }}>
          <label className={styles.fieldLabel}>Test Suite</label>
          <select
            className={styles.select}
            value={selectedSuite}
            onChange={e => { setSelectedSuite(e.target.value); resetResults(); }}
          >
            {Object.entries(TEST_SUITES).map(([key, suite]) => (
              <option key={key} value={key}>{suite.name} ({suite.testIds.length} tests)</option>
            ))}
          </select>
        </div>
        <div className={styles.batchActions}>
          <button className={styles.runButton} onClick={runAll} disabled={running}>
            <PlayIcon /> Run All
          </button>
          {running && (
            <button className={styles.stopButton} onClick={stopRun}>
              <StopIcon /> Stop
            </button>
          )}
          <button className={styles.secondaryButton} onClick={resetResults} disabled={running}>
            <RefreshIcon /> Reset
          </button>
          {completedCount > 0 && (
            <button className={styles.secondaryButton} onClick={exportResults}>
              <DownloadIcon /> Export
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {(running || completedCount > 0) && (
        <div className={styles.progressSection}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <div className={styles.progressStats}>
            <span>{completedCount} / {suiteTestIds.length} complete</span>
            {completedCount > 0 && (
              <>
                <span className={styles.passChip}>✓ {passedCount} passed</span>
                {failedCount > 0 && <span className={styles.failChip}>✗ {failedCount} failed</span>}
              </>
            )}
          </div>
        </div>
      )}

      {/* Results by Agent */}
      <div className={styles.batchResults}>
        {Object.entries(agentGroups).map(([agentId, tests]) => {
          const agentPassed = tests.filter(t => results[t.id]?.passed).length;
          const agentTotal = tests.length;
          const collapsed = collapsedAgents.has(agentId);
          return (
            <div key={agentId} className={styles.agentGroup}>
              <button className={styles.agentGroupHeader} onClick={() => toggleAgent(agentId)}>
                <span className={styles.agentGroupName}>{agentId}</span>
                <div className={styles.agentGroupMeta}>
                  {results[tests[0]?.id] !== undefined && (
                    <span className={agentPassed === agentTotal ? styles.passChip : styles.failChip}>
                      {agentPassed}/{agentTotal}
                    </span>
                  )}
                  <span className={styles.expandChevron}>{collapsed ? '▶' : '▼'}</span>
                </div>
              </button>
              {!collapsed && (
                <div className={styles.agentGroupTests}>
                  {tests.map(test => (
                    <TestResultRow
                      key={test.id}
                      testId={test.id}
                      result={results[test.id]}
                      running={running && currentTestId === test.id}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {completedCount > 0 && !running && (
        <div className={styles.batchSummary}>
          <h4 className={styles.sectionTitle}>Summary</h4>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryCardValue}>{suiteTestIds.length}</div>
              <div className={styles.summaryCardLabel}>Total Tests</div>
            </div>
            <div className={`${styles.summaryCard} ${styles.summaryCardPass}`}>
              <div className={styles.summaryCardValue}>{passedCount}</div>
              <div className={styles.summaryCardLabel}>Passed</div>
            </div>
            <div className={`${styles.summaryCard} ${failedCount > 0 ? styles.summaryCardFail : ''}`}>
              <div className={styles.summaryCardValue}>{failedCount}</div>
              <div className={styles.summaryCardLabel}>Failed</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryCardValue}>
                {suiteTestIds.length > 0 ? Math.round((passedCount / suiteTestIds.length) * 100) : 0}%
              </div>
              <div className={styles.summaryCardLabel}>Pass Rate</div>
            </div>
          </div>
          {batchHistory.length > 0 && (
            <div className={styles.historySection}>
              <strong>Recent Runs:</strong>
              {batchHistory.map(run => (
                <div key={run.runId} className={styles.historyItem}>
                  <span>{new Date(run.timestamp).toLocaleString()}</span>
                  <span>{run.results.filter(r => r.passed).length}/{run.results.length} passed</span>
                  <span>{(run.duration / 1000).toFixed(1)}s</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
