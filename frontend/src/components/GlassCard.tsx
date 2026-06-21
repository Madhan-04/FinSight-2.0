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
        backdrop-blur-xl bg-slate-950/40 border border-slate-800/60 rounded-2xl p-6 
        transition-all duration-300 
        ${glow ? 'shadow-[0_0_30px_rgba(59,130,246,0.15)] border-blue-500/20' : ''} 
        ${hoverGlow ? 'hover:border-blue-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.08)] hover:bg-slate-950/50' : ''} 
        ${className}
      `}
    >
      {children}
    </div>
  );
}
