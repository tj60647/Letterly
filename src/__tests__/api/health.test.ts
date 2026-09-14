/**
 * @file src/__tests__/api/health.test.ts
 * @description Checks /api/health reports whether the deployment can use its OpenRouter key, and nothing more.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 */

import * as health from '@/app/api/health/route';

const realFetch = global.fetch;
const savedKey = process.env.OPENROUTER_API_KEY;

const respond = (status: number, body: unknown) =>
  jest.fn(async () => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }));

describe('/api/health', () => {
  afterEach(() => {
    global.fetch = realFetch;
    process.env.OPENROUTER_API_KEY = savedKey;
  });

  it('is never prerendered or cached', async () => {
    expect(health.dynamic).toBe('force-dynamic');
    global.fetch = respond(200, { data: { limit_remaining: null } }) as unknown as typeof fetch;
    const res = await health.GET();
    expect(res.headers.get('cache-control')).toContain('no-store');
  });

  it('answers 200 {"ok":true} when OpenRouter accepts the key and it has no spending limit', async () => {
    global.fetch = respond(200, { data: { label: 'x', usage: 1, limit: null, limit_remaining: null } }) as unknown as typeof fetch;
    const res = await health.GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe('https://openrouter.ai/api/v1/key');
    expect(init.headers.Authorization).toBe(`Bearer ${process.env.OPENROUTER_API_KEY}`);
  });

  it('answers 200 while the key still has credit under its limit', async () => {
    global.fetch = respond(200, { data: { limit: 20, limit_remaining: 3.5 } }) as unknown as typeof fetch;
    expect((await health.GET()).status).toBe(200);
  });

  it('answers 503 {"ok":false} when the key has used up its spending limit', async () => {
    global.fetch = respond(200, { data: { limit: 20, limit_remaining: 0 } }) as unknown as typeof fetch;
    const res = await health.GET();
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ ok: false });
  });

  it('answers 503 when OpenRouter rejects the key', async () => {
    global.fetch = respond(401, { error: { message: 'No auth credentials found' } }) as unknown as typeof fetch;
    const res = await health.GET();
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ ok: false });
  });

  it('answers 503 when OpenRouter cannot be reached', async () => {
    global.fetch = jest.fn(async () => { throw new Error('network down'); }) as unknown as typeof fetch;
    expect((await health.GET()).status).toBe(503);
  });

  it('answers 503 without calling OpenRouter when no key is configured', async () => {
    delete process.env.OPENROUTER_API_KEY;
    global.fetch = respond(200, {}) as unknown as typeof fetch;
    const res = await health.GET();
    expect(res.status).toBe(503);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
