"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { StorageService, DBTransaction, DBStatement, DBGoal, DBChatMessage } from '../services/storage';

export interface Transaction {
  id: number;
  date: string;
  raw_description: string;
  merchant: string;
  amount: number;
  type: 'debit' | 'credit';
  category: string;
  payment_method: string;
  is_recurring: boolean;
  statement_id?: number;
}

export interface Statement {
  id: number;
  filename: string;
  uploaded_at: string;
  bank_name?: string;
  period?: string;
  total_transactions: number;
  total_debits: number;
  total_credits: number;
  transactions?: Transaction[];
}

export interface Goal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category: string;
}

export interface ChatMessage {
  id: number;
  sender: 'user' | 'ai';
  message: string;
  timestamp: string;
}

export interface HealthScore {
  score: number;
  status: string;
  breakdown: string[];
  recommendation: string;
}

export interface SubscriptionItem {
  merchant: string;
  category: string;
  amount: number;
  frequency: string;
  next_expected_date: string;
}

export interface AnomalyItem {
  transaction_id: number;
  date: string;
  merchant: string;
  amount: number;
  reason: string;
  type: 'spike' | 'duplicate' | 'unusual';
}

export interface Forecast {
  next_month_estimated_expenses: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  insights: string[];
}

export interface BudgetOptimizationItem {
  category: string;
  current_spend: number;
  suggested_limit: number;
  savings_potential: number;
  rationale: string;
}

export interface BudgetOptimizationResponse {
  suggested_budgets: BudgetOptimizationItem[];
  estimated_monthly_savings: number;
  summary: string;
}

export interface DiagnosisResponse {
  executive_summary: string;
  overall_status: string;
  critical_issues: string[];
  quick_wins: string[];
}

export interface Overview {
  total_income: number;
  total_expenses: number;
  total_savings: number;
  savings_rate: number;
  cash_flow: number;
}

interface FinanceContextType {
  transactions: Transaction[];
  statements: Statement[];
  goals: Goal[];
  chatHistory: ChatMessage[];
  overview: Overview;
  healthScore: HealthScore;
  subscriptions: SubscriptionItem[];
  anomalies: AnomalyItem[];
  forecast: Forecast;
  loading: boolean;
  error: string | null;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  // Safety Audit extensions
  safetyIndex: { score: number; status: string; summary: string };
  moneyLeaks: any;
  salarySurvival: any;
  emergencyFund: any;
  lifestyleCreep: any;
  emiStress: any;
  upiStats: any;
  goalsProbability: any[];
  
