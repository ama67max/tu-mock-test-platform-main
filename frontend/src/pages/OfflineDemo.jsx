/**
 * Offline Demo Page
 * Demonstrates Task 7: Offline Detection and Sync Status UI
 * 
 * Features:
 * - Online/offline status monitoring
 * - Connectivity toast notifications
 * - Sync queue status and progress
 * - Manual sync controls
 * - Visual feedback for all states
 */

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Upload, Download, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useOnlineStatus, useOnlineStatusWithSync } from '../hooks/useOnlineStatus';
import { useSyncQueue } from '../hooks/useIndexedDB';
import OfflineIndicator from '../components/ui/OfflineIndicator';
import SyncStatus from '../components/ui/SyncStatus';
import ConnectivityToast from '../components/ui/ConnectivityToast';
import dbManager from '../utils/indexedDB';

const OfflineDemo = () => {
  const { 
    isOnline, 
    wasOffline, 
    offlineDuration, 
    connectionChanges,
    checkConnectivity 
  } = useOnlineStatus();
  
  const { addToQueue, queueSize } = useSyncQueue();
  const [indicatorVariant, setIndicatorVariant] = useState('compact');
  const [syncVariant, setSyncVariant] = useState('compact');
  const [showToasts, setShowToasts] = useState(true);
  const [logs, setLogs] = useState([]);

  // Add log entry
  const addLog = (type, message) => {
    setLogs(prev => [...prev, {
      type,
      message,
      timestamp: new Date().toLocaleTimeString(),
    }].slice(-10)); // Keep last 10 logs
  };

  // Monitor connection changes
  useEffect(() => {
    if (isOnline) {
      addLog('online', 'Connection established');
    } else {
      addLog('offline', 'Connection lost');
    }
  }, [isOnline]);

  // Test functions
  const simulateOfflineOperation = async () => {
    try {
      // Simulate adding data to sync queue
      await addToQueue('test', {
        action: 'test_operation',
        data: { value: Math.random() },
        timestamp: Date.now(),
      });
      
      addLog('queue', 'Added test operation to sync queue');
    } catch (error) {
      addLog('error', `Failed to add to queue: ${error.message}`);
    }
  };

  const simulateMultipleOperations = async () => {
    try {
      for (let i = 0; i < 5; i++) {
        await addToQueue('test', {
          action: `batch_operation_${i + 1}`,
          data: { batch: i + 1 },
          timestamp: Date.now(),
        });
      }
      
      addLog('queue', 'Added 5 operations to sync queue');
    } catch (error) {
      addLog('error', `Failed to add batch: ${error.message}`);
    }
  };

  const manualConnectivityCheck = async () => {
    addLog('info', 'Running manual connectivity check...');
    await checkConnectivity();
    addLog('info', 'Connectivity check complete');
  };

  // Format duration
  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-darkGray-900 to-darkGray-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Wifi className="w-10 h-10 text-white" />
            <h1 className="text-display font-semibold text-white">
              Offline Detection & Sync Status Demo
            </h1>
          </div>
          <p className="text-body text-silver-400">
            Task 7: Real-time connectivity monitoring, sync queue management, and visual feedback
          </p>
        </div>

        {/* Connectivity Toast (always shown for demo) */}
        {showToasts && <ConnectivityToast />}

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Connection Status */}
          <div className="bg-gradient-to-br from-darkGray-800 to-darkGray-900 border border-silver-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              {isOnline ? (
                <Wifi className="w-8 h-8 text-green-400" />
              ) : (
                <WifiOff className="w-8 h-8 text-red-400" />
              )}
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                isOnline 
                  ? 'bg-green-900/30 text-green-400' 
                  : 'bg-red-900/30 text-red-400'
              }`}>
                {isOnline ? 'Online' : 'Offline'}
              </div>
            </div>
            <h3 className="text-body font-semibold text-white mb-2">
              Connection Status
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-silver-400">
                <span>Navigator Online:</span>
                <span className="text-white">{navigator.onLine ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between text-silver-400">
                <span>Changes:</span>
                <span className="text-white">{connectionChanges}</span>
              </div>
              {!isOnline && offlineDuration > 0 && (
                <div className="flex justify-between text-silver-400">
                  <span>Offline for:</span>
                  <span className="text-white">{formatDuration(offlineDuration)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Sync Queue Status */}
          <div className="bg-gradient-to-br from-darkGray-800 to-darkGray-900 border border-silver-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Upload className="w-8 h-8 text-blue-400" />
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                queueSize > 0 
                  ? 'bg-yellow-900/30 text-yellow-400' 
                  : 'bg-green-900/30 text-green-400'
              }`}>
                {queueSize} Pending
              </div>
            </div>
            <h3 className="text-body font-semibold text-white mb-2">
              Sync Queue
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-silver-400">
                <span>Operations:</span>
                <span className="text-white">{queueSize}</span>
              </div>
              <div className="flex justify-between text-silver-400">
                <span>Status:</span>
                <span className={queueSize > 0 ? 'text-yellow-400' : 'text-green-400'}>
                  {queueSize > 0 ? 'Pending' : 'Synced'}
                </span>
              </div>
            </div>
          </div>

          {/* Reconnection Status */}
          <div className="bg-gradient-to-br from-darkGray-800 to-darkGray-900 border border-silver-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Download className="w-8 h-8 text-purple-400" />
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                wasOffline 
                  ? 'bg-purple-900/30 text-purple-400' 
                  : 'bg-green-900/30 text-green-400'
              }`}>
                {wasOffline ? 'Reconnected' : 'Stable'}
              </div>
            </div>
            <h3 className="text-body font-semibold text-white mb-2">
              Reconnection
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-silver-400">
                <span>Was Offline:</span>
                <span className="text-white">{wasOffline ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between text-silver-400">
                <span>Auto Sync:</span>
                <span className="text-green-400">Enabled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Component Previews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Offline Indicator Preview */}
          <div className="bg-gradient-to-br from-darkGray-800 to-darkGray-900 border border-silver-700 rounded-lg p-6">
            <h2 className="text-heading font-semibold text-white mb-4 flex items-center gap-2">
              <Info className="w-6 h-6" />
              Offline Indicator
            </h2>
            
            <div className="space-y-4">
              {/* Variant Selector */}
              <div>
                <label className="block text-sm font-medium text-silver-400 mb-2">
                  Variant
                </label>
                <div className="flex gap-2">
                  {['compact', 'detailed', 'banner'].map(variant => (
                    <button
                      key={variant}
                      onClick={() => setIndicatorVariant(variant)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                        indicatorVariant === variant
                          ? 'bg-gradient-to-r from-silver-600 to-silver-700 text-white'
                          : 'bg-darkGray-700 text-silver-400 hover:bg-darkGray-600'
                      }`}
                    >
                      {variant.charAt(0).toUpperCase() + variant.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="relative bg-darkGray-900 border border-silver-800 rounded-lg p-8 min-h-[200px]">
                <OfflineIndicator
                  variant={indicatorVariant}
                  showOnline={true}
                  position={indicatorVariant === 'banner' ? 'banner' : 'top-right'}
                  autoHide={false}
                />
                {!isOnline && indicatorVariant !== 'banner' && (
                  <div className="text-center text-silver-500">
                    Indicator appears in top-right corner
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sync Status Preview */}
          <div className="bg-gradient-to-br from-darkGray-800 to-darkGray-900 border border-silver-700 rounded-lg p-6">
            <h2 className="text-heading font-semibold text-white mb-4 flex items-center gap-2">
              <Upload className="w-6 h-6" />
              Sync Status
            </h2>
            
            <div className="space-y-4">
              {/* Variant Selector */}
              <div>
                <label className="block text-sm font-medium text-silver-400 mb-2">
                  Variant
                </label>
                <div className="flex gap-2">
                  {['compact', 'detailed', 'list'].map(variant => (
                    <button
                      key={variant}
                      onClick={() => setSyncVariant(variant)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                        syncVariant === variant
                          ? 'bg-gradient-to-r from-silver-600 to-silver-700 text-white'
                          : 'bg-darkGray-700 text-silver-400 hover:bg-darkGray-600'
                      }`}
                    >
                      {variant.charAt(0).toUpperCase() + variant.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-darkGray-900 border border-silver-800 rounded-lg p-4">
                <SyncStatus
                  variant={syncVariant}
                  showWhenEmpty={true}
                  autoSync={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-gradient-to-br from-darkGray-800 to-darkGray-900 border border-silver-700 rounded-lg p-8 mb-8">
          <h2 className="text-heading font-semibold text-white mb-6">
            Test Controls
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <button
              onClick={simulateOfflineOperation}
              className="bg-gradient-to-r from-silver-600 to-silver-700 hover:from-silver-500 hover:to-silver-600 text-white font-semibold px-6 py-3 rounded-lg transition-all"
            >
              Add to Sync Queue
            </button>

            <button
              onClick={simulateMultipleOperations}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold px-6 py-3 rounded-lg transition-all"
            >
              Add 5 Operations
            </button>

            <button
              onClick={manualConnectivityCheck}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold px-6 py-3 rounded-lg transition-all"
            >
              Check Connectivity
            </button>

            <button
              onClick={() => setShowToasts(!showToasts)}
              className={`font-semibold px-6 py-3 rounded-lg transition-all ${
                showToasts
                  ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white'
                  : 'bg-darkGray-700 hover:bg-darkGray-600 text-silver-400'
              }`}
            >
              {showToasts ? 'Hide' : 'Show'} Toasts
            </button>

            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-silver-600 to-silver-700 hover:from-silver-500 hover:to-silver-600 text-white font-semibold px-6 py-3 rounded-lg transition-all"
            >
              Reload Page
            </button>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-200">
              <p className="font-semibold mb-1">Testing Offline Mode</p>
              <p>Open DevTools (F12) → Network tab → Set throttling to "Offline" to test offline functionality</p>
            </div>
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-gradient-to-br from-darkGray-800 to-darkGray-900 border border-silver-700 rounded-lg p-8">
          <h2 className="text-heading font-semibold text-white mb-6 flex items-center gap-2">
            <Info className="w-6 h-6" />
            Activity Log
          </h2>
          
          {logs.length === 0 ? (
            <div className="text-center py-8 text-silver-500">
              No activity yet. Try going offline or adding operations to the queue.
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-darkGray-900 rounded-lg border border-silver-800"
                >
                  {log.type === 'online' && <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />}
                  {log.type === 'offline' && <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                  {log.type === 'queue' && <Upload className="w-4 h-4 text-blue-400 flex-shrink-0" />}
                  {log.type === 'info' && <Info className="w-4 h-4 text-silver-400 flex-shrink-0" />}
                  {log.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                  
                  <span className="flex-1 text-sm text-white">{log.message}</span>
                  <span className="text-xs text-silver-500">{log.timestamp}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Features Overview */}
        <div className="mt-8 bg-gradient-to-br from-darkGray-800 to-darkGray-900 border border-silver-700 rounded-lg p-8">
          <h2 className="text-heading font-semibold text-white mb-6">
            Implemented Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-body text-white font-medium">useOnlineStatus Hook</p>
                <p className="text-sm text-silver-500">Real-time connection monitoring with callbacks</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-body text-white font-medium">OfflineIndicator Component</p>
                <p className="text-sm text-silver-500">3 variants: compact, detailed, banner</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-body text-white font-medium">SyncStatus Component</p>
                <p className="text-sm text-silver-500">Queue display with progress tracking</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-body text-white font-medium">ConnectivityToast</p>
                <p className="text-sm text-silver-500">Auto-dismissing notifications</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-body text-white font-medium">Sync Progress Feedback</p>
                <p className="text-sm text-silver-500">Visual progress bars and counters</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-body text-white font-medium">Auto-sync on Reconnect</p>
                <p className="text-sm text-silver-500">Automatic queue processing when online</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineDemo;
