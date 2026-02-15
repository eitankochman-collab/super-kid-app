import type { Reward } from '../types';
import { useState } from 'react';
import { RewardModal } from './RewardModal';

interface RewardsShopProps {
  rewards: Reward[];
  starBank: number;
  onRedeemReward: (rewardId: string) => void;
}

export function RewardsShop({ rewards, starBank, onRedeemReward }: RewardsShopProps) {
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

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">🏪 חנות פרסים</h3>
        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full font-bold text-sm">
          {starBank} ⭐ זמינים
        </span>
      </div>

      {rewards.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-xl">🎁</p>
          <p className="mt-2">!אין פרסים עדיין</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {rewards.map((reward) => {
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

                {/* Buy button */}
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
