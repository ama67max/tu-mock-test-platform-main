import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Badge Component - Status and category indicators
 * Uses predefined color schemes for consistency
 */

const variants = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  neutral: 'badge-neutral',
  primary: 'bg-black-800 text-white dark:bg-white dark:text-black-950',
  silver: 'bg-silver-200 text-silver-800 dark:bg-silver-700 dark:text-silver-200',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',     // Small badge
  md: 'px-2.5 py-0.5 text-xs',   // Default
  lg: 'px-3 py-1 text-body',     // Larger badge
};

function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className,
  ...props
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// Dot variant for status indicators
Badge.Dot = function BadgeDot({ variant = 'neutral', className, ...props }) {
  const dotColors = {
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
    neutral: 'bg-silver-500',
    primary: 'bg-black-800 dark:bg-white',
  };

  return (
    <span
      className={cn(
        'inline-block h-2 w-2 rounded-full',
        dotColors[variant],
        className
      )}
      {...props}
    />
  );
};

export default Badge;
