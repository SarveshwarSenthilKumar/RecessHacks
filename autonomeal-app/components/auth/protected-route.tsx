'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({
  children,
  requireAuth = true,
  redirectTo = '/login',
}: {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}) {
  const { user, isLoading, checkAuthStatus } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await checkAuthStatus();
      
      if (requireAuth && !isAuthenticated) {
        // User is not authenticated but the route requires authentication
        router.push(redirectTo);
        return;
      }
      
      if (!requireAuth && isAuthenticated) {
        // User is authenticated but the route should only be accessible to unauthenticated users
        router.push(redirectTo);
        return;
      }
      
      setIsAuthorized(true);
    };

    if (!isLoading) {
      checkAuth();
    }
  }, [user, isLoading, checkAuthStatus, requireAuth, redirectTo, router]);

  if (isLoading || isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // or a custom unauthorized component
  }

  return <>{children}</>;
}
