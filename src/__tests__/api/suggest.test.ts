/**
 * @file src/__tests__/api/suggest.test.ts
 * @description Tests for /api/suggest route with custom instructions
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 */

import { POST } from '@/app/api/suggest/route';
import { createMockRequest } from '../utils/test-helpers';

jest.mock('@/lib/models', () => ({
  createOpenAIClient: jest.fn(() => ({})),
  callWithFallback: jest.fn(async (client, messages) => {
    const systemMessage = messages.find((m: any) => m.role === 'system');
    const hasCustomInstruction = systemMessage?.content?.includes('extra detail');
    
    return {
      content: hasCustomInstruction
        ? '["Add meeting date", "Specify budget amount", "Include extra detail about timeline"]'
        : '["Add meeting date", "Specify budget amount", "Clarify timeline"]',
      usedModel: 'test-model',
    };
  }),
  AGENTS: {
    SUGGEST: {
      id: 'SUGGEST',
      name: 'Suggestions',
      type: 'chat',
      primary: 'test-model',
      fallbacks: [],
      systemInstruction: 'Act as an expert editor.',
    },
  },
}));

describe('/api/suggest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate suggestions with default instructions', async () => {
    const req = createMockRequest({
      roughNotes: '- Need meeting\n- Discuss timeline',
      context: 'Letter',
      recipient: 'John Doe',
      tone: 'Professional',
      length: 'Medium',
      generatedLetter: 'Dear John, Let\'s meet soon.',
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.suggestions).toBeDefined();
    expect(Array.isArray(data.suggestions)).toBe(true);
    expect(data.suggestions.length).toBeGreaterThan(0);
  });

  it('should use custom systemInstruction when provided', async () => {
    const req = createMockRequest({
      roughNotes: '- Need meeting',
      context: 'Letter',
      recipient: 'John Doe',
      tone: 'Professional',
      length: 'Medium',
      generatedLetter: 'Dear John, Let\'s meet.',
      systemInstruction: 'Provide suggestions with extra detail.',
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.suggestions).toBeDefined();
    expect(data.suggestions.some((s: string) => s.includes('extra detail'))).toBe(true);
  });

  it('should return error when required fields are missing', async () => {
    const req = createMockRequest({
      roughNotes: '',
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });
});
