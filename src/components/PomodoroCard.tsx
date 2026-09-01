import React from 'react';
import { Play, Pause, RotateCcw, SkipForward, Flame } from 'lucide-react';
import { PomodoroMode, PomodoroPreset } from '../types';

interface PomodoroCardProps {
  mode: PomodoroMode;
  preset: PomodoroPreset;
  sessionIndex: number;
  totalSessions: number;
  isRunning: boolean;
  remainingSeconds: number;
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

      {/* Hero Timer Display */}
      <div className="timer-hero-display">
        <div className="timer-digits" id="pomodoro-digits">
          {formatTime(remainingSeconds)}
        </div>
        <div className="timer-sublabel" id="pomodoro-phase-label">
          {getModeLabel()}
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
