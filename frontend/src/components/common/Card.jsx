import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Card Component - Redesigned with Gradient Backgrounds
 * Uses subtle gradients for depth and visual interest
 * Follows 8pt grid for padding (24px standard)
 */

const variants = {
  // Standard gradient card
  default: 'card',
  
  // Elevated card with solid background
  elevated: 'card-elevated',
  
  // Flat card without gradient
  flat: 'bg-primary border-primary rounded-xl p-6 border',
  
  // Interactive card with hover effect
  interactive: 'card cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
};

const paddings = {
  none: 'p-0',
  sm: 'p-2',    // 16px - 8pt grid
  md: 'p-3',    // 24px - 8pt grid (default)
  lg: 'p-4',    // 32px - 8pt grid
  xl: 'p-6',    // 48px - 8pt grid
};

function Card({
  variant = 'default',
  padding = 'md',
  children,
  className,
  onClick,
  as: Component = 'div',
  ...props
}) {
  return (
    <Component
      className={cn(
        variants[variant],
        padding !== 'md' && paddings[padding], // md is handled by card class
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
}

// Card subcomponents for better composition
Card.Header = function CardHeader({ children, className, ...props }) {
  return (
    <div
      className={cn('mb-3 pb-3 border-b border-secondary', className)}
      {...props}
    >
      {children}
    </div>
  );
};

Card.Title = function CardTitle({ children, className, ...props }) {
  return (
    <h3
      className={cn('text-heading font-semibold text-primary', className)}
      {...props}
    >
      {children}
    </h3>
  );
};

Card.Description = function CardDescription({ children, className, ...props }) {
  return (
    <p className={cn('text-body text-secondary mt-1', className)} {...props}>
      {children}
    </p>
  );
};

Card.Content = function CardContent({ children, className, ...props }) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ children, className, ...props }) {
  return (
    <div
      className={cn('mt-3 pt-3 border-t border-secondary', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
