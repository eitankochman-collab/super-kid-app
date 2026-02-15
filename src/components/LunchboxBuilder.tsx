import { useState, useEffect } from 'react';
import type { FoodItem } from '../types';
import { getTomorrowKey, saveLunchboxSelection, getKidTomorrowSelection } from '../lunchboxStorage';

interface LunchboxBuilderProps {
  kidId: string;
  kidHebrewName: string;
  kidColor: string;
  foodItems: FoodItem[];
}

/* ── Per-kid bento box theme & layout ────────────────────────── */

interface CompartmentDef {
  gridColumn: string;
  gridRow: string;
  isLarge: boolean;
}

interface BentoTheme {
  maxSlots: number;
  heart: string;
  boxGradient: string;
  trimColor: string;
  shadowColor: string;
  compartmentBg: string;
  compartmentFilledBg: string;
  dashColor: string;
  gridColumns: string;
  gridRows: string;
  gridHeight: string;
  compartments: CompartmentDef[];
}

const THEMES: Record<string, BentoTheme> = {
  /* Lior — blue/navy Jelife-style: 1 large left + 3 small right */
  lior: {
    maxSlots: 4,
    heart: '💙',
    boxGradient: 'linear-gradient(145deg, #2563eb, #1e40af)',
    trimColor: '#1e3a8a',
    shadowColor: 'rgba(30, 64, 175, 0.45)',
    compartmentBg: 'rgba(191, 219, 254, 0.12)',
    compartmentFilledBg: 'rgba(219, 234, 254, 0.22)',
    dashColor: 'rgba(191, 219, 254, 0.35)',
    gridColumns: '3fr 2fr',
    gridRows: '1fr 1fr 1fr',
    gridHeight: '240px',
    compartments: [
      { gridColumn: '1 / 2', gridRow: '1 / 4', isLarge: true },
      { gridColumn: '2 / 3', gridRow: '1 / 2', isLarge: false },
      { gridColumn: '2 / 3', gridRow: '2 / 3', isLarge: false },
      { gridColumn: '2 / 3', gridRow: '3 / 4', isLarge: false },
    ],
  },

  /* Roni — pink/magenta Bentgo-style with turquoise trim: 2 top + 3 bottom */
  roni: {
    maxSlots: 5,
    heart: '💜',
    boxGradient: 'linear-gradient(145deg, #d946ef, #a21caf)',
    trimColor: '#14b8a6',
    shadowColor: 'rgba(162, 28, 175, 0.45)',
    compartmentBg: 'rgba(252, 231, 243, 0.12)',
    compartmentFilledBg: 'rgba(252, 231, 243, 0.22)',
    dashColor: 'rgba(249, 168, 212, 0.35)',
    gridColumns: 'repeat(6, 1fr)',
    gridRows: '1fr 1fr',
    gridHeight: '200px',
    compartments: [
      { gridColumn: '1 / 5', gridRow: '1 / 2', isLarge: true },
      { gridColumn: '5 / 7', gridRow: '1 / 2', isLarge: false },
      { gridColumn: '1 / 3', gridRow: '2 / 3', isLarge: false },
      { gridColumn: '3 / 5', gridRow: '2 / 3', isLarge: false },
      { gridColumn: '5 / 7', gridRow: '2 / 3', isLarge: false },
    ],
  },
};

const FALLBACK_THEME = THEMES.roni;

/* ── Component ───────────────────────────────────────────────── */

