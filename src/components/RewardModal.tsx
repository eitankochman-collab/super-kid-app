import type { Reward } from '../types';
import { useState, useEffect, useRef } from 'react';
import { REWARD_REDEEM_ANIMATION_MS } from '../constants';

interface RewardModalProps {
  reward: Reward;
  starBank: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function RewardModal({ reward, starBank, onConfirm, onCancel }: RewardModalProps) {
  const [isRedeeming, setIsRedeeming] = useState(false);
  const remainingStars = starBank - reward.starCost;
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled])'
        );
        const firstEl = focusableElements[0];
        const lastEl = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl?.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleConfirm = () => {
    setIsRedeeming(true);
    setTimeout(() => {
      onConfirm();
    }, REWARD_REDEEM_ANIMATION_MS);
  };

  return (
    <div
      className="modal-backdrop bg-black/70"
      role="dialog"
      aria-modal="true"
      aria-label={`Redeem ${reward.title}`}
    >
      <div ref={modalRef} className="modal-content bg-white rounded-2xl p-8 shadow-2xl">
        {isRedeeming ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-3xl font-bold text-green-600 mb-2">Awesome!</h2>
            <p className="text-xl text-gray-700">Reward redeemed!</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🎁</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Redeem Reward?
              </h2>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-300 mb-6">
              <h3 className="text-xl font-bold text-gray-800 text-center mb-4">
                {reward.title}
              </h3>
              <div className="flex justify-between items-center text-lg">
                <span className="text-gray-700">Cost:</span>
                <span className="font-bold text-purple-600">{reward.starCost} ⭐</span>
              </div>
              <div className="flex justify-between items-center text-lg mt-2">
                <span className="text-gray-700">You have:</span>
                <span className="font-bold text-yellow-600">{starBank} ⭐</span>
              </div>
              <div className="border-t-2 border-purple-200 mt-3 pt-3">
                <div className="flex justify-between items-center text-lg">
                  <span className="text-gray-700">After:</span>
                  <span className="font-bold text-green-600">{remainingStars} ⭐</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 px-6 py-4 bg-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-400 transition-colors active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all active:scale-95 shadow-lg"
              >
                Yes, Redeem! 🎉
              </button>
            </div>

            <p className="text-center text-sm text-gray-500 mt-4">
              Ask a parent to give you your reward!
            </p>
          </>
        )}
      </div>
    </div>
  );
}
