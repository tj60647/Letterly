/**
 * @file src/lib/eval-instructions.ts
 * @description Decides which saved instruction edits the Agent Eval Suite sends with a test.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 *
 * An author edits instructions in the Writers' Room or the System Diagram. The Eval Suite can test those edits or the
 * defaults. It only sends an edit to an agent whose route passes it to the model (the agents the System Diagram draws
 * with an instruction port), so a passing test never implies an edit had an effect it could not have.
 */

import { AGENTS, defaultInstruction } from './agent-constants';
import { LETTERLY_FLOW } from './agent-flow';
import { loadCustomInstructions } from './custom-instructions';
import type { RunOptions } from './eval-types';

const AGENTS_THAT_USE_EDITS = new Set(LETTERLY_FLOW.nodes.filter(n => n.role === 'agent' && n.instructionPort).map(n => n.id));

function usableEdits(): Record<string, string> {
  return Object.fromEntries(
    Object.entries(loadCustomInstructions()).filter(
      ([agentId, text]) =>
        AGENTS_THAT_USE_EDITS.has(agentId) &&
        typeof text === 'string' &&
        text.trim() !== '' &&
        // The Writers' Room Reset button saves a copy of the default rather than deleting the edit.
        text !== defaultInstruction(AGENTS[agentId as keyof typeof AGENTS])
    )
  );
}

/** The request options for one run: the agent's saved edit when edits are switched on and would reach the model. */
export function instructionOptions(agentId: string, useEdits: boolean): RunOptions {
  if (!useEdits) return {};
  const edit = usableEdits()[agentId];
  return edit ? { systemInstruction: edit } : {};
}

/** How many saved edits would reach a model. */
export function usableEditCount(): number {
  return Object.keys(usableEdits()).length;
}
