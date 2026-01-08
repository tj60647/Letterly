/**
 * @file src/__tests__/api/refine.test.ts
 * @description Tests for /api/refine route with custom instructions
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 */

import { POST } from '@/app/api/refine/route';
import { createMockRequest } from '../utils/test-helpers';

jest.mock('@/lib/models', () => ({
  createOpenAIClient: jest.fn(() => ({})),
  callWithFallback: jest.fn(async (client, messages) => {
    const systemMessage = messages.find((m: any) => m.role === 'system');
    const hasCustomInstruction = systemMessage?.content?.includes('test custom');
    
    return {
      content: hasCustomInstruction 
        ? '- Meeting request\n- Project timeline\n- Budget discussion\n- Custom note added'
        : '- Meeting request\n- Project timeline\n- Budget discussion',
      usedModel: 'test-model',
    };
  }),
  AGENTS: {
    REFINE: {
      id: 'REFINE',
      name: 'Refinement Editor',
      type: 'chat',
      primary: 'test-model',
      fallbacks: [],
      systemInstruction: 'You are a writing assistant.',
    },
    DETECT_TONE_REQUEST: {
      id: 'DETECT_TONE_REQUEST',
      name: 'Tone Detector',
      type: 'chat',
      primary: 'test-model',
      fallbacks: [],
      systemInstruction: 'Detect tone.',
    },
  },
}));

describe('/api/refine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should refine rough notes with default instructions', async () => {
    const req = createMockRequest({
      roughNotes: '- Meeting needed\n- Timeline unclear',
      instructions: 'Add more detail about the budget',
      conversationHistory: [],
      currentTone: 'Professional',
      existingTones: ['Professional', 'Casual'],
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.text).toBeDefined();
    expect(data.text).toContain('Meeting');
  });

  it('should use custom systemInstruction when provided', async () => {
    const req = createMockRequest({
      roughNotes: '- Meeting needed',
      instructions: 'Add custom note',
      conversationHistory: [],
      currentTone: 'Professional',
      existingTones: ['Professional'],
      systemInstruction: 'You are a test custom assistant.',
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.text).toContain('Custom note added');
  });

  it('should return error when rough notes are missing', async () => {
    const req = createMockRequest({
      instructions: 'Add detail',
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });
});
