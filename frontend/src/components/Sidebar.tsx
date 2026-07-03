"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  TrendingUp, 
  Target, 
  MessageSquare,
  Sparkles,
  Zap,
  ShieldCheck,
  Heart,
  Menu,
  X
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Safety Audit', path: '/safety', icon: ShieldCheck },
    { name: 'Statements', path: '/statements', icon: FileSpreadsheet },
    { name: 'Analytics', path: '/analytics', icon: TrendingUp },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'AI Advisor', path: '/chat', icon: MessageSquare },
    { name: 'Social Impact', path: '/social-impact', icon: Heart },
  ];

  const NavContent = () => (
    <>
      {/* Brand Logo */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-[0_4px_15px_-3px_rgba(99,102,241,0.3)] flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-200 text-base leading-none tracking-tight">
            FinSight AI
          </h1>
          <span className="text-[9px] uppercase font-black text-indigo-400 tracking-widest flex items-center gap-1 mt-1 leading-none">
            <Zap className="w-2.5 h-2.5 fill-indigo-400 text-indigo-400" /> Version 4.0
          </span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="space-y-1 flex-1">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setMobileOpen(false)}
              className={`
                flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 font-extrabold text-[11px] uppercase tracking-wider group border
                ${isActive 
                  ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-200 shadow-[inset_0_0_15px_rgba(99,102,241,0.03)]' 
                  : 'border-transparent text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
                }
              `}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-350'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* AI Coach CTA */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.04] bg-slate-950/20 p-4 text-center mt-4">
        <div className="absolute -top-12 -left-12 w-24 h-24 rounded-full bg-indigo-600/10 blur-xl" />
        <div className="absolute -bottom-12 -right-12 w-24 h-24 rounded-full bg-violet-600/10 blur-xl" />
        <p className="text-[11px] font-black text-slate-200 uppercase tracking-wider relative z-10">AI Spending Coach</p>
        <p className="text-[9px] text-slate-500 mt-1 mb-3 leading-relaxed relative z-10">Maximize savings with personalized intelligence.</p>
        <Link 
          href="/chat"
          onClick={() => setMobileOpen(false)}
          className="block w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-md relative z-10"
        >
          Talk to Coach
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex w-60 xl:w-64 border-r border-white/[0.04] bg-slate-950/60 backdrop-blur-2xl h-screen sticky top-0 flex-col p-5 shrink-0">
        <NavContent />
      </aside>

      {/* ── Mobile Top Bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-slate-950/90 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <span className="font-black text-white text-sm leading-none tracking-tight">FinSight AI</span>
            <span className="text-[8px] uppercase font-black text-indigo-400 tracking-widest block mt-0.5">Version 4.0</span>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-slate-900/60 border border-white/[0.06] text-slate-400 hover:text-white transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Mobile Drawer Overlay ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile Slide-out Drawer ── */}
      <aside className={`
        lg:hidden fixed top-0 left-0 z-40 h-full w-72 bg-slate-950/95 backdrop-blur-2xl border-r border-white/[0.06] p-5 pt-16 flex flex-col
        transition-transform duration-300 ease-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <NavContent />
      </aside>
    </>
  );
}
