import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * ThemeToggle Component - Smooth animated theme switching
 * Inspired by Magic UI's AnimatedThemeToggler but simplified
 * Uses CSS transitions for smooth theme changes
 */

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex h-10 w-10 items-center justify-center rounded-lg
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
        hover:scale-105 active:scale-95
        ${className}
      `}
      style={{
        backgroundColor: 'rgb(var(--color-bg-secondary))',
        color: 'rgb(var(--color-text-secondary))',
        borderColor: 'rgb(var(--color-border-primary))',
        border: '1px solid',
      }}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-5 h-5">
        {/* Sun icon (visible in dark mode) */}
        <Sun
          className={`absolute inset-0 transition-all duration-500 ${
            theme === 'dark'
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 rotate-90 scale-0'
          }`}
          size={20}
          strokeWidth={2.5}
        />
        
        {/* Moon icon (visible in light mode) */}
        <Moon
          className={`absolute inset-0 transition-all duration-500 ${
            theme === 'light'
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 -rotate-90 scale-0'
          }`}
          size={20}
          strokeWidth={2.5}
        />
      </div>
      
      {/* Subtle shimmer effect on hover */}
      <div 
        className="absolute inset-0 rounded-lg opacity-0 hover:opacity-10 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(135deg, transparent 0%, rgb(var(--color-border-accent)) 50%, transparent 100%)',
          backgroundSize: '200% 200%',
          animation: 'shimmer 3s ease-in-out infinite',
        }}
      />
    </button>
  );
}
