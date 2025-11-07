'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, Mail, Settings, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Applications', href: '/applications', icon: Briefcase },
  { name: 'Email Review', href: '/email-review', icon: Mail },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="flex h-screen w-full flex-col border-r border-gray-200 bg-white overflow-hidden">
      {/* Logo */}
      <div className="flex h-12 items-center border-b border-gray-200 px-4 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0 overflow-hidden">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex-shrink-0">
            <Briefcase className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold text-gray-900 truncate">ApplicationPoint</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-2 py-3 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t p-3 flex-shrink-0">
        <div className="flex items-center gap-2.5 mb-2 min-w-0">
          <Avatar className="h-7 w-7 flex-shrink-0">
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xs">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{user.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        <Separator className="mb-2" />
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs h-7"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-3.5 w-3.5" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
