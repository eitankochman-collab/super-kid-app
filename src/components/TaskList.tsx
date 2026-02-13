import type { Task, TaskStatus } from '../types';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  statuses: TaskStatus[];
  onToggleDone: (taskId: string) => void;
  onAddStar: (taskId: string) => void;
  isUnlocked: boolean;
}

export function TaskList({ tasks, statuses, onToggleDone, onAddStar, isUnlocked }: TaskListProps) {
  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const status = statuses.find((s) => s.taskId === task.id);
        return (
          <TaskItem
            key={task.id}
            task={task}
            status={status}
            onToggleDone={() => onToggleDone(task.id)}
            onAddStar={() => onAddStar(task.id)}
            isUnlocked={isUnlocked}
          />
        );
      })}
    </div>
  );
}
