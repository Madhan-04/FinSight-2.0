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
  const isFullScreenPage = pathname === '/' || pathname.startsWith('/presentation');

  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>FinSight AI 4.0 — Intelligent Financial OS</title>
        <meta name="description" content="Transform bank statements into real-time financial intelligence. 100% client-side, privacy-first AI FinTech platform." />
      </head>
      <body className={`${inter.className} antialiased text-slate-100 min-h-screen`}>
        <FinanceProvider>
          {isFullScreenPage ? (
            <div className="w-full min-h-screen">
              {children}
            </div>
          ) : (
            <div className="flex w-full min-h-screen">
              {/* Sidebar Navigation */}
              <Sidebar />

              {/* Main Content Area — padded top on mobile for fixed header */}
              <main className="flex-1 min-h-screen overflow-y-auto pt-16 lg:pt-0 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
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
