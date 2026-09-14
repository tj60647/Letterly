/**
 * @file src/lib/request-guards.ts
 * @description Checks the parts of an API request that decide what a model call costs: which model, and how long an instruction.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 *
 * @see Key Concepts: Input Validation, Allowlists
 *
 * The API is public, so a request can name any model and send any instruction. Without these checks, anyone could use
 * the site's OpenRouter key to call any model OpenRouter sells. Every route calls `rejectDisallowed` before doing anything
 * else; a test in src/__tests__/lib/request-guards.test.ts checks that each route does.
 */

import { NextResponse } from 'next/server';
import { MODELS } from '@/lib/agent-constants';

/** The longest system instruction a request may send. Every default instruction is far shorter. */
export const MAX_INSTRUCTION_CHARS = 10_000;

export type ModelType = 'chat' | 'embedding';

/**
 * Returns a 400 response if the request names a model that isn't listed in MODELS for this kind of route, or sends a
 * system instruction that isn't text or is too long. Returns null when the request is acceptable.
 */
export function rejectDisallowed(body: unknown, type: ModelType): NextResponse | null {
  const { model, systemInstruction } = (body ?? {}) as Record<string, unknown>;

  if (model !== undefined && model !== null && model !== '') {
    const listed = typeof model === 'string' && MODELS.some(m => m.id === model && m.type === type);
    if (!listed) return NextResponse.json({ error: 'Model not allowed' }, { status: 400 });
  }

  if (systemInstruction !== undefined && systemInstruction !== null) {
    if (typeof systemInstruction !== 'string' || systemInstruction.length > MAX_INSTRUCTION_CHARS) {
      return NextResponse.json(
        { error: `System instruction must be text of at most ${MAX_INSTRUCTION_CHARS} characters` },
        { status: 400 }
      );
    }
  }

  return null;
}
