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
  ShieldCheck,
  Download,
  Upload
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
    exportBackupData,
    importBackupData,
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

  const handleExportBackup = async () => {
    try {
      const backupStr = await exportBackupData();
      const blob = new Blob([backupStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `finsight_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to export backup data.');
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const jsonString = evt.target?.result as string;
        await importBackupData(jsonString);
        alert('Backup data successfully restored!');
      } catch (err: any) {
        console.error(err);
        alert(`Failed to restore backup: ${err.message || 'Invalid format'}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Color mapping for categories in chart (Indigo-Violet-Cyan family)
  const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#06b6d4', '#0ea5e9', '#10b981', '#f59e0b', '#64748b'];

  // Format cash numbers nicely
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
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
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-xs font-semibold text-slate-400">Loading your financial profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome Banner */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 border-b border-white/[0.04] pb-6">
        <div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-200 tracking-tight">
            Overview Dashboard
          </h2>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Real-time financial intelligence powered by FinSight AI.
          </p>
        </div>
        
        {/* Toggle Family Mode & Diagnosis Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Family Mode Switcher */}
          <button
            onClick={() => setFamilyMode(!familyMode)}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all duration-200 ${
              familyMode 
                ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-300 shadow-[inset_0_0_15px_rgba(99,102,241,0.03)]' 
                : 'bg-slate-900/50 border-white/[0.05] text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4 text-indigo-400" />
            <span>{familyMode ? 'Family Split Active' : 'Family Mode'}</span>
          </button>

          {/* One-Click Audit Trigger */}
          <button
            onClick={handleRunDiagnosis}
            disabled={diagnosing}
            className="flex items-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-[11px] font-black uppercase tracking-wider text-white transition-all duration-200 shadow-md disabled:opacity-50"
          >
            {diagnosing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4 animate-pulse" />}
            <span>{diagnosing ? 'Analyzing...' : 'AI Diagnosis'}</span>
          </button>

          {/* Export Backup */}
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-2 py-2 px-4 rounded-xl bg-slate-900/50 border border-white/[0.05] text-slate-400 hover:text-slate-200 text-[11px] font-black uppercase tracking-wider transition-all duration-200"
            title="Export full financial profile backup as JSON"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Export</span>
          </button>

          {/* Import Backup */}
          <label className="flex items-center gap-2 py-2 px-4 rounded-xl bg-slate-900/50 border border-white/[0.05] text-slate-400 hover:text-slate-200 text-[11px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer">
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>Restore</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
          
          {/* Month calendar filter */}
          <div className="flex items-center gap-2 bg-slate-900/50 border border-white/[0.05] px-3.5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider text-slate-300">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent border-none text-slate-350 focus:outline-none cursor-pointer pr-1"
            >
              <option value="All" className="bg-slate-950 text-slate-350">All Periods</option>
              <option value="2026-06" className="bg-slate-950 text-slate-350">June 2026</option>
              <option value="2026-05" className="bg-slate-950 text-slate-350">May 2026</option>
              <option value="2026-04" className="bg-slate-950 text-slate-350">April 2026</option>
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

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Income Card */}
        <GlassCard hoverGlow className="glass-panel-hover p-5">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Income</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/10">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-black text-white tracking-tight tabular-nums">{formatCurrency(activeOverview.total_income)}</h3>
            <span className="text-[9px] text-emerald-400 font-extrabold flex items-center gap-0.5 mt-1.5 uppercase tracking-wide">
              Cash Inflow {familyMode && "(Split)"}
            </span>
          </div>
        </GlassCard>

        {/* Expenses Card */}
        <GlassCard hoverGlow className="glass-panel-hover p-5">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Expenses</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/10">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-black text-white tracking-tight tabular-nums">{formatCurrency(activeOverview.total_expenses)}</h3>
            <span className="text-[9px] text-rose-400 font-extrabold flex items-center gap-0.5 mt-1.5 uppercase tracking-wide">
              Cash Outflow {familyMode && "(Split)"}
            </span>
          </div>
        </GlassCard>

        {/* Savings Card */}
        <GlassCard hoverGlow className="glass-panel-hover p-5">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Net Savings</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/10">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-black text-white tracking-tight tabular-nums">{formatCurrency(activeOverview.total_savings)}</h3>
            <span className="text-[9px] text-indigo-400 font-extrabold flex items-center gap-0.5 mt-1.5 uppercase tracking-wide">
              {activeOverview.total_savings >= 0 ? "Surplus capital" : "Deficit buffer"} {familyMode && "(Split)"}
            </span>
          </div>
        </GlassCard>

        {/* Savings Rate Card */}
        <GlassCard hoverGlow className="glass-panel-hover p-5">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Savings Rate</span>
            <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 border border-violet-500/10">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-black text-white tracking-tight tabular-nums">{activeOverview.savings_rate}%</h3>
            <span className="text-[9px] text-violet-400 font-extrabold flex items-center gap-0.5 mt-1.5 uppercase tracking-wide">
              Inflow retained
            </span>
          </div>
        </GlassCard>

        {/* Cash Flow Status */}
        <GlassCard hoverGlow className="glass-panel-hover p-5">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Cash Flow</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/10">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-black text-white tracking-tight tabular-nums">
              {activeOverview.cash_flow >= 0 ? "+" : ""}{formatCurrency(activeOverview.cash_flow)}
            </h3>
            <span className={`text-[9px] font-extrabold mt-1.5 block uppercase tracking-wide ${activeOverview.cash_flow >= 0 ? "text-cyan-400" : "text-rose-450"}`}>
              {activeOverview.cash_flow >= 0 ? "Positive buffer" : "Deficit alert"} {familyMode && "(Split)"}
            </span>
          </div>
        </GlassCard>
      </div>

      {/* Health Score Widget */}
      <GlassCard glow className="p-8 border-indigo-500/10">
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
        <GlassCard hoverGlow={false} className="lg:col-span-2 flex flex-col justify-between min-h-[350px] p-6">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-1">
              Cash Flow Trend
            </h3>
            <p className="text-[10px] text-slate-500">Income vs. Expense over statement cycles.</p>
          </div>
          <div className="h-64 mt-6 w-full">
            {cashFlowData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlowData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#090d16', borderColor: 'rgba(255,255,255,0.06)', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                    itemStyle={{ fontSize: '11px', padding: '2px 0' }}
                  />
                  <Area type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="Expenses" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-xs italic">
                No monthly trends. Upload statements to populate.
              </div>
            )}
          </div>
        </GlassCard>

        {/* Category breakdown pie chart */}
        <GlassCard hoverGlow={false} className="flex flex-col justify-between min-h-[350px] p-6">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-1">
              Category Allocation
            </h3>
            <p className="text-[10px] text-slate-500">Distribution of monthly debits.</p>
          </div>
          <div className="h-44 relative flex items-center justify-center mt-4">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#090d16', borderColor: 'rgba(255,255,255,0.06)', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-500 text-xs italic">No debit distribution data.</div>
            )}
          </div>
          
          {/* Chart Legends */}
          <div className="grid grid-cols-2 gap-2 mt-4 text-[9px] overflow-y-auto max-h-24 font-bold uppercase tracking-wider">
            {categoryData.slice(0, 6).map((cat, idx) => (
              <div key={cat.name} className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="truncate">{cat.name}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* AI Alerts / Anomalies list */}
      <GlassCard hoverGlow={false} className="p-6">
        <div className="flex items-center justify-between border-b border-white/[0.04] pb-4 mb-5">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" /> AI Warnings & Alerts
            </h3>
            <p className="text-[10px] text-slate-500 mt-1">Discovered transaction spikes, duplicates, and recurring billing.</p>
          </div>
          <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase rounded-full">
            {anomalies.length} Warnings
          </span>
        </div>

        {anomalies.length > 0 ? (
          <div className="space-y-2.5">
            {anomalies.map((anom, idx) => (
              <div 
                key={idx} 
                className="flex items-start justify-between bg-slate-900/10 border border-white/[0.03] rounded-xl p-3.5 hover:border-indigo-500/15 transition-all duration-200"
              >
                <div className="flex gap-3">
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border
                    ${anom.type === 'duplicate' ? 'bg-amber-500/10 text-amber-400 border-amber-500/15' : 'bg-rose-500/10 text-rose-450 border-rose-500/15'}
                  `}>
                    <AlertTriangle className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">{anom.merchant}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">{anom.reason}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 pl-3">
                  <span className="text-xs font-extrabold text-rose-450 tabular-nums">-{formatCurrency(anom.amount)}</span>
                  <span className="text-[9px] text-slate-500 font-bold block mt-1 uppercase tracking-wider">{anom.date}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-xs italic">
            All clear! No unusual spending spikes or double-swipe duplicates detected.
          </div>
        )}
      </GlassCard>

      {/* One-Click Financial Diagnosis Modal Overlay */}
      {showDiagnosisModal && diagnosisReport && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <GlassCard glow className="w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 relative border-indigo-500/25">
            <button 
              onClick={() => setShowDiagnosisModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors p-1.5 bg-slate-900 border border-white/[0.06] rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-white/[0.04] pb-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">AI Financial Diagnosis Report</h3>
                <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider">Health audit checkup</span>
              </div>
            </div>

            <div className="space-y-6">
              {/* Executive Summary */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <h4 className="text-[9px] font-black uppercase text-indigo-400 tracking-widest">Executive Audit</h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                    diagnosisReport.overall_status === 'Healthy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    diagnosisReport.overall_status === 'Action Required' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    Status: {diagnosisReport.overall_status}
                  </span>
                </div>
                <p className="text-xs text-slate-300 bg-slate-950/40 p-4 rounded-xl border border-white/[0.03] leading-relaxed italic">
                  &ldquo;{diagnosisReport.executive_summary}&rdquo;
                </p>
              </div>

              {/* Critical Issues */}
              <div className="space-y-2.5">
                <h4 className="text-[9px] font-black uppercase text-rose-400 tracking-widest flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Core Friction Points
                </h4>
                <div className="space-y-2">
                  {diagnosisReport.critical_issues.map((issue: string, idx: number) => (
                    <div key={idx} className="text-xs text-slate-300 flex items-start gap-2.5 bg-slate-950/20 border border-white/[0.03] p-3.5 rounded-xl">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0"></span>
                      <p className="leading-relaxed">{issue}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Wins */}
              <div className="space-y-2.5">
                <h4 className="text-[9px] font-black uppercase text-emerald-400 tracking-widest flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> High-impact Checklist
                </h4>
                <div className="space-y-2">
                  {diagnosisReport.quick_wins.map((win: string, idx: number) => (
                    <div key={idx} className="text-xs text-slate-300 flex items-start gap-2.5 bg-slate-950/20 border border-white/[0.03] p-3.5 rounded-xl">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
                      <p className="leading-relaxed">{win}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Closing */}
              <div className="pt-4 border-t border-white/[0.04] text-right">
                <button
                  onClick={() => setShowDiagnosisModal(false)}
                  className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-350 rounded-xl border border-white/[0.04] transition-all cursor-pointer"
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
