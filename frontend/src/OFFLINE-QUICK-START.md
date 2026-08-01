# Offline Detection & Sync UI - Quick Start

## 🚀 Quick Demo

**Access the demo:**
```
http://localhost:5173/demo/offline
```

**Test offline mode:**
1. Open DevTools (F12)
2. Network tab → Set to "Offline"
3. Watch components update in real-time

## 📦 Components

### 1. OfflineIndicator

Shows connection status with 3 variants.

**Usage:**
```jsx
import OfflineIndicator from './components/ui/OfflineIndicator';

// Compact (small pill)
<OfflineIndicator variant="compact" position="top-right" />

// Detailed (card with info)
<OfflineIndicator variant="detailed" position="top-right" />

// Banner (full-width alert)
<OfflineIndicator variant="banner" />
```

**Props:**
- `variant`: `'compact'` | `'detailed'` | `'banner'`
- `showOnline`: Show when online (default: false)
- `position`: `'top-right'` | `'top-left'` | `'bottom-right'` | `'bottom-left'`
- `autoHide`: Auto-hide online status (default: true)
- `autoHideDelay`: Hide delay in ms (default: 3000)

---

### 2. SyncStatus

Displays sync queue with progress tracking.

**Usage:**
```jsx
import SyncStatus from './components/ui/SyncStatus';

// Compact (button with count)
<SyncStatus variant="compact" autoSync={true} />

// Detailed (card with stats)
<SyncStatus variant="detailed" showWhenEmpty={true} />

// List (full queue display)
<SyncStatus variant="list" onSyncComplete={(results) => console.log(results)} />
```

**Props:**
- `variant`: `'compact'` | `'detailed'` | `'list'`
- `showWhenEmpty`: Show when queue is empty (default: false)
- `autoSync`: Auto-sync when online (default: false)
- `onSyncComplete`: Callback after sync

---

### 3. ConnectivityToast

Toast notifications for connectivity changes.

**Usage:**
```jsx
import ConnectivityToast from './components/ui/ConnectivityToast';

<ConnectivityToast
  position="top-center"
  duration={4000}
  showOnlineNotification={true}
  showOfflineNotification={true}
/>
```

**Props:**
- `position`: `'top-center'` | `'bottom-center'` | `'top-right'` | `'bottom-right'`
- `duration`: Auto-dismiss delay (default: 4000ms)
- `showOnlineNotification`: Show on reconnect (default: true)
- `showOfflineNotification`: Show on disconnect (default: true)

---

## 🎣 Hooks

### useOnlineStatus

Monitor network connectivity.

**Basic Usage:**
```jsx
import { useOnlineStatus } from './hooks/useOnlineStatus';

function MyComponent() {
  const { isOnline, offlineDuration } = useOnlineStatus();
  
  return (
    <div>
      {isOnline ? '🟢 Online' : '🔴 Offline'}
      {!isOnline && <p>Offline for {offlineDuration}ms</p>}
    </div>
  );
}
```

**With Callbacks:**
```jsx
const status = useOnlineStatus({
  onOnline: () => {
    console.log('Back online!');
    syncData();
  },
  onOffline: () => {
    console.log('Connection lost');
  },
  checkInterval: 30000, // Check every 30s
});
```

**Returns:**
```javascript
{
  isOnline: boolean,
  isOffline: boolean,
  wasOffline: boolean,
  lastOnlineTime: number,
  lastOfflineTime: number,
  connectionChanges: number,
  offlineDuration: number,
  timeSinceOnline: number,
  acknowledgeReconnection: () => void,
  checkConnectivity: () => Promise<void>,
}
```

---

### useOnlineStatusWithSync

Auto-sync when connection restored.

**Usage:**
```jsx
import { useOnlineStatusWithSync } from './hooks/useOnlineStatus';

function MyComponent() {
  const { isOnline, syncing, syncError } = useOnlineStatusWithSync(
    async () => {
      // Your sync logic
      await processSyncQueue();
    }
  );
  
  return (
    <div>
      {syncing && <Loader />}
      {syncError && <Alert>{syncError.message}</Alert>}
    </div>
  );
}
```

---

## 🎨 Common Patterns

### Layout with Status Indicators

```jsx
import OfflineIndicator from './components/ui/OfflineIndicator';
import SyncStatus from './components/ui/SyncStatus';
import ConnectivityToast from './components/ui/ConnectivityToast';

function AppLayout({ children }) {
  return (
    <>
      {/* Toast notifications */}
      <ConnectivityToast />
      
      {/* Offline badge in corner */}
      <OfflineIndicator variant="compact" position="top-right" />
      
      <header>
        <nav>...</nav>
        
        {/* Sync button in header */}
        <SyncStatus variant="compact" autoSync={true} />
      </header>
      
      <main>{children}</main>
    </>
  );
}
```

