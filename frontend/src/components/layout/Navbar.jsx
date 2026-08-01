import { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, LogOut, WifiOff, HardDrive } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from '../common/ThemeToggle';
import SyncQueuePanel from '../ui/SyncQueuePanel';
import { useSyncQueue } from '../../hooks/useIndexedDB';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/exams', label: 'Exams', authOnly: true },
  { to: '/dashboard', label: 'Dashboard', authOnly: true },
];

function getInitials(fullName = '') {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function navLinkClasses({ isActive }) {
  return [
    'px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200',
    isActive
      ? 'text-primary bg-surface-container-high border-b-2 border-primary'
      : 'text-secondary hover:text-primary hover:bg-surface-container',
  ].join(' ');
}

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { queueSize } = useSyncQueue();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const userMenuRef = useRef(null);

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

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const visibleLinks = NAV_LINKS.filter((link) => !link.authOnly || isAuthenticated);

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-surface-variant">
      <nav className="container flex h-16 items-center justify-between gap-4">
        {/* Brand */}
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 group"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-on-primary text-sm font-black transition-transform group-hover:scale-110">
            TU
          </span>
          <span className="hidden font-headline font-black text-primary tracking-tight sm:block">
            MOCKTEST
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex md:items-center md:gap-1">
          {visibleLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={navLinkClasses}>
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Desktop auth area + theme toggle + offline indicator + sync queue */}
        <div className="hidden md:flex md:items-center md:gap-3">
          {/* Sync Queue Trigger Button */}
          <button
            type="button"
            onClick={() => setIsQueueOpen(true)}
            className="relative flex items-center gap-1.5 rounded-lg border border-surface-variant bg-surface-container px-3 py-1.5 text-xs font-semibold text-secondary hover:border-primary hover:text-primary transition-all"
            title="Open Offline Sync Queue"
          >
            <HardDrive size={15} />
            <span>Sync Queue</span>
            {queueSize > 0 && (
              <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-on-primary text-[10px] font-bold animate-pulse">
                {queueSize}
              </span>
            )}
          </button>

          {/* Offline Indicator */}
          {!isOnline && (
            <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold bg-surface-container border border-surface-variant text-secondary">
              <WifiOff size={14} />
              <span>Offline</span>
            </div>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />


          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 text-sm font-semibold text-secondary bg-surface-container border border-surface-variant transition-all hover:border-primary hover:text-primary focus:outline-none"
                aria-expanded={isUserMenuOpen}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-on-primary text-xs font-black">
                  {getInitials(user?.fullName) || 'U'}
                </span>
                <span className="max-w-[120px] truncate">{user?.fullName}</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 text-secondary ${isUserMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isUserMenuOpen && (
                <div className="animate-fade-in absolute right-0 mt-2 w-52 rounded-xl bg-surface-container-lowest border border-surface-variant shadow-lg py-1">
                  <div className="px-4 py-3 border-b border-surface-variant">
                    <p className="truncate text-sm font-bold text-primary">{user?.fullName}</p>
                    <p className="truncate text-xs text-secondary mt-0.5">{user?.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-semibold text-secondary hover:bg-surface-container hover:text-primary transition-colors"
                  >
                    <LogOut size={15} />
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="border border-outline-variant text-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-surface-container transition-all"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          {!isOnline && <WifiOff size={17} className="text-secondary" />}
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-secondary hover:text-primary hover:bg-surface-container transition-all focus:outline-none"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile panel */}
      {isMobileMenuOpen && (
        <div className="animate-fade-in md:hidden bg-surface border-t border-surface-variant">
          <div className="container flex flex-col gap-1 py-3">
            {visibleLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setIsMobileMenuOpen(false)}
                className={navLinkClasses}
              >
                {link.label}
              </NavLink>
            ))}

            <div className="mt-2 pt-3 border-t border-surface-variant">
              {isAuthenticated ? (
                <div className="flex items-center justify-between px-3">
                  <div>
                    <p className="text-sm font-bold text-primary">{user?.fullName}</p>
                    <p className="text-xs text-secondary">{user?.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-sm font-semibold text-secondary hover:text-primary transition-colors"
                  >
                    <LogOut size={15} />
                    Log out
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 px-3">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="border border-outline-variant text-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-surface-container flex-1 text-center transition-all"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 flex-1 text-center transition-opacity"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sync Queue Drawer Panel */}
      <SyncQueuePanel isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />
    </header>
  );
}

export default Navbar;