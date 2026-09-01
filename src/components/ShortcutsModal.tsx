import React from 'react';
import { X, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Start / Stop Active Stopwatch or Quick Start' },
    { key: 'P', desc: 'Start / Pause Pomodoro Timer' },
    { key: 'R', desc: 'Reset Active Stopwatch' },
    { key: 'T', desc: 'Jump & Focus New Task Input' },
    { key: 'Esc', desc: 'Close any open modal / dialog' },
    { key: '?', desc: 'Open / Close this Shortcuts guide' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="geo-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Command size={18} />
            Keyboard Shortcuts
          </h2>
          <button className="geo-btn geo-btn-sm geo-btn-icon-only" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {shortcuts.map((sc, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: '#f8fafc',
                  border: 'var(--border-width) solid #000',
                }}
              >
                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{sc.desc}</span>
                <kbd
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    background: '#000000',
                    color: '#ffffff',
                    padding: '3px 8px',
                    border: '1px solid #000',
                  }}
                >
                  {sc.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="geo-btn geo-btn-primary" onClick={onClose}>
            GOT IT
          </button>
        </div>
      </div>
    </div>
  );
};
