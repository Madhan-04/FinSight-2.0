"use client";

import React from 'react';

export default function Waveform() {
  return (
    <div className="flex items-center gap-1.5 justify-center py-4 px-6 bg-blue-500/5 border border-blue-500/20 rounded-xl">
      <span className="text-xs text-blue-400 font-bold uppercase tracking-widest mr-3 animate-pulse">
        Listening...
      </span>
      <div className="flex items-end gap-1 h-6">
        <div className="w-1 bg-blue-500 rounded-full animate-bounce h-3" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-1 bg-blue-400 rounded-full animate-bounce h-5" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-1 bg-cyan-500 rounded-full animate-bounce h-2" style={{ animationDelay: '0.3s' }}></div>
        <div className="w-1 bg-cyan-400 rounded-full animate-bounce h-6" style={{ animationDelay: '0.4s' }}></div>
        <div className="w-1 bg-blue-500 rounded-full animate-bounce h-4" style={{ animationDelay: '0.5s' }}></div>
      </div>
    </div>
  );
}
