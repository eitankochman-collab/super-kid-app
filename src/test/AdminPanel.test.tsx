import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminPanel } from '../components/AdminPanel';
import type { KidData, Reward } from '../types';

const mockKids: KidData[] = [
  {
    id: 'lior',
    name: 'Lior',
    hebrewName: 'ליאור',
    avatar: '/super-kid-app/lior-avatar.png',
    color: 'from-amber-400 to-orange-500',
    accent: '#f59e0b',
    age: 8,
    morning: [],
    afternoon: [],
    evening: [],
    status: [],
    starBank: 12,
    streak: { current: 0, best: 0, lastCompletionDate: null },
  },
  {
    id: 'roni',
    name: 'Roni',
    hebrewName: 'רוני',
    avatar: '/super-kid-app/roni-avatar.png',
    color: 'from-sky-400 to-blue-500',
    accent: '#0ea5e9',
    age: 6,
    morning: [],
    afternoon: [],
    evening: [],
    status: [],
    starBank: 3,
    streak: { current: 0, best: 0, lastCompletionDate: null },
  },
];

const mockRewards: Reward[] = [
  { id: 'r1', title: 'Movie night', hebrew: 'סרט ערב', emoji: '🎬', starCost: 10, tier: 'weekly' },
  { id: 'r2', title: 'Extra screen time', hebrew: 'זמן מסך נוסף', emoji: '📱', starCost: 5, tier: 'quick' },
];

describe('AdminPanel', () => {
  it('renders the admin panel title', () => {
    render(
      <AdminPanel
        kids={mockKids}
        rewards={mockRewards}
        onRedeemReward={vi.fn()}
        onAdjustStars={vi.fn()}
        onClose={vi.fn()}
        isUnlocked={true}
        onRequestPin={vi.fn()}
        onResetDone={vi.fn()}
        weekendOverride={null}
        onToggleWeekend={vi.fn()}
        onAddReward={vi.fn()}
        onEditReward={vi.fn()}
        onDeleteReward={vi.fn()}
      />
    );

    expect(screen.getByText(/ניהול הורים/)).toBeInTheDocument();
  });

  it('displays star banks for all kids with Hebrew names and avatars', () => {
    render(
      <AdminPanel
        kids={mockKids}
        rewards={mockRewards}
        onRedeemReward={vi.fn()}
        onAdjustStars={vi.fn()}
        onClose={vi.fn()}
        isUnlocked={true}
        onRequestPin={vi.fn()}
        onResetDone={vi.fn()}
        weekendOverride={null}
        onToggleWeekend={vi.fn()}
        onAddReward={vi.fn()}
        onEditReward={vi.fn()}
        onDeleteReward={vi.fn()}
      />
    );

    expect(screen.getAllByText('ליאור').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('רוני').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByAltText('Lior').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByAltText('Roni').length).toBeGreaterThanOrEqual(1);
  });

  it('displays all rewards with Hebrew names', () => {
    render(
      <AdminPanel
        kids={mockKids}
        rewards={mockRewards}
        onRedeemReward={vi.fn()}
        onAdjustStars={vi.fn()}
        onClose={vi.fn()}
        isUnlocked={true}
        onRequestPin={vi.fn()}
        onResetDone={vi.fn()}
        weekendOverride={null}
        onToggleWeekend={vi.fn()}
        onAddReward={vi.fn()}
        onEditReward={vi.fn()}
        onDeleteReward={vi.fn()}
      />
    );

    expect(screen.getByText('סרט ערב')).toBeInTheDocument();
    expect(screen.getByText('זמן מסך נוסף')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <AdminPanel
        kids={mockKids}
        rewards={mockRewards}
        onRedeemReward={vi.fn()}
        onAdjustStars={vi.fn()}
        onClose={onClose}
        isUnlocked={true}
        onRequestPin={vi.fn()}
        onResetDone={vi.fn()}
        weekendOverride={null}
        onToggleWeekend={vi.fn()}
        onAddReward={vi.fn()}
        onEditReward={vi.fn()}
        onDeleteReward={vi.fn()}
      />
    );

    await user.click(screen.getByText('סגירה'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('disables redeem button when kid cannot afford reward', () => {
    render(
      <AdminPanel
        kids={mockKids}
        rewards={mockRewards}
        onRedeemReward={vi.fn()}
        onAdjustStars={vi.fn()}
        onClose={vi.fn()}
        isUnlocked={true}
        onRequestPin={vi.fn()}
        onResetDone={vi.fn()}
        weekendOverride={null}
        onToggleWeekend={vi.fn()}
        onAddReward={vi.fn()}
        onEditReward={vi.fn()}
        onDeleteReward={vi.fn()}
      />
    );

    // Roni has 3 stars, Movie night costs 10 - button should be disabled
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
        onAdjustStars={vi.fn()}
        onClose={vi.fn()}
        isUnlocked={true}
        onRequestPin={vi.fn()}
        onResetDone={vi.fn()}
        weekendOverride={null}
        onToggleWeekend={vi.fn()}
        onAddReward={vi.fn()}
        onEditReward={vi.fn()}
        onDeleteReward={vi.fn()}
      />
    );

    // Lior has 12 stars, can afford Movie night (10) - find the button for r1
    // Rewards are grouped by tier: quick (r2) appears before weekly (r1)
    const liorButtons = screen.getAllByTitle('Redeem for Lior');
    // r2 (quick) is first, r1 (weekly) is second
    await user.click(liorButtons[1]);
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
        onAdjustStars={vi.fn()}
        onClose={vi.fn()}
        isUnlocked={false}
        onRequestPin={onRequestPin}
        onResetDone={vi.fn()}
        weekendOverride={null}
        onToggleWeekend={vi.fn()}
        onAddReward={vi.fn()}
        onEditReward={vi.fn()}
        onDeleteReward={vi.fn()}
      />
    );

    // Lior has 12 stars, can afford Movie night (10)
    const liorButtons = screen.getAllByTitle('Redeem for Lior');
    await user.click(liorButtons[0]);
    expect(onRequestPin).toHaveBeenCalledOnce();
  });

  it('has a reset button that calls onResetDone', async () => {
    const user = userEvent.setup();
    const onResetDone = vi.fn();

    render(
      <AdminPanel
        kids={mockKids}
        rewards={mockRewards}
        onRedeemReward={vi.fn()}
        onAdjustStars={vi.fn()}
        onClose={vi.fn()}
        isUnlocked={true}
        onRequestPin={vi.fn()}
        onResetDone={onResetDone}
        weekendOverride={null}
        onToggleWeekend={vi.fn()}
        onAddReward={vi.fn()}
        onEditReward={vi.fn()}
        onDeleteReward={vi.fn()}
      />
    );

    await user.click(screen.getByText(/איפוס$/));
    expect(onResetDone).toHaveBeenCalledOnce();
  });
});
