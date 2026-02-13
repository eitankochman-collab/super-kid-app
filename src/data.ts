import type { Task, KidData, Reward } from './types';

const morningTasks: Task[] = [
  { id: 'm1', hebrew: 'קמים מהמיטה', english: 'Wake up', emoji: '🌅' },
  { id: 'm2', hebrew: 'שירותים', english: 'Bathroom', emoji: '🚽' },
  { id: 'm3', hebrew: 'מתלבשים', english: 'Get dressed', emoji: '👕' },
  { id: 'm4', hebrew: 'ארוחת בוקר', english: 'Breakfast', emoji: '🥣' },
  { id: 'm5', hebrew: 'נעליים וגרביים', english: 'Shoes & socks', emoji: '👟' },
  { id: 'm6', hebrew: 'בקבוק מים בתיק', english: 'Water bottle in bag', emoji: '🎒' },
  { id: 'm7', hebrew: 'יוצאים ברוגע', english: 'Leave calmly', emoji: '😌' },
];

const eveningTasks: Task[] = [
  { id: 'e1', hebrew: 'קופסת אוכל לכיור', english: 'Lunchbox to sink', emoji: '🍱' },
  { id: 'e2', hebrew: 'נעליים לארון', english: 'Shoes to closet', emoji: '👞' },
  { id: 'e3', hebrew: 'שיעורי בית בעברית', english: 'Hebrew homework', emoji: '📚' },
  { id: 'e4', hebrew: 'מסדרים את חדר המשחקים', english: 'Tidy playroom', emoji: '🧹' },
];

const roniEveningTasks: Task[] = [
  ...eveningTasks,
  { id: 'e5', hebrew: 'ישנים במיטה שלי', english: 'Sleep in own bed', emoji: '🛏️' },
];

export const defaultRewards: Reward[] = [
  { id: 'r1', title: 'Movie night', starCost: 10 },
  { id: 'r2', title: 'Extra screen time', starCost: 5 },
  { id: 'r3', title: 'Special outing', starCost: 15 },
];

export const initialKids: KidData[] = [
  {
    id: 'lior',
    name: 'Lior',
    age: 8,
    morning: morningTasks,
    evening: eveningTasks,
    status: [],
    starBank: 0,
  },
  {
    id: 'roni',
    name: 'Roni',
    age: 6,
    morning: morningTasks,
    evening: roniEveningTasks,
    status: [],
    starBank: 0,
  },
];

export const DEFAULT_PIN = '1234';
