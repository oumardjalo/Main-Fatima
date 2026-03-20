import { useState } from 'react';
import { X, Trash2, Plus, Heart } from 'lucide-react';
import storage from '../utils/storage';
import DataExport from './DataExport';
import { ThemeSettings } from './ThemeProvider';

export default function Settings({ profile, onSaveProfile, onClose }) {
  const [form, setForm] = useState({ ...profile });
  const [newHabit, setNewHabit] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [habits, setHabits] = useState(profile?.customHabits || []);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const updateMacro = (field, value) => {
    setForm(prev => ({
      ...prev,
      macroTargets: { ...prev.macroTargets, [field]: Number(value) || 0 },
    }));
  };

  const save = () => {
    onSaveProfile({ ...form, customHabits: habits });
    onClose();
  };

  const addHabit = () => {
    if (!newHabit.trim()) return;
    setHabits([...habits, { id: `custom-${Date.now()}`, name: newHabit.trim(), icon: 'check' }]);
    setNewHabit('');
  };

  const removeHabit = (id) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  const resetAllData = async () => {
    await storage.clearAll();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="max-w-lg mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Profile */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Profile</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Name</label>
                <input type="text" value={form.name || ''} onChange={e => update('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Current Weight (kg)</label>
                  <input type="number" value={form.currentWeight || ''} onChange={e => update('currentWeight', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Goal Weight (kg)</label>
                  <input type="number" value={form.goalWeight || ''} onChange={e => update('goalWeight', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Height (cm)</label>
                  <input type="number" value={form.height || ''} onChange={e => update('height', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Daily Calories</label>
                  <input type="number" value={form.dailyCalorieTarget || ''} onChange={e => update('dailyCalorieTarget', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" />
                </div>
              </div>
            </div>
          </section>

          {/* Macros */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Macro Targets</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Protein (g)</label>
                <input type="number" value={form.macroTargets?.protein || ''} onChange={e => updateMacro('protein', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Carbs (g)</label>
                <input type="number" value={form.macroTargets?.carbs || ''} onChange={e => updateMacro('carbs', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Fat (g)</label>
                <input type="number" value={form.macroTargets?.fat || ''} onChange={e => updateMacro('fat', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" />
              </div>
            </div>
          </section>

          {/* Sleep Settings */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Sleep</h3>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Target Bedtime</label>
              <input type="time" value={form.targetBedtime || '22:30'} onChange={e => update('targetBedtime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" />
            </div>
          </section>

          {/* Custom Habits */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Custom Habits</h3>
            <div className="space-y-2 mb-3">
              {habits.map(h => (
                <div key={h.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-xl">
                  <span className="text-sm text-gray-700">{h.name}</span>
                  <button onClick={() => removeHabit(h.id)} className="text-gray-400 hover:text-red-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New habit..."
                value={newHabit}
                onChange={e => setNewHabit(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addHabit()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm"
              />
              <button
                onClick={addHabit}
                className="px-3 py-2 text-white rounded-xl"
                style={{ backgroundColor: '#0D9488' }}
              >
                <Plus size={18} />
              </button>
            </div>
          </section>

          {/* Theme */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Theme</h3>
            <ThemeSettings />
          </section>

          {/* Data Export */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Export</h3>
            <DataExport />
          </section>

          {/* Data */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Data</h3>
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-2 text-red-500 border border-red-200 rounded-xl text-sm hover:bg-red-50"
              >
                Reset All Data
              </button>
            ) : (
              <div className="bg-red-50 p-4 rounded-xl">
                <p className="text-sm text-red-600 mb-3">Are you sure? This will delete all your data permanently.</p>
                <div className="flex gap-2">
                  <button onClick={resetAllData} className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm">
                    Yes, Reset
                  </button>
                  <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-xl text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* About */}
          <section className="text-center py-4">
            <Heart size={20} className="mx-auto mb-2" style={{ color: '#F97316' }} />
            <p className="text-sm text-gray-500">FatimaFit v2.0</p>
            <p className="text-xs text-gray-400">Made with love for the most beautiful Fatima</p>
          </section>

          {/* Save */}
          <button
            onClick={save}
            className="w-full py-3 text-white font-semibold rounded-xl mb-8"
            style={{ backgroundColor: '#0D9488' }}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
