/**
 * @file src/__tests__/lib/request-guards.test.ts
 * @description Checks that API requests may only name listed models and send a bounded instruction.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 */

import fs from 'node:fs';
import path from 'node:path';
import { MODELS } from '@/lib/agent-constants';
import { rejectDisallowed, MAX_INSTRUCTION_CHARS } from '@/lib/request-guards';

const chatModel = MODELS.find(m => m.type === 'chat')!.id;
const embeddingModel = MODELS.find(m => m.type === 'embedding')!.id;

describe('rejectDisallowed', () => {
  it('allows a request that names no model and no instruction', () => {
    expect(rejectDisallowed({ roughNotes: 'x' }, 'chat')).toBeNull();
  });

  it('allows a listed model of the right type', () => {
    expect(rejectDisallowed({ model: chatModel }, 'chat')).toBeNull();
    expect(rejectDisallowed({ model: embeddingModel }, 'embedding')).toBeNull();
  });

  it('rejects a model that is not listed', async () => {
    const res = rejectDisallowed({ model: 'anthropic/claude-opus-5' }, 'chat');
    expect(res?.status).toBe(400);
    expect(await res!.json()).toEqual({ error: 'Model not allowed' });
  });

  it('rejects a listed model of the wrong type', () => {
    expect(rejectDisallowed({ model: embeddingModel }, 'chat')?.status).toBe(400);
    expect(rejectDisallowed({ model: chatModel }, 'embedding')?.status).toBe(400);
  });

  it('rejects a model that is not text', () => {
    expect(rejectDisallowed({ model: 42 }, 'chat')?.status).toBe(400);
  });

  it('allows an instruction up to the limit, and rejects one over it or one that is not text', () => {
    expect(rejectDisallowed({ systemInstruction: 'a'.repeat(MAX_INSTRUCTION_CHARS) }, 'chat')).toBeNull();
    expect(rejectDisallowed({ systemInstruction: 'a'.repeat(MAX_INSTRUCTION_CHARS + 1) }, 'chat')?.status).toBe(400);
    expect(rejectDisallowed({ systemInstruction: { text: 'x' } }, 'chat')?.status).toBe(400);
  });

  it('keeps every default agent instruction under the limit', async () => {
    const { AGENTS } = await import('@/lib/agent-constants');
    for (const agent of Object.values(AGENTS)) expect(agent.systemInstruction.length).toBeLessThanOrEqual(MAX_INSTRUCTION_CHARS);
  });
});

describe('every API route', () => {
  const apiDir = path.join(process.cwd(), 'src', 'app', 'api');
  // Routes that accept a request body (a POST handler). /api/health only answers GET and takes no input.
  const routes = fs.readdirSync(apiDir).filter(d => {
    const file = path.join(apiDir, d, 'route.ts');
    return fs.existsSync(file) && /export async function POST\(/.test(fs.readFileSync(file, 'utf8'));
  });

  it('checks the request with rejectDisallowed before using it', () => {
    expect(routes.length).toBeGreaterThan(0);
    for (const route of routes) {
      const source = fs.readFileSync(path.join(apiDir, route, 'route.ts'), 'utf8');
      expect({ route, guarded: /const rejected = rejectDisallowed\(body, '(chat|embedding)'\);\s*if \(rejected\) return rejected;/.test(source) })
        .toEqual({ route, guarded: true });
    }
  });
});
