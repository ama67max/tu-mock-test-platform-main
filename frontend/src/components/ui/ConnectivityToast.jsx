/**
 * ConnectivityToast Component
 * Toast notifications for connectivity changes
 * Animated notifications with auto-dismiss
 */

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, X } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

const ConnectivityToast = ({
  position = 'top-center', // 'top-center', 'bottom-center', 'top-right', 'bottom-right'
  duration = 4000, // Auto-dismiss duration (ms)
  showOnlineNotification = true, // Show notification when back online
  showOfflineNotification = true, // Show notification when offline
}) => {
  const { isOnline, wasOffline } = useOnlineStatus();
  const [toasts, setToasts] = useState([]);
  const [toastId, setToastId] = useState(0);

  // Add toast
  const addToast = (type, message, icon) => {
    const id = toastId;
    setToastId(prev => prev + 1);

    const toast = {
      id,
      type,
      message,
      icon,
      timestamp: Date.now(),
    };

    setToasts(prev => [...prev, toast]);

    // Auto dismiss
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  // Remove toast
  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Monitor connectivity changes
  useEffect(() => {
    if (!isOnline && showOfflineNotification) {
      addToast(
        'offline',
        'You\'re offline. Changes will be saved locally.',
        <WifiOff className="w-5 h-5" />
      );
    } else if (isOnline && wasOffline && showOnlineNotification) {
      addToast(
        'online',
        'You\'re back online! Syncing changes...',
        <Wifi className="w-5 h-5" />
      );
    }
  }, [isOnline]); // eslint-disable-line react-hooks/exhaustive-deps

  // Position classes
  const positionClasses = {
    'top-center': 'fixed top-4 left-1/2 -translate-x-1/2 z-50',
    'bottom-center': 'fixed bottom-4 left-1/2 -translate-x-1/2 z-50',
    'top-right': 'fixed top-4 right-4 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50',
  };

  if (toasts.length === 0) return null;

  return (
    <div className={positionClasses[position]}>
      <div className="flex flex-col gap-2 min-w-[300px] max-w-md">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
              ${
                toast.type === 'online'
                  ? 'bg-gradient-to-r from-green-600 to-green-700'
                  : 'bg-gradient-to-r from-red-600 to-red-700'
              }
              text-white animate-slide-in-down
            `}
          >
            <div className="flex-shrink-0">{toast.icon}</div>
            
            <p className="flex-1 text-sm font-semibold">{toast.message}</p>
            
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConnectivityToast;
