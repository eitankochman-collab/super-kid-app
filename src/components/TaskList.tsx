import type { Task, TaskStatus } from '../types';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  statuses: TaskStatus[];
  onToggleDone: (taskId: string) => void;
  onRemoveStar: (taskId: string) => void;
  isUnlocked: boolean;
  kidColor: string;
}

export function TaskList({ tasks, statuses, onToggleDone, onRemoveStar, isUnlocked, kidColor }: TaskListProps) {
  // Sort: undone tasks first, done tasks at bottom (stable sort preserves original order within groups)
  const sortedTasks = [...tasks].sort((a, b) => {
    const aDone = statuses.some(s => s.taskId === a.id && s.done) ? 1 : 0;
    const bDone = statuses.some(s => s.taskId === b.id && s.done) ? 1 : 0;
    return aDone - bDone;
  });

  return (
    <div className="space-y-2">
      {sortedTasks.map((task) => {
        const status = statuses.find((s) => s.taskId === task.id);
        return (
          <TaskItem
            key={task.id}
            task={task}
            status={status}
            onToggleDone={() => onToggleDone(task.id)}
            onRemoveStar={() => onRemoveStar(task.id)}
            isUnlocked={isUnlocked}
            kidColor={kidColor}
          />
        );
      })}
    </div>
  );
}
