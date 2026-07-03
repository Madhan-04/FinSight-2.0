"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { FinanceProvider } from '../context/FinanceContext';
import Sidebar from './Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullScreen = pathname === '/' || pathname.startsWith('/presentation');

  return (
    <FinanceProvider>
      {isFullScreen ? (
        <div className="w-full min-h-screen">
          {children}
        </div>
      ) : (
        <div className="flex w-full min-h-screen">
          <Sidebar />
          <main className="flex-1 min-h-screen overflow-y-auto pt-16 lg:pt-0 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
              {children}
            </div>
          </main>
        </div>
      )}
    </FinanceProvider>
  );
}
