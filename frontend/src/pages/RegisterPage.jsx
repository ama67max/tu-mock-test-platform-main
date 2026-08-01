import { Navigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import RegisterForm from '../components/auth/RegisterForm';
import { useAuth } from '../hooks/useAuth';

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
    <div className="bg-background text-on-surface flex items-center justify-center min-h-[calc(100vh-64px)] py-12 px-4 relative overflow-hidden">
      {/* Background Dot Texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <main className="w-full max-w-[460px] relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <h1 className="font-headline text-3xl font-black text-primary tracking-tighter mb-1">
            MOCKTEST
          </h1>
          <p className="font-sans text-secondary uppercase tracking-[0.2em] text-[10px] font-semibold">
            Tribhuvan University Entrance Portal
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-surface-container-lowest border border-surface-variant p-8 shadow-sm rounded-xl">
          <div className="mb-6">
            <h2 className="font-headline text-2xl font-bold text-primary">Create Account</h2>
            <p className="font-sans text-xs text-secondary mt-1">Start practicing for IOE, CSIT, CMAT, BCA & BIT</p>
          </div>

          <RegisterForm />
        </div>

        {/* Trust Badges */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-[10px] font-sans text-secondary uppercase tracking-widest font-medium">
            Join 50,000+ TU Aspirants Practicing Offline & Online
          </p>
        </div>
      </main>
    </div>
  );
}

export default RegisterPage;