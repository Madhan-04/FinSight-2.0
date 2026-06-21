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
  HelpCircle,
  HelpCircle as ShieldCheck,
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
    }).format(val);
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


  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          Analytics Center
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Smart insights, spending forecasts, and subscription detection powered by AI.
        </p>
      </div>

      {/* Forecasting and Subscriptions Summary grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Forecast Card */}
        <GlassCard glow className="flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" /> Expense Forecasting
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Projecting next month&apos;s cash outflow using trend models.</p>
              </div>
              <span className={`
                px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1
                ${forecast.trend === 'increasing' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 
                  forecast.trend === 'decreasing' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                  'bg-slate-900 text-slate-400 border border-slate-800'}
              `}>
                {forecast.trend === 'increasing' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {forecast.trend} Trend
              </span>
            </div>

            <div className="mt-6 mb-8 text-center sm:text-left bg-slate-950/20 border border-slate-900/60 p-6 rounded-2xl">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Estimated Outflow</span>
              <h3 className="text-4xl font-black text-white tracking-tight mt-1">{formatCurrency(forecast.next_month_estimated_expenses)}</h3>
              
              <div className="mt-4">
                <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1">
                  <span>Confidence Level</span>
                  <span>{Math.round(forecast.confidence * 100)}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full transition-all duration-1000" 
                    style={{ width: `${forecast.confidence * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI Predictions & Insights</h4>
              {forecast.insights && forecast.insights.length > 0 ? (
                <div className="space-y-1.5">
                  {forecast.insights.map((ins, idx) => (
                    <div key={idx} className="flex gap-2 items-start text-xs text-slate-300">
                      <Zap className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <p>{ins}</p>
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
        <GlassCard>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-400" /> Active Subscriptions
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Recurring billing and standard EMI detection.</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Total Burden</span>
              <span className="text-lg font-black text-blue-400">{formatCurrency(totalSubCost)}/mo</span>
            </div>
          </div>

          <div className="space-y-2.5 mt-6 max-h-[360px] overflow-y-auto pr-1">
            {subscriptions.length > 0 ? (
              subscriptions.map((sub, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-900 rounded-xl hover:border-slate-800 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 text-xs font-bold uppercase">
                      {sub.merchant.slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{sub.merchant}</h4>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <span>{sub.category}</span>
                        <span>•</span>
                        <span className="capitalize">{sub.frequency}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-200">{formatCurrency(sub.amount)}</p>
                    <p className="text-[9px] text-slate-500 flex items-center justify-end gap-1 mt-0.5">
                      <Calendar className="w-2.5 h-2.5" /> Next: {sub.next_expected_date}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs italic">
                No active recurring subscriptions or EMIs detected in your transactions ledger.
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Spending Heatmap Grid */}
      <GlassCard>
        <div className="border-b border-slate-900 pb-3 mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Spending Density Heatmap
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Concentration of expense transactions across days of the week.</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {weeklyHeatmap.map((item) => {
            const opacityClass = 
              item.intensity > 0.8 ? 'bg-blue-600/90 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]' :
              item.intensity > 0.5 ? 'bg-blue-600/60 text-slate-100' :
              item.intensity > 0.2 ? 'bg-blue-600/30 text-slate-300' :
              item.intensity > 0.01 ? 'bg-blue-600/10 text-slate-400 border border-slate-900/40' :
              'bg-slate-950/20 text-slate-500 border border-slate-900/60';

            return (
              <div 
                key={item.day}
                className={`p-4 rounded-xl flex flex-col justify-between items-center text-center h-24 transition-all duration-300 hover:scale-[1.03] ${opacityClass}`}
              >
                <span className="text-[10px] font-black uppercase tracking-widest">{item.day.slice(0, 3)}</span>
                <div className="my-1">
                  <span className="text-xs font-black block">{formatCurrency(item.spend)}</span>
                  <span className="text-[9px] opacity-75 font-semibold block">{item.count} charge(s)</span>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* AI Budget Optimizer & Limits check */}
      <GlassCard>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-900 pb-3 mb-6 gap-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              AI Budget Optimizer
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Monthly allocation compliance status and AI optimization.</p>
          </div>
          <button
            onClick={handleGeneratePlan}
            disabled={optimizing}
            className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-xs font-bold text-white transition-all shadow-[0_0_10px_rgba(59,130,246,0.15)] disabled:opacity-50"
          >
            {optimizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 animate-pulse" />}
            <span>{optimizing ? 'Analyzing spends...' : 'Generate AI Optimization Plan'}</span>
          </button>
        </div>

        {/* Display Optimization Plan if available */}
        {optimizationPlan && (
          <div className="mb-8 p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl animate-fade-in space-y-4">
            <div>
              <span className="text-[9px] uppercase font-black tracking-widest text-blue-400">AI Diagnosis Summary</span>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{optimizationPlan.summary}</p>
              <div className="text-xs font-black text-blue-300 mt-2">
                Estimated Monthly Savings Potential: <span className="text-white text-sm underline decoration-blue-500 underline-offset-4">{formatCurrency(optimizationPlan.estimated_monthly_savings)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Recommended Budget Limits</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {optimizationPlan.suggested_budgets.map((item: any) => (
                  <div key={item.category} className="p-3.5 bg-slate-950/40 border border-slate-900 rounded-xl space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-200">
                      <span>{item.category}</span>
                      <span className="text-emerald-400">Save {formatCurrency(item.savings_potential)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Current: {formatCurrency(item.current_spend)}</span>
                      <span>Target Limit: {formatCurrency(item.suggested_limit)}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 bg-slate-950/20 p-2.5 rounded border border-slate-900/60 leading-normal italic">
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
            <div key={b.name} className="space-y-2 bg-slate-950/20 border border-slate-900/60 p-4 rounded-xl hover:border-slate-850 transition-colors">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-300">{b.name}</span>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  b.percentage > 100 ? 'bg-rose-500/10 text-rose-400' :
                  b.percentage > 80 ? 'bg-amber-500/10 text-amber-400' :
                  'bg-emerald-500/10 text-emerald-400'
                }`}>
                  {b.percentage}%
                </span>
              </div>
              
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    b.percentage > 100 ? 'bg-rose-500' :
                    b.percentage > 80 ? 'bg-amber-500' :
                    'bg-blue-500'
                  }`}
                  style={{ width: `${b.percentage}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-[10px] text-slate-500 font-bold pt-1">
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
