"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { StorageService, DBTransaction, DBStatement, DBGoal, DBChatMessage } from '../services/storage';
import { FinancialAnalyzer, Transaction, Goal } from '../services/analyzer';
import { MockAiService } from '../services/mockAi';
import { parseStatement } from '../services/statementParser';

export type { Transaction, Goal };

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

  // Database starts completely clean by default
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

      // 2. Perform local month filtering
      const filteredTxs = allTxs.filter(t => {
        if (selectedMonth === 'All') return true;
        const [year, month] = selectedMonth.split('-');
        return t.date.startsWith(`${year}-${month}`);
      });

      // 3. Overview calculations
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

      // 4. Client-side Real-time Analytics Calculations
      const health = FinancialAnalyzer.calculateHealthScore(filteredTxs, allGoals);
      setHealthScore(health);

      const subs = FinancialAnalyzer.detectSubscriptions(filteredTxs);
      setSubscriptions(subs);

      const anomaliesData = FinancialAnalyzer.detectAnomalies(filteredTxs);
      setAnomalies(anomaliesData);

      const forecastData = FinancialAnalyzer.forecastExpenses(allTxs);
      setForecast(forecastData as Forecast);

      const goalsProb = FinancialAnalyzer.calculateGoalProbabilities(allTxs, allGoals);
      setGoalsProbability(goalsProb);

      const safety = FinancialAnalyzer.calculateMasterSafetyScore(filteredTxs, allGoals);
      setSafetyIndex(safety);

      // Money Leaks
      const leaks = FinancialAnalyzer.detectMoneyLeaks(filteredTxs);
      setMoneyLeaks(leaks);

      // Salary Survival
      const survival = FinancialAnalyzer.predictSalarySurvival(allTxs);
      survival.suggestions = MockAiService.getSurvivalSuggestions(survival);
      setSalarySurvival(survival);

      // Emergency Fund
      const emergency = FinancialAnalyzer.scanEmergencyFund(allTxs, allGoals);
      emergency.improvement_plans = MockAiService.getEmergencyPlan(emergency);
      setEmergencyFund(emergency);

      // Lifestyle Creep
      const creep = FinancialAnalyzer.detectLifestyleCreep(allTxs);
      creep.recommendations = MockAiService.getLifestyleAdvice(creep);
      setLifestyleCreep(creep);

      // EMI Stress
      const emi = FinancialAnalyzer.analyzeEMIStress(filteredTxs);
      emi.suggestions = MockAiService.getDebtPlan(emi);
      setEmiStress(emi);

      // UPI Stats
      const upi = FinancialAnalyzer.analyzeUpiDependency(filteredTxs);
      upi.suggestions = MockAiService.getUpiAdvice(upi);
      setUpiStats(upi);

      setLoading(false);
    } catch (e: any) {
      console.error("Failed to load records from IndexedDB:", e);
      setError("Unable to initialize local database storage.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, [selectedMonth]); // eslint-disable-line react-hooks/exhaustive-deps

  // Real client-side statement parser — CSV, XLSX, PDF
  const uploadStatement = async (file: File, password?: string): Promise<Statement> => {
    // Parse the real file using the statement parser service
    const parsed = await parseStatement(file, password);

    // If parser returned a hard error (not password), throw it
    if (parsed.error && parsed.transactions.length === 0) {
      throw new Error(parsed.error);
    }

    const filename = file.name;
    const bank_name = parsed.bank_name || 'Unknown Bank';
    const period = parsed.period || 'Unknown Period';
    const extractedTxs: Omit<Transaction, 'id'>[] = parsed.transactions;

    const total_transactions = extractedTxs.length;
    const total_debits = parsed.total_debits;
    const total_credits = parsed.total_credits;

    const statementMeta: DBStatement = {
      filename,
      uploaded_at: new Date().toISOString(),
      bank_name,
      period,
      total_transactions,
      total_debits,
      total_credits
    };

    const addedStatement = await StorageService.add<DBStatement>('statements', statementMeta);
    const statementId = addedStatement.id!;

    const txsToSave = extractedTxs.map((tx, idx) => ({
      ...tx,
      statement_id: statementId
    }));

    await StorageService.bulkAdd<DBTransaction>('transactions', txsToSave);
    await fetchFinanceData();

    return {
      id: statementId,
      ...statementMeta,
      transactions: txsToSave as Transaction[]
    };
  };

  const deleteStatement = async (id: number) => {
    await StorageService.delete('statements', id);
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

  // Client-side conversational AI chatbot handler
  const sendChatMessage = async (msg: string, useVoice: boolean = false, educationLevel: string = "intermediate"): Promise<string> => {
    const userMsg: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      message: msg,
      timestamp: new Date().toISOString()
    };
    
    await StorageService.add<DBChatMessage>('chat_history', userMsg);
    setChatHistory(prev => [...prev, userMsg]);

    const chatLogs = await StorageService.getAll<ChatMessage>('chat_history');

    // Run AI chat mock generation on client
    const aiContext = {
      transactions: transactions,
      goals: goals,
      overview: overview,
      healthScore: healthScore,
      subscriptions: subscriptions,
      anomalies: anomalies
    };

    const aiReplyText = await MockAiService.generateChatResponse(msg, chatLogs, aiContext, educationLevel);

    const aiMsg: ChatMessage = {
      id: Date.now() + 1,
      sender: 'ai',
      message: aiReplyText,
      timestamp: new Date().toISOString()
    };

    await StorageService.add<DBChatMessage>('chat_history', aiMsg);
    setChatHistory(prev => [...prev, aiMsg]);

    return aiReplyText;
  };

  const clearChat = async () => {
    await StorageService.clear('chat_history');
    setChatHistory([]);
  };

  const optimizeBudget = async (): Promise<BudgetOptimizationResponse> => {
    return await MockAiService.generateBudgetOptimization(transactions);
  };

  const getDiagnosis = async (): Promise<DiagnosisResponse> => {
    const diagContext = {
      overview,
      healthScore,
      subscriptions,
      anomalies
    };
    return await MockAiService.generateDiagnosis(diagContext);
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