---

### Exam Page with Offline Support

```jsx
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useSyncQueue } from './hooks/useIndexedDB';
import OfflineIndicator from './components/ui/OfflineIndicator';

function ExamPage() {
  const { isOnline } = useOnlineStatus();
  const { addToQueue } = useSyncQueue();
  
  const submitAnswer = async (answer) => {
    if (isOnline) {
      try {
        await api.submitAnswer(answer);
      } catch (error) {
        await addToQueue('answer', answer);
      }
    } else {
      await addToQueue('answer', answer);
    }
  };
  
  return (
    <div>
      {!isOnline && <OfflineIndicator variant="banner" />}
      
      <div className="exam-content">
        {/* Questions */}
      </div>
    </div>
  );
}
```

---

### Dashboard with Detailed Status

```jsx
import { useOnlineStatus } from './hooks/useOnlineStatus';
import OfflineIndicator from './components/ui/OfflineIndicator';
import SyncStatus from './components/ui/SyncStatus';

function Dashboard() {
  const { isOnline, wasOffline } = useOnlineStatus();
  
  return (
    <div>
      <div className="status-bar">
        {!isOnline && (
          <OfflineIndicator variant="detailed" position="top-left" />
        )}
        
        <SyncStatus variant="detailed" showWhenEmpty={true} />
      </div>
      
      {wasOffline && (
        <div className="alert alert-success">
          Connection restored! Your data is syncing...
        </div>
      )}
      
      {/* Dashboard content */}
    </div>
  );
}
```

---

### Auto-Sync Integration

```jsx
import { useOnlineStatusWithSync } from './hooks/useOnlineStatus';
import { useSyncQueue } from './hooks/useIndexedDB';
import api from './api';

function App() {
  const { processQueue } = useSyncQueue();
  
  const { syncing } = useOnlineStatusWithSync(async () => {
    // Process entire sync queue
    await processQueue(async (item) => {
      if (item.type === 'answer') {
        await api.submitAnswer(item.data);
      } else if (item.type === 'attempt') {
        await api.submitAttempt(item.data);
      }
    });
  });
  
  return (
    <div>
      {syncing && (
        <div className="sync-overlay">
          <Loader />
          Syncing your data...
        </div>
      )}
      
      {/* App content */}
    </div>
  );
}
```

---

## ⚙️ Configuration

### Custom Check Interval

```jsx
const status = useOnlineStatus({
  checkInterval: 60000, // Check every minute
});
```

### Disable Periodic Checks

```jsx
const status = useOnlineStatus({
  checkInterval: 0, // Disable periodic checks
});
```

### Toast Customization

```jsx
<ConnectivityToast
  position="bottom-center"
  duration={5000}
  showOnlineNotification={true}
  showOfflineNotification={false} // Only show online
/>
```

---

## 🧪 Testing

### Simulate Offline

**Chrome DevTools:**
1. F12 → Network tab
2. Throttling dropdown → Offline

**Firefox:**
1. F12 → Network tab
2. Offline checkbox

**Manual:**
- Disconnect Wi-Fi
- Airplane mode
- Browser extensions

### Test Checklist

- [ ] Toast appears when offline
- [ ] Toast appears when back online
- [ ] OfflineIndicator shows correct status
- [ ] SyncStatus updates queue count
- [ ] Manual sync button works
- [ ] Auto-sync triggers on reconnect
- [ ] Progress bar shows during sync
- [ ] Offline duration displays correctly
- [ ] All variants render properly
- [ ] Animations work smoothly

---

## 🎯 Component Variants

| Component | Variants | Best For |
|-----------|----------|----------|
| OfflineIndicator | compact | Minimal, non-intrusive |
| | detailed | Important info with context |
| | banner | Critical, full-width alert |
| SyncStatus | compact | Header/toolbar |
| | detailed | Dashboard/settings |
| | list | Admin/debug view |
| ConnectivityToast | - | All situations (auto-dismiss) |

---

## 🔍 Debugging

### Check Connection Status

```javascript
console.log('navigator.onLine:', navigator.onLine);
```

### Monitor Events

```javascript
window.addEventListener('online', () => console.log('🟢 Online'));
window.addEventListener('offline', () => console.log('🔴 Offline'));
```

### Test Hook Directly

```javascript
import { useOnlineStatus } from './hooks/useOnlineStatus';

const status = useOnlineStatus();
console.log('Status:', status);
```

---

## 📚 Related Documentation

- **IndexedDB Integration:** See `INDEXEDDB-QUICK-START.md`
- **Task Completion:** See `TASK-7-COMPLETION.md`
- **Overall Status:** See `TASK-STATUS.md`

---

**Task 7 Complete** ✅ All components ready for production use!
