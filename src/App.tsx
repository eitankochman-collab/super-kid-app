import { useState, useEffect } from 'react';
import type { AppState } from './types';
import { loadState, saveState, resetTaskStatus } from './storage';
import { KidCard } from './components/KidCard';
import { PinModal } from './components/PinModal';
import { AdminPanel } from './components/AdminPanel';

function App() {
  const [state, setState] = useState<AppState>(loadState);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  const isUnlocked = state.pinUnlockedUntil !== null && Date.now() < state.pinUnlockedUntil;

  // Save state whenever it changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Update time remaining display
  useEffect(() => {
    if (!isUnlocked) {
      setTimeRemaining(0);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((state.pinUnlockedUntil! - Date.now()) / 1000));
      setTimeRemaining(remaining);

      if (remaining === 0) {
        setState((prev) => ({ ...prev, pinUnlockedUntil: null }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isUnlocked, state.pinUnlockedUntil]);

  const handleToggleDone = (kidId: string, taskId: string) => {
    setState((prev) => ({
      ...prev,
      kids: prev.kids.map((kid) => {
        if (kid.id !== kidId) return kid;

        const existingStatus = kid.status.find((s) => s.taskId === taskId);
        if (existingStatus) {
          return {
            ...kid,
            status: kid.status.map((s) =>
              s.taskId === taskId ? { ...s, done: !s.done } : s
            ),
          };
        } else {
          return {
            ...kid,
            status: [...kid.status, { taskId, done: true, stars: 0 }],
          };
        }
      }),
    }));
  };

  const handleAddStar = (kidId: string, taskId: string) => {
    const action = () => {
      setState((prev) => ({
        ...prev,
        kids: prev.kids.map((kid) => {
          if (kid.id !== kidId) return kid;

          const existingStatus = kid.status.find((s) => s.taskId === taskId);
          if (!existingStatus?.done) return kid; // Only award stars to completed tasks

          return {
            ...kid,
            starBank: kid.starBank + 1,
            status: kid.status.map((s) =>
              s.taskId === taskId ? { ...s, stars: s.stars + 1 } : s
            ),
          };
        }),
      }));
    };

    if (isUnlocked) {
      action();
    } else {
      setPendingAction(() => action);
      setShowPinModal(true);
    }
  };

  const handlePinSuccess = () => {
    const unlockUntil = Date.now() + 5 * 60 * 1000; // 5 minutes
    setState((prev) => ({ ...prev, pinUnlockedUntil: unlockUntil }));

    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleLockNow = () => {
    setState((prev) => ({ ...prev, pinUnlockedUntil: null }));
  };

  const handleOpenAdmin = () => {
    if (isUnlocked) {
      setShowAdmin(true);
    } else {
      setPendingAction(() => () => setShowAdmin(true));
      setShowPinModal(true);
    }
  };

  const handleResetDone = () => {
    const action = () => {
      setState((prev) => resetTaskStatus(prev));
    };

    if (isUnlocked) {
      action();
    } else {
      setPendingAction(() => action);
      setShowPinModal(true);
    }
  };

  const handleRedeemReward = (kidId: string, rewardId: string) => {
    setState((prev) => {
      const kid = prev.kids.find((k) => k.id === kidId);
      const reward = prev.rewards.find((r) => r.id === rewardId);

      if (!kid || !reward || kid.starBank < reward.starCost) return prev;

      return {
        ...prev,
        kids: prev.kids.map((k) =>
          k.id === kidId ? { ...k, starBank: k.starBank - reward.starCost } : k
        ),
      };
    });
  };

  const handleRequestPin = (action: () => void) => {
    setPendingAction(() => action);
    setShowPinModal(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-4 md:p-8">
      {/* Header with parent controls */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
            🦸 Super Kids
          </h1>

          <div className="flex gap-3 items-center">
            {isUnlocked && (
              <div className="flex gap-2">
                <span className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold shadow-md">
                  🔓 Unlocked: {formatTime(timeRemaining)}
                </span>
                <button
                  onClick={handleLockNow}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors shadow-md"
                >
                  🔒 Lock Now
                </button>
              </div>
            )}

            <button
              onClick={handleOpenAdmin}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors shadow-lg"
            >
              👨‍👩‍👧‍👦 Parent
            </button>

            <button
              onClick={handleResetDone}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-colors shadow-lg"
              title="Reset all task completion (for testing)"
            >
              🔄 Reset
            </button>
          </div>
        </div>
      </div>

      {/* Kid cards side by side */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {state.kids.map((kid) => (
            <KidCard
              key={kid.id}
              kid={kid}
              onToggleDone={handleToggleDone}
              onAddStar={handleAddStar}
              isUnlocked={isUnlocked}
            />
          ))}
        </div>
      </div>

      {/* PIN Modal */}
      <PinModal
        isOpen={showPinModal}
        onClose={() => {
          setShowPinModal(false);
          setPendingAction(null);
        }}
        onSuccess={handlePinSuccess}
      />

      {/* Admin Panel */}
      {showAdmin && (
        <AdminPanel
          kids={state.kids}
          rewards={state.rewards}
          onRedeemReward={handleRedeemReward}
          onClose={() => setShowAdmin(false)}
          isUnlocked={isUnlocked}
          onRequestPin={handleRequestPin}
        />
      )}
    </div>
  );
}

export default App;
