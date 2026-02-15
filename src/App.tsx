import { useState, useEffect } from 'react';
import type { AppState, RoutineType, Reward, FoodItem } from './types';
import { loadState, saveState, resetTaskStatus, getTodayKey, getStoredDate, saveDate, saveYesterdaySummary, loadYesterdaySummary, isWeekendDay, isYesterday, saveTodaySnapshot, saveDailyRecord } from './storage';
import type { YesterdaySummary } from './storage';
import { TABS, type TabId, WEEKEND_EXCLUDED_MORNING, HEBREW_DAYS, HEBREW_MONTHS, YESTERDAY_SUMMARY_MS, STREAK_MILESTONES } from './constants';
import { loadFoodCatalog, saveFoodCatalog } from './lunchboxStorage';
import { isMuted, setMuted, playDing, playBoop, playFanfare, playChaChing, playClick, playPop, playTaskSound } from './sounds';
import { ProgressRing } from './components/ProgressRing';
import { TaskList } from './components/TaskList';
import { RewardsShop } from './components/RewardsShop';
import { LunchboxBuilder } from './components/LunchboxBuilder';
import { ConfettiOverlay } from './components/ConfettiOverlay';
import { MiniCelebration } from './components/MiniCelebration';
import { PinModal } from './components/PinModal';
import { AdminPanel } from './components/AdminPanel';
import { DailyScheduleCard } from './components/DailyScheduleCard';
import { WeeklyScheduleModal } from './components/WeeklyScheduleModal';

/** Time-based background gradient — lavender tint for Luna's Super Sisters */
function getTimeBackground(): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) {
    return 'from-purple-50 via-indigo-50 to-orange-50';
  } else if (hour >= 12 && hour < 17) {
    return 'from-purple-50 via-indigo-50 to-purple-100';
  } else if (hour >= 17 && hour < 20) {
    return 'from-indigo-100 via-purple-100 to-orange-100';
  } else {
    return 'from-indigo-200 via-purple-100 to-indigo-100';
  }
}

/** Time-based greeting — bilingual */
function getGreeting(): { text: string; textEn: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return { text: 'בוקר טוב', textEn: 'Good morning', emoji: '☀️🐕' };
  if (hour >= 12 && hour < 17) return { text: 'צהריים טובים', textEn: 'Good afternoon', emoji: '🌤🐕' };
  if (hour >= 17 && hour < 21) return { text: 'ערב טוב', textEn: 'Good evening', emoji: '🌙🐕' };
  return { text: 'לילה טוב', textEn: 'Good night', emoji: '🌟🐕' };
}

/** English day names */
const ENGLISH_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

/** English month names */
const ENGLISH_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const;

/** Character face for progress ring based on completion percentage */
function getProgressCharacter(pct: number): string {
  if (pct >= 100) return '🦸';
  if (pct >= 75) return '🤩';
  if (pct >= 50) return '😄';
  if (pct >= 25) return '😊';
  return '💪';
}

/** Auto-select the matching routine tab based on current time */
function getInitialTab(): TabId {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'morning';
}

