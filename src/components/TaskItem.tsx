import type { Task, TaskStatus } from '../types';
import { useState } from 'react';

const EMOJI_COLORS: Record<string, string> = {
  '🌅': 'from-orange-100 to-yellow-100',
  '🚽': 'from-purple-100 to-violet-100',
  '👕': 'from-blue-100 to-cyan-100',
  '🥣': 'from-amber-100 to-yellow-100',
  '👟': 'from-green-100 to-emerald-100',
  '🧴': 'from-teal-100 to-cyan-100',
  '😌': 'from-pink-100 to-rose-100',
  '🍱': 'from-orange-100 to-amber-100',
  '👞': 'from-amber-100 to-orange-100',
  '📚': 'from-indigo-100 to-blue-100',
  '🧹': 'from-lime-100 to-green-100',
  '🚿': 'from-sky-100 to-blue-100',
  '🪥': 'from-emerald-100 to-teal-100',
  '📖': 'from-fuchsia-100 to-pink-100',
  '🛏️': 'from-violet-100 to-purple-100',
};

interface TaskItemProps {
  task: Task;
  status: TaskStatus | undefined;
  onToggleDone: () => void;
  onRemoveStar: () => void;
  isUnlocked: boolean;
  kidColor: string;
}

export function TaskItem({ task, status, onToggleDone, onRemoveStar, isUnlocked, kidColor }: TaskItemProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isDone = status?.done || false;
  const emojiColor = EMOJI_COLORS[task.emoji] || 'from-yellow-100 to-orange-100';

  const speak = () => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(task.english);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div
      className={`p-3 rounded-2xl transition-all duration-200 ${
        isDone
          ? 'bg-green-100 border-2 border-green-300'
          : 'bg-white hover:shadow-md border border-gray-100'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Emoji in colored circle */}
        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${emojiColor} flex items-center justify-center text-3xl flex-shrink-0 shadow-md`}>
          {isDone ? '✅' : task.emoji}
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <div className={`text-xl font-extrabold ${isDone ? 'text-green-700' : 'text-gray-800'}`} dir="rtl">
            {task.hebrew}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${isDone ? 'text-green-500' : 'text-gray-400'}`}>{task.english}</span>
            {'speechSynthesis' in window && (
              <button
                onClick={speak}
                className={`w-7 h-7 rounded-full bg-blue-50 text-sm flex items-center justify-center hover:bg-blue-100 transition-colors ${
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
        <div className="flex flex-col gap-1 flex-shrink-0 w-28">
          <button
            onClick={onToggleDone}
            className={`w-full rounded-2xl font-bold text-base transition-all active:scale-95 ${
              isDone
                ? 'py-3 bg-gray-200 text-gray-600 hover:bg-gray-300'
                : `py-3.5 bg-gradient-to-r ${kidColor} text-white shadow-lg hover:shadow-xl btn-invite-pulse`
            }`}
            style={{ minHeight: '56px' }}
          >
            {isDone ? 'ביטול ↩️' : '✅ סיימתי'}
          </button>
          {isDone && isUnlocked && (
            <button
              onClick={onRemoveStar}
              className="w-full py-1.5 rounded-xl bg-red-50 text-red-600 font-semibold text-xs hover:bg-red-100 transition-all active:scale-95"
              title="Remove star"
            >
              הסר ⭐
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
