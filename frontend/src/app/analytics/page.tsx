"use client";

import React, { useMemo, useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import GlassCard from '../../components/GlassCard';
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Calendar,
  AlertCircle,
  CheckCircle,
  CreditCard,
  Percent,
  Sparkles,
  Loader2
} from 'lucide-react';

export default function AnalyticsCenter() {
  const { 
    subscriptions, 
    forecast, 
    transactions,
    optimizeBudget,
    loading 
  } = useFinance();

  const [optimizing, setOptimizing] = useState<boolean>(false);
  const [optimizationPlan, setOptimizationPlan] = useState<any>(null);

  const handleGeneratePlan = async () => {
    setOptimizing(true);
    try {
      const plan = await optimizeBudget();
      setOptimizationPlan(plan);
    } catch (err) {
      console.error(err);
      alert("Failed to generate AI budget optimization plan");
    } finally {
      setOptimizing(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  // Calculate sum of active subscriptions
  const totalSubCost = useMemo(() => {
    return subscriptions.reduce((sum, item) => sum + item.amount, 0);
  }, [subscriptions]);

  // Aggregate Category Expense details for budget comparisons
  const budgetData = useMemo(() => {
    const cats: Record<string, { current: number; budget: number }> = {
      'Food & Dining': { current: 0, budget: 12000 },
      'Shopping & Entertainment': { current: 0, budget: 15000 },
      'Bills & Subscriptions': { current: 0, budget: 30000 },
      'Travel & Transport': { current: 0, budget: 5000 },
      'Health & Personal Care': { current: 0, budget: 3000 },
      'Other Expenses': { current: 0, budget: 10000 },
    };

    transactions.forEach(t => {
      if (t.type === 'debit' && cats[t.category]) {
        cats[t.category].current += t.amount;
      }
    });

    return Object.entries(cats).map(([name, data]) => ({
      name,
      current: data.current,
      budget: data.budget,
      percentage: Math.min(Math.round((data.current / data.budget) * 100), 200)
    }));
  }, [transactions]);

  // Group spending by day of the week for Heatmap density visualization
  const weeklyHeatmap = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const spends = Array(7).fill(0);
    const counts = Array(7).fill(0);

    transactions.forEach(t => {
      if (t.type === 'debit') {
        const dateObj = new Date(t.date);
        const dayIdx = dateObj.getDay();
        spends[dayIdx] += t.amount;
        counts[dayIdx] += 1;
      }
    });

    const maxSpend = Math.max(...spends, 1);

    return days.map((day, idx) => ({
      day,
      spend: spends[idx],
      count: counts[idx],
      intensity: spends[idx] / maxSpend
    }));
  }, [transactions]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-xs font-semibold text-slate-400">Loading analysis charts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="border-b border-white/[0.04] pb-6">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-200 tracking-tight">
          Analytics Center
        </h2>
        <p className="text-slate-500 text-xs mt-1 font-medium">
          Smart insights, spending forecasts, and subscription detection powered by AI.
        </p>
      </div>

      {/* Forecasting and Subscriptions Summary grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Forecast Card */}
        <GlassCard glow className="flex flex-col justify-between p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" /> Expense Forecasting
                </h3>
                <p className="text-[10px] text-slate-500 mt-1">Projecting next month&apos;s cash outflow using trend models.</p>
              </div>
              <span className={`
                px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 border
                ${forecast.trend === 'increasing' ? 'bg-rose-500/10 text-rose-450 border-rose-500/20' : 
                  forecast.trend === 'decreasing' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                  'bg-slate-900 text-slate-400 border-white/[0.04]'}
              `}>
                {forecast.trend === 'increasing' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {forecast.trend} Trend
              </span>
            </div>

            <div className="text-center sm:text-left bg-slate-950/30 border border-white/[0.04] p-5 rounded-2xl">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-extrabold">Estimated Outflow</span>
              <h3 className="text-3xl font-black text-white tracking-tight mt-1 tabular-nums">{formatCurrency(forecast.next_month_estimated_expenses)}</h3>
              
              <div className="mt-4">
                <div className="flex justify-between text-[9px] text-slate-400 font-extrabold uppercase tracking-wider mb-1">
                  <span>Confidence Level</span>
                  <span className="tabular-nums">{Math.round((forecast.confidence || 0.8) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-white/[0.03]">
                  <div 
                    className="bg-indigo-500 h-full transition-all duration-1000" 
                    style={{ width: `${(forecast.confidence || 0.8) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">AI Predictions & Insights</h4>
              {forecast.insights && forecast.insights.length > 0 ? (
                <div className="space-y-2">
                  {forecast.insights.map((ins, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start text-xs text-slate-300 bg-slate-950/20 p-2.5 rounded-xl border border-white/[0.03]">
                      <Zap className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">{ins}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">Analysis in progress. Please upload more monthly statements.</p>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Subscription Detector Card */}
        <GlassCard className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-400" /> Active Subscriptions
              </h3>
              <p className="text-[10px] text-slate-500 mt-1">Recurring billing and standard EMI detection.</p>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-extrabold block">Total Burden</span>
              <span className="text-lg font-black text-indigo-400 tabular-nums">{formatCurrency(totalSubCost)}/mo</span>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
            {subscriptions.length > 0 ? (
              subscriptions.map((sub, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-3.5 bg-slate-900/20 border border-white/[0.03] rounded-xl hover:border-indigo-500/15 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-xs font-black uppercase border border-indigo-500/15">
                      {sub.merchant.slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{sub.merchant}</h4>
                      <p className="text-[9px] font-bold text-slate-500 flex items-center gap-1.5 mt-1 uppercase tracking-wider">
                        <span>{sub.category}</span>
                        <span>•</span>
                        <span>{sub.frequency}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-extrabold text-slate-200 tabular-nums">{formatCurrency(sub.amount)}</p>
                    <p className="text-[9px] text-slate-500 flex items-center justify-end gap-1.5 mt-1 font-semibold uppercase tracking-wider">
                      <Calendar className="w-3 h-3 text-indigo-400" /> {sub.next_expected_date}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 text-slate-500 text-[11px] italic">
                No active recurring subscriptions or EMIs detected in your transactions ledger.
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Spending Heatmap Grid */}
      <GlassCard className="p-6">
        <div className="border-b border-white/[0.04] pb-4 mb-5">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest">
            Spending Density Heatmap
          </h3>
          <p className="text-[10px] text-slate-500 mt-1">Concentration of expense transactions across days of the week.</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {weeklyHeatmap.map((item) => {
            const opacityClass = 
              item.intensity > 0.8 ? 'bg-indigo-600/90 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]' :
              item.intensity > 0.5 ? 'bg-indigo-600/60 text-slate-100' :
              item.intensity > 0.2 ? 'bg-indigo-600/30 text-slate-300' :
              item.intensity > 0.01 ? 'bg-indigo-600/10 text-slate-400 border border-white/[0.03]' :
              'bg-slate-950/20 text-slate-500 border border-white/[0.03]';

            return (
              <div 
                key={item.day}
                className={`p-4 rounded-xl flex flex-col justify-between items-center text-center h-24 transition-all duration-300 hover:scale-[1.03] ${opacityClass}`}
              >
                <span className="text-[9px] font-black uppercase tracking-widest">{item.day.slice(0, 3)}</span>
                <div className="my-1 text-center">
                  <span className="text-xs font-black block tabular-nums">{formatCurrency(item.spend)}</span>
                  <span className="text-[8px] opacity-75 font-bold uppercase tracking-wider block mt-0.5">{item.count} charge{item.count !== 1 && 's'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* AI Budget Optimizer & Limits check */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.04] pb-4 mb-6 gap-4">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">
              AI Budget Optimizer
            </h3>
            <p className="text-[10px] text-slate-500 mt-1 font-medium">Monthly allocation compliance status and AI optimization.</p>
          </div>
          <button
            onClick={handleGeneratePlan}
            disabled={optimizing}
            className="flex items-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-[11px] font-extrabold uppercase tracking-wider text-white transition-all duration-200 shadow-[0_4px_15px_-3px_rgba(99,102,241,0.25)] disabled:opacity-50"
          >
            {optimizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 animate-pulse" />}
            <span>{optimizing ? 'Analyzing spends...' : 'Generate Optimization Plan'}</span>
          </button>
        </div>

        {/* Display Optimization Plan if available */}
        {optimizationPlan && (
          <div className="mb-6 p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl animate-fade-in-up space-y-5">
            <div>
              <span className="text-[9px] uppercase font-black tracking-widest text-indigo-400">AI Diagnosis Summary</span>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed italic">&ldquo;{optimizationPlan.summary}&rdquo;</p>
              <div className="text-xs font-bold text-slate-400 mt-3 uppercase tracking-wider">
                Estimated Monthly Savings Potential: <span className="text-emerald-400 text-sm font-black tabular-nums">{formatCurrency(optimizationPlan.estimated_monthly_savings)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Recommended Budget Limits</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {optimizationPlan.suggested_budgets.map((item: any) => (
                  <div key={item.category} className="p-4 bg-slate-950/40 border border-white/[0.03] rounded-xl space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-200">
                      <span>{item.category}</span>
                      <span className="text-emerald-400">Save {formatCurrency(item.savings_potential)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      <span>Spent: {formatCurrency(item.current_spend)}</span>
                      <span>Target: {formatCurrency(item.suggested_limit)}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 bg-slate-950/20 p-2.5 rounded-xl border border-white/[0.04] leading-relaxed italic">
                      &ldquo;{item.rationale}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgetData.map((b) => (
            <div key={b.name} className="space-y-3 bg-slate-950/20 border border-white/[0.03] p-4 rounded-xl hover:border-indigo-500/15 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-300">{b.name}</span>
                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  b.percentage > 100 ? 'bg-rose-500/10 text-rose-455 border-rose-500/20' :
                  b.percentage > 80 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {b.percentage}%
                </span>
              </div>
              
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-white/[0.03]">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    b.percentage > 100 ? 'bg-rose-500' :
                    b.percentage > 80 ? 'bg-amber-500' :
                    'bg-indigo-500'
                  }`}
                  style={{ width: `${b.percentage}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-[10px] text-slate-500 font-extrabold uppercase tracking-wider pt-1">
                <span>Spent: {formatCurrency(b.current)}</span>
                <span>Limit: {formatCurrency(b.budget)}</span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
