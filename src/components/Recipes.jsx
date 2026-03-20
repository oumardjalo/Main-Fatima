import { useState, useEffect } from 'react';
import { X, Plus, Trash2, ChefHat, UtensilsCrossed } from 'lucide-react';
import storage from '../utils/storage';
import { generateId } from '../utils/helpers';

export default function Recipes({ onLogRecipe, onClose }) {
  const [recipes, setRecipes] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [form, setForm] = useState({ name: '', servings: 2, ingredients: [] });
  const [ingredientForm, setIngredientForm] = useState({
    name: '', calories: '', protein: '', carbs: '', fat: '',
  });

  useEffect(() => {
    storage.get('recipes').then(data => setRecipes(data || []));
  }, []);

  const saveRecipes = async (updated) => {
    setRecipes(updated);
    await storage.set('recipes', updated);
  };

  const addIngredient = () => {
    if (!ingredientForm.name) return;
    const ingredient = {
      name: ingredientForm.name,
      calories: Number(ingredientForm.calories) || 0,
      protein: Number(ingredientForm.protein) || 0,
      carbs: Number(ingredientForm.carbs) || 0,
      fat: Number(ingredientForm.fat) || 0,
    };
    setForm(f => ({ ...f, ingredients: [...f.ingredients, ingredient] }));
    setIngredientForm({ name: '', calories: '', protein: '', carbs: '', fat: '' });
  };

  const removeIngredient = (idx) => {
    setForm(f => ({ ...f, ingredients: f.ingredients.filter((_, i) => i !== idx) }));
  };

  const saveRecipe = () => {
    if (!form.name || form.ingredients.length === 0) return;
    const totalNutrition = form.ingredients.reduce((acc, ing) => ({
      calories: acc.calories + ing.calories,
      protein: acc.protein + ing.protein,
      carbs: acc.carbs + ing.carbs,
      fat: acc.fat + ing.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const servings = Math.max(1, form.servings);
    const perServing = {
      calories: Math.round(totalNutrition.calories / servings),
      protein: Math.round(totalNutrition.protein / servings),
      carbs: Math.round(totalNutrition.carbs / servings),
      fat: Math.round(totalNutrition.fat / servings),
    };

    const recipe = {
      id: generateId(),
      name: form.name,
      servings,
      ingredients: form.ingredients,
      totalNutrition,
      perServing,
    };

    saveRecipes([...recipes, recipe]);
    setForm({ name: '', servings: 2, ingredients: [] });
    setShowCreate(false);
  };

  const deleteRecipe = (id) => {
    saveRecipes(recipes.filter(r => r.id !== id));
    setSelectedRecipe(null);
  };

  const logRecipeServing = (recipe) => {
    onLogRecipe({
      id: generateId(),
      name: `${recipe.name} (1 serving)`,
      calories: recipe.perServing.calories,
      protein: recipe.perServing.protein,
      carbs: recipe.perServing.carbs,
      fat: recipe.perServing.fat,
      color: 'green',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="max-w-lg mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">My Recipes</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>

        {/* Recipe Detail */}
        {selectedRecipe && !showCreate && (
          <div className="mb-6">
            <button onClick={() => setSelectedRecipe(null)} className="text-sm mb-3" style={{ color: '#0D9488' }}>
              ← Back to recipes
            </button>
            <div className="bg-gray-50 rounded-2xl p-4">
              <h3 className="text-lg font-semibold text-gray-900">{selectedRecipe.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{selectedRecipe.servings} servings</p>

              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { label: 'Calories', value: selectedRecipe.perServing.calories, unit: 'kcal' },
                  { label: 'Protein', value: selectedRecipe.perServing.protein, unit: 'g' },
                  { label: 'Carbs', value: selectedRecipe.perServing.carbs, unit: 'g' },
                  { label: 'Fat', value: selectedRecipe.perServing.fat, unit: 'g' },
                ].map(n => (
                  <div key={n.label} className="text-center bg-white rounded-xl p-2">
                    <p className="text-xs text-gray-500">{n.label}</p>
                    <p className="text-sm font-bold text-gray-900">{n.value}{n.unit}</p>
                  </div>
                ))}
              </div>

              <h4 className="text-sm font-medium text-gray-700 mb-2">Ingredients</h4>
              <div className="space-y-1 mb-4">
                {selectedRecipe.ingredients.map((ing, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-700">{ing.name}</span>
                    <span className="text-gray-400">{ing.calories} kcal</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button onClick={() => logRecipeServing(selectedRecipe)}
                  className="flex-1 py-2 text-white font-medium rounded-xl" style={{ backgroundColor: '#0D9488' }}>
                  Log 1 Serving
                </button>
                <button onClick={() => deleteRecipe(selectedRecipe.id)}
                  className="px-4 py-2 text-red-500 border border-red-200 rounded-xl">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Recipe Form */}
        {showCreate && (
          <div className="mb-6">
            <button onClick={() => setShowCreate(false)} className="text-sm mb-3" style={{ color: '#0D9488' }}>
              ← Back to recipes
            </button>
            <div className="space-y-3">
              <input type="text" placeholder="Recipe name" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl" />

              <div>
                <label className="text-sm text-gray-600 mb-1 block">Servings</label>
                <input type="number" min="1" value={form.servings}
                  onChange={e => setForm(f => ({ ...f, servings: Number(e.target.value) || 1 }))}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-xl text-sm" />
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Ingredients ({form.ingredients.length})</h4>
                {form.ingredients.map((ing, i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-b border-gray-100">
                    <span className="text-sm text-gray-700">{ing.name} — {ing.calories} kcal</span>
                    <button onClick={() => removeIngredient(i)} className="text-gray-400 hover:text-red-400"><X size={14} /></button>
                  </div>
                ))}

                <div className="mt-2 p-3 bg-gray-50 rounded-xl space-y-2">
                  <input type="text" placeholder="Ingredient name" value={ingredientForm.name}
                    onChange={e => setIngredientForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm" />
                  <div className="grid grid-cols-4 gap-1">
                    <input type="number" placeholder="Cal" value={ingredientForm.calories}
                      onChange={e => setIngredientForm(f => ({ ...f, calories: e.target.value }))}
                      className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs" />
                    <input type="number" placeholder="Pro" value={ingredientForm.protein}
                      onChange={e => setIngredientForm(f => ({ ...f, protein: e.target.value }))}
                      className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs" />
                    <input type="number" placeholder="Carb" value={ingredientForm.carbs}
                      onChange={e => setIngredientForm(f => ({ ...f, carbs: e.target.value }))}
                      className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs" />
                    <input type="number" placeholder="Fat" value={ingredientForm.fat}
                      onChange={e => setIngredientForm(f => ({ ...f, fat: e.target.value }))}
                      className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs" />
                  </div>
                  <button onClick={addIngredient} disabled={!ingredientForm.name}
                    className="w-full py-1.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50">
                    + Add Ingredient
                  </button>
                </div>
              </div>

              {form.ingredients.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Per serving ({form.servings} servings):</p>
                  <p className="text-sm font-medium text-gray-900">
                    {Math.round(form.ingredients.reduce((s, i) => s + i.calories, 0) / Math.max(1, form.servings))} kcal |
                    P: {Math.round(form.ingredients.reduce((s, i) => s + i.protein, 0) / Math.max(1, form.servings))}g |
                    C: {Math.round(form.ingredients.reduce((s, i) => s + i.carbs, 0) / Math.max(1, form.servings))}g |
                    F: {Math.round(form.ingredients.reduce((s, i) => s + i.fat, 0) / Math.max(1, form.servings))}g
                  </p>
                </div>
              )}

              <button onClick={saveRecipe} disabled={!form.name || form.ingredients.length === 0}
                className="w-full py-3 text-white font-semibold rounded-xl disabled:opacity-50"
                style={{ backgroundColor: '#0D9488' }}>
                Save Recipe
              </button>
            </div>
          </div>
        )}

        {/* Recipe List */}
        {!showCreate && !selectedRecipe && (
          <>
            {recipes.length === 0 ? (
              <div className="text-center py-12">
                <UtensilsCrossed size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-400 mb-1">No recipes yet</p>
                <p className="text-sm text-gray-400 mb-4">Create recipes to quickly log meals</p>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                {recipes.map(recipe => (
                  <button
                    key={recipe.id}
                    onClick={() => setSelectedRecipe(recipe)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{recipe.name}</p>
                      <p className="text-xs text-gray-500">{recipe.perServing.calories} kcal/serving · {recipe.servings} servings</p>
                    </div>
                    <span className="text-xs text-gray-400">{recipe.ingredients.length} ingredients</span>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowCreate(true)}
              className="w-full py-3 flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-500 hover:border-teal-400 hover:text-teal-600 transition-colors"
            >
              <Plus size={18} /> Create New Recipe
            </button>
          </>
        )}
      </div>
    </div>
  );
}
