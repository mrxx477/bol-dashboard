'use client';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthWrapper } from '@/components/AuthWrapper';

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthWrapper>
        <Shell>{children}</Shell>
      </AuthWrapper>
    </AuthProvider>
  );
}
