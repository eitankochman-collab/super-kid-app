import type { AppState } from './types';
import { initialKids, defaultRewards } from './data';

const STORAGE_KEY = 'super-kid-app-state';

/** Migrate old state format (no afternoon, old task IDs) to new format */
function migrateState(stored: Record<string, unknown>): AppState {
  const state = stored as unknown as AppState;

  // Check if migration is needed
  const needsMigration = state.kids?.some(
    (kid) => !('afternoon' in kid) || !('hebrewName' in kid)
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
