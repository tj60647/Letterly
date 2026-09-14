/**
 * @file src/lib/eval-types.ts
 * @description TypeScript types for the Agent Eval Suite.
 */

export type AssertionType = 'contains' | 'excludes' | 'length_between' | 'regex_match' | 'json_valid' | 'json_array_length';

export interface Assertion {
  id: string;
  type: AssertionType;
  value: string;
  /** For length_between and json_array_length: the upper bound (value holds the lower bound). */
  extraValue?: string;
  label: string;
}

export interface TestCase {
  id: string;
  name: string;
  description: string;
  agentId: string;
  prompt: string;
  expectedOutput?: string;
  assertions: Assertion[];
  tags: string[];
}

export interface AssertionResultItem {
  assertion: Assertion;
  passed: boolean;
  message: string;
}

export interface TestResult {
  testId: string;
  passed: boolean;
  actualOutput: string;
  assertionResults: AssertionResultItem[];
  latencyMs: number;
  model: string;
  tokenCount?: number;
  timestamp: string;
  error?: string;
  /** Whether the agent ran with its default instruction or the author's saved edit. */
  instructionSource?: 'default' | 'edited';
}

/** Extra request fields a test run sends alongside the test's own input. */
export interface RunOptions {
  /** The author's saved instruction; when absent the route uses the agent's default. */
  systemInstruction?: string;
}

export interface BatchRunResult {
  runId: string;
  timestamp: string;
  results: TestResult[];
  duration: number;
}
