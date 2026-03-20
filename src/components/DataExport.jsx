import { useState } from 'react';
import { Download, Copy, Check, Loader } from 'lucide-react';
import storage from '../utils/storage';
import { formatDuration } from '../utils/helpers';

export default function DataExport() {
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateCSV = async () => {
    setExporting(true);
    try {
      const keys = await storage.list('daily:');
      keys.sort();

      const headers = [
        'Date', 'Weight', 'Calories', 'Protein', 'Carbs', 'Fat',
        'Water Glasses', 'Sleep Duration', 'Sleep Quality', 'Mood',
        'Stress', 'Active Minutes', 'Activities', 'Habits Completed %', 'Notes'
      ];

      const rows = [];
      for (const key of keys) {
        const d = await storage.get(key);
        if (!d) continue;

        const calories = (d.meals || []).reduce((s, m) => s + (m.calories || 0), 0);
        const protein = (d.meals || []).reduce((s, m) => s + (m.protein || 0), 0);
        const carbs = (d.meals || []).reduce((s, m) => s + (m.carbs || 0), 0);
        const fat = (d.meals || []).reduce((s, m) => s + (m.fat || 0), 0);
        const activeMin = (d.activities || []).reduce((s, a) => s + (a.duration || 0), 0);
        const activityCount = (d.activities || []).length;
        const habitPct = d.habits?.length > 0
          ? Math.round((d.habits.filter(h => h.completed).length / d.habits.length) * 100) : 0;
        const notes = [
          d.weight?.notes,
          d.sleep?.notes,
          d.mood?.journal,
        ].filter(Boolean).join('; ').replace(/"/g, '""');

        rows.push([
          d.date,
          d.weight?.value || '',
          calories,
          protein,
          carbs,
          fat,
          d.water?.glasses || 0,
          d.sleep?.duration ? d.sleep.duration.toFixed(1) : '',
          d.sleep?.quality || '',
          d.mood?.value || '',
          d.mood?.stressLevel || '',
          activeMin,
          activityCount,
          habitPct,
          `"${notes}"`,
        ].join(','));
      }

      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fatima-fit-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('Export error:', e);
    }
    setExporting(false);
  };

  const copySummary = async () => {
    try {
      const keys = await storage.list('daily:');
      keys.sort();
      const last7Keys = keys.slice(-7);
      const days = [];
      for (const key of last7Keys) {
        const d = await storage.get(key);
        if (d) days.push(d);
      }

      if (days.length === 0) {
        await navigator.clipboard.writeText('No data to summarize yet.');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }

      const avgCal = Math.round(days.reduce((s, d) => s + (d.meals || []).reduce((s2, m) => s2 + (m.calories || 0), 0), 0) / days.length);
      const sleepDays = days.filter(d => d.sleep?.duration > 0);
      const avgSleep = sleepDays.length > 0 ? sleepDays.reduce((s, d) => s + d.sleep.duration, 0) / sleepDays.length : 0;
      const totalMin = days.reduce((s, d) => s + (d.activities || []).reduce((s2, a) => s2 + (a.duration || 0), 0), 0);

      const text = [
        `FatimaFit - 7 Day Summary`,
        `Period: ${days[0]?.date} to ${days[days.length - 1]?.date}`,
        `---`,
        `Avg Daily Calories: ${avgCal}`,
        `Avg Sleep: ${formatDuration(avgSleep)}`,
        `Total Active Minutes: ${totalMin}`,
        `Days Tracked: ${days.length}`,
      ].join('\n');

      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={generateCSV}
        disabled={exporting}
        className="w-full flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        {exporting ? <Loader size={16} className="animate-spin" /> : <Download size={16} />}
        {exporting ? 'Preparing export...' : 'Export All Data (CSV)'}
      </button>
      <button
        onClick={copySummary}
        className="w-full flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
        {copied ? 'Copied!' : 'Copy 7-Day Summary'}
      </button>
    </div>
  );
}
