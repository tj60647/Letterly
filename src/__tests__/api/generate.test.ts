/**
 * @file src/__tests__/api/generate.test.ts
 * @description Tests for /api/generate route with custom instructions
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 */

import { POST } from '@/app/api/generate/route';
import { createMockRequest, mockOpenRouterAPI, mockLetterData, customSystemInstruction } from '../utils/test-helpers';

// Mock the models module
jest.mock('@/lib/models', () => ({
  createOpenAIClient: jest.fn(() => ({})),
  callWithFallback: jest.fn(async (client, messages) => {
    // Extract system instruction from messages
    const systemMessage = messages.find((m: { role: string; content?: string }) => m.role === 'system');
    const hasCustomInstruction = systemMessage?.content?.includes('Cheerio');
    
    return {
      content: hasCustomInstruction 
        ? 'Dear John,\n\nLet\'s discuss the project.\n\nCheers,\nJane\n\nCheerio!'
        : 'Dear John,\n\nLet\'s discuss the project.\n\nBest regards,\nJane',
      usedModel: 'test-model',
    };
  }),
  AGENTS: {
    GENERATE: {
      id: 'GENERATE',
      name: 'Letter Generator',
      type: 'chat',
      primary: 'test-model',
      fallbacks: [],
      systemInstruction: 'Act as an expert writer.',
    },
  },
}));

describe('/api/generate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate a letter with default instructions', async () => {
    const req = createMockRequest(mockLetterData);
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.text).toBeDefined();
    expect(data.usedModel).toBe('test-model');
    expect(data.text).not.toContain('Cheerio');
  });

  it('should use custom systemInstruction when provided', async () => {
    const req = createMockRequest({
      ...mockLetterData,
      systemInstruction: customSystemInstruction,
    });
    
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.text).toBeDefined();
    expect(data.text).toContain('Cheerio');
  });

  it('should return error when notes are missing', async () => {
    const req = createMockRequest({
      ...mockLetterData,
      roughNotes: '',
    });
    
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Rough notes are required');
  });

  it('should accept a listed model override', async () => {
    const { callWithFallback } = jest.requireMock('@/lib/models');
    const req = createMockRequest({
      ...mockLetterData,
      model: 'openai/gpt-oss-20b',
    });

    const response = await POST(req);

    expect(response.status).toBe(200);
    const agentArg = callWithFallback.mock.calls[0][2];
    expect(agentArg.primary).toBe('openai/gpt-oss-20b');
  });

  it('should refuse a model that is not listed, without calling any model', async () => {
    const { callWithFallback } = jest.requireMock('@/lib/models');
    const req = createMockRequest({
      ...mockLetterData,
      model: 'anthropic/claude-opus-5',
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Model not allowed');
    expect(callWithFallback).not.toHaveBeenCalled();
  });
});
