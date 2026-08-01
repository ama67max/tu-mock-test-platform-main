import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Input Component - Redesigned with Theme Support
 * Uses CSS custom properties for theme-aware colors
 * Follows 8pt grid for sizing
 */

const sizes = {
  sm: 'px-2.5 py-2 text-body h-8',    // 32px height - 8pt grid
  md: 'px-3 py-2.5 text-body h-10',   // 40px height - 8pt grid
  lg: 'px-4 py-3 text-body h-12',     // 48px height - 8pt grid
};

const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    fullWidth = true,
    icon,
    rightAdornment,
    size = 'md',
    required = false,
    disabled = false,
    className,
    wrapperClassName,
    id,
    name,
    ...props
  },
  ref
) {
  const inputId =
    id ||
    (name ? `input-${name}` : label?.toLowerCase().replace(/\s+/g, '-'));

  return (
    <div
      className={cn(
        'flex flex-col gap-1.5',
        fullWidth && 'w-full',
        wrapperClassName
      )}
    >
      {label && (
        <label
          htmlFor={inputId}
          className="text-body font-semibold"
          style={{ color: 'rgb(var(--color-text-primary))' }}
        >
          {label}
          {required && (
            <span className="ml-0.5 text-danger-600" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div 
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'rgb(var(--color-text-tertiary))' }}
          >
            {icon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          name={name}
          disabled={disabled}
          required={required}
          className={cn(
            // Base input styles from globals.css
            'input-base',
            // Size variants (8pt grid)
            sizes[size],
            // Icon spacing
            icon && 'pl-10',
            rightAdornment && 'pr-10',
            // Error state
            error && 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20',
            // Full width
            fullWidth && 'w-full',
            // Custom overrides
            className
          )}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
                ? `${inputId}-helper`
                : undefined
          }
          aria-required={required || undefined}
          {...props}
        />

        {rightAdornment && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {rightAdornment}
          </div>
        )}
      </div>

      {error && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="text-body text-danger-600 font-regular"
        >
          {error}
        </p>
      )}

      {!error && helperText && (
        <p 
          id={`${inputId}-helper`} 
          className="text-body font-regular"
          style={{ color: 'rgb(var(--color-text-tertiary))' }}
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

export default Input;
