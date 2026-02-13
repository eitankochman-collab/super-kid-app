import type { Task, TaskStatus } from '../types';
import { useState } from 'react';

interface TaskItemProps {
  task: Task;
  status: TaskStatus | undefined;
  onToggleDone: () => void;
  onAddStar: () => void;
  isUnlocked: boolean;
}

export function TaskItem({ task, status, onToggleDone, onAddStar, isUnlocked }: TaskItemProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isDone = status?.done || false;
  const stars = status?.stars || 0;

  const speak = () => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(task.english);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div
      className={`p-4 rounded-xl border-2 transition-all ${
        isDone
          ? 'bg-green-50 border-green-400'
          : 'bg-white border-gray-200 hover:border-blue-300'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Emoji */}
        <div className="text-4xl flex-shrink-0">{task.emoji}</div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <div className="text-xl font-semibold text-gray-800" dir="rtl">
            {task.hebrew}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-base text-gray-600">{task.english}</span>
            {'speechSynthesis' in window && (
              <button
                onClick={speak}
                className={`text-lg hover:scale-110 transition-transform ${
                  isSpeaking ? 'animate-pulse' : ''
                }`}
                title="Listen"
              >
                🔊
              </button>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <button
            onClick={onToggleDone}
            className={`px-6 py-3 rounded-lg font-bold text-lg transition-all active:scale-95 ${
              isDone
                ? 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                : 'bg-green-500 text-white hover:bg-green-600 shadow-lg'
            }`}
          >
            {isDone ? 'Undo ↩️' : 'Done ✅'}
          </button>

          {isDone && (
            <button
              onClick={onAddStar}
              disabled={!isUnlocked}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all active:scale-95 ${
                isUnlocked
                  ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500 shadow-md'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              title={isUnlocked ? 'Award star' : 'Unlock with PIN first'}
            >
              ⭐ +1 {stars > 0 && `(${stars})`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
