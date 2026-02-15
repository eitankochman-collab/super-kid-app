import { useState, useEffect } from 'react';
import type { KidData, Reward } from '../types';
import { BONUS_LOG_KEY } from '../constants';

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
}: AdminPanelProps) {
  const [bonusKidId, setBonusKidId] = useState(kids[0]?.id || '');
  const [bonusText, setBonusText] = useState('');
  const [bonusLog, setBonusLog] = useState<BonusEntry[]>(loadBonusLog);
  const [showFloat, setShowFloat] = useState(false);

  const today = getTodayKey();
  const bonusKid = kids.find((k) => k.id === bonusKidId);
  const alreadyGotBonus = bonusLog.some((e) => e.date === today && e.kidId === bonusKidId);
  const recentBonuses = getRecentBonuses(bonusLog);

  // Keep the pronoun matching: for girls use feminine Hebrew
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

  return (
    <div className="fixed inset-0 bg-black/70 flex items-start justify-center z-40 p-4 pt-16 overflow-y-auto">
      <div className="bg-white rounded-3xl p-8 max-w-4xl w-full shadow-2xl mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">👨‍👩‍👧‍👦 ניהול הורים</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        {/* Star Banks */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-700 mb-4">⭐ ניהול כוכבים</h3>
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
              </div>
            ))}
          </div>
        </div>

        {/* Behavior Bonus */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-700 mb-4">כוכב בונוס ⭐</h3>
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-5 rounded-2xl border-2 border-amber-200">
            {/* Kid selector */}
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

            {/* Input + button */}
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

            {/* Recent bonuses */}
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

        {/* Rewards */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-700 mb-4">🎁 פרסים</h3>
          <div className="space-y-3">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-2xl border-2 border-purple-200"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{reward.emoji}</span>
                    <div>
                      <h4 className="text-lg font-bold text-gray-800" dir="rtl">{reward.hebrew}</h4>
                      <p className="text-sm text-gray-500">{reward.title}</p>
                    </div>
                    <span className="text-purple-600 font-semibold text-sm">
                      {reward.starCost} ⭐
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {kids.map((kid) => {
                      const canAfford = kid.starBank >= reward.starCost;
                      return (
                        <button
                          key={kid.id}
                          onClick={() => handleRedeem(kid.id, reward.id)}
                          disabled={!canAfford}
                          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all active:scale-95 ${
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
            ))}
          </div>
        </div>

        {/* Reset button */}
        <div className="mb-6 p-4 bg-red-50 rounded-2xl border-2 border-red-200">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold text-gray-800">🔄 איפוס משימות</h4>
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

        {/* Debug: Weekend mode toggle */}
        <div className="mb-6 p-3 bg-gray-50 rounded-2xl border border-dashed border-gray-300 flex items-center justify-between">
          <span className="text-xs text-gray-400">🛠 Debug</span>
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
