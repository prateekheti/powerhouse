import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { QuickStartBar } from './components/QuickStartBar';
import { StopwatchCard } from './components/StopwatchCard';
import { PomodoroCard } from './components/PomodoroCard';
import { TodoListCard } from './components/TodoListCard';
import { DailySummaryCard } from './components/DailySummaryCard';
import { ProgressGraphCard } from './components/ProgressGraphCard';
import { SessionHistoryModal } from './components/SessionHistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { ShortcutsModal } from './components/ShortcutsModal';

import { Task, Session, Priority, DailySummary } from './types';
import {
  loadStoredTasks,
  saveStoredTasks,
  loadStoredSessions,
  saveStoredSessions,
  loadStoredSettings,
  saveStoredSettings,
  calculateStreak,
} from './utils/storage';
import { useStopwatch } from './hooks/useStopwatch';
import { usePomodoro } from './hooks/usePomodoro';

export const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => loadStoredTasks());
  const [sessions, setSessions] = useState<Session[]>(() => loadStoredSessions());
  const [settings, setSettings] = useState(() => loadStoredSettings());

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Sync state to local storage
  useEffect(() => {
    saveStoredTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveStoredSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  // Session completion handler
  const handleSessionComplete = useCallback((newSession: Session) => {
    setSessions((prev) => [newSession, ...prev]);
  }, []);

  // Stopwatch hook
  const stopwatch = useStopwatch(handleSessionComplete);

  // Pomodoro hook
  const pomodoro = usePomodoro(
    settings.pomodoro,
    settings.soundEnabled,
    settings.soundVolume,
    handleSessionComplete
  );

  // Task Handlers
  const handleAddTask = (title: string, priority: Priority, category = 'General') => {
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      completed: false,
      priority,
      category,
      createdAt: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? Date.now() : undefined,
            }
          : t
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleSelectTaskForFocus = (taskTitle: string) => {
    stopwatch.setTitle(taskTitle);
    pomodoro.setCurrentTaskTitle(taskTitle);
  };

  // Session deletion & clear
  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const handleClearAllSessions = () => {
    setSessions([]);
  };

  const handleResetToDemoData = (demoTasks: Task[], demoSessions: Session[]) => {
    setTasks(demoTasks);
    setSessions(demoSessions);
  };

  const handleClearAllData = () => {
    setTasks([]);
    setSessions([]);
  };

  // Compute Daily Summary (Today)
  const todaySummary: DailySummary = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todaySessions = sessions.filter((s) => s.date === todayStr);

    const totalSeconds = todaySessions.reduce((acc, s) => acc + s.duration, 0) + (stopwatch.isRunning ? stopwatch.elapsedSeconds : 0);
    const sessionCount = todaySessions.length;
    const pomodoroCount = todaySessions.filter((s) => s.type === 'pomodoro').length;
    const completedTasks = tasks.filter((t) => t.completed).length;
    const totalTasks = tasks.length;
    const streakDays = calculateStreak(sessions);

    return {
      date: todayStr,
      totalSeconds,
      sessionCount,
      pomodoroCount,
      completedTasks,
      totalTasks,
      streakDays,
    };
  }, [sessions, tasks, stopwatch.isRunning, stopwatch.elapsedSeconds]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      const isInputActive = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

      if (e.key === 'Escape') {
        setIsSettingsOpen(false);
        setIsHistoryOpen(false);
        setIsShortcutsOpen(false);
        return;
      }

      if (isInputActive) return;

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (stopwatch.isRunning) {
          stopwatch.stop();
        } else {
          stopwatch.start();
        }
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        if (pomodoro.isRunning) {
          pomodoro.pause();
        } else {
          pomodoro.start();
        }
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        stopwatch.reset();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        const taskInput = document.getElementById('new-task-input');
        if (taskInput) {
          taskInput.focus();
        }
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stopwatch, pomodoro]);

  return (
    <>
      {/* Visual Blueprint Background Layer */}
      <div className="powerhouse-background-layer" aria-hidden="true">
        <div className="powerhouse-grid-overlay" />
        <div className="powerhouse-orange-orb" />
        <div className="powerhouse-watermark-text">JUST DO IT!</div>
      </div>

      {/* Main Foreground Container */}
      <div className="app-container">
        {/* Blueprint Header */}
        <Header
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
        />

        {/* Master Quick Start Work Bar */}
        <QuickStartBar
          isRunning={stopwatch.isRunning}
          elapsedSeconds={stopwatch.elapsedSeconds}
          currentTaskTitle={stopwatch.title}
          onSetTaskTitle={stopwatch.setTitle}
          onStart={stopwatch.start}
          onStop={stopwatch.stop}
        />

        {/* 3-Column Top Grid (Blueprint Match) */}
        <div className="blueprint-main-grid">
          {/* 1. Stopwatch Column */}
          <StopwatchCard
            isRunning={stopwatch.isRunning}
            elapsedSeconds={stopwatch.elapsedSeconds}
            title={stopwatch.title}
            onSetTitle={stopwatch.setTitle}
            onStart={stopwatch.start}
            onStop={stopwatch.stop}
            onReset={stopwatch.reset}
          />

          {/* 2. Pomodoro Timer Column */}
          <PomodoroCard
            mode={pomodoro.mode}
            preset={pomodoro.preset}
            sessionIndex={pomodoro.sessionIndex}
            totalSessions={pomodoro.totalSessions}
            isRunning={pomodoro.isRunning}
            remainingSeconds={pomodoro.remainingSeconds}
            currentTaskTitle={pomodoro.currentTaskTitle}
            onSetTaskTitle={pomodoro.setCurrentTaskTitle}
            onStart={pomodoro.start}
            onPause={pomodoro.pause}
            onReset={pomodoro.reset}
            onSkip={pomodoro.skip}
            onChangePreset={pomodoro.changePreset}
          />

          {/* 3. To-Do List Column */}
          <TodoListCard
            tasks={tasks}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onSelectTaskForFocus={handleSelectTaskForFocus}
          />
        </div>

        {/* Lower Section: Daily Productivity & Blueprint Progress Graph */}
        <div className="blueprint-bottom-section">
          {/* Daily Productivity Summary Card */}
          <DailySummaryCard summary={todaySummary} />

          {/* Productivity Line Graph Card */}
          <ProgressGraphCard
            sessions={sessions}
            dailyGoalMinutes={settings.dailyGoalMinutes}
          />
        </div>

        {/* Blueprint Bottom Action / Trigger Bar */}
        <div className="blueprint-footer-action-bar">
          <button
            className="geo-btn geo-btn-primary"
            onClick={() => setIsHistoryOpen(true)}
            id="view-history-btn"
          >
            VIEW SESSION HISTORY ({sessions.length})
          </button>

          <button
            className="geo-btn"
            onClick={() => setIsSettingsOpen(true)}
            id="settings-trigger-btn"
          >
            SYSTEM SETTINGS
          </button>
        </div>
      </div>

      {/* Modals */}
      <SessionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={sessions}
        onDeleteSession={handleDeleteSession}
        onClearAllSessions={handleClearAllSessions}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
        tasks={tasks}
        sessions={sessions}
        onResetToDemoData={handleResetToDemoData}
        onClearAllData={handleClearAllData}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </>
  );
};
