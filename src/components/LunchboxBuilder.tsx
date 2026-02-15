import { useState, useEffect } from 'react';
import type { FoodItem } from '../types';
import { LUNCHBOX_MAX_SLOTS } from '../constants';
import { getTomorrowKey, saveLunchboxSelection, getKidTomorrowSelection } from '../lunchboxStorage';

interface LunchboxBuilderProps {
  kidId: string;
  kidHebrewName: string;
  kidColor: string;
  foodItems: FoodItem[];
}

export function LunchboxBuilder({ kidId, kidHebrewName, kidColor, foodItems }: LunchboxBuilderProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>(() => {
    const existing = getKidTomorrowSelection(kidId);
    return existing ? existing.items : [];
  });
  const [isSaved, setIsSaved] = useState(() => {
    return getKidTomorrowSelection(kidId) !== null;
  });

  // Reset saved indicator when items change
  useEffect(() => {
    const existing = getKidTomorrowSelection(kidId);
    if (!existing) {
      setIsSaved(false);
      return;
    }
    // If selection differs from what's saved, mark as unsaved
    const saved = existing.items;
    if (saved.length !== selectedItems.length || !saved.every((id, i) => id === selectedItems[i])) {
      setIsSaved(false);
    }
  }, [selectedItems, kidId]);

  const handleAddItem = (foodId: string) => {
    if (selectedItems.length >= LUNCHBOX_MAX_SLOTS) return;
    if (selectedItems.includes(foodId)) return;
    setSelectedItems((prev) => [...prev, foodId]);
  };

  const handleRemoveItem = (foodId: string) => {
    setSelectedItems((prev) => prev.filter((id) => id !== foodId));
  };

  const handleSave = () => {
    if (selectedItems.length === 0) return;
    saveLunchboxSelection({
      kidId,
      date: getTomorrowKey(),
      items: selectedItems,
      savedAt: Date.now(),
    });
    setIsSaved(true);
  };

  const getFoodById = (id: string) => foodItems.find((f) => f.id === id);

  return (
    <div className="p-2" dir="rtl">
      {/* Header */}
      <h2 className="text-xl font-bold text-gray-800 text-center mb-4">
        🍱 הקופסה של {kidHebrewName}
      </h2>

      {/* Lunchbox slots */}
      <div className="flex gap-2 justify-center mb-6">
        {Array.from({ length: LUNCHBOX_MAX_SLOTS }).map((_, i) => {
          const foodId = selectedItems[i];
          const food = foodId ? getFoodById(foodId) : null;
          return (
            <button
              key={i}
              onClick={() => food && handleRemoveItem(foodId!)}
              disabled={!food}
              className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all ${
                food
                  ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300 shadow-md slot-pop cursor-pointer hover:scale-105 active:scale-95'
                  : 'border-2 border-dashed border-gray-300 bg-gray-50'
              }`}
            >
              {food ? (
                <>
                  <span className="text-2xl">{food.emoji}</span>
                  <span className="text-[8px] font-bold text-gray-600 leading-tight truncate max-w-[56px]">{food.hebrew}</span>
                </>
              ) : (
                <span className="text-xl opacity-30">🍱</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Food grid */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {foodItems.map((food) => {
          const isSelected = selectedItems.includes(food.id);
          const isFull = selectedItems.length >= LUNCHBOX_MAX_SLOTS;
          return (
            <button
              key={food.id}
              onClick={() => isSelected ? handleRemoveItem(food.id) : handleAddItem(food.id)}
              disabled={!isSelected && isFull}
              className={`p-3 rounded-2xl border-2 transition-all active:scale-95 flex flex-col items-center gap-1 ${
                isSelected
                  ? 'bg-green-100 border-green-400 shadow-md'
                  : isFull
                    ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                    : 'bg-white border-gray-200 hover:border-gray-400 hover:shadow-md'
              }`}
            >
              <span className="text-3xl">{food.emoji}</span>
              <span className="text-sm font-bold text-gray-800">{food.hebrew}</span>
              <span className="text-[10px] text-gray-400">{food.english}</span>
              {isSelected && (
                <span className="text-xs font-bold text-green-600">✓</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={selectedItems.length === 0 || isSaved}
        className={`w-full py-4 rounded-2xl font-bold text-lg transition-all active:scale-[0.98] shadow-lg ${
          isSaved
            ? 'bg-green-500 text-white'
            : selectedItems.length === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
              : `bg-gradient-to-r ${kidColor} text-white hover:shadow-xl`
        }`}
      >
        {isSaved ? '!נשמר ✅' : '!הקופסה מוכנה ✅'}
      </button>
    </div>
  );
}
