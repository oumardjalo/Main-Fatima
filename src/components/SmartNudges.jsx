import { useState, useMemo } from 'react';
import { X, Info } from 'lucide-react';

export default function SmartNudges({ tab, data, profile, historicalData, yesterdayData }) {
  const [dismissed, setDismissed] = useState({});

  const nudges = useMemo(() => {
    if (!data) return [];
    const results = [];
    const hour = new Date().getHours();
    const meals = data.meals || [];
    const activities = data.activities || [];
    const water = data.water || { glasses: 0 };
    const mood = data.mood || {};
    const target = profile?.dailyCalorieTarget || 1800;

    // Calculate today's totals
    const totalCal = meals.reduce((s, m) => s + (m.calories || 0), 0);
    const greenCount = meals.filter(m => m.color === 'green').length;
    const totalMinutes = activities.reduce((s, a) => s + (a.duration || 0), 0);

    // Activity streak
    let streak = 0;
    if (historicalData) {
      for (let i = historicalData.length - 1; i >= 0; i--) {
        if (historicalData[i]?.activities?.length > 0) streak++;
        else break;
      }
    }

    // Yesterday's intensity
    const yesterdayIntense = yesterdayData?.activities?.some(a => a.intensity === 'Hard');

    // Avg sleep for the week
    const sleepDays = (historicalData || []).filter(d => d?.sleep?.duration > 0).slice(-7);
    const avgSleep = sleepDays.length > 0 ? sleepDays.reduce((s, d) => s + d.sleep.duration, 0) / sleepDays.length : 0;

    // Completion percentage
    const completionParts = [
      meals.length > 0 ? 1 : 0,
      activities.length > 0 ? 1 : 0,
      mood.value ? 1 : 0,
      data.sleep?.duration > 0 ? 1 : 0,
      (data.habits || []).filter(h => h.completed).length / Math.max((data.habits || []).length, 1),
    ];
    const completionPct = Math.round((completionParts.reduce((a, b) => a + b, 0) / 5) * 100);

    if (tab === 'nutrition') {
      if (meals.length === 0 && hour >= 12) {
        results.push({ id: 'no-meals', text: "You haven't logged any meals yet today. Let's track what you're eating!", color: '#0D9488' });
      }
      if (greenCount > meals.length * 0.6 && meals.length >= 3) {
        results.push({ id: 'green-foods', text: "Great job staying in the green today! Your food choices are on point.", color: '#10B981' });
      }
      if (water.glasses < 4 && hour >= 14) {
        results.push({ id: 'water', text: "Don't forget to drink water! You're at " + water.glasses + " glasses so far.", color: '#3B82F6' });
      }
    }

    if (tab === 'activity') {
      if (yesterdayIntense && activities.length === 0) {
        results.push({ id: 'rest-day', text: "A rest day is okay! Recovery is part of the journey.", color: '#8B5CF6' });
      }
      if (streak > 2) {
        results.push({ id: 'streak', text: `You're on a ${streak}-day streak! Keep it up!`, color: '#F97316' });
      }
    }

    if (tab === 'sleep') {
      if (avgSleep > 0 && avgSleep < 7) {
        const deficit = Math.round((7 - avgSleep) * 60);
        results.push({ id: 'sleep-deficit', text: `You've been sleeping ${deficit} min less than 7 hours on average this week.`, color: '#6366F1' });
      }
    }

    if (tab === 'wellbeing') {
      if (!mood.value) {
        results.push({ id: 'mood-check', text: "You haven't checked in with your mood today. How are you feeling?", color: '#8B5CF6' });
      }
    }

    if (tab === 'dashboard') {
      if (completionPct > 60 && completionPct < 100) {
        results.push({ id: 'almost-there', text: `You're ${completionPct}% complete today — almost there!`, color: '#0D9488' });
      }
    }

    return results.filter(n => !dismissed[n.id]);
  }, [tab, data, profile, historicalData, yesterdayData, dismissed]);

  if (nudges.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {nudges.map(nudge => (
        <div
          key={nudge.id}
          className="flex items-start gap-2 p-3 rounded-xl"
          style={{ backgroundColor: nudge.color + '10' }}
        >
          <Info size={14} style={{ color: nudge.color }} className="shrink-0 mt-0.5" />
          <p className="flex-1 text-sm" style={{ color: nudge.color }}>{nudge.text}</p>
          <button
            onClick={() => setDismissed(prev => ({ ...prev, [nudge.id]: true }))}
            className="shrink-0"
          >
            <X size={14} style={{ color: nudge.color }} />
          </button>
        </div>
      ))}
    </div>
  );
}
