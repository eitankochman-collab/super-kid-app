import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfettiOverlay } from '../components/ConfettiOverlay';

describe('ConfettiOverlay', () => {
  it('renders celebration message with kid name', () => {
    render(<ConfettiOverlay kidName="Lior" onClose={vi.fn()} />);

    expect(screen.getByText('Super Kid!')).toBeInTheDocument();
    expect(screen.getByText('Lior')).toBeInTheDocument();
  });

  it('calls onClose when clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<ConfettiOverlay kidName="Lior" onClose={onClose} />);

    await user.click(screen.getByText('Super Kid!'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('auto-closes after timeout', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    render(<ConfettiOverlay kidName="Lior" onClose={onClose} />);

    expect(onClose).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onClose).toHaveBeenCalledOnce();

    vi.useRealTimers();
  });

  it('renders confetti particles', () => {
    const { container } = render(
      <ConfettiOverlay kidName="Roni" onClose={vi.fn()} />
    );

    const particles = container.querySelectorAll('.animate-fall');
    expect(particles.length).toBeGreaterThan(0);
  });
});
