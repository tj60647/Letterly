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
import { LETTERLY_FLOW, STORIES } from '@/lib/agent-flow';
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
    const wire = LETTERLY_FLOW.wires.find(w => w.id === 'SYNC_NOTES.newPoints->rough-notes-out.roughNotes')!;
    fireEvent.mouseEnter(svg().querySelector(`[data-wire="${wire.id}"]`)!);
    expect(screen.getByText(wire.when)).toBeInTheDocument();
  });

  it('pins a node from the keyboard with Enter or Space', () => {
    render(<SystemDiagram />);
    const node = svg().querySelector('[data-node="REFINE"]')!;
    fireEvent.keyDown(node, { key: 'Enter' });
    expect(node).toHaveAttribute('aria-pressed', 'true');
    fireEvent.keyDown(node, { key: ' ' });
    expect(node).toHaveAttribute('aria-pressed', 'false');
  });

  it('lets a keyboard user focus a wire, read what it joins, and pin it', () => {
    render(<SystemDiagram />);
    const wire = LETTERLY_FLOW.wires.find(w => w.id === 'SYNC_NOTES.newPoints->rough-notes-out.roughNotes')!;
    const group = svg().querySelector(`[data-wire="${wire.id}"]`)!;
    expect(group).toHaveAttribute('tabindex', '0');
    expect(group).toHaveAttribute('role', 'button');
    expect(group.getAttribute('aria-label')).toContain(wire.when);
    fireEvent.keyDown(group, { key: 'Enter' });
    expect(group).toHaveAttribute('aria-pressed', 'true');
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

  it('tags the inputs that exist only after the first draft, in either layout', async () => {
    render(<SystemDiagram />);
    const check = () => {
      for (const node of LETTERLY_FLOW.nodes.filter(n => n.role === 'input')) {
        const el = svg().querySelector(`[data-node="${node.id}"]`)!;
        expect(el).toHaveAttribute('data-available', node.available);
        const tag = within(el as HTMLElement).queryByText('after first draft');
        expect({ node: node.id, tagged: tag !== null }).toEqual({ node: node.id, tagged: node.available === 'after-draft' });
      }
    };
    check();
    expect(within(svg()).getByText('FROM THE START')).toBeInTheDocument();
    expect(within(svg()).getByText('AFTER THE FIRST DRAFT')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'ELK' }));
    await screen.findByTestId('layout-elk', undefined, { timeout: 10000 });
    check();
  });

  it('says when an input becomes available in the info panel', () => {
    render(<SystemDiagram />);
    fireEvent.mouseEnter(svg().querySelector('[data-node="chips-in"]')!);
    expect(screen.getByText('Available after the first draft')).toBeInTheDocument();
    fireEvent.mouseEnter(svg().querySelector('[data-node="rough-notes-in"]')!);
    expect(screen.getByText('Available from the start')).toBeInTheDocument();
  });

  it('draws no subtitle on nodes, and shows it in the info panel instead', () => {
    render(<SystemDiagram />);
    expect(within(svg().querySelector('[data-node="GENERATE"]') as HTMLElement).queryByText('GENERATE')).toBeNull();
    expect(within(svg().querySelector('[data-node="chips-in"]') as HTMLElement).queryByText('Right panel')).toBeNull();
    fireEvent.mouseEnter(svg().querySelector('[data-node="chips-in"]')!);
    expect(screen.getByText('Right panel', { exact: false })).toBeInTheDocument();
  });

  describe('agent settings', () => {
    beforeEach(() => localStorage.clear());
    const gear = (id: string) => svg().querySelector(`[data-node="${id}"] [data-gear]`) as HTMLElement | null;

    it('puts a gear on every agent node, and on no interface node', () => {
      render(<SystemDiagram />);
      for (const node of LETTERLY_FLOW.nodes) {
        expect({ node: node.id, gear: gear(node.id) !== null }).toEqual({ node: node.id, gear: node.role === 'agent' });
      }
    });

    it("opens an agent's settings from its gear, with its model and instruction", () => {
      render(<SystemDiagram />);
      fireEvent.click(gear('GENERATE')!);
      const dialog = screen.getByRole('dialog', { name: `${AGENTS.GENERATE.name} settings` });
      expect(within(dialog).getByText(MODELS.find(m => m.id === AGENTS.GENERATE.primary)!.name)).toBeInTheDocument();
      expect(within(dialog).getByRole('textbox', { name: 'System instruction' })).toHaveValue(AGENTS.GENERATE.systemInstruction);
      expect(within(dialog).getByText('Default')).toBeInTheDocument();
      // Opening settings is not the same as pinning the node.
      expect(svg().querySelector('[data-node="GENERATE"]')).toHaveAttribute('aria-pressed', 'false');
    });

    it('saves an edited instruction where the Writers’ Room reads it, and resets it to the default', () => {
      render(<SystemDiagram />);
      fireEvent.click(gear('GENERATE')!);
      const dialog = screen.getByRole('dialog', { name: `${AGENTS.GENERATE.name} settings` });
      fireEvent.click(within(dialog).getByRole('button', { name: 'Edit' }));
      fireEvent.change(within(dialog).getByRole('textbox', { name: 'System instruction' }), { target: { value: 'Always sign off with "Cheerio!"' } });
      fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
      expect(JSON.parse(localStorage.getItem('letterly-custom-instructions')!)).toEqual({ GENERATE: 'Always sign off with "Cheerio!"' });
      expect(within(dialog).getByText('Custom')).toBeInTheDocument();

      fireEvent.click(within(dialog).getByRole('button', { name: 'Reset to default' }));
      expect(JSON.parse(localStorage.getItem('letterly-custom-instructions')!)).toEqual({});
      expect(within(dialog).getByRole('textbox', { name: 'System instruction' })).toHaveValue(AGENTS.GENERATE.systemInstruction);
    });

    it('shows the instruction read-only, with the reason, where an edit would not reach the model', () => {
      render(<SystemDiagram />);
      fireEvent.click(gear('MATCH_SUGGESTIONS')!);
      const dialog = screen.getByRole('dialog', { name: `${AGENTS.MATCH_SUGGESTIONS.name} settings` });
      const node = LETTERLY_FLOW.nodes.find(n => n.id === 'MATCH_SUGGESTIONS')!;
      expect(within(dialog).queryByRole('button', { name: 'Edit' })).toBeNull();
      expect(within(dialog).getByRole('textbox', { name: 'System instruction' })).toHaveAttribute('readonly');
      expect(within(dialog).getByText(node.instructionNote!)).toBeInTheDocument();
    });

    it('closes with the close button or Escape', () => {
      render(<SystemDiagram />);
      fireEvent.click(gear('REFINE')!);
      fireEvent.click(screen.getByRole('button', { name: 'Close settings' }));
      expect(screen.queryByRole('dialog')).toBeNull();
      fireEvent.click(gear('REFINE')!);
      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('highlights both copies of a field when either is hovered', () => {
    render(<SystemDiagram />);
    fireEvent.mouseEnter(svg().querySelector('[data-node="tone-in"]')!);
    expect(svg().querySelector('[data-node="tone-in"]')).toHaveAttribute('data-highlighted', 'true');
    expect(svg().querySelector('[data-node="tone-out"]')).toHaveAttribute('data-highlighted', 'true');
    expect(svg().querySelector('[data-node="length-out"]')).toHaveAttribute('data-highlighted', 'false');
  });

  it('labels the interface agents change in plain words', () => {
    render(<SystemDiagram />);
    expect(within(svg().querySelector('[data-node="tone-out"]') as HTMLElement).getByText('options and selection')).toBeInTheDocument();
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

describe('SystemDiagram stories, measures, and fallbacks', () => {
  const lit = (selector: string) => svg().querySelector(selector)?.getAttribute('data-lit');
  const gear = (id: string) => svg().querySelector(`[data-node="${id}"] [data-gear]`) as HTMLElement;

  it('offers a story for each thing the author does, and lights only what fires for the chosen one', () => {
    render(<SystemDiagram />);
    const group = screen.getByRole('group', { name: 'Story' });
    expect(within(group).getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true');
    for (const story of STORIES) expect(within(group).getByRole('button', { name: story.label })).toBeInTheDocument();

    const typing = STORIES.find(s => s.id === 'chat-typing')!;
    fireEvent.click(within(group).getByRole('button', { name: typing.label }));
    expect(screen.getByText(typing.description)).toBeInTheDocument();
    expect(lit('[data-wire="chat-message-in.draft->MATCH_SUGGESTIONS.chatInput"]')).toBe('true');
    expect(lit('[data-wire="GENERATE.letter->letter-out.letter"]')).toBe('false');
    expect(lit('[data-node="MATCH_SUGGESTIONS"]')).toBe('true');
    expect(lit('[data-node="GENERATE"]')).toBe('false');

    fireEvent.click(within(group).getByRole('button', { name: 'All' }));
    expect(lit('[data-wire="GENERATE.letter->letter-out.letter"]')).toBe('true');
    expect(lit('[data-node="GENERATE"]')).toBe('true');
  });

  it('still answers a hover on a node outside the chosen story, then returns to the story', () => {
    render(<SystemDiagram />);
    const group = screen.getByRole('group', { name: 'Story' });
    fireEvent.click(within(group).getByRole('button', { name: STORIES.find(s => s.id === 'chat-typing')!.label }));
    expect(lit('[data-node="SCORED"]')).toBe('false');

    fireEvent.mouseEnter(svg().querySelector('[data-node="SCORED"]')!);
    expect(lit('[data-node="SCORED"]')).toBe('true');
    expect(lit('[data-wire="GENERATE.letter->SCORED.letter"]')).toBe('true');
    expect(lit('[data-wire="chat-message-in.draft->MATCH_SUGGESTIONS.chatInput"]')).toBe('false');

    fireEvent.mouseLeave(svg().querySelector('[data-node="SCORED"]')!);
    expect(lit('[data-node="SCORED"]')).toBe('false');
    expect(lit('[data-wire="chat-message-in.draft->MATCH_SUGGESTIONS.chatInput"]')).toBe('true');
  });

  it('draws a similarity measure with cut corners, and an agent as a box', () => {
    render(<SystemDiagram />);
    expect(svg().querySelector('[data-node="SCORED"] [data-shape="measure"]')).not.toBeNull();
    expect(svg().querySelector('[data-node="MATCH_SUGGESTIONS_SCORER"] [data-shape="measure"]')).not.toBeNull();
    expect(svg().querySelector('[data-node="GENERATE"] [data-shape="measure"]')).toBeNull();
  });

  it('marks a fallback on its node and says what it stands in for', () => {
    render(<SystemDiagram />);
    const node = svg().querySelector('[data-node="MATCH_SUGGESTIONS_SCORER"]') as HTMLElement;
    expect(within(node).getByText('fallback')).toBeInTheDocument();
    expect(within(svg().querySelector('[data-node="MATCH_SUGGESTIONS"]') as HTMLElement).queryByText('fallback')).toBeNull();
    fireEvent.mouseEnter(node);
    expect(screen.getByText(`Stands in for: ${AGENTS.MATCH_SUGGESTIONS.name}`)).toBeInTheDocument();
  });

  it('heads the agent columns by what they read, not by a step number', () => {
    render(<SystemDiagram />);
    expect(within(svg()).getByText('AGENTS · READ WHAT YOU GIVE')).toBeInTheDocument();
    expect(within(svg()).getAllByText('AGENTS · READ ANOTHER AGENT').length).toBeGreaterThan(0);
    expect(within(svg()).queryByText(/STEP/)).toBeNull();
  });

  it('calls similarity measures what they are in the legend', () => {
    render(<SystemDiagram />);
    expect(screen.getAllByText(/similarity measure/i).length).toBeGreaterThan(0);
    expect(screen.queryByText('Embedding Agent')).toBeNull();
    // Measures run in the background too, so the dashed-border legend cannot call them agents.
    expect(screen.queryByText('Background agent')).toBeNull();
    expect(screen.getByText('Background: runs without being asked')).toBeInTheDocument();
    // The Scorer runs when the Matcher answers without a match list, not on every failure.
    expect(screen.getByText('Runs only when the agent it stands in for answers without a result')).toBeInTheDocument();
  });

  it('shows what a similarity measure computes, with no instruction box and no Default badge', () => {
    render(<SystemDiagram />);
    fireEvent.click(gear('SCORED'));
    const dialog = screen.getByRole('dialog', { name: `${AGENTS.SCORED.name} settings` });
    const node = LETTERLY_FLOW.nodes.find(n => n.id === 'SCORED')!;
    expect(within(dialog).getByText('What it computes')).toBeInTheDocument();
    expect(within(dialog).getByText(node.computes!)).toBeInTheDocument();
    expect(within(dialog).queryByRole('textbox', { name: 'System instruction' })).toBeNull();
    expect(within(dialog).queryByText('Default')).toBeNull();
    expect(within(dialog).queryByText(/system instruction/i)).toBeNull();
  });

  it('says in its settings what a fallback stands in for', () => {
    render(<SystemDiagram />);
    fireEvent.click(gear('MATCH_SUGGESTIONS_SCORER'));
    const dialog = screen.getByRole('dialog', { name: `${AGENTS.MATCH_SUGGESTIONS_SCORER.name} settings` });
    const term = within(dialog).getByText('Stands in for');
    expect(term.nextElementSibling?.textContent).toContain(AGENTS.MATCH_SUGGESTIONS.name);
  });
});
