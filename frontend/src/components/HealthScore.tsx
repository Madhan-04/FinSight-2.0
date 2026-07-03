"use client";

import React from 'react';
import { ShieldCheck, ShieldAlert, Heart, Info, Check } from 'lucide-react';

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
        return { text: 'text-indigo-400', border: 'border-indigo-500/20', bg: 'bg-indigo-500/10', stroke: '#6366f1', ring: 'shadow-indigo-500/25' };
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
            stroke="#0b0e17"
            strokeWidth="8"
            fill="transparent"
            className="opacity-50"
          />
          {/* Foreground animated value */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={scheme.stroke}
            strokeWidth="9"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 10px ${scheme.stroke}30)` }}
          />
        </svg>
        {/* Core Value Label */}
        <div className="absolute text-center">
          <span className="text-4xl font-black text-white tracking-tighter tabular-nums">{score}</span>
          <span className="text-slate-500 text-[9px] block font-black uppercase tracking-widest mt-1">Health Index</span>
        </div>
      </div>

      {/* Description and Diagnostic Breakdown */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-2.5">
          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${scheme.bg} ${scheme.text} border ${scheme.border}`}>
            {status}
          </span>
          {score >= 70 ? (
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-rose-400" />
          )}
        </div>

        <p className="text-xs text-slate-350 bg-slate-950/45 p-4 rounded-xl border border-white/[0.03] leading-relaxed relative">
          <span className="text-indigo-400 font-black block text-[9px] uppercase tracking-widest mb-1.5">AI Advisor Recommendation</span>
          &ldquo;{recommendation}&rdquo;
        </p>

        <div className="space-y-2">
          <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-indigo-400" /> Diagnostics Checklist
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {breakdown.map((item, idx) => (
              <li key={idx} className="text-[11px] text-slate-350 flex items-start gap-2 bg-slate-900/10 px-3 py-2 rounded-xl border border-white/[0.03]">
                <div className="w-4 h-4 rounded-full bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
