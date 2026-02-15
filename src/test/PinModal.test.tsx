import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PinModal } from '../components/PinModal';

describe('PinModal', () => {
  it('renders nothing when not open', () => {
    const { container } = render(
      <PinModal isOpen={false} onClose={vi.fn()} onSuccess={vi.fn()} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders title and numeric keypad when open', () => {
    render(
      <PinModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    expect(screen.getByText('הכנס קוד הורים')).toBeInTheDocument();
    for (let i = 0; i <= 9; i++) {
      expect(screen.getByText(i.toString())).toBeInTheDocument();
    }
    expect(screen.getByText('מחיקה')).toBeInTheDocument();
    expect(screen.getByText('ביטול')).toBeInTheDocument();
  });

  it('accepts custom title', () => {
    render(
      <PinModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} title="Custom Title" />
    );
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('calls onClose when ביטול is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <PinModal isOpen={true} onClose={onClose} onSuccess={vi.fn()} />
    );

    await user.click(screen.getByText('ביטול'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('clears input when מחיקה is clicked', async () => {
    const user = userEvent.setup();

    render(
      <PinModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await user.click(screen.getByText('1'));
    const dots = screen.getAllByText('●');
    expect(dots).toHaveLength(1);

    await user.click(screen.getByText('מחיקה'));
    expect(screen.queryByText('●')).not.toBeInTheDocument();
  });

  it('calls onSuccess and onClose on correct PIN (1234)', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    render(
      <PinModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />
    );

    await user.click(screen.getByText('1'));
    await user.click(screen.getByText('2'));
    await user.click(screen.getByText('3'));
    await user.click(screen.getByText('4'));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce();
    });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('shows error on incorrect PIN', async () => {
    const user = userEvent.setup();

    render(
      <PinModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await user.click(screen.getByText('9'));
    await user.click(screen.getByText('9'));
    await user.click(screen.getByText('9'));
    await user.click(screen.getByText('9'));

    await waitFor(() => {
      expect(screen.getByText('קוד שגוי')).toBeInTheDocument();
    });
  });

  it('does not accept more than 4 digits', async () => {
    const user = userEvent.setup();

    render(
      <PinModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await user.click(screen.getByText('1'));
    await user.click(screen.getByText('2'));
    await user.click(screen.getByText('3'));
    await user.click(screen.getByText('4'));
    await user.click(screen.getByText('5'));

    const dots = screen.getAllByText('●');
    expect(dots).toHaveLength(4);
  });
});
