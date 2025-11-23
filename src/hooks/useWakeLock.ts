import { useEffect, useRef, useState, useCallback } from 'react';

export const useWakeLock = () => {
    const wakeLock = useRef<WakeLockSentinel | null>(null);
    const [isLocked, setIsLocked] = useState(false);

    const requestWakeLock = useCallback(async () => {
        if ('wakeLock' in navigator) {
            try {
                wakeLock.current = await navigator.wakeLock.request('screen');
                setIsLocked(true);
                console.log('Screen Wake Lock acquired');

                wakeLock.current.addEventListener('release', () => {
                    setIsLocked(false);
                    console.log('Screen Wake Lock released');
                });
            } catch (err) {
                console.error(`${err instanceof Error ? err.name : 'Error'}, ${err instanceof Error ? err.message : 'Unknown error'}`);
            }
        } else {
            console.warn('Wake Lock API not supported in this browser.');
        }
    }, []);

    const releaseWakeLock = useCallback(async () => {
        if (wakeLock.current) {
            try {
                await wakeLock.current.release();
                wakeLock.current = null;
            } catch (err) {
                console.error(`${err instanceof Error ? err.name : 'Error'}, ${err instanceof Error ? err.message : 'Unknown error'}`);
            }
        }
    }, []);

    useEffect(() => {
        requestWakeLock();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                requestWakeLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            releaseWakeLock();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [requestWakeLock, releaseWakeLock]);

    return { isLocked, requestWakeLock, releaseWakeLock };
};
