export type BlockType = 'pomodoro' | 'meeting' | 'rest' | 'custom';

export interface TimerBlock {
  id: string;
  name: string;
  type: BlockType;
  workDuration: number; // in minutes
  restDuration: number; // in minutes
  cycles: number;
  color?: string;
  icon?: string;
  createdAt: Date;
}

export interface TimerSession {
  id: string;
  blockId: string;
  blockName: string;
  startTime: Date;
  endTime?: Date;
  totalWorkMinutes: number;
  workDescription: string;
  completed: boolean;
  date: string; // YYYY-MM-DD format
}

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  currentBlock: TimerBlock | null;
  currentCycle: number;
  isWorkPhase: boolean;
  timeRemaining: number; // in seconds
  workDescription: string;
  sessionStartTime: Date | null;
}

export const DEFAULT_BLOCKS: Omit<TimerBlock, 'id' | 'createdAt'>[] = [
  {
    name: 'Focus Sprint',
    type: 'pomodoro',
    workDuration: 25,
    restDuration: 5,
    cycles: 4,
    icon: '🎯',
  },
  {
    name: 'Deep Work',
    type: 'pomodoro',
    workDuration: 50,
    restDuration: 10,
    cycles: 2,
    icon: '🧠',
  },
  {
    name: 'Quick Meeting',
    type: 'meeting',
    workDuration: 30,
    restDuration: 0,
    cycles: 1,
    icon: '📞',
  },
  {
    name: 'Long Rest',
    type: 'rest',
    workDuration: 0,
    restDuration: 40,
    cycles: 1,
    icon: '☕',
  },
];
