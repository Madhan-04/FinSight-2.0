"use client";

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-slate-100 relative overflow-hidden px-6">
      {/* Background glows */}
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] bg-rose-600/6 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-amber-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-lg animate-fade-in-up space-y-8">
        {/* Error Icon */}
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto shadow-[0_0_30px_-5px_rgba(239,68,68,0.15)]">
          <AlertTriangle className="w-8 h-8 text-rose-400" />
        </div>

        <div>
          <span className="text-[9px] uppercase font-black tracking-widest text-rose-400">System Error</span>
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-300 mt-1 tracking-tight">
            Something went wrong
          </h1>
          <p className="text-slate-500 text-sm mt-3 leading-relaxed">
            An unexpected error occurred in FinSight AI. This may be a temporary issue. Try refreshing the page.
          </p>
          {error?.message && (
            <div className="mt-4 p-3.5 bg-rose-500/5 border border-rose-500/10 rounded-xl text-left">
              <p className="text-[9px] font-black uppercase tracking-widest text-rose-400 mb-1">Error Details</p>
              <p className="text-[11px] text-slate-400 font-mono leading-relaxed break-all">{error.message}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-[11px] font-black uppercase tracking-widest text-white transition-all shadow-[0_4px_20px_-4px_rgba(239,68,68,0.2)]"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900/50 border border-white/[0.06] hover:border-indigo-500/20 hover:bg-slate-900 text-[11px] font-black uppercase tracking-widest text-slate-300 transition-all"
          >
            <Home className="w-4 h-4" /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
