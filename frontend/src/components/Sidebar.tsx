"use client";

import React from 'react';
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
  ShieldCheck
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Safety Audit', path: '/safety', icon: ShieldCheck },
    { name: 'Statement Intelligence', path: '/statements', icon: FileSpreadsheet },
    { name: 'Analytics Center', path: '/analytics', icon: TrendingUp },
    { name: 'Savings Goals', path: '/goals', icon: Target },
    { name: 'AI Advisor', path: '/chat', icon: MessageSquare },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/80 backdrop-blur-xl h-screen sticky top-0 flex flex-col justify-between p-6">
      <div>
        {/* Brand Logo Header */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.4)]">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 text-lg leading-tight tracking-wider">
              FinSight AI
            </h1>
            <span className="text-[10px] uppercase font-bold text-blue-400 tracking-widest flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 fill-blue-400" /> Version 3.0
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 font-semibold text-xs group
                  ${isActive 
                    ? 'bg-blue-600/15 border-l-2 border-blue-500 text-blue-200 shadow-[inset_0_0_15px_rgba(59,130,246,0.06)] font-bold' 
                    : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                  }
                `}
              >
                <Icon className={`w-4.5 h-4.5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Decorative Premium Coaching CTA */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950/40 p-4 text-center mt-auto shadow-[0_0_20px_rgba(59,130,246,0.03)]">
        <div className="absolute -top-12 -left-12 w-24 h-24 rounded-full bg-blue-600/10 blur-xl"></div>
        <div className="absolute -bottom-12 -right-12 w-24 h-24 rounded-full bg-cyan-600/10 blur-xl"></div>
        
        <p className="text-xs font-bold text-slate-300 relative z-10">AI Spending Coach</p>
        <p className="text-[10px] text-slate-500 mt-1 mb-3 relative z-10">Maximize savings with personalized intelligence.</p>
        
        <Link 
          href="/chat"
          className="block w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-[10px] font-bold text-white transition-all shadow-[0_0_10px_rgba(59,130,246,0.2)] hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] relative z-10"
        >
          Talk to Coach
        </Link>
      </div>
    </aside>
  );
}
