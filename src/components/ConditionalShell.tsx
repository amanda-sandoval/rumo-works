'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { NavigationGuideStrip } from '@/components/NavigationGuideStrip';

export function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  if (isLandingPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex-1 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <NavigationGuideStrip />
        {children}
      </main>
      <footer className="border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500">
        <p className="flex items-center justify-center space-x-1">
          <span>Rumo Works &copy; {new Date().getFullYear()}</span>
        </p>
      </footer>
    </div>
  );
}
