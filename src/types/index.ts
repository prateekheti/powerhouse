export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  category?: string;
  createdAt: number;
  completedAt?: number;
}

export type SessionType = 'stopwatch' | 'pomodoro' | 'quickstart';

export interface Session {
  id: string;
  title: string;
  type: SessionType;
  startTime: number; // Unix timestamp ms
  endTime: number;   // Unix timestamp ms
  duration: number;  // In seconds
  date: string;      // YYYY-MM-DD
  notes?: string;
}

export type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';
export type PomodoroPreset = '25/5' | '50/10' | 'custom';

export interface PomodoroSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
}

export interface UserSettings {
  dailyGoalMinutes: number;
  weeklyGoalMinutes: number;
  soundEnabled: boolean;
  soundVolume: number; // 0 to 1
  notificationsEnabled: boolean;
  pomodoro: PomodoroSettings;
}

export interface DailySummary {
  date: string;
  totalSeconds: number;
  sessionCount: number;
  pomodoroCount: number;
  completedTasks: number;
  totalTasks: number;
  streakDays: number;
}

export interface DayGraphPoint {
  label: string; // e.g. "09:00", "Mon", "Day 1"
  dateKey: string;
  minutes: number;
  sessionCount: number;
}
