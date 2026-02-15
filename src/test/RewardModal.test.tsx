import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RewardModal } from '../components/RewardModal';
import type { Reward } from '../types';

const mockReward: Reward = {
  id: 'r1',
  title: 'Movie night',
  hebrew: 'סרט ערב',
  emoji: '🎬',
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

    expect(screen.getByText('סרט ערב')).toBeInTheDocument();
    expect(screen.getByText('Movie night')).toBeInTheDocument();
    expect(screen.getByText(/לפדות פרס/)).toBeInTheDocument();
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

    expect(screen.getByText(':עלות')).toBeInTheDocument();
    expect(screen.getByText(':יש לך')).toBeInTheDocument();
    expect(screen.getByText(':אחרי')).toBeInTheDocument();
  });

  it('calls onCancel when ביטול button is clicked', async () => {
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

    await user.click(screen.getByText('ביטול'));
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

    await user.click(screen.getByText(/כן, לפדות/));

    // Should show celebration immediately (isRedeeming = true)
    expect(screen.getByText(/מדהים/)).toBeInTheDocument();
    expect(screen.getByText(/הפרס נפדה/)).toBeInTheDocument();

    // onConfirm called after delay
    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledOnce();
    });
  });
});
