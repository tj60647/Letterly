/**
 * @file src/lib/eval-types.ts
 * @description TypeScript types for the Agent Eval Suite.
 */

export type AssertionType = 'contains' | 'excludes' | 'length_between' | 'regex_match' | 'json_valid';

export interface Assertion {
  id: string;
  type: AssertionType;
  value: string;
  /** For length_between: the upper bound (value holds the lower bound). */
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
}

export interface BatchRunResult {
  runId: string;
  timestamp: string;
  results: TestResult[];
  duration: number;
}
