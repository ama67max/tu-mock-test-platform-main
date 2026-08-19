/**
 * OfflineIndicator Component
 * Visual indicator for offline/online status
 * Shows connection state with animations and optional details
 */

import { useState, useEffect } from 'react';
import { WifiOff, Wifi, AlertCircle, CheckCircle } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

const OfflineIndicator = ({ 
  variant = 'compact', // 'compact', 'detailed', 'banner'
  showOnline = false, // Show indicator when online
  position = 'top-right', // 'top-right', 'top-left', 'bottom-right', 'bottom-left', 'banner'
  autoHide = true, // Auto hide online status after delay
  autoHideDelay = 3000, // Delay before hiding online indicator
}) => {
  const { isOnline, wasOffline, offlineDuration, acknowledgeReconnection } = useOnlineStatus();
  const [showOnlineIndicator, setShowOnlineIndicator] = useState(false);

  // Handle online indicator visibility
  useEffect(() => {
    if (isOnline && wasOffline && showOnline) {
      setShowOnlineIndicator(true);
      
      if (autoHide) {
        const timer = setTimeout(() => {
          setShowOnlineIndicator(false);
          acknowledgeReconnection();
        }, autoHideDelay);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isOnline, wasOffline, showOnline, autoHide, autoHideDelay, acknowledgeReconnection]);

  // Format offline duration
  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  // Position classes
  const positionClasses = {
    'top-right': 'fixed top-4 right-4 z-50',
    'top-left': 'fixed top-4 left-4 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50',
    'banner': 'fixed top-0 left-0 right-0 z-50',
  };

  // Don't show anything if online and not showing online indicator
  if (isOnline && !showOnlineIndicator) {
    return null;
  }

  // Banner variant
  if (variant === 'banner' || position === 'banner') {
    return (
      <div className={positionClasses.banner}>
        <div
          className={`w-full py-3 px-4 text-center ${
            isOnline
              ? 'bg-success-600 text-on-primary'
              : 'bg-danger-600 text-on-primary'
          } animate-slide-down`}
        >
          <div className="flex items-center justify-center gap-3">
            {isOnline ? (
              <>
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">
                  Back online! Your changes will sync automatically.
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">
                  You're offline. Changes will be saved locally and synced when reconnected.
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={positionClasses[position]}>
        <div
          className={`bg-surface-container-lowest border ${
            isOnline ? 'border-success-500' : 'border-danger-500'
          } rounded-lg p-4 shadow-lg max-w-sm animate-slide-in`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-lg ${
                isOnline ? 'bg-success-600' : 'bg-danger-600'
              }`}
            >
              {isOnline ? (
                <Wifi className="w-6 h-6 text-on-primary" />
              ) : (
                <WifiOff className="w-6 h-6 text-on-primary" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-body font-semibold text-primary">
                  {isOnline ? 'Back Online' : 'Offline Mode'}
                </h4>
                <div
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? 'bg-success-500' : 'bg-danger-500'
                  } animate-pulse`}
                />
              </div>

              <p className="text-sm text-secondary">
                {isOnline
                  ? 'Connection restored. Syncing data...'
                  : 'Working offline. Changes saved locally.'}
              </p>

              {!isOnline && offlineDuration > 0 && (
                <p className="text-xs text-tertiary mt-2">
                  Offline for {formatDuration(offlineDuration)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={positionClasses[position]}>
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-full ${
          isOnline ? 'bg-success-600' : 'bg-danger-600'
        } text-on-primary shadow-lg animate-slide-in`}
      >
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-semibold">Online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-semibold">Offline</span>
          </>
        )}
        <div
          className={`w-2 h-2 rounded-full ${
            isOnline ? 'bg-success-100' : 'bg-danger-100'
          } animate-pulse`}
        />
      </div>
    </div>
  );
};

export default OfflineIndicator;
