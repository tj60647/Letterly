/**
 * @jest-environment jsdom
 */
/**
 * @file src/__tests__/components/SystemDiagram.test.tsx
 * @description Checks the System Diagram draws the flow description, and can switch layouts.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 */

import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { SystemDiagram } from '@/components/eval/SystemDiagram';
import { LETTERLY_FLOW } from '@/lib/agent-flow';
import { AGENTS, MODELS } from '@/lib/agent-constants';

const svg = () => screen.getByRole('img', { name: /letterly agent system diagram/i });

describe('SystemDiagram', () => {
  it('draws a node for every node in the flow, titled from the flow', () => {
    render(<SystemDiagram />);
    for (const node of LETTERLY_FLOW.nodes) {
      expect(svg().querySelector(`[data-node="${node.id}"]`)).not.toBeNull();
      expect(within(svg().querySelector(`[data-node="${node.id}"]`) as HTMLElement).getByText(node.title)).toBeInTheDocument();
    }
  });

  it('draws and labels every wire', () => {
    render(<SystemDiagram />);
    expect(svg().querySelectorAll('[data-wire]')).toHaveLength(LETTERLY_FLOW.wires.length);
    expect(svg().querySelectorAll('[data-wire-label]')).toHaveLength(LETTERLY_FLOW.wires.length);
  });

  it('draws a port for every declared input and output', () => {
    render(<SystemDiagram />);
    const declared = LETTERLY_FLOW.nodes.reduce((n, node) => n + node.inputs.length + node.outputs.length, 0);
    expect(svg().querySelectorAll('[data-port]')).toHaveLength(declared);
  });

  it("shows each agent's model on its face, and names the agent whose model a helper borrows", () => {
    render(<SystemDiagram />);
    const face = (id: string) => svg().querySelector(`[data-node="${id}"] [data-face]`)?.textContent;
    const modelName = MODELS.find(m => m.id === AGENTS.GENERATE.primary)?.name;
    expect(face('GENERATE')).toContain(modelName);
    expect(face('DETECT_TONE_REQUEST')).toContain(AGENTS.REFINE.name);
  });

  it('shows when a wire fires on hover', () => {
    render(<SystemDiagram />);
    const wire = LETTERLY_FLOW.wires.find(w => w.id === 'SYNC_NOTES.newPoints->left-panel-out.roughNotes')!;
    fireEvent.mouseEnter(svg().querySelector(`[data-wire="${wire.id}"]`)!);
    expect(screen.getByText(wire.when)).toBeInTheDocument();
  });

  it("shows a node's description and triggers on hover", () => {
    render(<SystemDiagram />);
    fireEvent.mouseEnter(svg().querySelector('[data-node="RECOMMEND_LENGTH"]')!);
    const node = LETTERLY_FLOW.nodes.find(n => n.id === 'RECOMMEND_LENGTH')!;
    expect(screen.getByText(node.description)).toBeInTheDocument();
    expect(screen.getByText(node.triggers[0], { exact: false })).toBeInTheDocument();
  });

  it('starts in the columns layout, with column headings', () => {
    render(<SystemDiagram />);
    expect(screen.getByRole('button', { name: 'Columns' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(svg()).getByText('WHAT YOU GIVE')).toBeInTheDocument();
  });

  it('highlights both copies of a panel when either is hovered', () => {
    render(<SystemDiagram />);
    fireEvent.mouseEnter(svg().querySelector('[data-node="left-panel-in"]')!);
    expect(svg().querySelector('[data-node="left-panel-in"]')).toHaveAttribute('data-highlighted', 'true');
    expect(svg().querySelector('[data-node="left-panel-out"]')).toHaveAttribute('data-highlighted', 'true');
    expect(svg().querySelector('[data-node="center-panel-out"]')).toHaveAttribute('data-highlighted', 'false');
  });

  it('labels the interface agents change in plain words', () => {
    render(<SystemDiagram />);
    expect(within(svg().querySelector('[data-node="left-panel-out"]') as HTMLElement).getByText('tone dropdown')).toBeInTheDocument();
  });

  it('switches to the ELK layout, which has no column headings', async () => {
    render(<SystemDiagram />);
    fireEvent.click(screen.getByRole('button', { name: 'ELK' }));
    await screen.findByRole('button', { name: 'ELK', pressed: true });
    await screen.findByTestId('layout-elk', undefined, { timeout: 10000 });
    expect(within(svg()).queryByText('WHAT YOU GIVE')).toBeNull();
    expect(svg().querySelectorAll('[data-node]')).toHaveLength(LETTERLY_FLOW.nodes.length);
  });
});
