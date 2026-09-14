/**
 * @jest-environment jsdom
 */
/**
 * @file src/__tests__/components/PlaygroundMode.test.tsx
 * @description Checks that removing a Playground step keeps later steps' {{step-N}} references pointing at the right step.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PlaygroundMode } from '@/components/eval/PlaygroundMode';

const fetchMock = jest.fn();

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockImplementation(async (url: string) => ({
    ok: true,
    json: async () => (url === '/api/refine' ? { text: '- refined notes', usedModel: 'm' } : { text: 'A letter', usedModel: 'm' }),
    text: async () => '',
  }));
  global.fetch = fetchMock as unknown as typeof fetch;
});

const bodySentTo = (url: string) => JSON.parse(fetchMock.mock.calls.find(([u]) => u === url)![1].body);

describe('PlaygroundMode', () => {
  it("passes an earlier step's output to a later step", async () => {
    render(<PlaygroundMode />);
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'refine_loop' } });
    fireEvent.click(screen.getByRole('button', { name: /run chain/i }));
    await waitFor(() => expect(screen.getByText(/run finished/i)).toBeInTheDocument());
    expect(bodySentTo('/api/generate').roughNotes).toBe('- refined notes');
    expect(bodySentTo('/api/sync-notes').editedLetter).toBe('A letter');
  });

  it('after removing a step, a later step still uses the step it named, and one that named the removed step says so', async () => {
    render(<PlaygroundMode />);
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'refine_loop' } });
    // Remove step 1 (Notes Editor). The Letter Generator used the removed step's notes, so it must stop with that
    // reason rather than read another step's output as its notes.
    fireEvent.click(screen.getAllByTitle('Remove step')[0]);
    fireEvent.click(screen.getByRole('button', { name: /run chain/i }));
    await waitFor(() => expect(screen.getByText(/run finished/i)).toBeInTheDocument());
    expect(screen.getAllByText(/refers to a step that was removed/i).length).toBeGreaterThan(0);
    expect(fetchMock.mock.calls.map(([u]) => u)).not.toContain('/api/generate');
  });
});
