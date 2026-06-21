from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app import database, crud, schemas
from app.services.analyzer import FinancialAnalyzer
from app.services.nvidia_service import NvidiaService

router = APIRouter(prefix="/insights", tags=["Financial Insights"])

@router.get("/overview", response_model=schemas.OverviewResponse)
def get_overview(start_date: Optional[str] = None, end_date: Optional[str] = None, db: Session = Depends(database.get_db)):
    txs = crud.get_transactions(db, limit=1000, start_date=start_date, end_date=end_date)
    
    total_income = sum(t.amount for t in txs if t.type == "credit")
    total_expenses = sum(t.amount for t in txs if t.type == "debit")
    total_savings = total_income - total_expenses
    
    savings_rate = (total_savings / total_income * 100) if total_income > 0 else 0.0
    cash_flow = total_income - total_expenses

    return schemas.OverviewResponse(
        total_income=total_income,
        total_expenses=total_expenses,
        total_savings=total_savings,
        savings_rate=round(savings_rate, 2),
        cash_flow=cash_flow
    )

@router.get("/health-score", response_model=schemas.HealthScoreResponse)
def get_health_score(start_date: Optional[str] = None, end_date: Optional[str] = None, db: Session = Depends(database.get_db)):
    txs = crud.get_transactions(db, limit=1000, start_date=start_date, end_date=end_date)
    goals = crud.get_goals(db)
    result = FinancialAnalyzer.calculate_health_score(txs, goals)
    return schemas.HealthScoreResponse(**result)

@router.get("/subscriptions", response_model=List[schemas.SubscriptionItem])
def get_subscriptions(start_date: Optional[str] = None, end_date: Optional[str] = None, db: Session = Depends(database.get_db)):
    txs = crud.get_transactions(db, limit=1000, start_date=start_date, end_date=end_date)
    return FinancialAnalyzer.detect_subscriptions(txs)

@router.get("/anomalies", response_model=List[schemas.AnomalyItem])
def get_anomalies(start_date: Optional[str] = None, end_date: Optional[str] = None, db: Session = Depends(database.get_db)):
    txs = crud.get_transactions(db, limit=1000, start_date=start_date, end_date=end_date)
    return FinancialAnalyzer.detect_anomalies(txs)

@router.get("/forecast", response_model=schemas.ForecastResponse)
def get_forecast(start_date: Optional[str] = None, end_date: Optional[str] = None, db: Session = Depends(database.get_db)):
    txs = crud.get_transactions(db, limit=1000, start_date=start_date, end_date=end_date)
    result = FinancialAnalyzer.forecast_expenses(txs)
    return schemas.ForecastResponse(**result)

@router.get("/optimize", response_model=schemas.BudgetOptimizationResponse)
def get_budget_optimization(start_date: Optional[str] = None, end_date: Optional[str] = None, db: Session = Depends(database.get_db)):
    txs = crud.get_transactions(db, limit=1000, start_date=start_date, end_date=end_date)
    
    cats: Dict[str, float] = {}
    for t in txs:
        if t.type == 'debit':
            cats[t.category] = cats.get(t.category, 0.0) + t.amount
            
    txs_summary = [{"category": k, "current_spend": v} for k, v in cats.items()]
    
    current_limits = [
      {"category": 'Food & Dining', "limit": 12000.0},
      {"category": 'Shopping & Entertainment', "limit": 15000.0},
      {"category": 'Bills & Subscriptions', "limit": 30000.0},
      {"category": 'Travel & Transport', "limit": 5000.0},
      {"category": 'Health & Personal Care', "limit": 3000.0},
      {"category": 'Other Expenses', "limit": 10000.0},
    ]
    
    result = NvidiaService.generate_budget_optimization(txs_summary, current_limits)
    return schemas.BudgetOptimizationResponse(**result)

@router.get("/diagnosis", response_model=schemas.DiagnosisResponse)
def get_diagnosis(start_date: Optional[str] = None, end_date: Optional[str] = None, db: Session = Depends(database.get_db)):
    txs = crud.get_transactions(db, limit=1000, start_date=start_date, end_date=end_date)
    goals = crud.get_goals(db)
    
    overview = {
        "total_income": sum(t.amount for t in txs if t.type == "credit"),
        "total_expenses": sum(t.amount for t in txs if t.type == "debit"),
        "total_savings": sum(t.amount for t in txs if t.type == "credit") - sum(t.amount for t in txs if t.type == "debit")
    }
    
    health_score = FinancialAnalyzer.calculate_health_score(txs, goals)
    subscriptions = FinancialAnalyzer.detect_subscriptions(txs)
    anomalies = FinancialAnalyzer.detect_anomalies(txs)
    
    context = {
        "overview": overview,
        "health_score": health_score,
        "subscriptions": subscriptions,
        "anomalies": anomalies,
        "goals": [{"name": g.name, "target": g.target_amount, "current": g.current_amount} for g in goals]
    }
    
    result = NvidiaService.generate_diagnosis(context)
    return schemas.DiagnosisResponse(**result)


# --- New Safety Audit Route Endpoints ---