  fetchFinanceData: () => Promise<void>;
  uploadStatement: (file: File, password?: string) => Promise<Statement>;
  deleteStatement: (id: number) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<Goal>;
  updateGoal: (id: number, goal: Partial<Goal>) => Promise<Goal>;
  deleteGoal: (id: number) => Promise<void>;
  updateTransaction: (id: number, tx: Partial<Transaction>) => Promise<Transaction>;
  deleteTransaction: (id: number) => Promise<void>;
  sendChatMessage: (msg: string, useVoice?: boolean, educationLevel?: string) => Promise<string>;
  clearChat: () => Promise<void>;
  optimizeBudget: () => Promise<BudgetOptimizationResponse>;
  getDiagnosis: () => Promise<DiagnosisResponse>;
  importBackupData: (jsonString: string) => Promise<void>;
  exportBackupData: () => Promise<string>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const API_BASE = 'http://127.0.0.1:8000/api';

export const FinanceProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [statements, setStatements] = useState<Statement[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  
  const [overview, setOverview] = useState<Overview>({
    total_income: 0,
    total_expenses: 0,
    total_savings: 0,
    savings_rate: 0,
    cash_flow: 0
  });
  const [healthScore, setHealthScore] = useState<HealthScore>({
    score: 70,
    status: 'Good',
    breakdown: [],
    recommendation: ''
  });
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyItem[]>([]);
  const [forecast, setForecast] = useState<Forecast>({
    next_month_estimated_expenses: 0,
    trend: 'stable',
    confidence: 0.5,
    insights: []
  });
  
  // Advanced Safety States
  const [safetyIndex, setSafetyIndex] = useState<{ score: number; status: string; summary: string }>({
    score: 75,
    status: 'Stable',
    summary: 'Calculations initializing...'
  });
  const [moneyLeaks, setMoneyLeaks] = useState<any>(null);
  const [salarySurvival, setSalarySurvival] = useState<any>(null);
  const [emergencyFund, setEmergencyFund] = useState<any>(null);
  const [lifestyleCreep, setLifestyleCreep] = useState<any>(null);
  const [emiStress, setEmiStress] = useState<any>(null);
  const [upiStats, setUpiStats] = useState<any>(null);
  const [goalsProbability, setGoalsProbability] = useState<any[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const dateParams = useMemo(() => {
    if (selectedMonth === 'All') return { start_date: undefined, end_date: undefined };
    const [year, month] = selectedMonth.split('-');
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    return {
      start_date: `${year}-${month}-01`,
      end_date: `${year}-${month}-${String(daysInMonth).padStart(2, '0')}`
    };
  }, [selectedMonth]);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch from Client-side IndexedDB
      const allTxs = await StorageService.getAll<Transaction>('transactions');
      const allStmts = await StorageService.getAll<Statement>('statements');
      const allGoals = await StorageService.getAll<Goal>('goals');
      const chatLogs = await StorageService.getAll<ChatMessage>('chat_history');

      setTransactions(allTxs);
      setStatements(allStmts);
      setGoals(allGoals);
      setChatHistory(chatLogs);

      // 2. Perform Local Offline Calculation for immediate visual rendering
      const filteredTxs = allTxs.filter(t => {
        if (selectedMonth === 'All') return true;
        const [year, month] = selectedMonth.split('-');
        return t.date.startsWith(`${year}-${month}`);
      });

      const totalIncome = filteredTxs.filter(t => t.type === 'credit').reduce((acc, t) => acc + t.amount, 0);
      const totalExpenses = filteredTxs.filter(t => t.type === 'debit').reduce((acc, t) => acc + t.amount, 0);
      const totalSavings = totalIncome - totalExpenses;
      const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;

      setOverview({
        total_income: totalIncome,
        total_expenses: totalExpenses,
        total_savings: totalSavings,
        savings_rate: parseFloat(savingsRate.toFixed(2)),
        cash_flow: totalIncome - totalExpenses
      });

      // Wave 1 Complete: Unblock UI
      setLoading(false);

      // 3. Make POST calls to Stateless Backend for advanced AI & financial calculation
      const payload = {
        transactions: allTxs,
        goals: allGoals,
        start_date: dateParams.start_date,
        end_date: dateParams.end_date
      };

      // Wave 2: Fetch metadata & background page items asynchronously
      Promise.all([
        fetch(`${API_BASE}/insights/health-score`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(res => res.ok ? res.json() : null),
        fetch(`${API_BASE}/insights/anomalies`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(res => res.ok ? res.json() : null),
        fetch(`${API_BASE}/insights/forecast`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(res => res.ok ? res.json() : null),
        fetch(`${API_BASE}/insights/goals-probability`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(res => res.ok ? res.json() : null)
      ]).then(([health, anomaliesData, forecastData, goalsProb]) => {
        if (health) setHealthScore(health);
        if (anomaliesData) setAnomalies(anomaliesData);
        if (forecastData) setForecast(forecastData);
        if (goalsProb) setGoalsProbability(goalsProb);
      }).catch(err => console.error("Error fetching wave 2 insights:", err));

      // Wave 3: Fetch safety audit items
      Promise.all([
        fetch(`${API_BASE}/insights/safety-index`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(res => res.ok ? res.json() : null),
        fetch(`${API_BASE}/insights/leaks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(res => res.ok ? res.json() : null),
        fetch(`${API_BASE}/insights/survival`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(res => res.ok ? res.json() : null),
        fetch(`${API_BASE}/insights/emergency`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(res => res.ok ? res.json() : null),
        fetch(`${API_BASE}/insights/creep`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(res => res.ok ? res.json() : null),
        fetch(`${API_BASE}/insights/debt-stress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(res => res.ok ? res.json() : null),
        fetch(`${API_BASE}/insights/upi-stats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(res => res.ok ? res.json() : null)
      ]).then(([safety, leaks, survival, emergency, creep, debt, upi]) => {
        if (safety) setSafetyIndex(safety);
        if (leaks) setMoneyLeaks(leaks);
        if (survival) setSalarySurvival(survival);
        if (emergency) setEmergencyFund(emergency);
        if (creep) setLifestyleCreep(creep);
        if (debt) setEmiStress(debt);
        if (upi) setUpiStats(upi);
      }).catch(err => console.error("Error fetching wave 3 safety audit:", err));

    } catch (e: any) {
      console.error("Failed to load records from IndexedDB:", e);
      setError("Unable to initialize local database storage.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, [selectedMonth]); // eslint-disable-line react-hooks/exhaustive-deps

  const uploadStatement = async (file: File, password?: string): Promise<Statement> => {
    const formData = new FormData();
    formData.append('file', file);
    if (password) {
      formData.append('password', password);
    }

    const res = await fetch(`${API_BASE}/statement/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      if (res.status === 401) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "PASSWORD_REQUIRED");
      }
      throw new Error(await res.text() || "Failed to upload and analyze statement");
    }

    const data: Statement = await res.json();
    
    // Save to IndexedDB
    const { transactions: extractedTxs, ...statementMeta } = data;
    const addedStatement = await StorageService.add<DBStatement>('statements', statementMeta);
    
    if (extractedTxs && extractedTxs.length > 0) {
      const txsToSave = extractedTxs.map(tx => ({
        ...tx,
        statement_id: addedStatement.id
      }));
      await StorageService.bulkAdd<DBTransaction>('transactions', txsToSave);
    }

    await fetchFinanceData(); // Refresh local overview & trigger backend analysis
    return data;
  };

  const deleteStatement = async (id: number) => {
    await StorageService.delete('statements', id);
    // Delete all transactions linked to this statement ID
    await StorageService.deleteByFilter('transactions', (tx) => tx.statement_id === id);
    await fetchFinanceData();
  };

  const addGoal = async (goal: Omit<Goal, 'id'>): Promise<Goal> => {
    const result = await StorageService.add<DBGoal>('goals', goal);
    const goalAdded: Goal = { ...result, id: result.id! };
    await fetchFinanceData();
    return goalAdded;
  };

  const updateGoal = async (id: number, goal: Partial<Goal>): Promise<Goal> => {
    const result = await StorageService.update<DBGoal>('goals', id, goal);
    const goalUpdated: Goal = { ...result, id };
    await fetchFinanceData();
    return goalUpdated;
  };

  const deleteGoal = async (id: number) => {
    await StorageService.delete('goals', id);
    await fetchFinanceData();
  };

  const updateTransaction = async (id: number, tx: Partial<Transaction>): Promise<Transaction> => {
    const result = await StorageService.update<DBTransaction>('transactions', id, tx);
    const txUpdated: Transaction = { ...result, id };
    await fetchFinanceData();
    return txUpdated;
  };

  const deleteTransaction = async (id: number) => {
    await StorageService.delete('transactions', id);
    await fetchFinanceData();
  };

  const sendChatMessage = async (msg: string, useVoice: boolean = false, educationLevel: string = "intermediate"): Promise<string> => {
    const userMsg: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      message: msg,
      timestamp: new Date().toISOString()
    };
    
    // Add user message to IndexedDB and update state
    await StorageService.add<DBChatMessage>('chat_history', userMsg);
    setChatHistory(prev => [...prev, userMsg]);

    const chatLogs = await StorageService.getAll<ChatMessage>('chat_history');

    const chatPayload = {
      message: msg,
      use_voice: useVoice,
      education_level: educationLevel,
      history: chatLogs,
      transactions: transactions,
      goals: goals
    };

    const res = await fetch(`${API_BASE}/chat/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chatPayload)
    });

    if (!res.ok) throw new Error("Failed to get response from assistant");
    const data = await res.json();
    
    const aiMsg: ChatMessage = {
      id: Date.now() + 1,
      sender: 'ai',
      message: data.reply,
      timestamp: new Date().toISOString()
    };

    // Save AI reply to IndexedDB and update state
    await StorageService.add<DBChatMessage>('chat_history', aiMsg);
    setChatHistory(prev => [...prev, aiMsg]);

    return data.reply;
  };

  const clearChat = async () => {
    await StorageService.clear('chat_history');
    setChatHistory([]);
  };

  const optimizeBudget = async (): Promise<BudgetOptimizationResponse> => {
    const payload = {
      transactions: transactions,
      goals: goals,
      start_date: dateParams.start_date,
      end_date: dateParams.end_date
    };
    const res = await fetch(`${API_BASE}/insights/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to generate AI budget optimization plan");
    return await res.json();
  };

  const getDiagnosis = async (): Promise<DiagnosisResponse> => {
    const payload = {
      transactions: transactions,
      goals: goals,
      start_date: dateParams.start_date,
      end_date: dateParams.end_date
    };
    const res = await fetch(`${API_BASE}/insights/diagnosis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to generate financial audit diagnosis");
    return await res.json();
  };

  const importBackupData = async (jsonString: string) => {
    await StorageService.importBackup(jsonString);
    await fetchFinanceData();
  };

  const exportBackupData = async () => {
    return await StorageService.exportBackup();
  };

  return (
    <FinanceContext.Provider value={{
      transactions,
      statements,
      goals,
      chatHistory,
      overview,
      healthScore,
      subscriptions,
      anomalies,
      forecast,
      loading,
      error,
      selectedMonth,
      setSelectedMonth,
      // Safety Extensions
      safetyIndex,
      moneyLeaks,
      salarySurvival,
      emergencyFund,
      lifestyleCreep,
      emiStress,
      upiStats,
      goalsProbability,
      
      fetchFinanceData,
      uploadStatement,
      deleteStatement,
      addGoal,
      updateGoal,
      deleteGoal,
      updateTransaction,
      deleteTransaction,
      sendChatMessage,
      clearChat,
      optimizeBudget,
      getDiagnosis,
      importBackupData,
      exportBackupData
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
