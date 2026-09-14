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

/** The step numbers a prompt refers to, in order, without repeats. */
export function stepReferences(prompt: string): number[] {
  return [...new Set([...prompt.matchAll(REFERENCE)].map(m => Number(m[1])))];
}

/**
 * Replaces each {{step-N}} with step N's output. `outputs[0]` is step 1's output.
 * Throws when a referenced step has no output, for example because it failed or has not run.
 */
export function fillStepReferences(prompt: string, outputs: (string | undefined)[]): string {
  return prompt.replace(REFERENCE, (_, n: string) => {
    const output = outputs[Number(n) - 1];
    if (output === undefined) throw new Error(`Step ${n} has no output to use`);
    return JSON.stringify(output).slice(1, -1);
  });
}
