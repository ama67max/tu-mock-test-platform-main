/**
 * SyncStatus Component
 * Shows sync queue status and progress
 * Displays pending operations and sync state
 */

import { useState, useEffect } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader2, Clock, RefreshCw } from 'lucide-react';
import { useSyncQueue } from '../../hooks/useIndexedDB';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

const SyncStatus = ({
  variant = 'compact', // 'compact', 'detailed', 'list'
  showWhenEmpty = false, // Show indicator when queue is empty
  autoSync = false, // Automatically sync when online
  onSyncComplete, // Callback after successful sync
}) => {
  const { queue, queueSize, syncing, processQueue, refreshQueue } = useSyncQueue();
  const { isOnline } = useOnlineStatus();
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncError, setSyncError] = useState(null);

  // Auto-refresh queue
  useEffect(() => {
    const interval = setInterval(refreshQueue, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [refreshQueue]);

  // Auto-sync when online (if enabled)
  useEffect(() => {
    if (autoSync && isOnline && queueSize > 0 && !syncing) {
      handleSync();
    }
  }, [autoSync, isOnline, queueSize, syncing]);

  // Handle manual sync
  const handleSync = async () => {
    if (!isOnline || syncing || queueSize === 0) return;

    setSyncError(null);
    setSyncProgress({ current: 0, total: queueSize });

    try {
      // This would be replaced with actual API sync logic
      const results = await processQueue(async (item) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setSyncProgress(prev => ({ ...prev, current: prev.current + 1 }));
        
        // In real implementation, call appropriate API endpoint
        console.log('Syncing item:', item.type, item.data);
      });

      setLastSyncTime(Date.now());
      
      if (onSyncComplete) {
        onSyncComplete(results);
      }
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncError(error.message);
    }
  };

  // Format time ago
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Never';
    
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  // Group queue items by type
  const groupedQueue = queue.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {});

  // Don't show if queue is empty and showWhenEmpty is false
  if (queueSize === 0 && !showWhenEmpty) {
    return null;
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        {syncing ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-semibold">
              Syncing {syncProgress.current}/{syncProgress.total}
            </span>
          </div>
        ) : queueSize > 0 ? (
          <button
            onClick={handleSync}
            disabled={!isOnline}
            className={`flex items-center gap-2 px-3 py-2 rounded-full font-semibold text-sm ${
              isOnline
                ? 'bg-gradient-to-r from-silver-600 to-silver-700 hover:from-silver-500 hover:to-silver-600 text-white'
                : 'bg-darkGray-800 text-silver-500 cursor-not-allowed'
            } transition-all`}
          >
            <Upload className="w-4 h-4" />
            <span>{queueSize} pending</span>
            {!isOnline && <Clock className="w-3 h-3" />}
          </button>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 bg-darkGray-800 text-green-400 rounded-full">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-semibold">Synced</span>
          </div>
        )}

        {syncError && (
          <div className="flex items-center gap-1 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Sync failed</span>
          </div>
        )}
      </div>
    );
  }

  // Detailed variant
  if (variant === 'detailed') {
    return (
      <div className="bg-gradient-to-br from-darkGray-800 to-darkGray-900 border border-silver-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-silver-400" />
            <h3 className="text-body font-semibold text-white">Sync Status</h3>
          </div>
          
          {queueSize > 0 && (
            <button
              onClick={handleSync}
              disabled={!isOnline || syncing}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-sm ${
                isOnline && !syncing
                  ? 'bg-gradient-to-r from-silver-600 to-silver-700 hover:from-silver-500 hover:to-silver-600 text-white'
                  : 'bg-darkGray-700 text-silver-500 cursor-not-allowed'
              } transition-all`}
            >
              {syncing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Sync Now
                </>
              )}
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {syncing && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-silver-400 mb-2">
              <span>Syncing operations...</span>
              <span>{syncProgress.current} / {syncProgress.total}</span>
            </div>
            <div className="w-full bg-darkGray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(syncProgress.current / syncProgress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-silver-400">Pending operations</span>
            <span className={`text-sm font-semibold ${queueSize > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
              {queueSize}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-silver-400">Connection</span>
            <span className={`text-sm font-semibold ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          {lastSyncTime && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-silver-400">Last synced</span>
              <span className="text-sm text-silver-500">{formatTimeAgo(lastSyncTime)}</span>
            </div>
          )}
        </div>

        {syncError && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-700 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-400">Sync Error</p>
              <p className="text-xs text-red-300 mt-1">{syncError}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // List variant
  if (variant === 'list') {
    return (
      <div className="bg-gradient-to-br from-darkGray-800 to-darkGray-900 border border-silver-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-body font-semibold text-white">
            Sync Queue ({queueSize})
          </h3>
          
          {queueSize > 0 && (
            <button
              onClick={handleSync}
              disabled={!isOnline || syncing}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-sm ${
                isOnline && !syncing
                  ? 'bg-gradient-to-r from-silver-600 to-silver-700 hover:from-silver-500 hover:to-silver-600 text-white'
                  : 'bg-darkGray-700 text-silver-500 cursor-not-allowed'
              } transition-all`}
            >
              {syncing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Sync All
                </>
              )}
            </button>
          )}
        </div>

        {queueSize === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-body text-silver-400">All synced!</p>
            <p className="text-sm text-silver-500 mt-1">No pending operations</p>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(groupedQueue).map(([type, items]) => (
              <div
                key={type}
                className="p-3 bg-darkGray-900 border border-silver-800 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white capitalize">
                    {type}
                  </span>
                  <span className="text-xs text-silver-500">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
                
                <div className="space-y-1">
                  {items.slice(0, 3).map((item, idx) => (
                    <div key={item.id} className="text-xs text-silver-500 flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(item.timestamp)}</span>
                    </div>
                  ))}
                  {items.length > 3 && (
                    <p className="text-xs text-silver-600">
                      +{items.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default SyncStatus;
