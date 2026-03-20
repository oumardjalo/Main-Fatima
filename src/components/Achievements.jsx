import { useState, useEffect, useMemo, useCallback } from 'react';
import { Trophy, Lock, X, Star, Flame, Apple, Dumbbell, Moon, Heart, BookOpen } from 'lucide-react';
import storage from '../utils/storage';

const MOOD_MAP = { great: 5, good: 4, okay: 3, low: 2, bad: 1 };

const ACHIEVEMENT_DEFS = [
  // Milestones
  { id: 'first-meal', name: 'First Bite', desc: 'Log your first meal', icon: Apple, color: '#0D9488', category: 'Milestone' },
  { id: 'first-activity', name: 'First Move', desc: 'Log your first activity', icon: Dumbbell, color: '#F97316', category: 'Milestone' },
  { id: 'first-sleep', name: 'Sleep Tracker', desc: 'Log your first sleep', icon: Moon, color: '#6366F1', category: 'Milestone' },
  { id: 'first-mood', name: 'Mood Checker', desc: 'Log your first mood', icon: Heart, color: '#8B5CF6', category: 'Milestone' },

  // Streaks
  { id: 'streak-3', name: '3 Day Streak', desc: 'Complete habits 3 days in a row', icon: Flame, color: '#F59E0B', category: 'Streak' },
  { id: 'streak-7', name: 'Week Warrior', desc: '7 day habit streak', icon: Flame, color: '#F97316', category: 'Streak' },
  { id: 'streak-14', name: 'Fortnight Force', desc: '14 day habit streak', icon: Flame, color: '#EF4444', category: 'Streak' },
  { id: 'streak-30', name: 'Monthly Master', desc: '30 day habit streak', icon: Flame, color: '#DC2626', category: 'Streak' },

  // Nutrition
  { id: 'cal-target-7', name: 'On Target', desc: '7 days within calorie target', icon: Apple, color: '#10B981', category: 'Nutrition' },
  { id: 'meals-30', name: 'Meal Logger', desc: 'Log meals for 30 days', icon: Apple, color: '#0D9488', category: 'Nutrition' },
  { id: 'meals-100', name: 'Century Chef', desc: 'Log 100 meals', icon: Star, color: '#F59E0B', category: 'Nutrition' },

  // Activity
  { id: 'activities-10', name: 'Getting Active', desc: 'Log 10 activities', icon: Dumbbell, color: '#F97316', category: 'Activity' },
  { id: 'activities-50', name: 'Fitness Fan', desc: 'Log 50 activities', icon: Dumbbell, color: '#EF4444', category: 'Activity' },
  { id: 'distance-100', name: 'Century Runner', desc: 'Cover 100 km total distance', icon: Trophy, color: '#8B5CF6', category: 'Activity' },
  { id: 'minutes-1000', name: '1000 Minutes', desc: 'Reach 1000 total active minutes', icon: Flame, color: '#F97316', category: 'Activity' },

  // Weight
  { id: 'first-lb', name: 'First Pound', desc: 'Lose your first pound', icon: Scale, color: '#10B981', category: 'Weight' },
  { id: 'lost-5', name: '5 Down', desc: 'Lose 5 lbs', icon: Scale, color: '#0D9488', category: 'Weight' },
  { id: 'lost-10', name: 'Double Digits', desc: 'Lose 10 lbs', icon: Scale, color: '#059669', category: 'Weight' },
  { id: 'goal-reached', name: 'Goal Reached!', desc: 'Reach your goal weight', icon: Trophy, color: '#F59E0B', category: 'Weight' },

  // Wellbeing
  { id: 'journal-7', name: 'Reflective', desc: '7 day journal streak', icon: BookOpen, color: '#8B5CF6', category: 'Wellbeing' },
  { id: 'gratitude-30', name: 'Grateful Heart', desc: 'Write 30 gratitude entries', icon: Heart, color: '#EC4899', category: 'Wellbeing' },
  { id: 'mood-50', name: 'Self Aware', desc: '50 mood check-ins', icon: Smile, color: '#8B5CF6', category: 'Wellbeing' },
];

// Use Smile as a placeholder since it's not imported but we can use Heart
function Smile(props) { return <Heart {...props} />; }
function Scale(props) { return <Star {...props} />; }

