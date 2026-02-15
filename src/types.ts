export type RoutineType = 'morning' | 'afternoon' | 'evening';

export interface Task {
  id: string;
  hebrew: string;
  english: string;
  emoji: string;
}

export interface TaskStatus {
  taskId: string;
  done: boolean;
  stars: number;
}

export interface StreakData {
  current: number;
  best: number;
  lastCompletionDate: string | null; // YYYY-MM-DD
}

export interface KidData {
  id: string;
  name: string;
  hebrewName: string;
  avatar: string;
  color: string;
  accent: string;
  age: number;
  morning: Task[];
  afternoon: Task[];
  evening: Task[];
  status: TaskStatus[];
  starBank: number;
  streak: StreakData;
  pinnedRewardId?: string | null;
}

export type RewardTier = 'quick' | 'weekly' | 'monthly';

export interface Reward {
  id: string;
  title: string;
  hebrew: string;
  emoji: string;
  starCost: number;
  tier: RewardTier;
}

export interface FoodItem {
  id: string;
  hebrew: string;
  english: string;
  emoji: string;
  available: boolean;
  isCustom: boolean;
}

export interface LunchboxSelection {
  kidId: string;
  date: string;       // YYYY-MM-DD (tomorrow)
  items: string[];     // FoodItem IDs (max 5)
  savedAt: number;     // Date.now()
}

export interface AppState {
  kids: KidData[];
  rewards: Reward[];
  pinUnlockedUntil: number | null;
}

export type ParentRole = 'אבא' | 'אמא';
export type AfterSchoolMode = 'tzaharon' | 'pickup';

export interface DaySchedule {
  dropoff: ParentRole;
  pickup: ParentRole;
  afterSchool: AfterSchoolMode;
  pickupTimes: Record<string, string>; // kid id → time (e.g. { lior: '14:30', roni: '13:25' })
  tutoring: string;                     // tutor name or ''
  specialEvent: string;                 // event text or ''
  specialEventEmoji: string;            // default '🎉'
}

export type WeeklySchedule = Record<string, DaySchedule>; // keys '0'..'6'

export interface ScheduleOverride {
  date: string;           // YYYY-MM-DD
  schedule: DaySchedule;
}
