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
      <div className="space-y-4">
        {rewards.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-xl">🎁</p>
            <p className="mt-2">No rewards available yet!</p>
            <p className="text-sm mt-1">Ask a parent to add some rewards</p>
          </div>
        ) : (
          rewards.map((reward) => {
            const canAfford = starBank >= reward.starCost;
            const starsNeeded = reward.starCost - starBank;

            return (
              <div
                key={reward.id}
                onClick={() => handleRewardClick(reward)}
                className={`p-6 rounded-xl border-3 transition-all ${
                  canAfford
                    ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300 hover:border-purple-500 hover:shadow-lg cursor-pointer active:scale-98'
                    : 'bg-gray-100 border-gray-300 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      🎁 {reward.title}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-purple-600">
                        {reward.starCost} ⭐
                      </span>
                      {!canAfford && (
                        <span className="text-sm text-red-500 font-semibold">
                          Need {starsNeeded} more ⭐
                        </span>
                      )}
                    </div>
                  </div>
                  {canAfford && (
                    <div className="text-4xl animate-bounce">✨</div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {rewards.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <p className="text-center text-sm text-gray-700">
              💡 <strong>Tip:</strong> Complete tasks to earn more stars!
            </p>
          </div>
        )}
      </div>

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
