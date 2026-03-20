import { useState } from 'react';
import { Heart } from 'lucide-react';

export default function ProfileSetup({ onSave }) {
  const [form, setForm] = useState({
    name: 'Fatima',
    currentWeight: '',
    goalWeight: '',
    height: '',
    dailyCalorieTarget: 1800,
    macroTargets: { protein: 120, carbs: 200, fat: 60 },
    targetBedtime: '22:30',
    windDownChecklist: [
      'No screens 30 min before bed',
      'Room dark & cool',
      'Light stretching',
      'Read for 15 min',
      'Gratitude reflection',
    ],
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      currentWeight: Number(form.currentWeight) || 0,
      goalWeight: Number(form.goalWeight) || 0,
      height: Number(form.height) || 0,
      dailyCalorieTarget: Number(form.dailyCalorieTarget) || 1800,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#0D9488' }}>
            <Heart className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome to FatimaFit</h2>
          <p className="text-gray-500 mt-1">Let's set up your wellness profile</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => update('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#0D9488' }}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Weight (lbs)</label>
              <input
                type="number"
                value={form.currentWeight}
                onChange={e => update('currentWeight', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2"
                placeholder="165"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Goal Weight (lbs)</label>
              <input
                type="number"
                value={form.goalWeight}
                onChange={e => update('goalWeight', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2"
                placeholder="145"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height (inches)</label>
              <input
                type="number"
                value={form.height}
                onChange={e => update('height', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2"
                placeholder="64"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Daily Calories</label>
              <input
                type="number"
                value={form.dailyCalorieTarget}
                onChange={e => update('dailyCalorieTarget', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2"
                placeholder="1800"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 text-white font-semibold rounded-xl transition-all hover:opacity-90"
            style={{ backgroundColor: '#0D9488' }}
          >
            Get Started
          </button>
        </form>
      </div>
    </div>
  );
}
