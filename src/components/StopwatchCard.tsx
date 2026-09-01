import React from 'react';
import { Play, Square, RotateCcw } from 'lucide-react';

interface StopwatchCardProps {
  isRunning: boolean;
  elapsedSeconds: number;
  title: string;
  onSetTitle: (title: string) => void;
  onStart: (title?: string) => void;
  onStop: () => void;
  onReset: () => void;
}

export const StopwatchCard: React.FC<StopwatchCardProps> = ({
  isRunning,
  elapsedSeconds,
  title,
  onSetTitle,
  onStart,
  onStop,
  onReset,
}) => {
  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="stopwatch-column">
      {/* Main Stopwatch Card */}
      <div className="blueprint-card" id="stopwatch-card">
        <div className="blueprint-card-header">
          <h2 className="blueprint-card-title">Stopwatch</h2>
          <span className={`blueprint-card-badge ${isRunning ? 'priority-high' : ''}`}>
            {isRunning ? '● ACTIVE' : '○ IDLE'}
          </span>
        </div>

        <div className="timer-hero-display">
          <div className="timer-digits" id="stopwatch-digits">
            {formatTime(elapsedSeconds)}
          </div>
          <div className="timer-sublabel">
            {isRunning ? 'SESSION RECORDING' : 'ELAPSED DURATION'}
          </div>
        </div>

        <div style={{ marginTop: 4 }}>
          <input
            type="text"
            className="geo-input"
            placeholder="Session / Project Name"
            value={title}
            onChange={(e) => onSetTitle(e.target.value)}
            disabled={isRunning}
            style={{ fontSize: '0.8rem', padding: '6px 10px' }}
          />
        </div>

        {/* Start / Stop Button Box (Blueprint) */}
        <div className="sub-action-box" style={{ padding: 0, border: 'none' }}>
          {isRunning ? (
            <button
              className="geo-btn geo-btn-primary geo-btn-danger"
              style={{ width: '100%', padding: '12px' }}
              onClick={onStop}
              id="stopwatch-stop-btn"
            >
              <Square size={16} fill="currentColor" />
              STOP / SAVE SESSION
            </button>
          ) : (
            <button
              className="geo-btn geo-btn-primary"
              style={{ width: '100%', padding: '12px' }}
              onClick={() => onStart(title)}
              id="stopwatch-start-btn"
            >
              <Play size={16} fill="currentColor" />
              START STOPWATCH
            </button>
          )}
        </div>
      </div>

      {/* Reset Box / Card Underneath (Blueprint) */}
      <div className="reset-subcard" id="stopwatch-reset-box">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', fontWeight: 800 }}>
            SESSION CONTROL
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            AUTO-SAVE ON STOP
          </span>
        </div>
        <button
          className="geo-btn"
          style={{ width: '100%' }}
          onClick={onReset}
          disabled={elapsedSeconds === 0 && !isRunning}
          id="stopwatch-reset-btn"
          title="Reset timer without deleting saved sessions"
        >
          <RotateCcw size={14} />
          RESET STOPWATCH
        </button>
      </div>
    </div>
  );
};
