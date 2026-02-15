import { useState } from 'react';
import type { KidData, FoodItem } from '../types';
import { getKidTomorrowSelection } from '../lunchboxStorage';

interface LunchboxAdminProps {
  kids: KidData[];
  foodItems: FoodItem[];
  onUpdateFoodItems: (items: FoodItem[]) => void;
}

export function LunchboxAdmin({ kids, foodItems, onUpdateFoodItems }: LunchboxAdminProps) {
  const [newEmoji, setNewEmoji] = useState('');
  const [newHebrew, setNewHebrew] = useState('');
  const [newEnglish, setNewEnglish] = useState('');

  const handleToggleAvailable = (foodId: string) => {
    onUpdateFoodItems(
      foodItems.map((f) =>
        f.id === foodId ? { ...f, available: !f.available } : f
      )
    );
  };

  const handleDeleteCustom = (foodId: string) => {
    onUpdateFoodItems(foodItems.filter((f) => f.id !== foodId));
  };

  const handleAddCustom = () => {
    if (!newEmoji.trim() || !newHebrew.trim() || !newEnglish.trim()) return;
    const id = `f_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    onUpdateFoodItems([
      ...foodItems,
      {
        id,
        hebrew: newHebrew.trim(),
        english: newEnglish.trim(),
        emoji: newEmoji.trim(),
        available: true,
        isCustom: true,
      },
    ]);
    setNewEmoji('');
    setNewHebrew('');
    setNewEnglish('');
  };

  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-gray-700 mb-4">🍱 קופסת אוכל</h3>

      {/* Food catalog */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl border-2 border-green-200 mb-4">
        <h4 className="text-base font-bold text-gray-700 mb-3" dir="rtl">מאכלים זמינים</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
          {foodItems.map((food) => (
            <div
              key={food.id}
              className={`flex items-center gap-2 p-2 rounded-xl border-2 transition-all ${
                food.available
                  ? 'bg-white border-green-300'
                  : 'bg-gray-100 border-gray-200 opacity-60'
              }`}
            >
              <button
                onClick={() => handleToggleAvailable(food.id)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all active:scale-90 ${
                  food.available
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 text-gray-500'
                }`}
              >
                {food.available ? '✓' : '✗'}
              </button>
              <span className="text-lg">{food.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-gray-800 truncate" dir="rtl">{food.hebrew}</div>
                <div className="text-[10px] text-gray-400 truncate">{food.english}</div>
              </div>
              {food.isCustom && (
                <button
                  onClick={() => handleDeleteCustom(food.id)}
                  className="w-7 h-7 rounded-full bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-200 transition-colors active:scale-90 text-xs"
                >
                  🗑️
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add custom item */}
        <div className="border-t border-green-200 pt-3">
          <h4 className="text-sm font-bold text-gray-600 mb-2" dir="rtl">➕ הוסף מאכל</h4>
          <div className="flex gap-2 items-end flex-wrap">
            <div>
              <label className="text-[10px] text-gray-400 block">Emoji</label>
              <input
                type="text"
                value={newEmoji}
                onChange={(e) => setNewEmoji(e.target.value)}
                placeholder="🥙"
                className="w-14 px-2 py-2 rounded-xl border-2 border-green-200 bg-white text-center text-xl focus:outline-none focus:border-green-400"
                maxLength={4}
              />
            </div>
            <div className="flex-1 min-w-[80px]">
              <label className="text-[10px] text-gray-400 block" dir="rtl">עברית</label>
              <input
                type="text"
                value={newHebrew}
                onChange={(e) => setNewHebrew(e.target.value)}
                placeholder="שניצל"
                dir="rtl"
                className="w-full px-3 py-2 rounded-xl border-2 border-green-200 bg-white text-sm font-medium focus:outline-none focus:border-green-400"
              />
            </div>
            <div className="flex-1 min-w-[80px]">
              <label className="text-[10px] text-gray-400 block">English</label>
              <input
                type="text"
                value={newEnglish}
                onChange={(e) => setNewEnglish(e.target.value)}
                placeholder="Schnitzel"
                className="w-full px-3 py-2 rounded-xl border-2 border-green-200 bg-white text-sm font-medium focus:outline-none focus:border-green-400"
              />
            </div>
            <button
              onClick={handleAddCustom}
              disabled={!newEmoji.trim() || !newHebrew.trim() || !newEnglish.trim()}
              className="px-4 py-2 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-colors active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              הוסף
            </button>
          </div>
        </div>
      </div>

      {/* Kids' choices */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-5 rounded-2xl border-2 border-orange-200">
        <h4 className="text-base font-bold text-gray-700 mb-3" dir="rtl">🧒 הבחירות של הילדים (מחר)</h4>
        <div className="space-y-3">
          {kids.map((kid) => {
            const selection = getKidTomorrowSelection(kid.id);
            return (
              <div key={kid.id} className="flex items-center gap-3 p-2 bg-white rounded-xl">
                <img src={kid.avatar} alt={kid.name} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                <div className="font-bold text-gray-800 text-sm" dir="rtl">{kid.hebrewName}</div>
                <div className="flex-1 flex gap-1 justify-end">
                  {selection && selection.items.length > 0 ? (
                    selection.items.map((itemId) => {
                      const food = foodItems.find((f) => f.id === itemId);
                      return food ? (
                        <span key={itemId} className="text-xl" title={food.hebrew}>{food.emoji}</span>
                      ) : null;
                    })
                  ) : (
                    <span className="text-sm text-gray-400" dir="rtl">עוד לא בחרו</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
