import { useState } from 'react';
import type { KidData, RoutineType } from '../types';
import { TaskList } from './TaskList';
import { ConfettiOverlay } from './ConfettiOverlay';

interface KidCardProps {
  kid: KidData;
  onToggleDone: (kidId: string, taskId: string) => void;
  onAddStar: (kidId: string, taskId: string) => void;
  isUnlocked: boolean;
}

export function KidCard({ kid, onToggleDone, onAddStar, isUnlocked }: KidCardProps) {
  const [activeTab, setActiveTab] = useState<RoutineType>('morning');
  const [showConfetti, setShowConfetti] = useState(false);

  const tasks = activeTab === 'morning' ? kid.morning : kid.evening;
  const taskIds = tasks.map((t) => t.id);
  const relevantStatuses = kid.status.filter((s) => taskIds.includes(s.taskId));

  const totalTasks = tasks.length;
  const doneTasks = relevantStatuses.filter((s) => s.done).length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const handleToggleDone = (taskId: string) => {
    const status = kid.status.find((s) => s.taskId === taskId);
    const willBeDone = !status?.done;

    onToggleDone(kid.id, taskId);

    // Check if this completes the routine
    if (willBeDone) {
      const newDoneCount = doneTasks + 1;
      if (newDoneCount === totalTasks) {
        setShowConfetti(true);
      }
    }
  };

  return (
    <>
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-xl p-6 flex flex-col h-full">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">{kid.name}</h2>
              <p className="text-gray-600">{kid.age} years old</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-yellow-600">{kid.starBank} ⭐</div>
              <div className="text-sm text-gray-600">Star Bank</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700">Progress</span>
              <span className="text-sm font-bold text-blue-600">{progress}%</span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('morning')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                activeTab === 'morning'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              🌅 Morning
            </button>
            <button
              onClick={() => setActiveTab('evening')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                activeTab === 'evening'
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              🌙 Evening
            </button>
          </div>
        </div>

        {/* Task list */}
        <div className="flex-1 overflow-y-auto">
          <TaskList
            tasks={tasks}
            statuses={relevantStatuses}
            onToggleDone={handleToggleDone}
            onAddStar={(taskId) => onAddStar(kid.id, taskId)}
            isUnlocked={isUnlocked}
          />
        </div>
      </div>

      {showConfetti && (
        <ConfettiOverlay kidName={kid.name} onClose={() => setShowConfetti(false)} />
      )}
    </>
  );
}
