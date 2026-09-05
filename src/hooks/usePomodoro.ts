import { useState, useEffect, useRef, useCallback } from 'react';
import { Session, PomodoroMode, PomodoroPreset, PomodoroSettings } from '../types';
import { STORAGE_KEYS } from '../utils/storage';
import { soundEngine } from '../utils/sound';

interface StoredPomodoroState {
  mode: PomodoroMode;
  preset: PomodoroPreset;
  sessionIndex: number;
  isRunning: boolean;
  remainingSeconds: number;
  targetEndTime: number | null;
  currentTaskTitle: string;
}

export function usePomodoro(
  settings: PomodoroSettings,
  soundEnabled: boolean,
  soundVolume: number,
  onSessionComplete?: (session: Session) => void
) {
  const [mode, setMode] = useState<PomodoroMode>('work');
  const [preset, setPreset] = useState<PomodoroPreset>('25/5');
  const [sessionIndex, setSessionIndex] = useState<number>(1);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentTaskTitle, setCurrentTaskTitle] = useState<string>('Pomodoro Focus');

  // Compute duration in seconds based on preset/settings
  const getDurationForMode = useCallback(
    (currentMode: PomodoroMode, currentPreset: PomodoroPreset): number => {
      if (currentPreset === '25/5') {
        if (currentMode === 'work') return 25 * 60;
        if (currentMode === 'shortBreak') return 5 * 60;
        return 15 * 60;
      }
      if (currentPreset === '50/10') {
        if (currentMode === 'work') return 50 * 60;
        if (currentMode === 'shortBreak') return 10 * 60;
        return 20 * 60;
      }
      // Custom
      if (currentMode === 'work') return settings.workMinutes * 60;
      if (currentMode === 'shortBreak') return settings.shortBreakMinutes * 60;
      return settings.longBreakMinutes * 60;
    },
    [settings]
  );

  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => getDurationForMode('work', '25/5'));

  const targetEndTimeRef = useRef<number | null>(null);
  const focusSessionStartRef = useRef<number | null>(null);

  // Restore state
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.POMODORO_ACTIVE);
      if (saved) {
        const state: StoredPomodoroState = JSON.parse(saved);
        setMode(state.mode);
        setPreset(state.preset);
        setSessionIndex(state.sessionIndex || 1);
        if (state.currentTaskTitle) setCurrentTaskTitle(state.currentTaskTitle);

        if (state.isRunning && state.targetEndTime) {
          const diffSec = Math.max(0, Math.round((state.targetEndTime - Date.now()) / 1000));
          targetEndTimeRef.current = state.targetEndTime;
          setRemainingSeconds(diffSec);
          setIsRunning(true);
        } else {
          setRemainingSeconds(state.remainingSeconds);
        }
      }
    } catch (e) {
      console.error('Error restoring pomodoro state:', e);
    }
  }, []);

  const persistState = useCallback(
    (
      running: boolean,
      targetEnd: number | null,
      remain: number,
      curMode: PomodoroMode,
      curPreset: PomodoroPreset,
      sessIdx: number,
      taskTitle: string
    ) => {
      try {
        const payload: StoredPomodoroState = {
          mode: curMode,
          preset: curPreset,
          sessionIndex: sessIdx,
          isRunning: running,
          remainingSeconds: remain,
          targetEndTime: targetEnd,
          currentTaskTitle: taskTitle,
        };
        localStorage.setItem(STORAGE_KEYS.POMODORO_ACTIVE, JSON.stringify(payload));
      } catch {
        // ignore
      }
    },
    []
  );

  // Complete phase logic
  const handlePhaseComplete = useCallback(() => {
    setIsRunning(false);
    targetEndTimeRef.current = null;

    if (mode === 'work') {
      // Sound chime
      if (soundEnabled) {
        soundEngine.playComplete(soundVolume);
      }

      // Notify browser if permitted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('PowerHouse Pomodoro Complete!', {
          body: 'Great focus session! Time for a well-deserved break.',
          icon: '/favicon.ico',
        });
      }

      // Record session
      const now = Date.now();
      const durationSec = getDurationForMode('work', preset);
      const startTime = focusSessionStartRef.current || (now - durationSec * 1000);
      focusSessionStartRef.current = null;

      if (onSessionComplete) {
        const session: Session = {
          id: `pomo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title: currentTaskTitle || 'Pomodoro Focus Session',
          type: 'pomodoro',
          startTime,
          endTime: now,
          duration: durationSec,
          date: new Date(startTime).toISOString().split('T')[0],
        };
        onSessionComplete(session);
      }

      // Transition to break
      const isLongBreak = sessionIndex % (settings.longBreakInterval || 4) === 0;
      const nextMode: PomodoroMode = isLongBreak ? 'longBreak' : 'shortBreak';
      setMode(nextMode);
      const nextDuration = getDurationForMode(nextMode, preset);
      setRemainingSeconds(nextDuration);

      if (settings.autoStartBreaks) {
        const targetEnd = Date.now() + nextDuration * 1000;
        targetEndTimeRef.current = targetEnd;
        setIsRunning(true);
        persistState(true, targetEnd, nextDuration, nextMode, preset, sessionIndex, currentTaskTitle);
      } else {
        persistState(false, null, nextDuration, nextMode, preset, sessionIndex, currentTaskTitle);
      }
    } else {
      // Break finished
      if (soundEnabled) {
        soundEngine.playBreak(soundVolume);
      }

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('PowerHouse Break Over!', {
          body: 'Ready to crush your next focus session? JUST DO IT!',
          icon: '/favicon.ico',
        });
      }

      const nextSessionIndex = mode === 'longBreak' ? 1 : sessionIndex + 1;
      setSessionIndex(nextSessionIndex);
      setMode('work');
      const nextDuration = getDurationForMode('work', preset);
      setRemainingSeconds(nextDuration);

      if (settings.autoStartWork) {
        const targetEnd = Date.now() + nextDuration * 1000;
        targetEndTimeRef.current = targetEnd;
        focusSessionStartRef.current = Date.now();
        setIsRunning(true);
        persistState(true, targetEnd, nextDuration, 'work', preset, nextSessionIndex, currentTaskTitle);
      } else {
        persistState(false, null, nextDuration, 'work', preset, nextSessionIndex, currentTaskTitle);
      }
    }
  }, [
    mode,
    preset,
    sessionIndex,
    currentTaskTitle,
    soundEnabled,
    soundVolume,
    settings,
    getDurationForMode,
    onSessionComplete,
    persistState,
  ]);

  // Main countdown tick loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      if (targetEndTimeRef.current) {
        const now = Date.now();
        const diffSec = Math.max(0, Math.round((targetEndTimeRef.current - now) / 1000));
        setRemainingSeconds(diffSec);

        if (diffSec <= 0) {
          clearInterval(interval);
          handlePhaseComplete();
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, handlePhaseComplete]);

  // Actions
  const start = useCallback(() => {
    const targetEnd = Date.now() + remainingSeconds * 1000;
    targetEndTimeRef.current = targetEnd;
    if (mode === 'work' && !focusSessionStartRef.current) {
      focusSessionStartRef.current = Date.now() - (getDurationForMode(mode, preset) - remainingSeconds) * 1000;
    }
    setIsRunning(true);
    persistState(true, targetEnd, remainingSeconds, mode, preset, sessionIndex, currentTaskTitle);
  }, [remainingSeconds, mode, preset, sessionIndex, currentTaskTitle, getDurationForMode, persistState]);

  const pause = useCallback(() => {
    if (!isRunning) return;
    if (targetEndTimeRef.current) {
      const diffSec = Math.max(0, Math.round((targetEndTimeRef.current - Date.now()) / 1000));
      setRemainingSeconds(diffSec);
    }
    targetEndTimeRef.current = null;
    setIsRunning(false);
    persistState(false, null, remainingSeconds, mode, preset, sessionIndex, currentTaskTitle);
  }, [isRunning, remainingSeconds, mode, preset, sessionIndex, currentTaskTitle, persistState]);

  const reset = useCallback(() => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
    focusSessionStartRef.current = null;
    const duration = getDurationForMode(mode, preset);
    setRemainingSeconds(duration);
    persistState(false, null, duration, mode, preset, sessionIndex, currentTaskTitle);
  }, [mode, preset, sessionIndex, currentTaskTitle, getDurationForMode, persistState]);

  const skip = useCallback(() => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
    if (mode === 'work') {
      setMode('shortBreak');
      const dur = getDurationForMode('shortBreak', preset);
      setRemainingSeconds(dur);
      persistState(false, null, dur, 'shortBreak', preset, sessionIndex, currentTaskTitle);
    } else {
      setMode('work');
      const dur = getDurationForMode('work', preset);
      setRemainingSeconds(dur);
      setSessionIndex((prev) => prev + 1);
      persistState(false, null, dur, 'work', preset, sessionIndex + 1, currentTaskTitle);
    }
  }, [mode, preset, sessionIndex, currentTaskTitle, getDurationForMode, persistState]);

  const changePreset = useCallback(
    (newPreset: PomodoroPreset) => {
      setPreset(newPreset);
      setIsRunning(false);
      targetEndTimeRef.current = null;
      const dur = getDurationForMode(mode, newPreset);
      setRemainingSeconds(dur);
      persistState(false, null, dur, mode, newPreset, sessionIndex, currentTaskTitle);
    },
    [mode, sessionIndex, currentTaskTitle, getDurationForMode, persistState]
  );

  return {
    mode,
    preset,
    sessionIndex,
    totalSessions: settings.longBreakInterval || 4,
    isRunning,
    remainingSeconds,
    totalDuration: getDurationForMode(mode, preset),
    currentTaskTitle,
    setCurrentTaskTitle,
    start,
    pause,
    reset,
    skip,
    changePreset,
    setMode,
  };
}
