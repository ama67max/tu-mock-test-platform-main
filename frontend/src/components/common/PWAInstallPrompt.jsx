import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import Button from './Button';

/**
 * PWAInstallPrompt - Install prompt for Progressive Web App
 * Shows a banner prompting users to install the app when available
 * Respects user dismissal and doesn't show again for 7 days
 */

const DISMISS_KEY = 'pwa-install-dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if user dismissed recently
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      if (Date.now() - dismissedTime < DISMISS_DURATION) {
        return;
      }
    }

    // Listen for the beforeinstallprompt event
    const handler = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      
      // Show the install prompt
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Hide prompt if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    // Clear the deferredPrompt so it can be garbage collected
    setDeferredPrompt(null);
    setShowPrompt(false);

    // Log outcome for analytics (optional)
    console.log(`PWA install outcome: ${outcome}`);
  };

  const handleDismiss = () => {
    // Save dismissal time
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 animate-fade-in-up md:left-auto md:right-4 md:max-w-md"
      role="dialog"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-description"
    >
      <div
        className="rounded-xl p-4 shadow-lg"
        style={{
          background: 'var(--gradient-card)',
          border: '1px solid rgb(var(--color-border-primary))',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            style={{
              background: 'var(--gradient-dark)',
              color: 'rgb(var(--color-text-inverse))',
            }}
          >
            <Download size={20} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3
              id="pwa-install-title"
              className="text-subheading font-semibold mb-1"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              Install TU Mock Test
            </h3>
            <p
              id="pwa-install-description"
              className="text-body mb-3"
              style={{ color: 'rgb(var(--color-text-secondary))' }}
            >
              Install the app for offline access to exams and faster performance.
            </p>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleInstall}
                className="flex-1"
              >
                Install
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDismiss}
                className="flex-1"
              >
                Not now
              </Button>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="shrink-0 rounded-lg p-1.5 transition-all hover:scale-110"
            style={{
              color: 'rgb(var(--color-text-tertiary))',
              backgroundColor: 'transparent',
            }}
            aria-label="Dismiss install prompt"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default PWAInstallPrompt;
