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

const TIER_CONFIG: Record<RewardTier, { label: string; emoji: string; bg: string; border: string; text: string }> = {
  quick: { label: 'פרסים מהירים', emoji: '🟢', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  weekly: { label: 'פרסים שבועיים', emoji: '🟡', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  monthly: { label: 'פרסים חודשיים', emoji: '🔴', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' },
};

const TIER_ORDER: RewardTier[] = ['quick', 'weekly', 'monthly'];

export function RewardsShop({ rewards, starBank, onRedeemReward, pinnedRewardId, onPinReward }: RewardsShopProps) {
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  const handleRewardClick = (reward: Reward) => {
    if (starBank >= reward.starCost) {
      setSelectedReward(reward);
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

  // If no rewards have tiers (shouldn't happen after migration), show flat
  const hasGrouped = groupedRewards.length > 0;
  const ungroupedRewards = rewards.filter((r) => !r.tier);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">🏪 חנות פרסים</h3>
        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full font-bold text-sm">
          {starBank} ⭐ זמינים
        </span>
      </div>

      {/* Encouragement for low stars */}
      {rewards.length > 0 && (() => {
        const cheapestReward = [...rewards].sort((a, b) => a.starCost - b.starCost)[0];
        if (starBank >= cheapestReward.starCost) return null;
        return (
          <div className="mb-4 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-2xl text-center" dir="rtl">
            <p className="text-sm font-bold text-amber-700">
              💪 השלימו את שגרת הבוקר כדי לצבור ⭐ — אתם בדרך לפרס הראשון!
            </p>
            <p className="text-xs text-amber-500 mt-1">
              👇 הפרס הקרוב: {cheapestReward.emoji} {cheapestReward.hebrew} — {cheapestReward.starCost} ⭐
            </p>
          </div>
        );
      })()}

      {rewards.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-xl">🎁</p>
          <p className="mt-2">!אין פרסים עדיין</p>
        </div>
      ) : hasGrouped ? (
        <div className="space-y-5">
          {groupedRewards.map(({ tier, config, rewards: tierRewards }) => (
            <div key={tier}>
              {/* Tier header */}
              <div className={`${config.bg} ${config.border} border-2 rounded-xl px-3 py-2 mb-3 flex items-center gap-2`} dir="rtl">
                <span className="text-lg">{config.emoji}</span>
                <span className={`font-bold ${config.text}`}>{config.label}</span>
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
                        isPinned
                          ? 'bg-yellow-50 border-3 border-yellow-400 shadow-lg ring-2 ring-yellow-200'
                          : canAfford
                            ? 'bg-white border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg cursor-pointer active:scale-95'
                            : 'bg-gray-50 border-2 border-gray-200 cursor-not-allowed'
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
                        <div className="text-xs font-bold text-yellow-600 mb-1" dir="rtl">
                          📌 !המטרה שלי
                        </div>
                      )}

                      {/* Emoji circle */}
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-yellow-200 to-amber-300 flex items-center justify-center text-3xl shadow-sm">
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
                        <div className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-xs font-bold btn-invite-pulse">
                          🎉 !קנה פרס
                        </div>
                      ) : (
                        <div className="px-3 py-1.5 bg-gray-200 text-gray-500 rounded-xl text-xs font-semibold" dir="rtl">
                          צריך עוד {starsNeeded} ⭐
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
                  canAfford
                    ? 'bg-white border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg cursor-pointer active:scale-95'
                    : 'bg-gray-50 border-2 border-gray-200 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-yellow-200 to-amber-300 flex items-center justify-center text-3xl shadow-sm">
                  {reward.emoji}
                </div>
                <h4 className="font-bold text-gray-800 text-sm mb-0.5" dir="rtl">{reward.hebrew}</h4>
                <p className="text-xs text-gray-500 mb-2">{reward.title}</p>
                <div className="text-sm font-bold text-purple-600 mb-2">{reward.starCost} ⭐</div>
                {canAfford ? (
                  <div className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-xs font-bold">
                    🎉 !קנה פרס
                  </div>
                ) : (
                  <div className="px-3 py-1.5 bg-gray-200 text-gray-500 rounded-xl text-xs font-semibold" dir="rtl">
                    צריך עוד {starsNeeded} ⭐
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
