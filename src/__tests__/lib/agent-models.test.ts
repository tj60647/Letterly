/**
 * @file src/__tests__/lib/agent-models.test.ts
 * @description Checks the model list and each agent's models are consistent and resilient.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 *
 * Whether each model still exists on OpenRouter is checked separately, against the live catalogue, by
 * scripts/check-model-catalogue.mts (run weekly and when agent-constants.ts changes).
 */

import { AGENTS, MODELS } from '@/lib/agent-constants';

const provider = (id: string) => id.split('/')[0];

describe('MODELS', () => {
  it('lists no free-tier (":free") models, which OpenRouter retires without notice', () => {
    expect(MODELS.filter(m => m.id.endsWith(':free')).map(m => m.id)).toEqual([]);
  });

  it('lists each model once', () => {
    const ids = MODELS.map(m => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('agent models', () => {
  it('uses only models that are listed, with the type the agent needs', () => {
    for (const agent of Object.values(AGENTS)) {
      for (const id of [agent.primary, ...agent.fallbacks]) {
        const listed = MODELS.find(m => m.id === id);
        expect({ agent: agent.id, model: id, type: listed?.type }).toEqual({ agent: agent.id, model: id, type: agent.type });
      }
    }
  });

  it('gives every chat agent a fallback from a different provider, so one provider outage cannot stop it', () => {
    for (const agent of Object.values(AGENTS).filter(a => a.type === 'chat')) {
      const otherProvider = agent.fallbacks.some(f => provider(f) !== provider(agent.primary));
      expect({ agent: agent.id, otherProvider }).toEqual({ agent: agent.id, otherProvider: true });
    }
  });
});
