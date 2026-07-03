"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { StorageService, DBTransaction, DBStatement, DBGoal, DBChatMessage } from '../services/storage';
import { FinancialAnalyzer, Transaction, Goal } from '../services/analyzer';
import { MockAiService } from '../services/mockAi';

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

  // Client-side local parsing file logic (OCR scanner simulation / CSV Reader)
  const uploadStatement = async (file: File, password?: string): Promise<Statement> => {
    // Simulate parsing lag for premium WOW UX
    await new Promise(resolve => setTimeout(resolve, 3000));

    let filename = file.name;
    let bank_name = 'ICICI Bank';
    let period = '01-06-2026 to 30-06-2026';
    let extractedTxs: Omit<Transaction, 'id'>[] = [];

    // Parse simple CSV if provided
    if (filename.endsWith('.csv')) {
      try {
        const text = await file.text();
        const lines = text.split('\n');
        
        lines.slice(1).forEach((line, index) => {
          if (!line.trim()) return;
          const cols = line.split(',');
          if (cols.length >= 5) {
            // Assume format: Date, Description, Amount, Type, Category
            const date = cols[0].trim();
            const desc = cols[1].trim();
            const amount = parseFloat(cols[2].trim()) || 100;
            const type = cols[3].trim().toLowerCase() === 'credit' ? 'credit' : 'debit';
            const category = cols[4]?.trim() || 'Other Expenses';
            
            extractedTxs.push({
              date,
              raw_description: desc,
              merchant: desc.split(' ')[0] || 'Merchant',
              amount,
              type: type as 'credit' | 'debit',
              category,
              payment_method: desc.includes('UPI') ? 'UPI' : 'Card',
              is_recurring: false
            });
          }
        });
      } catch (err) {
        console.error("Local CSV parsing failed, fallback to mock generation", err);
      }
    }

    // Default mock data generation if CSV is empty or it is a PDF/Image
    if (extractedTxs.length === 0) {
      bank_name = filename.toLowerCase().includes('sbi') ? 'State Bank of India' : 
                  filename.toLowerCase().includes('hdfc') ? 'HDFC Bank' : 'ICICI Bank';
      
      extractedTxs = [
        { date: '2026-06-01', raw_description: 'PAYROLL CREDIT DIRECT', merchant: 'Corporate Salary', amount: 65000, type: 'credit', category: 'Salary Credit', payment_method: 'NEFT', is_recurring: true },
        { date: '2026-06-03', raw_description: 'UPI/9988/AMAZON/GPAY', merchant: 'Amazon Shopping', amount: 1450, type: 'debit', category: 'Shopping & Entertainment', payment_method: 'UPI', is_recurring: false },
        { date: '2026-06-05', raw_description: 'UPI/7766/SWIGGY/FOOD', merchant: 'Swiggy Food', amount: 390, type: 'debit', category: 'Food & Dining', payment_method: 'UPI', is_recurring: false },
        { date: '2026-06-08', raw_description: 'CARD/NETFLIX STREAMING', merchant: 'Netflix', amount: 649, type: 'debit', category: 'Bills & Subscriptions', payment_method: 'Card', is_recurring: true },
        { date: '2026-06-10', raw_description: 'UPI/8899/RENT/GPAY', merchant: 'Flat rent', amount: 12000, type: 'debit', category: 'Rent & Living', payment_method: 'UPI', is_recurring: true },
        { date: '2026-06-15', raw_description: 'UPI/6677/SPORTSFIT/GPAY', merchant: 'SportsFit Gym', amount: 1500, type: 'debit', category: 'Bills & Subscriptions', payment_method: 'UPI', is_recurring: true },
        { date: '2026-06-20', raw_description: 'UPI/5544/GPAY/ZOMATO', merchant: 'Zomato Food', amount: 680, type: 'debit', category: 'Food & Dining', payment_method: 'UPI', is_recurring: false },
        { date: '2026-06-28', raw_description: 'UPI/3322/BLINKIT/GPAY', merchant: 'BlinkIt delivery', amount: 940, type: 'debit', category: 'Food & Dining', payment_method: 'UPI', is_recurring: false }
      ];
    }

    const total_transactions = extractedTxs.length;
    const total_debits = extractedTxs.filter(t => t.type === 'debit').reduce((acc, t) => acc + t.amount, 0);
    const total_credits = extractedTxs.filter(t => t.type === 'credit').reduce((acc, t) => acc + t.amount, 0);

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
      id: statementId * 1000 + idx,
      statement_id: statementId
    }));

    await StorageService.bulkAdd<DBTransaction>('transactions', txsToSave);
    await fetchFinanceData(); // Recalculate local stats

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
