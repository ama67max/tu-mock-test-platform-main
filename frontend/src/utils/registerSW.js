import { registerSW } from 'virtual:pwa-register';

/**
 * Service Worker Registration with Auto-Update
 * Handles SW lifecycle and prompts user for updates
 */

let updateSW = null;

export function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    updateSW = registerSW({
      immediate: true,
      
      onNeedRefresh() {
        // Show update notification
        if (confirm('New content available! Click OK to refresh and get the latest version.')) {
          updateSW?.();
        }
      },
      
      onOfflineReady() {
        console.log('App ready to work offline');
        
        // Optional: Show toast notification
        if (window.toast) {
          window.toast.success('App is ready for offline use!');
        }
      },
      
      onRegistered(registration) {
        console.log('Service Worker registered:', registration);
        
        // Check for updates every hour
        if (registration) {
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // 1 hour
        }
      },
      
      onRegisterError(error) {
        console.error('Service Worker registration error:', error);
      },
    });
  }
}

export function checkForUpdates() {
  updateSW?.();
}

// Auto-initialize when module loads
if (import.meta.env.PROD) {
  initServiceWorker();
}