export function LunchboxBuilder({ kidId, kidHebrewName, kidColor, foodItems }: LunchboxBuilderProps) {
  const theme = THEMES[kidId] || FALLBACK_THEME;
  const maxSlots = theme.maxSlots;

  const [selectedItems, setSelectedItems] = useState<string[]>(() => {
    const existing = getKidTomorrowSelection(kidId);
    return existing ? existing.items.slice(0, maxSlots) : [];
  });
  const [isSaved, setIsSaved] = useState(() => getKidTomorrowSelection(kidId) !== null);
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);

  // Track unsaved changes
  useEffect(() => {
    const existing = getKidTomorrowSelection(kidId);
    if (!existing) { setIsSaved(false); return; }
    const saved = existing.items;
    if (saved.length !== selectedItems.length || !saved.every((id, i) => id === selectedItems[i])) {
      setIsSaved(false);
    }
  }, [selectedItems, kidId]);

  const getFoodById = (id: string) => foodItems.find((f) => f.id === id);

  const handleAddItem = (foodId: string) => {
    if (selectedItems.length >= maxSlots || selectedItems.includes(foodId)) return;
    setSelectedItems((prev) => [...prev, foodId]);
  };

  const handleRemoveFromSlot = (slotIndex: number) => {
    if (removingIndex !== null) return;
    setRemovingIndex(slotIndex);
    setTimeout(() => {
      setSelectedItems((prev) => {
        const next = [...prev];
        next.splice(slotIndex, 1);
        return next;
      });
      setRemovingIndex(null);
    }, 250);
  };

  const handleRemoveByFoodId = (foodId: string) => {
    const idx = selectedItems.indexOf(foodId);
    if (idx >= 0) handleRemoveFromSlot(idx);
  };

  const handleSave = () => {
    if (selectedItems.length === 0) return;
    saveLunchboxSelection({ kidId, date: getTomorrowKey(), items: selectedItems, savedAt: Date.now() });
    setIsSaved(true);
  };

  return (
    <div className="p-2" dir="rtl">
      {/* Header */}
      <h2 className="text-xl font-bold text-gray-800 text-center mb-4">
        הקופסה של {kidHebrewName} {theme.heart}
      </h2>

      {/* ── Bento Box ── */}
      <div
        className="mx-auto mb-5 relative overflow-hidden"
        style={{
          maxWidth: '360px',
          background: theme.boxGradient,
          borderRadius: '20px',
          border: `4px solid ${theme.trimColor}`,
          padding: '6px',
          boxShadow: `0 10px 30px ${theme.shadowColor}, 0 2px 6px rgba(0,0,0,0.15)`,
        }}
      >
        {/* 3D top-edge shine */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '16px',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 35%)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Latch detail */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '40px',
            height: '6px',
            background: theme.trimColor,
            borderRadius: '0 0 6px 6px',
            zIndex: 2,
          }}
        />

        {/* Compartment grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: theme.gridColumns,
            gridTemplateRows: theme.gridRows,
            gap: '5px',
            height: theme.gridHeight,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {theme.compartments.map((comp, i) => {
            const foodId = selectedItems[i];
            const food = foodId ? getFoodById(foodId) : null;
            const isRemoving = removingIndex === i;
            const emojiSize = comp.isLarge ? 'text-5xl' : 'text-3xl';
            const labelSize = comp.isLarge ? 'text-sm' : 'text-[10px]';

            return (
              <button
                key={i}
                onClick={() => food && !isRemoving ? handleRemoveFromSlot(i) : undefined}
                disabled={!food || isRemoving}
                style={{
                  gridColumn: comp.gridColumn,
                  gridRow: comp.gridRow,
                  borderRadius: '12px',
                  background: food ? theme.compartmentFilledBg : theme.compartmentBg,
                  border: food ? '2px solid rgba(255,255,255,0.1)' : `2px dashed ${theme.dashColor}`,
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.1)',
                  cursor: food ? 'pointer' : 'default',
                  transition: 'background 0.2s, border 0.2s',
                }}
                className="flex flex-col items-center justify-center overflow-hidden"
              >
                {food ? (
                  <div
                    key={`${i}-${foodId}`}
                    className={`flex flex-col items-center justify-center ${isRemoving ? 'slot-bounce-out' : 'slot-pop-in'}`}
                  >
                    <span className={emojiSize}>{food.emoji}</span>
                    <span className={`${labelSize} font-bold text-white/90 mt-0.5 leading-tight`}>{food.hebrew}</span>
                  </div>
                ) : (
                  <span className="text-2xl opacity-20">🍽️</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Food grid ── */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {foodItems.map((food) => {
          const isSelected = selectedItems.includes(food.id);
          const isFull = selectedItems.length >= maxSlots;
          return (
            <button
              key={food.id}
              onClick={() => isSelected ? handleRemoveByFoodId(food.id) : handleAddItem(food.id)}
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
              {isSelected && <span className="text-xs font-bold text-green-600">✓</span>}
            </button>
          );
        })}
      </div>

      {/* ── Save button ── */}
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
