import { useState, useEffect, useRef } from 'react';
import { X, Play, Pause } from 'lucide-react';

const PHASES = [
  { name: 'Breathe In...', duration: 4, color: '#0D9488', scale: 1.5 },
  { name: 'Hold...', duration: 7, color: '#8B5CF6', scale: 1.5 },
  { name: 'Breathe Out...', duration: 8, color: '#6366F1', scale: 1.0 },
];

const CYCLE_DURATION = 4 + 7 + 8; // 19 seconds per cycle
const PRESETS = [
  { label: '1 min', cycles: 3 },
  { label: '2 min', cycles: 5 },
  { label: '3 min', cycles: 10 },
];

export default function BreathingExercise({ onClose, onLogActivity }) {
  const [preset, setPreset] = useState(1); // default to 5 cycles
  const [isRunning, setIsRunning] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [countdown, setCountdown] = useState(PHASES[0].duration);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef(null);

  const totalCycles = PRESETS[preset].cycles;
  const phase = PHASES[phaseIdx];

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Move to next phase
          const nextPhaseIdx = phaseIdx + 1;
          if (nextPhaseIdx >= PHASES.length) {
            // Completed a cycle
            const nextCycle = currentCycle + 1;
            if (nextCycle >= totalCycles) {
              // All done
              setIsRunning(false);
              setCompleted(true);
              return 0;
            }
            setCurrentCycle(nextCycle);
            setPhaseIdx(0);
            return PHASES[0].duration;
          }
          setPhaseIdx(nextPhaseIdx);
          return PHASES[nextPhaseIdx].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, phaseIdx, currentCycle, totalCycles]);

  const startPause = () => {
    if (completed) {
      // Reset
      setCompleted(false);
      setCurrentCycle(0);
      setPhaseIdx(0);
      setCountdown(PHASES[0].duration);
      return;
    }
    setIsRunning(!isRunning);
  };

  const reset = () => {
    setIsRunning(false);
    setCompleted(false);
    setCurrentCycle(0);
    setPhaseIdx(0);
    setCountdown(PHASES[0].duration);
  };

  const logAsActivity = () => {
    const durationMin = Math.round((totalCycles * CYCLE_DURATION) / 60);
    onLogActivity(durationMin);
    onClose();
  };

  const elapsedSeconds = currentCycle * CYCLE_DURATION +
    PHASES.slice(0, phaseIdx).reduce((s, p) => s + p.duration, 0) +
    (phase.duration - countdown);
  const totalSeconds = totalCycles * CYCLE_DURATION;
  const progress = totalSeconds > 0 ? (elapsedSeconds / totalSeconds) * 100 : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center transition-colors duration-1000"
      style={{
        background: `linear-gradient(180deg, #0F172A 0%, ${isRunning ? phase.color + '40' : '#1E293B'} 100%)`,
      }}
    >
      {/* Close */}
      <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">
        <X size={24} />
      </button>

      {completed ? (
        /* Completion Screen */
        <div className="text-center">
          <div className="text-6xl mb-4">🧘</div>
          <h2 className="text-2xl font-bold text-white mb-2">Great job, Fatima!</h2>
          <p className="text-white/60 mb-1">
            {totalCycles} cycles completed
          </p>
          <p className="text-white/40 text-sm mb-8">
            {Math.round(totalCycles * CYCLE_DURATION / 60)} minutes of mindful breathing
          </p>
          <div className="space-y-3">
            <button
              onClick={logAsActivity}
              className="px-6 py-3 rounded-xl text-white font-medium"
              style={{ backgroundColor: '#0D9488' }}
            >
              Log as Meditation
            </button>
            <button onClick={onClose} className="block mx-auto text-white/50 text-sm hover:text-white">
              Close
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Cycle counter */}
          <p className="text-white/50 text-sm mb-8">
            Cycle {currentCycle + 1} of {totalCycles}
          </p>

          {/* Breathing circle */}
          <div className="relative mb-8">
            <div
              className="rounded-full flex items-center justify-center transition-all duration-1000"
              style={{
                width: isRunning ? `${phase.scale * 120}px` : '120px',
                height: isRunning ? `${phase.scale * 120}px` : '120px',
                backgroundColor: isRunning ? phase.color + '30' : '#ffffff10',
                boxShadow: isRunning ? `0 0 60px ${phase.color}40` : 'none',
              }}
            >
              <div
                className="rounded-full flex items-center justify-center transition-all duration-1000"
                style={{
                  width: isRunning ? `${phase.scale * 80}px` : '80px',
                  height: isRunning ? `${phase.scale * 80}px` : '80px',
                  backgroundColor: isRunning ? phase.color + '50' : '#ffffff15',
                }}
              >
                <span className="text-3xl font-bold text-white">
                  {isRunning ? countdown : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Phase text */}
          <p className="text-xl font-medium text-white mb-2 transition-all">
            {isRunning ? phase.name : 'Ready?'}
          </p>

          {/* Progress bar */}
          {isRunning && (
            <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mb-8">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${progress}%`, backgroundColor: phase.color }}
              />
            </div>
          )}

          {/* Preset selector (only when not running) */}
          {!isRunning && (
            <div className="flex gap-3 mb-8">
              {PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => { setPreset(i); reset(); }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    preset === i ? 'text-white' : 'text-white/40 bg-white/5'
                  }`}
                  style={preset === i ? { backgroundColor: '#0D9488' } : {}}
                >
                  {p.label} ({p.cycles} cycles)
                </button>
              ))}
            </div>
          )}

          {/* Controls */}
          <button
            onClick={startPause}
            className="w-16 h-16 rounded-full flex items-center justify-center text-white transition-all hover:scale-105"
            style={{ backgroundColor: '#0D9488' }}
          >
            {isRunning ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
          </button>
        </>
      )}
    </div>
  );
}
