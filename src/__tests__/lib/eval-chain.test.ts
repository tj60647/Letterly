/**
 * @file src/__tests__/lib/eval-chain.test.ts
 * @description Checks that a Playground step can use an earlier step's output.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 */

import { fillStepReferences, stepReferences, renumberAfterRemoval } from '@/lib/eval-chain';
import { SCENARIOS } from '@/lib/eval-scenarios';

describe('fillStepReferences', () => {
  it("puts an earlier step's output into the prompt, escaped so the JSON still parses", () => {
    const letter = 'Dear "Sam",\n\nThanks.\\Bye';
    const prompt = JSON.stringify({ generatedLetter: '{{step-2}}', tone: 'Warm' });
    const filled = fillStepReferences(prompt, ['Short', letter]);
    expect(JSON.parse(filled)).toEqual({ generatedLetter: letter, tone: 'Warm' });
  });

  it('leaves a prompt without references unchanged', () => {
    expect(fillStepReferences('{"roughNotes":"- hi"}', [])).toBe('{"roughNotes":"- hi"}');
  });

  it('stops with a clear error when the named step has no output', () => {
    expect(() => fillStepReferences('{"x":"{{step-1}}"}', [undefined])).toThrow('Step 1 has no output to use');
    expect(() => fillStepReferences('{"x":"{{step-3}}"}', ['a'])).toThrow('Step 3 has no output to use');
  });

  it('lists the steps a prompt refers to', () => {
    expect(stepReferences('{"a":"{{step-1}}","b":"{{step-2}} and {{step-1}}"}')).toEqual([1, 2]);
  });
});

describe('renumberAfterRemoval', () => {
  it('shifts references to later steps down by one, so they still name the same step', () => {
    expect(renumberAfterRemoval('{"a":"{{step-1}}","b":"{{step-3}}"}', 2)).toBe('{"a":"{{step-1}}","b":"{{step-2}}"}');
  });

  it('marks a reference to the removed step, which then stops with a clear error instead of reading another step', () => {
    const prompt = renumberAfterRemoval('{"a":"{{step-2}}"}', 2);
    expect(stepReferences(prompt)).toEqual([]);
    expect(() => fillStepReferences(prompt, ['a', 'b'])).toThrow('refers to a step that was removed');
  });
});

describe('built-in Playground scenarios', () => {
  for (const [key, scenario] of Object.entries(SCENARIOS)) {
    it(`${key}: every later step uses an earlier step's output, and fills to valid JSON`, () => {
      scenario.steps.forEach((step, i) => {
        const refs = stepReferences(step.prompt);
        if (i > 0) expect(refs.length).toBeGreaterThan(0);
        for (const n of refs) expect(n).toBeLessThanOrEqual(i);
        const outputs = scenario.steps.map(() => 'output with "quotes"\nand lines');
        expect(() => JSON.parse(fillStepReferences(step.prompt, outputs))).not.toThrow();
      });
    });
  }
});
