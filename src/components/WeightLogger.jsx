import { useState, useMemo } from 'react';
import { X, TrendingDown, TrendingUp, Target } from 'lucide-react';

export default function WeightLogger({ data, profile, onUpdateField, historicalData, onClose }) {
  const [weight, setWeight] = useState(data?.weight?.value || '');
  const [notes, setNotes] = useState(data?.weight?.notes || '');

  const save = () => {
    onUpdateField('weight', { value: Number(weight), notes });
    onClose();
  };

  // Sparkline data from last 7 days
  const sparkData = useMemo(() => {
    return historicalData
      .filter(d => d?.weight?.value)
      .slice(-7)
      .map(d => d.weight.value);
  }, [historicalData]);

  const goalWeight = profile?.goalWeight;
  const currentWeight = Number(weight) || data?.weight?.value;
  const toGo = currentWeight && goalWeight ? (currentWeight - goalWeight).toFixed(1) : null;
  const isOnTrack = toGo !== null && sparkData.length >= 2 && sparkData[sparkData.length - 1] <= sparkData[0];

  // Simple SVG sparkline
  const sparkline = useMemo(() => {
    if (sparkData.length < 2) return null;
    const min = Math.min(...sparkData) - 2;
    const max = Math.max(...sparkData) + 2;
    const w = 120;
    const h = 40;
    const points = sparkData.map((v, i) => {
      const x = (i / (sparkData.length - 1)) * w;
      const y = h - ((v - min) / (max - min)) * h;
      return `${x},${y}`;
    }).join(' ');
    return { points, w, h };
  }, [sparkData]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Log Weight</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>

        {/* Sparkline */}
        {sparkline && (
          <div className="flex justify-center mb-4">
            <svg width={sparkline.w} height={sparkline.h}>
              <polyline
                points={sparkline.points}
                fill="none"
                stroke="#0D9488"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {sparkData.map((v, i) => (
                <circle
                  key={i}
                  cx={(i / (sparkData.length - 1)) * sparkline.w}
                  cy={sparkline.h - ((v - (Math.min(...sparkData) - 2)) / (Math.max(...sparkData) + 2 - (Math.min(...sparkData) - 2))) * sparkline.h}
                  r="3"
                  fill="#0D9488"
                />
              ))}
            </svg>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-xl text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="0.0"
            />
          </div>

          {toGo !== null && Number(toGo) > 0 && (
            <div className="flex items-center justify-center gap-2 text-sm">
              <Target size={16} style={{ color: '#0D9488' }} />
              <span className="text-gray-600">{toGo} kg to go!</span>
              {isOnTrack && (
                <span className="flex items-center gap-1 text-green-500">
                  <TrendingDown size={14} /> On track!
                </span>
              )}
            </div>
          )}

          {toGo !== null && Number(toGo) > 0 && Number(toGo) <= 2 && (
            <p className="text-center text-xs text-pink-500 font-medium">
              So close, Fatima! You can almost taste victory!
            </p>
          )}

          {toGo !== null && Number(toGo) <= 0 && (
            <p className="text-center text-sm font-medium" style={{ color: '#0D9488' }}>
              You've reached your goal! You incredible woman!
            </p>
          )}

          <input
            type="text"
            placeholder="Notes (optional)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
          />

          <button
            onClick={save}
            disabled={!weight}
            className="w-full py-3 text-white font-semibold rounded-xl disabled:opacity-50"
            style={{ backgroundColor: '#0D9488' }}
          >
            Save Weight
          </button>
        </div>
      </div>
    </div>
  );
}
