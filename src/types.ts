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
}

export interface Reward {
  id: string;
  title: string;
  hebrew: string;
  emoji: string;
  starCost: number;
}

export interface AppState {
  kids: KidData[];
  rewards: Reward[];
  pinUnlockedUntil: number | null;
}
