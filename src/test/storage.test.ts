import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadState, saveState, resetTaskStatus } from '../storage';
import { initialKids, defaultRewards } from '../data';
import type { AppState } from '../types';
import { STORAGE_KEY } from '../constants';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('loadState', () => {
    it('returns default state when localStorage is empty', () => {
      const state = loadState();
      expect(state.kids).toEqual(initialKids);
      expect(state.rewards).toEqual(defaultRewards);
      expect(state.pinUnlockedUntil).toBeNull();
    });

    it('loads saved state from localStorage', () => {
      const savedState: AppState = {
        kids: [
          { ...initialKids[0], starBank: 10 },
          { ...initialKids[1], starBank: 5 },
        ],
        rewards: defaultRewards,
        pinUnlockedUntil: null,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));

      const state = loadState();
      expect(state.kids[0].starBank).toBe(10);
      expect(state.kids[1].starBank).toBe(5);
    });

    it('returns default state on corrupted JSON', () => {
      localStorage.setItem(STORAGE_KEY, '{broken json!!!}');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const state = loadState();
      expect(state.kids).toEqual(initialKids);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('migrates old state format (missing afternoon and hebrewName)', () => {
      const oldState = {
        kids: [
          {
            id: 'lior',
            name: 'Lior',
            age: 8,
            morning: [{ id: 'm1', hebrew: 'קמים', english: 'Wake up', emoji: '🌅' }],
            evening: [{ id: 'e1', hebrew: 'old', english: 'old', emoji: '🍱' }],
            status: [
              { taskId: 'e1', done: true, stars: 2 },
              { taskId: 'm1', done: false, stars: 0 },
            ],
            starBank: 15,
          },
          {
            id: 'roni',
            name: 'Roni',
            age: 6,
            morning: [],
            evening: [],
            status: [],
            starBank: 8,
          },
        ],
        rewards: [{ id: 'r1', title: 'Old reward', starCost: 5 }],
        pinUnlockedUntil: null,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(oldState));

      const state = loadState();

      // Should have new kid fields
      expect(state.kids[0].hebrewName).toBe('ליאור');
      expect(state.kids[0].avatar).toBe('/super-kid-app/lior-avatar.png');
      expect(state.kids[0].color).toBeTruthy();
      expect(state.kids[0].accent).toBeTruthy();

      // Should have afternoon tasks
      expect(state.kids[0].afternoon.length).toBeGreaterThan(0);

      // Should preserve starBank
      expect(state.kids[0].starBank).toBe(15);
      expect(state.kids[1].starBank).toBe(8);

      // Should remap old task IDs: e1 -> a1
      const remappedStatus = state.kids[0].status.find((s) => s.taskId === 'a1');
      expect(remappedStatus).toBeTruthy();
      expect(remappedStatus!.done).toBe(true);
      expect(remappedStatus!.stars).toBe(2);

      // Should have new rewards
      expect(state.rewards).toEqual(defaultRewards);
    });
  });

  describe('saveState', () => {
    it('serializes state to localStorage', () => {
      const state: AppState = {
        kids: initialKids,
        rewards: defaultRewards,
        pinUnlockedUntil: null,
      };

      saveState(state);

      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored!)).toEqual(state);
    });

    it('handles storage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceeded');
      });

      const state: AppState = {
        kids: initialKids,
        rewards: defaultRewards,
        pinUnlockedUntil: null,
      };

      // Should not throw
      saveState(state);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      setItemSpy.mockRestore();
    });
  });

  describe('resetTaskStatus', () => {
    it('resets all done flags to false', () => {
      const state: AppState = {
        kids: [
          {
            ...initialKids[0],
            status: [
              { taskId: 'm1', done: true, stars: 2 },
              { taskId: 'm2', done: true, stars: 1 },
              { taskId: 'a1', done: false, stars: 0 },
            ],
          },
        ],
        rewards: defaultRewards,
        pinUnlockedUntil: null,
      };

      const reset = resetTaskStatus(state);

      expect(reset.kids[0].status.every((s) => s.done === false)).toBe(true);
    });

    it('preserves star counts when resetting', () => {
      const state: AppState = {
        kids: [
          {
            ...initialKids[0],
            status: [
              { taskId: 'm1', done: true, stars: 3 },
              { taskId: 'm2', done: true, stars: 1 },
            ],
          },
        ],
        rewards: defaultRewards,
        pinUnlockedUntil: null,
      };

      const reset = resetTaskStatus(state);

      expect(reset.kids[0].status[0].stars).toBe(3);
      expect(reset.kids[0].status[1].stars).toBe(1);
    });

    it('does not mutate the original state', () => {
      const state: AppState = {
        kids: [
          {
            ...initialKids[0],
            status: [{ taskId: 'm1', done: true, stars: 1 }],
          },
        ],
        rewards: defaultRewards,
        pinUnlockedUntil: null,
      };

      resetTaskStatus(state);
      expect(state.kids[0].status[0].done).toBe(true);
    });
  });
});
