import type { AppState } from './types';
import { initialKids, defaultRewards } from './data';
import { DATE_KEY, YESTERDAY_KEY, DAILY_LOG_KEY } from './constants';

const STORAGE_KEY = 'super-kid-app-state';

export interface YesterdaySummary {
  kids: { hebrewName: string; avatar: string; done: number; total: number }[];
}

/** Get today's date as YYYY-MM-DD string */
export function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Get the last stored date */
export function getStoredDate(): string | null {
  return localStorage.getItem(DATE_KEY);
}

/** Save today's date */
export function saveDate(dateKey: string): void {
  localStorage.setItem(DATE_KEY, dateKey);
}

/** Save yesterday's summary for display on next open */
export function saveYesterdaySummary(summary: YesterdaySummary): void {
  localStorage.setItem(YESTERDAY_KEY, JSON.stringify(summary));
}

/** Load and clear yesterday's summary (one-time read) */
export function loadYesterdaySummary(): YesterdaySummary | null {
  try {
    const stored = localStorage.getItem(YESTERDAY_KEY);
    if (stored) {
      localStorage.removeItem(YESTERDAY_KEY);
      return JSON.parse(stored);
    }
  } catch { /* ignore */ }
  return null;
}

/** Check if a date string (YYYY-MM-DD) is exactly yesterday */
export function isYesterday(dateStr: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  return dateStr === yKey;
}

/** Check if today is a weekend day (Saturday=6 or Sunday=0) */
export function isWeekendDay(): boolean {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}

/** Migrate old state format (no afternoon, old task IDs, no reward tiers) to new format */
function migrateState(stored: Record<string, unknown>): AppState {
  const state = stored as unknown as AppState;

  // Check if rewards need tier migration
  const rewardsNeedMigration = state.rewards?.some(
    (r) => !('tier' in r)
  );
  if (rewardsNeedMigration) {
    state.rewards = defaultRewards;
  }

  // Check if migration is needed (missing fields or stale avatar)
  const needsMigration = state.kids?.some(
    (kid, index) => !('afternoon' in kid) || !('hebrewName' in kid) || !('streak' in kid) || kid.avatar !== initialKids[index]?.avatar
  );

  if (!needsMigration) {
    return state;
  }

  // Old task ID mapping: old e1→a1, e2→a2, e3→a3, e4→e1, e5→e5(stays)
  const taskIdMap: Record<string, string> = {
    'e1': 'a1',
    'e2': 'a2',
    'e3': 'a3',
    'e4': 'e1',
  };

  const migratedKids = state.kids.map((kid, index) => {
    const template = initialKids[index];
    if (!template) return kid;

    return {
      ...kid,
      hebrewName: template.hebrewName,
      avatar: template.avatar,
      color: template.color,
      accent: template.accent,
      morning: template.morning,
      afternoon: template.afternoon,
      evening: template.evening,
      // Remap old task IDs in status
      status: (kid.status || []).map((s) => ({
        ...s,
        taskId: taskIdMap[s.taskId] || s.taskId,
      })),
      starBank: kid.starBank || 0,
      streak: kid.streak || { current: 0, best: 0, lastCompletionDate: null },
    };
  });

  return {
    kids: migratedKids,
    rewards: defaultRewards,
    pinUnlockedUntil: state.pinUnlockedUntil ?? null,
  };
}

export function loadState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return migrateState(parsed);
    }
  } catch (error) {
    console.error('Failed to load state:', error);
  }

  return {
    kids: initialKids,
    rewards: defaultRewards,
    pinUnlockedUntil: null,
  };
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save state:', error);
  }
}

export function resetTaskStatus(state: AppState): AppState {
  return {
    ...state,
    kids: state.kids.map(kid => ({
      ...kid,
      status: kid.status.map(s => ({ ...s, done: false })),
    })),
  };
}

/** Daily completion record for weekly view */
export interface DailyRecord {
  date: string; // YYYY-MM-DD
  kidId: string;
  done: number;
  total: number;
}

/** Save a daily record (upserts for the given date+kid) */
export function saveDailyRecord(record: DailyRecord): void {
  try {
    const log = loadDailyLog();
    const idx = log.findIndex((r) => r.date === record.date && r.kidId === record.kidId);
    if (idx >= 0) {
      log[idx] = record;
    } else {
      log.push(record);
    }
    // Keep only last 30 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffKey = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, '0')}-${String(cutoff.getDate()).padStart(2, '0')}`;
    const trimmed = log.filter((r) => r.date >= cutoffKey);
    localStorage.setItem(DAILY_LOG_KEY, JSON.stringify(trimmed));
  } catch { /* ignore */ }
}

/** Load all daily records */
export function loadDailyLog(): DailyRecord[] {
  try {
    const stored = localStorage.getItem(DAILY_LOG_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return [];
}

/** Save today's completion snapshot for all kids */
export function saveTodaySnapshot(state: AppState): void {
  const today = getTodayKey();
  for (const kid of state.kids) {
    const allTaskIds = [...kid.morning, ...kid.afternoon, ...kid.evening].map((t) => t.id);
    const doneCount = kid.status.filter((s) => allTaskIds.includes(s.taskId) && s.done).length;
    saveDailyRecord({ date: today, kidId: kid.id, done: doneCount, total: allTaskIds.length });
  }
}
