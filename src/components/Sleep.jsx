import { useState, useMemo } from 'react';
import { Moon, Sun, Star, Check, Edit3 } from 'lucide-react';
import { calcSleepDuration, formatDuration, getYesterdayKey } from '../utils/helpers';
import { SleepChart } from './Charts';

export default function Sleep({ data, yesterdayData, onUpdateField, onUpdateYesterday, profile, historicalData }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    bedtime: '', wakeTime: '', quality: 0, notes: '',
  });

  // Sleep data comes from yesterday's bundle (you log it in the morning)
  const sleepData = yesterdayData?.sleep || { bedtime: '', wakeTime: '', duration: 0, quality: 0, notes: '', checklist: [] };
  const hasSleep = sleepData.duration > 0;

  // Wind-down checklist (today's)
  const defaultChecklist = profile?.windDownChecklist || [
    'No screens 30 min before bed',
    'Room dark & cool',
    'Light stretching',
    'Read for 15 min',
    'Gratitude reflection',
  ];

  const todayChecklist = data?.sleep?.checklist || defaultChecklist.map(item => ({ text: item, done: false }));

  const startEdit = () => {
    setForm({
      bedtime: sleepData.bedtime || '22:30',
      wakeTime: sleepData.wakeTime || '06:30',
      quality: sleepData.quality || 0,
      notes: sleepData.notes || '',
    });
    setEditing(true);
  };

  const saveSleep = () => {
    const duration = calcSleepDuration(form.bedtime, form.wakeTime);
    onUpdateYesterday('sleep', {
      ...sleepData,
      bedtime: form.bedtime,
      wakeTime: form.wakeTime,
      duration,
      quality: form.quality,
      notes: form.notes,
    });
    setEditing(false);
  };

  const toggleChecklistItem = (idx) => {
    const newChecklist = [...todayChecklist];
    newChecklist[idx] = { ...newChecklist[idx], done: !newChecklist[idx].done };
    onUpdateField('sleep', { ...data.sleep, checklist: newChecklist });
  };

  // Sleep history
  const sleepHistory = useMemo(() => {
    return historicalData
      .filter(d => d?.sleep?.duration > 0)
      .slice(-7)
      .map(d => ({
        date: d.date,
        duration: d.sleep.duration,
        quality: d.sleep.quality,
        bedtime: d.sleep.bedtime,
      }));
  }, [historicalData]);

  const maxDuration = Math.max(...sleepHistory.map(s => s.duration), 10);

  // Bedtime consistency
  const avgBedtime = useMemo(() => {
    const bedtimes = sleepHistory.filter(s => s.bedtime).map(s => {
      const [h, m] = s.bedtime.split(':').map(Number);
      return h * 60 + m;
    });
    if (bedtimes.length === 0) return null;
    const avg = bedtimes.reduce((a, b) => a + b, 0) / bedtimes.length;
    const h = Math.floor(avg / 60) % 24;
    const m = Math.round(avg % 60);
    return `${h > 12 ? h - 12 : h}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  }, [sleepHistory]);

  const checklistCompleted = todayChecklist.filter(c => c.done).length;

  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Last Night's Sleep - Hero Card */}
      {!editing && (
        <div className="bg-white rounded-2xl shadow-sm p-5">
          {hasSleep ? (
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900">{formatDuration(sleepData.duration)}</p>
              <div className="flex justify-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    size={20}
                    fill={star <= sleepData.quality ? '#0D9488' : 'none'}
                    color={star <= sleepData.quality ? '#0D9488' : '#D1D5DB'}
                  />
                ))}
              </div>
              <div className="flex justify-center gap-4 mt-3">
                <span className="flex items-center gap-1 text-sm text-gray-600">
                  <Moon size={14} style={{ color: '#6366F1' }} />
                  {sleepData.bedtime}
                </span>
                <span className="flex items-center gap-1 text-sm text-gray-600">
                  <Sun size={14} style={{ color: '#F59E0B' }} />
                  {sleepData.wakeTime}
                </span>
              </div>
              {sleepData.notes && (
                <p className="text-xs text-gray-400 mt-2">{sleepData.notes}</p>
              )}
              <button
                onClick={startEdit}
                className="mt-3 text-sm flex items-center gap-1 mx-auto"
                style={{ color: '#0D9488' }}
              >
                <Edit3 size={14} /> Edit
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <Moon size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500 mb-3">How did you sleep last night?</p>
              <button
                onClick={startEdit}
                className="px-4 py-2 text-white text-sm font-medium rounded-xl"
                style={{ backgroundColor: '#6366F1' }}
              >
                Log Sleep
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sleep Log Form */}
      {editing && (
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Log Last Night's Sleep</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Bedtime</label>
                <input
                  type="time"
                  value={form.bedtime}
                  onChange={e => setForm(f => ({ ...f, bedtime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Wake time</label>
                <input
                  type="time"
                  value={form.wakeTime}
                  onChange={e => setForm(f => ({ ...f, wakeTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
                />
              </div>
            </div>
            {form.bedtime && form.wakeTime && (
              <p className="text-center text-sm text-gray-500">
                Duration: {formatDuration(calcSleepDuration(form.bedtime, form.wakeTime))}
              </p>
            )}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Quality</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} onClick={() => setForm(f => ({ ...f, quality: star }))}>
                    <Star
                      size={28}
                      fill={star <= form.quality ? '#0D9488' : 'none'}
                      color={star <= form.quality ? '#0D9488' : '#D1D5DB'}
                    />
                  </button>
                ))}
              </div>
            </div>
            <input
              type="text"
              placeholder="Notes (optional)"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={saveSleep}
                className="flex-1 py-2 text-white font-medium rounded-xl"
                style={{ backgroundColor: '#6366F1' }}
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wind-Down Checklist */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Moon size={16} style={{ color: '#6366F1' }} /> Evening Routine
          </h3>
          <span className="text-xs text-gray-500">{checklistCompleted} of {todayChecklist.length}</span>
        </div>
        <div className="space-y-2">
          {todayChecklist.map((item, idx) => (
            <button
              key={idx}
              onClick={() => toggleChecklistItem(idx)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  item.done ? 'border-transparent' : 'border-gray-300'
                }`}
                style={item.done ? { backgroundColor: '#6366F1' } : {}}
              >
                {item.done && <Check size={12} className="text-white" />}
              </div>
              <span className={`text-sm ${item.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                {item.text}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bedtime Consistency */}
      {avgBedtime && (
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Bedtime Consistency</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Average bedtime</p>
              <p className="text-lg font-semibold text-gray-900">{avgBedtime}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Target</p>
              <p className="text-lg font-semibold" style={{ color: '#6366F1' }}>
                {profile?.targetBedtime || '10:30 PM'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sleep Chart */}
      <SleepChart historicalData={historicalData} />

      {/* Sleep History */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Sleep History</h3>
        {sleepHistory.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No sleep data yet.</p>
        ) : (
          <div className="space-y-2">
            {sleepHistory.map(entry => {
              const qualityColor = entry.quality >= 4 ? '#10B981' : entry.quality >= 3 ? '#EAB308' : '#F97316';
              const barWidth = (entry.duration / maxDuration) * 100;
              return (
                <div key={entry.date} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-16 shrink-0">
                    {new Date(entry.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${barWidth}%`, backgroundColor: qualityColor }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-12 text-right">{formatDuration(entry.duration)}</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={10} fill={s <= entry.quality ? qualityColor : 'none'} color={s <= entry.quality ? qualityColor : '#D1D5DB'} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
