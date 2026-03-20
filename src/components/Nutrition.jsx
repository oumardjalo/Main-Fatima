import { useState } from 'react';
import { Plus, X, Droplets, Star, UtensilsCrossed, Camera } from 'lucide-react';
import { generateId, formatNumber } from '../utils/helpers';
import { CalorieChart, FoodColorPieChart } from './Charts';
import SavedFoodsModal from './SavedFoods';
import Recipes from './Recipes';
import FoodScanner from './FoodScanner';

const FOOD_COLORS = [
  { id: 'green', label: 'Green', color: '#10B981', desc: 'Nutrient-dense' },
  { id: 'yellow', label: 'Amber', color: '#EAB308', desc: 'Moderate' },
  { id: 'red', label: 'Red', color: '#EF4444', desc: 'Calorie-dense' },
];

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export default function Nutrition({ data, profile, onUpdateField, historicalData }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRecipes, setShowRecipes] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [addMealType, setAddMealType] = useState('Breakfast');
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
  const colorCounts = { green: 0, yellow: 0, red: 0 };
  meals.forEach(m => {
    if (m.color === 'orange') colorCounts.red++;
    else if (colorCounts[m.color] !== undefined) colorCounts[m.color]++;
  });
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

  const addMealFromSaved = (meal) => {
    onUpdateField('meals', [...meals, { ...meal, time: meal.time || addMealType }]);
  };

  const addRecipeServing = (food) => {
    onUpdateField('meals', [...meals, { ...food, time: 'Lunch' }]);
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

      {/* Scan Food Button */}
      <button
        onClick={() => setShowScanner(true)}
        className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl shadow-sm p-4 flex items-center justify-center gap-3 hover:opacity-90 transition-all"
      >
        <Camera size={20} className="text-white" />
        <div className="text-left">
          <span className="text-sm font-semibold text-white block">Scan Your Food</span>
          <span className="text-xs text-white/80">Take a photo or search to log instantly</span>
        </div>
      </button>

      {/* My Recipes button */}
      <button
        onClick={() => setShowRecipes(true)}
        className="w-full bg-white rounded-2xl shadow-sm p-4 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
      >
        <UtensilsCrossed size={18} style={{ color: '#0D9488' }} />
        <span className="text-sm font-medium text-gray-700">My Recipes</span>
      </button>

      {/* Charts */}
      {historicalData && (
        <>
          <CalorieChart historicalData={historicalData} target={target} />
          <FoodColorPieChart historicalData={historicalData} />
        </>
      )}

      {/* Add Meal FAB */}
      <button
        onClick={() => { setAddMealType('Breakfast'); setShowAddModal(true); }}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white z-40 hover:opacity-90 transition-all"
        style={{ backgroundColor: '#0D9488' }}
      >
        <Plus size={24} />
      </button>

      {/* Saved Foods Modal (replaces old basic modal) */}
      {showAddModal && (
        <SavedFoodsModal
          mealType={addMealType}
          onAddMeal={addMealFromSaved}
          onClose={() => setShowAddModal(false)}
          historicalData={historicalData}
        />
      )}

      {/* Recipes Modal */}
      {showRecipes && (
        <Recipes
          onLogRecipe={addRecipeServing}
          onClose={() => setShowRecipes(false)}
        />
      )}

      {/* Food Scanner Modal */}
      {showScanner && (
        <FoodScanner
          mealType={addMealType}
          onAddMeal={addMealFromSaved}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
