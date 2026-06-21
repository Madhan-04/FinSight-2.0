"use client";

import React, { useState } from 'react';
import { useFinance, Goal } from '../../context/FinanceContext';
import GlassCard from '../../components/GlassCard';
import { 
  Target, 
  Calendar, 
  TrendingUp, 
  Plus, 
  Trash2, 
  PiggyBank, 
  X,
  Loader2,
  CheckCircle,
  Sparkles,
  ShieldCheck,
  TrendingUp as TrendIcon
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
    }).format(val);
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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header and Toggle form */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Savings Goals
          </h2>
          <p className="text-slate-300 text-sm mt-1">
            Build milestones, allocate savings, and track your financial velocity.
          </p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-xs font-bold text-white transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showAddForm ? 'Cancel' : 'New Goal'}</span>
        </button>
      </div>

      {/* Add New Goal Form */}
      {showAddForm && (
        <GlassCard glow className="animate-fade-in p-6 border-blue-500/20">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-400" /> Create Savings Milestone
          </h3>
          <form onSubmit={handleCreateGoal} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Goal Title</label>
              <input
                type="text"
                placeholder="e.g. Europe Vacation"
                required
                value={newGoalName}
                onChange={(e) => setNewGoalName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500/50 glass-input"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Target Value (₹)</label>
              <input
                type="number"
                placeholder="e.g. 150000"
                required
                value={newGoalTarget}
                onChange={(e) => setNewGoalTarget(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500/50 glass-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Target Date</label>
              <input
                type="date"
                required
                value={newGoalDate}
                onChange={(e) => setNewGoalDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500/50 glass-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Goal Category</label>
              <select
                value={newGoalCategory}
                onChange={(e) => setNewGoalCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500/50 glass-input cursor-pointer"
              >
                {categories.map(c => (
                  <option key={c} value={c} className="bg-slate-950">{c}</option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-4 flex justify-end mt-2">
              <button 
                type="submit"
                className="py-2 px-5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-all shadow-[0_0_10px_rgba(59,130,246,0.15)]"
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
          <GlassCard glow className="w-full max-w-sm p-6 relative border-blue-500/25">
            <button 
              onClick={() => setFundGoalId(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-blue-400" /> Allocate Savings
            </h3>
            <form onSubmit={handleAddFunds} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Deposit Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  required
                  autoFocus
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500/50 glass-input"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-lg transition-all shadow-[0_0_10px_rgba(59,130,246,0.15)]"
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
            
            // Find AI Probability details from context
            const probDetails = goalsProbability?.find(p => p.goal_id === g.id);

            return (
              <GlassCard key={g.id} className="flex flex-col justify-between min-h-[260px] glass-panel-hover">
                <div className="space-y-3.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] uppercase font-black tracking-widest text-blue-400">
                        {g.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-100 mt-0.5">{g.name}</h4>
                    </div>
                    <button 
                      onClick={() => deleteGoal(g.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                      title="Remove Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Progress Gauge info */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-extrabold text-slate-200">{formatCurrency(g.current_amount)}</span>
                      <span className="text-slate-500">of {formatCurrency(g.target_amount)}</span>
                    </div>

                    <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-900">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full transition-all duration-700 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]" 
                        style={{ width: `${completionPercent}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" /> Deadline: {g.target_date}
                      </span>
                      <span className="font-bold text-blue-400">{completionPercent}% Funded</span>
                    </div>
                  </div>

                  {/* AI Goal Predictions */}
                  {probDetails && (
                    <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3 space-y-1.5 text-xs text-slate-300">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-cyan-400" /> AI Forecast
                        </span>
                        <span className={`font-black uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${
                          probDetails.probability >= 80 ? 'bg-emerald-500/10 text-emerald-400' :
                          probDetails.probability >= 50 ? 'bg-blue-500/10 text-blue-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {probDetails.probability}% Probable
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between">
                        <span>Expected Completion:</span>
                        <span className="font-extrabold text-slate-200">{probDetails.expected_months} Months</span>
                      </div>
                      <p className="text-[10px] leading-snug italic text-slate-400 font-medium border-t border-slate-900 pt-1.5">
                        &ldquo;{probDetails.suggestions}&rdquo;
                      </p>
                    </div>
                  )}
                </div>

                {/* Allocate Fund action */}
                <div className="mt-4 pt-3 border-t border-slate-900/60 flex justify-between items-center">
                  {completionPercent >= 100 ? (
                    <span className="text-[10px] font-black uppercase text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 fill-emerald-500/10" /> Fully Funded!
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                      Savings Pipeline
                    </span>
                  )}
                  {completionPercent < 100 && (
                    <button 
                      onClick={() => setFundGoalId(g.id)}
                      className="py-1 px-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase rounded-lg border border-blue-500/20 transition-all flex items-center gap-1"
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
        <div className="text-center py-16 bg-slate-950/20 border border-slate-900 border-dashed rounded-2xl">
          <Target className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-semibold">No active savings milestones.</p>
          <p className="text-slate-500 text-xs mt-1 mb-4">Set up a goal (like a laptop purchase or emergency fund) to optimize cash allocation.</p>
          <button 
            onClick={() => setShowAddForm(true)}
            className="py-1.5 px-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Create Your First Goal
          </button>
        </div>
      )}
    </div>
  );
}
