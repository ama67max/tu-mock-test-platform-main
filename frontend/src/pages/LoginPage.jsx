import { Navigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import LoginForm from '../components/auth/LoginForm';
import { useAuth } from '../hooks/useAuth';

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
    <div className="bg-background text-on-surface flex items-center justify-center min-h-[calc(100vh-64px)] py-12 px-4 relative overflow-hidden">
      {/* Background Dot Texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <main className="w-full max-w-[420px] relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <h1 className="font-headline text-3xl font-black text-primary tracking-tighter mb-1">
            MOCKTEST
          </h1>
          <p className="font-sans text-secondary uppercase tracking-[0.2em] text-[10px] font-semibold">
            Tribhuvan University Exam Portal
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-surface-container-lowest border border-surface-variant p-8 shadow-sm rounded-xl">
          <div className="mb-6">
            <h2 className="font-headline text-2xl font-bold text-primary">Log In</h2>
            <p className="font-sans text-xs text-secondary mt-1">Access your mock test session</p>
          </div>

          <LoginForm />
        </div>

        {/* Trust Badges */}
        <div className="mt-8 text-center space-y-4">
          <div className="flex justify-center gap-4">
            <div className="h-10 w-10 border border-surface-variant flex items-center justify-center rounded-lg text-secondary">
              <span className="material-symbols-outlined text-lg">verified_user</span>
            </div>
            <div className="h-10 w-10 border border-surface-variant flex items-center justify-center rounded-lg text-secondary">
              <span className="material-symbols-outlined text-lg">shield</span>
            </div>
            <div className="h-10 w-10 border border-surface-variant flex items-center justify-center rounded-lg text-secondary">
              <span className="material-symbols-outlined text-lg">lock</span>
            </div>
          </div>
          <p className="text-[10px] font-sans text-secondary uppercase tracking-widest font-medium">
            TU Entrance Scholar Environment
          </p>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;