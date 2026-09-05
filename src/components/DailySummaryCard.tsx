import React from 'react';
import { DailySummary } from '../types';

interface DailySummaryCardProps {
  summary: DailySummary;
}

export const DailySummaryCard: React.FC<DailySummaryCardProps> = ({ summary }) => {
  const formatFocusedTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    return `${String(hrs).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m`;
  };

  return (
    <div className="daily-summary-card" id="daily-summary-card">
      <div className="blueprint-card-header">
        <h2 className="blueprint-card-title">Daily Summary</h2>
        <span className="blueprint-card-badge">TODAY</span>
      </div>

      <div className="stat-row-group">
        <div className="stat-row">
          <span className="stat-label">Focused Time:</span>
          <span className="stat-val" id="summary-focused-time">{formatFocusedTime(summary.totalSeconds)}</span>
        </div>

        <div className="stat-row">
          <span className="stat-label">Sessions:</span>
          <span className="stat-val" id="summary-sessions-count">{summary.sessionCount}</span>
        </div>

        <div className="stat-row">
          <span className="stat-label">Pomodoros:</span>
          <span className="stat-val" id="summary-pomodoros-count">{summary.pomodoroCount}</span>
        </div>

        <div className="stat-row">
          <span className="stat-label">Tasks Done:</span>
          <span className="stat-val" id="summary-tasks-done">{summary.completedTasks} / {summary.totalTasks}</span>
        </div>

        <div className="stat-row">
          <span className="stat-label">Streak:</span>
          <span className="stat-val" style={{ color: 'var(--accent-orange)' }} id="summary-streak-days">
            🔥 {summary.streakDays} days
          </span>
        </div>
      </div>

      <div style={{ background: 'var(--bg-surface)', border: 'var(--border-width) solid var(--border-color)', color: 'var(--text-primary)', padding: '8px 10px', textAlign: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 800 }}>
          {summary.streakDays >= 7 ? '⚡️ CONSISTENCY BEAST' : 'KEEP GOING! JUST DO IT!'}
        </span>
      </div>
    </div>
  );
};
