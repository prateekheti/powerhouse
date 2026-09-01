import React, { useState, useEffect } from 'react';
import { Settings, History, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onOpenShortcuts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
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
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#000000" stroke="#000000" strokeWidth="1.5">
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
          <button
            className="geo-btn geo-btn-sm geo-btn-icon-only"
            onClick={onOpenHistory}
            title="Session History"
            aria-label="View Session History"
          >
            <History size={16} />
          </button>
          
          <button
            className="geo-btn geo-btn-sm geo-btn-icon-only"
            onClick={onOpenShortcuts}
            title="Keyboard Shortcuts (?)"
            aria-label="Keyboard Shortcuts"
          >
            <HelpCircle size={16} />
          </button>

          <button
            className="geo-btn geo-btn-sm geo-btn-icon-only"
            onClick={onOpenSettings}
            title="System Settings"
            aria-label="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
