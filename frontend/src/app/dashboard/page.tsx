"use client";

import React, { useMemo, useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import GlassCard from '../../components/GlassCard';
import HealthScore from '../../components/HealthScore';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Percent, 
  Sparkles, 
  AlertTriangle,
  Loader2,
  Calendar,
  Layers,
  Users,
  Activity,
  X,
  CheckCircle,
  ShieldCheck
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function Dashboard() {
  const { 
    transactions, 
    overview, 
    healthScore, 
    anomalies, 
    getDiagnosis,
    selectedMonth,
    setSelectedMonth,
    loading, 
    error 
  } = useFinance();

  const [familyMode, setFamilyMode] = useState<boolean>(false);
  const [diagnosing, setDiagnosing] = useState<boolean>(false);
  const [diagnosisReport, setDiagnosisReport] = useState<any>(null);
  const [showDiagnosisModal, setShowDiagnosisModal] = useState<boolean>(false);

  // If Family Mode is active, simulate split sharing
  const activeOverview = useMemo(() => {
    if (familyMode) {
      return {
        total_income: overview.total_income / 2,
        total_expenses: overview.total_expenses / 2,
        total_savings: overview.total_savings / 2,
        savings_rate: overview.savings_rate,
        cash_flow: overview.cash_flow / 2
      };
    }
    return overview;
  }, [overview, familyMode]);

  const handleRunDiagnosis = async () => {
    setDiagnosing(true);
    try {
      const report = await getDiagnosis();
      setDiagnosisReport(report);
      setShowDiagnosisModal(true);
    } catch (err) {
      console.error(err);
      alert("Failed to run AI financial diagnosis");
    } finally {
      setDiagnosing(false);
    }
  };

  // Color mapping for categories in chart (Blue-Cyan-Slate family)
  const COLORS = ['#3b82f6', '#06b6d4', '#0ea5e9', '#60a5fa', '#f59e0b', '#10b981', '#14b8a6', '#6366f1', '#64748b'];

  // Format cash numbers nicely
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Group transactions by month for Cash Flow chart
  const cashFlowData = useMemo(() => {
    const months: Record<string, { month: string; Income: number; Expenses: number }> = {};
    
    // Sort transactions chronologically
    const sortedTxs = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
    
    sortedTxs.forEach(t => {
      if (!t.date) return;
      const dateObj = new Date(t.date);
      const monthStr = dateObj.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      
      if (!months[monthStr]) {
        months[monthStr] = { month: monthStr, Income: 0, Expenses: 0 };
      }
      
      if (t.type === 'credit') {
        months[monthStr].Income += t.amount;
      } else {
        months[monthStr].Expenses += t.amount;
      }
    });

    return Object.values(months);
  }, [transactions]);

  // Group by category for Pie Chart
  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    
    transactions.forEach(t => {
      if (t.type === 'debit') {
        cats[t.category] = (cats[t.category] || 0) + t.amount;
      }
    });

    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Loading your financial profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Overview Dashboard
          </h2>
          <p className="text-slate-300 text-sm mt-1">
            Real-time financial intelligence powered by FinSight AI.
          </p>
        </div>
        
        {/* Toggle Family Mode & Diagnosis Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Family Mode Switcher */}
          <button
            onClick={() => setFamilyMode(!familyMode)}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl border text-xs font-bold transition-all ${
              familyMode 
                ? 'bg-blue-600/15 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.1)]' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{familyMode ? 'Family Mode Active (50/50 Split)' : 'Enable Family Mode'}</span>
          </button>

          {/* One-Click Audit Trigger */}
          <button
            onClick={handleRunDiagnosis}
            disabled={diagnosing}
            className="flex items-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-xs font-bold text-white transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)] disabled:opacity-50"
          >
            {diagnosing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4 animate-pulse" />}
            <span>{diagnosing ? 'Running Audit...' : 'One-Click Diagnosis'}</span>
          </button>
          
          {/* Month calendar filter */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300">
            <Calendar className="w-4 h-4 text-blue-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent border-none text-slate-300 focus:outline-none cursor-pointer pr-1"
            >
              <option value="All" className="bg-slate-950 text-slate-300">All Periods</option>
              <option value="2026-06" className="bg-slate-950 text-slate-300">June 2026</option>
              <option value="2026-05" className="bg-slate-950 text-slate-300">May 2026</option>
              <option value="2026-04" className="bg-slate-950 text-slate-300">April 2026</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-center gap-3 text-rose-400 text-xs">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Income Card */}
        <GlassCard hoverGlow className="relative overflow-hidden glass-panel-hover">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Income</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-lg font-black text-white">{formatCurrency(activeOverview.total_income)}</h3>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5 mt-1">
              Active cash inflow {familyMode && "(Split)"}
            </span>
          </div>
        </GlassCard>

        {/* Expenses Card */}
        <GlassCard hoverGlow className="glass-panel-hover">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Expenses</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-lg font-black text-white">{formatCurrency(activeOverview.total_expenses)}</h3>
            <span className="text-[10px] text-rose-400 font-bold flex items-center gap-0.5 mt-1">
              Active cash outflow {familyMode && "(Split)"}
            </span>
          </div>
        </GlassCard>

        {/* Savings Card */}
        <GlassCard hoverGlow className="glass-panel-hover">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Net Savings</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-lg font-black text-white">{formatCurrency(activeOverview.total_savings)}</h3>
            <span className="text-[10px] text-blue-400 font-bold flex items-center gap-0.5 mt-1">
              {activeOverview.total_savings >= 0 ? "Surplus capital" : "Deficit budget warning"} {familyMode && "(Split)"}
            </span>
          </div>
        </GlassCard>

        {/* Savings Rate Card */}
        <GlassCard hoverGlow className="glass-panel-hover">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Savings Rate</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-lg font-black text-white">{activeOverview.savings_rate}%</h3>
            <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-0.5 mt-1">
              Inflow retained ratio
            </span>
          </div>
        </GlassCard>

        {/* Cash Flow Status */}
        <GlassCard hoverGlow className="glass-panel-hover">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cash Flow</span>
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-lg font-black text-white">
              {activeOverview.cash_flow >= 0 ? "+" : ""}{formatCurrency(activeOverview.cash_flow)}
            </h3>
            <span className={`text-[10px] font-bold mt-1 block ${activeOverview.cash_flow >= 0 ? "text-sky-400" : "text-rose-400"}`}>
              {activeOverview.cash_flow >= 0 ? "Positive buffer" : "Deficit buffer"} {familyMode && "(Split)"}
            </span>
          </div>
        </GlassCard>
      </div>

      {/* Health Score Widget */}
      <GlassCard glow className="p-8 border-blue-500/10">
        <HealthScore 
          score={healthScore.score} 
          status={healthScore.status}
          breakdown={healthScore.breakdown}
          recommendation={healthScore.recommendation}
        />
      </GlassCard>

      {/* Charts and Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow area chart */}
        <GlassCard className="lg:col-span-2 flex flex-col justify-between min-h-[350px]">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
              Cash Flow Trend
            </h3>
            <p className="text-[11px] text-slate-500">Income vs. Expense over statement cycles.</p>
          </div>
          <div className="h-64 mt-4 w-full">
            {cashFlowData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlowData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '10px' }}
                    labelStyle={{ color: '#fff', fontSize: '12px' }}
                    itemStyle={{ fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="Expenses" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                No monthly trends. Upload statements to populate.
              </div>
            )}
          </div>
        </GlassCard>

        {/* Category breakdown pie chart */}
        <GlassCard className="flex flex-col justify-between min-h-[350px]">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
              Category Allocation
            </h3>
            <p className="text-[11px] text-slate-500">Distribution of monthly debits.</p>
          </div>
          <div className="h-44 relative flex items-center justify-center">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '10px' }}
                    itemStyle={{ fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-500 text-xs">No debit distribution data.</div>
            )}
          </div>
          
          {/* Chart Legends */}
          <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] overflow-y-auto max-h-24">
            {categoryData.slice(0, 6).map((cat, idx) => (
              <div key={cat.name} className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="truncate">{cat.name} ({formatCurrency(cat.value)})</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* AI Alerts / Anomalies list */}
      <GlassCard>
        <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" /> AI Warnings & Alerts
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Discovered transaction spikes, duplicates, and recurring billing.</p>
          </div>
          <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase rounded-full">
            {anomalies.length} Active Warnings
          </span>
        </div>

        {anomalies.length > 0 ? (
          <div className="space-y-2.5">
            {anomalies.map((anom, idx) => (
              <div 
                key={idx} 
                className="flex items-start justify-between bg-slate-950/30 border border-slate-900/60 rounded-xl p-3.5 hover:border-slate-800/85 transition-all glass-panel-hover"
              >
                <div className="flex gap-3">
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                    ${anom.type === 'duplicate' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'}
                  `}>
                    <AlertTriangle className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">{anom.merchant}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{anom.reason}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 pl-3">
                  <span className="text-xs font-black text-rose-400">-{formatCurrency(anom.amount)}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{anom.date}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500 text-xs italic">
            All clear! No unusual spending spikes or double-swipe duplicates detected.
          </div>
        )}
      </GlassCard>

      {/* One-Click Financial Diagnosis Modal Overlay */}
      {showDiagnosisModal && diagnosisReport && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <GlassCard glow className="w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 relative animate-fade-in border-blue-500/25">
            <button 
              onClick={() => setShowDiagnosisModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors p-1.5 bg-slate-900 border border-slate-800 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-900 pb-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">AI Financial Diagnosis Report</h3>
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Health audit checkup</span>
              </div>
            </div>

            <div className="space-y-6">
              {/* Executive Summary */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Executive Audit</h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    diagnosisReport.overall_status === 'Healthy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    diagnosisReport.overall_status === 'Action Required' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    Status: {diagnosisReport.overall_status}
                  </span>
                </div>
                <p className="text-xs text-slate-300 bg-slate-950/40 p-4 rounded-xl border border-slate-900/60 leading-relaxed italic">
                  "{diagnosisReport.executive_summary}"
                </p>
              </div>

              {/* Critical Issues */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase text-rose-400 tracking-widest flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Core Friction Points
                </h4>
                <div className="space-y-2">
                  {diagnosisReport.critical_issues.map((issue: string, idx: number) => (
                    <div key={idx} className="text-xs text-slate-300 flex items-start gap-2.5 bg-slate-950/20 border border-slate-900/40 p-3 rounded-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0"></span>
                      <p>{issue}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Wins */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-widest flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> High-impact Checklist
                </h4>
                <div className="space-y-2">
                  {diagnosisReport.quick_wins.map((win: string, idx: number) => (
                    <div key={idx} className="text-xs text-slate-300 flex items-start gap-2.5 bg-slate-950/20 border border-slate-900/40 p-3 rounded-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
                      <p>{win}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Closing */}
              <div className="pt-4 border-t border-slate-900/60 text-right">
                <button
                  onClick={() => setShowDiagnosisModal(false)}
                  className="py-2 px-5 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 rounded-lg border border-slate-800 transition-all"
                >
                  Close Audit Report
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
