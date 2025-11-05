'use client';

import { useState, useRef, useEffect } from 'react';
import { Sidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { PanelLeftClose, PanelLeft, GripVertical } from 'lucide-react';

interface ResizableSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export function ResizableSidebar({ user }: ResizableSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256); // 16rem default
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const minWidth = 200;
  const maxWidth = 400;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = e.clientX;
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  return (
    <div className="relative flex-shrink-0">
      {/* Sidebar Container */}
      <div
        ref={sidebarRef}
        className="relative transition-all duration-300 ease-in-out overflow-hidden"
        style={{
          width: isCollapsed ? '0px' : `${sidebarWidth}px`,
        }}
      >
        {/* Sidebar Content - Fixed Width */}
        <div 
          className="h-screen"
          style={{ width: `${sidebarWidth}px` }}
        >
          <Sidebar user={user} />
        </div>

        {/* Resize Handle */}
        {!isCollapsed && (
          <div
            className="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-blue-500 transition-colors group z-50"
            onMouseDown={handleMouseDown}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-blue-500 rounded-full p-1">
                <GripVertical className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        )}

        {/* Toggle Button - Inside Sidebar */}
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-2 z-50 bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={() => setIsCollapsed(true)}
            title="Collapse sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Expand Button - When Collapsed */}
      {isCollapsed && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm hover:bg-background shadow-md"
          onClick={() => setIsCollapsed(false)}
          title="Expand sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
