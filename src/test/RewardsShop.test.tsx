import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RewardsShop } from '../components/RewardsShop';
import type { Reward } from '../types';

const mockRewards: Reward[] = [
  { id: 'r1', title: 'Movie night', hebrew: 'סרט ערב', emoji: '🎬', starCost: 10, tier: 'weekly' },
  { id: 'r2', title: 'Extra screen time', hebrew: 'זמן מסך נוסף', emoji: '📱', starCost: 5, tier: 'quick' },
];

describe('RewardsShop', () => {
  it('renders all rewards', () => {
    render(
      <RewardsShop rewards={mockRewards} starBank={15} onRedeemReward={vi.fn()} />
    );

    expect(screen.getByText('סרט ערב')).toBeInTheDocument();
    expect(screen.getByText('זמן מסך נוסף')).toBeInTheDocument();
    expect(screen.getByText('Movie night')).toBeInTheDocument();
    expect(screen.getByText('Extra screen time')).toBeInTheDocument();
  });

  it('shows empty state when no rewards', () => {
    render(
      <RewardsShop rewards={[]} starBank={0} onRedeemReward={vi.fn()} />
    );

    expect(screen.getByText(/אין פרסים/)).toBeInTheDocument();
  });

  it('shows "צריך עוד" when reward is unaffordable', () => {
    render(
      <RewardsShop rewards={mockRewards} starBank={3} onRedeemReward={vi.fn()} />
    );

    expect(screen.getByText(/צריך עוד 7/)).toBeInTheDocument();
    expect(screen.getByText(/צריך עוד 2/)).toBeInTheDocument();
  });

  it('shows shop header with star count', () => {
    render(
      <RewardsShop rewards={mockRewards} starBank={15} onRedeemReward={vi.fn()} />
    );

    expect(screen.getByText(/חנות פרסים/)).toBeInTheDocument();
    expect(screen.getByText(/15 ⭐ זמינים/)).toBeInTheDocument();
  });

  it('opens reward modal when affordable reward is clicked', async () => {
    const user = userEvent.setup();

    render(
      <RewardsShop rewards={mockRewards} starBank={15} onRedeemReward={vi.fn()} />
    );

    await user.click(screen.getByText('סרט ערב'));
    expect(screen.getByText(/לפדות פרס/)).toBeInTheDocument();
  });

  it('does not open modal for unaffordable reward', async () => {
    const user = userEvent.setup();

    render(
      <RewardsShop rewards={mockRewards} starBank={3} onRedeemReward={vi.fn()} />
    );

    await user.click(screen.getByText('סרט ערב'));
    expect(screen.queryByText(/לפדות פרס/)).not.toBeInTheDocument();
  });

  it('renders rewards in a grid layout within tier groups', () => {
    const { container } = render(
      <RewardsShop rewards={mockRewards} starBank={15} onRedeemReward={vi.fn()} />
    );

    expect(container.querySelector('.grid.grid-cols-3')).toBeInTheDocument();
  });
});
