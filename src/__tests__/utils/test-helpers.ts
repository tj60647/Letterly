/**
 * @file src/__tests__/utils/test-helpers.ts
 * @description Shared utilities and mocks for testing
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 */

import { NextRequest } from 'next/server';

/**
 * Creates a mock NextRequest for testing API routes
 */
export function createMockRequest(body: unknown, url = 'http://localhost:3000/api/test'): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Mock OpenAI client response
 */
export function createMockOpenAIResponse(content: string, model = 'test-model') {
  return {
    id: 'test-id',
    object: 'chat.completion',
    created: Date.now(),
    model,
    choices: [{
      index: 0,
      message: {
        role: 'assistant',
        content,
      },
      finish_reason: 'stop',
    }],
    usage: {
      prompt_tokens: 10,
      completion_tokens: 10,
      total_tokens: 20,
    },
  };
}

/**
 * Mock OpenRouter API calls
 */
export function mockOpenRouterAPI(responseContent: string) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => createMockOpenAIResponse(responseContent),
    headers: new Headers(),
    status: 200,
    statusText: 'OK',
  } as Response);
}

/**
 * Sample test data
 */
export const mockLetterData = {
  recipient: 'John Doe',
  sender: 'Jane Smith',
  tone: 'Professional',
  length: 'Medium',
  language: 'English',
  roughNotes: 'Need to request meeting\nDiscuss project timeline\nMention budget concerns',
  styleExample: '',
};

/**
 * Custom system instruction for testing
 */
export const customSystemInstruction = 'Always sign off with "Cheerio!"';
