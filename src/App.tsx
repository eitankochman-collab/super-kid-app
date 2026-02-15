import { useState, useEffect } from 'react';
import type { AppState, RoutineType } from './types';
import { loadState, saveState, resetTaskStatus, getTodayKey, getStoredDate, saveDate, saveYesterdaySummary, loadYesterdaySummary, isWeekendDay } from './storage';
import type { YesterdaySummary } from './storage';
import { TABS, type TabId, WEEKEND_EXCLUDED_MORNING, HEBREW_DAYS, HEBREW_MONTHS, YESTERDAY_SUMMARY_MS } from './constants';
import { ProgressRing } from './components/ProgressRing';
import { TaskList } from './components/TaskList';
import { RewardsShop } from './components/RewardsShop';
import { ConfettiOverlay } from './components/ConfettiOverlay';
import { MiniCelebration } from './components/MiniCelebration';
import { PinModal } from './components/PinModal';
import { AdminPanel } from './components/AdminPanel';

function App() {
  const [state, setState] = useState<AppState>(loadState);
  const [selectedKidIndex, setSelectedKidIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<TabId>('morning');
  const [showPinModal, setShowPinModal] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showSuperKid, setShowSuperKid] = useState(false);
  const [miniCelebration, setMiniCelebration] = useState<{ message: string } | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [yesterdaySummary, setYesterdaySummary] = useState<YesterdaySummary | null>(null);
  const [isWeekend, setIsWeekend] = useState(isWeekendDay);

  const isUnlocked = state.pinUnlockedUntil !== null && Date.now() < state.pinUnlockedUntil;
  const selectedKid = state.kids[selectedKidIndex];

  // Daily reset: check on mount if the day has changed
  useEffect(() => {
    const today = getTodayKey();
    const storedDate = getStoredDate();

    if (storedDate && storedDate !== today) {
      // Save yesterday's summary before resetting
      const summary: YesterdaySummary = {
        kids: state.kids.map((kid) => {
          const allTaskIds = [...kid.morning, ...kid.afternoon, ...kid.evening].map((t) => t.id);
          const doneCount = kid.status.filter((s) => allTaskIds.includes(s.taskId) && s.done).length;
          return { hebrewName: kid.hebrewName, avatar: kid.avatar, done: doneCount, total: allTaskIds.length };
        }),
      };
      saveYesterdaySummary(summary);

      // Reset task completions (stars stay in bank)
      setState((prev) => resetTaskStatus(prev));

      // Show yesterday summary overlay
      const loaded = loadYesterdaySummary();
      if (loaded) {
        setYesterdaySummary(loaded);
        setTimeout(() => setYesterdaySummary(null), YESTERDAY_SUMMARY_MS);
      }
    }

    // Save today's date and update weekend status
    saveDate(today);
    setIsWeekend(isWeekendDay());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Get tasks for current routine tab (filtered for weekends)
  const getTasksForTab = (tab: TabId) => {
    if (tab === 'rewards') return [];
    if (tab === 'afternoon' && isWeekend) return [];
    const tasks = selectedKid[tab as RoutineType] || [];
    if (tab === 'morning' && isWeekend) {
      return tasks.filter((t) => !WEEKEND_EXCLUDED_MORNING.includes(t.id));
    }
    return tasks;
  };

  // Filter tabs for weekends (hide afternoon)
  const visibleTabs = isWeekend ? TABS.filter((t) => t.id !== 'afternoon') : TABS;

  // If on a hidden tab (afternoon on weekend), redirect to morning
  const effectiveTab = (isWeekend && activeTab === 'afternoon') ? 'morning' : activeTab;
  const currentTasks = getTasksForTab(effectiveTab);
  const currentTaskIds = currentTasks.map((t) => t.id);
  const currentStatuses = selectedKid.status.filter((s) => currentTaskIds.includes(s.taskId));
  const doneTasks = currentStatuses.filter((s) => s.done).length;
  const totalTasks = currentTasks.length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const routineMessages: Record<string, string> = {
    morning: '!סופר בוקר 🌅',
    afternoon: '!כל הכבוד 🎒',
    evening: '!לילה טוב 🌙',
  };

  // Check if all tasks in a routine are done (given a status array)
  const isRoutineComplete = (taskIds: string[], statuses: { taskId: string; done: boolean }[]) => {
    if (taskIds.length === 0) return true;
    return taskIds.every((id) => statuses.some((s) => s.taskId === id && s.done));
  };

  const handleToggleDone = (kidId: string, taskId: string) => {
    // Pre-calculate what will happen
    const kid = state.kids.find((k) => k.id === kidId);
    const currentStatusEntry = kid?.status.find((s) => s.taskId === taskId);
    const willBeDone = !currentStatusEntry?.done;

    setState((prev) => ({
      ...prev,
      kids: prev.kids.map((k) => {
        if (k.id !== kidId) return k;

        const existingStatus = k.status.find((s) => s.taskId === taskId);

        if (existingStatus) {
          const undoing = existingStatus.done;
          const starDelta = undoing ? -1 : 1;

          return {
            ...k,
            starBank: Math.max(0, k.starBank + starDelta),
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

    // Check celebrations only when completing (not undoing)
    if (willBeDone && kid) {
      // Simulate the new status after this toggle
      const newStatuses = currentStatusEntry
        ? kid.status.map((s) => s.taskId === taskId ? { ...s, done: true } : s)
        : [...kid.status, { taskId, done: true, stars: 0 }];

      // Get effective task lists (with weekend filtering)
      const morningIds = (isWeekend
        ? kid.morning.filter((t) => !WEEKEND_EXCLUDED_MORNING.includes(t.id))
        : kid.morning
      ).map((t) => t.id);
      const afternoonIds = isWeekend ? [] : kid.afternoon.map((t) => t.id);
      const eveningIds = kid.evening.map((t) => t.id);

      const morningDone = isRoutineComplete(morningIds, newStatuses);
      const afternoonDone = isRoutineComplete(afternoonIds, newStatuses);
      const eveningDone = isRoutineComplete(eveningIds, newStatuses);

      // Check if ALL routines are now complete → full Super-Kid
      if (morningDone && afternoonDone && eveningDone) {
        // Only trigger if this task was the final one across all routines
        const oldMorningDone = isRoutineComplete(morningIds, kid.status);
        const oldAfternoonDone = isRoutineComplete(afternoonIds, kid.status);
        const oldEveningDone = isRoutineComplete(eveningIds, kid.status);
        if (!(oldMorningDone && oldAfternoonDone && oldEveningDone)) {
          setShowSuperKid(true);
          return;
        }
      }

      // Check if the CURRENT routine just completed → mini celebration
      const currentRoutineTab = effectiveTab as string;
      if (currentRoutineTab in routineMessages) {
        const routineTaskIds = currentTasks.map((t) => t.id);
        const wasComplete = isRoutineComplete(routineTaskIds, kid.status);
        const nowComplete = isRoutineComplete(routineTaskIds, newStatuses);
        if (!wasComplete && nowComplete) {
          setMiniCelebration({ message: routineMessages[currentRoutineTab] });
          setTimeout(() => setMiniCelebration(null), 2000);
        }
      }
    }
  };

  const handleRemoveStar = (kidId: string, taskId: string) => {
    setState((prev) => ({
      ...prev,
      kids: prev.kids.map((kid) => {
        if (kid.id !== kidId) return kid;

        const existingStatus = kid.status.find((s) => s.taskId === taskId);
        if (!existingStatus?.done) return kid;

        return {
          ...kid,
          starBank: Math.max(0, kid.starBank - 1),
          status: kid.status.map((s) =>
            s.taskId === taskId ? { ...s, done: false } : s
          ),
        };
      }),
    }));
  };

  const handleAdjustStars = (kidId: string, delta: number) => {
    setState((prev) => ({
      ...prev,
      kids: prev.kids.map((kid) =>
        kid.id === kidId ? { ...kid, starBank: Math.max(0, kid.starBank + delta) } : kid
      ),
    }));
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

  const formatHebrewDate = () => {
    const now = new Date();
    const dayName = HEBREW_DAYS[now.getDay()];
    const dayNum = now.getDate();
    const month = HEBREW_MONTHS[now.getMonth()];
    return `יום ${dayName}, ${dayNum} ${month}`;
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

        {/* Date Display */}
        <div className="text-center mb-4" dir="rtl">
          <span className="text-sm font-medium text-gray-500">
            {formatHebrewDate()}
          </span>
          {isWeekend && (
            <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
              🌴 סוף שבוע
            </span>
          )}
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
            {visibleTabs.map((tab) => {
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
              onRemoveStar={(taskId) => handleRemoveStar(selectedKid.id, taskId)}
              isUnlocked={isUnlocked}
              kidColor={selectedKid.color}
            />
          )}
        </div>
      </div>

      {/* Yesterday Summary Overlay */}
      {yesterdaySummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-out" style={{ animationDelay: '2s', animationDuration: '1s', animationFillMode: 'forwards' }}>
          <div className="bg-white rounded-3xl shadow-xl p-6 mx-4 max-w-sm w-full text-center" dir="rtl">
            <div className="text-2xl mb-3">📊</div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">סיכום אתמול</h2>
            {yesterdaySummary.kids.map((kid) => (
              <div key={kid.hebrewName} className="flex items-center justify-center gap-3 mb-2">
                <img src={kid.avatar} alt={kid.hebrewName} className="w-10 h-10 rounded-full object-cover" />
                <span className="font-semibold text-gray-700">
                  {kid.hebrewName}: {kid.done} מתוך {kid.total} משימות!
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mini Celebration (per-routine) */}
      {miniCelebration && (
        <MiniCelebration
          avatar={selectedKid.avatar}
          kidName={selectedKid.hebrewName}
          message={miniCelebration.message}
        />
      )}

      {/* Full Super-Kid Celebration (all routines complete) */}
      {showSuperKid && (
        <ConfettiOverlay
          kidName={selectedKid.hebrewName}
          avatar={selectedKid.avatar}
          onClose={() => setShowSuperKid(false)}
        />
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
          onAdjustStars={handleAdjustStars}
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
