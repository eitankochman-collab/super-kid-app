import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskItem } from '../components/TaskItem';
import type { Task, TaskStatus } from '../types';

const mockTask: Task = {
  id: 'm1',
  hebrew: 'קמים מהמיטה',
  english: 'Wake up',
  emoji: '🌅',
};

const kidColor = 'from-amber-400 to-orange-500';

describe('TaskItem', () => {
  it('renders task emoji, hebrew, and english text', () => {
    render(
      <TaskItem
        task={mockTask}
        status={undefined}
        onToggleDone={vi.fn()}
        onAddStar={vi.fn()}
        isUnlocked={false}
        kidColor={kidColor}
      />
    );

    expect(screen.getByText('🌅')).toBeInTheDocument();
    expect(screen.getByText('קמים מהמיטה')).toBeInTheDocument();
    expect(screen.getByText('Wake up')).toBeInTheDocument();
  });

  it('shows "סיימתי" button when task is not done', () => {
    render(
      <TaskItem
        task={mockTask}
        status={undefined}
        onToggleDone={vi.fn()}
        onAddStar={vi.fn()}
        isUnlocked={false}
        kidColor={kidColor}
      />
    );

    expect(screen.getByText(/סיימתי/)).toBeInTheDocument();
  });

  it('shows "ביטול" button when task is done', () => {
    const status: TaskStatus = { taskId: 'm1', done: true, stars: 0 };
    render(
      <TaskItem
        task={mockTask}
        status={status}
        onToggleDone={vi.fn()}
        onAddStar={vi.fn()}
        isUnlocked={false}
        kidColor={kidColor}
      />
    );

    expect(screen.getByText(/ביטול/)).toBeInTheDocument();
  });

  it('calls onToggleDone when done button is clicked', async () => {
    const user = userEvent.setup();
    const onToggleDone = vi.fn();

    render(
      <TaskItem
        task={mockTask}
        status={undefined}
        onToggleDone={onToggleDone}
        onAddStar={vi.fn()}
        isUnlocked={false}
        kidColor={kidColor}
      />
    );

    await user.click(screen.getByText(/סיימתי/));
    expect(onToggleDone).toHaveBeenCalledOnce();
  });

  it('shows star button only when task is done and unlocked', () => {
    const { rerender } = render(
      <TaskItem
        task={mockTask}
        status={undefined}
        onToggleDone={vi.fn()}
        onAddStar={vi.fn()}
        isUnlocked={true}
        kidColor={kidColor}
      />
    );

    expect(screen.queryByText(/\+1/)).not.toBeInTheDocument();

    const doneStatus: TaskStatus = { taskId: 'm1', done: true, stars: 0 };
    rerender(
      <TaskItem
        task={mockTask}
        status={doneStatus}
        onToggleDone={vi.fn()}
        onAddStar={vi.fn()}
        isUnlocked={true}
        kidColor={kidColor}
      />
    );

    expect(screen.getByText(/\+1/)).toBeInTheDocument();
  });

  it('calls onAddStar when star button is clicked', async () => {
    const user = userEvent.setup();
    const onAddStar = vi.fn();
    const status: TaskStatus = { taskId: 'm1', done: true, stars: 0 };

    render(
      <TaskItem
        task={mockTask}
        status={status}
        onToggleDone={vi.fn()}
        onAddStar={onAddStar}
        isUnlocked={true}
        kidColor={kidColor}
      />
    );

    await user.click(screen.getByText(/\+1/));
    expect(onAddStar).toHaveBeenCalledOnce();
  });

  it('displays star count when stars have been awarded', () => {
    const status: TaskStatus = { taskId: 'm1', done: true, stars: 3 };

    render(
      <TaskItem
        task={mockTask}
        status={status}
        onToggleDone={vi.fn()}
        onAddStar={vi.fn()}
        isUnlocked={true}
        kidColor={kidColor}
      />
    );

    expect(screen.getByText(/\(3\)/)).toBeInTheDocument();
  });

  it('has green styling when done', () => {
    const status: TaskStatus = { taskId: 'm1', done: true, stars: 0 };
    const { container } = render(
      <TaskItem
        task={mockTask}
        status={status}
        onToggleDone={vi.fn()}
        onAddStar={vi.fn()}
        isUnlocked={false}
        kidColor={kidColor}
      />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('bg-green-50');
  });
});
