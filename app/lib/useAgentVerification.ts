
import { useUser } from '@/app/context/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAgentVerification(redirectUrl: string = '/agent/verification') {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role !== 'agent') {
        router.push('/dashboard');
        return;
      }

      if (!user.isVerified && !redirectUrl.includes('verification')) {
        router.push(redirectUrl);
      }
    }
  }, [user, loading, router, redirectUrl]);

  return {
    user: user,
    isVerified: user?.isVerified || false,
    isLoading: loading,
    isAgent: user?.role === 'agent'
  };
}