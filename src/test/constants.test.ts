import { describe, it, expect } from 'vitest';
import {
  PIN_UNLOCK_DURATION_MS,
  CONFETTI_PARTICLE_COUNT,
  CONFETTI_AUTO_CLOSE_MS,
  PIN_ERROR_CLEAR_MS,
  PIN_LENGTH,
  CONFETTI_COLORS,
  CELEBRATION_NOTES,
  STORAGE_KEY,
  TABS,
} from '../constants';

describe('constants', () => {
  it('PIN_UNLOCK_DURATION_MS is 5 minutes', () => {
    expect(PIN_UNLOCK_DURATION_MS).toBe(300000);
  });

  it('CONFETTI_PARTICLE_COUNT is positive', () => {
    expect(CONFETTI_PARTICLE_COUNT).toBeGreaterThan(0);
  });

  it('CONFETTI_AUTO_CLOSE_MS is positive', () => {
    expect(CONFETTI_AUTO_CLOSE_MS).toBeGreaterThan(0);
  });

  it('PIN_ERROR_CLEAR_MS is positive', () => {
    expect(PIN_ERROR_CLEAR_MS).toBeGreaterThan(0);
  });

  it('PIN_LENGTH is 4', () => {
    expect(PIN_LENGTH).toBe(4);
  });

  it('CONFETTI_COLORS has at least 3 colors', () => {
    expect(CONFETTI_COLORS.length).toBeGreaterThanOrEqual(3);
  });

  it('CELEBRATION_NOTES has 3 notes', () => {
    expect(Object.keys(CELEBRATION_NOTES)).toHaveLength(3);
  });

  it('STORAGE_KEY is a non-empty string', () => {
    expect(STORAGE_KEY).toBeTruthy();
    expect(typeof STORAGE_KEY).toBe('string');
  });

  describe('TABS', () => {
    it('has 4 tabs', () => {
      expect(TABS).toHaveLength(4);
    });

    it('includes morning, afternoon, evening, and rewards', () => {
      const ids = TABS.map((t) => t.id);
      expect(ids).toContain('morning');
      expect(ids).toContain('afternoon');
      expect(ids).toContain('evening');
      expect(ids).toContain('rewards');
    });

    it('each tab has label, labelEn, and emoji', () => {
      TABS.forEach((tab) => {
        expect(tab.label).toBeTruthy();
        expect(tab.labelEn).toBeTruthy();
        expect(tab.emoji).toBeTruthy();
      });
    });
  });
});
