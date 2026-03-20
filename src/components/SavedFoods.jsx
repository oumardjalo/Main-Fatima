import { useState, useEffect, useMemo } from 'react';
import { Star, Plus, X, Search, ChevronDown } from 'lucide-react';
import storage from '../utils/storage';
import { generateId } from '../utils/helpers';

export default function SavedFoodsModal({ onAddMeal, mealType, onClose, historicalData }) {
  const [activeTab, setActiveTab] = useState('quick');
  const [savedFoods, setSavedFoods] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Quick add form
  const [form, setForm] = useState({
    name: '', calories: '', protein: '', carbs: '', fat: '', color: 'green', favorite: false,
  });

  useEffect(() => {
    storage.get('saved-foods').then(data => setSavedFoods(data || []));
  }, []);

  // Recent foods from history
  const recentFoods = useMemo(() => {
    const seen = new Set();
    const recent = [];
    const allData = [...(historicalData || [])].reverse();
    for (const day of allData) {
      for (const meal of (day?.meals || [])) {
        if (!seen.has(meal.name)) {
          seen.add(meal.name);
          recent.push(meal);
          if (recent.length >= 20) break;
        }
      }
      if (recent.length >= 20) break;
    }
    return recent;
  }, [historicalData]);

  const favorites = savedFoods.filter(f => f.isFavorite);

  // Search/autocomplete for quick add
  const suggestions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    const results = [];
    // Favorites first
    favorites.forEach(f => { if (f.name.toLowerCase().includes(q)) results.push(f); });
    // Then recent
    recentFoods.forEach(f => { if (f.name.toLowerCase().includes(q) && !results.find(r => r.name === f.name)) results.push(f); });
    return results.slice(0, 5);
  }, [searchQuery, favorites, recentFoods]);

  const handleQuickAdd = () => {
    const food = {
      id: generateId(),
      name: form.name,
      calories: Number(form.calories) || 0,
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
      color: form.color,
      time: mealType,
    };

    // Save to favorites if toggled
    if (form.favorite) {
      const savedFood = { ...food, isFavorite: true };
      const updated = [...savedFoods, savedFood];
      setSavedFoods(updated);
      storage.set('saved-foods', updated);
    }

    onAddMeal(food);
    onClose();
  };

  const addFromSaved = (food) => {
    onAddMeal({
      id: generateId(),
      name: food.name,
      calories: food.calories || 0,
      protein: food.protein || 0,
      carbs: food.carbs || 0,
      fat: food.fat || 0,
      color: food.color || 'green',
      time: mealType,
    });
    onClose();
  };

  const toggleFavorite = async (food) => {
    const existing = savedFoods.find(f => f.name === food.name);
    if (existing) {
      const updated = savedFoods.filter(f => f.name !== food.name);
      setSavedFoods(updated);
      await storage.set('saved-foods', updated);
    } else {
      const newSaved = [...savedFoods, { ...food, isFavorite: true, id: generateId() }];
      setSavedFoods(newSaved);
      await storage.set('saved-foods', newSaved);
    }
  };

  const selectSuggestion = (food) => {
    setForm({
      name: food.name,
      calories: String(food.calories || ''),
      protein: String(food.protein || ''),
      carbs: String(food.carbs || ''),
      fat: String(food.fat || ''),
      color: food.color || 'green',
      favorite: false,
    });
    setSearchQuery('');
  };

  const FOOD_COLORS = [
    { id: 'green', label: 'Green', color: '#10B981' },
    { id: 'yellow', label: 'Yellow', color: '#EAB308' },
    { id: 'orange', label: 'Orange', color: '#F97316' },
  ];

  const isFaved = (name) => savedFoods.some(f => f.name === name && f.isFavorite);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="bg-white rounded-t-2xl w-full p-5 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Add to {mealType}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
          {[
            { id: 'quick', label: 'Quick Add' },
            { id: 'favorites', label: 'Favorites' },
            { id: 'recent', label: 'Recent' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === tab.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Quick Add Tab */}
        {activeTab === 'quick' && (
          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Food name"
                value={form.name}
                onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setSearchQuery(e.target.value); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => selectSuggestion(s)}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: FOOD_COLORS.find(c => c.id === s.color)?.color || '#9CA3AF' }} />
                        <span className="text-sm text-gray-700">{s.name}</span>
                      </div>
                      <span className="text-xs text-gray-400">{s.calories} kcal</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input type="number" placeholder="Calories" value={form.calories}
              onChange={e => setForm(f => ({ ...f, calories: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500" />

            <div className="grid grid-cols-3 gap-2">
              <input type="number" placeholder="Protein (g)" value={form.protein}
                onChange={e => setForm(f => ({ ...f, protein: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-xl text-sm" />
              <input type="number" placeholder="Carbs (g)" value={form.carbs}
                onChange={e => setForm(f => ({ ...f, carbs: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-xl text-sm" />
              <input type="number" placeholder="Fat (g)" value={form.fat}
                onChange={e => setForm(f => ({ ...f, fat: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-xl text-sm" />
            </div>

            <div className="flex gap-3">
              {FOOD_COLORS.map(fc => (
                <button key={fc.id} onClick={() => setForm(f => ({ ...f, color: fc.id }))}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all ${form.color === fc.id ? '' : 'border-gray-200'}`}
                  style={form.color === fc.id ? { borderColor: fc.color } : {}}>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: fc.color }} />
                  <span className="text-sm text-gray-700">{fc.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setForm(f => ({ ...f, favorite: !f.favorite }))}
              className="flex items-center gap-2 text-sm"
            >
              <Star size={16} fill={form.favorite ? '#F59E0B' : 'none'} color={form.favorite ? '#F59E0B' : '#D1D5DB'} />
              <span className="text-gray-600">{form.favorite ? 'Saved to favorites' : 'Save to favorites'}</span>
            </button>

            <button onClick={handleQuickAdd} disabled={!form.name || !form.calories}
              className="w-full py-3 text-white font-semibold rounded-xl disabled:opacity-50"
              style={{ backgroundColor: '#0D9488' }}>
              Add to {mealType}
            </button>
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div>
            {favorites.length === 0 ? (
              <div className="text-center py-8">
                <Star size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">No favorites yet.</p>
                <p className="text-xs text-gray-400">Star foods when adding to save them here.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {favorites.map(food => (
                  <div key={food.id || food.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: FOOD_COLORS.find(c => c.id === food.color)?.color || '#9CA3AF' }} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{food.name}</p>
                        <p className="text-xs text-gray-500">{food.calories} kcal</p>
                      </div>
                    </div>
                    <button onClick={() => addFromSaved(food)}
                      className="px-3 py-1.5 text-white text-xs font-medium rounded-lg"
                      style={{ backgroundColor: '#0D9488' }}>
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recent Tab */}
        {activeTab === 'recent' && (
          <div>
            {recentFoods.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400">No recent foods. Start logging meals!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentFoods.map((food, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: FOOD_COLORS.find(c => c.id === food.color)?.color || '#9CA3AF' }} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{food.name}</p>
                        <p className="text-xs text-gray-500">{food.calories} kcal</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => toggleFavorite(food)} className="p-1">
                        <Star size={14} fill={isFaved(food.name) ? '#F59E0B' : 'none'} color={isFaved(food.name) ? '#F59E0B' : '#D1D5DB'} />
                      </button>
                      <button onClick={() => addFromSaved(food)}
                        className="px-3 py-1.5 text-white text-xs font-medium rounded-lg"
                        style={{ backgroundColor: '#0D9488' }}>
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
