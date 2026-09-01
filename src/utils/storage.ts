import { Task, Session, UserSettings } from '../types';

export const STORAGE_KEYS = {
  TASKS: 'powerhouse_tasks_v1',
  SESSIONS: 'powerhouse_sessions_v1',
  SETTINGS: 'powerhouse_settings_v1',
  STOPWATCH_ACTIVE: 'powerhouse_stopwatch_active_v1',
  POMODORO_ACTIVE: 'powerhouse_pomodoro_active_v1',
  STREAK_CACHE: 'powerhouse_streak_cache_v1',
};

export const DEFAULT_SETTINGS: UserSettings = {
  dailyGoalMinutes: 240, // 4 hours
  weeklyGoalMinutes: 1200, // 20 hours
  soundEnabled: true,
  soundVolume: 0.8,
  notificationsEnabled: true,
  pomodoro: {
    workMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartWork: false,
  },
};

// Generate realistic past seed sessions for streak & graph preview
export function getInitialSeedSessions(): Session[] {
  const sessions: Session[] = [];
  const now = new Date();
  
  // Format YYYY-MM-DD
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  // Generate 14 days of history to build a 12-day streak!
  const titles = [
    'Deep Work: Core Engine',
    'PowerHouse UI Blueprint',
    'Algorithm Optimization',
    'System Architecture',
    'Refactoring & Code Review',
    'Study Session: Distributed Systems',
    'Database Schema Design',
    'UI Design & Geometric Layout',
  ];

  // Days 0 to 11 (12 days streak)
  for (let i = 11; i >= 0; i--) {
    const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = formatDate(day);

    let daySessionsCount = 3 + (i % 3);
    if (i === 0) daySessionsCount = 5; // Today has 5 sessions matching prompt!

    for (let s = 0; s < daySessionsCount; s++) {
      const startHour = 8 + s * 2 + Math.floor(Math.random() * 2);
      const startMin = 10 + Math.floor(Math.random() * 40);
      const durationMins = i === 0 
        ? (s === 0 ? 55 : s === 1 ? 45 : s === 2 ? 50 : s === 3 ? 40 : 32) // Sums to 222m = 3h 42m!
        : (25 + (s * 15) + (i % 2 === 0 ? 10 : -5));
      
      const startTime = new Date(day);
      startTime.setHours(startHour, startMin, 0, 0);
      const endTime = new Date(startTime.getTime() + durationMins * 60 * 1000);

      sessions.push({
        id: `seed-session-${i}-${s}`,
        title: titles[(i + s) % titles.length],
        type: s % 2 === 0 ? 'pomodoro' : 'stopwatch',
        startTime: startTime.getTime(),
        endTime: endTime.getTime(),
        duration: durationMins * 60,
        date: dateStr,
      });
    }
  }

  return sessions;
}

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Finish PowerHouse productivity system',
    completed: false,
    priority: 'high',
    category: 'Work',
    createdAt: Date.now() - 3600000 * 4,
  },
  {
    id: 'task-2',
    title: 'Study 2 chapters of Systems Engineering',
    completed: false,
    priority: 'medium',
    category: 'Study',
    createdAt: Date.now() - 3600000 * 3,
  },
  {
    id: 'task-3',
    title: 'Exercise & mobility routine',
    completed: false,
    priority: 'medium',
    category: 'Health',
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'task-4',
    title: 'Review weekly progress metrics',
    completed: true,
    priority: 'low',
    category: 'Admin',
    createdAt: Date.now() - 3600000 * 6,
    completedAt: Date.now() - 3600000 * 1,
  },
  {
    id: 'task-5',
    title: 'Clean workspace & setup monitor mount',
    completed: true,
    priority: 'low',
    category: 'Personal',
    createdAt: Date.now() - 3600000 * 8,
    completedAt: Date.now() - 3600000 * 2,
  },
];

export function loadStoredTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
      return INITIAL_TASKS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load tasks:', err);
    return INITIAL_TASKS;
  }
}

export function saveStoredTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks:', err);
  }
}

export function loadStoredSessions(): Session[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw) {
      const initial = getInitialSeedSessions();
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load sessions:', err);
    return [];
  }
}

export function saveStoredSessions(sessions: Session[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (err) {
    console.error('Failed to save sessions:', err);
  }
}

export function loadStoredSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Failed to load settings:', err);
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function calculateStreak(sessions: Session[]): number {
  if (!sessions || sessions.length === 0) return 0;

  const dateSet = new Set(sessions.map((s) => s.date));
  const today = new Date();
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  let streak = 0;
  let curr = new Date(today);

  // Check today first. If today has sessions, start counting from today.
  // If not, check yesterday (streak isn't broken yet if today is still in progress).
  const todayStr = formatDate(curr);
  if (dateSet.has(todayStr)) {
    streak++;
    curr.setDate(curr.getDate() - 1);
  } else {
    // If today has no sessions, check if yesterday had sessions
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);
    if (dateSet.has(yesterdayStr)) {
      streak++;
      curr = yesterday;
      curr.setDate(curr.getDate() - 1);
    } else {
      return 0;
    }
  }

  // Continue checking previous consecutive days
  while (true) {
    const dateStr = formatDate(curr);
    if (dateSet.has(dateStr)) {
      streak++;
      curr.setDate(curr.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function exportDataAsJSON(tasks: Task[], sessions: Session[], settings: UserSettings): void {
  const data = {
    app: 'PowerHouse',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    tasks,
    sessions,
    settings,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `powerhouse-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportSessionsAsCSV(sessions: Session[]): void {
  const headers = ['ID', 'Title', 'Type', 'Date', 'Start Time', 'End Time', 'Duration (Seconds)', 'Duration (Minutes)'];
  const rows = sessions.map((s) => [
    s.id,
    `"${(s.title || 'Untitled').replace(/"/g, '""')}"`,
    s.type,
    s.date,
    new Date(s.startTime).toLocaleTimeString(),
    new Date(s.endTime).toLocaleTimeString(),
    s.duration,
    (s.duration / 60).toFixed(1),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `powerhouse-sessions-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
