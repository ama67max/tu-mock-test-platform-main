import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, ExternalLink, WifiOff } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from '../common/ThemeToggle';

/**
 * AdminLayout - Redesigned with Theme Support
 * Layout for admin pages with collapsible sidebar
 * Includes theme toggle and offline indicator
 */

function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Close mobile overlay on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile overlay is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Desktop Sidebar ─────────────────────────────────────────────── */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* ── Mobile Overlay ──────────────────────────────────────────────── */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <button
            type="button"
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close menu"
          />
          {/* Slide-in panel */}
          <div className="absolute left-0 top-0 h-full w-64 shadow-xl animate-slide-in-right bg-surface-container-low">
            <div className="flex h-16 items-center justify-between px-4 border-b border-surface-container-highest">
              <span className="font-headline font-bold text-primary">Admin Suite</span>
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="rounded-lg p-1.5 text-secondary hover:text-primary transition-colors"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      {/* ── Main Content Area ───────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-auto">
        {/* Sticky top bar */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between bg-surface-container-lowest/95 backdrop-blur-sm border-b border-surface-variant px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="rounded-lg p-2 text-secondary hover:text-primary hover:bg-surface-container transition-all md:hidden"
              aria-label="Open admin menu"
            >
              <Menu size={20} />
            </button>
            <h1 className="font-headline font-bold text-primary text-lg">Admin Panel</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Offline Indicator */}
            {!isOnline && (
              <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold bg-surface-container border border-surface-variant text-secondary">
                <WifiOff size={14} />
                <span className="hidden sm:inline">Offline</span>
              </div>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            <span className="hidden text-xs font-semibold text-secondary sm:block truncate max-w-[120px]">
              {user?.fullName}
            </span>

            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-primary transition-colors"
            >
              <ExternalLink size={15} />
              <span className="hidden sm:inline">Back to site</span>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 bg-background p-3 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
