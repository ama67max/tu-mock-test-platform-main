/**
 * useOnlineStatus Hook
 * Monitors network connectivity and provides online/offline status
 * Includes change detection, history tracking, and callback support
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for monitoring online/offline status
 * @param {Object} options - Configuration options
 * @param {Function} options.onOnline - Callback when connection restored
 * @param {Function} options.onOffline - Callback when connection lost
 * @param {number} options.checkInterval - Interval for periodic checks (ms)
 * @returns {Object} Online status and utilities
 */
export const useOnlineStatus = (options = {}) => {
  const {
    onOnline,
    onOffline,
    checkInterval = 30000, // Check every 30 seconds
  } = options;

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(!navigator.onLine);
  const [lastOnlineTime, setLastOnlineTime] = useState(Date.now());
  const [lastOfflineTime, setLastOfflineTime] = useState(null);
  const [connectionChanges, setConnectionChanges] = useState(0);

  // Handle online event
  const handleOnline = useCallback(() => {
    setIsOnline(true);
    setLastOnlineTime(Date.now());
    setConnectionChanges(prev => prev + 1);
    
    // Track if user was offline
    if (!isOnline) {
      setWasOffline(true);
      
      // Call onOnline callback
      if (onOnline) {
        onOnline();
      }
      
      console.log('🟢 Connection restored');
    }
  }, [isOnline, onOnline]);

  // Handle offline event
  const handleOffline = useCallback(() => {
    setIsOnline(false);
    setLastOfflineTime(Date.now());
    setConnectionChanges(prev => prev + 1);
    
    // Call onOffline callback
    if (onOffline) {
      onOffline();
    }
    
    console.log('🔴 Connection lost');
  }, [onOffline]);

  // Advanced connectivity check (beyond navigator.onLine)
  const checkConnectivity = useCallback(async () => {
    try {
      // Try to fetch a small resource
      const response = await fetch('/manifest.webmanifest', {
        method: 'HEAD',
        cache: 'no-cache',
      });
      
      if (response.ok && !isOnline) {
        handleOnline();
      }
    } catch (error) {
      if (isOnline) {
        handleOffline();
      }
    }
  }, [isOnline, handleOnline, handleOffline]);

  // Setup event listeners and periodic checks
  useEffect(() => {
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic connectivity check
    const intervalId = checkInterval > 0 
      ? setInterval(checkConnectivity, checkInterval)
      : null;

    // Initial check
    if (navigator.onLine && !isOnline) {
      handleOnline();
    } else if (!navigator.onLine && isOnline) {
      handleOffline();
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [handleOnline, handleOffline, checkConnectivity, checkInterval, isOnline]);

  // Calculate offline duration
  const getOfflineDuration = useCallback(() => {
    if (isOnline || !lastOfflineTime) return 0;
    return Date.now() - lastOfflineTime;
  }, [isOnline, lastOfflineTime]);

  // Get time since last online
  const getTimeSinceOnline = useCallback(() => {
    return Date.now() - lastOnlineTime;
  }, [lastOnlineTime]);

  // Reset wasOffline flag
  const acknowledgeReconnection = useCallback(() => {
    setWasOffline(false);
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline,
    lastOnlineTime,
    lastOfflineTime,
    connectionChanges,
    offlineDuration: getOfflineDuration(),
    timeSinceOnline: getTimeSinceOnline(),
    acknowledgeReconnection,
    checkConnectivity,
  };
};

/**
 * Hook variant with automatic reconnection actions
 */
export const useOnlineStatusWithSync = (syncCallback) => {
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  const handleOnline = useCallback(async () => {
    if (syncCallback && !syncing) {
      setSyncing(true);
      setSyncError(null);
      
      try {
        console.log('🔄 Auto-syncing after reconnection...');
        await syncCallback();
        console.log('✅ Sync completed successfully');
      } catch (error) {
        console.error('❌ Sync failed:', error);
        setSyncError(error);
      } finally {
        setSyncing(false);
      }
    }
  }, [syncCallback, syncing]);

  const status = useOnlineStatus({
    onOnline: handleOnline,
  });

  return {
    ...status,
    syncing,
    syncError,
  };
};

export default useOnlineStatus;
