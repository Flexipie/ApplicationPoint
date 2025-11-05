import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ResizableSidebar } from './resizable-sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export async function AppLayout({ children }: AppLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <ResizableSidebar
        user={{
          name: session.user.name,
          email: session.user.email,
        }}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
