'use client';

/**
 * @file src/components/eval/PlaygroundMode.tsx
 * @description Playground Mode for the Agent Eval Suite. Allows testing agent chains
 * with a visual timeline of execution steps and an observations panel. A step can use an earlier step's output by
 * writing {{step-N}} in its JSON input (see eval-chain.ts).
 */

import React, { useState, useRef } from 'react';
import { AGENTS } from '@/lib/agent-constants';
import { runTest } from '@/lib/eval-runner';
import { instructionOptions } from '@/lib/eval-instructions';
import { fillStepReferences } from '@/lib/eval-chain';
import { SCENARIOS } from '@/lib/eval-scenarios';
import { PlayIcon, StopIcon, RefreshIcon, InfoIcon } from '@/components/ui/icons';
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
  edited?: boolean;
}

const visibleAgents = Object.values(AGENTS).filter(a => !('hidden' in a) || !a.hidden);

export function PlaygroundMode({ useEdits = false }: { useEdits?: boolean }) {
  const [selectedScenario, setSelectedScenario] = useState<string>('letter_flow');
  const [steps, setSteps] = useState<Step[]>(() =>
    SCENARIOS['letter_flow'].steps.map(s => ({ ...s, status: 'pending' as StepStatus }))
  );
  const [observations, setObservations] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [customAgentId, setCustomAgentId] = useState('GENERATE');
  const [customPrompt, setCustomPrompt] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const abortRef = useRef(false);

  const loadScenario = (key: string) => {
    setSelectedScenario(key);
    setSteps(SCENARIOS[key].steps.map(s => ({ ...s, status: 'pending' })));
    setObservations([]);
  };

  const freshStep = (s: Step): Step => ({
    ...s,
    status: 'pending' as StepStatus,
    output: undefined,
    model: undefined,
    latencyMs: undefined,
    error: undefined,
    edited: undefined,
  });

  const resetSteps = () => {
    setSteps(prev => prev.map(freshStep));
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
    // Use freshStep helper to reset all steps consistently before running
    const currentSteps = steps.map(freshStep);
    setSteps(currentSteps);
    setObservations([]);
    setRunning(true);
    const log = (msg: string) => setObservations(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

    // Each step's output, by position, so a later step's {{step-N}} can use it. A failed step leaves undefined.
    const outputs: (string | undefined)[] = currentSteps.map(() => undefined);

    for (let i = 0; i < currentSteps.length; i++) {
      if (abortRef.current) {
        log('Run aborted by user.');
        break;
      }

      const step = currentSteps[i];
      setSteps(prev => prev.map(s => s.id === step.id ? { ...s, status: 'running' } : s));
      log(`Starting ${step.agentId}…`);

      let prompt: string;
      try {
        prompt = fillStepReferences(step.prompt, outputs);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setSteps(prev => prev.map(s => s.id === step.id ? { ...s, status: 'error', error: message } : s));
        log(`Skipped ${step.agentId}: ${message}`);
        continue;
      }

      const result = await runTest({
        id: step.id,
        name: step.agentId,
        description: '',
        agentId: step.agentId,
        prompt,
        assertions: [],
        tags: [],
      }, instructionOptions(step.agentId, useEdits));
      const edited = result.instructionSource === 'edited';

      if (result.error) {
        setSteps(prev => prev.map(s => s.id === step.id ? { ...s, status: 'error', error: result.error, latencyMs: result.latencyMs, edited } : s));
        log(`Error in ${step.agentId}: ${result.error}`);
      } else {
        setSteps(prev => prev.map(s => s.id === step.id ? {
          ...s, status: 'complete', output: result.actualOutput, model: result.model, latencyMs: result.latencyMs, edited,
        } : s));
        outputs[i] = result.actualOutput;
        log(`${step.agentId} completed in ${result.latencyMs}ms (${result.model}${edited ? ', edited instruction' : ''})`);
      }
    }

    setRunning(false);
    log('Run finished.');
  };

  const stopRun = () => { abortRef.current = true; };

  const scenario = SCENARIOS[selectedScenario];

  return (
    <div className={styles.playgroundLayout}>
      <div className={styles.modeIntroCard}>
        <div>
          <h3 className={styles.modeIntroTitle}>Playground Workflow Lab</h3>
          <p className={styles.modeIntroText}>
            Explore multi-agent behavior as a chain. This lab helps you see how outputs evolve step-by-step, where handoffs weaken, and how instruction changes affect downstream quality.
          </p>
        </div>
        <button className={styles.infoButton} onClick={() => setShowHelp(true)} aria-label="Open playground instructions" title="Open playground instructions">
          <InfoIcon />
          Instructions
        </button>
      </div>

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
                {step.edited && <span className={styles.editedChip}>Edited instruction</span>}
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
            placeholder='JSON prompt e.g. {"roughNotes": "{{step-1}}"} uses step 1’s output'
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

      {showHelp && (
        <div className={styles.modalOverlay} onClick={() => setShowHelp(false)}>
          <div className={styles.helpModal} onClick={e => e.stopPropagation()}>
            <div className={styles.helpModalHeader}>
              <h3 className={styles.helpModalTitle}>Playground Mode Guide</h3>
              <button className={styles.helpModalClose} onClick={() => setShowHelp(false)} aria-label="Close playground guide">×</button>
            </div>
            <div className={styles.helpModalBody}>
              <p>
                Playground Mode is designed for sequence-level testing. Instead of validating a single response, you evaluate how one agent output influences the next step.
              </p>
              <p>
                Begin with a predefined scenario to establish a baseline. Scenarios are intentionally opinionated examples that model common writing workflows.
              </p>
              <p>
                Add custom steps when you need to test alternate paths, edge cases, or interventions. Each step should include enough context for the target agent to perform reliably.
              </p>
              <p>
                To pass one step&apos;s output to a later step, write <code>{'{{step-N}}'}</code> inside a quoted value, where N is the step number shown in the chain. For example, <code>{'"generatedLetter": "{{step-2}}"'}</code> sends the letter step 2 wrote. If step N failed, the later step is skipped with an error.
              </p>
              <p>
                Use the timeline to diagnose where quality degrades. Latency spikes, malformed output, or brittle transitions often identify prompt boundaries that need tightening.
              </p>
              <p>
                Capture observations during each run. Treat observations as your qualitative lab notes so you can connect result patterns to prompt changes over repeated experiments.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
