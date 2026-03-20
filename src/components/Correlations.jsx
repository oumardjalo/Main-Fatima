import { useMemo } from 'react';
import { TrendingUp, Moon, Smile, Droplets, Dumbbell } from 'lucide-react';

const MOOD_MAP = { great: 5, good: 4, okay: 3, low: 2, bad: 1 };

export function useCorrelationInsights(historicalData) {
  return useMemo(() => {
    const insights = [];
    const days = historicalData.filter(d => d != null);
    if (days.length < 5) return [];

    // 1. Exercise ↔ Sleep
    const activeDays = days.filter(d => (d.activities || []).length > 0 && d.sleep?.duration > 0);
    const inactiveDays = days.filter(d => (d.activities || []).length === 0 && d.sleep?.duration > 0);
    if (activeDays.length >= 3 && inactiveDays.length >= 3) {
      const avgSleepActive = activeDays.reduce((s, d) => s + d.sleep.duration, 0) / activeDays.length;
      const avgSleepInactive = inactiveDays.reduce((s, d) => s + d.sleep.duration, 0) / inactiveDays.length;
      const diff = Math.round((avgSleepActive - avgSleepInactive) * 60);
      if (Math.abs(diff) >= 10) {
        insights.push({
          icon: Moon,
          color: '#6366F1',
          text: diff > 0
            ? `You sleep ${diff} min longer on days you exercise`
            : `You sleep ${Math.abs(diff)} min less on active days — try lighter evening workouts`,
          score: Math.abs(diff),
        });
      }
    }

    // 2. Sleep ↔ Mood
    const wellRestedDays = days.filter(d => d.sleep?.duration >= 7 && d.mood?.value);
    const poorSleepDays = days.filter(d => d.sleep?.duration > 0 && d.sleep.duration < 7 && d.mood?.value);
    if (wellRestedDays.length >= 3 && poorSleepDays.length >= 2) {
      const avgMoodRested = wellRestedDays.reduce((s, d) => s + (MOOD_MAP[d.mood.value] || 3), 0) / wellRestedDays.length;
      const avgMoodPoor = poorSleepDays.reduce((s, d) => s + (MOOD_MAP[d.mood.value] || 3), 0) / poorSleepDays.length;
      if (avgMoodRested - avgMoodPoor >= 0.5) {
        insights.push({
          icon: Smile,
          color: '#8B5CF6',
          text: `Your mood averages ${avgMoodRested.toFixed(1)} on well-rested days vs ${avgMoodPoor.toFixed(1)} on poor sleep days`,
          score: (avgMoodRested - avgMoodPoor) * 20,
        });
      }
    }

    // 3. Nutrition ↔ Mood
    const daysWithCalsAndMood = days.filter(d => d.meals?.length > 0 && d.mood?.value);
    if (daysWithCalsAndMood.length >= 5) {
      const withinTarget = daysWithCalsAndMood.filter(d => {
        const cals = d.meals.reduce((s, m) => s + (m.calories || 0), 0);
        return cals <= 2000 && cals >= 1200;
      });
      const outsideTarget = daysWithCalsAndMood.filter(d => {
        const cals = d.meals.reduce((s, m) => s + (m.calories || 0), 0);
        return cals > 2000 || cals < 1200;
      });
      if (withinTarget.length >= 3 && outsideTarget.length >= 2) {
        const avgIn = withinTarget.reduce((s, d) => s + (MOOD_MAP[d.mood.value] || 3), 0) / withinTarget.length;
        const avgOut = outsideTarget.reduce((s, d) => s + (MOOD_MAP[d.mood.value] || 3), 0) / outsideTarget.length;
        if (avgIn - avgOut >= 0.3) {
          insights.push({
            icon: TrendingUp,
            color: '#0D9488',
            text: `Your mood is better on days you eat within your calorie target`,
            score: (avgIn - avgOut) * 15,
          });
        }
      }
    }

    // 4. Hydration ↔ Stress
    const daysWithWater = days.filter(d => d.water && d.mood?.stressLevel);
    if (daysWithWater.length >= 5) {
      const hydrated = daysWithWater.filter(d => d.water.glasses >= 6);
      const dehydrated = daysWithWater.filter(d => d.water.glasses < 6);
      if (hydrated.length >= 3 && dehydrated.length >= 2) {
        const stressHydrated = hydrated.reduce((s, d) => s + d.mood.stressLevel, 0) / hydrated.length;
        const stressDehydrated = dehydrated.reduce((s, d) => s + d.mood.stressLevel, 0) / dehydrated.length;
        if (stressDehydrated - stressHydrated >= 1) {
          insights.push({
            icon: Droplets,
            color: '#3B82F6',
            text: `Your stress is ${(stressDehydrated - stressHydrated).toFixed(1)} points lower when you drink 6+ glasses of water`,
            score: (stressDehydrated - stressHydrated) * 10,
          });
        }
      }
    }

    // 5. Activity type ↔ Sleep quality
    const daysWithActivityAndSleep = days.filter(d => d.activities?.length > 0 && d.sleep?.quality > 0);
    if (daysWithActivityAndSleep.length >= 5) {
      const typeQuality = {};
      daysWithActivityAndSleep.forEach(d => {
        d.activities.forEach(a => {
          if (!typeQuality[a.type]) typeQuality[a.type] = [];
          typeQuality[a.type].push(d.sleep.quality);
        });
      });
      let bestType = null;
      let bestAvg = 0;
      Object.entries(typeQuality).forEach(([type, qualities]) => {
        if (qualities.length >= 2) {
          const avg = qualities.reduce((a, b) => a + b, 0) / qualities.length;
          if (avg > bestAvg) { bestAvg = avg; bestType = type; }
        }
      });
      if (bestType && bestAvg >= 3.5) {
        const typeName = bestType.charAt(0).toUpperCase() + bestType.slice(1);
        insights.push({
          icon: Dumbbell,
          color: '#F97316',
          text: `${typeName} days correlate with your best sleep quality (${bestAvg.toFixed(1)} stars)`,
          score: bestAvg * 8,
        });
      }
    }

    return insights.sort((a, b) => b.score - a.score).slice(0, 3);
  }, [historicalData]);
}

export function InsightCards({ insights }) {
  if (insights.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-gray-900 px-1">Insights</h3>
      {insights.map((insight, i) => {
        const Icon = insight.icon;
        return (
          <div key={i} className="bg-white rounded-2xl shadow-sm p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: insight.color + '20' }}>
              <Icon size={16} style={{ color: insight.color }} />
            </div>
            <p className="text-sm text-gray-700">{insight.text}</p>
          </div>
        );
      })}
    </div>
  );
}
