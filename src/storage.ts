import type { AppState } from './types';
import { initialKids, defaultRewards } from './data';

const STORAGE_KEY = 'super-kid-app-state';

export function loadState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
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
