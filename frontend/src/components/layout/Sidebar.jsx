import { NavLink } from 'react-router-dom';
import { useUIStore } from '../../stores/uiStore';
import { useAuth } from '../../hooks/useAuth';

/**
 * Sidebar - Metallic Silver Design
 * Collapsible admin navigation sidebar matching the stitch template
 */

const ADMIN_LINKS = [
  { to: '/admin', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/admin/users', label: 'User Management', icon: 'group' },
  { to: '/admin/exams', label: 'Exam Creator', icon: 'edit_note' },
  { to: '/admin/questions', label: 'Question Bank', icon: 'database' },
  { to: '/admin/analytics', label: 'Analytics', icon: 'analytics' },
];

function Sidebar() {
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();
  const { user } = useAuth();

  return (
    <aside
      className={`flex flex-col h-screen transition-all duration-300 bg-surface-container-low border-r border-surface-container-highest sticky top-0 shrink-0 ${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header Identity */}
      <div className={`px-4 py-5 border-b border-surface-container-highest ${isSidebarCollapsed ? 'flex justify-center' : ''}`}>
        {isSidebarCollapsed ? (
          <span className="font-headline font-black text-primary text-sm">TU</span>
        ) : (
          <>
            <h1 className="font-headline font-bold text-primary text-lg tracking-tight">Admin Suite</h1>
            <p className="text-[11px] text-secondary mt-0.5 font-semibold uppercase tracking-wider">Management Portal</p>
          </>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {ADMIN_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            title={isSidebarCollapsed ? link.label : undefined}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200',
                isActive
                  ? 'bg-primary text-on-primary active:scale-[0.98]'
                  : 'text-secondary hover:bg-surface-container-high hover:text-primary active:scale-[0.98]',
              ].join(' ')
            }
          >
            <span className="material-symbols-outlined text-xl shrink-0">{link.icon}</span>
            {!isSidebarCollapsed && <span>{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer: User info + collapse button */}
      <div className="border-t border-surface-container-highest p-3 space-y-2">
        {/* Collapse toggle */}
        <button
          type="button"
          onClick={toggleSidebar}
          className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-semibold text-secondary hover:bg-surface-container-high hover:text-primary transition-all ${
            isSidebarCollapsed ? 'justify-center' : ''
          }`}
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span
            className={`material-symbols-outlined text-base shrink-0 transition-transform duration-300 ${
              isSidebarCollapsed ? 'rotate-180' : ''
            }`}
          >
            chevron_left
          </span>
          {!isSidebarCollapsed && <span>Collapse</span>}
        </button>

        {/* User chip */}
        {!isSidebarCollapsed && user && (
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-black shrink-0">
              {(user?.fullName || 'A')[0].toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-primary truncate">{user?.fullName || 'Admin User'}</p>
              <p className="text-[10px] text-secondary uppercase tracking-widest truncate">Super Admin</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
