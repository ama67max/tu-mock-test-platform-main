import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useUIStore } from '../../stores/uiStore';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * LoadingSpinner Component - Redesigned with Theme Support
 * Simple, elegant spinner that works in both dark and light modes
 */

const sizes = {
  sm: 'h-4 w-4 border-2',   // 16px - compact
  md: 'h-8 w-8 border-2',   // 32px - 8pt grid
  lg: 'h-12 w-12 border-3',  // 48px - 8pt grid
  xl: 'h-16 w-16 border-4',  // 64px - 8pt grid
};

function LoadingSpinner({
  size = 'md',
  label = 'Loading…',
  className,
  overlay = false,
}) {
  const spinner = (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
      className={cn('relative shrink-0', className)}
    >
      <div
        className={cn(
          'animate-spin rounded-full',
          sizes[size]
        )}
        style={{
          borderColor: 'rgb(var(--color-border-secondary))',
          borderTopColor: 'rgb(var(--color-border-accent))',
        }}
      />
      <span className="sr-only">{label}</span>
    </div>
  );

  if (!overlay) {
    return spinner;
  }

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm"
      style={{
        backgroundColor: 'rgba(var(--color-bg-primary), 0.8)',
      }}
    >
      <div 
        className="flex flex-col items-center gap-3 rounded-xl px-8 py-6 shadow-lg"
        style={{
          backgroundColor: 'rgb(var(--color-surface-elevated))',
          border: '1px solid rgb(var(--color-border-primary))',
        }}
      >
        {spinner}
        {label && (
          <p 
            className="text-body font-semibold"
            style={{ color: 'rgb(var(--color-text-secondary))' }}
          >
            {label}
          </p>
        )}
      </div>
    </div>
  );
}

function GlobalLoadingOverlay() {
  const isGlobalLoading = useUIStore((state) => state.isGlobalLoading);

  if (!isGlobalLoading) {
    return null;
  }

  return (
    <LoadingSpinner
      size="lg"
      label="Loading…"
      overlay
    />
  );
}

export { GlobalLoadingOverlay };
export default LoadingSpinner;
