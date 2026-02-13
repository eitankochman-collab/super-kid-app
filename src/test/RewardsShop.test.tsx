import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RewardsShop } from '../components/RewardsShop';
import type { Reward } from '../types';

const mockRewards: Reward[] = [
  { id: 'r1', title: 'Movie night', starCost: 10 },
  { id: 'r2', title: 'Extra screen time', starCost: 5 },
];

describe('RewardsShop', () => {
  it('renders all rewards', () => {
    render(
      <RewardsShop rewards={mockRewards} starBank={15} onRedeemReward={vi.fn()} />
    );

    expect(screen.getByText(/Movie night/)).toBeInTheDocument();
    expect(screen.getByText(/Extra screen time/)).toBeInTheDocument();
  });

  it('shows empty state when no rewards', () => {
    render(
      <RewardsShop rewards={[]} starBank={0} onRedeemReward={vi.fn()} />
    );

    expect(screen.getByText(/No rewards available/)).toBeInTheDocument();
  });

  it('shows "Need X more" when reward is unaffordable', () => {
    render(
      <RewardsShop rewards={mockRewards} starBank={3} onRedeemReward={vi.fn()} />
    );

    expect(screen.getByText(/Need 7 more/)).toBeInTheDocument();
    expect(screen.getByText(/Need 2 more/)).toBeInTheDocument();
  });

  it('opens reward modal when affordable reward is clicked', async () => {
    const user = userEvent.setup();

    render(
      <RewardsShop rewards={mockRewards} starBank={15} onRedeemReward={vi.fn()} />
    );

    await user.click(screen.getByText(/Movie night/));
    expect(screen.getByText('Redeem Reward?')).toBeInTheDocument();
  });

  it('does not open modal for unaffordable reward', async () => {
    const user = userEvent.setup();

    render(
      <RewardsShop rewards={mockRewards} starBank={3} onRedeemReward={vi.fn()} />
    );

    await user.click(screen.getByText(/Movie night/));
    expect(screen.queryByText('Redeem Reward?')).not.toBeInTheDocument();
  });

  it('shows tip text when rewards exist', () => {
    render(
      <RewardsShop rewards={mockRewards} starBank={0} onRedeemReward={vi.fn()} />
    );

    expect(screen.getByText(/Complete tasks to earn more stars/)).toBeInTheDocument();
  });
});
