import type { Task, KidData, Reward } from './types';

const morningTasks: Task[] = [
  { id: 'm1', hebrew: 'קמים מהמיטה', english: 'Wake up', emoji: '🌅' },
  { id: 'm2', hebrew: 'שירותים', english: 'Bathroom', emoji: '🚽' },
  { id: 'm3', hebrew: 'מתלבשים', english: 'Get dressed', emoji: '👕' },
  { id: 'm4', hebrew: 'ארוחת בוקר', english: 'Breakfast', emoji: '🥣' },
  { id: 'm5', hebrew: 'נעליים וגרביים', english: 'Shoes & socks', emoji: '👟' },
  { id: 'm6', hebrew: 'בקבוק מים בתיק', english: 'Water bottle in bag', emoji: '🧴' },
  { id: 'm7', hebrew: 'יוצאים ברוגע', english: 'Leave calmly', emoji: '😌' },
];

const afternoonTasks: Task[] = [
  { id: 'a1', hebrew: 'קופסת אוכל לכיור', english: 'Lunchbox to sink', emoji: '🍱' },
  { id: 'a2', hebrew: 'נעליים לארון', english: 'Shoes to closet', emoji: '👞' },
  { id: 'a3', hebrew: 'שיעורי בית בעברית', english: 'Hebrew homework', emoji: '📚' },
];

const eveningTasks: Task[] = [
  { id: 'e1', hebrew: 'מסדרים את חדר המשחקים', english: 'Tidy playroom', emoji: '🧹' },
  { id: 'e2', hebrew: 'מתקלחים', english: 'Shower', emoji: '🚿' },
  { id: 'e3', hebrew: 'מצחצחים שיניים', english: 'Brush teeth', emoji: '🪥' },
  { id: 'e4', hebrew: 'סיפור לפני השינה', english: 'Bedtime story', emoji: '📖' },
];

const roniEveningTasks: Task[] = [
  ...eveningTasks,
  { id: 'e5', hebrew: 'ישנים במיטה שלי', english: 'Sleep in own bed', emoji: '🛏️' },
];

export const defaultRewards: Reward[] = [
  { id: 'r1', title: 'Movie night', hebrew: 'סרט ערב', emoji: '🎬', starCost: 10 },
  { id: 'r2', title: 'Extra screen time', hebrew: 'זמן מסך נוסף', emoji: '📱', starCost: 5 },
  { id: 'r3', title: 'Special outing', hebrew: 'טיול מיוחד', emoji: '🎡', starCost: 15 },
  { id: 'r4', title: 'New toy', hebrew: 'צעצוע חדש', emoji: '🧸', starCost: 20 },
  { id: 'r5', title: 'Ice cream', hebrew: 'גלידה', emoji: '🍦', starCost: 8 },
  { id: 'r6', title: 'Friend sleepover', hebrew: 'לינה עם חבר', emoji: '🏠', starCost: 25 },
];

export const initialKids: KidData[] = [
  {
    id: 'lior',
    name: 'Lior',
    hebrewName: 'ליאור',
    avatar: '/super-kid-app/lior-avatar.png',
    color: 'from-amber-400 to-orange-500',
    accent: '#f59e0b',
    age: 8,
    morning: morningTasks,
    afternoon: afternoonTasks,
    evening: eveningTasks,
    status: [],
    starBank: 0,
  },
  {
    id: 'roni',
    name: 'Roni',
    hebrewName: 'רוני',
    avatar: '/super-kid-app/roni-avatar.png',
    color: 'from-sky-400 to-blue-500',
    accent: '#0ea5e9',
    age: 6,
    morning: morningTasks,
    afternoon: afternoonTasks,
    evening: roniEveningTasks,
    status: [],
    starBank: 0,
  },
];

export const DEFAULT_PIN = '1234';
