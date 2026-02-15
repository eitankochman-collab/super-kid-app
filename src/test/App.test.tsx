import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock isWeekendDay to return false by default (weekday mode)
vi.mock('../storage', async () => {
  const actual = await vi.importActual('../storage');
  return {
    ...actual,
    isWeekendDay: vi.fn(() => false),
  };
});

import App from '../App';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the app title', () => {
    render(<App />);
    expect(screen.getByText(/Luna's Super Sisters/)).toBeInTheDocument();
  });

  it('renders kid selector with both kids', () => {
    render(<App />);
    expect(screen.getByText('ליאור')).toBeInTheDocument();
    expect(screen.getByText('רוני')).toBeInTheDocument();
    expect(screen.getByText('Lior')).toBeInTheDocument();
    expect(screen.getByText('Roni')).toBeInTheDocument();
  });

  it('renders parent button', () => {
    render(<App />);
    expect(screen.getByTitle(/הורים/)).toBeInTheDocument();
  });

  it('shows morning tasks by default for selected kid', () => {
    render(<App />);
    expect(screen.getByText('Wake up')).toBeInTheDocument();
    expect(screen.getByText('Breakfast')).toBeInTheDocument();
  });

  it('switches between tabs', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Click afternoon tab
    await user.click(screen.getByText(/אחרי ביה״ס/));
    expect(screen.getByText('Lunchbox to sink')).toBeInTheDocument();

    // Click evening tab
    await user.click(screen.getByText(/ערב/));
    expect(screen.getByText('Tidy playroom')).toBeInTheDocument();

    // Click rewards tab
    await user.click(screen.getByText(/פרסים/));
    expect(screen.getByText(/חנות פרסים/)).toBeInTheDocument();
  });

  it('toggles task completion with Hebrew button text', async () => {
    const user = userEvent.setup();
    render(<App />);

    const doneButtons = screen.getAllByText(/סיימתי/);
    await user.click(doneButtons[0]);

    // Undo button is now a small button with title="ביטול"
    expect(screen.getAllByTitle('ביטול').length).toBeGreaterThanOrEqual(1);
  });

  it('shows progress display', () => {
    render(<App />);
    expect(screen.getByText(/מתוך/)).toBeInTheDocument();
  });

  it('switches selected kid when clicking kid card', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Click Roni's card
    await user.click(screen.getByText('רוני'));

    // Should still show morning tasks (default tab)
    expect(screen.getByText('Wake up')).toBeInTheDocument();
  });

  it('opens PIN modal when parent button clicked while locked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTitle(/הורים/));
    expect(screen.getByText(/הכנס קוד/)).toBeInTheDocument();
  });

  it('stays on current view after correct PIN (unlocks parent mode)', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTitle(/הורים/));

    await user.click(screen.getByText('1'));
    await user.click(screen.getByText('2'));
    await user.click(screen.getByText('3'));
    await user.click(screen.getByText('4'));

    await waitFor(() => {
      // Should show unlock indicator, NOT admin panel
      expect(screen.getByText(/🔓/)).toBeInTheDocument();
      expect(screen.queryByText(/ניהול הורים/)).not.toBeInTheDocument();
    });
  });

  it('awards 1 star automatically when completing a task', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Star bank starts at 0
    const doneButtons = screen.getAllByText(/סיימתי/);
    await user.click(doneButtons[0]);

    await waitFor(() => {
      const stored = localStorage.getItem('super-kid-app-state');
      expect(stored).not.toBeNull();
      const state = JSON.parse(stored!);
      expect(state.kids[0].starBank).toBe(1);
      expect(state.kids[0].status.some((s: { done: boolean }) => s.done)).toBe(true);
    });
  });

  it('removes 1 star when undoing a task', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Complete a task (+1 star)
    const doneButtons = screen.getAllByText(/סיימתי/);
    await user.click(doneButtons[0]);

    // Undo requires double-tap: first tap shows "?בטוח", second tap confirms
    const undoButton = screen.getAllByTitle('ביטול')[0];
    await user.click(undoButton);
    expect(screen.getByText('?בטוח')).toBeInTheDocument();
    await user.click(undoButton);

    await waitFor(() => {
      const stored = localStorage.getItem('super-kid-app-state');
      const state = JSON.parse(stored!);
      expect(state.kids[0].starBank).toBe(0);
    });
  });

  it('persists state to localStorage', async () => {
    const user = userEvent.setup();
    render(<App />);

    const doneButtons = screen.getAllByText(/סיימתי/);
    await user.click(doneButtons[0]);

    await waitFor(() => {
      const stored = localStorage.getItem('super-kid-app-state');
      expect(stored).not.toBeNull();
      const state = JSON.parse(stored!);
      expect(state.kids[0].status.some((s: { done: boolean }) => s.done)).toBe(true);
    });
  });

  it('shows Hebrew date', () => {
    render(<App />);
    expect(screen.getByText(/יום/)).toBeInTheDocument();
  });
});
