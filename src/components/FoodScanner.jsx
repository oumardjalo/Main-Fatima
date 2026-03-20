import { useState, useRef } from 'react';
import { Camera, X, Search, ArrowRight, Leaf, AlertTriangle, Heart } from 'lucide-react';
import { generateId } from '../utils/helpers';

// Common food database with traffic light ratings
const FOOD_DATABASE = [
  // GREEN - nutrient-dense, go for it!
  { name: 'Grilled Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, color: 'green', category: 'Protein' },
  { name: 'Salmon Fillet', calories: 208, protein: 20, carbs: 0, fat: 13, color: 'green', category: 'Protein' },
  { name: 'Mixed Salad', calories: 45, protein: 2, carbs: 8, fat: 0.5, color: 'green', category: 'Vegetables' },
  { name: 'Steamed Broccoli', calories: 55, protein: 3.7, carbs: 11, fat: 0.6, color: 'green', category: 'Vegetables' },
  { name: 'Grilled Vegetables', calories: 80, protein: 2, carbs: 12, fat: 3, color: 'green', category: 'Vegetables' },
  { name: 'Brown Rice', calories: 216, protein: 5, carbs: 45, fat: 1.8, color: 'green', category: 'Grains' },
  { name: 'Quinoa Bowl', calories: 222, protein: 8, carbs: 39, fat: 3.5, color: 'green', category: 'Grains' },
  { name: 'Oatmeal', calories: 150, protein: 5, carbs: 27, fat: 2.5, color: 'green', category: 'Grains' },
  { name: 'Greek Yoghurt', calories: 100, protein: 17, carbs: 6, fat: 0.7, color: 'green', category: 'Dairy' },
  { name: 'Eggs (2)', calories: 143, protein: 13, carbs: 1, fat: 10, color: 'green', category: 'Protein' },
  { name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, color: 'green', category: 'Fruit' },
  { name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, color: 'green', category: 'Fruit' },
  { name: 'Mixed Berries', calories: 70, protein: 1, carbs: 17, fat: 0.5, color: 'green', category: 'Fruit' },
  { name: 'Avocado (half)', calories: 120, protein: 1.5, carbs: 6, fat: 11, color: 'green', category: 'Healthy Fats' },
  { name: 'Hummus & Veg Sticks', calories: 150, protein: 5, carbs: 15, fat: 8, color: 'green', category: 'Snacks' },
  { name: 'Lentil Soup', calories: 180, protein: 12, carbs: 30, fat: 2, color: 'green', category: 'Soups' },
  { name: 'Grilled Fish', calories: 150, protein: 26, carbs: 0, fat: 5, color: 'green', category: 'Protein' },
  { name: 'Sweet Potato', calories: 103, protein: 2, carbs: 24, fat: 0.1, color: 'green', category: 'Vegetables' },
  { name: 'Chicken Salad', calories: 200, protein: 25, carbs: 8, fat: 8, color: 'green', category: 'Meals' },
  { name: 'Smoothie (fruit & veg)', calories: 180, protein: 5, carbs: 35, fat: 2, color: 'green', category: 'Drinks' },

  // AMBER/YELLOW - moderate, enjoy in balance
  { name: 'Pasta (white)', calories: 320, protein: 11, carbs: 63, fat: 1.5, color: 'yellow', category: 'Grains' },
  { name: 'White Rice', calories: 240, protein: 4.4, carbs: 53, fat: 0.4, color: 'yellow', category: 'Grains' },
  { name: 'Cheese Sandwich', calories: 350, protein: 15, carbs: 35, fat: 16, color: 'yellow', category: 'Meals' },
  { name: 'Wrap / Tortilla', calories: 300, protein: 12, carbs: 40, fat: 10, color: 'yellow', category: 'Meals' },
  { name: 'Cereal with Milk', calories: 280, protein: 8, carbs: 48, fat: 5, color: 'yellow', category: 'Breakfast' },
  { name: 'Toast with Butter', calories: 200, protein: 4, carbs: 25, fat: 9, color: 'yellow', category: 'Breakfast' },
  { name: 'Fruit Juice', calories: 140, protein: 1, carbs: 34, fat: 0, color: 'yellow', category: 'Drinks' },
  { name: 'Granola Bar', calories: 190, protein: 3, carbs: 29, fat: 7, color: 'yellow', category: 'Snacks' },
  { name: 'Rice & Curry', calories: 400, protein: 15, carbs: 55, fat: 12, color: 'yellow', category: 'Meals' },
  { name: 'Sushi (6 pieces)', calories: 290, protein: 12, carbs: 45, fat: 5, color: 'yellow', category: 'Meals' },
  { name: 'Soup (creamy)', calories: 220, protein: 6, carbs: 18, fat: 14, color: 'yellow', category: 'Soups' },
  { name: 'Flatbread', calories: 260, protein: 7, carbs: 45, fat: 5, color: 'yellow', category: 'Grains' },
  { name: 'Dates (3)', calories: 200, protein: 2, carbs: 54, fat: 0.4, color: 'yellow', category: 'Fruit' },
  { name: 'Peanut Butter Toast', calories: 280, protein: 10, carbs: 28, fat: 15, color: 'yellow', category: 'Breakfast' },

  // RED - calorie-dense, be mindful
  { name: 'Burger', calories: 540, protein: 25, carbs: 40, fat: 30, color: 'red', category: 'Fast Food' },
  { name: 'Pizza (2 slices)', calories: 570, protein: 20, carbs: 60, fat: 26, color: 'red', category: 'Fast Food' },
  { name: 'Fried Chicken', calories: 480, protein: 28, carbs: 16, fat: 34, color: 'red', category: 'Fast Food' },
  { name: 'Chips / Fries', calories: 365, protein: 4, carbs: 48, fat: 17, color: 'red', category: 'Fast Food' },
  { name: 'Chocolate Bar', calories: 250, protein: 3, carbs: 30, fat: 14, color: 'red', category: 'Sweets' },
  { name: 'Ice Cream (scoop)', calories: 270, protein: 5, carbs: 32, fat: 14, color: 'red', category: 'Sweets' },
  { name: 'Cake (slice)', calories: 350, protein: 4, carbs: 50, fat: 15, color: 'red', category: 'Sweets' },
  { name: 'Crisps / Chips (bag)', calories: 300, protein: 4, carbs: 30, fat: 19, color: 'red', category: 'Snacks' },
  { name: 'Doughnut', calories: 290, protein: 4, carbs: 33, fat: 16, color: 'red', category: 'Sweets' },
  { name: 'Fizzy Drink (can)', calories: 140, protein: 0, carbs: 39, fat: 0, color: 'red', category: 'Drinks' },
  { name: 'Shawarma / Kebab', calories: 500, protein: 22, carbs: 42, fat: 26, color: 'red', category: 'Fast Food' },
  { name: 'Fried Rice', calories: 420, protein: 10, carbs: 55, fat: 18, color: 'red', category: 'Meals' },
  { name: 'Creamy Pasta', calories: 480, protein: 15, carbs: 55, fat: 22, color: 'red', category: 'Meals' },
  { name: 'Muffin', calories: 340, protein: 5, carbs: 45, fat: 16, color: 'red', category: 'Sweets' },
  { name: 'Milkshake', calories: 400, protein: 10, carbs: 60, fat: 14, color: 'red', category: 'Drinks' },
  { name: 'Biscuits (3)', calories: 210, protein: 2, carbs: 28, fat: 10, color: 'red', category: 'Sweets' },
];

// Green alternatives for red foods
const GREEN_ALTERNATIVES = {
  'Burger': ['Grilled Chicken Breast', 'Chicken Salad', 'Lentil Soup'],
  'Pizza (2 slices)': ['Grilled Vegetables', 'Wrap / Tortilla', 'Flatbread'],
  'Fried Chicken': ['Grilled Chicken Breast', 'Grilled Fish', 'Salmon Fillet'],
  'Chips / Fries': ['Sweet Potato', 'Hummus & Veg Sticks', 'Steamed Broccoli'],
  'Chocolate Bar': ['Mixed Berries', 'Apple', 'Dates (3)'],
  'Ice Cream (scoop)': ['Greek Yoghurt', 'Smoothie (fruit & veg)', 'Mixed Berries'],
  'Cake (slice)': ['Banana', 'Oatmeal', 'Greek Yoghurt'],
  'Crisps / Chips (bag)': ['Hummus & Veg Sticks', 'Mixed Berries', 'Apple'],
  'Doughnut': ['Oatmeal', 'Peanut Butter Toast', 'Banana'],
  'Fizzy Drink (can)': ['Smoothie (fruit & veg)', 'Fruit Juice', 'Water'],
  'Shawarma / Kebab': ['Chicken Salad', 'Grilled Chicken Breast', 'Lentil Soup'],
  'Fried Rice': ['Brown Rice', 'Quinoa Bowl', 'Rice & Curry'],
  'Creamy Pasta': ['Lentil Soup', 'Chicken Salad', 'Grilled Fish'],
  'Muffin': ['Oatmeal', 'Toast with Butter', 'Banana'],
  'Milkshake': ['Smoothie (fruit & veg)', 'Greek Yoghurt', 'Mixed Berries'],
  'Biscuits (3)': ['Apple', 'Dates (3)', 'Mixed Berries'],
};

const TRAFFIC_COLORS = {
  green: { bg: '#D1FAE5', color: '#059669', label: 'Green', desc: 'Great choice! Nutrient-dense and nourishing.' },
  yellow: { bg: '#FEF3C3', color: '#CA8A04', label: 'Amber', desc: 'Moderate — enjoy in balance.' },
  red: { bg: '#FEE2E2', color: '#DC2626', label: 'Red', desc: 'Calorie-dense — be mindful with portions.' },
};

const ENCOURAGEMENTS_ALREADY_EATEN = [
  "No worries at all, Fatima! One meal doesn't define your day. Let's make the rest of today green and wonderful!",
  "It's okay! You enjoyed it, and that's fine. For the rest of today, let's fill your plate with green goodness!",
  "Life is about balance. You had that, now let's fuel your beautiful body with nourishing food for the rest of the day!",
  "Don't stress, queen! What's done is done with love. Let's make your next meal a green powerhouse!",
  "That's perfectly fine! We all enjoy treats. From this moment, let's choose foods that make your body sing!",
];

export default function FoodScanner({ mealType, onAddMeal, onClose }) {
  const [stage, setStage] = useState('capture'); // capture, identify, confirm, red-check
  const [photoUrl, setPhotoUrl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [redResponse, setRedResponse] = useState(null); // 'not-yet' | 'already-eaten'
  const fileInputRef = useRef(null);

  const handleCapture = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
      setStage('identify');
    }
  };

  const filteredFoods = FOOD_DATABASE.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectFood = (food) => {
    setSelectedFood(food);
    if (food.color === 'red') {
      setStage('red-check');
    } else {
      setStage('confirm');
    }
  };

  const addFoodToLog = (food) => {
    onAddMeal({
      id: generateId(),
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      color: food.color,
      time: mealType,
    });
    onClose();
  };

  const getAlternatives = (foodName) => {
    const altNames = GREEN_ALTERNATIVES[foodName] || ['Grilled Chicken Breast', 'Mixed Salad', 'Grilled Fish'];
    return altNames.map(name => FOOD_DATABASE.find(f => f.name === name)).filter(Boolean);
  };

  const randomEncouragement = ENCOURAGEMENTS_ALREADY_EATEN[Math.floor(Math.random() * ENCOURAGEMENTS_ALREADY_EATEN.length)];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="bg-white rounded-t-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <Camera size={20} style={{ color: '#0D9488' }} />
            <h3 className="text-lg font-semibold text-gray-900">Food Scanner</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>

        <div className="p-5">
          {/* Stage 1: Capture Photo */}
          {stage === 'capture' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-teal-400 transition-colors"
              >
                <Camera size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-700">Take a photo of your food</p>
                <p className="text-xs text-gray-400 mt-1">Tap to open camera</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCapture}
                className="hidden"
              />
              <button
                onClick={() => setStage('identify')}
                className="w-full py-3 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Or search without photo
              </button>
            </div>
          )}

          {/* Stage 2: Identify Food */}
          {stage === 'identify' && (
            <div className="space-y-4">
              {photoUrl && (
                <div className="relative rounded-2xl overflow-hidden mb-4">
                  <img src={photoUrl} alt="Food" className="w-full h-48 object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <p className="text-white text-sm font-medium">What did you have?</p>
                  </div>
                </div>
              )}

              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search for your food..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  autoFocus
                />
              </div>

              {/* Category Quick Filters */}
              {!searchQuery && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Quick select by category</p>
                  {['Protein', 'Vegetables', 'Grains', 'Fruit', 'Meals', 'Snacks', 'Fast Food', 'Sweets', 'Drinks'].map(cat => {
                    const catFoods = FOOD_DATABASE.filter(f => f.category === cat);
                    if (catFoods.length === 0) return null;
                    return (
                      <div key={cat}>
                        <p className="text-xs font-medium text-gray-600 mb-1">{cat}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {catFoods.map(food => (
                            <button
                              key={food.name}
                              onClick={() => selectFood(food)}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition-all hover:shadow-sm"
                              style={{
                                backgroundColor: TRAFFIC_COLORS[food.color].bg,
                                borderColor: TRAFFIC_COLORS[food.color].color + '30',
                                color: TRAFFIC_COLORS[food.color].color,
                              }}
                            >
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: TRAFFIC_COLORS[food.color].color }} />
                              {food.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Search Results */}
              {searchQuery && (
                <div className="space-y-1">
                  {filteredFoods.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No matches found. Try a different search.</p>
                  ) : (
                    filteredFoods.map(food => (
                      <button
                        key={food.name}
                        onClick={() => selectFood(food)}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: TRAFFIC_COLORS[food.color].color }}
                          />
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-800">{food.name}</p>
                            <p className="text-xs text-gray-400">{food.category}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">{food.calories} kcal</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Stage 3: Confirm Green/Amber food */}
          {stage === 'confirm' && selectedFood && (
            <div className="space-y-4">
              <div
                className="rounded-2xl p-5 text-center"
                style={{ backgroundColor: TRAFFIC_COLORS[selectedFood.color].bg }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: TRAFFIC_COLORS[selectedFood.color].color + '20' }}
                >
                  {selectedFood.color === 'green' ? (
                    <Leaf size={24} style={{ color: TRAFFIC_COLORS[selectedFood.color].color }} />
                  ) : (
                    <AlertTriangle size={24} style={{ color: TRAFFIC_COLORS[selectedFood.color].color }} />
                  )}
                </div>
                <div
                  className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-2"
                  style={{ backgroundColor: TRAFFIC_COLORS[selectedFood.color].color, color: 'white' }}
                >
                  {TRAFFIC_COLORS[selectedFood.color].label}
                </div>
                <h4 className="text-lg font-bold text-gray-900">{selectedFood.name}</h4>
                <p className="text-sm mt-1" style={{ color: TRAFFIC_COLORS[selectedFood.color].color }}>
                  {TRAFFIC_COLORS[selectedFood.color].desc}
                </p>
              </div>

              {/* Nutrition Info */}
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-gray-900">{selectedFood.calories}</p>
                  <p className="text-xs text-gray-500">kcal</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-blue-600">{selectedFood.protein}g</p>
                  <p className="text-xs text-gray-500">Protein</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-green-600">{selectedFood.carbs}g</p>
                  <p className="text-xs text-gray-500">Carbs</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-orange-500">{selectedFood.fat}g</p>
                  <p className="text-xs text-gray-500">Fat</p>
                </div>
              </div>

              {selectedFood.color === 'green' && (
                <p className="text-sm text-center text-green-600 font-medium">
                  Amazing choice, Fatima! Your body will love this!
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setStage('identify'); setSelectedFood(null); }}
                  className="flex-1 py-3 text-gray-600 font-medium border border-gray-200 rounded-xl hover:bg-gray-50"
                >
                  Change
                </button>
                <button
                  onClick={() => addFoodToLog(selectedFood)}
                  className="flex-1 py-3 text-white font-semibold rounded-xl"
                  style={{ backgroundColor: '#0D9488' }}
                >
                  Log to {mealType}
                </button>
              </div>
            </div>
          )}

          {/* Stage 4: Red food — ask if eaten yet */}
          {stage === 'red-check' && selectedFood && !redResponse && (
            <div className="space-y-4">
              <div className="rounded-2xl p-5 text-center" style={{ backgroundColor: '#FEE2E2' }}>
                <AlertTriangle size={32} className="mx-auto mb-2 text-red-500" />
                <div className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 bg-red-500 text-white">
                  Red
                </div>
                <h4 className="text-lg font-bold text-gray-900">{selectedFood.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{selectedFood.calories} kcal</p>
              </div>

              <div className="bg-amber-50 rounded-2xl p-4">
                <p className="text-sm text-amber-800 font-medium text-center">
                  Have you already eaten this, Fatima?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setRedResponse('not-yet')}
                  className="py-4 rounded-xl border-2 border-green-200 bg-green-50 text-center hover:border-green-400 transition-colors"
                >
                  <p className="text-sm font-semibold text-green-700">Not yet</p>
                  <p className="text-xs text-green-600 mt-0.5">Show me better options</p>
                </button>
                <button
                  onClick={() => setRedResponse('already-eaten')}
                  className="py-4 rounded-xl border-2 border-gray-200 bg-gray-50 text-center hover:border-gray-400 transition-colors"
                >
                  <p className="text-sm font-semibold text-gray-700">Already had it</p>
                  <p className="text-xs text-gray-500 mt-0.5">Log it anyway</p>
                </button>
              </div>
            </div>
          )}

          {/* Red food — NOT YET eaten: show green alternatives */}
          {stage === 'red-check' && redResponse === 'not-yet' && selectedFood && (
            <div className="space-y-4">
              <div className="bg-green-50 rounded-2xl p-4 text-center">
                <Leaf size={24} className="mx-auto mb-2 text-green-600" />
                <p className="text-sm font-semibold text-green-700">
                  Great decision, Fatima! Here are some delicious alternatives:
                </p>
              </div>

              <div className="space-y-2">
                {getAlternatives(selectedFood.name).map(alt => (
                  <button
                    key={alt.name}
                    onClick={() => { setSelectedFood(alt); setRedResponse(null); setStage('confirm'); }}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-green-50 border border-green-200 hover:bg-green-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-800">{alt.name}</p>
                        <p className="text-xs text-gray-500">{alt.protein}g protein · {alt.calories} kcal</p>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-green-500" />
                  </button>
                ))}
              </div>

              <button
                onClick={() => { setRedResponse(null); setStage('identify'); setSelectedFood(null); }}
                className="w-full py-3 text-sm text-gray-500 hover:text-gray-700"
              >
                Search for something else
              </button>
            </div>
          )}

          {/* Red food — ALREADY EATEN: encourage and log */}
          {stage === 'red-check' && redResponse === 'already-eaten' && selectedFood && (
            <div className="space-y-4">
              <div className="rounded-2xl p-5 text-center bg-gradient-to-b from-pink-50 to-green-50">
                <Heart size={28} className="mx-auto mb-2 text-pink-400" />
                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                  {randomEncouragement}
                </p>
              </div>

              {/* Nutrition Info */}
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-gray-900">{selectedFood.calories}</p>
                  <p className="text-xs text-gray-500">kcal</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-blue-600">{selectedFood.protein}g</p>
                  <p className="text-xs text-gray-500">Protein</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-green-600">{selectedFood.carbs}g</p>
                  <p className="text-xs text-gray-500">Carbs</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-orange-500">{selectedFood.fat}g</p>
                  <p className="text-xs text-gray-500">Fat</p>
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-xs font-medium text-green-700">
                  For the rest of today, let's aim for green foods only. You've got this!
                </p>
              </div>

              <button
                onClick={() => addFoodToLog(selectedFood)}
                className="w-full py-3 text-white font-semibold rounded-xl"
                style={{ backgroundColor: '#0D9488' }}
              >
                Log & Move Forward
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
