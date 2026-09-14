/**
 * @file src/lib/eval-chain.ts
 * @description Lets a Playground step use an earlier step's output, by writing {{step-N}} in its JSON input.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 *
 * Example: {"generatedLetter": "{{step-2}}"} sends the letter step 2 wrote. Steps are numbered from 1, as the
 * Playground shows them. The output is escaped as a JSON string, so a reference belongs inside quotes.
 */

const REFERENCE = /\{\{step-(\d+)\}\}/g;
/** What a reference to a removed step becomes, so it fails clearly instead of reading whichever step took its number. */
const REMOVED = '{{removed-step}}';

/** The step numbers a prompt refers to, in order, without repeats. */
export function stepReferences(prompt: string): number[] {
  return [...new Set([...prompt.matchAll(REFERENCE)].map(m => Number(m[1])))];
}

/**
 * Replaces each {{step-N}} with step N's output. `outputs[0]` is step 1's output.
 * Throws when a referenced step has no output, for example because it failed or has not run.
 */
export function fillStepReferences(prompt: string, outputs: (string | undefined)[]): string {
  if (prompt.includes(REMOVED)) throw new Error('This step refers to a step that was removed');
  return prompt.replace(REFERENCE, (_, n: string) => {
    const output = outputs[Number(n) - 1];
    if (output === undefined) throw new Error(`Step ${n} has no output to use`);
    return JSON.stringify(output).slice(1, -1);
  });
}

/**
 * Rewrites a prompt's references after step `removed` is deleted and the steps after it move up one place.
 * A reference to a later step is renumbered to follow it; a reference to the removed step is marked, so running fails
 * with a clear error.
 */
export function renumberAfterRemoval(prompt: string, removed: number): string {
  return prompt.replace(REFERENCE, (match, n: string) => {
    const step = Number(n);
    if (step === removed) return REMOVED;
    return step > removed ? `{{step-${step - 1}}}` : match;
  });
}
