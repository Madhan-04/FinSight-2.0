"use client";

import React, { useState, useMemo } from 'react';
import { useFinance, Transaction } from '../../context/FinanceContext';
import UploadZone from '../../components/UploadZone';
import GlassCard from '../../components/GlassCard';
import { 
  FileText, 
  Trash2, 
  Search, 
  Filter, 
  Check, 
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Loader2
} from 'lucide-react';

export default function StatementIntelligence() {
  const { 
    transactions, 
    statements, 
    deleteStatement, 
    updateTransaction,
    loading 
  } = useFinance();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [editingTxId, setEditingTxId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const categories = [
    'All',
    'Income',
    'Food & Dining',
    'Shopping & Entertainment',
    'Bills & Subscriptions',
    'Investment & Savings',
    'Transfers',
    'Travel & Transport',
    'Health & Personal Care',
    'Other Expenses'
  ];

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchSearch = (t.merchant || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (t.raw_description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = selectedCategory === 'All' || t.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [transactions, searchTerm, selectedCategory]);

  const handleCategoryChange = async (id: number, newCat: string) => {
    try {
      await updateTransaction(id, { category: newCat });
      setEditingTxId(null);
    } catch (e) {
      console.error(e);
      alert("Failed to update transaction category");
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="border-b border-white/[0.04] pb-6">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-200 tracking-tight">
          Statement Intelligence
        </h2>
        <p className="text-slate-500 text-xs mt-1 font-medium">
          Upload statements to automatically extract, clean, and map your financial records.
        </p>
      </div>

      {/* Upload Zone */}
      <UploadZone />

      {/* Uploaded Statements List */}
      {statements.length > 0 && (
        <GlassCard hoverGlow={false} className="p-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Processed Bank Statements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {statements.map((stmt) => (
              <div 
                key={stmt.id} 
                className="flex items-center justify-between p-4 bg-slate-900/20 border border-white/[0.03] rounded-xl hover:border-indigo-500/15 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/10">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 truncate max-w-[180px]" title={stmt.filename}>{stmt.filename}</h4>
                    <p className="text-[9px] font-bold text-slate-500 flex items-center gap-1.5 mt-1 uppercase tracking-wider">
                      <span>{stmt.bank_name || "Unknown Bank"}</span>
                      <span>•</span>
                      <span>{stmt.period}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="text-[10px] font-extrabold text-emerald-400 tabular-nums">+{formatCurrency(stmt.total_credits)}</p>
                    <p className="text-[10px] font-extrabold text-rose-400 mt-1 tabular-nums">-{formatCurrency(stmt.total_debits)}</p>
                  </div>
                  <button 
                    onClick={() => setDeleteConfirmId(stmt.id)}
                    className="p-2 text-slate-500 hover:text-rose-455 hover:bg-rose-500/10 rounded-xl border border-transparent hover:border-rose-500/10 transition-all duration-200"
                    title="Delete Statement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Interactive Transactions Table */}
      <GlassCard hoverGlow={false} className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.04] pb-4 mb-4">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">
              Transaction Intelligence Ledger
            </h3>
            <p className="text-[10px] text-slate-500 mt-1 font-medium">Edit category inline by clicking on its badge.</p>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search merchant/raw description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-950/40 border border-white/[0.06] rounded-xl text-[11px] text-slate-300 focus:outline-none focus:border-indigo-500/40 w-48 sm:w-64 glass-input"
              />
            </div>
            
            <div className="flex items-center gap-1.5 bg-slate-950/40 border border-white/[0.06] rounded-xl px-3 py-2 text-[11px] text-slate-400">
              <Filter className="w-3.5 h-3.5 text-indigo-400" />
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-slate-300 text-[11px] focus:outline-none cursor-pointer font-bold"
              >
                {categories.map(c => (
                  <option key={c} value={c} className="bg-slate-950 text-slate-300">{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Transactions Table Layout */}
        <div className="overflow-x-auto">
          {filteredTransactions.length > 0 ? (
            <table className="w-full text-left border-collapse custom-table">
              <thead>
                <tr>
                  <th className="pl-2">Date</th>
                  <th>Merchant / Origin</th>
                  <th>Category</th>
                  <th className="text-center">Channel</th>
                  <th className="text-right">Value</th>
                  <th className="pr-2"></th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="group">
                    <td className="pl-2 text-slate-500 whitespace-nowrap font-medium">{tx.date}</td>
                    <td className="font-semibold text-slate-200">
                      <div>
                        <span>{tx.merchant || "Unknown Merchant"}</span>
                        <span className="block text-[9px] text-slate-500 font-mono mt-1 max-w-[280px] truncate leading-none" title={tx.raw_description}>
                          {tx.raw_description}
                        </span>
                      </div>
                    </td>
                    <td>
                      {editingTxId === tx.id ? (
                        <select
                          value={tx.category}
                          onChange={(e) => handleCategoryChange(tx.id, e.target.value)}
                          onBlur={() => setEditingTxId(null)}
                          autoFocus
                          className="bg-slate-950 border border-indigo-500/50 text-slate-200 text-[10px] font-bold rounded-xl px-2.5 py-1 focus:outline-none cursor-pointer"
                        >
                          {categories.slice(1).map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      ) : (
                        <button
                          onClick={() => setEditingTxId(tx.id)}
                          className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border border-white/[0.04] bg-slate-950/40 hover:border-indigo-500/30 text-slate-300 hover:text-indigo-400 transition-all cursor-pointer"
                        >
                          {tx.category}
                        </button>
                      )}
                    </td>
                    <td className="text-center text-slate-500 font-extrabold text-[9px] uppercase tracking-wider">{tx.payment_method}</td>
                    <td className="text-right whitespace-nowrap">
                      <span className={`font-black text-sm tabular-nums ${tx.type === 'credit' ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                    </td>
                    <td className="pr-2 text-right">
                      <span 
                        className="text-[9px] text-slate-600 group-hover:text-indigo-400 transition-colors uppercase font-black tracking-wider cursor-pointer" 
                        onClick={() => setEditingTxId(tx.id)}
                      >
                        Edit
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs italic">
              No transactions match the selected filters.
            </div>
          )}
        </div>
      </GlassCard>

      {/* Delete Confirmation Modal Overlay */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <GlassCard glow className="w-full max-w-md p-6 relative animate-fade-in border-rose-500/25">
            <button 
              onClick={() => setDeleteConfirmId(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors p-1.5 bg-slate-900 border border-white/[0.06] rounded-lg"
              disabled={isDeleting}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-white/[0.04] pb-4 mb-5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">Delete Bank Statement?</h3>
                <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider">Permanent Deletion Reminder</span>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-slate-100">&ldquo;{statements.find(s => s.id === deleteConfirmId)?.filename}&rdquo;</span>?
              </p>
              <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-3.5 text-[11px] text-rose-400/90 leading-relaxed">
                <p className="font-black uppercase tracking-widest text-[9px] mb-1">⚠️ Warning</p>
                Deleting this statement will permanently remove its associated <span className="font-extrabold">{statements.find(s => s.id === deleteConfirmId)?.total_transactions || 0}</span> transactions from the ledger database and dynamically recalculate all financial safety and wealth intelligence metrics.
              </div>

              <div className="flex gap-2.5 pt-2 justify-end">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-300 rounded-xl border border-white/[0.04] transition-all cursor-pointer"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setIsDeleting(true);
                    try {
                      await deleteStatement(deleteConfirmId);
                      setDeleteConfirmId(null);
                    } catch (e) {
                      console.error(e);
                      alert("Failed to delete statement");
                    } finally {
                      setIsDeleting(false);
                    }
                  }}
                  className="flex items-center gap-2 py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-[10px] font-black uppercase tracking-widest text-white rounded-xl transition-all cursor-pointer shadow-md"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Confirm Delete</span>
                  )}
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
