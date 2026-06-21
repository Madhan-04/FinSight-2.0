"use client";

import React from 'react';
import { ShieldCheck, ShieldAlert, Heart, Info } from 'lucide-react';

interface HealthScoreProps {
  score: number;
  status: string;
  breakdown: string[];
  recommendation: string;
}

export default function HealthScore({ score, status, breakdown, recommendation }: HealthScoreProps) {
  // Determine color matching status
  const getColor = () => {
    switch (status.toLowerCase()) {
      case 'excellent':
        return { text: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', stroke: '#10b981', ring: 'shadow-emerald-500/25' };
      case 'good':
        return { text: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/10', stroke: '#3b82f6', ring: 'shadow-blue-500/25' };
      case 'fair':
        return { text: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/10', stroke: '#f59e0b', ring: 'shadow-amber-500/25' };
      case 'poor':
      default:
        return { text: 'text-rose-400', border: 'border-rose-500/20', bg: 'bg-rose-500/10', stroke: '#f43f5e', ring: 'shadow-rose-500/25' };
    }
  };

  const scheme = getColor();
  const radius = 65;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col md:flex-row gap-6 items-center">
      {/* Dynamic SVG Gauge */}
      <div className="relative flex items-center justify-center w-40 h-40">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="#1e293b"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Foreground animated value */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={scheme.stroke}
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 8px ${scheme.stroke}40)` }}
          />
        </svg>
        {/* Core Value Label */}
        <div className="absolute text-center">
          <span className="text-4xl font-extrabold text-white tracking-tighter">{score}</span>
          <span className="text-slate-500 text-[10px] block font-bold uppercase tracking-widest mt-0.5">Health Score</span>
        </div>
      </div>

      {/* Description and Diagnostic Breakdown */}
      <div className="flex-1 space-y-3.5">
        <div className="flex items-center gap-2.5">
          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${scheme.bg} ${scheme.text} border ${scheme.border}`}>
            {status}
          </span>
          {score >= 70 ? (
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-rose-400" />
          )}
        </div>

        <p className="text-xs text-slate-300 italic bg-slate-900/40 p-3 rounded-xl border border-slate-800/40 relative">
          <span className="text-blue-400 font-bold not-italic block text-[10px] uppercase tracking-wider mb-1">AI Coach Recommendation</span>
          "{recommendation}"
        </p>

        <div className="space-y-1.5">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" /> Diagnostics Checklist
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {breakdown.map((item, idx) => (
              <li key={idx} className="text-[11px] text-slate-400 flex items-start gap-2 bg-slate-950/20 px-2.5 py-1.5 rounded-lg border border-slate-900/60">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
