import type { KidData, Reward } from '../types';

interface AdminPanelProps {
  kids: KidData[];
  rewards: Reward[];
  onRedeemReward: (kidId: string, rewardId: string) => void;
  onClose: () => void;
  isUnlocked: boolean;
  onRequestPin: (action: () => void) => void;
  onResetDone: () => void;
}

export function AdminPanel({
  kids,
  rewards,
  onRedeemReward,
  onClose,
  isUnlocked,
  onRequestPin,
  onResetDone,
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
      <div className="bg-white rounded-3xl p-8 max-w-4xl w-full shadow-2xl my-8">
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
          <h3 className="text-xl font-bold text-gray-700 mb-4">⭐ בנק כוכבים</h3>
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
                  <div className="text-3xl font-bold text-yellow-600">{kid.starBank} ⭐</div>
                </div>
              </div>
            ))}
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
