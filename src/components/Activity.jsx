import { useState, useMemo } from 'react';
import { Plus, X, Flame, Dumbbell, Zap, Footprints, Waves, Bike, Sparkles, StretchHorizontal } from 'lucide-react';
import { generateId, getLast7Days, ACTIVITY_TYPES, CALORIE_RATES } from '../utils/helpers';
import { ActivityChart } from './Charts';
import { ActivityHeatmap, PersonalRecords } from './ActivityHeatmap';

const ICON_MAP = {
  Sparkles, Zap, Footprints, Waves, Bike, Dumbbell, Flame, StretchHorizontal, Plus,
  Flower2: Sparkles, // fallback
};

const INTENSITY_OPTIONS = [
  { id: 'Light', color: '#10B981', bg: '#D1FAE5' },
  { id: 'Moderate', color: '#EAB308', bg: '#FEF9C3' },
  { id: 'Hard', color: '#F97316', bg: '#FFEDD5' },
];

export default function Activity({ data, onUpdateField, historicalData, selectedDate, onDateSelect }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    type: '', duration: 30, intensity: 'Moderate', calories: '',
    distance: '', pace: '', notes: '', sessionType: 'Mat', focusArea: 'Core',
  });

  const activities = data?.activities || [];
  const totalMinutes = activities.reduce((s, a) => s + (a.duration || 0), 0);
  const totalCalBurned = activities.reduce((s, a) => s + (a.calories || 0), 0);

  const last7 = useMemo(() => getLast7Days(), []);

  // Activity streak
  const streak = useMemo(() => {
    let count = 0;
    for (let i = historicalData.length - 1; i >= 0; i--) {
      if (historicalData[i]?.activities?.length > 0) count++;
      else break;
    }
    return count;
  }, [historicalData]);

  const selectType = (type) => {
    const estimated = Math.round(form.duration * CALORIE_RATES[form.intensity]);
    setForm(f => ({ ...f, type: type.id, calories: estimated }));
  };

  const updateDuration = (dur) => {
    const estimated = Math.round(dur * CALORIE_RATES[form.intensity]);
    setForm(f => ({ ...f, duration: dur, calories: estimated }));
  };

  const updateIntensity = (int) => {
    const estimated = Math.round(form.duration * CALORIE_RATES[int]);
    setForm(f => ({ ...f, intensity: int, calories: estimated }));
  };

  const addActivity = () => {
    const newActivity = {
      id: generateId(),
      type: form.type,
      duration: Number(form.duration),
      intensity: form.intensity,
      calories: Number(form.calories) || 0,
      distance: form.distance ? Number(form.distance) : null,
      pace: form.pace || null,
      notes: form.notes,
      sessionType: form.type === 'pilates' ? form.sessionType : null,
      focusArea: form.type === 'pilates' ? form.focusArea : null,
    };
    onUpdateField('activities', [...activities, newActivity]);
    setForm({ type: '', duration: 30, intensity: 'Moderate', calories: '', distance: '', pace: '', notes: '', sessionType: 'Mat', focusArea: 'Core' });
    setShowAddModal(false);
  };

  const deleteActivity = (id) => {
    onUpdateField('activities', activities.filter(a => a.id !== id));
  };

  const getTypeLabel = (id) => ACTIVITY_TYPES.find(t => t.id === id)?.name || id;

  return (
    <div className="space-y-4">
      {/* Weekly Strip */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex justify-between">
          {last7.map(day => {
            const dayData = historicalData.find(d => d?.date === day.key);
            const hasActivity = dayData?.activities?.length > 0;
            const isSelected = selectedDate === day.key;

            return (
              <button
                key={day.key}
                onClick={() => onDateSelect(day.key)}
                className="flex flex-col items-center gap-1"
              >
                <span className="text-xs text-gray-500">{day.dayName}</span>
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    isSelected ? 'text-white' : 'text-gray-700'
                  }`}
                  style={isSelected ? { backgroundColor: '#0D9488' } : {}}
                >
                  {day.dayNum}
                </div>
                {hasActivity && <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#0D9488' }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{totalMinutes}</p>
            <p className="text-xs text-gray-500">Active min</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{totalCalBurned}</p>
            <p className="text-xs text-gray-500">Calories</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{activities.length}</p>
            <p className="text-xs text-gray-500">Activities</p>
          </div>
        </div>
        {streak > 0 && (
          <div className="mt-3 text-center">
            <span className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: '#F97316' }}>
              <Flame size={16} /> {streak} day streak!
            </span>
          </div>
        )}
      </div>

      {/* Activity List */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Activities</h3>
        {activities.length === 0 ? (
          <div className="text-center py-6">
            <Dumbbell size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">No activities logged yet today.</p>
            <p className="text-xs text-gray-400">Let's get moving, Fatima!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map(a => {
              const intStyle = INTENSITY_OPTIONS.find(i => i.id === a.intensity);
              return (
                <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: intStyle?.bg || '#F3F4F6' }}>
                      <Dumbbell size={18} style={{ color: intStyle?.color || '#6B7280' }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{getTypeLabel(a.type)}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{a.duration} min</span>
                        <span className="px-1.5 py-0.5 rounded-full text-xs" style={{ backgroundColor: intStyle?.bg, color: intStyle?.color }}>
                          {a.intensity}
                        </span>
                        <span>{a.calories} cal</span>
                      </div>
                      {a.distance && <p className="text-xs text-gray-400">{a.distance} km</p>}
                      {a.sessionType && <p className="text-xs text-gray-400">{a.sessionType} · {a.focusArea}</p>}
                    </div>
                  </div>
                  <button onClick={() => deleteActivity(a.id)} className="text-gray-400 hover:text-red-400">
                    <X size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Heatmap, Records & Chart */}
      <ActivityHeatmap historicalData={historicalData} />
      <PersonalRecords historicalData={historicalData} />
      <ActivityChart historicalData={historicalData} />

      {/* Add Activity FAB */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white z-40 hover:opacity-90 transition-all"
        style={{ backgroundColor: '#F97316' }}
      >
        <Plus size={24} />
      </button>

      {/* Add Activity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white rounded-t-2xl w-full p-5 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Log Activity</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            {/* Type Grid */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              {ACTIVITY_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => selectType(type)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                    form.type === type.id ? 'border-current' : 'border-gray-100'
                  }`}
                  style={form.type === type.id ? { borderColor: '#F97316', color: '#F97316' } : {}}
                >
                  <Dumbbell size={20} className="text-gray-500" />
                  <span className="text-xs text-gray-700">{type.name}</span>
                </button>
              ))}
            </div>

            {/* Duration */}
            <div className="mb-4">
              <label className="text-sm text-gray-600 mb-1 block">Duration: {form.duration} min</label>
              <input
                type="range" min="5" max="180" step="5"
                value={form.duration}
                onChange={e => updateDuration(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>

            {/* Intensity */}
            <div className="flex gap-2 mb-4">
              {INTENSITY_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => updateIntensity(opt.id)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                    form.intensity === opt.id ? 'text-white' : ''
                  }`}
                  style={form.intensity === opt.id
                    ? { backgroundColor: opt.color, color: 'white' }
                    : { backgroundColor: opt.bg, color: opt.color }}
                >
                  {opt.id}
                </button>
              ))}
            </div>

            {/* Calories */}
            <div className="mb-3">
              <label className="text-sm text-gray-600 mb-1 block">Calories burned</label>
              <input
                type="number"
                value={form.calories}
                onChange={e => setForm(f => ({ ...f, calories: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Conditional: Running/Walking/Cycling */}
            {['run', 'walk', 'cycle'].includes(form.type) && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Distance (km)</label>
                  <input type="number" step="0.1" value={form.distance}
                    onChange={e => setForm(f => ({ ...f, distance: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Pace</label>
                  <input type="text" placeholder="e.g. 6:30/km" value={form.pace}
                    onChange={e => setForm(f => ({ ...f, pace: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none text-sm"
                  />
                </div>
              </div>
            )}

            {/* Conditional: Pilates */}
            {form.type === 'pilates' && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Session Type</label>
                  <select value={form.sessionType} onChange={e => setForm(f => ({ ...f, sessionType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm">
                    <option>Mat</option>
                    <option>Reformer</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Focus Area</label>
                  <select value={form.focusArea} onChange={e => setForm(f => ({ ...f, focusArea: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm">
                    <option>Core</option>
                    <option>Full Body</option>
                    <option>Flexibility</option>
                    <option>Lower Body</option>
                    <option>Upper Body</option>
                  </select>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="mb-4">
              <label className="text-sm text-gray-600 mb-1 block">Notes (optional)</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none text-sm"
                rows={2}
              />
            </div>

            <button
              onClick={addActivity}
              disabled={!form.type}
              className="w-full py-3 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
              style={{ backgroundColor: '#F97316' }}
            >
              Log Activity
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
