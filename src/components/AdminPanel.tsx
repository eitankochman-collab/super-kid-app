import type { KidData, Reward } from '../types';

interface AdminPanelProps {
  kids: KidData[];
  rewards: Reward[];
  onRedeemReward: (kidId: string, rewardId: string) => void;
  onClose: () => void;
  isUnlocked: boolean;
  onRequestPin: (action: () => void) => void;
}

export function AdminPanel({
  kids,
  rewards,
  onRedeemReward,
  onClose,
  isUnlocked,
  onRequestPin,
}: AdminPanelProps) {
  const handleRedeem = (kidId: string, rewardId: string) => {
    const action = () => onRedeemReward(kidId, rewardId);

    if (isUnlocked) {
      action();
    } else {
      onRequestPin(action);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-40 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-8 max-w-4xl w-full shadow-2xl my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Parent Admin</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Star Banks */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-700 mb-4">⭐ Star Banks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kids.map((kid) => (
              <div
                key={kid.id}
                className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border-2 border-yellow-200"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-800">{kid.name}</h4>
                    <p className="text-gray-600">{kid.age} years old</p>
                  </div>
                  <div className="text-4xl font-bold text-yellow-600">{kid.starBank} ⭐</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rewards */}
        <div>
          <h3 className="text-xl font-bold text-gray-700 mb-4">🎁 Rewards</h3>
          <div className="space-y-4">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xl font-bold text-gray-800">{reward.title}</h4>
                    <p className="text-purple-600 font-semibold">
                      Cost: {reward.starCost} ⭐
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {kids.map((kid) => {
                      const canAfford = kid.starBank >= reward.starCost;
                      return (
                        <button
                          key={kid.id}
                          onClick={() => handleRedeem(kid.id, reward.id)}
                          disabled={!canAfford}
                          className={`px-6 py-3 rounded-lg font-bold transition-all active:scale-95 ${
                            canAfford
                              ? 'bg-green-500 text-white hover:bg-green-600 shadow-md'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                          title={`Redeem for ${kid.name}`}
                        >
                          {kid.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="px-8 py-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-lg"
          >
            Close Admin
          </button>
        </div>
      </div>
    </div>
  );
}
