/**
 * @file src/__tests__/lib/eval-runner.test.ts
 * @description Checks what the Eval Suite sends to an agent and that its checks can fail.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 */

import { runTest } from '@/lib/eval-runner';
import { PREDEFINED_TESTS } from '@/lib/eval-tests';
import type { TestCase } from '@/lib/eval-types';

const fetchMock = jest.fn();
global.fetch = fetchMock as unknown as typeof fetch;

function respond(data: unknown) {
  fetchMock.mockResolvedValueOnce({ ok: true, json: async () => data, text: async () => JSON.stringify(data) });
}

const sentBody = () => JSON.parse(fetchMock.mock.calls[0][1].body);

const generateTest: TestCase = {
  id: 't', name: 't', description: '', agentId: 'GENERATE', tags: [], assertions: [],
  prompt: JSON.stringify({ roughNotes: '- say hello' }),
};

beforeEach(() => fetchMock.mockReset());

describe('runTest', () => {
  it('sends the given instruction and records that an edit was used', async () => {
    respond({ text: 'Hello', usedModel: 'm' });
    const result = await runTest(generateTest, { systemInstruction: 'Sign off with Cheerio' });
    expect(sentBody()).toEqual({ roughNotes: '- say hello', systemInstruction: 'Sign off with Cheerio' });
    expect(result.instructionSource).toBe('edited');
  });

  it('sends no instruction when none is given, so the route uses its default', async () => {
    respond({ text: 'Hello', usedModel: 'm' });
    const result = await runTest(generateTest);
    expect(sentBody()).not.toHaveProperty('systemInstruction');
    expect(result.instructionSource).toBe('default');
  });
});

describe('the instruction a prompt carries', () => {
  const promptWithInstruction = { ...generateTest, prompt: JSON.stringify({ roughNotes: '- hi', systemInstruction: 'typed into the prompt' }) };

  it('is dropped on Defaults, so the switch cannot be bypassed and the result is truly default', async () => {
    respond({ text: 'Hello', usedModel: 'm' });
    const result = await runTest(promptWithInstruction);
    expect(sentBody()).toEqual({ roughNotes: '- hi' });
    expect(result.instructionSource).toBe('default');
  });

  it('is replaced by the saved edit when the switch sends one', async () => {
    respond({ text: 'Hello', usedModel: 'm' });
    await runTest(promptWithInstruction, { systemInstruction: 'saved edit' });
    expect(sentBody()).toEqual({ roughNotes: '- hi', systemInstruction: 'saved edit' });
  });
});

describe('the json_array_length check', () => {
  const suggestTest = (min: string, max: string): TestCase => ({
    ...generateTest,
    agentId: 'SUGGEST',
    assertions: [{ id: 'a', type: 'json_array_length', value: min, extraValue: max, label: 'count' }],
  });

  it('fails when the agent returns no suggestions', async () => {
    respond({ suggestions: [], usedModel: 'm' });
    expect((await runTest(suggestTest('1', '5'))).passed).toBe(false);
  });

  it('passes for a count in range, and fails above it', async () => {
    respond({ suggestions: ['one', 'two', 'three'], usedModel: 'm' });
    expect((await runTest(suggestTest('1', '5'))).passed).toBe(true);
    respond({ suggestions: ['one', 'two', 'three'], usedModel: 'm' });
    expect((await runTest(suggestTest('1', '2'))).passed).toBe(false);
  });

  it('fails when an item is blank or the output is not a list', async () => {
    respond({ suggestions: ['one', '  '], usedModel: 'm' });
    expect((await runTest(suggestTest('1', '5'))).passed).toBe(false);
    respond({ text: 'not a list', usedModel: 'm' });
    expect((await runTest({ ...suggestTest('1', '5'), agentId: 'GENERATE' })).passed).toBe(false);
  });

  it('is what the built-in Suggestions test uses, so an empty result fails it', async () => {
    const test = PREDEFINED_TESTS.find(t => t.agentId === 'SUGGEST')!;
    respond({ suggestions: [], usedModel: 'm' });
    expect((await runTest(test)).passed).toBe(false);
  });
});
