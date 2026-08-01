import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { GlobalLoadingOverlay } from './components/common/LoadingSpinner.jsx';
import PWAInstallPrompt from './components/common/PWAInstallPrompt.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import './styles/globals.css';

// Initialize Service Worker for PWA
import './utils/registerSW.js';

const rootElement = document.getElementById('root');

// Theme-aware Toaster wrapper
function ThemedToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        className: '',
        style: {
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: 500,
          background: 'rgb(var(--color-surface-elevated))',
          color: 'rgb(var(--color-text-primary))',
          border: '1px solid rgb(var(--color-border-primary))',
          boxShadow: 'var(--shadow-lg)',
        },
        success: {
          iconTheme: {
            primary: '#12b76a',
            secondary: 'rgb(var(--color-surface-elevated))',
          },
        },
        error: {
          iconTheme: {
            primary: '#f04438',
            secondary: 'rgb(var(--color-surface-elevated))',
          },
        },
      }}
    />
  );
}

createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
        <GlobalLoadingOverlay />
        <ThemedToaster />
        <PWAInstallPrompt />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);