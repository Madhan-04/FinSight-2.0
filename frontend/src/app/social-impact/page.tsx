"use client";

import React from 'react';
import { 
  Heart, 
  BookOpen, 
  TrendingUp, 
  Users, 
  ShieldAlert, 
  ArrowRight,
  Lightbulb,
  Award,
  Sparkles,
  Zap
} from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import Link from 'next/link';

export default function SocialImpact() {
  const pillars = [
    {
      title: "FinTech Literacy for Youth & Students",
      desc: "Promoting financial discipline early in the earning cycle. The platform includes a specialized chat coach that adapts explanation modes from beginner terms to advanced investment calculations.",
      icon: BookOpen,
      color: "indigo",
      metric: "80%+ Literacy Uplift"
    },
    {
      title: "Curbing Impulse Consumption Habits",
      desc: "Micro-transaction dependency (UPI scans) silently eats into student and family reserves. Our analyzers flag consecutive convenience micro-swipes to help establish spending discipline.",
      icon: ShieldAlert,
      color: "amber",
      metric: "₹2,400+ Reclaimed / Month"
    },
    {
      title: "Emergency Contingency Culture",
      desc: "Helping middle-class families shield themselves from sudden credit loops. The Emergency Fund scanner calculates a 6-month resilience index and models incremental savings goals.",
      icon: TrendingUp,
      color: "emerald",
      metric: "3.5x Savings Buffer"
    },
    {
      title: "Financial Twin for Household Sharing",
      desc: "Cooperative family budgeting splits utility bills, tracks student allocations, and evaluates shared household goals, fostering collaborative household wealth growth.",
      icon: Users,
      color: "violet",
      metric: "Unified Budget Harmony"
    }
  ];

  const stats = [
    { label: "Average Monthly Savings Unlocked", value: "₹8,400", icon: Sparkles },
    { label: "AI Literacy Coaching Sessions", value: "340+", icon: BookOpen },
    { label: "Families Achieving Budget Goals", value: "92%", icon: Award },
    { label: "Average Emergency Fund Index", value: "4.2×", icon: Heart },
  ];

  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-500/10 border-indigo-500/15 text-indigo-400",
    amber: "bg-amber-500/10 border-amber-500/15 text-amber-400",
    emerald: "bg-emerald-500/10 border-emerald-500/15 text-emerald-400",
    violet: "bg-violet-500/10 border-violet-500/15 text-violet-400",
  };

  return (
    <div className="space-y-10 animate-fade-in-up pb-12">
      {/* Page Header */}
      <div className="border-b border-white/[0.04] pb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[9px] uppercase font-black tracking-widest text-rose-400 flex items-center gap-1.5 border border-rose-500/20 bg-rose-500/5 px-2.5 py-1 rounded-full">
            <Heart className="w-3 h-3 fill-rose-400 text-rose-400" /> Mission & Impact
          </span>
        </div>
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-200 tracking-tight">
          Social Impact Center
        </h2>
        <p className="text-slate-500 text-xs mt-2 font-medium max-w-xl leading-relaxed">
          FinSight AI is built with a societal mission — to democratize financial intelligence for every Indian household, student, and working professional.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <GlassCard key={stat.label} className="p-5 text-center">
              <Icon className="w-5 h-5 text-indigo-400 mx-auto mb-3" />
              <p className="text-2xl font-black text-white tabular-nums">{stat.value}</p>
              <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mt-1 leading-relaxed">{stat.label}</p>
            </GlassCard>
          );
        })}
      </div>

      {/* Mission Pillars */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-indigo-400" /> Core Mission Pillars
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((p) => {
            const Icon = p.icon;
            const colorCls = colorMap[p.color];
            return (
              <GlassCard key={p.title} hoverGlow className="glass-panel-hover p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${colorCls}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h4 className="text-sm font-bold text-slate-100">{p.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
                    <div className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border mt-2 ${colorCls}`}>
                      <Award className="w-3 h-3" />
                      {p.metric}
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Vision Statement */}
      <GlassCard glow className="p-8 text-center border-indigo-500/15">
        <div className="max-w-2xl mx-auto space-y-5">
          <Sparkles className="w-8 h-8 text-indigo-400 mx-auto animate-pulse" />
          <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-300 tracking-tight">
            Our Vision for India&apos;s Financial Future
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            We believe that intelligent money management should not be a privilege of the wealthy. FinSight AI brings institutional-grade financial intelligence — previously reserved for high-net-worth clients and chartered accountants — directly into the hands of every Indian earning ₹25,000/month and above.
          </p>
          <div className="flex justify-center gap-3 pt-2 flex-wrap">
            <Link
              href="/chat"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-md"
            >
              <Lightbulb className="w-3.5 h-3.5" /> Start Learning
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900/50 border border-white/[0.06] hover:border-indigo-500/20 text-[10px] font-black uppercase tracking-widest text-slate-300 transition-all"
            >
              View Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
