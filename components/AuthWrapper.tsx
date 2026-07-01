'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !token && pathname !== '/login') {
      router.replace('/login');
    }
    if (!isLoading && token && pathname === '/login') {
      router.replace('/');
    }
  }, [token, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="w-6 h-6 border-2 border-[#0060e5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!token && pathname !== '/login') return null;

  return <>{children}</>;
}
