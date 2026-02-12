import { useEffect, useRef, useCallback } from 'react';

export function useWakeLock(isActive: boolean) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const requestWakeLock = useCallback(async () => {
    if (!('wakeLock' in navigator)) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
      wakeLockRef.current.addEventListener('release', () => {
        wakeLockRef.current = null;
      });
    } catch (e) {
      // Wake lock request failed (e.g., low battery)
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  }, []);

  // Re-acquire wake lock when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isActive && !wakeLockRef.current) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isActive, requestWakeLock]);

  // Acquire/release based on active state
  useEffect(() => {
    if (isActive) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    return () => releaseWakeLock();
  }, [isActive, requestWakeLock, releaseWakeLock]);

  return { releaseWakeLock };
}
