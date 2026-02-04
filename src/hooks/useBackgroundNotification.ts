import { useEffect, useRef, useCallback } from 'react';

interface UseBackgroundNotificationProps {
  isRunning: boolean;
  timeRemaining: number;
  blockName: string;
  isWorkPhase: boolean;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function useBackgroundNotification({
  isRunning,
  timeRemaining,
  blockName,
  isWorkPhase,
}: UseBackgroundNotificationProps) {
  const notificationRef = useRef<Notification | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const closeNotification = useCallback(() => {
    if (notificationRef.current) {
      notificationRef.current.close();
      notificationRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const showPersistentNotification = useCallback(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    closeNotification();

    const phase = isWorkPhase ? 'Work' : 'Break';
    const timeStr = formatTime(timeRemaining);

    notificationRef.current = new Notification(`${timeStr} - ${blockName}`, {
      body: `${phase} in progress`,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'lemoncello-persistent',
      silent: true,
      requireInteraction: true,
    });

    notificationRef.current.onclick = () => {
      window.focus();
      closeNotification();
    };
  }, [timeRemaining, blockName, isWorkPhase, closeNotification]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning) {
        showPersistentNotification();
        
        // Update notification every 30 seconds while in background
        intervalRef.current = setInterval(() => {
          showPersistentNotification();
        }, 30000);
      } else {
        closeNotification();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      closeNotification();
    };
  }, [isRunning, showPersistentNotification, closeNotification]);

  // Clean up when timer stops
  useEffect(() => {
    if (!isRunning) {
      closeNotification();
    }
  }, [isRunning, closeNotification]);

  return { closeNotification };
}
