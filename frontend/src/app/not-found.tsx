"use client";

import React from 'react';
import Link from 'next/link';
import { Sparkles, Home, ArrowRight, Zap } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-slate-100 relative overflow-hidden px-6">
      {/* Background glows */}
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] bg-indigo-600/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/6 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-lg animate-fade-in-up space-y-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-[0_4px_20px_-4px_rgba(99,102,241,0.4)]">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div className="text-left">
            <p className="font-black text-white text-sm leading-none tracking-tight">FinSight AI</p>
            <span className="text-[9px] uppercase font-black text-indigo-400 tracking-widest flex items-center gap-1 mt-0.5">
              <Zap className="w-2.5 h-2.5 fill-indigo-400" /> Version 4.0
            </span>
          </div>
        </div>

        {/* 404 Code */}
        <div>
          <h1 className="text-[96px] font-black text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-white/5 leading-none select-none">
            404
          </h1>
          <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-300 -mt-4 tracking-tight">
            Page Not Found
          </p>
          <p className="text-slate-500 text-sm mt-3 leading-relaxed">
            This route does not exist in your financial workspace. You may have followed a broken link or mistyped a URL.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-[11px] font-black uppercase tracking-widest text-white transition-all shadow-[0_4px_20px_-4px_rgba(99,102,241,0.3)]"
          >
            <Home className="w-4 h-4" /> Go to Dashboard
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900/50 border border-white/[0.06] hover:border-indigo-500/20 hover:bg-slate-900 text-[11px] font-black uppercase tracking-widest text-slate-300 transition-all"
          >
            Back to Home <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
