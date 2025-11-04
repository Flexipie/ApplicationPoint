import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth, signOut } from '@/lib/auth';
import { Sidebar } from '@/components/ui/sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export async function AppLayout({ children }: AppLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const handleSignOut = async () => {
    'use server';
    await signOut({ redirectTo: '/login' });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        user={{
          name: session.user.name,
          email: session.user.email,
        }}
        onSignOut={handleSignOut}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
