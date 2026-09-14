/**
 * @file src/__tests__/middleware.test.ts
 * @description Checks the API middleware refuses other websites, oversized bodies, and too many requests.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 */

import { NextRequest } from 'next/server';

type Middleware = (req: NextRequest) => Response;

const SITE = 'https://letterly.example';

const request = (init: { method?: string; origin?: string; ip?: string; contentLength?: number; path?: string } = {}) => {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (init.origin) headers.origin = init.origin;
  if (init.ip) headers['x-forwarded-for'] = `${init.ip}, 10.0.0.1`;
  if (init.contentLength !== undefined) headers['content-length'] = String(init.contentLength);
  return new NextRequest(`${SITE}${init.path ?? '/api/generate'}`, { method: init.method ?? 'POST', headers });
};

/** A fresh copy of the middleware, so each test starts with an empty rate limiter and its own environment. */
const loadMiddleware = (env: Record<string, string> = {}): Middleware => {
  let middleware: Middleware | undefined;
  const saved = { ...process.env };
  Object.assign(process.env, env);
  jest.isolateModules(() => {
    middleware = jest.requireActual('../../middleware').default;
  });
  process.env = saved;
  return middleware!;
};

const passesThrough = (res: Response) => res.headers.get('x-middleware-next') === '1';

describe('API middleware', () => {
  it('lets a request from the site itself through', () => {
    const res = loadMiddleware()(request({ origin: SITE, ip: '1.1.1.1' }));
    expect(passesThrough(res)).toBe(true);
  });

  it('lets a request with no Origin through, as the app\'s own server-to-server calls send none', () => {
    const res = loadMiddleware()(request({ ip: '1.1.1.1' }));
    expect(passesThrough(res)).toBe(true);
  });

  it('refuses a request from another website', async () => {
    const res = loadMiddleware()(request({ origin: 'https://evil.example', ip: '1.1.1.1' }));
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: 'Cross-origin requests are not allowed' });
  });

  it('refuses a cross-origin preflight, and never grants access to every origin', () => {
    const middleware = loadMiddleware();
    const preflight = middleware(request({ method: 'OPTIONS', origin: 'https://evil.example' }));
    expect(preflight.status).toBe(403);
    const allowed = middleware(request({ origin: SITE, ip: '1.1.1.1' }));
    expect(allowed.headers.get('access-control-allow-origin')).toBeNull();
  });

  it('refuses a body larger than the limit', () => {
    const res = loadMiddleware()(request({ origin: SITE, ip: '1.1.1.1', contentLength: 200_001 }));
    expect(res.status).toBe(413);
  });

  it('refuses too many requests from one address, and says when to retry', () => {
    const middleware = loadMiddleware({ API_RATE_LIMIT_PER_MINUTE: '2' });
    expect(passesThrough(middleware(request({ origin: SITE, ip: '2.2.2.2' })))).toBe(true);
    expect(passesThrough(middleware(request({ origin: SITE, ip: '2.2.2.2' })))).toBe(true);
    const third = middleware(request({ origin: SITE, ip: '2.2.2.2' }));
    expect(third.status).toBe(429);
    expect(Number(third.headers.get('retry-after'))).toBeGreaterThan(0);
    expect(passesThrough(middleware(request({ origin: SITE, ip: '3.3.3.3' })))).toBe(true);
  });

  it('leaves pages other than the API alone', () => {
    const res = loadMiddleware()(request({ method: 'GET', origin: 'https://evil.example', path: '/eval' }));
    expect(passesThrough(res)).toBe(true);
  });
});
