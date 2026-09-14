/**
 * @jest-environment jsdom
 */
/**
 * @file src/__tests__/components/EvalSuite.test.tsx
 * @description Checks the Agent Eval Suite opens the tab a link asks for.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { EvalSuite } from '@/components/eval/EvalSuite';

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
