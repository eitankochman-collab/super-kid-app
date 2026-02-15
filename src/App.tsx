import { useState, useEffect } from 'react';
import type { AppState, RoutineType } from './types';
import { loadState, saveState, resetTaskStatus } from './storage';
import { TABS, type TabId } from './constants';
import { ProgressRing } from './components/ProgressRing';
import { TaskList } from './components/TaskList';
import { RewardsShop } from './components/RewardsShop';
import { ConfettiOverlay } from './components/ConfettiOverlay';
import { PinModal } from './components/PinModal';
import { AdminPanel } from './components/AdminPanel';

function App() {
  const [state, setState] = useState<AppState>(loadState);
  const [selectedKidIndex, setSelectedKidIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<TabId>('morning');
  const [showPinModal, setShowPinModal] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  const isUnlocked = state.pinUnlockedUntil !== null && Date.now() < state.pinUnlockedUntil;
  const selectedKid = state.kids[selectedKidIndex];

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

  // Get tasks for current routine tab
  const getTasksForTab = (tab: TabId) => {
    if (tab === 'rewards') return [];
    return selectedKid[tab as RoutineType] || [];
  };

  const currentTasks = getTasksForTab(activeTab);
  const currentTaskIds = currentTasks.map((t) => t.id);
  const currentStatuses = selectedKid.status.filter((s) => currentTaskIds.includes(s.taskId));
  const doneTasks = currentStatuses.filter((s) => s.done).length;
  const totalTasks = currentTasks.length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const handleToggleDone = (kidId: string, taskId: string) => {
    // Pre-calculate if this will complete the routine
    const kid = state.kids.find((k) => k.id === kidId);
    const currentStatus = kid?.status.find((s) => s.taskId === taskId);
    const willBeDone = !currentStatus?.done;

    setState((prev) => ({
      ...prev,
      kids: prev.kids.map((k) => {
        if (k.id !== kidId) return k;

        const existingStatus = k.status.find((s) => s.taskId === taskId);
        const toggling = existingStatus ? !existingStatus.done : true;
        const starDelta = toggling ? 1 : -1;

        if (existingStatus) {
          return {
            ...k,
            starBank: k.starBank + starDelta,
            status: k.status.map((s) =>
              s.taskId === taskId ? { ...s, done: !s.done } : s
            ),
          };
        } else {
          return {
            ...k,
            starBank: k.starBank + 1,
            status: [...k.status, { taskId, done: true, stars: 0 }],
          };
        }
      }),
    }));

    // Check if this completes the routine
    if (willBeDone) {
      const newDoneCount = doneTasks + 1;
      if (newDoneCount === totalTasks && totalTasks > 0) {
        setShowConfetti(true);
      }
    }
  };

  const handleAddStar = (kidId: string, taskId: string) => {
    const action = () => {
      setState((prev) => ({
        ...prev,
        kids: prev.kids.map((kid) => {
          if (kid.id !== kidId) return kid;

          const existingStatus = kid.status.find((s) => s.taskId === taskId);
          if (!existingStatus?.done) return kid;

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
    const unlockUntil = Date.now() + 5 * 60 * 1000;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-2xl mx-auto">

        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm px-5 py-3 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦸</span>
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              Super Kids
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {isUnlocked && (
              <>
                <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                  🔓 {formatTime(timeRemaining)}
                </span>
                <button
                  onClick={handleLockNow}
                  className="px-3 py-1.5 bg-red-100 text-red-600 rounded-full text-sm font-semibold hover:bg-red-200 transition-colors"
                >
                  🔒
                </button>
              </>
            )}
            <button
              onClick={handleOpenAdmin}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-bold text-sm hover:bg-purple-200 transition-colors"
            >
              👨‍👩‍👧‍👦 הורים
            </button>
          </div>
        </div>

        {/* Kid Selector */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          {state.kids.map((kid, index) => {
            const isSelected = index === selectedKidIndex;
            return (
              <button
                key={kid.id}
                onClick={() => setSelectedKidIndex(index)}
                className={`p-4 rounded-2xl transition-all duration-200 text-left ${
                  isSelected
                    ? `bg-gradient-to-br ${kid.color} text-white shadow-lg scale-[1.02]`
                    : 'bg-white text-gray-700 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img src={kid.avatar} alt={kid.name} className="w-16 h-16 rounded-full object-cover border-2 border-white/50 shadow-md" />
                  <div>
                    <div className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-gray-800'}`} dir="rtl">
                      {kid.hebrewName}
                    </div>
                    <div className={`text-sm ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                      {kid.name}
                    </div>
                  </div>
                </div>
                <div className={`mt-2 text-right text-lg font-bold ${isSelected ? 'text-white/90' : 'text-yellow-600'}`}>
                  {kid.starBank} ⭐
                </div>
              </button>
            );
          })}
        </div>

        {/* Progress + Tabs Card */}
        <div className="bg-white rounded-3xl shadow-sm p-5 mb-5">
          {/* Progress section */}
          {activeTab !== 'rewards' && (
            <div className="flex items-center gap-4 mb-4">
              <ProgressRing percent={progress} color={selectedKid.accent} size={56} />
              <div>
                <div className="text-2xl font-bold text-gray-800" dir="rtl">
                  {doneTasks} מתוך {totalTasks} משימות
                </div>
                <div className="text-sm text-gray-500">
                  {progress}% complete
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-0 py-2.5 px-3 rounded-full font-semibold text-sm transition-all whitespace-nowrap ${
                    isActive
                      ? `bg-gradient-to-r ${selectedKid.color} text-white shadow-md`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className="block">{tab.emoji} {tab.label}</span>
                  <span className={`block text-[10px] ${isActive ? 'text-white/70' : 'text-gray-400'}`}>
                    {tab.labelEn}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Per-tab progress bar */}
          {activeTab !== 'rewards' && (
            <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${selectedKid.color} transition-all duration-500 ease-out rounded-full`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-3xl shadow-sm p-4">
          {activeTab === 'rewards' ? (
            <RewardsShop
              rewards={state.rewards}
              starBank={selectedKid.starBank}
              onRedeemReward={(rewardId) => handleRedeemReward(selectedKid.id, rewardId)}
            />
          ) : (
            <TaskList
              tasks={currentTasks}
              statuses={currentStatuses}
              onToggleDone={(taskId) => handleToggleDone(selectedKid.id, taskId)}
              onAddStar={(taskId) => handleAddStar(selectedKid.id, taskId)}
              isUnlocked={isUnlocked}
              kidColor={selectedKid.color}
            />
          )}
        </div>
      </div>

      {/* Confetti Overlay */}
      {showConfetti && (
        <ConfettiOverlay kidName={selectedKid.hebrewName} onClose={() => setShowConfetti(false)} />
      )}

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
          onResetDone={handleResetDone}
        />
      )}
    </div>
  );
}

export default App;
