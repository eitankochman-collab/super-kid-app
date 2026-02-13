import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RewardModal } from '../components/RewardModal';
import type { Reward } from '../types';

const mockReward: Reward = {
  id: 'r1',
  title: 'Movie night',
  starCost: 10,
};

describe('RewardModal', () => {
  it('renders reward details', () => {
    render(
      <RewardModal
        reward={mockReward}
        starBank={15}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText('Movie night')).toBeInTheDocument();
    expect(screen.getByText('Redeem Reward?')).toBeInTheDocument();
  });

  it('shows cost, current stars, and remaining stars', () => {
    render(
      <RewardModal
        reward={mockReward}
        starBank={15}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    // Check specific labeled values
    expect(screen.getByText('Cost:')).toBeInTheDocument();
    expect(screen.getByText('You have:')).toBeInTheDocument();
    expect(screen.getByText('After:')).toBeInTheDocument();
  });

  it('calls onCancel when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <RewardModal
        reward={mockReward}
        starBank={15}
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );

    await user.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('shows celebration animation after confirming', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <RewardModal
        reward={mockReward}
        starBank={15}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    );

    await user.click(screen.getByText(/Yes, Redeem/));

    // Should show celebration immediately (isRedeeming = true)
    expect(screen.getByText('Awesome!')).toBeInTheDocument();
    expect(screen.getByText('Reward redeemed!')).toBeInTheDocument();

    // onConfirm called after delay
    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledOnce();
    });
  });
});
