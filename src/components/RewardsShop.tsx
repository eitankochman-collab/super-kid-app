import type { Reward, RewardTier } from '../types';
import { useState } from 'react';
import { RewardModal } from './RewardModal';

interface RewardsShopProps {
  rewards: Reward[];
  starBank: number;
  onRedeemReward: (rewardId: string) => void;
  pinnedRewardId: string | null;
  onPinReward: (rewardId: string) => void;
}

const TIER_CONFIG: Record<RewardTier, { label: string; labelEn: string; emoji: string; bg: string; border: string; text: string }> = {
  quick: { label: 'פרסים מהירים', labelEn: 'Quick Rewards', emoji: '🟢', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  weekly: { label: 'פרסים שבועיים', labelEn: 'Weekly Rewards', emoji: '🟡', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  monthly: { label: 'פרסים חודשיים', labelEn: 'Monthly Rewards', emoji: '🔴', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' },
};

const TIER_EMOJI_BG: Record<RewardTier, string> = {
  quick: 'from-green-200 to-emerald-300',
  weekly: 'from-yellow-200 to-amber-300',
  monthly: 'from-rose-200 to-red-300',
};

const TIER_ORDER: RewardTier[] = ['quick', 'weekly', 'monthly'];

export function RewardsShop({ rewards, starBank, onRedeemReward, pinnedRewardId, onPinReward }: RewardsShopProps) {
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [shakingId, setShakingId] = useState<string | null>(null);

  const handleRewardClick = (reward: Reward) => {
    if (starBank >= reward.starCost) {
      setSelectedReward(reward);
    } else {
      setShakingId(reward.id);
      setTimeout(() => setShakingId(null), 500);
    }
  };

  const handleConfirmRedeem = () => {
    if (selectedReward) {
      onRedeemReward(selectedReward.id);
      setSelectedReward(null);
    }
  };

  // Group rewards by tier
  const groupedRewards = TIER_ORDER.map((tier) => ({
    tier,
    config: TIER_CONFIG[tier],
    rewards: rewards.filter((r) => r.tier === tier).sort((a, b) => a.starCost - b.starCost),
  })).filter((g) => g.rewards.length > 0);

  const hasGrouped = groupedRewards.length > 0;
  const ungroupedRewards = rewards.filter((r) => !r.tier);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">🏪 חנות פרסים</h3>
          <p className="text-xs text-gray-400">Reward Shop</p>
        </div>
        <div className="text-center">
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full font-bold text-sm">
            {starBank} ⭐ זמינים
          </span>
          <p className="text-[10px] text-gray-400 mt-0.5">{starBank} ⭐ Available</p>
        </div>
      </div>

      {/* Encouragement for low stars */}
      {rewards.length > 0 && (() => {
        const cheapestReward = [...rewards].sort((a, b) => a.starCost - b.starCost)[0];
        if (starBank >= cheapestReward.starCost) return null;
        return (
          <div className="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-2xl text-center">
            <p className="text-base font-extrabold text-amber-700" dir="rtl">
              💪 השלימו משימות כדי לצבור ⭐ — אתם בדרך לפרס!
            </p>
            <p className="text-xs font-semibold text-amber-400">
              Complete tasks to earn ⭐ — You're on your way!
            </p>
            <p className="text-sm font-bold text-amber-500 mt-1" dir="rtl">
              👇 הפרס הקרוב: {cheapestReward.emoji} {cheapestReward.hebrew} — {cheapestReward.starCost} ⭐
            </p>
            <p className="text-xs text-amber-400">
              Next reward: {cheapestReward.emoji} {cheapestReward.title} — {cheapestReward.starCost} ⭐
            </p>
          </div>
        );
      })()}

      {rewards.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-xl">🎁</p>
          <p className="mt-2 font-bold">אין פרסים עדיין!</p>
          <p className="text-xs text-gray-400">No rewards yet!</p>
        </div>
      ) : hasGrouped ? (
        <div className="space-y-5">
          {groupedRewards.map(({ tier, config, rewards: tierRewards }) => (
            <div key={tier}>
              {/* Tier header */}
              <div className={`${config.bg} ${config.border} border-2 rounded-xl px-3 py-2 mb-3`}>
                <div className="flex items-center gap-2" dir="rtl">
                  <span className="text-lg">{config.emoji}</span>
                  <span className={`font-bold ${config.text}`}>{config.label}</span>
                </div>
                <div className="text-[10px] text-gray-400 mr-8">{config.labelEn}</div>
              </div>

              {/* Reward cards */}
              <div className="grid grid-cols-3 gap-3">
                {tierRewards.map((reward) => {
                  const canAfford = starBank >= reward.starCost;
                  const progressPct = Math.min(100, Math.round((starBank / reward.starCost) * 100));
                  const starsNeeded = reward.starCost - starBank;
                  const isPinned = reward.id === pinnedRewardId;

                  return (
                    <div
                      key={reward.id}
                      onClick={() => handleRewardClick(reward)}
                      className={`p-4 rounded-2xl text-center transition-all relative ${
                        shakingId === reward.id ? 'animate-shake' : ''
                      } ${
                        isPinned
                          ? 'bg-yellow-50 border-3 border-yellow-400 shadow-lg ring-2 ring-yellow-200'
                          : canAfford
                            ? 'bg-white border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg cursor-pointer active:scale-95'
                            : 'bg-gray-50 border-2 border-gray-200 cursor-pointer'
                      }`}
                    >
                      {/* Pin button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); onPinReward(reward.id); }}
                        className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all active:scale-90 z-10 ${
                          isPinned
                            ? 'bg-yellow-400 text-white shadow-md'
                            : 'bg-gray-100 text-gray-400 hover:bg-yellow-100 hover:text-yellow-600'
                        }`}
                        title={isPinned ? 'הסר מטרה' : 'קבע כמטרה'}
                      >
                        📌
                      </button>

                      {/* Pinned label */}
                      {isPinned && (
                        <div className="mb-1">
                          <div className="text-xs font-bold text-yellow-600" dir="rtl">📌 המטרה שלי!</div>
                          <div className="text-[9px] text-yellow-500">My goal!</div>
                        </div>
                      )}

                      {/* Emoji circle — tier-colored background */}
                      <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br ${TIER_EMOJI_BG[tier]} flex items-center justify-center text-3xl shadow-sm`}>
                        {reward.emoji}
                      </div>

                      {/* Hebrew name */}
                      <h4 className="font-bold text-gray-800 text-sm mb-0.5" dir="rtl">
                        {reward.hebrew}
                      </h4>

                      {/* English name */}
                      <p className="text-xs text-gray-500 mb-2">{reward.title}</p>

                      {/* Cost */}
                      <div className="text-sm font-bold text-purple-600 mb-2">
                        {reward.starCost} ⭐
                      </div>

                      {/* Progress bar */}
                      {!canAfford && (
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                          <div
                            className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      )}

                      {/* Buy button */}
                      {canAfford ? (
                        <div className={`px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold ${isPinned ? 'btn-invite-pulse' : ''}`}>
                          <div className="text-xs">🎉 קנה פרס!</div>
                          <div className="text-[9px] opacity-80">Get reward!</div>
                        </div>
                      ) : (
                        <div className="px-3 py-1.5 bg-gray-200 rounded-xl">
                          <div className="text-xs font-semibold text-gray-500" dir="rtl">צריך עוד {starsNeeded} ⭐</div>
                          <div className="text-[9px] text-gray-400">Need {starsNeeded} more ⭐</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Fallback flat display for rewards without tiers */
        <div className="grid grid-cols-3 gap-3">
          {ungroupedRewards.map((reward) => {
            const canAfford = starBank >= reward.starCost;
            const starsNeeded = reward.starCost - starBank;

            return (
              <div
                key={reward.id}
                onClick={() => handleRewardClick(reward)}
                className={`p-4 rounded-2xl text-center transition-all ${
                  shakingId === reward.id ? 'animate-shake' : ''
                } ${
                  canAfford
                    ? 'bg-white border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg cursor-pointer active:scale-95'
                    : 'bg-gray-50 border-2 border-gray-200 cursor-pointer'
                }`}
              >
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-yellow-200 to-amber-300 flex items-center justify-center text-3xl shadow-sm">
                  {reward.emoji}
                </div>
                <h4 className="font-bold text-gray-800 text-sm mb-0.5" dir="rtl">{reward.hebrew}</h4>
                <p className="text-xs text-gray-500 mb-2">{reward.title}</p>
                <div className="text-sm font-bold text-purple-600 mb-2">{reward.starCost} ⭐</div>
                {canAfford ? (
                  <div className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold">
                    <div className="text-xs">🎉 קנה פרס!</div>
                    <div className="text-[9px] opacity-80">Get reward!</div>
                  </div>
                ) : (
                  <div className="px-3 py-1.5 bg-gray-200 rounded-xl">
                    <div className="text-xs font-semibold text-gray-500" dir="rtl">צריך עוד {starsNeeded} ⭐</div>
                    <div className="text-[9px] text-gray-400">Need {starsNeeded} more ⭐</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedReward && (
        <RewardModal
          reward={selectedReward}
          starBank={starBank}
          onConfirm={handleConfirmRedeem}
          onCancel={() => setSelectedReward(null)}
        />
      )}
    </>
  );
}
