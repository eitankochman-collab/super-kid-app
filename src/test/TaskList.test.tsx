import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaskList } from '../components/TaskList';
import type { Task, TaskStatus } from '../types';

const mockTasks: Task[] = [
  { id: 'm1', hebrew: 'קמים מהמיטה', english: 'Wake up', emoji: '🌅' },
  { id: 'm2', hebrew: 'שירותים', english: 'Bathroom', emoji: '🚽' },
  { id: 'm3', hebrew: 'מתלבשים', english: 'Get dressed', emoji: '👕' },
];

describe('TaskList', () => {
  it('renders all tasks', () => {
    render(
      <TaskList
        tasks={mockTasks}
        statuses={[]}
        onToggleDone={vi.fn()}
        onAddStar={vi.fn()}
        isUnlocked={false}
      />
    );

    expect(screen.getByText('Wake up')).toBeInTheDocument();
    expect(screen.getByText('Bathroom')).toBeInTheDocument();
    expect(screen.getByText('Get dressed')).toBeInTheDocument();
  });

  it('passes correct status to each task', () => {
    const statuses: TaskStatus[] = [
      { taskId: 'm1', done: true, stars: 1 },
      { taskId: 'm3', done: true, stars: 0 },
    ];

    render(
      <TaskList
        tasks={mockTasks}
        statuses={statuses}
        onToggleDone={vi.fn()}
        onAddStar={vi.fn()}
        isUnlocked={false}
      />
    );

    // m1 and m3 done, m2 not done
    const undoButtons = screen.getAllByText(/Undo/);
    const doneButtons = screen.getAllByText(/^Done/);
    expect(undoButtons).toHaveLength(2);
    expect(doneButtons).toHaveLength(1);
  });

  it('renders empty state when no tasks', () => {
    const { container } = render(
      <TaskList
        tasks={[]}
        statuses={[]}
        onToggleDone={vi.fn()}
        onAddStar={vi.fn()}
        isUnlocked={false}
      />
    );

    // Should render the container but with no task items
    expect(container.querySelector('.space-y-3')).toBeInTheDocument();
  });
});
