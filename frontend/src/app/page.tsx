"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  ArrowRight, 
  TrendingUp, 
  DollarSign, 
  BookOpen, 
  Users, 
  FileSpreadsheet, 
  Play
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 80, damping: 15 }
    }
  };

  const floatingVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: 'easeInOut' as const
      }
    }
  };

  return (
    <div className="min-h-screen text-slate-100 font-sans relative overflow-hidden bg-slate-950 pb-20">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[30%] w-[30%] h-[30%] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 pt-16 md:pt-24 text-center relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>FinSight AI 3.0 Platform Live</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-white">
            Predict. Protect. Prosper.<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400">
              Intelligent Financial OS
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={itemVariants} className="text-slate-400 text-base md:text-xl max-w-3xl mx-auto leading-relaxed">
            Transform raw bank statements, UPI records, and monthly expenses into real-time visual intelligence. Clean, secure, and 100% database-free client-side architecture.
          </motion.p>

          {/* Call to Actions */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/dashboard">
              <span className="inline-flex items-center gap-2 py-3.5 px-7 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-sm font-bold text-white shadow-[0_4px_25px_rgba(59,130,246,0.3)] transition-all transform hover:-translate-y-0.5 cursor-pointer">
                <span>Enter Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
            <Link href="/presentation">
              <span className="inline-flex items-center gap-2 py-3.5 px-7 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sm font-bold text-slate-300 transition-all transform hover:-translate-y-0.5 cursor-pointer">
                <Play className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Presentation Walkthrough</span>
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Mockup Panel */}
      <div className="max-w-5xl mx-auto px-6 mt-16 md:mt-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 50, damping: 20, delay: 0.5 }}
        >
          <GlassCard glow className="p-1 border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* Header Toolbar */}
            <div className="flex items-center justify-between border-b border-slate-900 bg-slate-950/40 px-4 py-3 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
              </div>
              <div className="font-semibold text-slate-400 font-mono">localhost:3000/dashboard</div>
              <div className="w-12" />
            </div>
            
            {/* Mock Screen Content */}
            <div className="bg-slate-950/80 p-6 md:p-8 aspect-[16/9] flex flex-col justify-between relative">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Health Status</span>
                  <h3 className="text-xl md:text-2xl font-black text-white">Score: 82/100</h3>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400 text-xs font-black">
                  ACTIVE SAVINGS RATE: 32%
                </div>
              </div>

              {/* Fake Graph Layout */}
              <div className="flex items-end gap-1.5 md:gap-3 h-24 md:h-40 my-6">
                {[45, 60, 52, 75, 68, 85, 95, 88, 110, 98, 125, 140].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <div 
                      style={{ height: `${(h / 140) * 100}%` }}
                      className="w-full bg-gradient-to-t from-blue-600/80 to-cyan-400/80 rounded-t-md group-hover:from-blue-500 group-hover:to-cyan-400 transition-all duration-300"
                    />
                    <span className="text-[8px] md:text-[10px] text-slate-600 group-hover:text-slate-400 font-mono">M{i+1}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-t border-slate-900/60 pt-4 gap-2 text-slate-500 text-[10px] font-bold">
                <span>⚡ Real-time client-side IndexedDB ledger active</span>
                <span>🔥 AI Recommendation: &ldquo;Discretionary leakage optimization can recover Rs 3,450.&rdquo;</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Mission / Problem Statement */}
      <div className="max-w-5xl mx-auto px-6 mt-28 z-10 relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs uppercase font-black text-blue-400 tracking-wider">The Problem</span>
            <h3 className="text-2xl md:text-3xl font-extrabold text-white mt-2 leading-tight">
              Fragmented Transactions & Lack of Awareness
            </h3>
            <p className="text-slate-400 text-sm md:text-base mt-4 leading-relaxed">
              Middle-class families struggle to trace expenses scatter-spread across statement sheets, UPI transfers, monthly subscriptions, and cash bills. This fragmentation leads to overspending, emergency fund deficits, and unfulfilled life goals.
            </p>
          </div>
          <div>
            <span className="text-xs uppercase font-black text-emerald-400 tracking-wider">The Solution</span>
            <h3 className="text-2xl md:text-3xl font-extrabold text-white mt-2 leading-tight">
              AI-driven Real-Time Financial Intelligence
            </h3>
            <p className="text-slate-400 text-sm md:text-base mt-4 leading-relaxed">
              FinSight AI reconstructs messy ledgers. Upload statement docs locally, and our frontend processor parses categories, alerts anomalies, calculates EMI stress index, projects salary survival days, and coaches your budgeting — completely serverless.
            </p>
          </div>
        </div>
      </div>

      {/* Grid Features */}
      <div className="max-w-6xl mx-auto px-6 mt-32 z-10 relative">
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs uppercase font-black text-purple-400 tracking-wider">Comprehensive Features</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">Built-in Financial Modules</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <GlassCard className="p-6 space-y-4">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl w-fit">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">Intelligent Statement Analyzer</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Upload PDF, CSV, Excel, or screenshots. Client-side animations demonstrate OCR scanning, merchant extraction, UPI categorization, and duplicate elimination.
            </p>
          </GlassCard>

          <GlassCard className="p-6 space-y-4">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl w-fit">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">Safety Audit Center</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              12 indicators mapping salary survival probability, lifestyle creep momentum, emergency preparedness, EMI stress index, and GPay dependency metrics.
            </p>
          </GlassCard>

          <GlassCard className="p-6 space-y-4">
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-2xl w-fit">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">Personal AI Advisor</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Conversational chatbot experience with streaming text replies. Generates targeted budget limit charts and financial literacy tips completely locally.
            </p>
          </GlassCard>
        </div>
      </div>

      {/* Social Impact Grid */}
      <div className="max-w-5xl mx-auto px-6 mt-32 z-10 relative bg-slate-900/40 border border-slate-900/60 rounded-3xl p-8 md:p-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs uppercase font-black text-emerald-400 tracking-wider">Social Impact & Literacy</span>
            <h3 className="text-2xl md:text-3xl font-extrabold text-white">Empowering Middle-Class Savings</h3>
            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
              By promoting a proactive budgeting culture, micro-transaction controls, and emergency preparedness awareness, FinSight AI fosters digital inclusion and financial literacy for student, household, and young professional profiles.
            </p>
            <div className="flex gap-4 pt-2">
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-black text-emerald-400">85%+</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Inclusion Growth</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-black text-blue-400">12k+</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Windfall Savings</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <GlassCard className="p-4 flex gap-4 items-start">
              <Users className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <h5 className="text-sm font-bold text-white">Family Finance Mode</h5>
                <p className="text-[11px] text-slate-400 mt-1">Split household limits, compare parent-child expenditures, and manage cooperative savings targets.</p>
              </div>
            </GlassCard>
            
            <GlassCard className="p-4 flex gap-4 items-start">
              <BookOpen className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
              <div>
                <h5 className="text-sm font-bold text-white">Financial Literacy Coach</h5>
                <p className="text-[11px] text-slate-400 mt-1">Interactive modules tuning chatbot conversation modes to Beginner, Intermediate, or Advanced financial jargon.</p>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="max-w-6xl mx-auto px-6 mt-32 border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4 relative z-10">
        <div>
          <span className="font-extrabold text-slate-300">FinSight AI 3.0</span> — Predict. Protect. Prosper.
        </div>
        <div className="flex gap-4">
          <Link href="/dashboard" className="hover:text-slate-300">Dashboard</Link>
          <Link href="/presentation" className="hover:text-slate-300">Presentation Mode</Link>
          <span className="text-slate-700">|</span>
          <span>Developer: Madhan E (B.Tech AI & DS)</span>
        </div>
      </div>
    </div>
  );
}
