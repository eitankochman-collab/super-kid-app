import type { Task, TaskStatus } from '../types';
import { useState, useRef } from 'react';

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
  const [pressing, setPressing] = useState(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout>>(null);
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

  const startPress = () => {
    setPressing(true);
    pressTimer.current = setTimeout(() => {
      setPressing(false);
      onToggleDone();
    }, 500);
  };

  const cancelPress = () => {
    setPressing(false);
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  if (isDone) {
    return (
      <div className="p-2 rounded-2xl bg-green-200 border-2 border-green-400 relative">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-green-400 flex items-center justify-center text-2xl flex-shrink-0">
            ✅
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-bold text-green-700 line-through" dir="rtl">
              {task.hebrew}
            </div>
            <span className="text-xs text-green-500">{task.english}</span>
          </div>
        </div>
        {/* Tiny undo button — requires 500ms long-press */}
        <button
          onPointerDown={startPress}
          onPointerUp={cancelPress}
          onPointerLeave={cancelPress}
          onPointerCancel={cancelPress}
          className={`absolute bottom-2 right-2 w-8 h-8 rounded-full bg-gray-200 text-gray-400 text-xs flex items-center justify-center transition-transform ${
            pressing ? 'long-press-fill scale-110' : ''
          }`}
          title="ביטול"
        >
          ↩️
        </button>
        {/* Remove star — parent-only, small */}
        {isUnlocked && (
          <button
            onClick={onRemoveStar}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-100 text-red-400 text-[10px] flex items-center justify-center hover:bg-red-200 transition-colors"
            title="הסר ⭐"
          >
            ⭐
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-3 rounded-2xl bg-white hover:shadow-md border border-gray-100 transition-all duration-200">
      <div className="flex items-center gap-3">
        {/* Emoji in colored circle */}
        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${emojiColor} flex items-center justify-center text-4xl flex-shrink-0 shadow-md`}>
          {task.emoji}
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <div className="text-xl font-black text-gray-800" dir="rtl">
            {task.hebrew}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{task.english}</span>
            {'speechSynthesis' in window && (
              <button
                onClick={speak}
                className={`w-12 h-12 rounded-full bg-blue-100 text-lg flex items-center justify-center hover:bg-blue-200 transition-colors active:scale-95 ${
                  isSpeaking ? 'animate-pulse' : ''
                }`}
                title="Listen"
              >
                🔊
              </button>
            )}
          </div>
        </div>

        {/* Done button — big emoji-first */}
        <div className="flex-shrink-0">
          <button
            onClick={onToggleDone}
            className={`w-full rounded-2xl font-bold transition-all active:scale-95 py-3 px-5 bg-gradient-to-r ${kidColor} text-white shadow-lg hover:shadow-xl btn-invite-pulse flex flex-col items-center gap-0.5`}
            style={{ minHeight: '64px' }}
          >
            <span className="text-3xl">✅</span>
            <span className="text-xs font-bold">סיימתי</span>
          </button>
        </div>
      </div>
    </div>
  );
}
