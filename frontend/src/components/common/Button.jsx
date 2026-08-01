import LoadingSpinner from './LoadingSpinner';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Button Component - Redesigned with 60-30-10 Color Theory
 * Primary: 10% Accent (Highest emphasis - black in light, white in dark)
 * Secondary: 30% Silver (Medium emphasis)
 * Outline: 60% Background (Low emphasis)
 */

const variants = {
  // 10% Accent - Highest emphasis action
  primary: 'btn-primary hover:scale-[1.02] active:scale-[0.98]',
  
  // 30% Silver - Medium emphasis action  
  secondary: 'btn-secondary hover:scale-[1.01] active:scale-[0.99]',
  
  // 60% Background - Low emphasis action
  outline: 'btn-outline hover:scale-[1.01] active:scale-[0.99]',
  
  // Danger variant for destructive actions
  danger:
    'bg-danger-600 text-white shadow-md hover:bg-danger-500 active:bg-danger-700 focus:ring-danger-600 hover:shadow-lg transition-all',
  
  // Ghost for minimal presence
  ghost:
    'bg-transparent hover:shadow-sm transition-all',
};

const sizes = {
  sm: 'h-8 px-3 text-body gap-1.5',      // 8pt grid: 32px height
  md: 'h-10 px-4 text-body gap-2',       // 8pt grid: 40px height  
  lg: 'h-12 px-6 text-subheading gap-2', // 8pt grid: 48px height
};

function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  children,
  className,
  ...props
}) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type="button"
      disabled={isDisabled}
      aria-busy={isLoading}
      className={cn(
        // Base styles
        'inline-flex items-center justify-center font-semibold rounded-lg',
        'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100',
        // Variant styles
        variants[variant],
        // Size styles (8pt grid)
        sizes[size],
        // Width
        fullWidth && 'w-full',
        // Custom overrides
        className
      )}
      {...props}
    >
      {isLoading && (
        <LoadingSpinner
          size={size === 'sm' ? 'sm' : size === 'lg' ? 'md' : 'sm'}
          label="Loading"
          className="pointer-events-none"
        />
      )}
      {children}
    </button>
  );
}

export default Button;
