import { useState, useMemo } from 'react';
import { Heart, Wind, ClipboardList, Sparkles } from 'lucide-react';
import { MoodChart } from './Charts';

const GRATITUDE_SUGGESTIONS = [
  { emoji: '👶', label: 'My children' },
  { emoji: '💕', label: 'My husband' },
  { emoji: '🤲', label: 'My faith' },
  { emoji: '💪', label: 'My health' },
  { emoji: '✨', label: 'My beauty' },
  { emoji: '🏠', label: 'My home' },
  { emoji: '👨‍👩‍👧‍👦', label: 'My family' },
  { emoji: '🌅', label: 'A new day' },
  { emoji: '🍽️', label: 'Good food' },
  { emoji: '😊', label: 'My body' },
  { emoji: '🧘‍♀️', label: 'Inner peace' },
  { emoji: '👩‍❤️‍👩', label: 'My friends' },
  { emoji: '📿', label: 'My blessings' },
  { emoji: '💤', label: 'Good sleep' },
  { emoji: '🌸', label: 'Being alive' },
];

const MOODS = [
  { value: 'great', emoji: '😄', label: 'Great', num: 5 },
  { value: 'good', emoji: '🙂', label: 'Good', num: 4 },
  { value: 'okay', emoji: '😐', label: 'Okay', num: 3 },
  { value: 'low', emoji: '😟', label: 'Low', num: 2 },
  { value: 'bad', emoji: '😞', label: 'Bad', num: 1 },
];

export default function Wellbeing({ data, onUpdateField, historicalData, onOpenBreathing }) {
  const mood = data?.mood || { value: '', stressLevel: 5, journal: '', gratitudes: ['', '', ''] };

  const setMood = (value) => {
    onUpdateField('mood', { ...mood, value });
  };

  const setStress = (level) => {
    onUpdateField('mood', { ...mood, stressLevel: level });
  };

  const setGratitude = (idx, text) => {
    const newGrats = [...mood.gratitudes];
    newGrats[idx] = text;
    onUpdateField('mood', { ...mood, gratitudes: newGrats });
  };

  const setJournal = (text) => {
    onUpdateField('mood', { ...mood, journal: text });
  };

  // Mood history from last 7 days
  const moodHistory = useMemo(() => {
    return historicalData
      .filter(d => d?.mood?.value)
      .slice(-7)
      .map(d => ({
        date: d.date,
        mood: MOODS.find(m => m.value === d.mood.value),
        stress: d.mood.stressLevel,
      }));
  }, [historicalData]);

  const isSunday = new Date().getDay() === 0;

  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Mood Check-in */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">How are you feeling, {data?.date ? 'Fatima' : 'Fatima'}?</h3>
        <div className="flex justify-between mt-3">
          {MOODS.map(m => (
            <button
              key={m.value}
              onClick={() => setMood(m.value)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                mood.value === m.value ? 'ring-2' : ''
              }`}
              style={mood.value === m.value ? { '--tw-ring-color': '#0D9488', ringColor: '#0D9488' } : {}}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-xs text-gray-600">{m.label}</span>
              {mood.value === m.value && (
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#0D9488' }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Stress Level */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold text-gray-700">Stress Level</h3>
          <span
            className="text-lg font-bold px-2 py-0.5 rounded-lg"
            style={{
              color: mood.stressLevel <= 3 ? '#10B981' : mood.stressLevel <= 6 ? '#EAB308' : '#EF4444',
              backgroundColor: mood.stressLevel <= 3 ? '#D1FAE5' : mood.stressLevel <= 6 ? '#FEF9C3' : '#FEE2E2',
            }}
          >
            {mood.stressLevel}
          </span>
        </div>
        <input
          type="range" min="1" max="10" value={mood.stressLevel}
          onChange={e => setStress(Number(e.target.value))}
          className="w-full"
          style={{
            accentColor: mood.stressLevel <= 3 ? '#10B981' : mood.stressLevel <= 6 ? '#EAB308' : '#EF4444',
          }}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Calm</span>
          <span>Stressed</span>
        </div>
      </div>

      {/* Gratitude Journal */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-pink-400" />
          <h3 className="text-sm font-semibold text-gray-700">Today I'm grateful for...</h3>
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {GRATITUDE_SUGGESTIONS.map(s => {
            const isUsed = mood.gratitudes.includes(s.label);
            return (
              <button
                key={s.label}
                onClick={() => {
                  if (isUsed) return;
                  const emptyIdx = mood.gratitudes.findIndex(g => !g || !g.trim());
                  if (emptyIdx !== -1) setGratitude(emptyIdx, s.label);
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs transition-all border ${
                  isUsed
                    ? 'bg-pink-50 border-pink-200 text-pink-600'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-pink-50 hover:border-pink-200'
                }`}
              >
                <span>{s.emoji}</span>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          {[0, 1, 2].map(idx => (
            <div key={idx} className="flex items-center gap-2">
              <Heart size={14} className="text-pink-400 shrink-0" />
              <input
                type="text"
                value={mood.gratitudes[idx] || ''}
                onChange={e => setGratitude(idx, e.target.value)}
                placeholder={idx === 0 ? 'Tap a suggestion or type your own...' : `Gratitude ${idx + 1}`}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {mood.gratitudes[idx] && (
                <button
                  onClick={() => setGratitude(idx, '')}
                  className="text-gray-300 hover:text-gray-500 shrink-0"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        {mood.gratitudes.filter(g => g && g.trim()).length === 3 && (
          <p className="text-xs text-pink-400 mt-2 text-center">Beautiful! Gratitude is your superpower, Fatima.</p>
        )}
      </div>

      {/* Journal Entry */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Thoughts & Reflections</h3>
        <textarea
          value={mood.journal}
          onChange={e => setJournal(e.target.value)}
          placeholder="Write your thoughts..."
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          rows={4}
        />
        <p className="text-xs text-gray-400 text-right mt-1">
          {(mood.journal || '').split(/\s+/).filter(Boolean).length} words
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onOpenBreathing}
          className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors"
        >
          <Wind size={24} style={{ color: '#0D9488' }} />
          <span className="text-sm font-medium text-gray-700">Breathing Exercise</span>
        </button>
        <button
          className={`rounded-2xl shadow-sm p-4 flex flex-col items-center gap-2 transition-colors ${
            isSunday ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 opacity-50'
          }`}
          disabled={!isSunday}
        >
          <ClipboardList size={24} style={{ color: '#8B5CF6' }} />
          <span className="text-sm font-medium text-gray-700">Weekly Reflection</span>
          {!isSunday && <span className="text-xs text-gray-400">Available Sunday</span>}
        </button>
      </div>

      {/* Mood Chart */}
      <MoodChart historicalData={historicalData} />

      {/* Mood History */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Mood History</h3>
        {moodHistory.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No mood data yet. Start checking in daily!</p>
        ) : (
          <div className="space-y-2">
            {moodHistory.map((entry) => (
              <div key={entry.date} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-xs text-gray-500">{new Date(entry.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                <div className="flex items-center gap-3">
                  <span className="text-lg">{entry.mood?.emoji || '—'}</span>
                  <span className="text-xs text-gray-500">Stress: {entry.stress}/10</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
