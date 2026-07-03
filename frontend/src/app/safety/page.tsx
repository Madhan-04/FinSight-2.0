"use client";

import React, { useMemo, useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import GlassCard from '../../components/GlassCard';
import { 
  ShieldAlert, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Percent, 
  Activity, 
  Loader2, 
  Calendar,
  AlertTriangle,
  Zap,
  Info,
  CheckCircle,
  HelpCircle,
  Flame,
  ArrowRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from 'recharts';

export default function SafetyAudit() {
  const { 
    transactions,
    selectedMonth, 
    setSelectedMonth,
    safetyIndex,
    moneyLeaks,
    salarySurvival,
    emergencyFund,
    lifestyleCreep,
    emiStress,
    upiStats,
    loading,
    error,
    fetchFinanceData
  } = useFinance();

  const [refreshing, setRefreshing] = useState(false);

  // Format currency nicely
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchFinanceData();
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  // Lifestyle creep Recharts data format
  const creepChartData = useMemo(() => {
    if (!lifestyleCreep) return [];
    return [
      { name: 'Income MoM', value: lifestyleCreep.income_growth, color: '#6366f1' },
      { name: 'Expense MoM', value: lifestyleCreep.expense_growth, color: '#ef4444' },
      { name: 'Savings MoM', value: lifestyleCreep.savings_growth, color: '#10b981' }
    ];
  }, [lifestyleCreep]);

  // Master Safety SVG Circular Progress values
  const strokeDashoffset = useMemo(() => {
    const score = safetyIndex?.score || 0;
    const circumference = 2 * Math.PI * 45; // radius = 45
    return circumference - (score / 100) * circumference;
  }, [safetyIndex]);

  const safetyColor = useMemo(() => {
    const score = safetyIndex?.score || 0;
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-indigo-405';
    if (score >= 40) return 'text-amber-400';
    return 'text-rose-450';
  }, [safetyIndex]);

  const safetyBorderColor = useMemo(() => {
    const score = safetyIndex?.score || 0;
    if (score >= 80) return 'border-emerald-500/25';
    if (score >= 60) return 'border-indigo-500/25';
    if (score >= 40) return 'border-amber-500/25';
    return 'border-rose-500/25';
  }, [safetyIndex]);

  if (loading && !refreshing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-xs font-semibold text-slate-400">Running advanced financial audit diagnostics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header section */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 border-b border-white/[0.04] pb-6">
        <div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-200 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-indigo-400 animate-pulse" /> Financial Safety Audit
          </h2>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Proactive safety index and wealth vulnerability monitoring system.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 py-2 px-4 rounded-xl bg-slate-900/50 border border-white/[0.05] text-[11px] font-black uppercase tracking-wider text-slate-300 hover:text-slate-100 transition-all duration-200 hover:bg-slate-850 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-indigo-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Recalculating...' : 'Sync Indicators'}</span>
          </button>

          {/* Month selector */}
          <div className="flex items-center gap-2 bg-slate-900/50 border border-white/[0.05] px-3.5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider text-slate-350">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent border-none text-slate-355 focus:outline-none cursor-pointer pr-1"
            >
              <option value="All" className="bg-slate-950 text-slate-355">All Statements</option>
              <option value="2026-06" className="bg-slate-950 text-slate-355">June 2026</option>
              <option value="2026-05" className="bg-slate-950 text-slate-355">May 2026</option>
              <option value="2026-04" className="bg-slate-950 text-slate-355">April 2026</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-center gap-3 text-rose-450 text-xs">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Top Section: Master Score & Overview Summary */}
      <GlassCard glow hoverGlow={false} className={`p-6 md:p-8 border ${safetyBorderColor}`}>
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Radial Score Gauge */}
          <div className="relative w-40 h-40 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="60"
                className="stroke-slate-950 opacity-60"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r="60"
                stroke="url(#safetyGradient)"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 60}
                strokeDashoffset={2 * Math.PI * 60 - ((safetyIndex?.score || 70) / 100) * 2 * Math.PI * 60}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="safetyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-black text-white tracking-tight tabular-nums">{safetyIndex?.score || 70}</span>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Safety Index</span>
            </div>
          </div>

          {/* Audit Details */}
          <div className="flex-1 space-y-4 text-center lg:text-left">
            <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 justify-center lg:justify-start">
              <span className={`text-xl font-black tracking-tight ${safetyColor}`}>
                {safetyIndex?.status || 'Calculating...'}
              </span>
              <span className="inline-flex self-center px-3 py-0.5 bg-slate-900 border border-white/[0.04] text-[9px] font-black uppercase rounded-full tracking-wider text-slate-400">
                Resilience Classification
              </span>
            </div>
            <p className="text-slate-350 text-xs md:text-sm leading-relaxed max-w-2xl font-medium">
              {safetyIndex?.summary || 'Wait while AI compiles your diagnostics report.'}
            </p>
            <div className="pt-2 flex flex-wrap gap-4 items-center justify-center lg:justify-start text-[9px] font-black uppercase tracking-wider text-slate-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span>90-100 Secure</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                <span>60-89 Stable</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span>40-59 Vulnerable</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                <span>0-39 Critical</span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Grid of Safety Audits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Money Leak Detector */}
        <GlassCard hoverGlow={false} className="p-6 flex flex-col justify-between min-h-[380px]">
          <div className="space-y-4">
            <div className="flex justify-between items-start border-b border-white/[0.04] pb-4">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-widest">Money Leakage Detector</h3>
                <p className="text-[10px] text-slate-500 mt-1">Analysis of repeating micro-spending and repeating debits.</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-rose-455 block tabular-nums">
                  -{formatCurrency(moneyLeaks?.monthly_leakage)}/mo
                </span>
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Identified Leaks</span>
              </div>
            </div>

            {/* Leak items */}
            {moneyLeaks?.leaks?.length > 0 ? (
              <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                {moneyLeaks.leaks.slice(0, 3).map((l: any, idx: number) => (
                  <div key={idx} className="bg-slate-950/40 border border-white/[0.03] rounded-xl p-3 flex justify-between items-center text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-200">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        <span>{l.type}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">{l.alert_text}</p>
                    </div>
                    <span className="text-[11px] font-extrabold text-rose-450 pl-3 shrink-0 tabular-nums">-{formatCurrency(l.amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-[11px] italic">
                No active leaks detected. Your repeating transactions look clean!
              </div>
            )}
          </div>

          <div className="border-t border-white/[0.04] mt-6 pt-4 flex justify-between items-center bg-indigo-950/10 -mx-6 -mb-6 p-6 rounded-b-2xl border-l-2 border-l-indigo-500">
            <div className="text-left">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Savings Potential Recoverable</span>
              <span className="text-xs font-black text-emerald-400 mt-1 block tabular-nums">
                {formatCurrency(moneyLeaks?.recovered_savings)} / Month
              </span>
            </div>
            <span className="text-[9px] font-black uppercase text-indigo-400 flex items-center gap-1">
              AI Auditor Active <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
            </span>
          </div>
        </GlassCard>

        {/* 2. Salary Survival Predictor */}
        <GlassCard hoverGlow={false} className="p-6 flex flex-col justify-between min-h-[380px]">
          <div className="space-y-4">
            <div className="flex justify-between items-start border-b border-white/[0.04] pb-4">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-widest">Salary Survival Predictor</h3>
                <p className="text-[10px] text-slate-500 mt-1">Sustainability projections based on active cash buffer & burn rate.</p>
              </div>
              <div className="text-right">
                <span className={`text-sm font-black block tabular-nums ${
                  salarySurvival?.risk_level === 'Low' ? 'text-emerald-400' :
                  salarySurvival?.risk_level === 'Medium' ? 'text-amber-400' : 'text-rose-450'
                }`}>
                  {salarySurvival?.survival_probability}%
                </span>
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Survival Prob</span>
              </div>
            </div>

            {/* Survival stats grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950/30 border border-white/[0.03] p-3 rounded-xl">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Current Balance</span>
                <span className="font-extrabold text-slate-200 mt-1 block tabular-nums">{formatCurrency(salarySurvival?.current_balance)}</span>
              </div>
              <div className="bg-slate-950/30 border border-white/[0.03] p-3 rounded-xl">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Daily Average Spend</span>
                <span className="font-extrabold text-slate-200 mt-1 block tabular-nums">{formatCurrency(salarySurvival?.average_daily_spending)}/day</span>
              </div>
              <div className="bg-slate-950/30 border border-white/[0.03] p-3 rounded-xl">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Remaining Days</span>
                <span className="font-extrabold text-slate-200 mt-1 block tabular-nums">{salarySurvival?.remaining_days} Days Left</span>
              </div>
              <div className="bg-slate-950/30 border border-white/[0.03] p-3 rounded-xl">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Predicted Month-End</span>
                <span className={`font-extrabold mt-1 block tabular-nums ${salarySurvival?.predicted_month_end_balance >= 0 ? 'text-emerald-400' : 'text-rose-450'}`}>
                  {formatCurrency(salarySurvival?.predicted_month_end_balance)}
                </span>
              </div>
            </div>

            {/* Suggestions list */}
            {salarySurvival?.suggestions?.length > 0 && (
              <div className="space-y-1.5 pt-1.5">
                <span className="text-[9px] uppercase font-black text-indigo-400 tracking-widest block">AI Survival Guidelines</span>
                {salarySurvival.suggestions.slice(0, 2).map((s: string, idx: number) => (
                  <div key={idx} className="flex gap-2 items-start text-[11px] text-slate-350">
                    <span className="w-1 h-1 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                    <p>{s}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-white/[0.04] mt-6 pt-4 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">Risk Tier:</span>
            <span className={`px-2.5 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wider border ${
              salarySurvival?.risk_level === 'Low' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
              salarySurvival?.risk_level === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
              'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              {salarySurvival?.risk_level} Risk
            </span>
          </div>
        </GlassCard>

        {/* 3. Emergency Fund Risk Scanner */}
        <GlassCard hoverGlow={false} className="p-6 flex flex-col justify-between min-h-[380px]">
          <div className="space-y-4">
            <div className="flex justify-between items-start border-b border-white/[0.04] pb-4">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-widest">Emergency Fund Scanner</h3>
                <p className="text-[10px] text-slate-500 mt-1">Scans savings milestones against essential survival overhead thresholds.</p>
              </div>
              <div className="text-right">
                <span className={`text-sm font-black block tabular-nums ${
                  emergencyFund?.risk_level === 'Low' ? 'text-emerald-400' :
                  emergencyFund?.risk_level === 'Medium' ? 'text-amber-400' : 'text-rose-455'
                }`}>
                  {emergencyFund?.preparedness_ratio}%
                </span>
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Preparedness</span>
              </div>
            </div>

            {/* Progress gauge bar */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <span>Funded: {formatCurrency(emergencyFund?.current_emergency_savings)}</span>
                <span>Target Buffer: {formatCurrency(emergencyFund?.recommended_emergency_fund)}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/[0.03]">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    emergencyFund?.preparedness_ratio >= 80 ? 'bg-emerald-500' :
                    emergencyFund?.preparedness_ratio >= 40 ? 'bg-indigo-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, emergencyFund?.preparedness_ratio || 0)}%` }}
                ></div>
              </div>
            </div>

            {/* Calculations metrics */}
            <div className="flex justify-between bg-slate-950/20 border border-white/[0.03] p-3 rounded-xl text-xs">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Monthly Essentials</span>
                <span className="font-extrabold text-slate-200 mt-1 block tabular-nums">{formatCurrency(emergencyFund?.monthly_essential_expenses)}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Resilience Score</span>
                <span className="font-extrabold text-indigo-400 mt-1 block tabular-nums">{emergencyFund?.resilience_score}/100</span>
              </div>
            </div>

            {/* AI action plan */}
            {emergencyFund?.improvement_plans?.length > 0 && (
              <div className="space-y-1.5 pt-1.5">
                <span className="text-[9px] uppercase font-black text-indigo-400 tracking-widest block">Emergency Fund Roadmap</span>
                {emergencyFund.improvement_plans.slice(0, 2).map((p: string, idx: number) => (
                  <div key={idx} className="flex gap-2 items-start text-[11px] text-slate-350">
                    <span className="w-1 h-1 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                    <p>{p}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-white/[0.04] mt-6 pt-4 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">Readiness Level:</span>
            <span className={`px-2.5 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wider border ${
              emergencyFund?.risk_level === 'Low' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
              emergencyFund?.risk_level === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
              'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              {emergencyFund?.risk_level} Risk
            </span>
          </div>
        </GlassCard>

        {/* 4. Lifestyle Creep Detector */}
        <GlassCard hoverGlow={false} className="p-6 flex flex-col justify-between min-h-[380px]">
          <div className="space-y-4">
            <div className="flex justify-between items-start border-b border-white/[0.04] pb-4">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-widest">Lifestyle Creep Monitor</h3>
                <p className="text-[10px] text-slate-500 mt-1">Compares income, expense, and savings trends over recent statements.</p>
              </div>
              <div className="text-right">
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                  lifestyleCreep?.creep_detected 
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {lifestyleCreep?.creep_detected ? 'Creep Alert' : 'Stable Growth'}
                </span>
              </div>
            </div>

            {/* Growth Rates Bar Chart */}
            <div className="h-28 w-full mt-2">
              {creepChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={creepChartData} layout="vertical" margin={{ left: -10, right: 10 }}>
                    <XAxis type="number" stroke="#475569" fontSize={8} />
                    <YAxis dataKey="name" type="category" stroke="#475569" fontSize={9} width={80} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#090d16', borderColor: 'rgba(255,255,255,0.06)', borderRadius: '10px' }}
                      itemStyle={{ fontSize: '10px' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {creepChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 text-xs italic">
                  Not enough historical statement data to trace growth indexes.
                </div>
              )}
            </div>

            {/* AI recommendations */}
            {lifestyleCreep?.recommendations?.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[9px] uppercase font-black text-indigo-400 tracking-widest block">Creep Corrective Guidance</span>
                {lifestyleCreep.recommendations.slice(0, 1).map((r: string, idx: number) => (
                  <div key={idx} className="flex gap-2 items-start text-[11px] text-slate-350">
                    <span className="w-1 h-1 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                    <p>{r}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-white/[0.04] mt-6 pt-4 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">Creep Risk level:</span>
            <span className={`px-2.5 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wider border ${
              lifestyleCreep?.risk_level === 'Low' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
              lifestyleCreep?.risk_level === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
              'bg-rose-500/10 text-rose-450 border-rose-500/20'
            }`}>
              {lifestyleCreep?.risk_level} Risk
            </span>
          </div>
        </GlassCard>

        {/* 5. EMI Stress Analyzer */}
        <GlassCard hoverGlow={false} className="p-6 flex flex-col justify-between min-h-[380px]">
          <div className="space-y-4">
            <div className="flex justify-between items-start border-b border-white/[0.04] pb-4">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-widest">EMI Stress Analyzer</h3>
                <p className="text-[10px] text-slate-500 mt-1">Audits debt commitments and loan liabilities against credits.</p>
              </div>
              <div className="text-right">
                <span className={`text-sm font-black block tabular-nums ${
                  emiStress?.stress_level === 'Low' ? 'text-emerald-400' :
                  emiStress?.stress_level === 'Medium' ? 'text-amber-400' : 'text-rose-455'
                }`}>
                  {emiStress?.debt_burden}%
                </span>
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Debt Burden (DTI)</span>
              </div>
            </div>

            {/* DTI Info */}
            <div className="flex justify-between items-center bg-slate-950/20 border border-white/[0.03] p-3 rounded-xl text-xs">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Total Monthly EMIs</span>
                <span className="font-extrabold text-slate-200 mt-1 block tabular-nums">{formatCurrency(emiStress?.total_emi_payments)}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">EMI Stress Score</span>
                <span className="font-extrabold text-rose-450 mt-1 block tabular-nums">{emiStress?.stress_score}/100</span>
              </div>
            </div>

            {/* Recommendations */}
            {emiStress?.suggestions?.length > 0 && (
              <div className="space-y-1.5 pt-1.5">
                <span className="text-[9px] uppercase font-black text-indigo-400 tracking-widest block">Debt Reduction Strategy</span>
                {emiStress.suggestions.slice(0, 2).map((s: string, idx: number) => (
                  <div key={idx} className="flex gap-2 items-start text-[11px] text-slate-350">
                    <span className="w-1 h-1 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                    <p>{s}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-white/[0.04] mt-6 pt-4 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">Burden Assessment:</span>
            <span className={`px-2.5 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wider border ${
              emiStress?.stress_level === 'Low' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
              emiStress?.stress_level === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
              'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              {emiStress?.stress_level} Stress
            </span>
          </div>
        </GlassCard>

        {/* 6. UPI Dependency Analyzer */}
        <GlassCard hoverGlow={false} className="p-6 flex flex-col justify-between min-h-[380px]">
          <div className="space-y-4">
            <div className="flex justify-between items-start border-b border-white/[0.04] pb-4">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-widest">UPI Spending Analyzer</h3>
                <p className="text-[10px] text-slate-500 mt-1">Audits frequent micro-payments and small-value impulse purchases.</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-indigo-400 block tabular-nums">
                  {upiStats?.upi_dependency_score}%
                </span>
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">UPI Dependency</span>
              </div>
            </div>

            {/* UPI Stats grid */}
            <div className="grid grid-cols-3 gap-2.5 text-xs">
              <div className="bg-slate-950/30 border border-white/[0.03] p-2.5 rounded-xl">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Transactions</span>
                <span className="font-extrabold text-slate-200 mt-1 block tabular-nums">{upiStats?.upi_transaction_count} count</span>
              </div>
              <div className="bg-slate-950/30 border border-white/[0.03] p-2.5 rounded-xl">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Daily Average</span>
                <span className="font-extrabold text-slate-200 mt-1 block tabular-nums">{upiStats?.average_daily_transactions} txs/day</span>
              </div>
              <div className="bg-slate-950/30 border border-white/[0.03] p-2.5 rounded-xl">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Impulse Spent</span>
                <span className="font-extrabold text-rose-455 mt-1 block tabular-nums">{formatCurrency(upiStats?.impulse_spend_amount)}</span>
              </div>
            </div>

            {/* UPI alerts */}
            {upiStats?.suggestions?.length > 0 && (
              <div className="space-y-1.5 pt-1.5">
                <span className="text-[9px] uppercase font-black text-indigo-400 tracking-widest block">UPI Habit Coaching</span>
                {upiStats.suggestions.slice(0, 2).map((s: string, idx: number) => (
                  <div key={idx} className="flex gap-2 items-start text-[11px] text-slate-350">
                    <span className="w-1 h-1 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                    <p>{s}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-white/[0.04] mt-6 pt-4 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">Impulse Spending Risk:</span>
            <span className={`px-2.5 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wider border ${
              upiStats?.impulse_risk === 'Low' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
              upiStats?.impulse_risk === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
              'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              {upiStats?.impulse_risk} Risk
            </span>
          </div>
        </GlassCard>

      </div>
    </div>
  );
}
