/**
 * @file scripts/check-model-catalogue.mts
 * @description Checks that every OpenRouter model Letterly lists still exists in OpenRouter's live catalogue.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 *
 * Run with: node --experimental-strip-types scripts/check-model-catalogue.mts
 *
 * Exits with an error, naming each missing model, if any listed chat or embedding model is gone. Image models are called
 * through Google directly, not OpenRouter, so they aren't checked here. The catalogue endpoints are public; no key is used.
 * .github/workflows/model-catalogue.yml runs this weekly and whenever agent-constants.ts changes.
 */

import { MODELS } from '../src/lib/agent-constants.ts';

const CATALOGUES = {
  chat: 'https://openrouter.ai/api/v1/models',
  embedding: 'https://openrouter.ai/api/v1/embeddings/models',
} as const;

async function catalogueIds(url: string): Promise<Set<string>> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  const body = (await res.json()) as { data: Array<{ id: string }> };
  return new Set(body.data.map(m => m.id));
}

const [chatIds, embeddingIds] = await Promise.all([catalogueIds(CATALOGUES.chat), catalogueIds(CATALOGUES.embedding)]);

const checked = MODELS.filter(m => m.type === 'chat' || m.type === 'embedding');
const missing = checked.filter(m => !(m.type === 'chat' ? chatIds : embeddingIds).has(m.id));

for (const m of checked) console.log(`${missing.includes(m) ? 'MISSING' : 'ok     '}  ${m.type.padEnd(9)}  ${m.id}`);

if (missing.length > 0) {
  console.error(`\n${missing.length} listed model(s) no longer exist on OpenRouter. Replace them in src/lib/agent-constants.ts.`);
  // Set the exit code rather than calling process.exit(), which can crash Node on Windows while network handles close.
  process.exitCode = 1;
} else {
  console.log(`\nAll ${checked.length} listed models exist on OpenRouter.`);
}
