/**
 * @jest-environment jsdom
 */
/**
 * @file src/__tests__/lib/custom-instructions.test.ts
 * @description Checks the browser storage for custom agent instructions, shared by the Writers' Room and the System Diagram.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 */

import fs from 'node:fs';
import path from 'node:path';
import { CUSTOM_INSTRUCTIONS_KEY, loadCustomInstructions, saveCustomInstruction } from '@/lib/custom-instructions';

describe('custom instruction storage', () => {
  beforeEach(() => localStorage.clear());

  it('loads nothing when nothing is saved', () => {
    expect(loadCustomInstructions()).toEqual({});
  });

  it('loads nothing, rather than failing, when what is saved is not valid JSON', () => {
    localStorage.setItem(CUSTOM_INSTRUCTIONS_KEY, '{not json');
    expect(loadCustomInstructions()).toEqual({});
  });

  it('saves one agent’s instruction without disturbing the others', () => {
    localStorage.setItem(CUSTOM_INSTRUCTIONS_KEY, JSON.stringify({ REFINE: 'keep me' }));
    saveCustomInstruction('GENERATE', 'Always sign off with "Cheerio!"');
    expect(loadCustomInstructions()).toEqual({ REFINE: 'keep me', GENERATE: 'Always sign off with "Cheerio!"' });
  });

  it('removes an agent’s instruction when saved as null, returning it to its default', () => {
    saveCustomInstruction('GENERATE', 'custom');
    saveCustomInstruction('GENERATE', null);
    expect(loadCustomInstructions()).toEqual({});
  });

  it('is the same storage the Writers’ Room uses', () => {
    const letterApp = fs.readFileSync(path.join(process.cwd(), 'src', 'components', 'LetterApp.tsx'), 'utf8');
    expect(letterApp).toContain('CUSTOM_INSTRUCTIONS_KEY');
    expect(letterApp).not.toContain(`'${CUSTOM_INSTRUCTIONS_KEY}'`);
  });
});
