/**
 * @jest-environment jsdom
 */
/**
 * @file src/__tests__/components/EvalSuite.test.tsx
 * @description Checks the Agent Eval Suite opens the tab a link asks for, and tests saved instruction edits or defaults.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EvalSuite } from '@/components/eval/EvalSuite';
import { saveCustomInstruction } from '@/lib/custom-instructions';

let search = '';
jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(search),
}));

describe('EvalSuite', () => {
  it('opens the System Diagram when linked with ?tab=diagram', () => {
    search = 'tab=diagram';
    render(<EvalSuite />);
    expect(screen.getByRole('img', { name: /letterly agent system diagram/i })).toBeInTheDocument();
  });

  it('opens Comparison when the link names no tab, or a tab that does not exist', () => {
    for (const query of ['', 'tab=nonsense']) {
      search = query;
      const { unmount } = render(<EvalSuite />);
      expect(screen.queryByRole('img', { name: /letterly agent system diagram/i })).toBeNull();
      expect(screen.getByRole('heading', { name: 'Single-Test Validation' })).toBeInTheDocument();
      unmount();
    }
  });
});

describe('EvalSuite instruction switch', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    search = '';
    localStorage.clear();
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ text: 'Dear Manager, vacation in July.', usedModel: 'm' }), text: async () => '' });
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  const runShortLetterTest = async () => {
    fireEvent.click(screen.getByRole('button', { name: /short letter generation/i }));
    fireEvent.click(screen.getByRole('button', { name: /run test/i }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    return JSON.parse(fetchMock.mock.calls[0][1].body);
  };

  it('starts on Defaults, and sends no instruction, when nothing is saved', async () => {
    render(<EvalSuite />);
    expect(await screen.findByRole('radio', { name: /defaults/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /your edits \(0\)/i })).toBeDisabled();
    expect(await runShortLetterTest()).not.toHaveProperty('systemInstruction');
  });

  it('starts on your edits when one is saved, and sends it', async () => {
    saveCustomInstruction('GENERATE', 'Sign off with Cheerio');
    render(<EvalSuite />);
    expect(await screen.findByRole('radio', { name: /your edits \(1\)/i })).toBeChecked();
    expect((await runShortLetterTest()).systemInstruction).toBe('Sign off with Cheerio');
    expect(await screen.findByText(/edited instruction/i)).toBeInTheDocument();
  });

  it('sends the default when switched back to Defaults', async () => {
    saveCustomInstruction('GENERATE', 'Sign off with Cheerio');
    render(<EvalSuite />);
    fireEvent.click(await screen.findByRole('radio', { name: /defaults/i }));
    expect(await runShortLetterTest()).not.toHaveProperty('systemInstruction');
  });
});
