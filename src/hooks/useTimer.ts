import { useState, useCallback, useRef, useEffect } from 'react';
import { TimerBlock, TimerState, TimerSession } from '@/types/blocks';
import { useLocalStorage } from './useLocalStorage';

const generateId = () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

export function useTimer() {
  const [sessions, setSessions] = useLocalStorage<TimerSession[]>('lemoncello-sessions', []);
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    isPaused: false,
    currentBlock: null,
    currentCycle: 1,
    isWorkPhase: true,
    timeRemaining: 0,
    workDescription: '',
    sessionStartTime: null,
    currentTaskId: undefined,
    currentTaskName: undefined,
  });

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
    block: TimerBlock, 
    description: string, 
    startTime: Date,
    stoppedByUser: boolean = false,
    timeCompletedBeforeStopping?: number
  ) => {
    const now = new Date();
    const expectedDuration = block.type === 'rest' 
      ? block.restDuration 
      : block.workDuration * block.cycles;
    
    const totalWorkMinutes = stoppedByUser && timeCompletedBeforeStopping !== undefined
      ? timeCompletedBeforeStopping
      : (block.type === 'rest' ? 0 : block.workDuration * block.cycles);

    const session: TimerSession = {
      id: generateId(),
      blockId: block.id,
      blockName: block.name,
      startTime,
      endTime: now,
      totalWorkMinutes,
      workDescription: description,
      completed: !stoppedByUser,
      stoppedByUser,
      timeCompletedBeforeStopping: stoppedByUser ? timeCompletedBeforeStopping : undefined,
      expectedDuration,
      date: now.toISOString().split('T')[0],
      taskId: timerState.currentTaskId,
      taskName: timerState.currentTaskName,
    };

    setSessions(prev => [...prev, session]);
  }, [setSessions, timerState.currentTaskId, timerState.currentTaskName]);

  const startBlock = useCallback((block: TimerBlock, taskId?: string, taskName?: string) => {
    requestNotificationPermission();
    
    const initialTime = block.type === 'rest' 
      ? block.restDuration * 60 
      : block.workDuration * 60;

    sendNotification('Timer Started! 🚀', `${block.name} - Let's go!`, true);

    setTimerState({
      isRunning: true,
      isPaused: false,
      currentBlock: block,
      currentCycle: 1,
      isWorkPhase: block.type !== 'rest',
      timeRemaining: initialTime,
      workDescription: '',
      sessionStartTime: new Date(),
      currentTaskId: taskId,
      currentTaskName: taskName,
    });
  }, [requestNotificationPermission, sendNotification]);

  const pauseTimer = useCallback(() => {
    setTimerState(prev => ({ ...prev, isPaused: true, isRunning: false }));
  }, []);

  const resumeTimer = useCallback(() => {
    playStartSound();
    setTimerState(prev => ({ ...prev, isPaused: false, isRunning: true }));
  }, [playStartSound]);

  const stopTimer = useCallback(() => {
    if (timerState.currentBlock && timerState.sessionStartTime) {
      const block = timerState.currentBlock;
      const expectedTotalSeconds = block.type === 'rest'
        ? block.restDuration * 60
        : block.workDuration * 60 * block.cycles + block.restDuration * 60 * (block.cycles - 1);
      
      const elapsedSeconds = expectedTotalSeconds - timerState.timeRemaining;
      const timeCompletedMinutes = Math.floor(elapsedSeconds / 60);
      
      completeSession(
        timerState.currentBlock,
        timerState.workDescription,
        timerState.sessionStartTime,
        true,
        timeCompletedMinutes
      );
    }
    
    setTimerState({
      isRunning: false,
      isPaused: false,
      currentBlock: null,
      currentCycle: 1,
      isWorkPhase: true,
      timeRemaining: 0,
      workDescription: '',
      sessionStartTime: null,
      currentTaskId: undefined,
      currentTaskName: undefined,
    });
  }, [timerState, completeSession]);

  const updateWorkDescription = useCallback((description: string) => {
    setTimerState(prev => ({ ...prev, workDescription: description }));
  }, []);

  const tick = useCallback(() => {
    setTimerState(prev => {
      if (!prev.isRunning || prev.isPaused || !prev.currentBlock) {
        return prev;
      }

      const newTimeRemaining = prev.timeRemaining - 1;

      if (newTimeRemaining <= 0) {
        const block = prev.currentBlock;
        
        if (block.type === 'meeting' || block.type === 'rest') {
          sendNotification('Timer Complete! ✨', `${block.name} has finished.`);
          if (prev.sessionStartTime) {
            completeSession(block, prev.workDescription, prev.sessionStartTime, false);
          }
          return {
            ...prev,
            isRunning: false,
            isPaused: false,
            currentBlock: null,
            timeRemaining: 0,
            currentTaskId: undefined,
            currentTaskName: undefined,
          };
        }

        if (prev.isWorkPhase) {
          if (prev.currentCycle >= block.cycles) {
            sendNotification('Block Complete! 🎉', `${block.name} - All cycles finished!`);
            if (prev.sessionStartTime) {
              completeSession(block, prev.workDescription, prev.sessionStartTime, false);
            }
            return {
              ...prev,
              isRunning: false,
              isPaused: false,
              currentBlock: null,
              timeRemaining: 0,
              currentTaskId: undefined,
              currentTaskName: undefined,
            };
          }
          
          sendNotification('Break Time! ☕', `Take a ${block.restDuration} minute break.`);
          return {
            ...prev,
            isWorkPhase: false,
            timeRemaining: block.restDuration * 60,
          };
        } else {
          sendNotification('Back to Work! 💪', `Starting cycle ${prev.currentCycle + 1} of ${block.cycles}.`, true);
          return {
            ...prev,
            isWorkPhase: true,
            currentCycle: prev.currentCycle + 1,
            timeRemaining: block.workDuration * 60,
          };
        }
      }

      return { ...prev, timeRemaining: newTimeRemaining };
    });
  }, [sendNotification, completeSession]);

  useEffect(() => {
    if (timerState.isRunning && !timerState.isPaused) {
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
  }, [timerState.isRunning, timerState.isPaused, tick]);

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

  return {
    timerState,
    sessions,
    startBlock,
    pauseTimer,
    resumeTimer,
    stopTimer,
    updateWorkDescription,
    getTodaySessions,
    getSessionsByDate,
    getSessionsByTask,
    hasIncompleteSprint,
    clearSessions,
  };
}
