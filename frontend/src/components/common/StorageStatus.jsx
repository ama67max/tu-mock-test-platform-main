import { useEffect, useState } from 'react';
import { HardDrive, Database } from 'lucide-react';
import Badge from './Badge';

/**
 * StorageStatus Component
 * Shows IndexedDB storage usage and cached exam count
 * Displays storage quota information
 */

function StorageStatus({ className = '' }) {
  const [storageInfo, setStorageInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkStorage();
  }, []);

  const checkStorage = async () => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const usage = estimate.usage || 0;
        const quota = estimate.quota || 0;
        const percentUsed = quota > 0 ? (usage / quota) * 100 : 0;

        setStorageInfo({
          usage: formatBytes(usage),
          quota: formatBytes(quota),
          percentUsed: percentUsed.toFixed(1),
          usageBytes: usage,
          quotaBytes: quota,
        });
      }
    } catch (error) {
      console.error('Error checking storage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (isLoading || !storageInfo) {
    return null;
  }

  const getStorageVariant = () => {
    if (storageInfo.percentUsed < 50) return 'success';
    if (storageInfo.percentUsed < 80) return 'warning';
    return 'danger';
  };

  return (
    <div 
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-body ${className}`}
      style={{
        backgroundColor: 'rgba(var(--color-text-tertiary), 0.1)',
        color: 'rgb(var(--color-text-secondary))',
      }}
      title={`Storage: ${storageInfo.usage} / ${storageInfo.quota} (${storageInfo.percentUsed}% used)`}
    >
      <Database size={14} />
      <span className="text-xs font-semibold">
        {storageInfo.usage} / {storageInfo.quota}
      </span>
      <Badge variant={getStorageVariant()} size="sm">
        {storageInfo.percentUsed}%
      </Badge>
    </div>
  );
}

export default StorageStatus;