function checkAchievements(historicalData, profile) {
  const earned = {};
  if (!historicalData || historicalData.length === 0) return earned;

  const sorted = [...historicalData].sort((a, b) => (a?.date || '').localeCompare(b?.date || ''));

  let totalMeals = 0;
  let totalActivities = 0;
  let totalDistance = 0;
  let totalMinutes = 0;
  let totalGratitudes = 0;
  let totalMoodCheckins = 0;
  let daysWithMeals = 0;
  let daysWithinCalTarget = 0;
  let journalStreak = 0;
  let maxJournalStreak = 0;
  let habitStreak = 0;
  let maxHabitStreak = 0;
  let firstWeight = null;
  let latestWeight = null;

  sorted.forEach(d => {
    if (!d) return;

    // Meals
    const meals = d.meals || [];
    totalMeals += meals.length;
    if (meals.length > 0) daysWithMeals++;

    const cals = meals.reduce((s, m) => s + (m.calories || 0), 0);
    const target = profile?.dailyCalorieTarget || 1800;
    if (meals.length > 0 && cals <= target * 1.1 && cals >= target * 0.5) {
      daysWithinCalTarget++;
    }

    // Activities
    const acts = d.activities || [];
    totalActivities += acts.length;
    acts.forEach(a => {
      totalMinutes += a.duration || 0;
      if (a.distance) totalDistance += Number(a.distance);
    });

    // Mood
    if (d.mood?.value) totalMoodCheckins++;

    // Gratitudes
    if (d.mood?.gratitudes) {
      totalGratitudes += d.mood.gratitudes.filter(g => g && g.trim()).length;
    }

    // Journal streak
    if (d.mood?.journal && d.mood.journal.trim()) {
      journalStreak++;
      if (journalStreak > maxJournalStreak) maxJournalStreak = journalStreak;
    } else {
      journalStreak = 0;
    }

    // Habit streak
    if (d.habits) {
      const completed = d.habits.filter(h => h.completed).length;
      if (completed / d.habits.length >= 0.5) {
        habitStreak++;
        if (habitStreak > maxHabitStreak) maxHabitStreak = habitStreak;
      } else {
        habitStreak = 0;
      }
    }

    // Weight
    if (d.weight?.value) {
      if (!firstWeight) firstWeight = d.weight.value;
      latestWeight = d.weight.value;
    }
  });

  const now = new Date().toISOString();

  // Check each achievement
  if (totalMeals >= 1) earned['first-meal'] = now;
  if (totalActivities >= 1) earned['first-activity'] = now;
  if (sorted.some(d => d?.sleep?.duration > 0)) earned['first-sleep'] = now;
  if (totalMoodCheckins >= 1) earned['first-mood'] = now;

  if (maxHabitStreak >= 3) earned['streak-3'] = now;
  if (maxHabitStreak >= 7) earned['streak-7'] = now;
  if (maxHabitStreak >= 14) earned['streak-14'] = now;
  if (maxHabitStreak >= 30) earned['streak-30'] = now;

  if (daysWithinCalTarget >= 7) earned['cal-target-7'] = now;
  if (daysWithMeals >= 30) earned['meals-30'] = now;
  if (totalMeals >= 100) earned['meals-100'] = now;

  if (totalActivities >= 10) earned['activities-10'] = now;
  if (totalActivities >= 50) earned['activities-50'] = now;
  if (totalDistance >= 100) earned['distance-100'] = now;
  if (totalMinutes >= 1000) earned['minutes-1000'] = now;

  const weightLost = firstWeight && latestWeight ? firstWeight - latestWeight : 0;
  if (weightLost >= 1) earned['first-lb'] = now;
  if (weightLost >= 5) earned['lost-5'] = now;
  if (weightLost >= 10) earned['lost-10'] = now;
  if (profile?.goalWeight && latestWeight && latestWeight <= profile.goalWeight) earned['goal-reached'] = now;

  if (maxJournalStreak >= 7) earned['journal-7'] = now;
  if (totalGratitudes >= 30) earned['gratitude-30'] = now;
  if (totalMoodCheckins >= 50) earned['mood-50'] = now;

  return earned;
}

