import type { FoodItem, LunchboxSelection } from './types';
import { LUNCHBOX_CATALOG_KEY, LUNCHBOX_SELECTIONS_KEY } from './constants';
import { defaultFoodItems } from './data';

/** Get tomorrow's date as YYYY-MM-DD string */
export function getTomorrowKey(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Load food catalog from localStorage, falling back to defaults */
export function loadFoodCatalog(): FoodItem[] {
  try {
    const stored = localStorage.getItem(LUNCHBOX_CATALOG_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return defaultFoodItems;
}

/** Save food catalog to localStorage */
export function saveFoodCatalog(items: FoodItem[]): void {
  try {
    localStorage.setItem(LUNCHBOX_CATALOG_KEY, JSON.stringify(items));
  } catch { /* ignore */ }
}

/** Load all lunchbox selections from localStorage */
export function loadLunchboxSelections(): LunchboxSelection[] {
  try {
    const stored = localStorage.getItem(LUNCHBOX_SELECTIONS_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return [];
}

/** Save a lunchbox selection (upserts by kid+date), pruning entries older than 7 days */
export function saveLunchboxSelection(selection: LunchboxSelection): void {
  try {
    const all = loadLunchboxSelections();
    const idx = all.findIndex((s) => s.kidId === selection.kidId && s.date === selection.date);
    if (idx >= 0) {
      all[idx] = selection;
    } else {
      all.push(selection);
    }
    // Prune entries older than 7 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const cutoffKey = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, '0')}-${String(cutoff.getDate()).padStart(2, '0')}`;
    const trimmed = all.filter((s) => s.date >= cutoffKey);
    localStorage.setItem(LUNCHBOX_SELECTIONS_KEY, JSON.stringify(trimmed));
  } catch { /* ignore */ }
}

/** Get a kid's lunchbox selection for tomorrow */
export function getKidTomorrowSelection(kidId: string): LunchboxSelection | null {
  const all = loadLunchboxSelections();
  const tomorrow = getTomorrowKey();
  return all.find((s) => s.kidId === kidId && s.date === tomorrow) || null;
}
