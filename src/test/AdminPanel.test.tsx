import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminPanel } from '../components/AdminPanel';
import type { KidData, Reward } from '../types';

const mockKids: KidData[] = [
  {
    id: 'lior',
    name: 'Lior',
    age: 8,
    morning: [],
    evening: [],
    status: [],
    starBank: 12,
  },
  {
    id: 'roni',
    name: 'Roni',
    age: 6,
    morning: [],
    evening: [],
    status: [],
    starBank: 3,
  },
];

const mockRewards: Reward[] = [
  { id: 'r1', title: 'Movie night', starCost: 10 },
  { id: 'r2', title: 'Extra screen time', starCost: 5 },
];

describe('AdminPanel', () => {
  it('renders the admin panel title', () => {
    render(
      <AdminPanel
        kids={mockKids}
        rewards={mockRewards}
        onRedeemReward={vi.fn()}
        onClose={vi.fn()}
        isUnlocked={true}
        onRequestPin={vi.fn()}
      />
    );

    expect(screen.getByText('Parent Admin')).toBeInTheDocument();
  });

  it('displays star banks for all kids', () => {
    render(
      <AdminPanel
        kids={mockKids}
        rewards={mockRewards}
        onRedeemReward={vi.fn()}
        onClose={vi.fn()}
        isUnlocked={true}
        onRequestPin={vi.fn()}
      />
    );

    // Kid names appear in star bank section AND as redeem buttons
    // Check the heading-level elements for star bank
    const headings = screen.getAllByText('Lior');
    expect(headings.length).toBeGreaterThanOrEqual(1);
    const roniHeadings = screen.getAllByText('Roni');
    expect(roniHeadings.length).toBeGreaterThanOrEqual(1);
  });

  it('displays all rewards', () => {
    render(
      <AdminPanel
        kids={mockKids}
        rewards={mockRewards}
        onRedeemReward={vi.fn()}
        onClose={vi.fn()}
        isUnlocked={true}
        onRequestPin={vi.fn()}
      />
    );

    expect(screen.getByText('Movie night')).toBeInTheDocument();
    expect(screen.getByText('Extra screen time')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <AdminPanel
        kids={mockKids}
        rewards={mockRewards}
        onRedeemReward={vi.fn()}
        onClose={onClose}
        isUnlocked={true}
        onRequestPin={vi.fn()}
      />
    );

    await user.click(screen.getByText('Close Admin'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('disables redeem button when kid cannot afford reward', () => {
    render(
      <AdminPanel
        kids={mockKids}
        rewards={mockRewards}
        onRedeemReward={vi.fn()}
        onClose={vi.fn()}
        isUnlocked={true}
        onRequestPin={vi.fn()}
      />
    );

    // Roni has 3 stars, Movie night costs 10 - button should be disabled
    // Use title attribute to find the specific button
    const roniMovieButton = screen.getAllByTitle('Redeem for Roni')[0];
    expect(roniMovieButton).toBeDisabled();
  });

  it('calls onRedeemReward when unlocked and redeem is clicked', async () => {
    const user = userEvent.setup();
    const onRedeemReward = vi.fn();

    render(
      <AdminPanel
        kids={mockKids}
        rewards={mockRewards}
        onRedeemReward={onRedeemReward}
        onClose={vi.fn()}
        isUnlocked={true}
        onRequestPin={vi.fn()}
      />
    );

    // Lior has 12 stars, can afford Movie night (10)
    const liorButtons = screen.getAllByTitle('Redeem for Lior');
    await user.click(liorButtons[0]); // First one is for Movie night
    expect(onRedeemReward).toHaveBeenCalledWith('lior', 'r1');
  });

  it('calls onRequestPin when locked and redeem is clicked', async () => {
    const user = userEvent.setup();
    const onRequestPin = vi.fn();

    render(
      <AdminPanel
        kids={mockKids}
        rewards={mockRewards}
        onRedeemReward={vi.fn()}
        onClose={vi.fn()}
        isUnlocked={false}
        onRequestPin={onRequestPin}
      />
    );

    // Lior has 12 stars, can afford Movie night (10)
    const liorButtons = screen.getAllByTitle('Redeem for Lior');
    await user.click(liorButtons[0]);
    expect(onRequestPin).toHaveBeenCalledOnce();
  });
});
