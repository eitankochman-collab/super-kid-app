import { describe, it, expect } from 'vitest';
import { initialKids, defaultRewards, DEFAULT_PIN } from '../data';
import { PIN_LENGTH } from '../constants';

describe('data', () => {
  describe('initialKids', () => {
    it('contains exactly 2 kids', () => {
      expect(initialKids).toHaveLength(2);
    });

    it('has unique ids for each kid', () => {
      const ids = initialKids.map((k) => k.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('each kid starts with 0 stars and empty status', () => {
      initialKids.forEach((kid) => {
        expect(kid.starBank).toBe(0);
        expect(kid.status).toEqual([]);
      });
    });

    it('each kid has morning and evening tasks', () => {
      initialKids.forEach((kid) => {
        expect(kid.morning.length).toBeGreaterThan(0);
        expect(kid.evening.length).toBeGreaterThan(0);
      });
    });

    it('all tasks have unique ids within a kid', () => {
      initialKids.forEach((kid) => {
        const allTaskIds = [...kid.morning, ...kid.evening].map((t) => t.id);
        expect(new Set(allTaskIds).size).toBe(allTaskIds.length);
      });
    });

    it('all tasks have required fields', () => {
      initialKids.forEach((kid) => {
        [...kid.morning, ...kid.evening].forEach((task) => {
          expect(task.id).toBeTruthy();
          expect(task.hebrew).toBeTruthy();
          expect(task.english).toBeTruthy();
          expect(task.emoji).toBeTruthy();
        });
      });
    });
  });

  describe('defaultRewards', () => {
    it('contains at least one reward', () => {
      expect(defaultRewards.length).toBeGreaterThan(0);
    });

    it('all rewards have positive star costs', () => {
      defaultRewards.forEach((r) => {
        expect(r.starCost).toBeGreaterThan(0);
      });
    });

    it('all rewards have unique ids', () => {
      const ids = defaultRewards.map((r) => r.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('DEFAULT_PIN', () => {
    it('is a string of correct length', () => {
      expect(typeof DEFAULT_PIN).toBe('string');
      expect(DEFAULT_PIN).toHaveLength(PIN_LENGTH);
    });

    it('contains only digits', () => {
      expect(/^\d+$/.test(DEFAULT_PIN)).toBe(true);
    });
  });
});