export function useAchievements(historicalData, profile) {
  const [savedAchievements, setSavedAchievements] = useState({});
  const [newBadge, setNewBadge] = useState(null);

  useEffect(() => {
    storage.get('achievements').then(a => setSavedAchievements(a || {}));
  }, []);

  const currentEarned = useMemo(() => checkAchievements(historicalData, profile), [historicalData, profile]);

  // Check for newly earned
  useEffect(() => {
    const newOnes = Object.keys(currentEarned).filter(id => !savedAchievements[id]);
    if (newOnes.length > 0) {
      const updated = { ...savedAchievements, ...currentEarned };
      setSavedAchievements(updated);
      storage.set('achievements', updated);
      // Show celebration for first new one
      const def = ACHIEVEMENT_DEFS.find(d => d.id === newOnes[0]);
      if (def) setNewBadge(def);
    }
  }, [currentEarned, savedAchievements]);

  const dismissBadge = useCallback(() => setNewBadge(null), []);

  return { achievements: savedAchievements, newBadge, dismissBadge, defs: ACHIEVEMENT_DEFS };
}

export function AchievementCelebration({ badge, onDismiss }) {
  if (!badge) return null;
  const Icon = badge.icon;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-xs w-full text-center relative overflow-hidden">
        {/* Confetti-like animation */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: ['#F97316', '#0D9488', '#8B5CF6', '#F59E0B', '#EC4899'][i % 5],
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `confetti-fall ${1 + Math.random() * 2}s ease-in-out ${Math.random() * 0.5}s infinite`,
                opacity: 0.7,
              }}
            />
          ))}
        </div>

        <style>{`
          @keyframes confetti-fall {
            0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(60px) rotate(360deg); opacity: 0; }
          }
        `}</style>

        <button onClick={onDismiss} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 z-10">
          <X size={20} />
        </button>

        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: badge.color + '20' }}>
          <Icon size={32} style={{ color: badge.color }} />
        </div>
        <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Achievement Unlocked!</p>
        <h3 className="text-xl font-bold text-gray-900 mb-1">{badge.name}</h3>
        <p className="text-sm text-gray-500">{badge.desc}</p>
        <p className="text-sm mt-3" style={{ color: badge.color }}>Fatima earned: {badge.name}!</p>

        <button
          onClick={onDismiss}
          className="mt-4 px-6 py-2 text-white rounded-xl text-sm font-medium"
          style={{ backgroundColor: badge.color }}
        >
          Awesome!
        </button>
      </div>
    </div>
  );
}

export function AchievementGallery({ achievements, onClose }) {
  const categories = useMemo(() => {
    const cats = {};
    ACHIEVEMENT_DEFS.forEach(def => {
      if (!cats[def.category]) cats[def.category] = [];
      cats[def.category].push({ ...def, earned: !!achievements[def.id] });
    });
    return cats;
  }, [achievements]);

  const totalEarned = Object.keys(achievements).length;

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="max-w-lg mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Achievements</h2>
            <p className="text-sm text-gray-500">{totalEarned} of {ACHIEVEMENT_DEFS.length} earned</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-6">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${(totalEarned / ACHIEVEMENT_DEFS.length) * 100}%`, backgroundColor: '#F59E0B' }}
          />
        </div>

        {Object.entries(categories).map(([cat, defs]) => (
          <div key={cat} className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">{cat}</h3>
            <div className="grid grid-cols-3 gap-3">
              {defs.map(def => {
                const Icon = def.icon;
                return (
                  <div
                    key={def.id}
                    className={`rounded-xl p-3 text-center ${def.earned ? 'bg-white shadow-sm' : 'bg-gray-50 opacity-50'}`}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1"
                      style={{ backgroundColor: def.earned ? def.color + '20' : '#F3F4F6' }}
                    >
                      {def.earned ? (
                        <Icon size={20} style={{ color: def.color }} />
                      ) : (
                        <Lock size={16} className="text-gray-400" />
                      )}
                    </div>
                    <p className="text-xs font-medium text-gray-700 mt-1">{def.name}</p>
                    <p className="text-[10px] text-gray-400">{def.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RecentBadges({ achievements }) {
  const recent = useMemo(() => {
    return ACHIEVEMENT_DEFS.filter(d => achievements[d.id]).slice(0, 4);
  }, [achievements]);

  if (recent.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Trophy size={16} style={{ color: '#F59E0B' }} /> Achievements
        </h3>
        <span className="text-xs text-gray-400">{Object.keys(achievements).length} earned</span>
      </div>
      <div className="flex gap-3">
        {recent.map(def => {
          const Icon = def.icon;
          return (
            <div key={def.id} className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: def.color + '20' }}>
                <Icon size={18} style={{ color: def.color }} />
              </div>
              <span className="text-[10px] text-gray-500 mt-1 text-center">{def.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
