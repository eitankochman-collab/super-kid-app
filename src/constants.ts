/** Duration in ms that PIN remains unlocked after successful entry */
export const PIN_UNLOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes

/** Number of confetti particles in celebration overlay */
export const CONFETTI_PARTICLE_COUNT = 50;

/** Duration in ms before confetti overlay auto-closes */
export const CONFETTI_AUTO_CLOSE_MS = 3000;

/** Duration in ms before incorrect PIN clears */
export const PIN_ERROR_CLEAR_MS = 1000;

/** Delay in ms before PIN submission is validated */
export const PIN_SUBMIT_DELAY_MS = 100;

/** Duration in ms for reward redemption animation */
export const REWARD_REDEEM_ANIMATION_MS = 800;

/** Maximum PIN length */
export const PIN_LENGTH = 4;

/** Confetti color palette */
export const CONFETTI_COLORS = [
  '#ff6b6b',
  '#4ecdc4',
  '#45b7d1',
  '#f9ca24',
  '#6c5ce7',
  '#fd79a8',
] as const;

/** Celebration sound note frequencies (Hz) */
export const CELEBRATION_NOTES = {
  C5: 523.25,
  E5: 659.25,
  G5: 783.99,
} as const;

/** localStorage key for app state */
export const STORAGE_KEY = 'super-kid-app-state';

/** Tab configuration for routine/rewards navigation */
export type TabId = 'morning' | 'afternoon' | 'evening' | 'rewards';

export const TABS: { id: TabId; label: string; labelEn: string; emoji: string }[] = [
  { id: 'morning', label: 'בוקר', labelEn: 'Morning', emoji: '🌅' },
  { id: 'afternoon', label: 'אחרי ביה״ס', labelEn: 'After School', emoji: '🎒' },
  { id: 'evening', label: 'ערב', labelEn: 'Evening', emoji: '🌙' },
  { id: 'rewards', label: 'פרסים', labelEn: 'Rewards', emoji: '🎁' },
];
