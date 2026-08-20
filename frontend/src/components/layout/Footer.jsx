import { Link } from 'react-router-dom';

const CURRENT_YEAR = new Date().getFullYear();

/**
 * Footer - Redesigned with Theme Support
 * Uses CSS custom properties for theme-aware colors
 */

function Footer() {
  return (
    <footer 
      style={{
        backgroundColor: 'rgb(var(--color-bg-secondary))',
        borderTop: '1px solid rgb(var(--color-border-secondary))',
      }}
    >
      <div className="container grid grid-cols-1 gap-8 py-10 sm:grid-cols-3">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2">
            <span 
              className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold"
              style={{
                background: 'var(--gradient-dark)',
                color: 'rgb(var(--color-text-inverse))',
              }}
            >
              TU
            </span>
            <span 
              className="text-body font-semibold"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              Mock Test Platform
            </span>
          </div>
          <p 
            className="mt-3 max-w-xs text-body"
            style={{ color: 'rgb(var(--color-text-tertiary))' }}
          >
            Smarter mock tests and focused practice for IOE, CSIT, CMAT, BCA, and BIT aspirants.
          </p>
        </div>

        {/* Explore */}
        <div>
          <h3 
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: 'rgb(var(--color-text-tertiary))' }}
          >
            Explore
          </h3>
          <ul className="mt-3 space-y-2 text-body">
            <li>
              <Link 
                to="/exams" 
                className="inline-flex min-h-11 items-center transition-colors hover:text-primary"
                style={{ color: 'rgb(var(--color-text-secondary))' }}
              >
                Exams
              </Link>
            </li>
            <li>
              <Link 
                to="/dashboard" 
                className="inline-flex min-h-11 items-center transition-colors hover:text-primary"
                style={{ color: 'rgb(var(--color-text-secondary))' }}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/exams" 
                className="inline-flex min-h-11 items-center transition-colors hover:text-primary"
                style={{ color: 'rgb(var(--color-text-secondary))' }}
              >
                Leaderboards
              </Link>
            </li>
          </ul>
        </div>

        {/* Account */}
        <div>
          <h3 
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: 'rgb(var(--color-text-tertiary))' }}
          >
            Account
          </h3>
          <ul className="mt-3 space-y-2 text-body">
            <li>
              <Link 
                to="/login" 
                className="inline-flex min-h-11 items-center transition-colors hover:text-primary"
                style={{ color: 'rgb(var(--color-text-secondary))' }}
              >
                Log in
              </Link>
            </li>
            <li>
              <Link 
                to="/register" 
                className="inline-flex min-h-11 items-center transition-colors hover:text-primary"
                style={{ color: 'rgb(var(--color-text-secondary))' }}
              >
                Sign up
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgb(var(--color-border-secondary))' }}>
        <div className="container py-4">
          <p 
            className="text-xs"
            style={{ color: 'rgb(var(--color-text-tertiary))' }}
          >
            &copy; {CURRENT_YEAR} TU Mock Test Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
