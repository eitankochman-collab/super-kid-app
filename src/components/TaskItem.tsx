import type { Task, TaskStatus } from '../types';
import { useState, useRef, useEffect } from 'react';

const EMOJI_COLORS: Record<string, string> = {
  '🌅': 'from-orange-200 to-yellow-200',
  '🚽': 'from-purple-200 to-violet-200',
  '👕': 'from-blue-200 to-cyan-200',
  '🥣': 'from-amber-200 to-yellow-200',
  '👟': 'from-green-200 to-emerald-200',
  '🧴': 'from-teal-200 to-cyan-200',
  '😌': 'from-pink-200 to-rose-200',
  '🍱': 'from-orange-200 to-amber-200',
  '👞': 'from-amber-200 to-orange-200',
  '📚': 'from-indigo-200 to-blue-200',
  '🧹': 'from-lime-200 to-green-200',
  '🚿': 'from-sky-200 to-blue-200',
  '🪥': 'from-emerald-200 to-teal-200',
  '📖': 'from-fuchsia-200 to-pink-200',
  '🛏️': 'from-violet-200 to-purple-200',
};

interface TaskItemProps {
  task: Task;
  status: TaskStatus | undefined;
  onToggleDone: () => void;
  onRemoveStar: () => void;
  isUnlocked: boolean;
  kidColor: string;
}

export function TaskItem({ task, status, onToggleDone, onRemoveStar, isUnlocked, kidColor: _kidColor }: TaskItemProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [confirmingUndo, setConfirmingUndo] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const undoTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const prevDone = useRef(status?.done || false);
  const isDone = status?.done || false;
  const emojiColor = EMOJI_COLORS[task.emoji] || 'from-yellow-200 to-orange-200';

  // Detect task completion for pop animation
  useEffect(() => {
    if (isDone && !prevDone.current) {
      setJustCompleted(true);
      const timer = setTimeout(() => setJustCompleted(false), 600);
      return () => clearTimeout(timer);
    }
    prevDone.current = isDone;
  }, [isDone]);

  const speak = () => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(task.hebrew);
      utterance.lang = 'he-IL';
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleUndoTap = () => {
    if (confirmingUndo) {
      // Second tap — actually undo
      setConfirmingUndo(false);
      if (undoTimer.current) clearTimeout(undoTimer.current);
      onToggleDone();
    } else {
      // First tap — show confirmation
      setConfirmingUndo(true);
      undoTimer.current = setTimeout(() => setConfirmingUndo(false), 2000);
    }
  };

  if (isDone) {
    return (
      <div className={`p-2 rounded-2xl bg-green-200 border-2 border-green-400 relative ${justCompleted ? 'task-done-pop' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white border-2 border-yellow-300 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
            ✅
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-bold text-green-700 line-through" dir="rtl">
              {task.hebrew}
            </div>
            <span className="text-xs text-green-500">{task.english}</span>
          </div>
          {/* Undo button — same position/size as Done button, double-tap to confirm */}
          <div className="flex-shrink-0">
            <button
              onClick={handleUndoTap}
              className={`w-full rounded-2xl font-bold transition-all active:scale-95 py-3 px-5 bg-gray-300 text-gray-500 shadow-md flex flex-col items-center gap-0.5 ${
                confirmingUndo ? 'animate-shake' : ''
              }`}
              style={{ minHeight: '64px' }}
              title="ביטול"
            >
              {confirmingUndo ? (
                <>
                  <span className="text-xl">❓</span>
                  <span className="text-xs font-bold">בטוח?</span>
                  <span className="text-[9px] text-gray-400">Sure?</span>
                </>
              ) : (
                <>
                  <span className="text-xl">↩️</span>
                  <span className="text-xs font-bold">ביטול</span>
                  <span className="text-[9px] text-gray-400">Undo</span>
                </>
              )}
            </button>
          </div>
        </div>
        {/* Remove star — parent-only */}
        {isUnlocked && (
          <button
            onClick={onRemoveStar}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-100 text-red-400 text-sm flex items-center justify-center hover:bg-red-200 transition-colors"
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
        {/* Emoji in colored circle — tap for TTS */}
        <button
          onClick={speak}
          className={`w-16 h-16 rounded-full bg-gradient-to-br ${emojiColor} flex items-center justify-center text-4xl flex-shrink-0 shadow-md active:scale-95 transition-transform ${
            isSpeaking ? 'animate-pulse' : ''
          }`}
          title="🔊"
        >
          {task.emoji}
        </button>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <div className="text-xl font-black text-gray-800" dir="rtl">
            {task.hebrew}
          </div>
          <span className="text-xs text-gray-400">{task.english}</span>
        </div>

        {/* Done button — big emoji-first */}
        <div className="flex-shrink-0">
          <button
            onClick={onToggleDone}
            className="w-full rounded-2xl font-bold transition-all active:scale-95 py-3 px-5 bg-gradient-to-r from-purple-600 to-orange-500 text-white shadow-lg hover:shadow-xl btn-invite-pulse flex flex-col items-center gap-0.5"
            style={{ minHeight: '64px' }}
          >
            <span className="text-3xl">✅</span>
            <span className="text-xs font-bold">סיימתי</span>
            <span className="text-[9px] opacity-70">Done!</span>
          </button>
        </div>
      </div>
    </div>
  );
}
