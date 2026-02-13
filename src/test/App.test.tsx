import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the app title', () => {
    render(<App />);
    expect(screen.getByText(/Super Kids/)).toBeInTheDocument();
  });

  it('renders both kid cards', () => {
    render(<App />);
    expect(screen.getByText('Lior')).toBeInTheDocument();
    expect(screen.getByText('Roni')).toBeInTheDocument();
  });

  it('renders Parent and Reset buttons', () => {
    render(<App />);
    expect(screen.getByText(/Parent/)).toBeInTheDocument();
    expect(screen.getByText(/Reset/)).toBeInTheDocument();
  });

  it('toggles task completion', async () => {
    const user = userEvent.setup();
    render(<App />);

    const doneButtons = screen.getAllByText(/^Done/);
    await user.click(doneButtons[0]);

    expect(screen.getAllByText(/Undo/).length).toBeGreaterThanOrEqual(1);
  });

  it('opens PIN modal when Parent button clicked while locked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText(/Parent/));
    expect(screen.getByText('Enter Parent PIN')).toBeInTheDocument();
  });

  it('opens admin panel after correct PIN', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText(/Parent/));

    await user.click(screen.getByText('1'));
    await user.click(screen.getByText('2'));
    await user.click(screen.getByText('3'));
    await user.click(screen.getByText('4'));

    await waitFor(() => {
      expect(screen.getByText('Parent Admin')).toBeInTheDocument();
    });
  });

  it('shows unlocked state after PIN entry', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Complete a task first
    const doneButtons = screen.getAllByText(/^Done/);
    await user.click(doneButtons[0]);

    // Click star button (requires PIN)
    const starButton = screen.getByText(/\+1/);
    await user.click(starButton);

    expect(screen.getByText('Enter Parent PIN')).toBeInTheDocument();

    await user.click(screen.getByText('1'));
    await user.click(screen.getByText('2'));
    await user.click(screen.getByText('3'));
    await user.click(screen.getByText('4'));

    await waitFor(() => {
      expect(screen.getByText(/Unlocked/)).toBeInTheDocument();
    });
    expect(screen.getByText(/Lock Now/)).toBeInTheDocument();
  });

  it('persists state to localStorage', async () => {
    const user = userEvent.setup();
    render(<App />);

    const doneButtons = screen.getAllByText(/^Done/);
    await user.click(doneButtons[0]);

    await waitFor(() => {
      const stored = localStorage.getItem('super-kid-app-state');
      expect(stored).not.toBeNull();
      const state = JSON.parse(stored!);
      expect(state.kids[0].status.some((s: { done: boolean }) => s.done)).toBe(true);
    });
  });
});
