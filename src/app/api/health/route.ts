/**
 * @file src/app/api/health/route.ts
 * @description Answers one question for monitors: can this deployment use its OpenRouter key right now?
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 *
 * @see Key Concepts: Health Checks, Monitoring
 *
 * Letterly's pages load even when no letter can be written: if the OpenRouter key is missing, rejected, or out of
 * credit, the home page still answers 200 while every agent fails. A monitor pointed at the home page would see a
 * healthy site. This route exists to be asked on a schedule, by .github/workflows/heartbeat.yml or any uptime check.
 *
 * Deliberately: no sign-in (a monitor can't sign in), no parameters, never cached, and a body carrying nothing but
 * {"ok":true} or {"ok":false}. The status code is the interface; a health endpoint is a bad place to describe the
 * inside of a system to whoever asks.
 *
 * The check calls OpenRouter's key endpoint, which reports whether the key is valid and how much of any spending limit
 * remains. It costs no credit.
 */

import { NextResponse } from 'next/server';

// A prerendered health check would report the health of the build, not of the running deployment.
export const dynamic = 'force-dynamic';

const KEY_ENDPOINT = 'https://openrouter.ai/api/v1/key';
const TIMEOUT_MS = 5_000;
const NO_STORE = { 'cache-control': 'no-store, max-age=0' };

const healthy = () => NextResponse.json({ ok: true }, { headers: NO_STORE });
const unhealthy = () => NextResponse.json({ ok: false }, { status: 503, headers: NO_STORE });

export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error('health: OPENROUTER_API_KEY is not configured');
    return unhealthy();
  }

  try {
    const res = await fetch(KEY_ENDPOINT, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error(`health: OpenRouter key check returned ${res.status}`);
      return unhealthy();
    }
    const body = (await res.json()) as { data?: { limit_remaining?: number | null } };
    const remaining = body.data?.limit_remaining;
    if (typeof remaining === 'number' && remaining <= 0) {
      console.error('health: the OpenRouter key has used up its spending limit');
      return unhealthy();
    }
    return healthy();
  } catch (error) {
    console.error('health: OpenRouter key check failed:', error instanceof Error ? error.message : String(error));
    return unhealthy();
  }
}
