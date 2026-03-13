'use client';

/**
 * @file src/components/eval/PlaygroundMode.tsx
 * @description Playground Mode for the Agent Eval Suite. Allows testing agent chains
 * with a visual timeline of execution steps and an observations panel.
 */

import React, { useState, useRef } from 'react';
import { AGENTS } from '@/lib/agent-constants';
import { runTest } from '@/lib/eval-runner';
import { PlayIcon, StopIcon, RefreshIcon } from '@/components/ui/icons';
import styles from './EvalSuite.module.css';

type StepStatus = 'pending' | 'running' | 'complete' | 'error';

interface Step {
  id: string;
  agentId: string;
  prompt: string;
  status: StepStatus;
  output?: string;
  model?: string;
  latencyMs?: number;
  error?: string;
}

const SCENARIOS: Record<string, { name: string; description: string; steps: Omit<Step, 'status' | 'output' | 'model' | 'latencyMs' | 'error'>[] }> = {
  letter_flow: {
    name: 'Full Letter Flow',
    description: 'Recommend length → Generate letter → Suggest improvements',
    steps: [
      {
        id: 'step-1',
        agentId: 'RECOMMEND_LENGTH',
        prompt: JSON.stringify({ roughNotes: '- Request project status update\n- Ask about budget\n- Mention upcoming deadline' }),
      },
      {
        id: 'step-2',
        agentId: 'GENERATE',
        prompt: JSON.stringify({
          recipient: 'Project Manager',
          sender: 'Stakeholder',
          tone: 'Professional',
          length: 'Medium',
          language: 'English',
          roughNotes: '- Request project status update\n- Ask about budget\n- Mention upcoming deadline',
        }),
      },
      {
        id: 'step-3',
        agentId: 'SUGGEST',
        prompt: JSON.stringify({
          roughNotes: '- Request project status update\n- Ask about budget',
          generatedLetter: 'Dear Project Manager,\n\nI am writing to request an update on the current project status.\n\nBest regards,\nStakeholder',
          recipient: 'Project Manager',
          tone: 'Professional',
        }),
      },
    ],
  },
  refine_loop: {
    name: 'Refine & Sync Loop',
    description: 'Refine notes → Generate → Sync notes back',
    steps: [
      {
        id: 'step-1',
        agentId: 'REFINE',
        prompt: JSON.stringify({
          roughNotes: '- Complaint about late delivery',
          instructions: 'Add: order number #45678, expected date was last Friday',
          conversationHistory: [],
        }),
      },
      {
        id: 'step-2',
        agentId: 'GENERATE',
        prompt: JSON.stringify({
          recipient: 'Customer Service',
          sender: 'Customer',
          tone: 'Assertive',
          length: 'Short',
          language: 'English',
          roughNotes: '- Complaint about late delivery\n- Order #45678\n- Expected last Friday',
        }),
      },
      {
        id: 'step-3',
        agentId: 'SYNC_NOTES',
        prompt: JSON.stringify({
          roughNotes: '- Complaint about late delivery',
          editedLetter: 'Dear Customer Service,\n\nI am writing about order #45678 which was expected last Friday.\n\nRegards,\nCustomer',
        }),
      },
    ],
  },
};

const visibleAgents = Object.values(AGENTS).filter(a => !('hidden' in a) || !a.hidden);

