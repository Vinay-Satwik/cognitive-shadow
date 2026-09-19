import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { mode } = useApp();

  return (
    <div className={cn(
      "flex h-screen w-screen overflow-hidden text-zinc-100 transition-colors duration-500",
      mode === 'crisis' ? "bg-[#090406]" : "bg-[#08090C]"
    )}>
      {/* Desktop sidebar */}
      <div className="hidden md:flex h-full shrink-0">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Topbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Page view container with generous whitespace */}
        <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          <div className="max-w-5xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
