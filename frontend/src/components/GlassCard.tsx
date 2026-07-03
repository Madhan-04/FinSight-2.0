import React, { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  hoverGlow?: boolean;
}

export default function GlassCard({ children, className = '', glow = false, hoverGlow = true }: GlassCardProps) {
  return (
    <div 
      className={`
        relative backdrop-blur-2xl bg-slate-900/30 border border-white/[0.04] rounded-2xl p-6
        transition-all duration-300 ease-out
        ${glow ? 'shadow-[0_0_40px_rgba(99,102,241,0.12)] border-indigo-500/20' : ''} 
        ${hoverGlow ? 'hover:border-indigo-500/15 hover:shadow-[0_12px_30px_-10px_rgba(99,102,241,0.08)] hover:bg-slate-900/40 hover:-translate-y-0.5' : ''} 
        ${className}
      `}
    >
      {/* Top lit accent bar */}
      <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent pointer-events-none" />
      {children}
    </div>
  );
}
