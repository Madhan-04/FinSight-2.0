from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Transaction Schemas ---
class TransactionBase(BaseModel):
    date: str
    raw_description: str
    merchant: str
    amount: float
    type: str  # 'debit' or 'credit'
    category: str
    payment_method: str
    is_recurring: bool = False

class TransactionCreate(TransactionBase):
    statement_id: Optional[int] = None

class TransactionUpdate(BaseModel):
    date: Optional[str] = None
    raw_description: Optional[str] = None
    merchant: Optional[str] = None
    amount: Optional[float] = None
    type: Optional[str] = None
    category: Optional[str] = None
    payment_method: Optional[str] = None
    is_recurring: Optional[bool] = None

class Transaction(TransactionBase):
    id: int
    statement_id: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Statement Schemas ---
class StatementBase(BaseModel):
    filename: str
    bank_name: Optional[str] = None
    period: Optional[str] = None
    total_transactions: int = 0
    total_debits: float = 0.0
    total_credits: float = 0.0

class StatementCreate(StatementBase):
    pass

class Statement(StatementBase):
    id: int
    uploaded_at: Optional[datetime] = None
    transactions: List[Transaction] = []

    class Config:
        from_attributes = True

# --- Goal Schemas ---
class GoalBase(BaseModel):
    name: str
    target_amount: float
    current_amount: float = 0.0
    target_date: str
    category: str

class GoalCreate(GoalBase):
    pass

class GoalUpdate(BaseModel):
    name: Optional[str] = None
    target_amount: Optional[float] = None
    current_amount: Optional[float] = None
    target_date: Optional[str] = None
    category: Optional[str] = None

class Goal(GoalBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Chat Schemas ---
class ChatMessageBase(BaseModel):
    sender: str  # 'user' or 'ai'
    message: str

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessage(ChatMessageBase):
    id: int
    timestamp: Optional[datetime] = None

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    message: str
    use_voice: bool = False
    education_level: Optional[str] = "intermediate"
    history: List[ChatMessage] = []
    transactions: List[Transaction] = []
    goals: List[Goal] = []

class ChatResponse(BaseModel):
    reply: str
    audio_data: Optional[str] = None  # Base64 TTS audio if requested

class AnalysisRequest(BaseModel):
    transactions: List[Transaction] = []
    goals: List[Goal] = []
    start_date: Optional[str] = None
    end_date: Optional[str] = None


# --- Analytics & Dashboard Schemas ---
class OverviewResponse(BaseModel):
    total_income: float
    total_expenses: float
    total_savings: float
    savings_rate: float
    cash_flow: float

class HealthScoreResponse(BaseModel):
    score: int
    status: str  # 'Excellent', 'Good', 'Fair', 'Poor'
    breakdown: List[str]
    recommendation: str

class SubscriptionItem(BaseModel):
    merchant: str
    category: str
    amount: float
    frequency: str
    next_expected_date: str

class AnomalyItem(BaseModel):
    transaction_id: int
    date: str
    merchant: str
    amount: float
    reason: str
    type: str  # 'spike', 'duplicate', 'unusual'

class ForecastResponse(BaseModel):
    next_month_estimated_expenses: float
    trend: str  # 'increasing', 'decreasing', 'stable'
    confidence: float
    insights: List[str]

class BudgetOptimizationItem(BaseModel):
    category: str
    current_spend: float
    suggested_limit: float
    savings_potential: float
    rationale: str

class BudgetOptimizationResponse(BaseModel):
    suggested_budgets: List[BudgetOptimizationItem]
    estimated_monthly_savings: float
    summary: str

class DiagnosisResponse(BaseModel):
    executive_summary: str
    overall_status: str  # 'Healthy', 'Action Required', 'Critical Review'
    critical_issues: List[str]
    quick_wins: List[str]

# --- Advanced Safety & Intelligence Schemas ---
class MoneyLeakItem(BaseModel):
    type: str
    merchant: str
    amount: float
    description: str
    alert_text: str

class MoneyLeaksResponse(BaseModel):
    leaks: List[MoneyLeakItem]
    monthly_leakage: float
    recovered_savings: float
    subscription_breakdown: Dict[str, float]
    recurring_dashboard: List[Dict[str, Any]]

class SalarySurvivalResponse(BaseModel):
    current_balance: float
    monthly_burn_rate: float
    average_daily_spending: float
    remaining_days: int
    predicted_month_end_balance: float
    survival_probability: int
    risk_level: str
    suggestions: List[str]

class EmergencyFundResponse(BaseModel):
    monthly_essential_expenses: float
    recommended_emergency_fund: float
    current_emergency_savings: float
    preparedness_ratio: float
    resilience_score: int
    risk_level: str
    improvement_plans: List[str]

class LifestyleCreepResponse(BaseModel):
    income_growth: float
    expense_growth: float
    savings_growth: float
    creep_detected: bool
    risk_level: str
    recommendations: List[str]

class EMIStressResponse(BaseModel):
    total_emi_payments: float
    debt_burden: float
    stress_score: int
    stress_level: str
    suggestions: List[str]

class UPIDependencyResponse(BaseModel):
    upi_transaction_count: int
    upi_spend_share: float
    average_daily_transactions: float
    impulse_spend_count: int
    impulse_spend_amount: float
    impulse_risk: str
    upi_dependency_score: int
    suggestions: List[str]

class GoalProbabilityItem(BaseModel):
    goal_id: int
    probability: int
    expected_months: float
    required_monthly_savings: float
    suggestions: str

class MasterSafetyResponse(BaseModel):
    score: int
    status: str
    summary: str


