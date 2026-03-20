import { useState, useEffect } from 'react';
import { BookOpen, Check, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { LESSONS } from '../data/lessons';
import storage from '../utils/storage';

const CATEGORY_COLORS = {
  'Nutrition Psychology': '#0D9488',
  'Movement & Energy': '#F97316',
  'Sleep Science': '#6366F1',
  'Mindset & Habits': '#F59E0B',
  'Self-Compassion': '#EC4899',
};

export default function MicroLesson() {
  const [expanded, setExpanded] = useState(false);
  const [read, setRead] = useState(false);

  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const lesson = LESSONS[dayOfYear % LESSONS.length];
  const color = CATEGORY_COLORS[lesson.category] || '#0D9488';

  useEffect(() => {
    storage.get('lessons-read').then(data => {
      if (data && data[lesson.id]) setRead(true);
    });
  }, [lesson.id]);

  const markRead = async () => {
    const data = (await storage.get('lessons-read')) || {};
    data[lesson.id] = new Date().toISOString();
    await storage.set('lessons-read', data);
    setRead(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={() => { setExpanded(!expanded); if (!expanded && !read) markRead(); }}
        className="w-full p-4 flex items-start gap-3 text-left"
      >
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: color + '20' }}>
          <BookOpen size={18} style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ backgroundColor: color + '15', color }}>
              {lesson.category}
            </span>
            {read && <Check size={12} className="text-green-500" />}
          </div>
          <p className="text-sm font-medium text-gray-900">{lesson.title}</p>
        </div>
        {expanded ? <ChevronUp size={18} className="text-gray-400 shrink-0" /> : <ChevronDown size={18} className="text-gray-400 shrink-0" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-50">
          <p className="text-sm text-gray-600 mt-3 leading-relaxed">{lesson.body}</p>
          <div className="mt-3 flex items-start gap-2 bg-gray-50 rounded-xl p-3">
            <Lightbulb size={14} style={{ color }} className="shrink-0 mt-0.5" />
            <p className="text-xs text-gray-600"><span className="font-medium">Try this:</span> {lesson.actionTip}</p>
          </div>
          {read && (
            <p className="text-xs text-center mt-3" style={{ color }}>Lesson complete!</p>
          )}
        </div>
      )}
    </div>
  );
}
