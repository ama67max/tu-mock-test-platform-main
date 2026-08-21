import { Navigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import LoginForm from '../components/auth/LoginForm';
import { useAuth } from '../hooks/useAuth';
import { SignIn } from '@clerk/react';

function LoginPage() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-24">
        <LoadingSpinner size="lg" label="Loading portal" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden bg-background px-4 py-12 text-on-surface">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <main className="relative z-10 w-full max-w-[420px]">
        <div className="mb-8 text-center">
          <h1 className="mb-1 font-headline text-3xl font-black tracking-tighter text-primary">MOCKTEST</h1>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-secondary">
            Tribhuvan University exam portal
          </p>
        </div>

        {import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ? (
          <SignIn routing="path" path="/login" fallbackRedirectUrl="/dashboard" />
        ) : <LoginForm />}

        <div className="mt-8 space-y-4 text-center">
          <div className="flex justify-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-surface-variant text-secondary">
              <span className="material-symbols-outlined text-lg">verified_user</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-surface-variant text-secondary">
              <span className="material-symbols-outlined text-lg">shield</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-surface-variant text-secondary">
              <span className="material-symbols-outlined text-lg">lock</span>
            </div>
          </div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-secondary">
            Secure TU entrance study environment
          </p>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;