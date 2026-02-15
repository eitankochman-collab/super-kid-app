import { useState, useEffect } from 'react';
import type { KidData, Reward, RewardTier, FoodItem, DaySchedule, ParentRole, AfterSchoolMode, ScheduleOverride } from '../types';
import { BONUS_LOG_KEY, PICKUP_TIME_PRESETS, HEBREW_DAYS } from '../constants';
import { loadSchedule, saveSchedule, loadScheduleOverrides, saveScheduleOverride, deleteScheduleOverride } from '../scheduleStorage';
import { loadDailyLog } from '../storage';
import type { DailyRecord } from '../storage';
import { LunchboxAdmin } from './LunchboxAdmin';

interface BonusEntry {
  date: string; // YYYY-MM-DD
  kidId: string;
  description: string;
}

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function loadBonusLog(): BonusEntry[] {
  try {
    const stored = localStorage.getItem(BONUS_LOG_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return [];
}

function saveBonusLog(log: BonusEntry[]): void {
  localStorage.setItem(BONUS_LOG_KEY, JSON.stringify(log));
}

function getRecentBonuses(log: BonusEntry[]): BonusEntry[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const cutoffKey = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, '0')}-${String(cutoff.getDate()).padStart(2, '0')}`;
  return log.filter((e) => e.date >= cutoffKey).reverse();
}

const EMOJI_PICKER = ['🎬', '📺', '🎲', '🍕', '🎨', '👫', '💰', '📚', '🍦', '🧸', '🤸', '💵', '🎡', '🛒', '🎮', '🎪', '🏊', '🎤', '🍰', '⚽'];

const TIER_OPTIONS: { value: RewardTier; label: string; bg: string }[] = [
  { value: 'quick', label: 'מהיר', bg: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'weekly', label: 'שבועי', bg: 'bg-amber-100 text-amber-700 border-amber-300' },
  { value: 'monthly', label: 'חודשי', bg: 'bg-rose-100 text-rose-700 border-rose-300' },
];

const TIER_BADGE: Record<RewardTier, { label: string; className: string }> = {
  quick: { label: 'מהיר', className: 'bg-green-100 text-green-700' },
  weekly: { label: 'שבועי', className: 'bg-amber-100 text-amber-700' },
  monthly: { label: 'חודשי', className: 'bg-rose-100 text-rose-700' },
};

const TIER_ORDER: RewardTier[] = ['quick', 'weekly', 'monthly'];
const TIER_HEADERS: Record<RewardTier, string> = {
  quick: '🟢 פרסים מהירים',
  weekly: '🟡 פרסים שבועיים',
  monthly: '🔴 פרסים חודשיים',
};

interface RewardFormData {
  emoji: string;
  hebrew: string;
  title: string;
  starCost: number;
  tier: RewardTier;
}

const EMPTY_FORM: RewardFormData = {
  emoji: '🎁',
  hebrew: '',
  title: '',
  starCost: 15,
  tier: 'quick',
};

interface AdminPanelProps {
  kids: KidData[];
  rewards: Reward[];
  onRedeemReward: (kidId: string, rewardId: string) => void;
  onAdjustStars: (kidId: string, delta: number) => void;
  onClose: () => void;
  isUnlocked: boolean;
  onRequestPin: (action: () => void) => void;
  onResetDone: () => void;
  weekendOverride: boolean | null;
  onToggleWeekend: () => void;
  onAddReward: (reward: Omit<Reward, 'id'>) => void;
  onEditReward: (rewardId: string, updates: Partial<Omit<Reward, 'id'>>) => void;
  onDeleteReward: (rewardId: string) => void;
  foodCatalog: FoodItem[];
  onUpdateFoodCatalog: (items: FoodItem[]) => void;
}

function SectionHeader({ id, title, isOpen, onToggle }: { id: string; title: string; isOpen: boolean; onToggle: (id: string) => void }) {
  return (
    <button
      onClick={() => onToggle(id)}
      className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl mb-2 hover:bg-gray-100 transition-colors"
    >
      <h3 className="text-xl font-bold text-gray-700">{title}</h3>
      <span className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
    </button>
  );
}

export function AdminPanel({
  kids,
  rewards,
  onRedeemReward,
  onAdjustStars,
  onClose,
  isUnlocked,
  onRequestPin,
  onResetDone,
  weekendOverride,
  onToggleWeekend,
  onAddReward,
  onEditReward,
  onDeleteReward,
  foodCatalog,
  onUpdateFoodCatalog,
}: AdminPanelProps) {
  const [bonusKidId, setBonusKidId] = useState(kids[0]?.id || '');
  const [bonusText, setBonusText] = useState('');
  const [bonusLog, setBonusLog] = useState<BonusEntry[]>(loadBonusLog);
  const [showFloat, setShowFloat] = useState(false);
  const [weeklyKidId, setWeeklyKidId] = useState(kids[0]?.id || '');
  const [weekOffset, setWeekOffset] = useState(0);
  const [dailyLog] = useState<DailyRecord[]>(loadDailyLog);
  const [weeklySchedule, setWeeklySchedule] = useState(loadSchedule);
  const [scheduleOverrides, setScheduleOverrides] = useState(loadScheduleOverrides);
  const [overrideDate, setOverrideDate] = useState('');
  const [editingOverride, setEditingOverride] = useState<DaySchedule | null>(null);

  // Accordion state — all collapsed by default
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['stars']));
  const toggleSection = (id: string) => setOpenSections(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  // Reward CRUD state
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);
  const [rewardForm, setRewardForm] = useState<RewardFormData>(EMPTY_FORM);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const today = getTodayKey();
  const bonusKid = kids.find((k) => k.id === bonusKidId);
  const alreadyGotBonus = bonusLog.some((e) => e.date === today && e.kidId === bonusKidId);
  const recentBonuses = getRecentBonuses(bonusLog);

  const bonusGivenText = `כבר קיבלה בונוס היום ✅`;

  useEffect(() => {
    saveBonusLog(bonusLog);
  }, [bonusLog]);

  const handleRedeem = (kidId: string, rewardId: string) => {
    const action = () => onRedeemReward(kidId, rewardId);

    if (isUnlocked) {
      action();
    } else {
      onRequestPin(action);
    }
  };

  const handleAwardBonus = () => {
    if (alreadyGotBonus || !bonusText.trim()) return;

    onAdjustStars(bonusKidId, 1);
    setBonusLog((prev) => [...prev, { date: today, kidId: bonusKidId, description: bonusText.trim() }]);
    setBonusText('');
    setShowFloat(true);
    setTimeout(() => setShowFloat(false), 1000);
  };

  const handleOpenAddForm = () => {
    setRewardForm(EMPTY_FORM);
    setEditingRewardId(null);
    setShowRewardForm(true);
    setShowEmojiPicker(false);
  };

  const handleOpenEditForm = (reward: Reward) => {
    setRewardForm({
      emoji: reward.emoji,
      hebrew: reward.hebrew,
      title: reward.title,
      starCost: reward.starCost,
      tier: reward.tier,
    });
    setEditingRewardId(reward.id);
    setShowRewardForm(true);
    setShowEmojiPicker(false);
  };

  const handleSaveReward = () => {
    if (!rewardForm.hebrew.trim() || !rewardForm.title.trim() || rewardForm.starCost < 1) return;

    if (editingRewardId) {
      onEditReward(editingRewardId, rewardForm);
    } else {
      onAddReward(rewardForm);
    }
    setShowRewardForm(false);
    setEditingRewardId(null);
  };

  const handleDeleteReward = (rewardId: string) => {
    if (window.confirm('למחוק את הפרס?')) {
      onDeleteReward(rewardId);
    }
  };

  // Group rewards by tier for display
  const groupedRewards = TIER_ORDER.map((tier) => ({
    tier,
    rewards: rewards.filter((r) => r.tier === tier).sort((a, b) => a.starCost - b.starCost),
  })).filter((g) => g.rewards.length > 0);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-start justify-center z-40 p-4 pt-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-8 max-w-4xl w-full shadow-2xl mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            👨‍👩‍👧‍👦 ניהול הורים
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        {/* Star Banks */}
        <SectionHeader id="stars" title="⭐ ניהול כוכבים" isOpen={openSections.has('stars')} onToggle={toggleSection} />
        {openSections.has('stars') && (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {kids.map((kid) => (
                <div
                  key={kid.id}
                  className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl border-2 border-yellow-200"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <img src={kid.avatar} alt={kid.name} className="w-10 h-10 rounded-full object-cover border-2 border-white/50 shadow-sm" />
                      <div>
                        <h4 className="text-xl font-bold text-gray-800" dir="rtl">{kid.hebrewName}</h4>
                        <p className="text-sm text-gray-500">{kid.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onAdjustStars(kid.id, -1)}
                        disabled={kid.starBank <= 0}
                        className="w-10 h-10 rounded-full bg-red-100 text-red-600 font-bold text-xl flex items-center justify-center hover:bg-red-200 transition-colors active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <div className="text-2xl font-bold text-yellow-600 min-w-[4rem] text-center">
                        {kid.starBank} ⭐
                      </div>
                      <button
                        onClick={() => onAdjustStars(kid.id, 1)}
                        className="w-10 h-10 rounded-full bg-green-100 text-green-600 font-bold text-xl flex items-center justify-center hover:bg-green-200 transition-colors active:scale-95"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {kid.pinnedRewardId && (() => {
                    const pinnedReward = rewards.find((r) => r.id === kid.pinnedRewardId);
                    if (!pinnedReward) return null;
                    return (
                      <div className="mt-3 pt-3 border-t border-yellow-200 flex items-center gap-2 text-sm" dir="rtl">
                        <span>📌</span>
                        <span className="font-bold text-yellow-700">
                          {pinnedReward.emoji} {pinnedReward.hebrew} — {pinnedReward.starCost} ⭐
                        </span>
                        {kid.starBank >= pinnedReward.starCost && (
                          <span className="text-green-600 font-bold text-xs">✅ אפשר לקנות!</span>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weekly View */}
        <SectionHeader id="weekly" title="📅 תצוגה שבועית" isOpen={openSections.has('weekly')} onToggle={toggleSection} />
        {openSections.has('weekly') && (
          <div className="mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl border-2 border-blue-200">
              {/* Kid selector */}
              <div className="flex gap-3 mb-4 justify-center">
                {kids.map((kid) => (
                  <button
                    key={kid.id}
                    onClick={() => setWeeklyKidId(kid.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                      weeklyKidId === kid.id
                        ? `bg-gradient-to-r ${kid.color} text-white shadow-md`
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <img src={kid.avatar} alt={kid.name} className="w-7 h-7 rounded-full object-cover" />
                    {kid.hebrewName}
                  </button>
                ))}
              </div>

              {/* Week navigation */}
              {(() => {
                const HEBREW_DAY_SHORT = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

                const now = new Date();
                const currentDay = now.getDay();
                const sunday = new Date(now);
                sunday.setDate(now.getDate() - currentDay + weekOffset * 7);

                const weekDays = Array.from({ length: 7 }, (_, i) => {
                  const d = new Date(sunday);
                  d.setDate(sunday.getDate() + i);
                  return {
                    dayIndex: i,
                    label: HEBREW_DAY_SHORT[i],
                    dateKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
                    dayNum: d.getDate(),
                    isToday: d.toDateString() === now.toDateString(),
                    isFuture: d > now,
                  };
                });

                const sunDate = new Date(sunday);
                const satDate = new Date(sunday);
                satDate.setDate(sunday.getDate() + 6);
                const rangeLabel = `${sunDate.getDate()}/${sunDate.getMonth() + 1} - ${satDate.getDate()}/${satDate.getMonth() + 1}`;

                const weekRecords = weekDays.map((day) => {
                  const record = dailyLog.find((r) => r.date === day.dateKey && r.kidId === weeklyKidId);
                  return { ...day, record };
                });

                const amazingDays = weekRecords.filter((d) => d.record && d.record.done > 0 && d.record.done === d.record.total).length;
                const totalStars = weekRecords.reduce((sum, d) => sum + (d.record?.done || 0), 0);

                const weeklyKid = kids.find((k) => k.id === weeklyKidId);
                const streakLastDate = weeklyKid?.streak.lastCompletionDate;
                const streakCurrent = weeklyKid?.streak.current || 0;

                const streakDates = new Set<string>();
                if (streakLastDate && streakCurrent > 0) {
                  const lastDate = new Date(streakLastDate + 'T00:00:00');
                  for (let i = 0; i < streakCurrent; i++) {
                    const d = new Date(lastDate);
                    d.setDate(lastDate.getDate() - i);
                    streakDates.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
                  }
                }

                return (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={() => setWeekOffset((p) => p - 1)}
                        className="w-9 h-9 rounded-full bg-white text-gray-600 font-bold text-lg flex items-center justify-center hover:bg-gray-100 transition-colors active:scale-95 shadow-sm"
                      >
                        ‹
                      </button>
                      <span className="text-sm font-bold text-gray-600">{rangeLabel}</span>
                      <button
                        onClick={() => setWeekOffset((p) => Math.min(0, p + 1))}
                        disabled={weekOffset >= 0}
                        className="w-9 h-9 rounded-full bg-white text-gray-600 font-bold text-lg flex items-center justify-center hover:bg-gray-100 transition-colors active:scale-95 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        ›
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {weekRecords.map((day) => {
                        const allDone = day.record && day.record.done > 0 && day.record.done === day.record.total;
                        const someDone = day.record && day.record.done > 0 && !allDone;
                        const isStreak = streakDates.has(day.dateKey);

                        let bgClass = 'bg-gray-100 border-gray-200';
                        let dotColor = 'bg-gray-300';
                        if (day.isFuture) {
                          bgClass = 'bg-gray-50 border-gray-100';
                          dotColor = 'bg-gray-200';
                        } else if (allDone) {
                          bgClass = 'bg-green-100 border-green-300';
                          dotColor = 'bg-green-500';
                        } else if (someDone) {
                          bgClass = 'bg-orange-50 border-orange-200';
                          dotColor = 'bg-orange-400';
                        }

                        return (
                          <div
                            key={day.dateKey}
                            className={`flex flex-col items-center p-2 rounded-xl border-2 ${bgClass} ${day.isToday ? 'ring-2 ring-blue-400' : ''}`}
                          >
                            <span className="text-xs font-bold text-gray-500">{day.label}</span>
                            <span className="text-xs text-gray-400">{day.dayNum}</span>
                            <div className={`w-6 h-6 rounded-full ${dotColor} mt-1 flex items-center justify-center`}>
                              {allDone && <span className="text-white text-xs">✓</span>}
                            </div>
                            {isStreak && !day.isFuture && <span className="text-xs mt-0.5">🔥</span>}
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-center" dir="rtl">
                      {amazingDays > 0 ? (
                        <p className="text-base font-bold text-green-700">
                          🌟 {amazingDays} ימים מדהימים השבוע!
                        </p>
                      ) : weekOffset === 0 ? (
                        <p className="text-base font-bold text-blue-600">
                          💪 שבוע חדש, הזדמנות חדשה!
                        </p>
                      ) : (
                        <p className="text-base font-bold text-blue-600">
                          ✨ כל שבוע הוא הזדמנות חדשה!
                        </p>
                      )}
                      {totalStars > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                          ⭐ {totalStars} משימות הושלמו
                        </p>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* Behavior Bonus */}
        <SectionHeader id="bonus" title="כוכב בונוס ⭐" isOpen={openSections.has('bonus')} onToggle={toggleSection} />
        {openSections.has('bonus') && (
          <div className="mb-8">
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-5 rounded-2xl border-2 border-amber-200">
              <div className="flex gap-3 mb-4 justify-center">
                {kids.map((kid) => (
                  <button
                    key={kid.id}
                    onClick={() => setBonusKidId(kid.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                      bonusKidId === kid.id
                        ? `bg-gradient-to-r ${kid.color} text-white shadow-md`
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <img src={kid.avatar} alt={kid.name} className="w-7 h-7 rounded-full object-cover" />
                    {kid.hebrewName}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 items-center" dir="rtl">
                <input
                  type="text"
                  value={bonusText}
                  onChange={(e) => setBonusText(e.target.value)}
                  placeholder={`?מה עשתה ${bonusKid?.hebrewName || ''}`}
                  disabled={alreadyGotBonus}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-amber-200 bg-white text-gray-800 font-medium placeholder-gray-400 focus:outline-none focus:border-amber-400 disabled:bg-gray-100 disabled:text-gray-400"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAwardBonus(); }}
                />
                <div className="relative">
                  <button
                    onClick={handleAwardBonus}
                    disabled={alreadyGotBonus || !bonusText.trim()}
                    className={`px-5 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 whitespace-nowrap ${
                      alreadyGotBonus
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : !bonusText.trim()
                          ? 'bg-amber-200 text-amber-500 cursor-not-allowed'
                          : 'bg-amber-500 text-white hover:bg-amber-600 shadow-md'
                    }`}
                  >
                    {alreadyGotBonus ? bonusGivenText : '⭐ תן כוכב'}
                  </button>
                  {showFloat && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-lg font-bold text-amber-500 bonus-float">
                      +1 ⭐
                    </span>
                  )}
                </div>
              </div>

              {recentBonuses.length > 0 && (
                <div className="mt-4 pt-3 border-t border-amber-200">
                  <p className="text-xs font-semibold text-gray-400 mb-2" dir="rtl">7 ימים אחרונים:</p>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {recentBonuses.map((entry, i) => {
                      const kid = kids.find((k) => k.id === entry.kidId);
                      return (
                        <div key={i} className="flex items-center gap-2 text-sm" dir="rtl">
                          {kid && <img src={kid.avatar} alt={kid.name} className="w-5 h-5 rounded-full object-cover" />}
                          <span className="text-gray-500 text-xs">{entry.date.slice(5)}</span>
                          <span className="text-gray-700 font-medium">{entry.description}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rewards Management */}
        <SectionHeader id="rewards" title="🎁 ניהול פרסים" isOpen={openSections.has('rewards')} onToggle={toggleSection} />
        {openSections.has('rewards') && (
          <div className="mb-8">
            <div className="flex justify-end mb-4">
              <button
                onClick={handleOpenAddForm}
                className="px-4 py-2 bg-purple-500 text-white rounded-xl font-bold text-sm hover:bg-purple-600 transition-colors active:scale-95 shadow-md"
              >
                + הוסף פרס
              </button>
            </div>

            {/* Reward form (add/edit) */}
            {showRewardForm && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-2xl border-2 border-purple-200 mb-4">
                <h4 className="text-lg font-bold text-gray-800 mb-4" dir="rtl">
                  {editingRewardId ? '✏️ עריכת פרס' : '➕ פרס חדש'}
                </h4>

                <div className="space-y-3">
                  {/* Emoji picker */}
                  <div>
                    <label className="text-sm font-semibold text-gray-600 block mb-1" dir="rtl">אימוג׳י</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="w-14 h-14 rounded-xl bg-white border-2 border-purple-200 text-3xl flex items-center justify-center hover:border-purple-400 transition-colors"
                      >
                        {rewardForm.emoji}
                      </button>
                      {showEmojiPicker && (
                        <div className="flex flex-wrap gap-1.5 bg-white p-2 rounded-xl border-2 border-purple-200 max-w-xs">
                          {EMOJI_PICKER.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => { setRewardForm((f) => ({ ...f, emoji })); setShowEmojiPicker(false); }}
                              className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center hover:bg-purple-100 transition-colors ${
                                rewardForm.emoji === emoji ? 'bg-purple-200 ring-2 ring-purple-400' : ''
                              }`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hebrew name */}
                  <div>
                    <label className="text-sm font-semibold text-gray-600 block mb-1" dir="rtl">שם בעברית</label>
                    <input
                      type="text"
                      value={rewardForm.hebrew}
                      onChange={(e) => setRewardForm((f) => ({ ...f, hebrew: e.target.value }))}
                      placeholder="סרט ערב"
                      dir="rtl"
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-purple-200 bg-white text-gray-800 font-medium placeholder-gray-400 focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  {/* English name */}
                  <div>
                    <label className="text-sm font-semibold text-gray-600 block mb-1">English name</label>
                    <input
                      type="text"
                      value={rewardForm.title}
                      onChange={(e) => setRewardForm((f) => ({ ...f, title: e.target.value }))}
                      placeholder="Movie night"
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-purple-200 bg-white text-gray-800 font-medium placeholder-gray-400 focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  {/* Star cost */}
                  <div>
                    <label className="text-sm font-semibold text-gray-600 block mb-1" dir="rtl">מחיר (כוכבים)</label>
                    <input
                      type="number"
                      min={1}
                      value={rewardForm.starCost}
                      onChange={(e) => setRewardForm((f) => ({ ...f, starCost: Math.max(1, parseInt(e.target.value) || 1) }))}
                      className="w-32 px-4 py-2.5 rounded-xl border-2 border-purple-200 bg-white text-gray-800 font-bold text-center focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  {/* Tier selector */}
                  <div>
                    <label className="text-sm font-semibold text-gray-600 block mb-1" dir="rtl">דרגה</label>
                    <div className="flex gap-2">
                      {TIER_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setRewardForm((f) => ({ ...f, tier: opt.value }))}
                          className={`px-4 py-2 rounded-xl font-bold text-sm border-2 transition-all active:scale-95 ${
                            rewardForm.tier === opt.value
                              ? `${opt.bg} ring-2 ring-offset-1 ring-purple-400`
                              : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Save / Cancel */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSaveReward}
                      disabled={!rewardForm.hebrew.trim() || !rewardForm.title.trim()}
                      className="px-6 py-2.5 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-colors active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      💾 שמירה
                    </button>
                    <button
                      onClick={() => { setShowRewardForm(false); setEditingRewardId(null); }}
                      className="px-6 py-2.5 bg-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-300 transition-colors active:scale-95"
                    >
                      ביטול
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Rewards list grouped by tier */}
            <div className="space-y-4">
              {groupedRewards.map(({ tier, rewards: tierRewards }) => (
                <div key={tier}>
                  <div className="text-sm font-bold text-gray-500 mb-2" dir="rtl">{TIER_HEADERS[tier]}</div>
                  <div className="space-y-2">
                    {tierRewards.map((reward) => (
                      <div
                        key={reward.id}
                        className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-2xl border-2 border-purple-200"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{reward.emoji}</span>
                            <div>
                              <h4 className="text-base font-bold text-gray-800" dir="rtl">{reward.hebrew}</h4>
                              <p className="text-sm text-gray-500">{reward.title}</p>
                            </div>
                            <span className="text-purple-600 font-semibold text-sm">
                              {reward.starCost} ⭐
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${TIER_BADGE[reward.tier].className}`}>
                              {TIER_BADGE[reward.tier].label}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditForm(reward)}
                              className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors active:scale-95"
                              title="ערוך"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteReward(reward.id)}
                              className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors active:scale-95"
                              title="מחק"
                            >
                              🗑️
                            </button>
                            <div className="flex gap-1 ml-2">
                              {kids.map((kid) => {
                                const canAfford = kid.starBank >= reward.starCost;
                                return (
                                  <button
                                    key={kid.id}
                                    onClick={() => handleRedeem(kid.id, reward.id)}
                                    disabled={!canAfford}
                                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                                      canAfford
                                        ? 'bg-green-500 text-white hover:bg-green-600 shadow-md'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                                    title={`Redeem for ${kid.name}`}
                                  >
                                    <img src={kid.avatar} alt={kid.name} className="w-5 h-5 rounded-full object-cover inline-block mr-1" /> {kid.hebrewName}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weekly Schedule */}
        <SectionHeader id="schedule" title="📅 לוח זמנים שבועי" isOpen={openSections.has('schedule')} onToggle={toggleSection} />
        {openSections.has('schedule') && (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(['1', '2', '3', '4', '5'] as const).map((dayKey) => {
                const day = weeklySchedule[dayKey];
                if (!day) return null;
                const dayLabel = HEBREW_DAYS[Number(dayKey)];
                return (
                  <div key={dayKey} className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-2xl border-2 border-teal-200">
                    <h4 className="text-base font-bold text-gray-700 mb-3" dir="rtl">יום {dayLabel}</h4>

                    {/* מי מפזר/ת */}
                    <div className="mb-2" dir="rtl">
                      <span className="text-xs font-semibold text-gray-500">מי מפזר/ת:</span>
                      <div className="flex gap-2 mt-1">
                        {(['אמא', 'אבא'] as ParentRole[]).map((role) => (
                          <button
                            key={role}
                            onClick={() => {
                              const updated = { ...weeklySchedule, [dayKey]: { ...day, dropoff: role } };
                              setWeeklySchedule(updated);
                              saveSchedule(updated);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                              day.dropoff === role
                                ? role === 'אבא' ? 'bg-blue-200 border-2 border-blue-400 text-blue-700' : 'bg-pink-200 border-2 border-pink-400 text-pink-700'
                                : 'bg-gray-100 border-2 border-gray-200 text-gray-500'
                            }`}
                          >
                            {role === 'אבא' ? '👨' : '👩'} {role}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* צהרון */}
                    <div className="mb-2" dir="rtl">
                      <span className="text-xs font-semibold text-gray-500">צהרון:</span>
                      <div className="flex gap-2 mt-1">
                        {([['tzaharon', 'כן 🏠'], ['pickup', 'לא 🕐']] as [AfterSchoolMode, string][]).map(([mode, label]) => (
                          <button
                            key={mode}
                            onClick={() => {
                              const updated = { ...weeklySchedule, [dayKey]: { ...day, afterSchool: mode } };
                              setWeeklySchedule(updated);
                              saveSchedule(updated);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                              day.afterSchool === mode
                                ? 'bg-teal-200 border-2 border-teal-400 text-teal-700'
                                : 'bg-gray-100 border-2 border-gray-200 text-gray-500'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* שעת איסוף — only if no צהרון */}
                    {day.afterSchool === 'pickup' && (
                      <div className="mb-2" dir="rtl">
                        <span className="text-xs font-semibold text-gray-500">שעת איסוף:</span>
                        {kids.map((kid) => (
                          <div key={kid.id} className="flex items-center gap-1.5 mt-1">
                            <img src={kid.avatar} alt={kid.name} className="w-5 h-5 rounded-full object-cover" />
                            <span className="text-xs font-semibold text-gray-600 min-w-[40px]">{kid.hebrewName}:</span>
                            <div className="flex gap-1 flex-wrap">
                              {PICKUP_TIME_PRESETS.map((time) => (
                                <button
                                  key={time}
                                  onClick={() => {
                                    const updated = {
                                      ...weeklySchedule,
                                      [dayKey]: {
                                        ...day,
                                        pickupTimes: { ...day.pickupTimes, [kid.id]: time },
                                      },
                                    };
                                    setWeeklySchedule(updated);
                                    saveSchedule(updated);
                                  }}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all active:scale-95 ${
                                    day.pickupTimes[kid.id] === time
                                      ? 'bg-teal-300 border border-teal-500 text-teal-800'
                                      : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                                  }`}
                                >
                                  {time}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* מי אוסף/ת */}
                    <div className="mb-2" dir="rtl">
                      <span className="text-xs font-semibold text-gray-500">מי אוסף/ת:</span>
                      <div className="flex gap-2 mt-1">
                        {(['אמא', 'אבא'] as ParentRole[]).map((role) => (
                          <button
                            key={role}
                            onClick={() => {
                              const updated = { ...weeklySchedule, [dayKey]: { ...day, pickup: role } };
                              setWeeklySchedule(updated);
                              saveSchedule(updated);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                              day.pickup === role
                                ? role === 'אבא' ? 'bg-blue-200 border-2 border-blue-400 text-blue-700' : 'bg-pink-200 border-2 border-pink-400 text-pink-700'
                                : 'bg-gray-100 border-2 border-gray-200 text-gray-500'
                            }`}
                          >
                            {role === 'אבא' ? '👨' : '👩'} {role}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* חונכות */}
                    <div className="mb-2" dir="rtl">
                      <span className="text-xs font-semibold text-gray-500">חונכות:</span>
                      <input
                        type="text"
                        value={day.tutoring}
                        onChange={(e) => {
                          const updated = { ...weeklySchedule, [dayKey]: { ...day, tutoring: e.target.value } };
                          setWeeklySchedule(updated);
                          saveSchedule(updated);
                        }}
                        placeholder="שם המורה..."
                        className="w-full mt-1 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-teal-400"
                      />
                    </div>

                    {/* אירוע מיוחד */}
                    <div dir="rtl">
                      <span className="text-xs font-semibold text-gray-500">אירוע מיוחד:</span>
                      <div className="flex gap-2 mt-1">
                        <input
                          type="text"
                          value={day.specialEventEmoji}
                          onChange={(e) => {
                            const updated = { ...weeklySchedule, [dayKey]: { ...day, specialEventEmoji: e.target.value } };
                            setWeeklySchedule(updated);
                            saveSchedule(updated);
                          }}
                          className="w-12 px-2 py-1.5 rounded-xl border border-gray-200 bg-white text-center text-lg focus:outline-none focus:border-teal-400"
                        />
                        <input
                          type="text"
                          value={day.specialEvent}
                          onChange={(e) => {
                            const updated = { ...weeklySchedule, [dayKey]: { ...day, specialEvent: e.target.value } };
                            setWeeklySchedule(updated);
                            saveSchedule(updated);
                          }}
                          placeholder="תיאור אירוע..."
                          className="flex-1 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-teal-400"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Override subsection */}
            <div className="mt-4 bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-2xl border-2 border-amber-200">
              <h4 className="text-base font-bold text-gray-700 mb-3" dir="rtl">📌 דריסה לתאריך ספציפי</h4>
              <div className="flex gap-2 items-center mb-3" dir="rtl">
                <input
                  type="date"
                  value={overrideDate}
                  onChange={(e) => {
                    setOverrideDate(e.target.value);
                    // Load existing override or create from weekly template
                    const existing = scheduleOverrides.find((o) => o.date === e.target.value);
                    if (existing) {
                      setEditingOverride(existing.schedule);
                    } else {
                      const dayOfWeek = new Date(e.target.value + 'T00:00:00').getDay();
                      const template = weeklySchedule[String(dayOfWeek)];
                      setEditingOverride(template ? { ...template } : null);
                    }
                  }}
                  className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-amber-400"
                />
                {overrideDate && editingOverride && (
                  <button
                    onClick={() => {
                      const override: ScheduleOverride = { date: overrideDate, schedule: editingOverride };
                      saveScheduleOverride(override);
                      setScheduleOverrides(loadScheduleOverrides());
                      setOverrideDate('');
                      setEditingOverride(null);
                    }}
                    className="px-4 py-2 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-colors active:scale-95 shadow-md"
                  >
                    💾 שמור דריסה
                  </button>
                )}
              </div>

              {/* Override editor */}
              {overrideDate && editingOverride && (
                <div className="bg-white/80 p-3 rounded-xl mb-3 space-y-2" dir="rtl">
                  {/* Dropoff */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500 min-w-[70px]">מי מפזר/ת:</span>
                    {(['אמא', 'אבא'] as ParentRole[]).map((role) => (
                      <button
                        key={role}
                        onClick={() => setEditingOverride({ ...editingOverride, dropoff: role })}
                        className={`px-2 py-1 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                          editingOverride.dropoff === role
                            ? role === 'אבא' ? 'bg-blue-200 text-blue-700' : 'bg-pink-200 text-pink-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {role === 'אבא' ? '👨' : '👩'} {role}
                      </button>
                    ))}
                  </div>
                  {/* After school */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500 min-w-[70px]">צהרון:</span>
                    {([['tzaharon', 'כן'], ['pickup', 'לא']] as [AfterSchoolMode, string][]).map(([mode, label]) => (
                      <button
                        key={mode}
                        onClick={() => setEditingOverride({ ...editingOverride, afterSchool: mode })}
                        className={`px-2 py-1 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                          editingOverride.afterSchool === mode ? 'bg-teal-200 text-teal-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {/* Pickup times */}
                  {editingOverride.afterSchool === 'pickup' && kids.map((kid) => (
                    <div key={kid.id} className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-gray-500 min-w-[70px]">{kid.hebrewName}:</span>
                      <div className="flex gap-1 flex-wrap">
                        {PICKUP_TIME_PRESETS.map((time) => (
                          <button
                            key={time}
                            onClick={() => setEditingOverride({
                              ...editingOverride,
                              pickupTimes: { ...editingOverride.pickupTimes, [kid.id]: time },
                            })}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all active:scale-95 ${
                              editingOverride.pickupTimes[kid.id] === time
                                ? 'bg-teal-300 text-teal-800' : 'bg-white border border-gray-200 text-gray-500'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {/* Pickup parent */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500 min-w-[70px]">מי אוסף/ת:</span>
                    {(['אמא', 'אבא'] as ParentRole[]).map((role) => (
                      <button
                        key={role}
                        onClick={() => setEditingOverride({ ...editingOverride, pickup: role })}
                        className={`px-2 py-1 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                          editingOverride.pickup === role
                            ? role === 'אבא' ? 'bg-blue-200 text-blue-700' : 'bg-pink-200 text-pink-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {role === 'אבא' ? '👨' : '👩'} {role}
                      </button>
                    ))}
                  </div>
                  {/* Tutoring */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500 min-w-[70px]">חונכות:</span>
                    <input
                      type="text"
                      value={editingOverride.tutoring}
                      onChange={(e) => setEditingOverride({ ...editingOverride, tutoring: e.target.value })}
                      className="flex-1 px-2 py-1 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-amber-400"
                      placeholder="שם..."
                    />
                  </div>
                  {/* Special event */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500 min-w-[70px]">אירוע:</span>
                    <input
                      type="text"
                      value={editingOverride.specialEventEmoji}
                      onChange={(e) => setEditingOverride({ ...editingOverride, specialEventEmoji: e.target.value })}
                      className="w-10 px-1 py-1 rounded-lg border border-gray-200 bg-white text-center text-lg focus:outline-none focus:border-amber-400"
                    />
                    <input
                      type="text"
                      value={editingOverride.specialEvent}
                      onChange={(e) => setEditingOverride({ ...editingOverride, specialEvent: e.target.value })}
                      className="flex-1 px-2 py-1 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-amber-400"
                      placeholder="תיאור..."
                    />
                  </div>
                </div>
              )}

              {/* Existing overrides list */}
              {scheduleOverrides.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-gray-400" dir="rtl">דריסות קיימות:</p>
                  {scheduleOverrides.map((o) => (
                    <div key={o.date} className="flex items-center justify-between bg-white/80 px-3 py-2 rounded-xl" dir="rtl">
                      <span className="text-sm font-semibold text-gray-700">
                        {o.date} — {o.schedule.dropoff === 'אבא' ? '👨' : '👩'} מפזר
                        {o.schedule.afterSchool === 'tzaharon' ? ' | 🏠 צהרון' : ' | 🕐 איסוף'}
                        {o.schedule.tutoring ? ` | 📚 ${o.schedule.tutoring}` : ''}
                      </span>
                      <button
                        onClick={() => {
                          deleteScheduleOverride(o.date);
                          setScheduleOverrides(loadScheduleOverrides());
                        }}
                        className="w-7 h-7 rounded-full bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-200 transition-colors active:scale-95 text-xs"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lunchbox Management */}
        <SectionHeader id="lunchbox" title="🍱 ניהול קופסת אוכל" isOpen={openSections.has('lunchbox')} onToggle={toggleSection} />
        {openSections.has('lunchbox') && (
          <div className="mb-8">
            <LunchboxAdmin
              kids={kids}
              foodItems={foodCatalog}
              onUpdateFoodItems={onUpdateFoodCatalog}
            />
          </div>
        )}

        {/* Reset button */}
        <SectionHeader id="reset" title="🔄 איפוס משימות" isOpen={openSections.has('reset')} onToggle={toggleSection} />
        {openSections.has('reset') && (
          <div className="mb-6 p-4 bg-red-50 rounded-2xl border-2 border-red-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">איפוס כל המשימות ליום חדש</p>
              </div>
              <button
                onClick={onResetDone}
                className="px-5 py-2.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors active:scale-95 shadow-md"
              >
                🔄 איפוס
              </button>
            </div>
          </div>
        )}

        {/* Weekend mode toggle */}
        <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between" dir="rtl">
          <div>
            <span className="text-sm font-bold text-gray-700">🗓 מצב סוף שבוע</span>
            <div className="text-xs text-gray-400 mt-0.5">שינוי ידני של מצב יום/סופ״ש</div>
          </div>
          <button
            onClick={onToggleWeekend}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            {weekendOverride === null
              ? '🔄 מצב: אוטומטי'
              : weekendOverride
                ? '🌴 מצב: סוף שבוע'
                : '🏫 מצב: יום רגיל'}
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-blue-500 text-white font-bold rounded-2xl hover:bg-blue-600 transition-colors shadow-lg"
          >
            סגירה
          </button>
        </div>
      </div>
    </div>
  );
}
