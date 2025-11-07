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
  const [sidebarWidth, setSidebarWidth] = useState(240); // Smaller default
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const minWidth = 180;
  const maxWidth = 320;

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
        className={`relative overflow-hidden ${isResizing ? '' : 'transition-all duration-200 ease-out'}`}
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
            className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize hover:bg-blue-500/50 transition-colors group z-50"
            onMouseDown={handleMouseDown}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="bg-blue-500 rounded-full p-1 shadow-lg">
                <GripVertical className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>
        )}

        {/* Toggle Button - Inside Sidebar */}
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-50 h-7 w-7 bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={() => setIsCollapsed(true)}
            title="Collapse sidebar"
          >
            <PanelLeftClose className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Expand Button - When Collapsed */}
      {isCollapsed && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-2 left-2 z-50 h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background shadow-md"
          onClick={() => setIsCollapsed(false)}
          title="Expand sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
