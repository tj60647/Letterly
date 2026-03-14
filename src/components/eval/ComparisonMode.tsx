'use client';

/**
 * @file src/components/eval/ComparisonMode.tsx
 * @description Comparison Mode for the Agent Eval Suite. Allows running individual test cases
 * against agents and comparing expected vs actual output with assertion evaluation.
 */

import React, { useState, useCallback } from 'react';
import { AGENTS } from '@/lib/agent-constants';
import { TestCase, TestResult, Assertion, AssertionType } from '@/lib/eval-types';
import { PREDEFINED_TESTS, TEST_SUITES } from '@/lib/eval-tests';
import { runTest } from '@/lib/eval-runner';
import { PlayIcon, PlusIcon, RefreshIcon, InfoIcon } from '@/components/ui/icons';
import styles from './EvalSuite.module.css';

/**
 * Ready-to-use JSON prompt templates for each agent, reflecting their specific input requirements.
 */
const PROMPT_TEMPLATES: Record<string, Record<string, unknown>> = {
  GENERATE: {
    roughNotes: '- Key point 1\n- Key point 2',
    recipient: 'Manager',
    sender: 'Employee',
    tone: 'Professional',
    length: 'Medium',
    language: 'English',
  },
  REFINE: {
    roughNotes: '- Existing note 1\n- Existing note 2',
    instructions: 'What to add or change in the notes',
    conversationHistory: [],
  },
  SUGGEST: {
    roughNotes: '- Original rough note',
    generatedLetter: 'Dear Manager,\n\n...\n\nBest regards,\nEmployee',
    recipient: 'Manager',
    tone: 'Professional',
  },
  RECOMMEND_LENGTH: {
    roughNotes: '- Topic or key points to analyze',
  },
  SYNC_NOTES: {
    roughNotes: '- Existing note 1\n- Existing note 2',
    editedLetter: 'Dear Manager,\n\n...\n\nBest regards,\nEmployee',
  },
  MATCH_SUGGESTIONS: {
    chatInput: 'User chat message',
    suggestions: ['Suggestion 1', 'Suggestion 2', 'Suggestion 3'],
  },
  IMAGE: {
    subject: 'a rose',
  },
};

const ASSERTION_TYPE_LABELS: Record<AssertionType, string> = {
  contains: 'Contains',
  excludes: 'Excludes',
  length_between: 'Length Between',
  regex_match: 'Regex Match',
  json_valid: 'JSON Valid',
};

const visibleAgents = Object.values(AGENTS).filter(a => !('hidden' in a) || !a.hidden);