function App() {
  const [state, setState] = useState<AppState>(loadState);
  const [selectedKidIndex, setSelectedKidIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<TabId>(getInitialTab);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showSuperKid, setShowSuperKid] = useState(false);
  const [miniCelebration, setMiniCelebration] = useState<{ message: string; messageEn?: string } | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [yesterdaySummary, setYesterdaySummary] = useState<YesterdaySummary | null>(null);
  const [isWeekendAuto, setIsWeekendAuto] = useState(isWeekendDay);
  const [weekendOverride, setWeekendOverride] = useState<boolean | null>(null);
  const [foodCatalog, setFoodCatalog] = useState<FoodItem[]>(loadFoodCatalog);
  const [muted, setMutedState] = useState(isMuted);
  const [timeBg, setTimeBg] = useState(getTimeBackground);
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const isWeekend = weekendOverride !== null ? weekendOverride : isWeekendAuto;

  const handleToggleMute = () => {
    const next = !muted;
    setMutedState(next);
    setMuted(next);
  };

  const isUnlocked = state.pinUnlockedUntil !== null && Date.now() < state.pinUnlockedUntil;
  const selectedKid = state.kids[selectedKidIndex];
  const greeting = getGreeting();

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

      // Save daily records for the previous day before resetting
      for (const kid of state.kids) {
        const allTaskIds = [...kid.morning, ...kid.afternoon, ...kid.evening].map((t) => t.id);
        const doneCount = kid.status.filter((s) => allTaskIds.includes(s.taskId) && s.done).length;
        saveDailyRecord({ date: storedDate, kidId: kid.id, done: doneCount, total: allTaskIds.length });
      }

      // Reset task completions + update streaks (stars stay in bank)
      setState((prev) => ({
        ...resetTaskStatus(prev),
        kids: resetTaskStatus(prev).kids.map((kid) => {
          // If lastCompletionDate was yesterday, streak continues; otherwise reset
          const streakContinues = kid.streak.lastCompletionDate && isYesterday(kid.streak.lastCompletionDate);
          return {
            ...kid,
            streak: {
              ...kid.streak,
              current: streakContinues ? kid.streak.current : 0,
            },
          };
        }),
      }));

      // Show yesterday summary overlay
      const loaded = loadYesterdaySummary();
      if (loaded) {
        setYesterdaySummary(loaded);
        setTimeout(() => setYesterdaySummary(null), YESTERDAY_SUMMARY_MS);
      }
    }

    // Save today's date and update weekend status
    saveDate(today);
    setIsWeekendAuto(isWeekendDay());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    saveState(state);
    saveTodaySnapshot(state);
  }, [state]);

  // Persist food catalog whenever it changes
  useEffect(() => {
    saveFoodCatalog(foodCatalog);
  }, [foodCatalog]);

  // Update time-based background every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeBg(getTimeBackground());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

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
    if (tab === 'rewards' || tab === 'lunchbox') return [];
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

  const routineMessages: Record<string, { he: string; en: string }> = {
    morning: { he: 'סופר בוקר — לונה שמחה! 🌅🐕', en: 'Super morning — Luna is happy! 🌅🐕' },
    afternoon: { he: 'כל הכבוד — לונה שמחה! 🎒🐕', en: 'Great job — Luna is happy! 🎒🐕' },
    evening: { he: 'לילה טוב — לונה שמחה! 🌙🐕', en: 'Good night — Luna is happy! 🌙🐕' },
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

    // Sound for undo
    if (!willBeDone) {
      playBoop();
    }

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

      // Check if ALL routines are now complete → full Super-Kid + streak
      if (morningDone && afternoonDone && eveningDone) {
        // Only trigger if this task was the final one across all routines
        const oldMorningDone = isRoutineComplete(morningIds, kid.status);
        const oldAfternoonDone = isRoutineComplete(afternoonIds, kid.status);
        const oldEveningDone = isRoutineComplete(eveningIds, kid.status);
        if (!(oldMorningDone && oldAfternoonDone && oldEveningDone)) {
          // Update streak for this kid
          const todayKey = getTodayKey();
          setState((prev) => ({
            ...prev,
            kids: prev.kids.map((k) => {
              if (k.id !== kidId) return k;
              // Don't double-count same day
              if (k.streak.lastCompletionDate === todayKey) return k;
              const newCurrent = k.streak.current + 1;
              const newBest = Math.max(k.streak.best, newCurrent);
              // Check for milestone bonus stars
              const milestone = STREAK_MILESTONES.find((m) => m.days === newCurrent);
              const bonus = milestone ? milestone.bonus : 0;
              return {
                ...k,
                starBank: k.starBank + bonus,
                streak: { current: newCurrent, best: newBest, lastCompletionDate: todayKey },
              };
            }),
          }));

          // Check if this triggers a streak milestone celebration
          const newStreak = kid.streak.lastCompletionDate === getTodayKey()
            ? kid.streak.current
            : kid.streak.current + 1;
          const milestone = STREAK_MILESTONES.find((m) => m.days === newStreak);
          if (milestone) {
            // Show streak celebration after a short delay (after Super-Kid closes)
            setTimeout(() => {
              playChaChing();
              setMiniCelebration({ message: milestone.message, messageEn: milestone.messageEn });
              setTimeout(() => setMiniCelebration(null), 2000);
            }, 3200);
          }

          playFanfare();
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
          playFanfare();
          const msg = routineMessages[currentRoutineTab];
          setMiniCelebration({ message: msg.he, messageEn: msg.en });
          setTimeout(() => setMiniCelebration(null), 2000);
          return;
        }
      }

      // Regular task completion — no celebration
      playTaskSound(taskId);
      playDing();
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

  const handlePinReward = (kidId: string, rewardId: string) => {
    setState((prev) => ({
      ...prev,
      kids: prev.kids.map((k) =>
        k.id === kidId
          ? { ...k, pinnedRewardId: k.pinnedRewardId === rewardId ? null : rewardId }
          : k
      ),
    }));
  };

  const handleAddReward = (reward: Omit<Reward, 'id'>) => {
    const id = `r_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setState((prev) => ({
      ...prev,
      rewards: [...prev.rewards, { ...reward, id }],
    }));
  };

  const handleEditReward = (rewardId: string, updates: Partial<Omit<Reward, 'id'>>) => {
    setState((prev) => ({
      ...prev,
      rewards: prev.rewards.map((r) =>
        r.id === rewardId ? { ...r, ...updates } : r
      ),
    }));
  };

  const handleDeleteReward = (rewardId: string) => {
    setState((prev) => ({
      ...prev,
      rewards: prev.rewards.filter((r) => r.id !== rewardId),
    }));
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

  const formatEnglishDate = () => {
    const now = new Date();
    return `${ENGLISH_DAYS[now.getDay()]}, ${ENGLISH_MONTHS[now.getMonth()]} ${now.getDate()}`;
  };

  const getEncouragementText = (pct: number): { he: string; en: string } => {
    if (pct >= 100) return { he: 'מושלם! ✨', en: 'Perfect! ✨' };
    if (pct >= 75) return { he: 'עוד קצת! 🏆', en: 'Almost! 🏆' };
    if (pct >= 50) return { he: 'וואו, כמעט שם! 🔥', en: 'Almost there! 🔥' };
    if (pct >= 25) return { he: 'כל הכבוד, ממשיכים! 🌟', en: 'Great, keep going! 🌟' };
    return { he: 'יאללה, מתחילים! 💪', en: "Let's go! 💪" };
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${timeBg} px-2 py-4 md:px-4 md:py-6 relative transition-colors duration-[3000ms]`}>

      <div className="max-w-2xl mx-auto">

        {/* Sticky Header — 3 sections: left (logo+title), center (empty), right (icons) */}
        <div className="bg-gradient-to-r from-[#5B2C8E] via-purple-600 to-[#E8832A] rounded-2xl shadow-lg px-4 py-2 mb-2 flex items-center justify-between">
          {/* LEFT: Logo + Title */}
          <div className="flex items-center gap-3">
            <img src="/super-kid-app/logo.png" alt="Luna's Super Sisters"
                 className="rounded-full object-cover flex-shrink-0"
                 style={{ width: '56px', height: '56px', border: '3px solid white', boxShadow: '0 0 12px rgba(255,255,255,0.4)' }} />
            <div>
              <h1 className="text-lg font-extrabold text-white drop-shadow-md">Luna's Super Sisters</h1>
              <span className="text-[10px] font-semibold text-white/70" dir="rtl">ליאור, רוני ולונה 🌙</span>
            </div>
          </div>

          {/* RIGHT: Unlock timer + Mute + Parent icon */}
          <div className="flex items-center gap-2">
            {isUnlocked && (
              <>
                <span className="px-2 py-1 bg-white/20 text-white rounded-full text-xs font-semibold backdrop-blur-sm">
                  🔓 {formatTime(timeRemaining)}
                </span>
                <button
                  onClick={handleLockNow}
                  className="w-9 h-9 flex items-center justify-center bg-white/20 text-white rounded-full text-sm hover:bg-white/30 transition-colors backdrop-blur-sm"
                >
                  🔒
                </button>
              </>
            )}
            <button
              onClick={handleToggleMute}
              className="w-9 h-9 flex items-center justify-center bg-white/20 text-white rounded-full text-sm hover:bg-white/30 transition-colors backdrop-blur-sm"
            >
              {muted ? '🔇' : '🔊'}
            </button>
            <button
              onClick={handleOpenAdmin}
              className="w-9 h-9 flex items-center justify-center bg-white/20 text-white rounded-full text-sm hover:bg-white/30 transition-colors backdrop-blur-sm"
              title="הורים / Parents"
            >
              👨‍👩‍👧‍👦
            </button>
          </div>
        </div>

        {/* Date line — below header, centered, bilingual */}
        <div className="text-center mb-4">
          <div className="text-sm font-semibold text-gray-600" dir="rtl">{formatHebrewDate()}</div>
          <div className="text-xs text-gray-400">{formatEnglishDate()}</div>
          {isWeekend && (
            <div className="mt-1">
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">🌴 סוף שבוע / Weekend</span>
            </div>
          )}
        </div>

        {/* Daily Schedule Card */}
        <DailyScheduleCard
          kidId={selectedKid.id}
          kidHebrewName={selectedKid.hebrewName}
          kidEnglishName={selectedKid.name}
          kidColor={selectedKid.color}
          isWeekend={isWeekend}
          onShowWeekly={() => setShowWeeklyModal(true)}
        />

        {/* Greeting — bilingual */}
        <div className="text-center mb-3">
          <div dir="rtl">
            <span className="text-2xl font-extrabold text-gray-700">
              {greeting.emoji} {greeting.text}, {selectedKid.hebrewName}!
            </span>
          </div>
          <div className="text-sm font-semibold text-gray-400">
            {greeting.textEn}, {selectedKid.name}!
          </div>
        </div>

        {/* Kid Selector */}
        <div className="grid grid-cols-2 gap-3 mb-5 overflow-visible">
          {state.kids.map((kid, index) => {
            const isSelected = index === selectedKidIndex;
            return (
              <button
                key={kid.id}
                onClick={() => { playPop(); setSelectedKidIndex(index); }}
                className={`p-3 rounded-2xl transition-all duration-200 w-full overflow-visible active:scale-[0.98] ${
                  isSelected
                    ? `bg-gradient-to-br ${kid.color} text-white shadow-lg selected-card-glow`
                    : 'bg-white/80 text-gray-700 shadow-md hover:shadow-lg border-2 border-white/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={kid.avatar}
                    alt={kid.name}
                    className="w-15 h-15 rounded-full object-cover flex-shrink-0"
                    style={{ width: '60px', height: '60px', border: '3px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className={`text-lg font-black ${isSelected ? 'text-white' : 'text-gray-800'}`} dir="rtl">
                      {kid.hebrewName}
                    </div>
                    <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                      {kid.name}
                    </div>
                    {activeTab !== 'lunchbox' && (
                      <div className="flex items-center gap-1 mt-1">
                        {kid.streak.current >= 2 && (
                          <span className={`text-xs font-bold ${isSelected ? 'text-white/90' : 'text-orange-500'}`}>
                            🔥 {kid.streak.current}
                          </span>
                        )}
                        <div key={kid.starBank}>
                          <span className={`star-count-bump inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-black ${isSelected ? 'bg-white/30 text-white star-glow' : 'bg-yellow-100 text-yellow-600 star-glow'} ${kid.starBank === 0 ? 'text-sm' : 'text-lg'}`}>
                            {kid.starBank === 0 ? '⭐ הכוכב הראשון מחכה' : `${kid.starBank} ⭐`}
                          </span>
                          {kid.starBank === 0 && (
                            <div className={`text-[9px] ${isSelected ? 'text-white/60' : 'text-gray-400'} mr-1`}>
                              First star awaits!
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {activeTab !== 'lunchbox' && kid.pinnedRewardId && (() => {
                      const reward = state.rewards.find((r) => r.id === kid.pinnedRewardId);
                      if (!reward) return null;
                      const canAfford = kid.starBank >= reward.starCost;
                      const progressPct = Math.min(100, Math.round((kid.starBank / reward.starCost) * 100));
                      return (
                        <div className="mt-1" dir="rtl">
                          {canAfford ? (
                            <div>
                              <span className={`text-xs font-bold can-afford-glow ${isSelected ? 'text-yellow-200' : 'text-yellow-600'}`}>
                                🎉 אפשר לקנות {reward.emoji}!
                              </span>
                              <div className={`text-[9px] ${isSelected ? 'text-white/60' : 'text-yellow-400'}`}>
                                Can buy {reward.emoji}!
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <div>
                                <span className={`text-xs font-semibold ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                                  עוד {reward.starCost - kid.starBank} ⭐ ל-{reward.emoji}
                                </span>
                                <div className={`text-[9px] ${isSelected ? 'text-white/60' : 'text-gray-400'}`}>
                                  {reward.starCost - kid.starBank} more ⭐ for {reward.emoji}
                                </div>
                              </div>
                              <div className="flex-1 h-1.5 bg-gray-200/50 rounded-full overflow-hidden max-w-[60px]">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${kid.color}`}
                                  style={{ width: `${progressPct}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Progress + Tabs Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-md p-5 mb-5 border border-white/50">
          {/* Progress section */}
          {activeTab !== 'rewards' && activeTab !== 'lunchbox' && (
            <div className="flex items-center gap-5 mb-4">
              <ProgressRing percent={progress} color={selectedKid.accent} size={96} glow={progress >= 75}>
                <span className="text-2xl">{getProgressCharacter(progress)}</span>
              </ProgressRing>
              <div>
                <div className="text-3xl font-black text-gray-800" dir="rtl">
                  {doneTasks} מתוך {totalTasks}
                </div>
                <div className="text-sm font-semibold text-gray-400">
                  {doneTasks} of {totalTasks}
                </div>
                <div className="text-xl font-extrabold" dir="rtl" style={{ color: selectedKid.accent }}>
                  {getEncouragementText(progress).he}
                </div>
                <div className="text-xs font-semibold text-gray-400">
                  {getEncouragementText(progress).en}
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
                  onClick={() => { playClick(); setActiveTab(tab.id); }}
                  className={`flex-1 min-w-0 py-2.5 px-3 rounded-full font-semibold text-sm transition-all whitespace-nowrap active:scale-95 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-orange-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className="block">{tab.emoji} {tab.label}</span>
                  <span className={`block text-[9px] ${isActive ? 'text-white/70' : 'text-gray-400'}`}>{tab.labelEn}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Content Area */}
        <div key={effectiveTab} className="tab-slide-in rounded-3xl shadow-md p-3 border border-white/50 backdrop-blur-sm" style={{
          background: effectiveTab === 'morning' ? 'rgba(255, 251, 235, 0.95)'
            : effectiveTab === 'afternoon' ? 'rgba(240, 249, 255, 0.95)'
            : effectiveTab === 'evening' ? 'rgba(245, 243, 255, 0.95)'
            : 'rgba(255, 255, 255, 0.9)'
        }}>
          {activeTab === 'rewards' ? (
            <RewardsShop
              rewards={state.rewards}
              starBank={selectedKid.starBank}
              onRedeemReward={(rewardId) => handleRedeemReward(selectedKid.id, rewardId)}
              pinnedRewardId={selectedKid.pinnedRewardId ?? null}
              onPinReward={(rewardId) => handlePinReward(selectedKid.id, rewardId)}
            />
          ) : activeTab === 'lunchbox' ? (
            <LunchboxBuilder
              key={selectedKid.id}
              kidId={selectedKid.id}
              kidHebrewName={selectedKid.hebrewName}
              kidColor={selectedKid.color}
              foodItems={foodCatalog.filter((f) => f.available)}
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
            <h2 className="text-lg font-bold text-gray-800 mb-1">סיכום אתמול</h2>
            <p className="text-xs text-gray-400 mb-4">Yesterday's Summary</p>
            {yesterdaySummary.kids.map((kid) => (
              <div key={kid.hebrewName} className="flex items-center justify-center gap-3 mb-2">
                <img src={kid.avatar} alt={kid.hebrewName} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <span className="font-semibold text-gray-700">
                    {kid.hebrewName}: {kid.done} מתוך {kid.total} משימות!
                  </span>
                  <div className="text-xs text-gray-400">
                    {kid.done} of {kid.total} tasks!
                  </div>
                </div>
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
          messageEn={miniCelebration.messageEn}
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

      {/* Weekly Schedule Modal */}
      {showWeeklyModal && (
        <WeeklyScheduleModal
          kidId={selectedKid.id}
          kidHebrewName={selectedKid.hebrewName}
          kidEnglishName={selectedKid.name}
          kidColor={selectedKid.color}
          onClose={() => setShowWeeklyModal(false)}
        />
      )}

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
          weekendOverride={weekendOverride}
          onToggleWeekend={() => setWeekendOverride((prev) => prev === null ? !isWeekendAuto : prev ? false : null)}
          onAddReward={handleAddReward}
          onEditReward={handleEditReward}
          onDeleteReward={handleDeleteReward}
          foodCatalog={foodCatalog}
          onUpdateFoodCatalog={setFoodCatalog}
        />
      )}
    </div>
  );
}

export default App;
