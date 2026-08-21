import { Navigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import RegisterForm from '../components/auth/RegisterForm';
import { useAuth } from '../hooks/useAuth';
import { SignUp } from '@clerk/react';

function RegisterPage() {
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

      <main className="relative z-10 w-full max-w-[460px]">
        <div className="mb-8 text-center">
          <h1 className="mb-1 font-headline text-3xl font-black tracking-tighter text-primary">MOCKTEST</h1>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-secondary">
            TU entrance preparation portal
          </p>
        </div>

        {import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ? (
          <SignUp routing="path" path="/register" fallbackRedirectUrl="/dashboard" />
        ) : <RegisterForm />}

        <div className="mt-8 text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-secondary">
            Join 50,000+ learners studying with structure and confidence
          </p>
        </div>
      </main>
    </div>
  );
}

export default RegisterPage;