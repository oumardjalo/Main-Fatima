import { createContext, useContext, useState, useEffect } from 'react';
import storage from '../utils/storage';

const ACCENT_COLORS = [
  { id: 'teal', color: '#0D9488', label: 'Teal' },
  { id: 'coral', color: '#F97316', label: 'Coral' },
  { id: 'purple', color: '#8B5CF6', label: 'Purple' },
  { id: 'blue', color: '#3B82F6', label: 'Blue' },
  { id: 'pink', color: '#EC4899', label: 'Pink' },
  { id: 'green', color: '#10B981', label: 'Green' },
];

const ThemeContext = createContext({
  isDark: false,
  accent: '#0D9488',
  accentId: 'teal',
  toggleDark: () => {},
  setAccent: () => {},
  accentOptions: ACCENT_COLORS,
});

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const [accentId, setAccentId] = useState('teal');

  useEffect(() => {
    storage.get('theme').then(t => {
      if (t) {
        setIsDark(t.isDark || false);
        setAccentId(t.accentId || 'teal');
      }
    });
  }, []);

  const accent = ACCENT_COLORS.find(c => c.id === accentId)?.color || '#0D9488';

  const toggleDark = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    storage.set('theme', { isDark: newDark, accentId });
  };

  const setAccentColor = (id) => {
    setAccentId(id);
    storage.set('theme', { isDark, accentId: id });
  };

  // Apply dark mode to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, accent, accentId, toggleDark, setAccent: setAccentColor, accentOptions: ACCENT_COLORS }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeSettings() {
  const { isDark, accentId, toggleDark, setAccent, accentOptions } = useTheme();

  return (
    <div className="space-y-4">
      {/* Dark mode toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700">Dark Mode</span>
        <button
          onClick={toggleDark}
          className={`w-12 h-6 rounded-full transition-colors relative ${isDark ? 'bg-teal-500' : 'bg-gray-300'}`}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${isDark ? 'translate-x-6' : 'translate-x-0.5'}`}
          />
        </button>
      </div>

      {/* Accent color */}
      <div>
        <span className="text-sm text-gray-700 block mb-2">Accent Color</span>
        <div className="flex gap-3">
          {accentOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => setAccent(opt.id)}
              className={`w-8 h-8 rounded-full transition-all ${accentId === opt.id ? 'ring-2 ring-offset-2' : ''}`}
              style={{ backgroundColor: opt.color, '--tw-ring-color': opt.color }}
              title={opt.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
