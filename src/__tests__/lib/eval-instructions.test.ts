/**
 * @jest-environment jsdom
 */
/**
 * @file src/__tests__/lib/eval-instructions.test.ts
 * @description Checks which saved instruction edits the Eval Suite sends.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 */

import { saveCustomInstruction } from '@/lib/custom-instructions';
import { instructionOptions, usableEditCount } from '@/lib/eval-instructions';

describe('saved instruction edits in the Eval Suite', () => {
  beforeEach(() => localStorage.clear());

  it("sends an agent's saved edit when edits are switched on", () => {
    saveCustomInstruction('GENERATE', 'Sign off with Cheerio');
    expect(instructionOptions('GENERATE', true)).toEqual({ systemInstruction: 'Sign off with Cheerio' });
  });

  it('sends nothing when switched to defaults', () => {
    saveCustomInstruction('GENERATE', 'Sign off with Cheerio');
    expect(instructionOptions('GENERATE', false)).toEqual({});
  });

  it('sends nothing for an agent with no saved edit, or a blank one', () => {
    saveCustomInstruction('REFINE', '   ');
    expect(instructionOptions('GENERATE', true)).toEqual({});
    expect(instructionOptions('REFINE', true)).toEqual({});
  });

  it("ignores edits for agents whose route would not use them, as the System Diagram shows", () => {
    saveCustomInstruction('MATCH_SUGGESTIONS', 'ignored by its route');
    expect(instructionOptions('MATCH_SUGGESTIONS', true)).toEqual({});
  });

  it('counts only the edits that would reach a model', () => {
    saveCustomInstruction('GENERATE', 'a');
    saveCustomInstruction('SUGGEST', 'b');
    saveCustomInstruction('REFINE', '');
    saveCustomInstruction('MATCH_SUGGESTIONS', 'c');
    expect(usableEditCount()).toBe(2);
  });
});
