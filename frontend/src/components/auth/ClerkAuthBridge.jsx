import { useEffect } from 'react';
import { useAuth as useClerkAuth } from '@clerk/react';
import axiosInstance from '../../api/axiosConfig';
import { useAuthStore } from '../../stores/authStore';

function ClerkAuthBridge() {
  const { isLoaded, isSignedIn, getToken } = useClerkAuth();
  const setTokenProvider = useAuthStore((state) => state.setTokenProvider);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const setInitializing = useAuthStore((state) => state.setInitializing);

  useEffect(() => {
    const redirectToVerification = () => {
      if (window.location.pathname !== '/verify-phone') {
        window.location.assign('/verify-phone');
      }
    };

    window.addEventListener('phone-verification-required', redirectToVerification);
    return () => window.removeEventListener('phone-verification-required', redirectToVerification);
  }, []);

  useEffect(() => {
    if (!isLoaded) return undefined;

    if (!isSignedIn) {
      setTokenProvider(null);
      logout();
      setInitializing(false);
      return undefined;
    }

    setTokenProvider(getToken);

    let cancelled = false;
    const syncUser = async () => {
      try {
        const token = await getToken();
        if (cancelled) return;
        setAccessToken(token);
        const { data } = await axiosInstance.get('/users/me');
        if (!cancelled) {
          setUser(data.data);
          setInitializing(false);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Unable to synchronize Clerk session with the application API', error);
          setTokenProvider(null);
          logout();
          setInitializing(false);
        }
      }
    };

    syncUser();
    return () => {
      cancelled = true;
    };
  }, [getToken, isLoaded, isSignedIn, logout, setAccessToken, setInitializing, setTokenProvider, setUser]);

  return null;
}

export default ClerkAuthBridge;