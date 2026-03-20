import { useState } from 'react';
import { Plus, X, Droplets, Star } from 'lucide-react';
import { generateId, formatNumber } from '../utils/helpers';

const FOOD_COLORS = [
  { id: 'green', label: 'Green', color: '#10B981', desc: 'Nutrient-dense' },
  { id: 'yellow', label: 'Yellow', color: '#EAB308', desc: 'Moderate' },
  { id: 'orange', label: 'Orange', color: '#F97316', desc: 'Calorie-dense' },
];

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export default function Nutrition({ data, profile, onUpdateField }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedMeal, setExpandedMeal] = useState(null);
  const [form, setForm] = useState({
    mealType: 'Breakfast', name: '', calories: '', protein: '', carbs: '', fat: '', color: 'green',
  });

  const target = profile?.dailyCalorieTarget || 1800;
  const meals = data?.meals || [];
  const totalCalories = meals.reduce((s, m) => s + (m.calories || 0), 0);
  const totalProtein = meals.reduce((s, m) => s + (m.protein || 0), 0);
  const totalCarbs = meals.reduce((s, m) => s + (m.carbs || 0), 0);
  const totalFat = meals.reduce((s, m) => s + (m.fat || 0), 0);
  const remaining = target - totalCalories;
  const caloriePercent = Math.min((totalCalories / target) * 100, 100);

  const macroTargets = profile?.macroTargets || { protein: 120, carbs: 200, fat: 60 };

  // Food color breakdown
  const colorCounts = { green: 0, yellow: 0, orange: 0 };
  meals.forEach(m => { if (colorCounts[m.color] !== undefined) colorCounts[m.color]++; });
  const totalFoods = meals.length || 1;

  const waterData = data?.water || { glasses: 0, goal: 8 };

  const addMeal = () => {
    const newMeal = {
      id: generateId(),
      name: form.name,
      calories: Number(form.calories) || 0,
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
      color: form.color,
      time: form.mealType,
    };
    onUpdateField('meals', [...meals, newMeal]);
    setForm({ mealType: 'Breakfast', name: '', calories: '', protein: '', carbs: '', fat: '', color: 'green' });
    setShowAddModal(false);
  };

  const deleteMeal = (id) => {
    onUpdateField('meals', meals.filter(m => m.id !== id));
  };

  const toggleWater = (idx) => {
    const newGlasses = idx < waterData.glasses ? idx : idx + 1;
    onUpdateField('water', { ...waterData, glasses: newGlasses });
  };

  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Calorie Gauge */}
      <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col items-center">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="68" fill="none" stroke="#E5E7EB" strokeWidth="12" />
          <circle
            cx="80" cy="80" r="68" fill="none"
            stroke={totalCalories > target ? '#F97316' : '#0D9488'}
            strokeWidth="12" strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 68}
            strokeDashoffset={2 * Math.PI * 68 * (1 - caloriePercent / 100)}
            transform="rotate(-90 80 80)"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
          <text x="80" y="72" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#111827">
            {formatNumber(Math.max(0, remaining))}
          </text>
          <text x="80" y="92" textAnchor="middle" fontSize="12" fill="#6B7280">remaining</text>
        </svg>
        <p className="text-sm text-gray-500 mt-2">{formatNumber(totalCalories)} of {formatNumber(target)} kcal</p>
      </div>

      {/* Macro Bars */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Macros</h3>
        <div className="space-y-3">
          {[
            { label: 'Protein', value: totalProtein, target: macroTargets.protein, color: '#3B82F6' },
            { label: 'Carbs', value: totalCarbs, target: macroTargets.carbs, color: '#10B981' },
            { label: 'Fat', value: totalFat, target: macroTargets.fat, color: '#F97316' },
          ].map(m => (
            <div key={m.label}>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>{m.label}</span>
                <span>{m.value}g / {m.target}g</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${Math.min((m.value / m.target) * 100, 100)}%`, backgroundColor: m.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Food Color Breakdown */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Food Quality</h3>
        <div className="flex h-4 rounded-full overflow-hidden bg-gray-100">
          {FOOD_COLORS.map(fc => {
            const pct = (colorCounts[fc.id] / totalFoods) * 100;
            return pct > 0 ? (
              <div key={fc.id} style={{ width: `${pct}%`, backgroundColor: fc.color }} className="transition-all" />
            ) : null;
          })}
        </div>
        <div className="flex justify-between mt-2">
          {FOOD_COLORS.map(fc => (
            <div key={fc.id} className="flex items-center gap-1 text-xs text-gray-500">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: fc.color }} />
              {fc.label} ({colorCounts[fc.id]})
            </div>
          ))}
        </div>
      </div>

      {/* Meals */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Meals</h3>
        {MEAL_TYPES.map(type => {
          const typeMeals = meals.filter(m => m.time === type);
          const typeCal = typeMeals.reduce((s, m) => s + (m.calories || 0), 0);
          const isExpanded = expandedMeal === type;

          return (
            <div key={type} className="mb-2">
              <button
                onClick={() => setExpandedMeal(isExpanded ? null : type)}
                className="w-full flex justify-between items-center py-2 px-1 hover:bg-gray-50 rounded-lg"
              >
                <span className="text-sm font-medium text-gray-800">{type}</span>
                <span className="text-xs text-gray-500">{typeCal > 0 ? `${typeCal} kcal` : '—'}</span>
              </button>
              {isExpanded && (
                <div className="ml-2 space-y-1 pb-2">
                  {typeMeals.length === 0 ? (
                    <p className="text-xs text-gray-400 py-1">No items logged</p>
                  ) : (
                    typeMeals.map(meal => (
                      <div key={meal.id} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: FOOD_COLORS.find(f => f.id === meal.color)?.color || '#9CA3AF' }} />
                          <span className="text-sm text-gray-700">{meal.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{meal.calories} kcal</span>
                          <button onClick={() => deleteMeal(meal.id)} className="text-gray-400 hover:text-red-400">
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Water Tracker */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Water Intake</h3>
        <div className="flex gap-2 justify-center flex-wrap">
          {Array.from({ length: waterData.goal }, (_, i) => (
            <button
              key={i}
              onClick={() => toggleWater(i)}
              className="transition-all hover:scale-110"
            >
              <Droplets
                size={28}
                fill={i < waterData.glasses ? '#0D9488' : 'none'}
                color={i < waterData.glasses ? '#0D9488' : '#D1D5DB'}
              />
            </button>
          ))}
        </div>
        <p className="text-center text-sm text-gray-500 mt-2">{waterData.glasses} of {waterData.goal} glasses</p>
      </div>

      {/* Add Meal FAB */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white z-40 hover:opacity-90 transition-all"
        style={{ backgroundColor: '#0D9488' }}
      >
        <Plus size={24} />
      </button>

      {/* Add Meal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white rounded-t-2xl w-full p-5 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Meal</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            {/* Meal type */}
            <div className="flex gap-2 mb-4">
              {MEAL_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => setForm(f => ({ ...f, mealType: type }))}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    form.mealType === type ? 'text-white' : 'text-gray-600 bg-gray-100'
                  }`}
                  style={form.mealType === type ? { backgroundColor: '#0D9488' } : {}}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Food name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />

              <input
                type="number"
                placeholder="Calories"
                value={form.calories}
                onChange={e => setForm(f => ({ ...f, calories: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />

              <div className="grid grid-cols-3 gap-2">
                <input type="number" placeholder="Protein (g)" value={form.protein}
                  onChange={e => setForm(f => ({ ...f, protein: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
                <input type="number" placeholder="Carbs (g)" value={form.carbs}
                  onChange={e => setForm(f => ({ ...f, carbs: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
                <input type="number" placeholder="Fat (g)" value={form.fat}
                  onChange={e => setForm(f => ({ ...f, fat: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>

              {/* Food color */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Food quality</p>
                <div className="flex gap-3">
                  {FOOD_COLORS.map(fc => (
                    <button
                      key={fc.id}
                      onClick={() => setForm(f => ({ ...f, color: fc.id }))}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all ${
                        form.color === fc.id ? 'border-current' : 'border-gray-200'
                      }`}
                      style={form.color === fc.id ? { borderColor: fc.color, color: fc.color } : {}}
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: fc.color }} />
                      <span className="text-sm text-gray-700">{fc.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={addMeal}
                disabled={!form.name || !form.calories}
                className="w-full py-3 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
                style={{ backgroundColor: '#0D9488' }}
              >
                Add to {form.mealType}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
