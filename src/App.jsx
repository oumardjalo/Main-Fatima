import { useState, useEffect, useMemo, useCallback } from 'react';
import { LayoutDashboard, Apple, Dumbbell, Heart, Moon, Settings as SettingsIcon } from 'lucide-react';
import { useDailyData, useProfile, useHistoricalData } from './hooks/useDailyData';
import { getTodayKey, getYesterdayKey, getDateRange, DEFAULT_HABITS } from './utils/helpers';
import storage from './utils/storage';

import ProfileSetup from './components/ProfileSetup';
import Dashboard from './components/Dashboard';
import Nutrition from './components/Nutrition';
import Activity from './components/Activity';
import Wellbeing from './components/Wellbeing';
import Sleep from './components/Sleep';
import SettingsScreen from './components/Settings';
import WeightLogger from './components/WeightLogger';
import BreathingExercise from './components/BreathingExercise';
import WeeklyReport from './components/WeeklyReport';
import { useAchievements, AchievementCelebration, AchievementGallery } from './components/Achievements';
import { useCorrelationInsights } from './components/Correlations';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'nutrition', label: 'Nutrition', icon: Apple },
  { id: 'activity', label: 'Activity', icon: Dumbbell },
  { id: 'wellbeing', label: 'Wellbeing', icon: Heart },
  { id: 'sleep', label: 'Sleep', icon: Moon },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [showWeightLogger, setShowWeightLogger] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayKey());

  const todayKey = getTodayKey();
  const yesterdayKey = getYesterdayKey();

  const { profile, loading: profileLoading, saveProfile } = useProfile();
  const { data: todayData, loading: todayLoading, updateField, saveImmediate } = useDailyData(todayKey);
  const { data: yesterdayData, updateField: updateYesterdayField } = useDailyData(yesterdayKey);

  // For activity screen, load selected date's data
  const { data: selectedDayData, updateField: updateSelectedField } = useDailyData(selectedDate);

  // Historical data for trends (last 30 days)
  const dateRange = useMemo(() => getDateRange(30), []);
  const { data: historicalData } = useHistoricalData(dateRange);

  // Phase 2: Achievements & Correlations
  const { achievements, newBadge, dismissBadge, defs: achievementDefs } = useAchievements(historicalData, profile);
  const insights = useCorrelationInsights(historicalData);

  // Breathing exercise activity logger
  const handleLogBreathingActivity = useCallback((durationMin) => {
    if (!todayData) return;
    const newActivity = {
      id: Date.now().toString(36),
      type: 'yoga',
      duration: durationMin,
      intensity: 'Light',
      calories: durationMin * 3,
      notes: 'Breathing exercise',
    };
    updateField('activities', [...(todayData.activities || []), newActivity]);
  }, [todayData, updateField]);

  // Save habit definitions on first run
  useEffect(() => {
    if (profile && !profileLoading) {
      storage.get('habit-definitions').then(defs => {
        if (!defs) storage.set('habit-definitions', DEFAULT_HABITS);
      });
    }
  }, [profile, profileLoading]);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    setSelectedDate(todayKey);
    window.scrollTo(0, 0);
  }, [todayKey]);

  // Show profile setup if no profile
  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9FAFB' }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full mx-auto mb-3 animate-pulse" style={{ backgroundColor: '#0D9488' }} />
          <p className="text-gray-500 text-sm">Loading FatimaFit...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
        <ProfileSetup onSave={saveProfile} />
      </div>
    );
  }

  const isToday = selectedDate === todayKey;
  const activeData = activeTab === 'activity' && !isToday ? selectedDayData : todayData;
  const activeUpdateField = activeTab === 'activity' && !isToday ? updateSelectedField : updateField;

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold" style={{ color: '#0D9488' }}>FatimaFit</h1>
          <button
            onClick={() => setShowSettings(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <SettingsIcon size={20} className="text-gray-500" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-4">
        {todayLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-8 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                data={todayData}
                profile={profile}
                onUpdateField={updateField}
                onNavigate={handleTabChange}
                historicalData={historicalData}
                onOpenWeightLogger={() => setShowWeightLogger(true)}
                insights={insights}
                achievements={achievements}
                onOpenAchievements={() => setShowAchievements(true)}
                onOpenWeeklyReport={() => setShowWeeklyReport(true)}
              />
            )}
            {activeTab === 'nutrition' && (
              <Nutrition
                data={todayData}
                profile={profile}
                onUpdateField={updateField}
                historicalData={historicalData}
              />
            )}
            {activeTab === 'activity' && (
              <Activity
                data={activeData}
                onUpdateField={activeUpdateField}
                historicalData={historicalData}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
            )}
            {activeTab === 'wellbeing' && (
              <Wellbeing
                data={todayData}
                onUpdateField={updateField}
                historicalData={historicalData}
                onOpenBreathing={() => setShowBreathing(true)}
              />
            )}
            {activeTab === 'sleep' && (
              <Sleep
                data={todayData}
                yesterdayData={yesterdayData}
                onUpdateField={updateField}
                onUpdateYesterday={updateYesterdayField}
                profile={profile}
                historicalData={historicalData}
              />
            )}
          </>
        )}
      </main>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="max-w-lg mx-auto flex">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className="flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors"
              >
                <Icon
                  size={22}
                  color={isActive ? '#0D9488' : '#9CA3AF'}
                  fill={isActive ? '#0D948820' : 'none'}
                />
                <span
                  className="text-xs font-medium"
                  style={{ color: isActive ? '#0D9488' : '#9CA3AF' }}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Overlays */}
      {showSettings && (
        <SettingsScreen
          profile={profile}
          onSaveProfile={saveProfile}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showWeightLogger && (
        <WeightLogger
          data={todayData}
          profile={profile}
          onUpdateField={updateField}
          historicalData={historicalData}
          onClose={() => setShowWeightLogger(false)}
        />
      )}

      {showBreathing && (
        <BreathingExercise
          onClose={() => setShowBreathing(false)}
          onLogActivity={handleLogBreathingActivity}
        />
      )}

      {showWeeklyReport && (
        <WeeklyReport
          historicalData={historicalData}
          profile={profile}
          onClose={() => setShowWeeklyReport(false)}
        />
      )}

      {showAchievements && (
        <AchievementGallery
          achievements={achievements}
          onClose={() => setShowAchievements(false)}
        />
      )}

      {newBadge && (
        <AchievementCelebration badge={newBadge} onDismiss={dismissBadge} />
      )}
    </div>
  );
}
