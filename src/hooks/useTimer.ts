import { useState, useCallback, useRef, useEffect } from 'react';
import { TimerBlock, TimerState, TimerSession } from '@/types/blocks';
import { useLocalStorage } from './useLocalStorage';

const generateId = () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

// Quick Start block - infinite pomodoro (uses cycle 1 but allows infinite continuation)
const QUICK_START_BLOCK: TimerBlock = {
  id: 'quick-start',
  name: 'Quick Start',
  type: 'pomodoro',
  workDuration: 25,
  restDuration: 5,
  cycles: 9999, // Practically infinite
  icon: '⚡',
  createdAt: new Date(),
};

const createEmptyTimerState = (): TimerState => ({
  id: generateId(),
  isRunning: false,
  isPaused: false,
  isMinimized: false,
  currentBlock: null,
  currentCycle: 1,
  isWorkPhase: true,
  timeRemaining: 0,
  workDescription: '',
  sessionStartTime: null,
  currentTaskId: undefined,
  currentTaskName: undefined,
  accumulatedRestTime: 0,
  skippedBreaksCount: 0,
});

export function useTimer() {
  const [sessions, setSessions] = useLocalStorage<TimerSession[]>('lemoncello-sessions', []);
  const [activeTimer, setActiveTimer] = useState<TimerState>(createEmptyTimerState());
  const [minimizedTimers, setMinimizedTimers] = useState<TimerState[]>([]);
  
  const [pendingTransition, setPendingTransition] = useState<'work-to-break' | 'break-to-work' | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startAudioRef = useRef<HTMLAudioElement | null>(null);
  const endAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    startAudioRef.current = new Audio('/sounds/start.mp3');
    startAudioRef.current.volume = 0.6;
    
    endAudioRef.current = new Audio('/sounds/end.mp3');
    endAudioRef.current.volume = 0.6;
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const playStartSound = useCallback(() => {
    if (startAudioRef.current) {
      startAudioRef.current.currentTime = 0;
      startAudioRef.current.play().catch(() => {});
    }
  }, []);

  const playEndSound = useCallback(() => {
    if (endAudioRef.current) {
      endAudioRef.current.currentTime = 0;
      endAudioRef.current.play().catch(() => {});
    }
  }, []);

  const sendNotification = useCallback((title: string, body: string, isStart = false) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { 
        body, 
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'lemoncello-timer',
        requireInteraction: true,
      });
    }
    
    if (isStart) {
      playStartSound();
    } else {
      playEndSound();
    }
  }, [playStartSound, playEndSound]);

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  const completeSession = useCallback((
    timer: TimerState,
    description: string,
    stoppedByUser: boolean = false,
    timeCompletedBeforeStopping?: number,
  ) => {
    if (!timer.currentBlock || !timer.sessionStartTime) return;
    
    const block = timer.currentBlock;
    const now = new Date();
    const cyclesForCalc = timer.currentCycle;
    const expectedDuration = block.type === 'rest' 
      ? block.restDuration 
      : block.workDuration * Math.min(cyclesForCalc, 100);
    
    const totalWorkMinutes = stoppedByUser && timeCompletedBeforeStopping !== undefined
      ? timeCompletedBeforeStopping
      : (block.type === 'rest' ? 0 : block.workDuration * Math.min(cyclesForCalc, 100));

    const session: TimerSession = {
      id: generateId(),
      blockId: block.id,
      blockName: block.name,
      startTime: timer.sessionStartTime,
      endTime: now,
      totalWorkMinutes,
      workDescription: description,
      completed: !stoppedByUser,
      stoppedByUser,
      timeCompletedBeforeStopping: stoppedByUser ? timeCompletedBeforeStopping : undefined,
      expectedDuration,
      date: now.toISOString().split('T')[0],
      taskId: timer.currentTaskId,
      taskName: timer.currentTaskName,
    };

    setSessions(prev => [...prev, session]);
  }, [setSessions]);

  const startBlock = useCallback((block: TimerBlock) => {
    requestNotificationPermission();
    
    const initialTime = block.type === 'rest' 
      ? block.restDuration * 60 
      : block.workDuration * 60;

    sendNotification('Timer Started! 🚀', `${block.name} - Let's go!`, true);

    const newTimer: TimerState = {
      id: generateId(),
      isRunning: true,
      isPaused: false,
      isMinimized: false,
      currentBlock: block,
      currentCycle: 1,
      isWorkPhase: block.type !== 'rest',
      timeRemaining: initialTime,
      workDescription: block.description || '',
      sessionStartTime: new Date(),
      currentTaskId: block.id,
      currentTaskName: block.name,
      accumulatedRestTime: 0,
      skippedBreaksCount: 0,
    };

    setActiveTimer(newTimer);
  }, [requestNotificationPermission, sendNotification]);

  const pauseTimer = useCallback(() => {
    setActiveTimer(prev => ({ ...prev, isPaused: true, isRunning: false }));
  }, []);

  const resumeTimer = useCallback(() => {
    playStartSound();
    setActiveTimer(prev => ({ ...prev, isPaused: false, isRunning: true }));
  }, [playStartSound]);

  const minimizeTimer = useCallback(() => {
    setActiveTimer(prev => {
      if (!prev.currentBlock) return prev;
      
      // Pause and mark as minimized
      const minimizedTimer: TimerState = {
        ...prev,
        isRunning: false,
        isPaused: true,
        isMinimized: true,
      };
      
      // Add to minimized timers list
      setMinimizedTimers(prevMinimized => [...prevMinimized, minimizedTimer]);
      
      // Reset active timer
      return createEmptyTimerState();
    });
    setPendingTransition(null);
  }, []);

  const resumeMinimizedTimer = useCallback((timerId: string) => {
    const timerToResume = minimizedTimers.find(t => t.id === timerId);
    if (!timerToResume) return;

    // If there's an active timer, minimize it first
    if (activeTimer.currentBlock) {
      const currentAsMinimized: TimerState = {
        ...activeTimer,
        isRunning: false,
        isPaused: true,
        isMinimized: true,
      };
      setMinimizedTimers(prev => 
        prev.filter(t => t.id !== timerId).concat(currentAsMinimized)
      );
    } else {
      // Just remove the resumed timer from minimized list
      setMinimizedTimers(prev => prev.filter(t => t.id !== timerId));
    }

    // Restore the timer as active and running
    playStartSound();
    setActiveTimer({
      ...timerToResume,
      isRunning: true,
      isPaused: false,
      isMinimized: false,
    });
  }, [minimizedTimers, activeTimer, playStartSound]);

  const stopTimerWithDescription = useCallback((description: string, timerId?: string) => {
    // If stopping a minimized timer
    if (timerId) {
      const timerToStop = minimizedTimers.find(t => t.id === timerId);
      if (timerToStop && timerToStop.sessionStartTime) {
        const now = new Date();
        const actualElapsedMs = now.getTime() - timerToStop.sessionStartTime.getTime();
        const timeCompletedMinutes = Math.floor(actualElapsedMs / 60000);
        
        completeSession(timerToStop, description, true, timeCompletedMinutes);
        setMinimizedTimers(prev => prev.filter(t => t.id !== timerId));
      }
      return;
    }

    // Stop active timer
    if (activeTimer.currentBlock && activeTimer.sessionStartTime) {
      const now = new Date();
      const actualElapsedMs = now.getTime() - activeTimer.sessionStartTime.getTime();
      const timeCompletedMinutes = Math.floor(actualElapsedMs / 60000);
      
      completeSession(activeTimer, description, true, timeCompletedMinutes);
    }
    
    setActiveTimer(createEmptyTimerState());
    setPendingTransition(null);
  }, [activeTimer, minimizedTimers, completeSession]);

  const cancelTimer = useCallback(() => {
    setActiveTimer(createEmptyTimerState());
    setPendingTransition(null);
  }, []);

  const getElapsedTime = useCallback(() => {
    if (!activeTimer.sessionStartTime) return '0 min';
    
    const now = new Date();
    const actualElapsedMs = now.getTime() - activeTimer.sessionStartTime.getTime();
    const totalSeconds = Math.floor(actualElapsedMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}min`;
    }
    return `${minutes} min`;
  }, [activeTimer.sessionStartTime]);

  const startQuickStart = useCallback(() => {
    startBlock(QUICK_START_BLOCK);
  }, [startBlock]);

  const confirmTransition = useCallback(() => {
    if (!activeTimer.currentBlock || !pendingTransition) return;
    
    const block = activeTimer.currentBlock;
    
    if (pendingTransition === 'work-to-break') {
      playEndSound();
      const breakDuration = activeTimer.accumulatedRestTime > 0 
        ? activeTimer.accumulatedRestTime 
        : block.restDuration;
      setActiveTimer(prev => ({
        ...prev,
        isRunning: true,
        isPaused: false,
        isWorkPhase: false,
        timeRemaining: breakDuration * 60,
        accumulatedRestTime: 0,
        skippedBreaksCount: 0,
      }));
    } else {
      playStartSound();
      setActiveTimer(prev => ({
        ...prev,
        isRunning: true,
        isPaused: false,
        isWorkPhase: true,
        currentCycle: prev.currentCycle + 1,
        timeRemaining: block.workDuration * 60,
      }));
    }
    
    setPendingTransition(null);
  }, [activeTimer.currentBlock, activeTimer.accumulatedRestTime, pendingTransition, playEndSound, playStartSound]);

  const keepWorking = useCallback(() => {
    if (!activeTimer.currentBlock || pendingTransition !== 'work-to-break') return;
    
    const block = activeTimer.currentBlock;
    
    const additionalRest = activeTimer.skippedBreaksCount === 0 ? block.restDuration : 5;
    
    playStartSound();
    setActiveTimer(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false,
      isWorkPhase: true,
      timeRemaining: block.workDuration * 60,
      accumulatedRestTime: prev.accumulatedRestTime + additionalRest,
      skippedBreaksCount: prev.skippedBreaksCount + 1,
    }));
    
    setPendingTransition(null);
  }, [activeTimer.currentBlock, activeTimer.skippedBreaksCount, pendingTransition, playStartSound]);

  const updateWorkDescription = useCallback((description: string) => {
    setActiveTimer(prev => ({ ...prev, workDescription: description }));
  }, []);

  const tick = useCallback(() => {
    setActiveTimer(prev => {
      if (!prev.isRunning || prev.isPaused || !prev.currentBlock) {
        return prev;
      }

      const newTimeRemaining = prev.timeRemaining - 1;

      if (newTimeRemaining <= 0) {
        const block = prev.currentBlock;
        
        if (block.type === 'meeting' || block.type === 'rest') {
          sendNotification('Timer Complete! ✨', `${block.name} has finished.`);
          if (prev.sessionStartTime) {
            completeSession(prev, prev.workDescription, false);
          }
          return createEmptyTimerState();
        }

        if (prev.isWorkPhase) {
          if (prev.currentCycle >= block.cycles) {
            sendNotification('Block Complete! 🎉', `${block.name} - All cycles finished!`);
            if (prev.sessionStartTime) {
              completeSession(prev, prev.workDescription, false);
            }
            return createEmptyTimerState();
          }
          
          sendNotification('Break Time! ☕', `Take a ${block.restDuration} minute break.`);
          setPendingTransition('work-to-break');
          return {
            ...prev,
            isRunning: false,
            isPaused: true,
            timeRemaining: block.restDuration * 60,
          };
        } else {
          sendNotification('Back to Work! 💪', `Starting cycle ${prev.currentCycle + 1}.`);
          setPendingTransition('break-to-work');
          return {
            ...prev,
            isRunning: false,
            isPaused: true,
            timeRemaining: block.workDuration * 60,
          };
        }
      }

      return { ...prev, timeRemaining: newTimeRemaining };
    });
  }, [sendNotification, completeSession]);

  useEffect(() => {
    if (activeTimer.isRunning && !activeTimer.isPaused) {
      intervalRef.current = setInterval(tick, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activeTimer.isRunning, activeTimer.isPaused, tick]);

  const getTodaySessions = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return sessions.filter(s => s.date === today);
  }, [sessions]);

  const getSessionsByDate = useCallback((date: string) => {
    return sessions.filter(s => s.date === date);
  }, [sessions]);

  const getSessionsByTask = useCallback((taskId: string) => {
    return sessions.filter(s => s.taskId === taskId);
  }, [sessions]);

  const hasIncompleteSprint = useCallback((taskId: string) => {
    return sessions.some(s => s.taskId === taskId && s.stoppedByUser);
  }, [sessions]);

  const clearSessions = useCallback(() => {
    setSessions([]);
  }, [setSessions]);

  const addSession = useCallback((session: Omit<TimerSession, 'id'>) => {
    const newSession: TimerSession = {
      ...session,
      id: generateId(),
    };
    setSessions(prev => [...prev, newSession]);
  }, [setSessions]);

  // Expose timerState for backward compatibility - maps activeTimer to old structure
  const timerState = activeTimer;

  return {
    timerState,
    activeTimer,
    minimizedTimers,
    sessions,
    pendingTransition,
    accumulatedRestTime: activeTimer.accumulatedRestTime,
    skippedBreaksCount: activeTimer.skippedBreaksCount,
    startBlock,
    startQuickStart,
    pauseTimer,
    resumeTimer,
    minimizeTimer,
    resumeMinimizedTimer,
    stopTimerWithDescription,
    cancelTimer,
    confirmTransition,
    keepWorking,
    updateWorkDescription,
    getElapsedTime,
    getTodaySessions,
    getSessionsByDate,
    getSessionsByTask,
    hasIncompleteSprint,
    clearSessions,
    addSession,
  };
}
