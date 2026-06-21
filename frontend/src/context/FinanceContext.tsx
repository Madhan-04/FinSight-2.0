"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';

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
    if (selectedMonth === 'All') return '';
    const [year, month] = selectedMonth.split('-');
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    return `?start_date=${year}-${month}-01&end_date=${year}-${month}-${String(daysInMonth).padStart(2, '0')}`;
  }, [selectedMonth]);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Wave 1: Fetch core dashboard data (fast SQLite reads, < 15ms)
      const [resTxs, resOverview, resHealth, resAnomalies] = await Promise.all([
        fetch(`${API_BASE}/transactions/${dateParams}`),
        fetch(`${API_BASE}/insights/overview${dateParams}`),
        fetch(`${API_BASE}/insights/health-score${dateParams}`),
        fetch(`${API_BASE}/insights/anomalies${dateParams}`)
      ]);

      if (resTxs.ok) setTransactions(await resTxs.json());
      if (resOverview.ok) setOverview(await resOverview.json());
      if (resHealth.ok) setHealthScore(await resHealth.json());
      if (resAnomalies.ok) setAnomalies(await resAnomalies.json());

      // Wave 1 complete: Unblock the UI immediately
      setLoading(false);

      // Wave 2: Fetch metadata & background page items asynchronously
      Promise.all([
        fetch(`${API_BASE}/statement/`),
        fetch(`${API_BASE}/goals/`),
        fetch(`${API_BASE}/chat/history`),
        fetch(`${API_BASE}/insights/forecast${dateParams}`),
        fetch(`${API_BASE}/insights/goals-probability${dateParams}`)
      ]).then(async ([resStmts, resGoals, resChat, resForecast, resGoalsProb]) => {
        if (resStmts.ok) setStatements(await resStmts.json());
        if (resGoals.ok) setGoals(await resGoals.json());
        if (resChat.ok) setChatHistory(await resChat.json());
        if (resForecast.ok) setForecast(await resForecast.json());
        if (resGoalsProb.ok) setGoalsProbability(await resGoalsProb.json());
      }).catch(err => console.error("Error fetching wave 2 (metadata):", err));

      // Wave 3: Fetch slow safety audit items in the background
      Promise.all([
        fetch(`${API_BASE}/insights/safety-index${dateParams}`),
        fetch(`${API_BASE}/insights/leaks${dateParams}`),
        fetch(`${API_BASE}/insights/survival${dateParams}`),
        fetch(`${API_BASE}/insights/emergency${dateParams}`),
        fetch(`${API_BASE}/insights/creep${dateParams}`),
        fetch(`${API_BASE}/insights/debt-stress${dateParams}`),
        fetch(`${API_BASE}/insights/upi-stats${dateParams}`)
      ]).then(async ([resSafety, resLeaks, resSurvival, resEmergency, resCreep, resDebt, resUpi]) => {
        if (resSafety.ok) setSafetyIndex(await resSafety.json());
        if (resLeaks.ok) setMoneyLeaks(await resLeaks.json());
        if (resSurvival.ok) setSalarySurvival(await resSurvival.json());
        if (resEmergency.ok) setEmergencyFund(await resEmergency.json());
        if (resCreep.ok) setLifestyleCreep(await resCreep.json());
        if (resDebt.ok) setEmiStress(await resDebt.json());
        if (resUpi.ok) setUpiStats(await resUpi.json());
      }).catch(err => console.error("Error fetching wave 3 (safety audit):", err));

    } catch (e: any) {
      console.error("Failed to load financial records from backend:", e);
      setError("Unable to connect to backend server. Make sure the FastAPI backend is running.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, [selectedMonth]);

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

    const data = await res.json();
    await fetchFinanceData(); // Refresh all summaries
    return data;
  };

  const deleteStatement = async (id: number) => {
    const res = await fetch(`${API_BASE}/statement/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error("Failed to delete statement");
    await fetchFinanceData();
  };

  const addGoal = async (goal: Omit<Goal, 'id'>): Promise<Goal> => {
    const res = await fetch(`${API_BASE}/goals/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal)
    });
    if (!res.ok) throw new Error("Failed to add savings goal");
    const data = await res.json();
    await fetchFinanceData();
    return data;
  };

  const updateGoal = async (id: number, goal: Partial<Goal>): Promise<Goal> => {
    const res = await fetch(`${API_BASE}/goals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal)
    });
    if (!res.ok) throw new Error("Failed to update goal");
    const data = await res.json();
    await fetchFinanceData();
    return data;
  };

  const deleteGoal = async (id: number) => {
    const res = await fetch(`${API_BASE}/goals/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error("Failed to delete goal");
    await fetchFinanceData();
  };

  const updateTransaction = async (id: number, tx: Partial<Transaction>): Promise<Transaction> => {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx)
    });
    if (!res.ok) throw new Error("Failed to update transaction");
    const data = await res.json();
    await fetchFinanceData();
    return data;
  };

  const deleteTransaction = async (id: number) => {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error("Failed to delete transaction");
    await fetchFinanceData();
  };

  const sendChatMessage = async (msg: string, useVoice: boolean = false, educationLevel: string = "intermediate"): Promise<string> => {
    const tempUserMsg: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      message: msg,
      timestamp: new Date().toISOString()
    };
    setChatHistory(prev => [...prev, tempUserMsg]);

    const res = await fetch(`${API_BASE}/chat/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, use_voice: useVoice, education_level: educationLevel })
    });

    if (!res.ok) throw new Error("Failed to get response from assistant");
    const data = await res.json();
    
    const resChat = await fetch(`${API_BASE}/chat/history`);
    if (resChat.ok) {
      setChatHistory(await resChat.json());
    }

    return data.reply;
  };

  const clearChat = async () => {
    await fetch(`${API_BASE}/chat/history`, { method: 'DELETE' });
    setChatHistory([]);
  };

  const optimizeBudget = async (): Promise<BudgetOptimizationResponse> => {
    const res = await fetch(`${API_BASE}/insights/optimize${dateParams}`);
    if (!res.ok) throw new Error("Failed to generate AI budget optimization plan");
    return await res.json();
  };

  const getDiagnosis = async (): Promise<DiagnosisResponse> => {
    const res = await fetch(`${API_BASE}/insights/diagnosis${dateParams}`);
    if (!res.ok) throw new Error("Failed to generate financial audit diagnosis");
    return await res.json();
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
      getDiagnosis
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
