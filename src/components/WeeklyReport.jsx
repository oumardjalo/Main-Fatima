import { useMemo } from 'react';
import { X, Calendar, TrendingUp, Star, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { formatDuration, formatNumber } from '../utils/helpers';

const MOOD_MAP = { great: 5, good: 4, okay: 3, low: 2, bad: 1 };
const MOOD_LABELS = { 5: 'Great', 4: 'Good', 3: 'Okay', 2: 'Low', 1: 'Bad' };

export default function WeeklyReport({ historicalData, profile, onClose }) {
  const [copied, setCopied] = useState(false);

  const report = useMemo(() => {
    const last7 = historicalData.slice(-7);
    if (last7.length === 0) return null;

    // Calories
    let totalCals = 0;
    let calDays = 0;
    last7.forEach(d => {
      if (d?.meals?.length > 0) {
        totalCals += d.meals.reduce((s, m) => s + (m.calories || 0), 0);
        calDays++;
      }
    });
    const avgCals = calDays > 0 ? Math.round(totalCals / calDays) : 0;

    // Sleep
    let totalSleep = 0;
    let sleepDays = 0;
    last7.forEach(d => {
      if (d?.sleep?.duration > 0) { totalSleep += d.sleep.duration; sleepDays++; }
    });
    const avgSleep = sleepDays > 0 ? totalSleep / sleepDays : 0;

    // Activity
    let totalMinutes = 0;
    let totalActivities = 0;
    last7.forEach(d => {
      const acts = d?.activities || [];
      totalActivities += acts.length;
      totalMinutes += acts.reduce((s, a) => s + (a.duration || 0), 0);
    });

    // Mood & stress
    let totalMood = 0;
    let moodDays = 0;
    let totalStress = 0;
    let stressDays = 0;
    last7.forEach(d => {
      if (d?.mood?.value) { totalMood += MOOD_MAP[d.mood.value] || 3; moodDays++; }
      if (d?.mood?.stressLevel) { totalStress += d.mood.stressLevel; stressDays++; }
    });
    const avgMood = moodDays > 0 ? totalMood / moodDays : 0;
    const avgStress = stressDays > 0 ? totalStress / stressDays : 0;

    // Habits
    let totalHabitsCompleted = 0;
    let totalHabitsTotal = 0;
    last7.forEach(d => {
      if (d?.habits) {
        totalHabitsCompleted += d.habits.filter(h => h.completed).length;
        totalHabitsTotal += d.habits.length;
      }
    });
    const habitRate = totalHabitsTotal > 0 ? Math.round((totalHabitsCompleted / totalHabitsTotal) * 100) : 0;

    // Weight
    const weights = last7.filter(d => d?.weight?.value).map(d => d.weight.value);
    const weightChange = weights.length >= 2 ? weights[weights.length - 1] - weights[0] : null;

    // Highlights
    let bestDay = { date: '', score: 0 };
    let mostActiveDay = { date: '', minutes: 0 };
    let bestSleep = { date: '', duration: 0 };

    last7.forEach(d => {
      if (!d) return;
      // Overall score
      let score = 0;
      if (d.meals?.length > 0) score += 25;
      if (d.activities?.length > 0) score += 25;
      if (d.mood?.value) score += 25;
      if (d.sleep?.duration > 0) score += 25;
      if (score > bestDay.score) bestDay = { date: d.date, score };

      // Active
      const min = (d.activities || []).reduce((s, a) => s + (a.duration || 0), 0);
      if (min > mostActiveDay.minutes) mostActiveDay = { date: d.date, minutes: min };

      // Sleep
      if ((d.sleep?.duration || 0) > bestSleep.duration) bestSleep = { date: d.date, duration: d.sleep.duration };
    });

    // Trends
    const prev7 = historicalData.slice(-14, -7);
    let prevSleep = 0;
    let prevSleepDays = 0;
    prev7.forEach(d => {
      if (d?.sleep?.duration > 0) { prevSleep += d.sleep.duration; prevSleepDays++; }
    });
    const prevAvgSleep = prevSleepDays > 0 ? prevSleep / prevSleepDays : 0;
    const sleepTrend = prevAvgSleep > 0 ? Math.round((avgSleep - prevAvgSleep) * 60) : null;

    // Mood trend
    let prevMood = 0;
    let prevMoodDays = 0;
    prev7.forEach(d => {
      if (d?.mood?.value) { prevMood += MOOD_MAP[d.mood.value] || 3; prevMoodDays++; }
    });
    const prevAvgMood = prevMoodDays > 0 ? prevMood / prevMoodDays : 0;
    const moodTrend = prevAvgMood > 0
      ? avgMood > prevAvgMood + 0.3 ? 'improving' : avgMood < prevAvgMood - 0.3 ? 'declining' : 'stable'
      : null;

    return {
      avgCals, avgSleep, totalMinutes, totalActivities, avgMood, avgStress, habitRate,
      weightChange, bestDay, mostActiveDay, bestSleep, sleepTrend, moodTrend,
      target: profile?.dailyCalorieTarget || 1800,
    };
  }, [historicalData, profile]);

  const textSummary = useMemo(() => {
    if (!report) return '';
    const lines = [
      `FatimaFit Weekly Report`,
      `---`,
      `Avg Calories: ${report.avgCals} / ${report.target}`,
      `Avg Sleep: ${formatDuration(report.avgSleep)}`,
      `Active Minutes: ${report.totalMinutes}`,
      `Activities: ${report.totalActivities}`,
      `Avg Mood: ${report.avgMood.toFixed(1)}/5`,
      `Avg Stress: ${report.avgStress.toFixed(1)}/10`,
      `Habits: ${report.habitRate}% completion`,
      report.weightChange !== null ? `Weight Change: ${report.weightChange > 0 ? '+' : ''}${report.weightChange.toFixed(1)} lbs` : '',
    ].filter(Boolean);
    return lines.join('\n');
  }, [report]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(textSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  if (!report) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Not enough data for a weekly report yet.</p>
          <button onClick={onClose} className="mt-4 text-sm" style={{ color: '#0D9488' }}>Close</button>
        </div>
      </div>
    );
  }

  const fmtDate = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '—';

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="max-w-lg mx-auto p-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Weekly Report</h2>
            <p className="text-sm text-gray-500 flex items-center gap-1"><Calendar size={14} /> Last 7 days</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard label="Avg Calories" value={`${report.avgCals}`} sub={`/ ${report.target} target`}
            color={report.avgCals <= report.target ? '#10B981' : '#F97316'} />
          <StatCard label="Avg Sleep" value={formatDuration(report.avgSleep)} sub="/ 8h goal"
            color={report.avgSleep >= 7 ? '#10B981' : '#F97316'} />
          <StatCard label="Active Minutes" value={`${report.totalMinutes}`} sub={`${report.totalActivities} activities`} color="#F97316" />
          <StatCard label="Habits" value={`${report.habitRate}%`} sub="completion rate"
            color={report.habitRate >= 70 ? '#10B981' : '#F59E0B'} />
          <StatCard label="Avg Mood" value={`${report.avgMood.toFixed(1)}/5`} sub={MOOD_LABELS[Math.round(report.avgMood)] || ''} color="#8B5CF6" />
          <StatCard label="Avg Stress" value={`${report.avgStress.toFixed(1)}/10`} sub=""
            color={report.avgStress <= 4 ? '#10B981' : report.avgStress <= 6 ? '#EAB308' : '#EF4444'} />
        </div>

        {/* Weight */}
        {report.weightChange !== null && (
          <div className="bg-gray-50 rounded-2xl p-4 mb-4">
            <p className="text-sm text-gray-600">Weight Change This Week</p>
            <p className={`text-xl font-bold ${report.weightChange <= 0 ? 'text-green-600' : 'text-orange-500'}`}>
              {report.weightChange > 0 ? '+' : ''}{report.weightChange.toFixed(1)} lbs
            </p>
          </div>
        )}

        {/* Highlights */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Highlights</h3>
          <div className="space-y-2">
            <HighlightRow icon={Star} color="#F59E0B" label="Best Day" value={fmtDate(report.bestDay.date)} sub={`${report.bestDay.score}% complete`} />
            <HighlightRow icon={TrendingUp} color="#F97316" label="Most Active" value={fmtDate(report.mostActiveDay.date)} sub={`${report.mostActiveDay.minutes} min`} />
            <HighlightRow icon={Star} color="#6366F1" label="Best Sleep" value={fmtDate(report.bestSleep.date)} sub={formatDuration(report.bestSleep.duration)} />
          </div>
        </div>

        {/* Trends */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Trends</h3>
          <div className="space-y-2">
            {report.sleepTrend !== null && (
              <p className="text-sm text-gray-600">
                {report.sleepTrend >= 0
                  ? `Sleep improved by ${report.sleepTrend} min vs last week`
                  : `Sleep decreased by ${Math.abs(report.sleepTrend)} min vs last week`}
              </p>
            )}
            {report.moodTrend && (
              <p className="text-sm text-gray-600">
                Mood trend: <span className="font-medium" style={{
                  color: report.moodTrend === 'improving' ? '#10B981' : report.moodTrend === 'declining' ? '#EF4444' : '#6B7280'
                }}>{report.moodTrend}</span>
              </p>
            )}
          </div>
        </div>

        {/* Copy button */}
        <button
          onClick={copyToClipboard}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50"
        >
          {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-gray-500" />}
          {copied ? 'Copied!' : 'Copy Summary'}
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-bold" style={{ color }}>{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

function HighlightRow({ icon: Icon, color, label, value, sub }) {
  return (
    <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
      <Icon size={16} style={{ color }} />
      <div className="flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
      <span className="text-xs text-gray-500">{sub}</span>
    </div>
  );
}
