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
  return (
    <div className="space-y-2">
      {tasks.map((task) => {
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
