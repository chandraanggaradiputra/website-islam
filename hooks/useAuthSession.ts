'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getSession, logout as serverLogout } from '@/lib/auth';
import { UserSession } from '@/types';

export type AuthRole = 'guest' | 'dkm' | 'admin';

export interface UseAuthSessionResult {
  user: UserSession | null;
  role: AuthRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export function useAuthSession(): UseAuthSessionResult {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const pathname = usePathname();
  const router = useRouter();

  const fetchSession = useCallback(async () => {
    try {
      const session = await getSession();
      setUser(session);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSession();
  }, [pathname, fetchSession]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await serverLogout();
    } catch {
      // In case server action redirect throws in client
      setUser(null);
      router.push('/login');
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  const role: AuthRole = user ? (user.role === 'admin' ? 'admin' : 'dkm') : 'guest';
  const isAuthenticated = Boolean(user);

  return {
    user,
    role,
    isAuthenticated,
    isLoading,
    logout: handleLogout,
    refreshSession: fetchSession,
  };
}
