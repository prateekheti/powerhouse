import React, { useState } from 'react';
import { Play, Square } from 'lucide-react';

interface QuickStartBarProps {
  isRunning: boolean;
  elapsedSeconds: number;
  currentTaskTitle: string;
  onSetTaskTitle: (title: string) => void;
  onStart: (title?: string) => void;
  onStop: () => void;
}

export const QuickStartBar: React.FC<QuickStartBarProps> = ({
  isRunning,
  elapsedSeconds,
  currentTaskTitle,
  onSetTaskTitle,
  onStart,
  onStop,
}) => {
  const [inputVal, setInputVal] = useState<string>(currentTaskTitle);

  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStart = () => {
    const finalTitle = inputVal.trim() || 'Focused Work Session';
    onSetTaskTitle(finalTitle);
    onStart(finalTitle);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!isRunning) {
        handleStart();
      }
    }
  };

  return (
    <div className="quick-start-banner" role="region" aria-label="Quick Start Work System">
      <div className="quick-start-status">
        {isRunning ? (
          <div className="status-indicator working">
            <span>● WORKING</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, marginLeft: 6 }}>
              {formatTime(elapsedSeconds)}
            </span>
          </div>
        ) : (
          <div className="status-indicator ready">
            <span>○ READY?</span>
          </div>
        )}
      </div>

      <div className="quick-start-input-wrap">
        <input
          type="text"
          className="geo-input"
          placeholder="What are you working on right now? (e.g. Build PowerHouse)"
          value={isRunning ? currentTaskTitle : inputVal}
          onChange={(e) => {
            setInputVal(e.target.value);
            if (isRunning) {
              onSetTaskTitle(e.target.value);
            }
          }}
          onKeyDown={handleKeyDown}
          disabled={isRunning}
          id="quick-start-task-input"
        />
      </div>

      <div>
        {isRunning ? (
          <button
            className="geo-btn geo-btn-primary geo-btn-danger"
            onClick={onStop}
            id="quick-stop-btn"
          >
            <Square size={14} fill="currentColor" />
            STOP SESSION
          </button>
        ) : (
          <button
            className="geo-btn geo-btn-primary"
            onClick={handleStart}
            id="quick-start-btn"
          >
            <Play size={14} fill="currentColor" />
            START WORK
          </button>
        )}
      </div>
    </div>
  );
};
