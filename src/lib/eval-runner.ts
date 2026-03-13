/**
 * @file src/lib/eval-runner.ts
 * @description Utility that runs a test case against the actual API and evaluates assertions.
 */

import { TestCase, TestResult, Assertion, AssertionResultItem } from './eval-types';

function evaluateAssertion(assertion: Assertion, output: string): AssertionResultItem {
  const { type, value, extraValue } = assertion;
  let passed = false;
  let message = '';

  try {
    switch (type) {
      case 'contains':
        passed = output.toLowerCase().includes(value.toLowerCase());
        message = passed ? `Found "${value}"` : `Expected to contain "${value}" but it was not found`;
        break;
      case 'excludes':
        passed = !output.toLowerCase().includes(value.toLowerCase());
        message = passed ? `"${value}" not found (correct)` : `Expected to NOT contain "${value}" but it was found`;
        break;
      case 'length_between': {
        const min = parseInt(value, 10);
        const max = parseInt(extraValue || '9999', 10);
        const len = output.length;
        passed = len >= min && len <= max;
        message = passed ? `Length ${len} is within [${min}, ${max}]` : `Length ${len} is outside [${min}, ${max}]`;
        break;
      }
      case 'json_valid':
        try {
          JSON.parse(output);
          passed = true;
          message = 'Output is valid JSON';
        } catch {
          passed = false;
          message = 'Output is not valid JSON';
        }
        break;
      case 'regex_match': {
        const regex = new RegExp(value);
        passed = regex.test(output);
        message = passed ? `Pattern /${value}/ matched` : `Pattern /${value}/ did not match`;
        break;
      }
      default:
        passed = false;
        message = 'Unknown assertion type';
    }
  } catch (e) {
    passed = false;
    message = `Assertion error: ${e instanceof Error ? e.message : String(e)}`;
  }

  return { assertion, passed, message };
}

async function callAgentApi(agentId: string, prompt: string): Promise<{ output: string; model: string; latencyMs: number }> {
  const start = Date.now();
  let body: Record<string, unknown>;

  try {
    body = JSON.parse(prompt);
  } catch (parseErr) {
    console.warn(`[eval-runner] Prompt is not valid JSON for agent "${agentId}"; treating as plain roughNotes. Error: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`);
    body = { roughNotes: prompt };
  }

  const agentEndpointMap: Record<string, string> = {
    GENERATE: '/api/generate',
    REFINE: '/api/refine',
    SUGGEST: '/api/suggest',
    RECOMMEND_LENGTH: '/api/recommend-length',
    SYNC_NOTES: '/api/sync-notes',
    DETECT_TONE_REQUEST: '/api/detect-tone',
    DETECT_IMAGE_REQUEST: '/api/detect-image',
    MATCH_SUGGESTIONS: '/api/match-suggestions-agent',
  };

  const endpoint = agentEndpointMap[agentId];
  if (!endpoint) {
    throw new Error(`No endpoint mapped for agent: ${agentId}`);
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const latencyMs = Date.now() - start;

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  const usedModel = data.usedModel || data.model || 'unknown';

  let output = '';
  if (agentId === 'GENERATE') output = data.text || '';
  else if (agentId === 'REFINE') output = data.text || '';
  else if (agentId === 'SUGGEST') output = JSON.stringify(data.suggestions ?? data);
  else if (agentId === 'RECOMMEND_LENGTH') output = data.recommendation || '';
  else if (agentId === 'SYNC_NOTES') output = JSON.stringify(data.newPoints ?? data);
  else if (agentId === 'DETECT_TONE_REQUEST') output = data.tone || '';
  else if (agentId === 'DETECT_IMAGE_REQUEST') output = data.imageSubject || '';
  else output = JSON.stringify(data);

  return { output, model: usedModel, latencyMs };
}

export async function runTest(testCase: TestCase): Promise<TestResult> {
  const timestamp = new Date().toISOString();

  try {
    const { output, model, latencyMs } = await callAgentApi(testCase.agentId, testCase.prompt);

    const assertionResults: AssertionResultItem[] = testCase.assertions.map(a => evaluateAssertion(a, output));
    const passed = assertionResults.every(r => r.passed);

    return {
      testId: testCase.id,
      passed,
      actualOutput: output,
      assertionResults,
      latencyMs,
      model,
      timestamp,
    };
  } catch (error) {
    return {
      testId: testCase.id,
      passed: false,
      actualOutput: '',
      assertionResults: testCase.assertions.map(a => ({
        assertion: a,
        passed: false,
        message: `Error: ${error instanceof Error ? error.message : String(error)}`,
      })),
      latencyMs: 0,
      model: 'error',
      timestamp,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
