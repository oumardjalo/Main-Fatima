export function getTodayKey() {
  return formatDateKey(new Date());
}

export function getYesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDateKey(d);
}

export function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDisplayDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

export function getDateRange(days) {
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(formatDateKey(d));
  }
  return dates;
}

export function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      key: formatDateKey(d),
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      isToday: i === 0,
    });
  }
  return days;
}

export function calcSleepDuration(bedtime, wakeTime) {
  if (!bedtime || !wakeTime) return 0;
  const [bH, bM] = bedtime.split(':').map(Number);
  const [wH, wM] = wakeTime.split(':').map(Number);
  let bedMin = bH * 60 + bM;
  let wakeMin = wH * 60 + wM;
  if (wakeMin <= bedMin) wakeMin += 24 * 60;
  return (wakeMin - bedMin) / 60;
}

export function formatDuration(hours) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}

export function formatNumber(n) {
  if (n == null) return '0';
  return Number(n).toLocaleString('en-US');
}

export const DEFAULT_HABITS = [
  { id: 'water', name: 'Drink 8 glasses of water', icon: 'droplets' },
  { id: 'exercise', name: '30 min exercise', icon: 'dumbbell' },
  { id: 'meals', name: 'Log all meals', icon: 'apple' },
  { id: 'meditate', name: 'Meditate 5 min', icon: 'heart' },
  { id: 'screens', name: 'No screens before bed', icon: 'moon' },
  { id: 'steps', name: '10k steps', icon: 'trending-up' },
];

export function createEmptyDailyBundle(dateStr, habitDefs) {
  return {
    date: dateStr,
    weight: { value: null, notes: '' },
    meals: [],
    water: { glasses: 0, goal: 8 },
    sleep: { bedtime: '', wakeTime: '', duration: 0, quality: 0, notes: '', checklist: [] },
    mood: { value: '', stressLevel: 5, journal: '', gratitudes: ['', '', ''] },
    activities: [],
    habits: (habitDefs || DEFAULT_HABITS).map(h => ({ id: h.id, name: h.name, completed: false })),
  };
}

export const CALORIE_RATES = { Light: 4, Moderate: 7, Hard: 10 };

export const ACTIVITY_TYPES = [
  { id: 'pilates', name: 'Pilates', icon: 'Sparkles' },
  { id: 'run', name: 'Run', icon: 'Zap' },
  { id: 'walk', name: 'Walk', icon: 'Footprints' },
  { id: 'yoga', name: 'Yoga', icon: 'Flower2' },
  { id: 'swim', name: 'Swim', icon: 'Waves' },
  { id: 'cycle', name: 'Cycle', icon: 'Bike' },
  { id: 'strength', name: 'Strength', icon: 'Dumbbell' },
  { id: 'hiit', name: 'HIIT', icon: 'Flame' },
  { id: 'stretch', name: 'Stretch', icon: 'StretchHorizontal' },
  { id: 'custom', name: 'Custom', icon: 'Plus' },
];

export const MOTIVATIONAL_MESSAGES = [
  "Every healthy choice counts!",
  "You're building something amazing.",
  "Progress, not perfection.",
  "Small steps lead to big changes.",
  "You've got this, Fatima!",
  "Today is a fresh start.",
  "Be kind to yourself today.",
  "Consistency is your superpower.",
  "Your future self will thank you.",
  "One day at a time.",
  "Believe in your journey.",
  "You're stronger than you think.",
];
