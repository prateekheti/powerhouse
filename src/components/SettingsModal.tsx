import React, { useState, useEffect } from 'react';
import { X, Volume2, Bell, RotateCcw, Download, Sun, Moon, Monitor } from 'lucide-react';
import { UserSettings, Task, Session, ThemeMode } from '../types';
import { soundEngine } from '../utils/sound';
import { exportDataAsJSON, getInitialSeedSessions, INITIAL_TASKS } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
  tasks: Task[];
  sessions: Session[];
  onResetToDemoData: (demoTasks: Task[], demoSessions: Session[]) => void;
  onClearAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  tasks,
  sessions,
  onResetToDemoData,
  onClearAllData,
}) => {
  const [form, setForm] = useState<UserSettings>(settings);

  useEffect(() => {
    if (isOpen) {
      setForm(settings);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(form);
    onClose();
  };

  const handleTestSound = () => {
    soundEngine.playComplete(form.soundVolume);
  };

  const handleRequestNotification = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setForm({ ...form, notificationsEnabled: perm === 'granted' });
    } else {
      alert('Browser notifications are not supported in this environment.');
    }
  };

  const handleThemeSelect = (theme: ThemeMode) => {
    const updated = { ...form, theme };
    setForm(updated);
    // Live update settings to let user preview immediately
    onSaveSettings(updated);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="geo-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        <div className="modal-header">
          <h2 className="modal-title">System Settings</h2>
          <button className="geo-btn geo-btn-sm geo-btn-icon-only" onClick={onClose} aria-label="Close Settings">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Appearance & Theme Selector */}
          <div className="settings-group">
            <span className="settings-group-title">Appearance & Dark Mode</span>
            <div className="theme-selector-group">
              <button
                type="button"
                className={`theme-opt-btn ${form.theme === 'light' ? 'active' : ''}`}
                onClick={() => handleThemeSelect('light')}
                id="theme-opt-light"
              >
                <Sun size={15} />
                LIGHT (CLASSIC)
              </button>

              <button
                type="button"
                className={`theme-opt-btn ${form.theme === 'dark' ? 'active' : ''}`}
                onClick={() => handleThemeSelect('dark')}
                id="theme-opt-dark"
              >
                <Moon size={15} />
                DARK (STEALTH)
              </button>

              <button
                type="button"
                className={`theme-opt-btn ${form.theme === 'system' ? 'active' : ''}`}
                onClick={() => handleThemeSelect('system')}
                id="theme-opt-system"
              >
                <Monitor size={15} />
                SYSTEM MATCH
              </button>
            </div>
          </div>

          {/* Pomodoro Settings */}
          <div className="settings-group">
            <span className="settings-group-title">Pomodoro Timers (Minutes)</span>
            
            <div className="settings-field">
              <label>Work Focus Duration:</label>
              <input
                type="number"
                min="1"
                max="120"
                className="geo-input"
                style={{ width: '90px' }}
                value={form.pomodoro.workMinutes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    pomodoro: { ...form.pomodoro, workMinutes: Number(e.target.value) || 25 },
                  })
                }
              />
            </div>

            <div className="settings-field">
              <label>Short Break Duration:</label>
              <input
                type="number"
                min="1"
                max="30"
                className="geo-input"
                style={{ width: '90px' }}
                value={form.pomodoro.shortBreakMinutes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    pomodoro: { ...form.pomodoro, shortBreakMinutes: Number(e.target.value) || 5 },
                  })
                }
              />
            </div>

            <div className="settings-field">
              <label>Long Break Duration:</label>
              <input
                type="number"
                min="1"
                max="60"
                className="geo-input"
                style={{ width: '90px' }}
                value={form.pomodoro.longBreakMinutes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    pomodoro: { ...form.pomodoro, longBreakMinutes: Number(e.target.value) || 15 },
                  })
                }
              />
            </div>

            <div className="settings-field">
              <label>Long Break Interval (Sessions):</label>
              <input
                type="number"
                min="1"
                max="12"
                className="geo-input"
                style={{ width: '90px' }}
                value={form.pomodoro.longBreakInterval}
                onChange={(e) =>
                  setForm({
                    ...form,
                    pomodoro: { ...form.pomodoro, longBreakInterval: Number(e.target.value) || 4 },
                  })
                }
              />
            </div>

            <div className="settings-field">
              <label>Auto-start breaks after focus:</label>
              <input
                type="checkbox"
                checked={form.pomodoro.autoStartBreaks}
                onChange={(e) =>
                  setForm({
                    ...form,
                    pomodoro: { ...form.pomodoro, autoStartBreaks: e.target.checked },
                  })
                }
              />
            </div>
          </div>

          {/* Productivity Goals */}
          <div className="settings-group">
            <span className="settings-group-title">Productivity Targets</span>
            
            <div className="settings-field">
              <label>Daily Focused Goal (Minutes):</label>
              <input
                type="number"
                step="30"
                min="30"
                max="1440"
                className="geo-input"
                style={{ width: '90px' }}
                value={form.dailyGoalMinutes}
                onChange={(e) => setForm({ ...form, dailyGoalMinutes: Number(e.target.value) || 240 })}
              />
            </div>

            <div className="settings-field">
              <label>Weekly Goal (Minutes):</label>
              <input
                type="number"
                step="60"
                min="60"
                max="6000"
                className="geo-input"
                style={{ width: '90px' }}
                value={form.weeklyGoalMinutes}
                onChange={(e) => setForm({ ...form, weeklyGoalMinutes: Number(e.target.value) || 1200 })}
              />
            </div>
          </div>

          {/* Audio & Notifications */}
          <div className="settings-group">
            <span className="settings-group-title">Audio & Alerts</span>
            
            <div className="settings-field">
              <label>Sound Alerts Enabled:</label>
              <input
                type="checkbox"
                checked={form.soundEnabled}
                onChange={(e) => setForm({ ...form, soundEnabled: e.target.checked })}
              />
            </div>

            {form.soundEnabled && (
              <div className="settings-field">
                <label>Sound Volume ({Math.round(form.soundVolume * 100)}%):</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={form.soundVolume}
                    onChange={(e) => setForm({ ...form, soundVolume: parseFloat(e.target.value) })}
                  />
                  <button className="geo-btn geo-btn-sm" onClick={handleTestSound} title="Test synthesized chime">
                    <Volume2 size={13} />
                    Test
                  </button>
                </div>
              </div>
            )}

            <div className="settings-field">
              <label>Browser Notifications:</label>
              <button className="geo-btn geo-btn-sm" onClick={handleRequestNotification}>
                <Bell size={13} />
                {Notification.permission === 'granted' ? 'PERMITTED ✓' : 'REQUEST PERMISSION'}
              </button>
            </div>
          </div>

          {/* Data & Backup */}
          <div className="settings-group" style={{ borderBottom: 'none' }}>
            <span className="settings-group-title">Data Backup & Recovery</span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                className="geo-btn geo-btn-sm"
                onClick={() => exportDataAsJSON(tasks, sessions, form)}
              >
                <Download size={13} />
                EXPORT JSON BACKUP
              </button>

              <button
                className="geo-btn geo-btn-sm"
                onClick={() => {
                  if (window.confirm('Reset application to sample productivity data?')) {
                    onResetToDemoData(INITIAL_TASKS, getInitialSeedSessions());
                    onClose();
                  }
                }}
              >
                <RotateCcw size={13} />
                RESET TO DEMO DATA
              </button>

              <button
                className="geo-btn geo-btn-sm geo-btn-danger"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all tasks and history?')) {
                    onClearAllData();
                    onClose();
                  }
                }}
              >
                WIPE ALL DATA
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="geo-btn" onClick={onClose}>
            CANCEL
          </button>
          <button className="geo-btn geo-btn-primary" onClick={handleSave}>
            SAVE CHANGES
          </button>
        </div>
      </div>
    </div>
  );
};
