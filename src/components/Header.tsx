import React, { useState, useEffect } from 'react';
import { Settings, History, HelpCircle, Sun, Moon } from 'lucide-react';
import { ThemeMode } from '../types';

interface HeaderProps {
  themeMode: ThemeMode;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onOpenShortcuts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  themeMode,
  isDark,
  onToggleTheme,
  onOpenSettings,
  onOpenHistory,
  onOpenShortcuts,
}) => {
  const [localTime, setLocalTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setLocalTime(`${hours}:${minutes}:${seconds}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="blueprint-header" role="banner">
      {/* Left: Brand */}
      <div className="brand-section">
        <span className="brand-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--accent-orange)" stroke="var(--accent-orange)" strokeWidth="1.5">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          PowerHouse
        </span>
        <span className="brand-badge">v1.0</span>
      </div>

      {/* Center: 24hr / Local Time Card */}
      <div className="header-center-box">
        <div className="local-time-card" title="Current Local Time (24-Hour)">
          <span className="local-time-label">24hr / Local Time</span>
          <span className="local-time-clock">{localTime || '00:00:00'}</span>
        </div>
      </div>

      {/* Right: Tagline & Quick Actions */}
      <div className="header-right-section">
        <span className="tagline-text">JUST DO IT!</span>
        
        <div className="header-actions">
          {/* Theme Quick Toggle Button */}
          <button
            className="geo-btn geo-btn-sm geo-btn-icon-only theme-toggle-btn"
            onClick={onToggleTheme}
            title={isDark ? `Switch to Light Mode (D) • ${themeMode.toUpperCase()}` : `Switch to Dark Mode (D) • ${themeMode.toUpperCase()}`}
            aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            id="theme-toggle-btn"
          >
            {isDark ? (
              <Sun size={16} style={{ color: 'var(--accent-orange)' }} />
            ) : (
              <Moon size={16} />
            )}
          </button>

          <button
            className="geo-btn geo-btn-sm geo-btn-icon-only"
            onClick={onOpenHistory}
            title="Session History"
            aria-label="View Session History"
            id="header-history-btn"
          >
            <History size={16} />
          </button>
          
          <button
            className="geo-btn geo-btn-sm geo-btn-icon-only"
            onClick={onOpenShortcuts}
            title="Keyboard Shortcuts (?)"
            aria-label="Keyboard Shortcuts"
            id="header-shortcuts-btn"
          >
            <HelpCircle size={16} />
          </button>

          <button
            className="geo-btn geo-btn-sm geo-btn-icon-only"
            onClick={onOpenSettings}
            title="System Settings"
            aria-label="Settings"
            id="header-settings-btn"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
