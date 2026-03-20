import { useMemo } from 'react';
import { Flame, Trophy, MapPin, Clock, Zap, Heart } from 'lucide-react';
import { ACTIVITY_TYPES } from '../utils/helpers';

const INTENSITY_COLORS = [
  { min: 0, max: 0, color: '#E5E7EB', label: 'None' },
  { min: 1, max: 20, color: '#CCFBF1', label: 'Light' },
  { min: 21, max: 45, color: '#5EEAD4', label: 'Moderate' },
  { min: 46, max: 60, color: '#14B8A6', label: 'High' },
  { min: 61, max: Infinity, color: '#0F766E', label: 'Intense' },
];

function getIntensityColor(minutes) {
  for (const level of INTENSITY_COLORS) {
    if (minutes >= level.min && minutes <= level.max) return level.color;
  }
  return '#0F766E';
}

export function ActivityHeatmap({ historicalData }) {
  // Build 12-week (84 day) grid
  const grid = useMemo(() => {
    const days = [];
    for (let i = 83; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const dayData = historicalData.find(h => h?.date === key);
      const minutes = (dayData?.activities || []).reduce((s, a) => s + (a.duration || 0), 0);
      days.push({
        date: key,
        dayOfWeek: d.getDay(),
        minutes,
        color: getIntensityColor(minutes),
        activities: dayData?.activities || [],
      });
    }

    // Organize into weeks (columns)
    const weeks = [];
    let currentWeek = [];
    for (const day of days) {
      currentWeek.push(day);
      if (day.dayOfWeek === 6) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) weeks.push(currentWeek);

    return { days, weeks };
  }, [historicalData]);

  // Month labels
  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = -1;
    grid.weeks.forEach((week, wIdx) => {
      const firstDay = week[0];
      if (firstDay) {
        const month = new Date(firstDay.date + 'T12:00:00').getMonth();
        if (month !== lastMonth) {
          labels.push({ weekIdx: wIdx, label: new Date(firstDay.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' }) });
          lastMonth = month;
        }
      }
    });
    return labels;
  }, [grid.weeks]);

  const dayLabels = ['', 'M', '', 'W', '', 'F', ''];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Activity Heatmap (12 Weeks)</h3>

      {/* Month labels */}
      <div className="flex ml-6 mb-1">
        {monthLabels.map((ml, i) => (
          <span
            key={i}
            className="text-xs text-gray-400"
            style={{ position: 'relative', left: `${ml.weekIdx * 16}px` }}
          >
            {ml.label}
          </span>
        ))}
      </div>

      <div className="flex gap-0">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 mr-1">
          {dayLabels.map((label, i) => (
            <div key={i} className="h-3 w-4 flex items-center justify-end">
              <span className="text-[9px] text-gray-400">{label}</span>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-0.5 overflow-x-auto">
          {grid.weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-0.5">
              {Array.from({ length: 7 }, (_, dayIdx) => {
                const day = week.find(d => d.dayOfWeek === dayIdx);
                return (
                  <div
                    key={dayIdx}
                    className="w-3 h-3 rounded-sm transition-all hover:ring-1 hover:ring-gray-400"
                    style={{ backgroundColor: day ? day.color : '#F3F4F6' }}
                    title={day ? `${day.date}: ${day.minutes} min` : ''}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1 mt-2">
        <span className="text-[9px] text-gray-400 mr-1">Less</span>
        {INTENSITY_COLORS.map((level, i) => (
          <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: level.color }} />
        ))}
        <span className="text-[9px] text-gray-400 ml-1">More</span>
      </div>
    </div>
  );
}

export function PersonalRecords({ historicalData }) {
  const records = useMemo(() => {
    let longestRun = { distance: 0, date: '' };
    let mostActiveDay = { minutes: 0, date: '' };
    let totalActivities = 0;
    let totalDistance = 0;
    const typeCounts = {};
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Sort by date
    const sorted = [...historicalData].sort((a, b) => (a?.date || '').localeCompare(b?.date || ''));

    sorted.forEach(d => {
      if (!d) return;
      const activities = d.activities || [];
      const dayMinutes = activities.reduce((s, a) => s + (a.duration || 0), 0);
      totalActivities += activities.length;

      if (dayMinutes > mostActiveDay.minutes) {
        mostActiveDay = { minutes: dayMinutes, date: d.date };
      }

      if (activities.length > 0) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }

      activities.forEach(a => {
        if (a.distance) totalDistance += Number(a.distance);
        if (['run', 'walk', 'cycle'].includes(a.type) && a.distance > longestRun.distance) {
          longestRun = { distance: a.distance, date: d.date };
        }
        typeCounts[a.type] = (typeCounts[a.type] || 0) + 1;
      });
    });

    // Current streak (from today backwards)
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (sorted[i]?.activities?.length > 0) currentStreak++;
      else break;
    }

    const favoriteType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
    const favoriteLabel = favoriteType
      ? (ACTIVITY_TYPES.find(t => t.id === favoriteType[0])?.name || favoriteType[0])
      : 'N/A';

    return [
      { icon: MapPin, label: 'Longest Distance', value: longestRun.distance > 0 ? `${longestRun.distance} km` : '—', sub: longestRun.date, color: '#3B82F6' },
      { icon: Zap, label: 'Most Active Day', value: mostActiveDay.minutes > 0 ? `${mostActiveDay.minutes} min` : '—', sub: mostActiveDay.date, color: '#F97316' },
      { icon: Flame, label: 'Longest Streak', value: `${longestStreak} days`, sub: '', color: '#EF4444' },
      { icon: Flame, label: 'Current Streak', value: `${currentStreak} days`, sub: currentStreak > 0 ? '🔥' : '', color: '#F59E0B' },
      { icon: Trophy, label: 'Total Activities', value: `${totalActivities}`, sub: `${Math.round(totalDistance * 10) / 10} km total`, color: '#8B5CF6' },
      { icon: Heart, label: 'Favorite Activity', value: favoriteLabel, sub: favoriteType ? `${favoriteType[1]} times` : '', color: '#EC4899' },
    ];
  }, [historicalData]);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Personal Records</h3>
      <div className="grid grid-cols-2 gap-3">
        {records.map((rec, i) => {
          const Icon = rec.icon;
          return (
            <div key={i} className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Icon size={14} style={{ color: rec.color }} />
                <span className="text-xs text-gray-500">{rec.label}</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{rec.value}</p>
              {rec.sub && <p className="text-xs text-gray-400">{rec.sub}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
