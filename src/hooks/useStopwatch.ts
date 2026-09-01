import { useState, useEffect, useRef, useCallback } from 'react';
import { Session } from '../types';
import { STORAGE_KEYS } from '../utils/storage';

interface StoredStopwatchState {
  isRunning: boolean;
  startTime: number | null;
  accumulatedMs: number;
  title: string;
}

export function useStopwatch(onSessionComplete?: (session: Session) => void) {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [title, setTitle] = useState<string>('Deep Focus Session');
  
  const startTimeRef = useRef<number | null>(null);
  const accumulatedMsRef = useRef<number>(0);
  const initialStartTimestampRef = useRef<number | null>(null);

  // Load active state from localStorage on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STOPWATCH_ACTIVE);
      if (saved) {
        const state: StoredStopwatchState = JSON.parse(saved);
        if (state.title) setTitle(state.title);
        
        accumulatedMsRef.current = state.accumulatedMs || 0;
        
        if (state.isRunning && state.startTime) {
          startTimeRef.current = state.startTime;
          initialStartTimestampRef.current = state.startTime;
          setIsRunning(true);
          const currentTotalMs = accumulatedMsRef.current + (Date.now() - state.startTime);
          setElapsedSeconds(Math.floor(currentTotalMs / 1000));
        } else {
          setElapsedSeconds(Math.floor((state.accumulatedMs || 0) / 1000));
        }
      }
    } catch (e) {
      console.error('Error restoring stopwatch state:', e);
    }
  }, []);

  // Sync to localStorage
  const persistState = useCallback((running: boolean, start: number | null, accum: number, currentTitle: string) => {
    try {
      const payload: StoredStopwatchState = {
        isRunning: running,
        startTime: start,
        accumulatedMs: accum,
        title: currentTitle,
      };
      localStorage.setItem(STORAGE_KEYS.STOPWATCH_ACTIVE, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }, []);

  // Tick loop based on actual timestamp
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      if (startTimeRef.current) {
        const now = Date.now();
        const currentRunMs = now - startTimeRef.current;
        const totalMs = accumulatedMsRef.current + currentRunMs;
        setElapsedSeconds(Math.floor(totalMs / 1000));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning]);

  const start = useCallback((customTitle?: string) => {
    const sessionTitle = customTitle || title || 'Deep Focus Session';
    if (customTitle) setTitle(customTitle);

    const now = Date.now();
    startTimeRef.current = now;
    if (!initialStartTimestampRef.current) {
      initialStartTimestampRef.current = now - accumulatedMsRef.current;
    }
    setIsRunning(true);
    persistState(true, now, accumulatedMsRef.current, sessionTitle);
  }, [title, persistState]);

  const stop = useCallback(() => {
    if (!isRunning && elapsedSeconds === 0) return;

    const now = Date.now();
    let totalMs = accumulatedMsRef.current;
    if (isRunning && startTimeRef.current) {
      totalMs += now - startTimeRef.current;
    }

    const durationSec = Math.floor(totalMs / 1000);
    const sessionStart = initialStartTimestampRef.current || (now - totalMs);

    setIsRunning(false);
    startTimeRef.current = null;
    accumulatedMsRef.current = 0;
    initialStartTimestampRef.current = null;
    setElapsedSeconds(0);

    localStorage.removeItem(STORAGE_KEYS.STOPWATCH_ACTIVE);

    // Save session if duration is at least 3 seconds (prevent accidental zero clicks)
    if (durationSec >= 3 && onSessionComplete) {
      const sessionDate = new Date(sessionStart).toISOString().split('T')[0];
      const newSession: Session = {
        id: `sw-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: title || 'Deep Focus Session',
        type: 'stopwatch',
        startTime: sessionStart,
        endTime: now,
        duration: durationSec,
        date: sessionDate,
      };
      onSessionComplete(newSession);
    }
  }, [isRunning, elapsedSeconds, title, onSessionComplete]);

  const pause = useCallback(() => {
    if (!isRunning) return;
    const now = Date.now();
    if (startTimeRef.current) {
      accumulatedMsRef.current += now - startTimeRef.current;
    }
    startTimeRef.current = null;
    setIsRunning(false);
    persistState(false, null, accumulatedMsRef.current, title);
  }, [isRunning, title, persistState]);

  const reset = useCallback(() => {
    setIsRunning(false);
    startTimeRef.current = null;
    accumulatedMsRef.current = 0;
    initialStartTimestampRef.current = null;
    setElapsedSeconds(0);
    localStorage.removeItem(STORAGE_KEYS.STOPWATCH_ACTIVE);
  }, []);

  return {
    isRunning,
    elapsedSeconds,
    title,
    setTitle,
    start,
    stop,
    pause,
    reset,
  };
}
