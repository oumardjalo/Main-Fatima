import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Flame, ChevronRight, BookOpen, Trophy, BarChart3 } from 'lucide-react';
import CompletionRings from './CompletionRings';
import { WeightChart } from './Charts';
import { InsightCards } from './Correlations';
import { RecentBadges } from './Achievements';
import MicroLesson from './MicroLesson';
import { getGreeting, formatDisplayDate, getTodayKey, formatNumber } from '../utils/helpers';
import { DAILY_QUOTES } from '../data/lessons';

export default function Dashboard({ data, profile, onUpdateField, onNavigate, historicalData, insights, achievements, onOpenAchievements, onOpenWeeklyReport }) {
  const today = getTodayKey();
  const greeting = getGreeting();
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const dailyQuote = DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];

  const percentages = useMemo(() => {
    if (!data) return { nutrition: 0, activity: 0, wellbeing: 0, sleep: 0, habits: 0 };
    const target = profile?.dailyCalorieTarget || 1800;
    const totalCal = (data.meals || []).reduce((s, m) => s + (m.calories || 0), 0);

    return {
      nutrition: data.meals?.length > 0 ? Math.min((totalCal / target) * 100, 100) : 0,
      activity: data.activities?.length > 0 ? 100 : 0,
      wellbeing: data.mood?.value ? 100 : 0,
      sleep: data.sleep?.duration > 0 ? 100 : 0,
      habits: data.habits?.length > 0
        ? (data.habits.filter(h => h.completed).length / data.habits.length) * 100
        : 0,
    };
  }, [data, profile]);

  const totalCalories = (data?.meals || []).reduce((s, m) => s + (m.calories || 0), 0);
  const caloriesRemaining = (profile?.dailyCalorieTarget || 1800) - totalCalories;
  const activeMinutes = (data?.activities || []).reduce((s, a) => s + (a.duration || 0), 0);

  // Calculate streak
  const streak = useMemo(() => {
    let count = 0;
    for (let i = 0; i < historicalData.length; i++) {
      const d = historicalData[historicalData.length - 1 - i];
      if (d && d.habits) {
        const completed = d.habits.filter(h => h.completed).length;
        if (completed / d.habits.length >= 0.5) count++;
        else break;
      } else break;
    }
    return count;
  }, [historicalData]);

  // Weight trend
  const weightTrend = useMemo(() => {
    const recent = historicalData.filter(d => d?.weight?.value).slice(-2);
    if (recent.length < 2) return null;
    const diff = recent[1].weight.value - recent[0].weight.value;
    return diff;
  }, [historicalData]);

  const toggleHabit = (idx) => {
    const newHabits = [...(data?.habits || [])];
    newHabits[idx] = { ...newHabits[idx], completed: !newHabits[idx].completed };
    onUpdateField('habits', newHabits);
  };

  if (!data) return <div className="p-4 text-center text-gray-400">Loading...</div>;

  return (
    <div className="space-y-4">
      {/* Greeting */}
      <div className="text-center pt-2">
        <h1 className="text-xl font-bold text-gray-900">{greeting}, {profile?.name || 'Fatima'}!</h1>
        <p className="text-sm text-gray-500">{formatDisplayDate(today)}</p>
        <p className="text-sm mt-1 italic" style={{ color: '#0D9488' }}>"{dailyQuote}"</p>
      </div>

      {/* Completion Rings */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <CompletionRings percentages={percentages} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl shadow-sm p-3 text-center">
          <p className="text-xs text-gray-500">Weight</p>
          <p className="text-lg font-bold text-gray-900">
            {data.weight?.value ? `${data.weight.value}` : '—'}
          </p>
          {weightTrend !== null && (
            <div className="flex items-center justify-center gap-1 text-xs">
              {weightTrend <= 0 ? (
                <TrendingDown size={12} className="text-green-500" />
              ) : (
                <TrendingUp size={12} className="text-orange-500" />
              )}
              <span className={weightTrend <= 0 ? 'text-green-500' : 'text-orange-500'}>
                {Math.abs(weightTrend).toFixed(1)} lbs
              </span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-3 text-center">
          <p className="text-xs text-gray-500">Calories Left</p>
          <p className={`text-lg font-bold ${caloriesRemaining > 200 ? 'text-green-600' : caloriesRemaining > 0 ? 'text-orange-500' : 'text-red-500'}`}>
            {formatNumber(Math.max(0, caloriesRemaining))}
          </p>
          <p className="text-xs text-gray-400">of {formatNumber(profile?.dailyCalorieTarget || 1800)}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-3 text-center">
          <p className="text-xs text-gray-500">Active Min</p>
          <p className="text-lg font-bold text-gray-900">{activeMinutes}</p>
          <p className="text-xs text-gray-400">{(data.activities || []).length} sessions</p>
        </div>
      </div>

      {/* Daily Micro-Lesson */}
      <MicroLesson />

      {/* Insights */}
      <InsightCards insights={insights || []} />

      {/* Achievements */}
      {achievements && Object.keys(achievements).length > 0 && (
        <button onClick={onOpenAchievements} className="w-full text-left">
          <RecentBadges achievements={achievements} />
        </button>
      )}

      {/* Weight Chart */}
      <WeightChart historicalData={historicalData} profile={profile} days={30} />

      {/* Weekly Report Button */}
      <button
        onClick={onOpenWeeklyReport}
        className="w-full bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
            <BarChart3 size={20} style={{ color: '#F59E0B' }} />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900">Weekly Report</p>
            <p className="text-xs text-gray-500">View your 7-day summary</p>
          </div>
        </div>
        <ChevronRight size={18} className="text-gray-400" />
      </button>

      {/* Habit Checklist */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Daily Habits</h3>
          {streak > 0 && (
            <span className="flex items-center gap-1 text-sm font-medium" style={{ color: '#F97316' }}>
              <Flame size={16} /> {streak} day streak!
            </span>
          )}
        </div>
        <div className="space-y-2">
          {(data.habits || []).map((habit, idx) => (
            <button
              key={habit.id}
              onClick={() => toggleHabit(idx)}
              className="w-full flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-gray-50"
            >
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  habit.completed ? 'border-transparent' : 'border-gray-300'
                }`}
                style={habit.completed ? { backgroundColor: '#0D9488' } : {}}
              >
                {habit.completed && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span className={`text-sm ${habit.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                {habit.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Pillar Snapshot Cards */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 px-1">Today's Snapshot</h3>

        <button onClick={() => onNavigate('nutrition')} className="w-full bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#CCFBF1' }}>
              <span style={{ color: '#0D9488' }}>🍎</span>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Nutrition</p>
              <p className="text-xs text-gray-500">{formatNumber(totalCalories)} / {formatNumber(profile?.dailyCalorieTarget || 1800)} kcal</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </button>

        <button onClick={() => onNavigate('activity')} className="w-full bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FFEDD5' }}>
              <span style={{ color: '#F97316' }}>💪</span>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Activity</p>
              <p className="text-xs text-gray-500">{activeMinutes} min · {(data.activities || []).length} sessions</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </button>

        <button onClick={() => onNavigate('wellbeing')} className="w-full bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#EDE9FE' }}>
              <span style={{ color: '#8B5CF6' }}>💜</span>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Wellbeing</p>
              <p className="text-xs text-gray-500">
                {data.mood?.value ? `Mood: ${data.mood.value}` : 'No check-in yet'} · Stress: {data.mood?.stressLevel || '—'}/10
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </button>

        <button onClick={() => onNavigate('sleep')} className="w-full bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#E0E7FF' }}>
              <span style={{ color: '#6366F1' }}>🌙</span>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Sleep</p>
              <p className="text-xs text-gray-500">
                {data.sleep?.duration > 0
                  ? `${Math.floor(data.sleep.duration)}h ${Math.round((data.sleep.duration % 1) * 60)}m · ${'★'.repeat(data.sleep.quality)}${'☆'.repeat(5 - data.sleep.quality)}`
                  : 'No sleep logged'}
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </button>
      </div>
    </div>
  );
}
