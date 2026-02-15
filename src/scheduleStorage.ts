import type { DaySchedule, WeeklySchedule, ScheduleOverride } from './types';
import { SCHEDULE_KEY, SCHEDULE_OVERRIDES_KEY } from './constants';

const OLD_PICKUP_KEY = 'super-kid-app-pickup';

function makeDefaultDay(afterSchool: 'tzaharon' | 'pickup', tutoring: string, pickupTimes: Record<string, string>): DaySchedule {
  return {
    dropoff: 'אמא',
    pickup: 'אמא',
    afterSchool,
    pickupTimes,
    tutoring,
    specialEvent: '',
    specialEventEmoji: '🎉',
  };
}

/** Hardcoded default weekly schedule */
export function getDefaultSchedule(): WeeklySchedule {
  const defaultPickupTimes = { roni: '13:25', lior: '14:30' };
  return {
    '0': makeDefaultDay('tzaharon', '', {}),            // Sun — weekend, won't display
    '1': makeDefaultDay('tzaharon', '', {}),             // Mon
    '2': makeDefaultDay('tzaharon', 'סיוון', {}),       // Tue — tutoring
    '3': makeDefaultDay('tzaharon', '', {}),             // Wed
    '4': makeDefaultDay('pickup', '', defaultPickupTimes), // Thu — pickup
    '5': makeDefaultDay('pickup', 'אנט', defaultPickupTimes), // Fri — pickup + tutoring
    '6': makeDefaultDay('tzaharon', '', {}),             // Sat — weekend, won't display
  };
}

/** Migrate old pickup key data into new schedule format */
function migrateOldPickup(schedule: WeeklySchedule): WeeklySchedule {
  try {
    const stored = localStorage.getItem(OLD_PICKUP_KEY);
    if (!stored) return schedule;
    const old: Record<string, string> = JSON.parse(stored);
    const migrated = { ...schedule };
    for (const [dayKey, person] of Object.entries(old)) {
      if (migrated[dayKey]) {
        migrated[dayKey] = { ...migrated[dayKey], pickup: person as 'אבא' | 'אמא' };
      }
    }
    localStorage.removeItem(OLD_PICKUP_KEY);
    return migrated;
  } catch { return schedule; }
}

/** Load schedule from localStorage, with migration from old PICKUP_KEY */
export function loadSchedule(): WeeklySchedule {
  try {
    const stored = localStorage.getItem(SCHEDULE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as WeeklySchedule;
      // Ensure all days exist (forward-compat)
      const defaults = getDefaultSchedule();
      for (const key of Object.keys(defaults)) {
        if (!parsed[key]) parsed[key] = defaults[key];
      }
      return parsed;
    }
  } catch { /* ignore */ }
  // No schedule stored — create defaults and try migration
  const defaults = getDefaultSchedule();
  const migrated = migrateOldPickup(defaults);
  saveSchedule(migrated);
  return migrated;
}

/** Save schedule to localStorage */
export function saveSchedule(schedule: WeeklySchedule): void {
  try {
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedule));
  } catch { /* ignore */ }
}

/** Load schedule overrides from localStorage */
export function loadScheduleOverrides(): ScheduleOverride[] {
  try {
    const stored = localStorage.getItem(SCHEDULE_OVERRIDES_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return [];
}

/** Save a schedule override (upsert by date), prune entries older than 7 days */
export function saveScheduleOverride(override: ScheduleOverride): void {
  try {
    const all = loadScheduleOverrides();
    const idx = all.findIndex((o) => o.date === override.date);
    if (idx >= 0) {
      all[idx] = override;
    } else {
      all.push(override);
    }
    // Prune entries older than 7 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const cutoffKey = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, '0')}-${String(cutoff.getDate()).padStart(2, '0')}`;
    const trimmed = all.filter((o) => o.date >= cutoffKey);
    localStorage.setItem(SCHEDULE_OVERRIDES_KEY, JSON.stringify(trimmed));
  } catch { /* ignore */ }
}

/** Delete a schedule override by date */
export function deleteScheduleOverride(date: string): void {
  try {
    const all = loadScheduleOverrides().filter((o) => o.date !== date);
    localStorage.setItem(SCHEDULE_OVERRIDES_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}

/** Get today's date as YYYY-MM-DD */
function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Get today's schedule. Returns null on weekends. Checks overrides first, then weekly template. */
export function getTodaySchedule(isWeekend: boolean): DaySchedule | null {
  if (isWeekend) return null;

  // Check overrides first
  const todayKey = getTodayKey();
  const overrides = loadScheduleOverrides();
  const override = overrides.find((o) => o.date === todayKey);
  if (override) return override.schedule;

  // Fall back to weekly template
  const dayOfWeek = new Date().getDay();
  return getScheduleForDay(dayOfWeek);
}

/** Get schedule for a specific day of week (0=Sun..6=Sat). Returns null for Sat/Sun. */
export function getScheduleForDay(dayOfWeek: number): DaySchedule | null {
  if (dayOfWeek === 0 || dayOfWeek === 6) return null;
  const schedule = loadSchedule();
  return schedule[String(dayOfWeek)] || null;
}