export function PlaygroundMode() {
  const [selectedScenario, setSelectedScenario] = useState<string>('letter_flow');
  const [steps, setSteps] = useState<Step[]>(() =>
    SCENARIOS['letter_flow'].steps.map(s => ({ ...s, status: 'pending' as StepStatus }))
  );
  const [observations, setObservations] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [customAgentId, setCustomAgentId] = useState('GENERATE');
  const [customPrompt, setCustomPrompt] = useState('');
  const abortRef = useRef(false);

  const loadScenario = (key: string) => {
    setSelectedScenario(key);
    setSteps(SCENARIOS[key].steps.map(s => ({ ...s, status: 'pending' })));
    setObservations([]);
  };

  const resetSteps = () => {
    setSteps(prev => prev.map(s => ({ ...s, status: 'pending', output: undefined, model: undefined, latencyMs: undefined, error: undefined })));
    setObservations([]);
  };

  const addCustomStep = () => {
    if (!customPrompt) return;
    setSteps(prev => [...prev, {
      id: `custom-${Date.now()}`,
      agentId: customAgentId,
      prompt: customPrompt,
      status: 'pending',
    }]);
    setCustomPrompt('');
  };

  const removeStep = (id: string) => {
    setSteps(prev => prev.filter(s => s.id !== id));
  };

  const runAll = async () => {
    abortRef.current = false;
    // Capture current steps before any state updates to avoid stale closure
    const currentSteps = steps.map(s => ({ ...s, status: 'pending' as StepStatus, output: undefined, model: undefined, latencyMs: undefined, error: undefined }));
    setSteps(currentSteps);
    setObservations([]);
    setRunning(true);
    const log = (msg: string) => setObservations(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

    for (let i = 0; i < currentSteps.length; i++) {
      if (abortRef.current) {
        log('Run aborted by user.');
        break;
      }

      const step = currentSteps[i];
      setSteps(prev => prev.map(s => s.id === step.id ? { ...s, status: 'running' } : s));
      log(`Starting ${step.agentId}…`);

      const result = await runTest({
        id: step.id,
        name: step.agentId,
        description: '',
        agentId: step.agentId,
        prompt: step.prompt,
        assertions: [],
        tags: [],
      });

      if (result.error) {
        setSteps(prev => prev.map(s => s.id === step.id ? { ...s, status: 'error', error: result.error, latencyMs: result.latencyMs } : s));
        log(`Error in ${step.agentId}: ${result.error}`);
      } else {
        setSteps(prev => prev.map(s => s.id === step.id ? {
          ...s, status: 'complete', output: result.actualOutput, model: result.model, latencyMs: result.latencyMs,
        } : s));
        log(`${step.agentId} completed in ${result.latencyMs}ms (${result.model})`);
      }
    }

    setRunning(false);
    log('Run finished.');
  };

  const stopRun = () => { abortRef.current = true; };

  const scenario = SCENARIOS[selectedScenario];

  return (
    <div className={styles.playgroundLayout}>
      {/* Header Controls */}
      <div className={styles.playgroundHeader}>
        <div className={styles.fieldGroup} style={{ flex: 1 }}>
          <label className={styles.fieldLabel}>Scenario</label>
          <select className={styles.select} value={selectedScenario} onChange={e => loadScenario(e.target.value)}>
            {Object.entries(SCENARIOS).map(([key, s]) => (
              <option key={key} value={key}>{s.name}</option>
            ))}
          </select>
          {scenario && <p className={styles.scenarioDesc}>{scenario.description}</p>}
        </div>
        <div className={styles.playgroundActions}>
          <button className={styles.runButton} onClick={runAll} disabled={running || steps.length === 0}>
            <PlayIcon /> Run Chain
          </button>
          {running && (
            <button className={styles.stopButton} onClick={stopRun}>
              <StopIcon /> Stop
            </button>
          )}
          <button className={styles.secondaryButton} onClick={resetSteps} disabled={running}>
            <RefreshIcon /> Reset
          </button>
        </div>
      </div>

      {/* Agent Chain Visualization */}
      <div className={styles.agentChain}>
        {steps.map((step, idx) => (
          <React.Fragment key={step.id}>
            <div className={`${styles.chainNode} ${styles[`chainNode_${step.status}`]}`}>
              <span className={styles.chainNodeIndex}>{idx + 1}</span>
              <span className={styles.chainNodeAgent}>{step.agentId}</span>
            </div>
            {idx < steps.length - 1 && <div className={styles.chainArrow}>→</div>}
          </React.Fragment>
        ))}
      </div>

      {/* Timeline */}
      <div className={styles.timeline}>
        {steps.map((step) => (
          <div key={step.id} className={`${styles.timelineCard} ${styles[`timelineCard_${step.status}`]}`}>
            <div className={styles.timelineCardHeader}>
              <div className={styles.timelineStatus}>
                <span className={`${styles.statusDot} ${styles[`statusDot_${step.status}`]}`} />
                <span className={styles.timelineAgentName}>{step.agentId}</span>
              </div>
              <div className={styles.timelineMeta}>
                {step.latencyMs !== undefined && <span className={styles.metaChip}>{step.latencyMs}ms</span>}
                {step.model && <span className={styles.metaChip}>{step.model}</span>}
                {!running && (
                  <button className={styles.removeStepBtn} onClick={() => removeStep(step.id)} title="Remove step">×</button>
                )}
              </div>
            </div>
            {step.status === 'pending' && (
              <div className={styles.timelinePromptPreview}>
                <span className={styles.promptPreviewLabel}>Prompt:</span>
                <code className={styles.promptPreviewCode}>{step.prompt.slice(0, 120)}{step.prompt.length > 120 ? '…' : ''}</code>
              </div>
            )}
            {step.status === 'running' && (
              <div className={styles.runningIndicator}>
                <span className={styles.spinner} />
                Executing…
              </div>
            )}
            {step.status === 'complete' && step.output && (
              <pre className={styles.timelineOutput}>{step.output.slice(0, 300)}{step.output.length > 300 ? '…' : ''}</pre>
            )}
            {step.status === 'error' && (
              <div className={styles.errorBox}>{step.error}</div>
            )}
          </div>
        ))}
      </div>

      {/* Add Custom Step */}
      <div className={styles.addStepSection}>
        <h4 className={styles.sectionTitle}>Add Step</h4>
        <div className={styles.assertionBuilder}>
          <select className={styles.selectSm} value={customAgentId} onChange={e => setCustomAgentId(e.target.value)}>
            {visibleAgents.map(a => <option key={a.id} value={a.id}>{a.id}</option>)}
          </select>
          <input
            className={styles.inputSm}
            style={{ flex: 1 }}
            placeholder='JSON prompt e.g. {"roughNotes": "..."}'
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
          />
          <button className={styles.addAssertionBtn} onClick={addCustomStep} disabled={running}>
            + Add Step
          </button>
        </div>
      </div>

      {/* Observations Panel */}
      <div className={styles.observationsPanel}>
        <h4 className={styles.sectionTitle}>Observations</h4>
        <div className={styles.observationsList}>
          {observations.length === 0
            ? <span className={styles.emptyState}>Run the chain to see observations…</span>
            : observations.map((obs, i) => <div key={i} className={styles.observationLine}>{obs}</div>)
          }
        </div>
      </div>
    </div>
  );
}
