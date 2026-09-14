/**
 * @file src/__tests__/lib/rate-limit.test.ts
 * @description Checks the fixed-window rate limiter used by the API middleware.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 */

import { createRateLimiter } from '@/lib/rate-limit';

describe('createRateLimiter', () => {
  const clock = () => {
    let t = 1_000_000;
    return { now: () => t, advance: (ms: number) => { t += ms; } };
  };

  it('allows up to the limit in a window, then refuses with the seconds left', () => {
    const c = clock();
    const limiter = createRateLimiter({ limit: 3, windowMs: 60_000, now: c.now });
    for (let i = 0; i < 3; i++) expect(limiter.check('1.2.3.4')).toEqual({ allowed: true });
    c.advance(15_000);
    expect(limiter.check('1.2.3.4')).toEqual({ allowed: false, retryAfterSeconds: 45 });
  });

  it('counts each key separately', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000, now: clock().now });
    expect(limiter.check('a')).toEqual({ allowed: true });
    expect(limiter.check('b')).toEqual({ allowed: true });
    expect(limiter.check('a').allowed).toBe(false);
  });

  it('starts a new window once the old one ends', () => {
    const c = clock();
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000, now: c.now });
    expect(limiter.check('a').allowed).toBe(true);
    expect(limiter.check('a').allowed).toBe(false);
    c.advance(60_000);
    expect(limiter.check('a').allowed).toBe(true);
  });
});
