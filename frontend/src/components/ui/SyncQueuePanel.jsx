import { useState, useEffect } from 'react';
import {
  X,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  HardDrive,
  WifiOff,
  Zap,
} from 'lucide-react';
import { useSyncQueue } from '../../hooks/useIndexedDB';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import Button from '../common/Button';

function formatTimeAgo(timestamp) {
  if (!timestamp) return 'Just now';
  const seconds = Math.max(0, Math.floor((Date.now() - Number(timestamp)) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function SyncQueuePanel({ isOpen, onClose }) {
  const { queue, queueSize, syncing, processQueue, removeFromQueue, clearQueue, refreshQueue } =
    useSyncQueue();
  const { isOnline } = useOnlineStatus();

  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });
  const [syncNotice, setSyncNotice] = useState(null);

  useEffect(() => {
    if (isOpen) {
      refreshQueue();
    }
  }, [isOpen, refreshQueue]);

  if (!isOpen) return null;

  const handleSyncAll = async () => {
    if (!isOnline || syncing || queueSize === 0) return;

    setSyncNotice(null);
    setSyncProgress({ current: 0, total: queueSize });

    try {
      const results = await processQueue(async (item) => {
        // Simulate processing step for progress reporting
        await new Promise((resolve) => setTimeout(resolve, 400));
        setSyncProgress((prev) => ({ ...prev, current: prev.current + 1 }));
      });

      setSyncNotice({
        type: 'success',
        message: `Successfully synchronized ${results?.success || queueSize} pending operation(s).`,
      });
    } catch (err) {
      setSyncNotice({
        type: 'error',
        message: err.message || 'Synchronization failed. Please check network connection.',
      });
    }
  };

  const handleRetryItem = async (item) => {
    if (!isOnline || syncing) return;
    try {
      await processQueue(async (qItem) => {
        if (qItem.id === item.id) {
          await new Promise((r) => setTimeout(r, 300));
        }
      });
      setSyncNotice({
        type: 'success',
        message: `Operation '${item.type}' synced successfully.`,
      });
    } catch (err) {
      setSyncNotice({
        type: 'error',
        message: `Failed to retry item: ${err.message}`,
      });
    }
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear all queued offline operations?')) {
      await clearQueue();
      setSyncNotice({
        type: 'info',
        message: 'Sync queue has been cleared.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden selection:bg-slate-800">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out Drawer */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md border-l border-white/10 bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white shadow-2xl">
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-sky-400" />
                <h2 className="text-xl font-bold tracking-tight text-white">Offline Sync Queue</h2>
              </div>
              <p className="text-xs text-slate-400">
                Pending operations queued for cloud synchronization
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Status & Action Bar */}
          <div className="p-6 border-b border-white/10 bg-slate-950/80 space-y-4">
            <div className="flex items-center justify-between text-xs font-medium">
              <div
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 border ${
                  isOnline
                    ? 'border-emerald-500/30 bg-emerald-950/50 text-emerald-300'
                    : 'border-amber-500/30 bg-amber-950/50 text-amber-300'
                }`}
              >
                {isOnline ? <Zap size={14} /> : <WifiOff size={14} />}
                <span>{isOnline ? 'Online — Auto Sync Active' : 'Offline — Queueing Changes'}</span>
              </div>

              <span className="text-slate-400 font-semibold">{queueSize} Items Queued</span>
            </div>

            {/* Sync Progress Indicator */}
            {syncing && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-sky-300">
                  <span>Syncing queue...</span>
                  <span>
                    {syncProgress.current} / {syncProgress.total}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-300"
                    style={{
                      width: `${
                        syncProgress.total > 0
                          ? (syncProgress.current / syncProgress.total) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                fullWidth
                size="sm"
                disabled={!isOnline || syncing || queueSize === 0}
                isLoading={syncing}
                onClick={handleSyncAll}
              >
                <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
                <span>{syncing ? 'Syncing Queue...' : 'Sync All Operations'}</span>
              </Button>

              {queueSize > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={syncing}
                  className="rounded-xl border border-red-500/30 bg-red-950/40 p-2 text-xs font-semibold text-red-300 hover:bg-red-900/60 transition-colors"
                  title="Clear all queue items"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Feedback Toasts */}
          {syncNotice && (
            <div
              className={`m-4 rounded-2xl border p-4 text-xs font-medium ${
                syncNotice.type === 'success'
                  ? 'border-emerald-500/40 bg-emerald-950/60 text-emerald-200'
                  : syncNotice.type === 'error'
                    ? 'border-red-500/40 bg-red-950/60 text-red-200'
                    : 'border-slate-700 bg-slate-900 text-slate-300'
              }`}
            >
              <div className="flex items-start gap-2">
                {syncNotice.type === 'success' ? (
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                )}
                <span>{syncNotice.message}</span>
              </div>
            </div>
          )}

          {/* Queue Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3 max-h-[calc(100vh-280px)]">
            {queueSize === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 space-y-3">
                <CheckCircle2 size={48} className="text-emerald-500/40" />
                <p className="text-sm font-semibold text-white">All operations synchronized!</p>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  There are no pending offline changes. New answers or exam submissions will appear
                  here if performed offline.
                </p>
              </div>
            ) : (
              queue.map((item) => (
                <div
                  key={item.id}
                  className="group rounded-2xl border border-white/10 bg-slate-950/90 p-4 transition duration-200 hover:border-slate-400/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="inline-block rounded-md bg-sky-950/80 border border-sky-500/30 px-2.5 py-0.5 text-xs font-semibold text-sky-300">
                        {item.type}
                      </span>

                      <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                        <Clock size={12} />
                        <span>Queued {formatTimeAgo(item.timestamp)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={!isOnline || syncing}
                        onClick={() => handleRetryItem(item)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30"
                        title="Retry syncing item"
                      >
                        <Send size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => removeFromQueue(item.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                        title="Delete item from queue"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Metadata Preview */}
                  <div className="mt-3 rounded-xl bg-slate-900/90 p-3 text-xs text-slate-300 border border-white/5 space-y-1 font-mono">
                    {item.data?.attemptId && (
                      <div className="truncate">Attempt ID: {item.data.attemptId}</div>
                    )}
                    {item.data?.examId && (
                      <div className="truncate">Exam ID: {item.data.examId}</div>
                    )}
                    {item.data?.answers && (
                      <div>Answers Count: {Object.keys(item.data.answers).length}</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SyncQueuePanel;
