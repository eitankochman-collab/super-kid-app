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

/** localStorage key for the last-opened date (YYYY-MM-DD) */
export const DATE_KEY = 'super-kid-app-date';

/** localStorage key for yesterday's summary data */
export const YESTERDAY_KEY = 'super-kid-app-yesterday';

/** Morning task IDs to remove on weekends (school-specific) */
export const WEEKEND_EXCLUDED_MORNING = ['m5', 'm6', 'm7'];

/** Hebrew day names (Sunday=0 … Saturday=6) */
export const HEBREW_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'] as const;

/** Hebrew month names (0-indexed) */
export const HEBREW_MONTHS = [
  'בינואר', 'בפברואר', 'במרץ', 'באפריל', 'במאי', 'ביוני',
  'ביולי', 'באוגוסט', 'בספטמבר', 'באוקטובר', 'בנובמבר', 'בדצמבר',
] as const;

/** Duration in ms for yesterday summary display */
export const YESTERDAY_SUMMARY_MS = 3000;

/** Streak milestone definitions: days → { message, bonusStars } */
export const STREAK_MILESTONES: { days: number; message: string; bonus: number }[] = [
  { days: 3, message: '3 ימים ברצף! 🔥', bonus: 2 },
  { days: 5, message: '5 ימים ברצף! 🔥🔥', bonus: 3 },
  { days: 7, message: 'שבוע מושלם! 🏆', bonus: 5 },
  { days: 14, message: 'שבועיים ברצף! 🏅', bonus: 10 },
  { days: 21, message: '3 שבועות! 💎', bonus: 15 },
  { days: 30, message: 'חודש מושלם! 👑', bonus: 25 },
];

/** localStorage key for bonus star log */
export const BONUS_LOG_KEY = 'super-kid-app-bonus-log';

/** localStorage key for daily completion history */
export const DAILY_LOG_KEY = 'super-kid-app-daily-log';

/** localStorage key for weekly schedule */
export const SCHEDULE_KEY = 'super-kid-app-schedule';

/** localStorage key for schedule date overrides */
export const SCHEDULE_OVERRIDES_KEY = 'super-kid-app-schedule-overrides';

/** Preset pickup times for schedule editor */
export const PICKUP_TIME_PRESETS = ['13:00', '13:25', '14:00', '14:30', '15:00', '16:00'] as const;

/** localStorage key for lunchbox food catalog */
export const LUNCHBOX_CATALOG_KEY = 'super-kid-app-lunchbox-catalog';

/** localStorage key for lunchbox selections */
export const LUNCHBOX_SELECTIONS_KEY = 'super-kid-app-lunchbox-selections';

/** Maximum number of items in a lunchbox */
export const LUNCHBOX_MAX_SLOTS = 5;

/** Tab configuration for routine/rewards navigation */
export type TabId = 'morning' | 'afternoon' | 'evening' | 'lunchbox' | 'rewards';

export const TABS: { id: TabId; label: string; labelEn: string; emoji: string }[] = [
  { id: 'morning', label: 'בוקר', labelEn: 'Morning', emoji: '🌅' },
  { id: 'afternoon', label: 'אחרי ביה״ס', labelEn: 'After School', emoji: '🎒' },
  { id: 'evening', label: 'ערב', labelEn: 'Evening', emoji: '🌙' },
  { id: 'rewards', label: 'פרסים', labelEn: 'Rewards', emoji: '🎁' },
  { id: 'lunchbox', label: 'קופסה', labelEn: 'Lunchbox', emoji: '🍱' },
];
