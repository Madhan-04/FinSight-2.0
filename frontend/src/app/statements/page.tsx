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
      const matchSearch = t.merchant.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.raw_description.toLowerCase().includes(searchTerm.toLowerCase());
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
    }).format(val);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          Statement Intelligence
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Upload statements to automatically extract, clean, and map your financial records.
        </p>
      </div>

      {/* Upload Zone */}
      <UploadZone />

      {/* Uploaded Statements List */}
      {statements.length > 0 && (
        <GlassCard>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
            Processed Bank Statements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {statements.map((stmt) => (
              <div 
                key={stmt.id} 
                className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-900 rounded-xl hover:border-slate-800/80 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 truncate max-w-[200px]">{stmt.filename}</h4>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <span>{stmt.bank_name || "Unknown Bank"}</span>
                      <span>•</span>
                      <span>{stmt.period}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div className="hidden sm:block">
                    <p className="text-[10px] font-bold text-emerald-400">Inflows: +{formatCurrency(stmt.total_credits)}</p>
                    <p className="text-[10px] font-bold text-rose-400 mt-0.5">Outflows: -{formatCurrency(stmt.total_debits)}</p>
                  </div>
                  <button 
                    onClick={() => setDeleteConfirmId(stmt.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
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
      <GlassCard>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Transaction Intelligence Ledger
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Edit category inline by clicking on its pill badge.</p>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search merchant/raw description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8.5 pr-4 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-blue-500/50 w-48 sm:w-60"
              />
            </div>
            
            <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-400">
              <Filter className="w-3.5 h-3.5" />
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer"
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
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <th className="pb-3 pl-2">Date</th>
                  <th className="pb-3">Merchant / Origin</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3 text-center">Payment Channel</th>
                  <th className="pb-3 text-right">Value</th>
                  <th className="pb-3 pr-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/40 text-xs">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-900/20 transition-colors group">
                    <td className="py-3.5 pl-2 text-slate-400 whitespace-nowrap">{tx.date}</td>
                    <td className="py-3.5 font-medium text-slate-200">
                      <div>
                        <span>{tx.merchant}</span>
                        <span className="block text-[9px] text-slate-500 font-mono mt-0.5 truncate max-w-[280px]" title={tx.raw_description}>
                          {tx.raw_description}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5">
                      {editingTxId === tx.id ? (
                        <select
                          value={tx.category}
                          onChange={(e) => handleCategoryChange(tx.id, e.target.value)}
                          onBlur={() => setEditingTxId(null)}
                          autoFocus
                          className="bg-slate-900 border border-blue-500/40 text-slate-200 text-xs rounded px-2 py-0.5 focus:outline-none cursor-pointer"
                        >
                          {categories.slice(1).map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      ) : (
                        <button
                          onClick={() => setEditingTxId(tx.id)}
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-slate-800 bg-slate-950/40 hover:border-blue-500/30 text-slate-300 hover:text-blue-300 transition-all uppercase tracking-wide cursor-pointer"
                        >
                          {tx.category}
                        </button>
                      )}
                    </td>
                    <td className="py-3.5 text-center text-slate-400 font-bold text-[10px]">{tx.payment_method}</td>
                    <td className="py-3.5 text-right whitespace-nowrap">
                      <span className={`font-black text-sm ${tx.type === 'credit' ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                    </td>
                    <td className="py-3.5 pr-2 text-right">
                      {/* Interactive indicator */}
                      <span className="text-[10px] text-slate-600 group-hover:text-blue-400 transition-colors uppercase font-bold tracking-wider cursor-pointer" onClick={() => setEditingTxId(tx.id)}>
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
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors p-1.5 bg-slate-900 border border-slate-800 rounded-lg"
              disabled={isDeleting}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-900 pb-4 mb-5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">Delete Bank Statement?</h3>
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Permanent Deletion Reminder</span>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-slate-100">"{statements.find(s => s.id === deleteConfirmId)?.filename}"</span>?
              </p>
              <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-3 text-[11px] text-rose-400/90 leading-relaxed">
                <p className="font-bold uppercase tracking-wider text-[9px] mb-1">⚠️ Warning</p>
                Deleting this statement will permanently remove its associated <span className="font-extrabold">{statements.find(s => s.id === deleteConfirmId)?.total_transactions || 0}</span> transactions from the ledger database and dynamically recalculate all financial safety and wealth intelligence metrics.
              </div>

              <div className="flex gap-2.5 pt-2 justify-end">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 rounded-lg border border-slate-800 transition-all cursor-pointer"
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
                  className="flex items-center gap-2 py-2 px-4 bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white rounded-lg transition-all cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.15)]"
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