export function ComparisonMode() {
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('GENERATE');
  const [promptValue, setPromptValue] = useState<string>('');
  const [jsonMode, setJsonMode] = useState(false);
  const [assertions, setAssertions] = useState<Assertion[]>([]);
  const [newAssertionType, setNewAssertionType] = useState<AssertionType>('contains');
  const [newAssertionValue, setNewAssertionValue] = useState('');
  const [newAssertionExtra, setNewAssertionExtra] = useState('');
  const [newAssertionLabel, setNewAssertionLabel] = useState('');
  const [result, setResult] = useState<TestResult | null>(null);
  const [running, setRunning] = useState(false);
  const [activeSuite, setActiveSuite] = useState<string>('all');
  const [showHelp, setShowHelp] = useState(false);

  const suiteTests = PREDEFINED_TESTS.filter(t =>
    TEST_SUITES[activeSuite]?.testIds.includes(t.id)
  );

  const selectedAgent = visibleAgents.find(a => a.id === selectedAgentId);
  const agentInputSchema = selectedAgent && 'inputSchema' in selectedAgent ? selectedAgent.inputSchema as Record<string, string> : null;
  const agentOutputDescription = selectedAgent && 'outputDescription' in selectedAgent ? selectedAgent.outputDescription as string : null;

  const getJsonPlaceholder = () => {
    const template = PROMPT_TEMPLATES[selectedAgentId];
    if (template) {
      return JSON.stringify(template, null, 2);
    }
    return '{\n  "roughNotes": "..."\n}';
  };

  const handleUseTemplate = () => {
    const template = PROMPT_TEMPLATES[selectedAgentId];
    if (template) {
      setPromptValue(JSON.stringify(template, null, 2));
      setJsonMode(true);
    }
  };

  const loadTest = useCallback((test: TestCase) => {
    setSelectedTestId(test.id);
    setSelectedAgentId(test.agentId);
    setPromptValue(test.prompt);
    setAssertions(test.assertions);
    setJsonMode(true);
    setResult(null);
  }, []);

  const addAssertion = () => {
    if (!newAssertionValue && newAssertionType !== 'json_valid') return;
    const assertion: Assertion = {
      id: `custom-${Date.now()}`,
      type: newAssertionType,
      value: newAssertionValue,
      extraValue: newAssertionExtra || undefined,
      label: newAssertionLabel || `${ASSERTION_TYPE_LABELS[newAssertionType]}: ${newAssertionValue}`,
    };
    setAssertions(prev => [...prev, assertion]);
    setNewAssertionValue('');
    setNewAssertionExtra('');
    setNewAssertionLabel('');
  };

  const removeAssertion = (id: string) => {
    setAssertions(prev => prev.filter(a => a.id !== id));
  };

  const handleRun = async () => {
    setRunning(true);
    setResult(null);
    const testCase: TestCase = {
      id: selectedTestId || 'custom',
      name: 'Custom Test',
      description: '',
      agentId: selectedAgentId,
      prompt: promptValue,
      assertions,
      tags: [],
    };
    const res = await runTest(testCase);
    setResult(res);
    setRunning(false);
  };

  return (
    <div className={styles.comparisonLayout}>
      <div className={styles.modeIntroCard}>
        <div>
          <h3 className={styles.modeIntroTitle}>Comparison Workspace</h3>
          <p className={styles.modeIntroText}>
            Evaluate one prompt against one agent at a time. This workspace is designed for precise, epistemic testing where you define explicit success criteria through assertions and inspect the response in detail.
          </p>
        </div>
        <button className={styles.infoButton} onClick={() => setShowHelp(true)} aria-label="Open comparison instructions" title="Open comparison instructions">
          <InfoIcon />
          Instructions
        </button>
      </div>

      {/* Left Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarSection}>
          <h3 className={styles.sidebarTitle}>Test Suites</h3>
          <div className={styles.suiteList}>
            {Object.entries(TEST_SUITES).map(([key, suite]) => (
              <button
                key={key}
                className={`${styles.suiteButton} ${activeSuite === key ? styles.suiteButtonActive : ''}`}
                onClick={() => setActiveSuite(key)}
              >
                <span>{suite.name}</span>
                <span className={styles.suiteBadge}>{suite.testIds.length}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.sidebarSection}>
          <h3 className={styles.sidebarTitle}>Tests</h3>
          <div className={styles.testList}>
            {suiteTests.map(test => (
              <button
                key={test.id}
                className={`${styles.testItem} ${selectedTestId === test.id ? styles.testItemActive : ''}`}
                onClick={() => loadTest(test)}
              >
                <span className={styles.testItemName}>{test.name}</span>
                <span className={styles.testItemAgent}>{test.agentId}</span>
                <span className={styles.testItemDesc}>{test.description}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <main className={styles.mainPanel}>
        <div className={styles.configSection}>
          {/* Agent Selector */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Agent</label>
            <select
              className={styles.select}
              value={selectedAgentId}
              onChange={e => { setSelectedAgentId(e.target.value); setResult(null); }}
            >
              {visibleAgents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.name} ({agent.id})</option>
              ))}
            </select>
          </div>

          {/* Agent Role Card */}
          {selectedAgent && (
            <div className={styles.agentRoleCard}>
              <p className={styles.agentRoleDescription}>{selectedAgent.description}</p>
              {agentInputSchema && (
                <div className={styles.agentRoleSection}>
                  <span className={styles.agentRoleSectionLabel}>Input fields</span>
                  <ul className={styles.agentInputFieldList}>
                    {Object.entries(agentInputSchema).map(([field, desc]) => (
                      <li key={field} className={styles.agentInputFieldItem}>
                        <code className={styles.agentInputFieldName}>{field}</code>
                        <span className={styles.agentInputFieldDesc}>{desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {agentOutputDescription && (
                <div className={styles.agentRoleSection}>
                  <span className={styles.agentRoleSectionLabel}>Returns</span>
                  <span className={styles.agentRoleOutput}>{agentOutputDescription}</span>
                </div>
              )}
            </div>
          )}

          {/* Prompt Input */}
          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabelRow}>
              <label className={styles.fieldLabel}>Prompt</label>
              <div className={styles.promptControls}>
                {PROMPT_TEMPLATES[selectedAgentId] && (
                  <button
                    className={styles.templateButton}
                    onClick={handleUseTemplate}
                    title="Populate the prompt with a ready-to-use JSON template for this agent"
                  >
                    Use template
                  </button>
                )}
                <button
                  className={`${styles.toggleChip} ${jsonMode ? styles.toggleChipActive : ''}`}
                  onClick={() => setJsonMode(v => !v)}
                >
                  Advanced JSON Mode
                </button>
              </div>
            </div>
            <textarea
              className={`${styles.promptTextarea} ${jsonMode ? styles.monoFont : ''}`}
              value={promptValue}
              onChange={e => setPromptValue(e.target.value)}
              placeholder={jsonMode ? getJsonPlaceholder() : 'Enter your prompt here…'}
              rows={8}
            />
          </div>

          {/* Assertion Builder */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Assertions</label>
            <div className={styles.assertionList}>
              {assertions.map(a => (
                <div key={a.id} className={styles.assertionChip}>
                  <span className={styles.assertionChipType}>{ASSERTION_TYPE_LABELS[a.type]}</span>
                  <span className={styles.assertionChipLabel}>{a.label}</span>
                  <button className={styles.assertionRemove} onClick={() => removeAssertion(a.id)}>×</button>
                </div>
              ))}
            </div>
            <div className={styles.assertionBuilder}>
              <select
                className={styles.selectSm}
                value={newAssertionType}
                onChange={e => setNewAssertionType(e.target.value as AssertionType)}
              >
                {Object.entries(ASSERTION_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              {newAssertionType !== 'json_valid' && (
                <input
                  className={styles.inputSm}
                  placeholder={newAssertionType === 'length_between' ? 'Min' : 'Value'}
                  value={newAssertionValue}
                  onChange={e => setNewAssertionValue(e.target.value)}
                />
              )}
              {newAssertionType === 'length_between' && (
                <input
                  className={styles.inputSm}
                  placeholder="Max"
                  value={newAssertionExtra}
                  onChange={e => setNewAssertionExtra(e.target.value)}
                />
              )}
              <input
                className={styles.inputSm}
                placeholder="Label (optional)"
                value={newAssertionLabel}
                onChange={e => setNewAssertionLabel(e.target.value)}
              />
              <button className={styles.addAssertionBtn} onClick={addAssertion}>
                <PlusIcon /> Add
              </button>
            </div>
          </div>

          {/* Run Button */}
          <div className={styles.runRow}>
            <button
              className={styles.runButton}
              onClick={handleRun}
              disabled={running || !promptValue}
            >
              {running ? <><RefreshIcon /> Running…</> : <><PlayIcon /> Run Test</>}
            </button>
            {result && (
              <span className={result.passed ? styles.passBadge : styles.failBadge}>
                {result.passed ? '✓ PASS' : '✗ FAIL'}
              </span>
            )}
          </div>
        </div>

        {/* Results Panel */}
        {result && (
          <div className={styles.resultsPanel}>
            {/* Metadata Bar */}
            <div className={styles.metaBar}>
              <span className={styles.metaItem}><strong>Model:</strong> {result.model}</span>
              <span className={styles.metaItem}><strong>Latency:</strong> {result.latencyMs}ms</span>
              <span className={styles.metaItem}><strong>Timestamp:</strong> {new Date(result.timestamp).toLocaleTimeString()}</span>
            </div>

            {result.error && (
              <div className={styles.errorBox}>{result.error}</div>
            )}

            {/* Side-by-side columns */}
            <div className={styles.compareColumns}>
              <div className={styles.compareCol}>
                <h4 className={styles.compareColTitle}>Actual Output</h4>
                <pre className={styles.outputPre}>{result.actualOutput || '(empty)'}</pre>
              </div>
              <div className={styles.compareCol}>
                <h4 className={styles.compareColTitle}>Assertion Results</h4>
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
              </div>
            </div>
          </div>
        )}
      </main>

      {showHelp && (
        <div className={styles.modalOverlay} onClick={() => setShowHelp(false)}>
          <div className={styles.helpModal} onClick={e => e.stopPropagation()}>
            <div className={styles.helpModalHeader}>
              <h3 className={styles.helpModalTitle}>Comparison Mode Guide</h3>
              <button className={styles.helpModalClose} onClick={() => setShowHelp(false)} aria-label="Close comparison guide">×</button>
            </div>
            <div className={styles.helpModalBody}>
              <p>
                Comparison Mode is best when you need focused validation. You test one scenario at a time and define exactly what counts as success.
              </p>
              <p>
                Start in the left panel by selecting a suite and test. This preloads an agent, prompt, and assertions. If you want a custom test, choose your agent and write your own prompt.
              </p>
              <p>
                Each agent has specific input requirements — the <strong>Agent Role Card</strong> shown below the agent selector lists the expected input fields and what the agent returns. Use the <strong>Use template</strong> button to populate the prompt with a ready-to-use JSON structure for the selected agent.
              </p>
              <p>
                Use Advanced JSON Mode when the agent expects structured input (most agents do). Keep your payload shape aligned with the fields listed in the role card for reliable results.
              </p>
              <p>
                Add multiple assertions to represent evidence of correctness. Prefer specific assertions instead of one broad check so failures are easier to diagnose.
              </p>
              <p>
                After running, inspect metadata, output, and assertion messages together. If a test fails, adjust either prompt wording or assertion strictness depending on your intended behavior.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
