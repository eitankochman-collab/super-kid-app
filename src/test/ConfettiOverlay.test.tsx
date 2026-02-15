import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfettiOverlay } from '../components/ConfettiOverlay';

const avatar = '/super-kid-app/lior-avatar.png?v=3';

describe('ConfettiOverlay', () => {
  it('renders Super-Kid celebration with kid name', () => {
    render(<ConfettiOverlay kidName="ליאור" avatar={avatar} onClose={vi.fn()} />);

    expect(screen.getByText(/סופר סיסטר/)).toBeInTheDocument();
    expect(screen.getByText(/ליאור/)).toBeInTheDocument();
  });

  it('calls onClose when clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<ConfettiOverlay kidName="ליאור" avatar={avatar} onClose={onClose} />);

    await user.click(screen.getByText(/סופר סיסטר/));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('auto-closes after timeout', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    render(<ConfettiOverlay kidName="ליאור" avatar={avatar} onClose={onClose} />);

    expect(onClose).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onClose).toHaveBeenCalledOnce();

    vi.useRealTimers();
  });

  it('renders confetti particles', () => {
    const { container } = render(
      <ConfettiOverlay kidName="רוני" avatar={avatar} onClose={vi.fn()} />
    );

    const particles = container.querySelectorAll('.animate-fall');
    expect(particles.length).toBeGreaterThan(0);
  });
});
