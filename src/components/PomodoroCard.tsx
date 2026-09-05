import React, { useMemo } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Flame } from 'lucide-react';
import { PomodoroMode, PomodoroPreset } from '../types';

interface PomodoroCardProps {
  mode: PomodoroMode;
  preset: PomodoroPreset;
  sessionIndex: number;
  totalSessions: number;
  isRunning: boolean;
  remainingSeconds: number;
  totalDuration?: number;
  currentTaskTitle: string;
  onSetTaskTitle: (title: string) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  onChangePreset: (preset: PomodoroPreset) => void;
}

export const PomodoroCard: React.FC<PomodoroCardProps> = ({
  mode,
  preset,
  sessionIndex,
  totalSessions,
  isRunning,
  remainingSeconds,
  totalDuration,
  currentTaskTitle,
  onSetTaskTitle,
  onStart,
  onPause,
  onReset,
  onSkip,
  onChangePreset,
}) => {
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getModeLabel = () => {
    if (mode === 'work') return `FOCUS SESSION ${sessionIndex} / ${totalSessions}`;
    if (mode === 'shortBreak') return 'SHORT BREAK — RECHARGE';
    return 'LONG BREAK — REST';
  };

  const getModeBadgeClass = () => {
    if (mode === 'work') return 'priority-high';
    if (mode === 'shortBreak') return 'priority-medium';
    return 'priority-low';
  };

  // ── Speedometer Geometry (180° Semi-Circular Arc) ────────────────────────
  // SVG viewBox: 0 0 240 132
  // Center: CX=120, CY=120
  // Radius: R=88
  // Arc sweeps clockwise over the top from 180° (left) to 0° (right)
  const CX = 120;
  const CY = 120;
  const R = 88;
  const arcLength = Math.PI * R; // ~276.46

  // SVG path: Left (32, 120) -> Top apex (120, 32) -> Right (208, 120)
  const trackPath = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`;

  const duration =
    totalDuration && totalDuration > 0
      ? totalDuration
      : preset === '25/5'
      ? (mode === 'work' ? 25 * 60 : mode === 'shortBreak' ? 5 * 60 : 15 * 60)
      : preset === '50/10'
      ? (mode === 'work' ? 50 * 60 : mode === 'shortBreak' ? 10 * 60 : 20 * 60)
      : 25 * 60;

  const progress = Math.min(1, Math.max(0, remainingSeconds / duration));
  const strokeDashoffset = arcLength * (1 - progress);

  // Subtle speedometer tick marks: 24 segments (25 ticks) along the 180° arc
  // Major ticks at 0%, 25%, 50%, 75%, 100% (every 6 segments)
  // All ticks have y <= CY so they never extend below the baseline or overlap UI
  const ticks = useMemo(() => {
    const list: { x1: number; y1: number; x2: number; y2: number; isMajor: boolean }[] = [];
    const count = 24;
    const outerR = 78;
    for (let i = 0; i <= count; i++) {
      const frac = i / count;
      const deg = 180 - frac * 180; // 180° at left -> 0° at right
      const rad = (deg * Math.PI) / 180;
      const isMajor = i % 6 === 0;
      const innerR = isMajor ? 68 : 73;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      list.push({
        x1: CX + innerR * cos,
        y1: CY - innerR * sin,
        x2: CX + outerR * cos,
        y2: CY - outerR * sin,
        isMajor,
      });
    }
    return list;
  }, []);

  return (
    <div className="blueprint-card" id="pomodoro-card">
      <div className="blueprint-card-header">
        <h2 className="blueprint-card-title">Pomodoro Timer</h2>
        <span className={`blueprint-card-badge ${getModeBadgeClass()}`}>
          {mode === 'work' ? <Flame size={12} style={{ display: 'inline', marginRight: 3 }} /> : null}
          {mode.toUpperCase()}
        </span>
      </div>

      {/* Preset selection bar */}
      <div className="preset-group">
        <button
          className={`preset-btn ${preset === '25/5' ? 'active' : ''}`}
          onClick={() => onChangePreset('25/5')}
          title="25 mins focus, 5 mins break"
        >
          25 / 5
        </button>
        <button
          className={`preset-btn ${preset === '50/10' ? 'active' : ''}`}
          onClick={() => onChangePreset('50/10')}
          title="50 mins focus, 10 mins break"
        >
          50 / 10
        </button>
        <button
          className={`preset-btn ${preset === 'custom' ? 'active' : ''}`}
          onClick={() => onChangePreset('custom')}
          title="Customized timer in settings"
        >
          CUSTOM
        </button>
      </div>

      {/* ── Semi-Circular Speedometer Gauge ─────────────────────────────────── */}
      <div className={`pomo-gauge-wrapper${isRunning ? ' is-running' : ''}`} id="pomodoro-semi-display">
        <svg
          className={`pomo-gauge-svg${isRunning ? ' is-running' : ''}`}
          viewBox="0 0 240 132"
          width="240"
          height="132"
          aria-hidden="true"
        >
          {/* Subtle tick marks around the arc */}
          <g className="pomo-ticks">
            {ticks.map((t, i) => (
              <line
                key={i}
                x1={t.x1.toFixed(2)}
                y1={t.y1.toFixed(2)}
                x2={t.x2.toFixed(2)}
                y2={t.y2.toFixed(2)}
                className={t.isMajor ? 'pomo-tick-major' : 'pomo-tick-minor'}
              />
            ))}
          </g>

          {/* Understated Dark Gray Track Arc */}
          <path
            d={trackPath}
            className="pomo-track"
            fill="none"
            strokeWidth="7"
            strokeLinecap="round"
          />

          {/* Active Orange Progress Arc following identical arc */}
          <path
            d={trackPath}
            className="pomo-progress"
            fill="none"
            strokeWidth="7"
            strokeLinecap="round"
            style={{
              strokeDasharray: arcLength,
              strokeDashoffset,
              opacity: progress <= 0 ? 0 : 1,
            }}
          />
        </svg>

        {/* Centered timer display inside the gauge dome */}
        <div className="pomo-gauge-center">
          <div className="pomo-gauge-digits" id="pomodoro-digits">
            {formatTime(remainingSeconds)}
          </div>
          <div className="pomo-gauge-label" id="pomodoro-phase-label">
            {getModeLabel()}
          </div>
        </div>
      </div>

      <div>
        <input
          type="text"
          className="geo-input"
          placeholder="Focus Target / Task Name"
          value={currentTaskTitle}
          onChange={(e) => onSetTaskTitle(e.target.value)}
          disabled={isRunning}
          style={{ fontSize: '0.8rem', padding: '6px 10px' }}
        />
      </div>

      {/* Primary Action Button (Blueprint Start/Stop Button) */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {isRunning ? (
          <button
            className="geo-btn geo-btn-primary"
            style={{ flex: 1, padding: '12px' }}
            onClick={onPause}
            id="pomodoro-pause-btn"
          >
            <Pause size={16} fill="currentColor" />
            PAUSE
          </button>
        ) : (
          <button
            className="geo-btn geo-btn-primary"
            style={{ flex: 1, padding: '12px' }}
            onClick={onStart}
            id="pomodoro-start-btn"
          >
            <Play size={16} fill="currentColor" />
            START FOCUS
          </button>
        )}

        <button
          className="geo-btn"
          onClick={onReset}
          title="Reset current interval"
          id="pomodoro-reset-btn"
        >
          <RotateCcw size={14} />
        </button>

        <button
          className="geo-btn"
          onClick={onSkip}
          title="Skip to next stage"
          id="pomodoro-skip-btn"
        >
          <SkipForward size={14} />
        </button>
      </div>
    </div>
  );
};
