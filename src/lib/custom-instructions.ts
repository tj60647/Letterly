/**
 * @file src/lib/custom-instructions.ts
 * @description Reads and writes the custom agent instructions an author saves in the browser.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 *
 * @see Key Concepts: Browser Storage (localStorage)
 *
 * The Writers' Room (LetterApp.tsx) and the System Diagram's agent settings both use this storage, so an instruction
 * edited in one place is the instruction used everywhere. Instructions are keyed by agent id (for example "GENERATE").
 */

/** The browser storage key both the Writers' Room and the System Diagram read and write. */
export const CUSTOM_INSTRUCTIONS_KEY = 'letterly-custom-instructions';

/** Every saved custom instruction, keyed by agent id. Returns an empty object if nothing valid is saved. */
export function loadCustomInstructions(): Record<string, string> {
  try {
    const stored = localStorage.getItem(CUSTOM_INSTRUCTIONS_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

/** Saves one agent's custom instruction, or removes it (returning the agent to its default) when given null. */
export function saveCustomInstruction(agentId: string, instruction: string | null): void {
  const all = loadCustomInstructions();
  if (instruction === null) delete all[agentId];
  else all[agentId] = instruction;
  localStorage.setItem(CUSTOM_INSTRUCTIONS_KEY, JSON.stringify(all));
}
