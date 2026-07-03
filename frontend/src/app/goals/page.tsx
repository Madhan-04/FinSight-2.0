"use client";

import React, { useState } from 'react';
import { useFinance, Goal } from '../../context/FinanceContext';
import GlassCard from '../../components/GlassCard';
import { 
  Target, 
  Calendar, 
  Plus, 
  Trash2, 
  PiggyBank, 
  X,
  Loader2,
  CheckCircle,
  Sparkles
} from 'lucide-react';

export default function SavingsGoals() {
  const { 
    goals, 
    addGoal, 
    updateGoal, 
    deleteGoal,
    goalsProbability,
    loading 
  } = useFinance();

  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newGoalName, setNewGoalName] = useState<string>('');
  const [newGoalTarget, setNewGoalTarget] = useState<string>('');
  const [newGoalDate, setNewGoalDate] = useState<string>('');
  const [newGoalCategory, setNewGoalCategory] = useState<string>('Emergency Fund');
  
  const [fundGoalId, setFundGoalId] = useState<number | null>(null);
  const [fundAmount, setFundAmount] = useState<string>('');

  const categories = ['Emergency Fund', 'Vehicle', 'Education', 'Vacation', 'Custom'];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalName || !newGoalTarget || !newGoalDate) return;

    try {
      await addGoal({
        name: newGoalName,
        target_amount: parseFloat(newGoalTarget),
        current_amount: 0.0,
        target_date: newGoalDate,
        category: newGoalCategory
      });
      
      // Reset form
      setNewGoalName('');
      setNewGoalTarget('');
      setNewGoalDate('');
      setNewGoalCategory('Emergency Fund');
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create savings goal.");
    }
  };

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fundGoalId === null || !fundAmount) return;

    try {
      const targetGoal = goals.find(g => g.id === fundGoalId);
      if (targetGoal) {
        const newAmt = targetGoal.current_amount + parseFloat(fundAmount);
        await updateGoal(fundGoalId, { current_amount: newAmt });
      }
      setFundGoalId(null);
      setFundAmount('');
    } catch (err) {
      console.error(err);
      alert("Failed to allocate savings.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-xs font-semibold text-slate-400">Loading savings milestones...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header and Toggle form */}
      <div className="flex justify-between items-center border-b border-white/[0.04] pb-6">
        <div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-200 tracking-tight">
            Savings Goals
          </h2>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Build milestones, allocate savings, and track your financial velocity.
          </p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-[11px] font-extrabold uppercase tracking-wider text-white transition-all duration-200 shadow-md"
        >
          {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{showAddForm ? 'Cancel' : 'New Goal'}</span>
        </button>
      </div>

      {/* Add New Goal Form */}
      {showAddForm && (
        <GlassCard glow className="animate-fade-in-up p-6 border-indigo-500/20">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-400" /> Create Savings Milestone
          </h3>
          <form onSubmit={handleCreateGoal} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">Goal Title</label>
              <input
                type="text"
                placeholder="e.g. Europe Vacation"
                required
                value={newGoalName}
                onChange={(e) => setNewGoalName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950/40 border border-white/[0.06] rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500/40 glass-input"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">Target Value (₹)</label>
              <input
                type="number"
                placeholder="e.g. 150000"
                required
                value={newGoalTarget}
                onChange={(e) => setNewGoalTarget(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950/40 border border-white/[0.06] rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500/40 glass-input"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">Target Date</label>
              <input
                type="date"
                required
                value={newGoalDate}
                onChange={(e) => setNewGoalDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950/40 border border-white/[0.06] rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500/40 glass-input"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">Goal Category</label>
              <select
                value={newGoalCategory}
                onChange={(e) => setNewGoalCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950/40 border border-white/[0.06] rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500/40 glass-input cursor-pointer font-bold"
              >
                {categories.map(c => (
                  <option key={c} value={c} className="bg-slate-950">{c}</option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-4 flex justify-end mt-2">
              <button 
                type="submit"
                className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-md"
              >
                Launch Milestone
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Allocation Overlay modal */}
      {fundGoalId !== null && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard glow className="w-full max-w-sm p-6 relative border-indigo-500/25">
            <button 
              onClick={() => setFundGoalId(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors p-1.5 bg-slate-900 border border-white/[0.06] rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-indigo-400" /> Allocate Savings
            </h3>
            <form onSubmit={handleAddFunds} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">Deposit Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  required
                  autoFocus
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950/40 border border-white/[0.06] rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500/40 glass-input"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-[10px] font-black uppercase tracking-widest text-white rounded-xl transition-all shadow-md"
              >
                Confirm Allocation
              </button>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Goals Grid */}
      {goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((g) => {
            const completionPercent = Math.min(Math.round((g.current_amount / g.target_amount) * 100), 100);
            const probDetails = goalsProbability?.find(p => p.goal_id === g.id);

            return (
              <GlassCard key={g.id} className="flex flex-col justify-between min-h-[260px] glass-panel-hover p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] uppercase font-black tracking-widest text-indigo-400">
                        {g.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-100 mt-1">{g.name}</h4>
                    </div>
                    <button 
                      onClick={() => deleteGoal(g.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-455 rounded-xl hover:bg-rose-500/10 transition-colors"
                      title="Remove Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Progress Gauge info */}
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-extrabold text-slate-200 tabular-nums">{formatCurrency(g.current_amount)}</span>
                      <span className="text-slate-500 font-medium tabular-nums">of {formatCurrency(g.target_amount)}</span>
                    </div>

                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-white/[0.03]">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-full transition-all duration-700 rounded-full" 
                        style={{ width: `${completionPercent}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-indigo-400" /> {g.target_date}
                      </span>
                      <span className="text-indigo-400 tabular-nums">{completionPercent}% Funded</span>
                    </div>
                  </div>

                  {/* AI Goal Predictions */}
                  {probDetails && (
                    <div className="bg-slate-950/40 border border-white/[0.03] rounded-xl p-3 space-y-2 text-xs text-slate-300">
                      <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
                        <span className="text-cyan-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" /> AI Forecast
                        </span>
                        <span className={`px-1.5 py-0.5 rounded-md border ${
                          probDetails.probability >= 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          probDetails.probability >= 50 ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {probDetails.probability}% Probable
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider flex items-center justify-between">
                        <span>Expected Completion:</span>
                        <span className="text-slate-200 tabular-nums">{probDetails.expected_months} Months</span>
                      </div>
                      <p className="text-[10px] leading-relaxed italic text-slate-400 border-t border-white/[0.04] pt-2">
                        &ldquo;{probDetails.suggestions}&rdquo;
                      </p>
                    </div>
                  )}
                </div>

                {/* Allocate Fund action */}
                <div className="mt-6 pt-4 border-t border-white/[0.04] flex justify-between items-center">
                  {completionPercent >= 100 ? (
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 fill-emerald-500/10 text-emerald-400" /> Fully Funded!
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest">
                      Savings Pipeline
                    </span>
                  )}
                  {completionPercent < 100 && (
                    <button 
                      onClick={() => setFundGoalId(g.id)}
                      className="py-1 px-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-indigo-500/20 transition-all flex items-center gap-1"
                    >
                      <PiggyBank className="w-3.5 h-3.5" /> Allocate
                    </button>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900/10 border border-white/[0.06] border-dashed rounded-2xl animate-fade-in-up">
          <Target className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-semibold">No active savings milestones.</p>
          <p className="text-slate-500 text-xs mt-1.5 mb-5 max-w-sm mx-auto leading-relaxed">Set up a goal (like a laptop purchase or emergency fund) to optimize cash allocation.</p>
          <button 
            onClick={() => setShowAddForm(true)}
            className="py-2.5 px-5 bg-indigo-600/10 border border-indigo-500/25 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-300 hover:bg-indigo-600/20 transition-colors"
          >
            Create Your First Goal
          </button>
        </div>
      )}
    </div>
  );
}
