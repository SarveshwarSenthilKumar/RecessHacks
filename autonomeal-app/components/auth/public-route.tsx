'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

export default function PublicRoute({
  children,
  redirectTo = '/dashboard',
}: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const { user, isLoading, checkAuthStatus } = useAuth();
  const [shouldRender, setShouldRender] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await checkAuthStatus();
      
      if (isAuthenticated) {
        // User is already authenticated, redirect to dashboard or specified route
        router.push(redirectTo);
      } else {
        setShouldRender(true);
      }
    };

    if (!isLoading) {
      checkAuth();
    }
  }, [user, isLoading, checkAuthStatus, redirectTo, router]);

  if (isLoading || !shouldRender) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return <>{children}</>;
}
