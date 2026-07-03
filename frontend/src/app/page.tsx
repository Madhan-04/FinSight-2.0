"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShieldCheck, 
  ArrowRight, 
  TrendingUp, 
  BookOpen, 
  Users, 
  FileSpreadsheet, 
  Play,
  Zap,
  Activity,
  Target,
  MessageSquare,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

export default function LandingPage() {
  const features = [
    {
      icon: FileSpreadsheet,
      color: "indigo",
      title: "Intelligent Statement Analyzer",
      desc: "Upload PDF, CSV, or Excel. Client-side processor extracts merchants, UPI categories, duplicates, and payment methods automatically."
    },
    {
      icon: ShieldCheck,
      color: "cyan",
      title: "Safety Audit Center",
      desc: "12 indicators mapping salary survival, lifestyle creep momentum, emergency preparedness, EMI stress, and UPI dependency."
    },
    {
      icon: Sparkles,
      color: "violet",
      title: "AI Advisor Chat",
      desc: "Conversational chatbot with voice synthesis. Generates budget plans and financial literacy coaching — 100% client-side."
    },
    {
      icon: TrendingUp,
      color: "emerald",
      title: "Expense Forecasting",
      desc: "Next-month projections using trend analysis. Subscription detection and spending density heatmaps across week days."
    },
    {
      icon: Target,
      color: "amber",
      title: "Savings Goals Engine",
      desc: "Set milestones, allocate monthly savings, and track AI-predicted completion probability and monthly deposit requirements."
    },
    {
      icon: Activity,
      color: "rose",
      title: "Real-time Dashboard",
      desc: "Live KPI tiles, cash flow area charts, category allocation, anomaly detection, and AI full financial diagnosis."
    },
  ];

  const stats = [
    { value: "100%", label: "Client-Side", sub: "Zero backend, IndexedDB only" },
    { value: "12×", label: "Safety Metrics", sub: "Comprehensive risk audit" },
    { value: "₹8,400", label: "Avg Monthly Save", sub: "Per tracked household" },
    { value: "6", label: "AI Modules", sub: "End-to-end intelligence" },
  ];

  const colorBg: Record<string, string> = {
    indigo: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
    cyan: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
    violet: "bg-violet-500/10 border-violet-500/20 text-violet-400",
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    rose: "bg-rose-500/10 border-rose-500/20 text-rose-400",
  };

  return (
    <div className="min-h-screen text-slate-100 relative overflow-hidden pb-24" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── Background Glow Orbs ── */}
      <div className="fixed top-[-20%] left-[-15%] w-[70%] h-[70%] bg-indigo-600/8 rounded-full blur-[160px] pointer-events-none" />
      <div className="fixed bottom-[0%] right-[-15%] w-[60%] h-[60%] bg-violet-600/6 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed top-[50%] left-[40%] w-[40%] h-[40%] bg-cyan-600/4 rounded-full blur-[120px] pointer-events-none" />

      {/* ── Navigation Bar ── */}
      <nav className="relative z-20 max-w-7xl mx-auto px-6 pt-6 flex items-center justify-between">
        <div className="flex items-center">
          <Image
            src="/logo.png"
            alt="FinSight AI"
            width={160}
            height={54}
            className="object-contain h-11 w-auto"
            priority
          />
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/presentation"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold text-slate-400 hover:text-slate-200 border border-white/[0.05] hover:border-white/[0.1] bg-slate-900/30 transition-all"
          >
            <Play className="w-3.5 h-3.5 text-indigo-400" /> Demo
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-[11px] font-black uppercase tracking-wider text-white transition-all shadow-[0_4px_16px_-4px_rgba(99,102,241,0.4)]"
          >
            Enter App <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-20 md:pt-28 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold tracking-wide mb-8">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>FinSight AI 4.0 — Now Live</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] text-white mb-6">
          Predict. Protect.{' '}
          <span
            className="text-transparent"
            style={{
              backgroundImage: 'linear-gradient(135deg, #818cf8 0%, #67e8f9 50%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text'
            }}
          >
            Prosper.
          </span>
        </h1>

        <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
          Transform raw bank statements, UPI records, and monthly expenses into real-time visual financial intelligence.
          100% client-side — no server, no database, no privacy risk.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2.5 py-3.5 px-8 rounded-2xl font-black uppercase tracking-wider text-sm text-white transition-all transform hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 8px 30px -6px rgba(99,102,241,0.4)' }}
          >
            Enter Workspace <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/presentation"
            className="inline-flex items-center gap-2.5 py-3.5 px-8 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-white/[0.08] font-bold text-sm text-slate-300 transition-all transform hover:-translate-y-0.5"
          >
            <Play className="w-4 h-4 text-indigo-400" /> Walkthrough Demo
          </Link>
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-slate-500 font-semibold">
          {['100% Client-Side', 'No Database Required', 'IndexedDB Storage', 'Privacy First', 'AI-Powered'].map(item => (
            <span key={item} className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── Mock Browser Window ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 mt-20">
        <div
          className="rounded-2xl overflow-hidden border border-white/[0.06]"
          style={{ boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)' }}
        >
          {/* Browser chrome */}
          <div className="flex items-center justify-between bg-slate-950/90 px-5 py-3.5 border-b border-white/[0.04]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/70" />
              <span className="w-3 h-3 rounded-full bg-amber-500/70" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
            </div>
            <div className="text-[11px] text-slate-500 font-mono bg-slate-900/60 border border-white/[0.04] px-4 py-1 rounded-lg">
              localhost:3000/dashboard
            </div>
            <div className="w-16" />
          </div>

          {/* Mock Dashboard Preview */}
          <div className="bg-[#080A12]/95 p-6 md:p-10">
            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Net Savings', value: '₹18,450', color: 'text-emerald-400' },
                { label: 'Total Expenses', value: '₹41,560', color: 'text-rose-400' },
                { label: 'Health Score', value: '82/100', color: 'text-indigo-400' },
                { label: 'Savings Rate', value: '30.7%', color: 'text-cyan-400' },
              ].map(kpi => (
                <div key={kpi.label} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
                  <p className="text-[9px] uppercase font-black text-slate-500 tracking-widest mb-1">{kpi.label}</p>
                  <p className={`text-lg font-black ${kpi.color} tabular-nums`}>{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* Fake Chart */}
            <div className="bg-white/[0.015] border border-white/[0.04] rounded-xl p-5 mb-4">
              <p className="text-[9px] uppercase font-black text-slate-500 tracking-widest mb-4">Cash Flow — Last 6 Months</p>
              <div className="flex items-end gap-2 h-20">
                {[55, 70, 45, 80, 65, 90].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col gap-1 items-center">
                    <div
                      className="w-full rounded-t-md"
                      style={{
                        height: `${(h / 90) * 80}px`,
                        background: 'linear-gradient(to top, rgba(99,102,241,0.7), rgba(103,232,249,0.5))'
                      }}
                    />
                    <span className="text-[8px] text-slate-600 font-mono">M{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[10px] text-slate-600 font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              AI Recommendation: &ldquo;Discretionary leakage optimization can recover ₹3,450/month&rdquo;
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 mt-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {stats.map(s => (
            <div key={s.label} className="text-center p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-indigo-500/15 transition-all">
              <p className="text-3xl font-black text-white mb-1">{s.value}</p>
              <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">{s.label}</p>
              <p className="text-[10px] text-slate-500 font-medium mt-1">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features Grid ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 mt-28">
        <div className="text-center mb-14">
          <span className="text-[10px] uppercase font-black text-violet-400 tracking-widest block mb-3">Platform Modules</span>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">Everything in One Workspace</h2>
          <p className="text-slate-500 text-sm mt-3 max-w-xl mx-auto leading-relaxed">
            Six integrated intelligence modules designed for Indian households, students, and working professionals.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(f => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="p-6 rounded-2xl border border-white/[0.04] bg-white/[0.02] hover:border-indigo-500/15 hover:bg-white/[0.03] transition-all duration-300 group space-y-4"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${colorBg[f.color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-2">{f.title}</h4>
                  <p className="text-[12px] text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Social Impact Strip ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 mt-28">
        <div className="rounded-3xl border border-white/[0.05] bg-gradient-to-br from-indigo-600/8 to-violet-600/6 p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-[10px] uppercase font-black text-emerald-400 tracking-widest block mb-3">Social Impact</span>
              <h3 className="text-2xl md:text-3xl font-black text-white leading-tight mb-4">
                Empowering India&apos;s Middle-Class
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Promoting proactive budgeting culture, micro-transaction awareness, and emergency fund preparedness for students, households, and young professionals.
              </p>
              <div className="flex gap-8">
                <div>
                  <p className="text-2xl font-black text-emerald-400">85%+</p>
                  <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Literacy Uplift</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-indigo-400">₹12k+</p>
                  <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Windfall Savings</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { icon: Users, color: 'text-indigo-400', title: 'Family Finance Mode', desc: 'Split household limits and manage cooperative savings targets.' },
                { icon: BookOpen, color: 'text-cyan-400', title: 'Financial Literacy Coach', desc: 'Adaptive chatbot from Beginner to Advanced financial concepts.' },
                { icon: MessageSquare, color: 'text-violet-400', title: 'Voice-Enabled AI Advisor', desc: 'Ask finance questions by voice and receive audio-guided responses.' },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                    <Icon className={`w-5 h-5 ${item.color} mt-0.5 flex-shrink-0`} />
                    <div>
                      <p className="text-sm font-bold text-white">{item.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Final CTA ── */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 mt-28 text-center">
        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
          Ready to see your finances clearly?
        </h2>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          Upload your first bank statement and get a full AI financial health report in under 60 seconds.
        </p>
        <Link
          href="/statements"
          className="inline-flex items-center gap-2.5 py-4 px-10 rounded-2xl font-black uppercase tracking-wider text-sm text-white transition-all transform hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-8px_rgba(99,102,241,0.5)]"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 8px 30px -6px rgba(99,102,241,0.35)' }}
        >
          Upload Statement Now <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* ── Footer ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 mt-24 pt-8 border-t border-white/[0.04] flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
        <div className="flex items-center gap-2">
          <span className="font-black text-slate-300">FinSight AI 4.0</span>
          <span>—</span>
          <span>Predict. Protect. Prosper.</span>
        </div>
        <div className="flex gap-5">
          <Link href="/dashboard" className="hover:text-slate-300 transition-colors font-semibold">Dashboard</Link>
          <Link href="/presentation" className="hover:text-slate-300 transition-colors font-semibold">Presentation</Link>
          <Link href="/social-impact" className="hover:text-slate-300 transition-colors font-semibold">Impact</Link>
          <span>Developer: Madhan E (B.Tech AI & DS)</span>
        </div>
      </div>
    </div>
  );
}
