import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { FinanceProvider } from '../context/FinanceContext';
import Sidebar from '../components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FinSight AI - Personal Finance Intelligence Platform',
  description: 'Understand spending, detect subscriptions, analyze bank statements, track savings goals, and chat with your AI Spending Coach.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased text-slate-100 flex min-h-screen bg-slate-950`}>
        <FinanceProvider>
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
        </FinanceProvider>
      </body>
    </html>
  );
}
