import { UserProfile } from '@clerk/react';
import { Navigate } from 'react-router-dom';

function VerifyPhonePage() {
  if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <UserProfile routing="path" path="/verify-phone" />
    </div>
  );
}

export default VerifyPhonePage;