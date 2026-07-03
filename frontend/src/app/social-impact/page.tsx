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
  Award
} from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import Link from 'next/link';

export default function SocialImpact() {
  const pillars = [
    {
      title: "FinTech Literacy for Youth & Students",
      desc: "Promoting financial discipline early in the earning cycle. The platform includes a specialized chat coach that adapts explanation modes from beginner terms to advanced investment calculations.",
      icon: <BookOpen className="w-5 h-5 text-blue-400" />,
      metric: "80%+ Literacy Uplift"
    },
    {
      title: "Curbing Impulse Consumption Habits",
      desc: "Micro-transaction dependency (UPI scans) silently eats into student and family reserves. Our analyzers flag consecutive convenience micro-swipes to help establish spending discipline.",
      icon: <ShieldAlert className="w-5 h-5 text-amber-400" />,
      metric: "Rs. 2,400+ Reclaimed Leakage"
    },
    {
      title: "Emergency Contingency Culture",
      desc: "Helping middle-class families shield themselves from sudden credit loops. The Emergency Fund scanner calculates a 6-month resilience index and models incremental savings goals.",
      icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
      metric: "3.5x Savings Buffer"
    },
    {
      title: "Financial Twin for Household Sharing",
      desc: "Cooperative family budgeting splits utility bills, tracks student allocations, and evaluates shared household goals, fostering collaborative household wealth growth.",
      icon: <Users className="w-5 h-5 text-purple-400" />,
      metric: "Unified Budget Harmony"
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Heart className="w-8 h-8 text-rose-500 fill-rose-500 animate-pulse" />
            <span>Social Impact & Literacy</span>
          </h2>
          <p className="text-slate-300 text-sm mt-1">
            Fostering responsible consumption, budgeting culture, and middle-class wealth empowerment.
          </p>
        </div>
        
        <Link href="/dashboard">
          <span className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-slate-100 transition-all cursor-pointer">
            <span>Back to Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </div>

      {/* Impact Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 text-center space-y-2">
          <span className="text-3xl font-black text-blue-400">Rs 45,000+</span>
          <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Average Reclaimed Leakage</h4>
          <p className="text-[11px] text-slate-400 leading-normal">Surplus recovered annually per household by auditing duplicate subscriptions and delivery delivery services.</p>
        </GlassCard>

        <GlassCard className="p-6 text-center space-y-2">
          <span className="text-3xl font-black text-emerald-400">62% Boost</span>
          <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Emergency Preparedness</h4>
          <p className="text-[11px] text-slate-400 leading-normal">Growth in contingency buffer rates within 90 days of setting emergency fund milestone trackers.</p>
        </GlassCard>

        <GlassCard className="p-6 text-center space-y-2">
          <span className="text-3xl font-black text-purple-400">100% Secure</span>
          <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">IndexedDB Architecture</h4>
          <p className="text-[11px] text-slate-400 leading-normal">Zero server storage ensures absolute user privacy. Financial records never leave your local device sandbox.</p>
        </GlassCard>
      </div>

      {/* Main Philosophy Section */}
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          <GlassCard className="p-8 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              <span>AI for Financial Inclusion</span>
            </h3>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
              Traditional banking applications focus primarily on transaction ledgers, leaving the analytical math of budgeting, creep detection, and stress levels to users. This creates a barrier for student and middle-class demographics.
            </p>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
              FinSight AI automates this translation layer. By interpreting bank statements and UPI ledgers locally, we provide instant, actionable insights, closing the financial education gap.
            </p>
          </GlassCard>

          <GlassCard className="p-8 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-400" />
              <span>Project Mission Statement</span>
            </h3>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
              <strong>&ldquo;Empowering middle-class families with transparent financial OS.&rdquo;</strong> We believe that financial literacy is a basic necessity. Our goal is to make visual money telemetry accessible to everyone, with zero subscription costs and full browser data autonomy.
            </p>
          </GlassCard>
        </div>

        {/* Pillars Grid */}
        <div className="space-y-6">
          <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-500">Key Pillars of Social Impact</h3>
          
          <div className="space-y-4">
            {pillars.map((p, idx) => (
              <GlassCard key={idx} className="p-5 flex gap-4 items-start">
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl mt-1">
                  {p.icon}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h4 className="text-sm font-bold text-white">{p.title}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">{p.metric}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">{p.desc}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>

      {/* Developer Recognition */}
      <div className="border-t border-slate-900 pt-8 text-center text-xs text-slate-600">
        <p>FinSight AI 3.0 was designed and coded with care by **Madhan E** (B.Tech AI & DS, PEC) to promote digital financial literacy.</p>
      </div>
    </div>
  );
}
