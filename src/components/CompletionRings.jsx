import { useEffect, useState } from 'react';

const RINGS = [
  { key: 'nutrition', label: 'Nutrition', color: '#0D9488', radius: 70 },
  { key: 'activity', label: 'Activity', color: '#F97316', radius: 58 },
  { key: 'wellbeing', label: 'Wellbeing', color: '#8B5CF6', radius: 46 },
  { key: 'sleep', label: 'Sleep', color: '#6366F1', radius: 34 },
  { key: 'habits', label: 'Habits', color: '#F59E0B', radius: 22 },
];

export default function CompletionRings({ percentages }) {
  const [animated, setAnimated] = useState({});
  const size = 180;
  const center = size / 2;
  const strokeWidth = 8;

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(percentages), 100);
    return () => clearTimeout(timer);
  }, [percentages]);

  const overall = Object.values(percentages).reduce((a, b) => a + b, 0) / 5;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {RINGS.map(ring => {
          const circumference = 2 * Math.PI * ring.radius;
          const pct = animated[ring.key] || 0;
          const dashOffset = circumference - (circumference * Math.min(pct, 100)) / 100;

          return (
            <g key={ring.key}>
              <circle
                cx={center} cy={center} r={ring.radius}
                fill="none" stroke="#E5E7EB" strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
              <circle
                cx={center} cy={center} r={ring.radius}
                fill="none" stroke={ring.color} strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                transform={`rotate(-90 ${center} ${center})`}
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
            </g>
          );
        })}
        <text x={center} y={center - 6} textAnchor="middle" className="text-2xl font-bold" fill="#111827" fontSize="24">
          {Math.round(overall)}%
        </text>
        <text x={center} y={center + 14} textAnchor="middle" fill="#6B7280" fontSize="11">
          complete
        </text>
      </svg>

      <div className="flex flex-wrap justify-center gap-3 mt-3">
        {RINGS.map(ring => (
          <div key={ring.key} className="flex items-center gap-1 text-xs text-gray-600">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ring.color }} />
            <span>{ring.label} {Math.round(percentages[ring.key] || 0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
