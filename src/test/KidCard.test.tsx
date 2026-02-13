import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KidCard } from '../components/KidCard';
import type { KidData, Reward } from '../types';

const mockKid: KidData = {
  id: 'lior',
  name: 'Lior',
  age: 8,
  morning: [
    { id: 'm1', hebrew: 'קמים מהמיטה', english: 'Wake up', emoji: '🌅' },
    { id: 'm2', hebrew: 'שירותים', english: 'Bathroom', emoji: '🚽' },
  ],
  evening: [
    { id: 'e1', hebrew: 'קופסת אוכל לכיור', english: 'Lunchbox to sink', emoji: '🍱' },
  ],
  status: [],
  starBank: 5,
};

const mockRewards: Reward[] = [
  { id: 'r1', title: 'Movie night', starCost: 10 },
];

describe('KidCard', () => {
  it('renders kid name, age, and star bank', () => {
    render(
      <KidCard
        kid={mockKid}
        rewards={mockRewards}
        onToggleDone={vi.fn()}
        onAddStar={vi.fn()}
        onRedeemReward={vi.fn()}
        isUnlocked={false}
      />
    );

    expect(screen.getByText('Lior')).toBeInTheDocument();
    expect(screen.getByText('8 years old')).toBeInTheDocument();
  });

  it('shows morning tasks by default', () => {
    render(
      <KidCard
        kid={mockKid}
        rewards={mockRewards}
        onToggleDone={vi.fn()}
        onAddStar={vi.fn()}
        onRedeemReward={vi.fn()}
        isUnlocked={false}
      />
    );

    expect(screen.getByText('Wake up')).toBeInTheDocument();
    expect(screen.getByText('Bathroom')).toBeInTheDocument();
  });

  it('switches to evening tasks when tab is clicked', async () => {
    const user = userEvent.setup();

    render(
      <KidCard
        kid={mockKid}
        rewards={mockRewards}
        onToggleDone={vi.fn()}
        onAddStar={vi.fn()}
        onRedeemReward={vi.fn()}
        isUnlocked={false}
      />
    );

    await user.click(screen.getByText(/Evening/));
    expect(screen.getByText('Lunchbox to sink')).toBeInTheDocument();
  });

  it('switches to rewards tab and shows rewards shop', async () => {
    const user = userEvent.setup();

    render(
      <KidCard
        kid={mockKid}
        rewards={mockRewards}
        onToggleDone={vi.fn()}
        onAddStar={vi.fn()}
        onRedeemReward={vi.fn()}
        isUnlocked={false}
      />
    );

    await user.click(screen.getByText(/Rewards/));
    // RewardsShop renders reward title with "🎁 " prefix
    expect(screen.getByText(/Movie night/)).toBeInTheDocument();
  });

  it('shows progress bar at 0% when no tasks done', () => {
    render(
      <KidCard
        kid={mockKid}
        rewards={mockRewards}
        onToggleDone={vi.fn()}
        onAddStar={vi.fn()}
        onRedeemReward={vi.fn()}
        isUnlocked={false}
      />
    );

    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('shows correct progress when some tasks done', () => {
    const kidWithProgress: KidData = {
      ...mockKid,
      status: [{ taskId: 'm1', done: true, stars: 0 }],
    };

    render(
      <KidCard
        kid={kidWithProgress}
        rewards={mockRewards}
        onToggleDone={vi.fn()}
        onAddStar={vi.fn()}
        onRedeemReward={vi.fn()}
        isUnlocked={false}
      />
    );

    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('calls onToggleDone with correct kidId and taskId', async () => {
    const user = userEvent.setup();
    const onToggleDone = vi.fn();

    render(
      <KidCard
        kid={mockKid}
        rewards={mockRewards}
        onToggleDone={onToggleDone}
        onAddStar={vi.fn()}
        onRedeemReward={vi.fn()}
        isUnlocked={false}
      />
    );

    const doneButtons = screen.getAllByText(/Done/);
    await user.click(doneButtons[0]);
    expect(onToggleDone).toHaveBeenCalledWith('lior', 'm1');
  });
});
