import { useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ReferenceLine
} from 'recharts';

const MOOD_MAP = { great: 5, good: 4, okay: 3, low: 2, bad: 1 };

function ChartCard({ title, children, empty }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
      {empty ? (
        <p className="text-sm text-gray-400 text-center py-6">Not enough data yet</p>
      ) : children}
    </div>
  );
}

export function WeightChart({ historicalData, profile, days = 30 }) {
  const chartData = useMemo(() => {
    return historicalData
      .filter(d => d?.weight?.value)
      .slice(-days)
      .map(d => ({
        date: new Date(d.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weight: d.weight.value,
      }));
  }, [historicalData, days]);

  return (
    <ChartCard title="Weight Trend" empty={chartData.length < 3}>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
          <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
          <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
          {profile?.goalWeight && (
            <ReferenceLine y={profile.goalWeight} stroke="#F97316" strokeDasharray="5 5" label={{ value: 'Goal', fill: '#F97316', fontSize: 10 }} />
          )}
          <Line type="monotone" dataKey="weight" stroke="#0D9488" strokeWidth={2} dot={{ fill: '#0D9488', r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function CalorieChart({ historicalData, target }) {
  const chartData = useMemo(() => {
    return historicalData
      .filter(d => d?.meals?.length > 0)
      .slice(-7)
      .map(d => {
        const total = d.meals.reduce((s, m) => s + (m.calories || 0), 0);
        return {
          date: new Date(d.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
          calories: total,
          over: total > target,
        };
      });
  }, [historicalData, target]);

  return (
    <ChartCard title="Calorie Intake (7 Days)" empty={chartData.length < 3}>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
          <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
          <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
          <ReferenceLine y={target} stroke="#F97316" strokeDasharray="5 5" />
          <Bar dataKey="calories" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.over ? '#F97316' : '#0D9488'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function FoodColorPieChart({ historicalData }) {
  const pieData = useMemo(() => {
    const counts = { green: 0, yellow: 0, red: 0 };
    historicalData.slice(-7).forEach(d => {
      (d?.meals || []).forEach(m => {
        if (m.color === 'orange') counts.red++;
        else if (counts[m.color] !== undefined) counts[m.color]++;
      });
    });
    return [
      { name: 'Green', value: counts.green, color: '#10B981' },
      { name: 'Amber', value: counts.yellow, color: '#EAB308' },
      { name: 'Red', value: counts.red, color: '#EF4444' },
    ].filter(d => d.value > 0);
  }, [historicalData]);

  return (
    <ChartCard title="Food Quality (7 Days)" empty={pieData.length === 0}>
      <div className="flex items-center justify-center gap-4">
        <PieChart width={120} height={120}>
          <Pie data={pieData} cx={60} cy={60} innerRadius={30} outerRadius={55} dataKey="value" strokeWidth={0}>
            {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
        </PieChart>
        <div className="space-y-1">
          {pieData.map(d => (
            <div key={d.name} className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="text-gray-600">{d.name}: {d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}

export function ActivityChart({ historicalData }) {
  const chartData = useMemo(() => {
    return historicalData
      .slice(-7)
      .map(d => ({
        date: new Date((d?.date || '') + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
        minutes: (d?.activities || []).reduce((s, a) => s + (a.duration || 0), 0),
      }))
      .filter(d => d.date !== 'Invalid Date');
  }, [historicalData]);

  return (
    <ChartCard title="Active Minutes (7 Days)" empty={chartData.length < 3}>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
          <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
          <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
          <Bar dataKey="minutes" fill="#F97316" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function SleepChart({ historicalData }) {
  const chartData = useMemo(() => {
    return historicalData
      .filter(d => d?.sleep?.duration > 0)
      .slice(-7)
      .map(d => ({
        date: new Date(d.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
        hours: Math.round(d.sleep.duration * 10) / 10,
        quality: d.sleep.quality,
      }));
  }, [historicalData]);

  return (
    <ChartCard title="Sleep Duration (7 Nights)" empty={chartData.length < 3}>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
          <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} unit="h" />
          <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
          <ReferenceLine y={8} stroke="#6366F1" strokeDasharray="5 5" />
          <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.quality >= 4 ? '#10B981' : entry.quality >= 3 ? '#EAB308' : '#F97316'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function MoodChart({ historicalData }) {
  const chartData = useMemo(() => {
    return historicalData
      .filter(d => d?.mood?.value)
      .slice(-14)
      .map(d => ({
        date: new Date(d.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        mood: MOOD_MAP[d.mood.value] || 3,
        stress: d.mood.stressLevel || 5,
      }));
  }, [historicalData]);

  return (
    <ChartCard title="Mood & Stress (14 Days)" empty={chartData.length < 3}>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9CA3AF' }} />
          <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
          <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
          <defs>
            <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="mood" stroke="#8B5CF6" strokeWidth={2} fill="url(#moodGrad)" name="Mood (1-5)" />
          <Line type="monotone" dataKey="stress" stroke="#EF4444" strokeWidth={2} dot={false} name="Stress (1-10)" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