@router.get("/leaks", response_model=schemas.MoneyLeaksResponse)
def get_money_leaks(start_date: Optional[str] = None, end_date: Optional[str] = None, db: Session = Depends(database.get_db)):
    txs = crud.get_transactions(db, limit=1000, start_date=start_date, end_date=end_date)
    result = FinancialAnalyzer.detect_money_leaks(txs)
    return schemas.MoneyLeaksResponse(**result)

@router.get("/survival", response_model=schemas.SalarySurvivalResponse)
def get_salary_survival(start_date: Optional[str] = None, end_date: Optional[str] = None, db: Session = Depends(database.get_db)):
    txs = crud.get_transactions(db, limit=1000, start_date=start_date, end_date=end_date)
    result = FinancialAnalyzer.predict_salary_survival(txs)
    
    suggestions = NvidiaService.generate_survival_suggestions(
        current_balance=result['current_balance'],
        burn_rate=result['monthly_burn_rate'],
        daily_spending=result['average_daily_spending'],
        remaining_days=result['remaining_days'],
        prob=result['survival_probability'],
        risk=result['risk_level']
    )
    result['suggestions'] = suggestions
    return schemas.SalarySurvivalResponse(**result)

@router.get("/emergency", response_model=schemas.EmergencyFundResponse)
def get_emergency_fund(start_date: Optional[str] = None, end_date: Optional[str] = None, db: Session = Depends(database.get_db)):
    txs = crud.get_transactions(db, limit=1000, start_date=start_date, end_date=end_date)
    goals = crud.get_goals(db)
    result = FinancialAnalyzer.scan_emergency_fund(txs, goals)
    
    plans = NvidiaService.generate_emergency_plan(
        monthly_essentials=result['monthly_essential_expenses'],
        recommended_fund=result['recommended_emergency_fund'],
        current_fund=result['current_emergency_savings'],
        ratio=result['preparedness_ratio'],
        risk=result['risk_level']
    )
    result['improvement_plans'] = plans
    return schemas.EmergencyFundResponse(**result)

@router.get("/creep", response_model=schemas.LifestyleCreepResponse)
def get_lifestyle_creep(start_date: Optional[str] = None, end_date: Optional[str] = None, db: Session = Depends(database.get_db)):
    txs = crud.get_transactions(db, limit=1000, start_date=start_date, end_date=end_date)
    result = FinancialAnalyzer.detect_lifestyle_creep(txs)
    
    recs = NvidiaService.generate_lifestyle_advice(
        income_growth=result['income_growth'],
        expense_growth=result['expense_growth'],
        savings_growth=result['savings_growth'],
        creep=result['creep_detected'],
        risk=result['risk_level']
    )
    result['recommendations'] = recs
    return schemas.LifestyleCreepResponse(**result)

@router.get("/debt-stress", response_model=schemas.EMIStressResponse)
def get_emi_stress(start_date: Optional[str] = None, end_date: Optional[str] = None, db: Session = Depends(database.get_db)):
    txs = crud.get_transactions(db, limit=1000, start_date=start_date, end_date=end_date)
    result = FinancialAnalyzer.analyze_emi_stress(txs)
    
    debt_plan = NvidiaService.generate_debt_plan(
        total_emi=result['total_emi_payments'],
        debt_burden=result['debt_burden'],
        stress_score=result['stress_score'],
        stress_level=result['stress_level']
    )
    result['suggestions'] = debt_plan
    return schemas.EMIStressResponse(**result)

@router.get("/upi-stats", response_model=schemas.UPIDependencyResponse)
def get_upi_stats(start_date: Optional[str] = None, end_date: Optional[str] = None, db: Session = Depends(database.get_db)):
    txs = crud.get_transactions(db, limit=1000, start_date=start_date, end_date=end_date)
    result = FinancialAnalyzer.analyze_upi_dependency(txs)
    
    coaching = NvidiaService.generate_upi_advice(
        upi_count=result['upi_transaction_count'],
        spend_share=result['upi_spend_share'],
        daily_avg=result['average_daily_transactions'],
        impulse_count=result['impulse_spend_count'],
        impulse_amt=result['impulse_spend_amount'],
        risk=result['impulse_risk']
    )
    result['suggestions'] = coaching
    return schemas.UPIDependencyResponse(**result)

@router.get("/goals-probability", response_model=List[schemas.GoalProbabilityItem])
def get_goals_probability(start_date: Optional[str] = None, end_date: Optional[str] = None, db: Session = Depends(database.get_db)):
    txs = crud.get_transactions(db, limit=1000, start_date=start_date, end_date=end_date)
    goals = crud.get_goals(db)
    return FinancialAnalyzer.calculate_goal_probabilities(txs, goals)

@router.get("/safety-index", response_model=schemas.MasterSafetyResponse)
def get_safety_index(start_date: Optional[str] = None, end_date: Optional[str] = None, db: Session = Depends(database.get_db)):
    txs = crud.get_transactions(db, limit=1000, start_date=start_date, end_date=end_date)
    goals = crud.get_goals(db)
    result = FinancialAnalyzer.calculate_master_safety_score(txs, goals)
    return schemas.MasterSafetyResponse(**result)


