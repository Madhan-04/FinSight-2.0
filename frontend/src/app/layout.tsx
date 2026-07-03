"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Inter } from 'next/font/google';
import './globals.css';
import { FinanceProvider } from '../context/FinanceContext';
import Sidebar from '../components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Clean, spacious full-screen layouts for Landing Page and Walkthrough Page
  const isFullScreenPage = pathname === '/' || pathname.startsWith('/presentation');

  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased text-slate-100 min-h-screen flex`}>
        <FinanceProvider>
          {isFullScreenPage ? (
            <div className="w-full min-h-screen">
              {children}
            </div>
          ) : (
            <div className="flex w-full min-h-screen">
              {/* Sidebar Navigation */}
              <Sidebar />
              
              {/* Main Application Content Area */}
              <main className="flex-1 min-h-screen overflow-y-auto px-8 py-8">
                <div className="max-w-6.5xl mx-auto space-y-8">
                  {children}
                </div>
              </main>
            </div>
          )}
        </FinanceProvider>
      </body>
    </html>
  );
}
