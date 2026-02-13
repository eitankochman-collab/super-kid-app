export type RoutineType = 'morning' | 'evening';

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
  age: number;
  morning: Task[];
  evening: Task[];
  status: TaskStatus[];
  starBank: number;
}

export interface Reward {
  id: string;
  title: string;
  starCost: number;
}

export interface AppState {
  kids: KidData[];
  rewards: Reward[];
  pinUnlockedUntil: number | null;
}
