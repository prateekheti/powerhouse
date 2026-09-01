import React, { useState } from 'react';
import { X, Trash2, FileSpreadsheet } from 'lucide-react';
import { Session } from '../types';
import { exportSessionsAsCSV } from '../utils/storage';

interface SessionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: Session[];
  onDeleteSession: (sessionId: string) => void;
  onClearAllSessions: () => void;
}

export const SessionHistoryModal: React.FC<SessionHistoryModalProps> = ({
  isOpen,
  onClose,
  sessions,
  onDeleteSession,
  onClearAllSessions,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'stopwatch' | 'pomodoro'>('all');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredSessions = [...sessions]
    .sort((a, b) => b.startTime - a.startTime)
    .filter((s) => {
      if (filterType !== 'all' && s.type !== filterType) return false;
      if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

  const formatDuration = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const formatTimeRange = (start: number, end: number) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const sStr = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const eStr = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${sStr} — ${eStr}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="geo-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Work Session History</h2>
          <button className="geo-btn geo-btn-sm geo-btn-icon-only" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Controls Bar */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '240px' }}>
              <input
                type="text"
                className="geo-input"
                placeholder="Search session name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ padding: '6px 10px', fontSize: '0.8rem' }}
              />

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'stopwatch' | 'pomodoro')}
                className="geo-btn geo-btn-sm"
                style={{ padding: '6px 10px', fontSize: '0.78rem' }}
              >
                <option value="all">ALL TYPES ({sessions.length})</option>
                <option value="stopwatch">STOPWATCH</option>
                <option value="pomodoro">POMODORO</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="geo-btn geo-btn-sm"
                onClick={() => exportSessionsAsCSV(sessions)}
                disabled={sessions.length === 0}
                title="Export sessions to CSV"
              >
                <FileSpreadsheet size={14} />
                EXPORT CSV
              </button>

              <button
                className="geo-btn geo-btn-sm geo-btn-danger"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all session history?')) {
                    onClearAllSessions();
                  }
                }}
                disabled={sessions.length === 0}
              >
                <Trash2 size={14} />
                CLEAR ALL
              </button>
            </div>
          </div>

          {/* Sessions Table */}
          <div style={{ maxHeight: '420px', overflowY: 'auto', border: 'var(--border-width) solid #000' }}>
            {filteredSessions.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                NO LOGGED SESSIONS FOUND
              </div>
            ) : (
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Project / Task</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Time (Start — End)</th>
                    <th>Duration</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 700 }}>{s.title || 'Untitled Session'}</td>
                      <td>
                        <span className={`priority-tag ${s.type === 'pomodoro' ? 'priority-high' : 'priority-medium'}`}>
                          {s.type.toUpperCase()}
                        </span>
                      </td>
                      <td>{s.date}</td>
                      <td>{formatTimeRange(s.startTime, s.endTime)}</td>
                      <td style={{ fontWeight: 800 }}>{formatDuration(s.duration)}</td>
                      <td>
                        <button
                          className="todo-icon-btn"
                          onClick={() => onDeleteSession(s.id)}
                          title="Delete session"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="geo-btn geo-btn-primary" onClick={onClose}>
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
